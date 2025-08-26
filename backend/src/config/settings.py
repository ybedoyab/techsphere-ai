"""
⚙️ Configuración del proyecto usando la nueva arquitectura
"""

from .project_config import get_config, ProjectConfig

# Mantener compatibilidad con código existente
config = get_config()
settings = config

# Alias para compatibilidad
def get_settings() -> ProjectConfig:
    """Obtener instancia de configuración"""
    return config

def get_data_path(filename: str):
    """Obtener ruta completa de archivo de datos"""
    return config.data_dir / filename

def get_results_path(filename: str):
    """Obtener ruta completa de archivo de resultados"""
    return config.results_dir / filename

def get_model_path(filename: str):
    """Obtener ruta completa de archivo de modelo"""
    return config.models_dir / filename

