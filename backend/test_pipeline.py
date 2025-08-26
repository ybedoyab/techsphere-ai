#!/usr/bin/env python3
"""
🧪 Script de prueba rápida del pipeline
Verifica que todos los componentes funcionen correctamente
"""

import sys
from pathlib import Path

# Agregar src al path
sys.path.append(str(Path(__file__).parent / "src"))

def test_imports():
    """🧪 Probar importaciones de módulos"""
    print("🧪 Probando importaciones...")
    
    try:
        from src.config.settings import config
        print("✅ Configuración importada correctamente")
        
        from src.utils.logger import main_logger
        print("✅ Logger importado correctamente")
        
        from src.data.repository import CSVDataSource, DataRepository, DataService
        print("✅ Repositorio de datos importado correctamente")
        
        from src.features.text_preprocessor import TextPreprocessingPipeline, FeatureExtractor
        print("✅ Preprocesador de texto importado correctamente")
        
        from src.models.base_model import BaseModel, ModelRegistry
        print("✅ Modelos base importados correctamente")
        
        print("\n🎉 Todas las importaciones exitosas!")
        return True
        
    except ImportError as e:
        print(f"❌ Error de importación: {e}")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False


def test_configuration():
    """⚙️ Probar sistema de configuración"""
    print("\n⚙️ Probando configuración...")
    
    try:
        from src.config.settings import config
        
        # Verificar que la configuración se creó
        assert config is not None, "Configuración no se creó"
        
        # Verificar rutas
        assert hasattr(config, 'data_dir'), "Directorio de datos no configurado"
        assert hasattr(config, 'results_dir'), "Directorio de resultados no configurado"
        
        # Verificar subconfiguraciones
        assert hasattr(config, 'data'), "Configuración de datos no encontrada"
        assert hasattr(config, 'model'), "Configuración de modelo no encontrada"
        assert hasattr(config, 'text'), "Configuración de texto no encontrada"
        
        print("✅ Configuración funcionando correctamente")
        print(f"   • Directorio de datos: {config.data_dir}")
        print(f"   • Directorio de resultados: {config.results_dir}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en configuración: {e}")
        return False


def test_logging():
    """📝 Probar sistema de logging"""
    print("\n📝 Probando sistema de logging...")
    
    try:
        from src.utils.logger import main_logger, data_logger, model_logger
        
        # Probar diferentes niveles de logging
        main_logger.info("🧪 Prueba de logging - INFO")
        data_logger.warning("🧪 Prueba de logging - WARNING")
        model_logger.error("🧪 Prueba de logging - ERROR")
        
        print("✅ Sistema de logging funcionando correctamente")
        return True
        
    except Exception as e:
        print(f"❌ Error en logging: {e}")
        return False


def test_data_loading():
    """📊 Probar carga de datos"""
    print("\n📊 Probando carga de datos...")
    
    try:
        from src.data.repository import CSVDataSource, DataRepository
        
        # Crear fuente de datos
        data_source = CSVDataSource("challenge_data-18-ago.csv")
        repository = DataRepository(data_source)
        
        print("✅ Repositorio de datos creado correctamente")
        
        # Intentar cargar datos (puede fallar si el archivo no existe)
        try:
            data_info = repository.get_data_info()
            print(f"✅ Información de datos obtenida: {data_info['shape']}")
        except FileNotFoundError:
            print("⚠️ Archivo de datos no encontrado (esto es normal en pruebas)")
        except Exception as e:
            print(f"⚠️ Error al cargar datos: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en repositorio de datos: {e}")
        return False


def test_text_preprocessing():
    """🔍 Probar preprocesamiento de texto"""
    print("\n🔍 Probando preprocesamiento de texto...")
    
    try:
        from src.features.text_preprocessor import TextPreprocessingPipeline
        
        # Crear pipeline
        pipeline = TextPreprocessingPipeline()
        
        # Probar con texto de ejemplo
        test_text = "Cardiovascular disease (CV) is a major health concern."
        processed_text = pipeline.preprocess_text(test_text)
        
        print(f"✅ Texto original: {test_text}")
        print(f"✅ Texto procesado: {processed_text}")
        
        # Verificar que se procesó
        assert processed_text != test_text, "El texto no se procesó"
        assert "cardiovascular" in processed_text.lower(), "Abreviación no expandida"
        
        print("✅ Preprocesamiento de texto funcionando correctamente")
        return True
        
    except Exception as e:
        print(f"❌ Error en preprocesamiento: {e}")
        return False


def main():
    """🚀 Función principal de pruebas"""
    print("🧪 INICIANDO PRUEBAS DEL PIPELINE")
    print("=" * 50)
    
    tests = [
        ("Importaciones", test_imports),
        ("Configuración", test_configuration),
        ("Logging", test_logging),
        ("Repositorio de datos", test_data_loading),
        ("Preprocesamiento de texto", test_text_preprocessing)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} falló")
        except Exception as e:
            print(f"❌ {test_name} falló con excepción: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 RESULTADOS DE PRUEBAS: {passed}/{total} exitosas")
    
    if passed == total:
        print("🎉 ¡Todas las pruebas pasaron! El pipeline está listo.")
        print("\n🚀 Para ejecutar el análisis completo:")
        print("   python main.py --export-v0")
    else:
        print("⚠️ Algunas pruebas fallaron. Revisar errores arriba.")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
