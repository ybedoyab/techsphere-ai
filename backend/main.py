#!/usr/bin/env python3
"""
🏥 Challenge de Clasificación Biomédica con IA
Script principal usando arquitectura limpia y patrones de diseño
"""

import sys
import argparse
from pathlib import Path
from typing import Dict, Any

# Agregar src al path
sys.path.append(str(Path(__file__).parent / "src"))

from src.config.settings import config
from src.utils.logger import main_logger
from src.data.repository import CSVDataSource, DataRepository, DataService
from src.features.text_preprocessor import TextPreprocessingPipeline, FeatureExtractor


def main():
    """
    🚀 Función principal del pipeline
    """
    parser = argparse.ArgumentParser(
        description="🏥 Análisis del Dataset Biomédico con IA",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  python main.py                    # Análisis completo
  python main.py --export-v0        # Exportar para V0
  python main.py --preprocess       # Solo preprocesamiento
  python main.py --help             # Ver ayuda
        """
    )
    
    parser.add_argument(
        '--export-v0',
        action='store_true',
        help='Exportar análisis para visualización V0'
    )
    
    parser.add_argument(
        '--preprocess',
        action='store_true',
        help='Ejecutar solo preprocesamiento de texto'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Modo verbose con más información'
    )
    
    args = parser.parse_args()
    
    try:
        main_logger.info("🚀 INICIANDO ANÁLISIS BIOMÉDICO")
        main_logger.info("=" * 60)
        
        # Mostrar configuración
        if args.verbose:
            main_logger.info("⚙️ Configuración del proyecto:")
            config_dict = config.to_dict()
            for key, value in config_dict.items():
                main_logger.info(f"  {key}: {value}")
        
        # 1. Cargar datos
        main_logger.info("\n📥 PASO 1: CARGANDO DATOS")
        main_logger.info("-" * 40)
        
        data_source = CSVDataSource(
            file_path=config.data.raw_data_path,
            separator=config.data.csv_separator
        )
        
        repository = DataRepository(data_source)
        data_service = DataService(repository)
        
        # Información básica
        data_info = repository.get_data_info()
        main_logger.info(f"📊 Información del dataset:")
        main_logger.info(f"  • Forma: {data_info['shape']}")
        main_logger.info(f"  • Columnas: {data_info['columns']}")
        main_logger.info(f"  • Uso de memoria: {data_info['memory_usage'] / 1024 / 1024:.2f} MB")
        
        # 2. Análisis exploratorio
        main_logger.info("\n🔍 PASO 2: ANÁLISIS EXPLORATORIO")
        main_logger.info("-" * 40)
        
        analysis = data_service.analyze_dataset()
        
        # Mostrar resultados del análisis
        _display_analysis_results(analysis)
        
        # 3. Preprocesamiento de texto
        if args.preprocess or args.export_v0:
            main_logger.info("\n🔄 PASO 3: PREPROCESAMIENTO DE TEXTO")
            main_logger.info("-" * 40)
            
            # Cargar datos
            df = repository.load_data()
            
            # Preprocesar texto
            text_pipeline = TextPreprocessingPipeline()
            processed_df = text_pipeline.preprocess_dataframe(
                df, 
                text_columns=['title', 'abstract']
            )
            
            main_logger.info("✅ Preprocesamiento de texto completado")
            
            # Guardar datos preprocesados
            processed_path = config.data.processed_data_path + "processed_data.csv"
            repository.save_data(processed_df, processed_path)
            
            # 4. Extracción de características
            main_logger.info("\n🔍 PASO 4: EXTRACCIÓN DE CARACTERÍSTICAS")
            main_logger.info("-" * 40)
            
            feature_extractor = FeatureExtractor()
            
            # Combinar título y abstract procesados
            combined_texts = (
                processed_df['title_processed'] + ' ' + 
                processed_df['abstract_processed']
            ).fillna('')
            
            # Extraer características TF-IDF
            text_features = feature_extractor.extract_text_features(
                combined_texts.tolist(),
                max_features=config.text.max_features
            )
            
            # Extraer metadatos
            metadata_features = feature_extractor.extract_metadata_features(processed_df)
            
            # Codificar etiquetas
            encoded_labels = feature_extractor.encode_labels(processed_df['group'].tolist())
            
            main_logger.info("✅ Extracción de características completada")
            main_logger.info(f"  • Características TF-IDF: {text_features.shape}")
            main_logger.info(f"  • Metadatos: {metadata_features.shape}")
            main_logger.info(f"  • Etiquetas codificadas: {encoded_labels.shape}")
            
            # Guardar características
            import numpy as np
            features_path = config.data.processed_data_path + "features.npz"
            np.savez_compressed(
                features_path,
                text_features=text_features,
                metadata_features=metadata_features,
                labels=encoded_labels
            )
            
            main_logger.info(f"💾 Características guardadas en: {features_path}")
        
        # 5. Exportar para V0
        if args.export_v0:
            main_logger.info("\n🎯 PASO 5: EXPORTANDO PARA V0")
            main_logger.info("-" * 40)
            
            success = data_service.export_for_v0()
            
            if success:
                main_logger.info("✅ Datos exportados exitosamente para V0")
                main_logger.info("🎨 Archivo listo para visualizaciones avanzadas")
            else:
                main_logger.error("❌ Error al exportar para V0")
        
        # Resumen final
        main_logger.info("\n🎉 ANÁLISIS COMPLETADO EXITOSAMENTE")
        main_logger.info("=" * 60)
        main_logger.info("📁 Archivos generados:")
        main_logger.info(f"  • Datos preprocesados: {config.data.processed_data_path}")
        main_logger.info(f"  • Características: {config.data.processed_data_path}features.npz")
        main_logger.info(f"  • Análisis V0: results/v0_analysis_data.json")
        main_logger.info(f"  • Logs: {config.logs_dir}")
        
        main_logger.info("\n🚀 Próximos pasos:")
        main_logger.info("  1. Revisar resultados en 'results/v0_analysis_data.json'")
        main_logger.info("  2. Usar V0 para visualizaciones avanzadas")
        main_logger.info("  3. Entrenar modelos de ML con las características extraídas")
        
    except Exception as e:
        main_logger.error(f"❌ ERROR CRÍTICO: {e}")
        main_logger.error("🔍 Revisar logs para más detalles")
        sys.exit(1)


def _display_analysis_results(analysis: Dict[str, Any]):
    """
    📊 Mostrar resultados del análisis de forma organizada
    """
    # Información básica
    basic_info = analysis['basic_info']
    main_logger.info(f"📊 Información básica:")
    main_logger.info(f"  • Total de registros: {basic_info['total_records']:,}")
    main_logger.info(f"  • Columnas: {basic_info['columns']}")
    
    # Análisis de etiquetas
    label_analysis = analysis['label_analysis']
    main_logger.info(f"\n🏷️ Análisis de etiquetas:")
    main_logger.info(f"  • Etiquetas únicas: {label_analysis['unique_labels']}")
    main_logger.info(f"  • Single-label: {label_analysis['single_label_count']:,} ({label_analysis['single_label_percentage']:.1f}%)")
    main_logger.info(f"  • Multi-label: {label_analysis['multi_label_count']:,} ({label_analysis['multi_label_percentage']:.1f}%)")
    
    # Distribución por dominio
    domain_distribution = analysis['domain_distribution']
    main_logger.info(f"\n🏥 Distribución por dominio:")
    for domain, stats in domain_distribution.items():
        main_logger.info(f"  • {domain}: {stats['count']:,} ({stats['percentage']:.1f}%)")
    
    # Estadísticas de texto
    text_stats = analysis['text_statistics']
    main_logger.info(f"\n📝 Estadísticas de texto:")
    main_logger.info(f"  • Títulos - Promedio: {text_stats['avg_title_length']:.1f} caracteres")
    main_logger.info(f"  • Abstracts - Promedio: {text_stats['avg_abstract_length']:.1f} caracteres")
    
    # Calidad de datos
    data_quality = analysis['data_quality']
    main_logger.info(f"\n🔍 Calidad de datos:")
    main_logger.info(f"  • Valores faltantes: {sum(data_quality['missing_values'].values())}")
    main_logger.info(f"  • Duplicados: {data_quality['duplicates']}")
    main_logger.info(f"  • Cadenas vacías: {sum(data_quality['empty_strings'].values())}")


if __name__ == "__main__":
    main()
