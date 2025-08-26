"""
📊 Repositorio de datos usando patrón Repository
Patrón Strategy para diferentes fuentes de datos
"""

import pandas as pd
import numpy as np
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
import json

from src.utils.logger import LoggerMixin, data_logger
from src.config.settings import config


class DataSource(ABC):
    """
    🎯 Interfaz abstracta para fuentes de datos
    Patrón Strategy
    """
    
    @abstractmethod
    def load_data(self) -> pd.DataFrame:
        """Cargar datos desde la fuente"""
        pass
    
    @abstractmethod
    def save_data(self, data: pd.DataFrame, path: str) -> bool:
        """Guardar datos en la fuente"""
        pass


class CSVDataSource(DataSource):
    """
    📁 Fuente de datos para archivos CSV
    """
    
    def __init__(self, file_path: str, separator: str = ";"):
        self.file_path = Path(file_path)
        self.separator = separator
        self.logger = data_logger
    
    def load_data(self) -> pd.DataFrame:
        """Cargar datos desde CSV"""
        try:
            self.logger.info(f"Cargando datos desde: {self.file_path}")
            
            # Intentar carga estándar primero
            try:
                df = pd.read_csv(self.file_path, sep=self.separator)
                self.logger.info(f"✅ Datos cargados exitosamente: {df.shape}")
                return df
            except Exception as e:
                self.logger.warning(f"Fallo en carga estándar: {e}")
                return self._load_robust_csv()
                
        except Exception as e:
            self.logger.error(f"❌ Error al cargar datos: {e}")
            raise
    
    def _load_robust_csv(self) -> pd.DataFrame:
        """Carga robusta de CSV con formato especial"""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # Procesar líneas manualmente
            data = []
            current_record = {"title": "", "abstract": "", "group": ""}
            
            for line in lines[1:]:  # Saltar header
                line = line.strip()
                if not line:
                    continue
                
                if line.startswith('>'):
                    # Nueva entrada
                    if current_record["title"]:
                        data.append(current_record.copy())
                    current_record = {"title": "", "abstract": "", "group": ""}
                    current_record["title"] = line[1:].strip()
                elif line.startswith(';'):
                    # Continuación de abstract o group
                    if not current_record["abstract"]:
                        current_record["abstract"] = line[1:].strip()
                    else:
                        current_record["group"] = line[1:].strip()
                else:
                    # Línea normal
                    if not current_record["abstract"]:
                        current_record["abstract"] = line
                    else:
                        current_record["group"] = line
            
            # Agregar último registro
            if current_record["title"]:
                data.append(current_record)
            
            df = pd.DataFrame(data)
            self.logger.info(f"✅ Datos cargados con parser robusto: {df.shape}")
            return df
            
        except Exception as e:
            self.logger.error(f"❌ Error en parser robusto: {e}")
            raise
    
    def save_data(self, data: pd.DataFrame, path: str) -> bool:
        """Guardar datos como CSV"""
        try:
            output_path = Path(path)
            data.to_csv(output_path, sep=self.separator, index=False)
            self.logger.info(f"✅ Datos guardados en: {output_path}")
            return True
        except Exception as e:
            self.logger.error(f"❌ Error al guardar: {e}")
            return False


class DataRepository(LoggerMixin):
    """
    🗄️ Repositorio principal de datos
    Patrón Repository con inyección de dependencias
    """
    
    def __init__(self, data_source: DataSource):
        super().__init__()
        self.data_source = data_source
        self._cache: Optional[pd.DataFrame] = None
    
    def load_data(self, use_cache: bool = True) -> pd.DataFrame:
        """Cargar datos con opción de cache"""
        if use_cache and self._cache is not None:
            self.log_info("📋 Usando datos en cache")
            return self._cache
        
        self.log_info("📥 Cargando datos desde fuente")
        self._cache = self.data_source.load_data()
        return self._cache
    
    def save_data(self, data: pd.DataFrame, path: str) -> bool:
        """Guardar datos"""
        return self.data_source.save_data(data, path)
    
    def get_data_info(self) -> Dict[str, Any]:
        """Obtener información básica de los datos"""
        df = self.load_data()
        
        info = {
            "shape": df.shape,
            "columns": list(df.columns),
            "dtypes": df.dtypes.to_dict(),
            "missing_values": df.isnull().sum().to_dict(),
            "memory_usage": df.memory_usage(deep=True).sum()
        }
        
        return info
    
    def clear_cache(self):
        """Limpiar cache"""
        self._cache = None
        self.log_info("🗑️ Cache limpiado")


class DataService:
    """
    🔧 Servicio de datos con lógica de negocio
    Patrón Service Layer
    """
    
    def __init__(self, repository: DataRepository):
        self.repository = repository
        self.logger = data_logger
    
    def analyze_dataset(self) -> Dict[str, Any]:
        """Análisis completo del dataset"""
        try:
            df = self.repository.load_data()
            
            analysis = {
                "basic_info": self._get_basic_info(df),
                "label_analysis": self._analyze_labels(df),
                "domain_distribution": self._analyze_domains(df),
                "text_statistics": self._analyze_text(df),
                "data_quality": self._check_data_quality(df)
            }
            
            self.logger.info("✅ Análisis del dataset completado")
            return analysis
            
        except Exception as e:
            self.logger.error(f"❌ Error en análisis: {e}")
            raise
    
    def _get_basic_info(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Información básica del dataset"""
        return {
            "total_records": len(df),
            "columns": list(df.columns),
            "sample_records": df.head(3).to_dict('records')
        }
    
    def _analyze_labels(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Análisis de etiquetas"""
        unique_groups = df['group'].unique()
        multi_label = df['group'].str.contains('\\|').sum()
        single_label = len(df) - multi_label
        
        return {
            "unique_labels": len(unique_groups),
            "single_label_count": single_label,
            "multi_label_count": multi_label,
            "single_label_percentage": (single_label / len(df)) * 100,
            "multi_label_percentage": (multi_label / len(df)) * 100,
            "label_examples": unique_groups[:10].tolist()
        }
    
    def _analyze_domains(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Análisis por dominio médico"""
        domains = ['Cardiovascular', 'Neurological', 'Hepatorenal', 'Oncological']
        domain_counts = {}
        
        for domain in domains:
            count = df['group'].str.contains(domain, case=False, na=False).sum()
            domain_counts[domain] = {
                "count": count,
                "percentage": (count / len(df)) * 100
            }
        
        return domain_counts
    
    def _analyze_text(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Análisis estadístico del texto"""
        df['title_length'] = df['title'].str.len()
        df['abstract_length'] = df['abstract'].str.len()
        
        return {
            "title_stats": df['title_length'].describe().to_dict(),
            "abstract_stats": df['abstract_length'].describe().to_dict(),
            "avg_title_length": df['title_length'].mean(),
            "avg_abstract_length": df['abstract_length'].mean()
        }
    
    def _check_data_quality(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Verificación de calidad de datos"""
        return {
            "missing_values": df.isnull().sum().to_dict(),
            "duplicates": df.duplicated().sum(),
            "empty_strings": {
                "title": (df['title'] == '').sum(),
                "abstract": (df['abstract'] == '').sum(),
                "group": (df['group'] == '').sum()
            }
        }
    
    def export_for_v0(self, output_path: str = "results/v0_analysis_data.json"):
        """Exportar análisis para V0"""
        try:
            analysis = self.analyze_dataset()
            
            # Crear directorio si no existe
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(analysis, f, ensure_ascii=False, indent=2, default=str)
            
            self.logger.info(f"✅ Datos exportados para V0 en: {output_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Error al exportar para V0: {e}")
            return False
