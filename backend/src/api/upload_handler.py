"""
📤 API Handler para subida de archivos CSV y procesamiento de datasets
"""

import os
import json
import tempfile
import shutil
from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
from werkzeug.utils import secure_filename

from ..data.repository import DataRepository
from ..features.text_preprocessor import TextPreprocessingPipeline
from ..utils.logger import LoggerFactory


class UploadHandler:
    """Manejador de subida de archivos CSV"""
    
    def __init__(self):
        self.logger = LoggerFactory.create_logger(__name__)
        self.allowed_extensions = {'csv'}
        self.max_file_size = 50 * 1024 * 1024  # 50MB
        
    def allowed_file(self, filename: str) -> bool:
        """Verificar si el archivo tiene extensión permitida"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def validate_csv_structure(self, file_path: str) -> Dict[str, Any]:
        """Validar la estructura del CSV subido"""
        try:
            # Intentar detectar el separador automáticamente
            separators = [',', ';', '\t', '|']
            df = None
            detected_separator = None
            
            for sep in separators:
                try:
                    # Leer una muestra para detectar el separador
                    sample_df = pd.read_csv(file_path, sep=sep, nrows=5)
                    if len(sample_df.columns) >= 3:  # Debe tener al menos 3 columnas
                        df = pd.read_csv(file_path, sep=sep)
                        detected_separator = sep
                        break
                except Exception as e:
                    self.logger.debug(f"Separador {sep} falló: {e}")
                    continue
            
            if df is None:
                return {
                    'valid': False,
                    'error': 'No se pudo detectar el separador del CSV. Intenta con comas (,), punto y coma (;), tabulaciones o pipes (|)',
                    'separators_tried': separators
                }
            
            # Verificar columnas requeridas
            required_columns = ['title', 'abstract', 'group']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                return {
                    'valid': False,
                    'error': f'Columnas faltantes: {missing_columns}. Columnas encontradas: {list(df.columns)}',
                    'columns_found': list(df.columns),
                    'separator_detected': detected_separator
                }
            
            # Verificar que no esté vacío
            if df.empty:
                return {
                    'valid': False,
                    'error': 'El archivo CSV está vacío'
                }
            
            # Verificar tipos de datos
            title_is_object = df['title'].dtype == 'object'
            abstract_is_object = df['abstract'].dtype == 'object'
            group_is_object = df['group'].dtype == 'object'
            
            if not (title_is_object and abstract_is_object and group_is_object):
                return {
                    'valid': False,
                    'error': 'Las columnas title, abstract y group deben ser texto'
                }
            
            # Verificar valores nulos
            null_counts = df[required_columns].isnull().sum()
            has_nulls = null_counts.astype(int).sum() > 0
            
            if has_nulls:
                return {
                    'valid': False,
                    'error': f'Valores nulos encontrados: {null_counts.to_dict()}',
                    'null_details': null_counts.to_dict()
                }
            
            return {
                'valid': True,
                'total_records': len(df),
                'columns': list(df.columns),
                'separator_detected': detected_separator,
                'sample_data': df.head(3).to_dict('records')
            }
            
        except Exception as e:
            self.logger.error(f"Error validando CSV: {e}")
            return {
                'valid': False,
                'error': f'Error al validar CSV: {str(e)}'
            }
    
    def process_uploaded_dataset(self, file_path: str, use_as_default: bool = False) -> Dict[str, Any]:
        """Procesar el dataset subido"""
        try:
            # Validar estructura
            validation = self.validate_csv_structure(file_path)
            if not validation['valid']:
                return validation
            
            # Crear directorio temporal para el dataset
            temp_dir = Path(tempfile.mkdtemp())
            new_dataset_path = temp_dir / "uploaded_dataset.csv"
            
            # Copiar archivo subido
            shutil.copy2(file_path, new_dataset_path)
            
            # Si se usa como default, reemplazar el dataset actual
            if use_as_default:
                default_path = Path("data/raw/challenge_data-18-ago.csv")
                default_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(new_dataset_path, default_path)
                self.logger.info(f"Dataset subido reemplazado como default: {default_path}")
            
            # Procesar el dataset
            result = self._analyze_dataset(new_dataset_path)
            
            # Limpiar archivos temporales
            shutil.rmtree(temp_dir)
            
            return {
                'success': True,
                'message': 'Dataset procesado exitosamente',
                'validation': validation,
                'analysis': result
            }
            
        except Exception as e:
            self.logger.error(f"Error procesando dataset: {e}")
            return {
                'success': False,
                'error': f'Error procesando dataset: {str(e)}'
            }
    
    def _analyze_dataset(self, dataset_path: Path) -> Dict[str, Any]:
        """Analizar el dataset subido"""
        try:
            # Cargar datos usando CSVDataSource
            from ..data.repository import CSVDataSource
            data_source = CSVDataSource(str(dataset_path), separator=";")
            data = data_source.load_data()
            
            # Análisis básico
            basic_info = {
                'total_records': int(len(data)),
                'columns': list(data.columns),
                'memory_usage': f"{data.memory_usage(deep=True).sum() / 1024 / 1024:.2f} MB"
            }
            
            # Análisis de etiquetas
            if 'group' in data.columns:
                label_analysis = self._analyze_labels(data['group'])
            else:
                label_analysis = {'error': 'Columna group no encontrada'}
            
            # Análisis de texto
            text_stats = self._analyze_text(data)
            
            # Distribución por dominio
            domain_distribution = self._analyze_domains(data)
            
            return {
                'basic_info': basic_info,
                'label_analysis': label_analysis,
                'text_statistics': text_stats,
                'domain_distribution': domain_distribution
            }
            
        except Exception as e:
            self.logger.error(f"Error analizando dataset: {e}")
            return {'error': str(e)}
    
    def _analyze_labels(self, group_series) -> Dict[str, Any]:
        """Analizar distribución de etiquetas"""
        try:
            # Separar etiquetas múltiples
            all_labels = []
            for groups in group_series:
                if pd.notna(groups):
                    labels = [label.strip() for label in str(groups).split('|')]
                    all_labels.extend(labels)
            
            # Contar etiquetas únicas
            unique_labels = set(all_labels)
            label_counts = {label: int(all_labels.count(label)) for label in unique_labels}
            
            # Calcular porcentajes
            total = len(group_series)
            label_percentages = {label: float((count / total) * 100) for label, count in label_counts.items()}
            
            return {
                'unique_labels': int(len(unique_labels)),
                'label_counts': label_counts,
                'label_percentages': label_percentages,
                'total_records': int(total)
            }
            
        except Exception as e:
            return {'error': f'Error analizando etiquetas: {str(e)}'}
    
    def _analyze_text(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Analizar estadísticas de texto"""
        try:
            title_lengths = data['title'].str.len() if 'title' in data.columns else pd.Series([0])
            abstract_lengths = data['abstract'].str.len() if 'abstract' in data.columns else pd.Series([0])
            
            return {
                'title_stats': {
                    'mean': float(title_lengths.mean()),
                    'std': float(title_lengths.std()),
                    'min': int(title_lengths.min()),
                    'max': int(title_lengths.max())
                },
                'abstract_stats': {
                    'mean': float(abstract_lengths.mean()),
                    'std': float(abstract_lengths.std()),
                    'min': int(abstract_lengths.min()),
                    'max': int(abstract_lengths.max())
                }
            }
            
        except Exception as e:
            return {'error': f'Error analizando texto: {str(e)}'}
    
    def _analyze_domains(self, data: pd.DataFrame) -> Dict[str, Any]:
        """Analizar distribución por dominios"""
        try:
            if 'group' not in data.columns:
                return {'error': 'Columna group no encontrada'}
            
            domain_counts = {}
            total_records = len(data)
            
            for groups in data['group']:
                if pd.notna(groups):
                    labels = [label.strip() for label in str(groups).split('|')]
                    for label in labels:
                        domain_counts[label] = domain_counts.get(label, 0) + 1
            
            # Calcular porcentajes
            domain_percentages = {
                domain: float((count / total_records) * 100) 
                for domain, count in domain_counts.items()
            }
            
            return {
                'counts': {k: int(v) for k, v in domain_counts.items()},
                'percentages': domain_percentages,
                'total_domains': int(len(domain_counts))
            }
            
        except Exception as e:
            return {'error': f'Error analizando dominios: {str(e)}'}


# Instancia global
upload_handler = UploadHandler()
