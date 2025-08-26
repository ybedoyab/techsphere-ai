"""
⚙️ Configuración centralizada del proyecto
Sigue principios de Clean Architecture y SOLID
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from enum import Enum


class Environment(Enum):
    """Entornos de ejecución"""
    DEVELOPMENT = "development"
    PRODUCTION = "production"
    TESTING = "testing"


@dataclass
class DatabaseConfig:
    """Configuración de base de datos"""
    host: str = "localhost"
    port: int = 5432
    name: str = "medical_classification"
    user: str = "postgres"
    password: str = ""
    
    @property
    def connection_string(self) -> str:
        """String de conexión a la base de datos"""
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"


@dataclass
class ModelConfig:
    """Configuración de modelos de ML"""
    model_type: str = "transformer"
    max_length: int = 512
    batch_size: int = 16
    learning_rate: float = 2e-5
    epochs: int = 10
    validation_split: float = 0.2
    random_state: int = 42
    
    # Hiperparámetros para optimización
    hyperparameter_tuning: bool = True
    optimization_trials: int = 100
    
    # Guardado de modelos
    save_best_only: bool = True
    model_format: str = "joblib"  # joblib, pickle, h5, onnx


@dataclass
class APIConfig:
    """Configuración de la API"""
    host: str = "0.0.0.0"
    port: int = 5000
    debug: bool = True
    cors_enabled: bool = True
    max_file_size: int = 50 * 1024 * 1024  # 50MB
    allowed_extensions: set = field(default_factory=lambda: {'csv'})
    
    # Rate limiting
    rate_limit_enabled: bool = True
    requests_per_minute: int = 60
    
    # Security
    api_key_required: bool = False
    jwt_secret: str = "your-secret-key-change-in-production"


@dataclass
class LoggingConfig:
    """Configuración de logging"""
    level: str = "INFO"
    format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    file_path: Optional[str] = None
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    backup_count: int = 5
    
    # Log rotation
    rotation_enabled: bool = True
    rotation_when: str = "midnight"
    rotation_interval: int = 1


@dataclass
class CacheConfig:
    """Configuración de caché"""
    enabled: bool = True
    type: str = "memory"  # memory, redis, memcached
    ttl: int = 3600  # 1 hora
    max_size: int = 1000
    
    # Redis config (si se usa)
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0


@dataclass
class ProjectConfig:
    """Configuración principal del proyecto"""
    
    # Información básica
    name: str = "Medical Classification AI Challenge"
    version: str = "1.0.0"
    description: str = "Sistema de clasificación biomédica usando IA"
    
    # Entorno
    environment: Environment = Environment.DEVELOPMENT
    
    # Rutas del proyecto
    project_root: Path = field(default_factory=lambda: Path.cwd())
    
    # Configuraciones específicas
    database: DatabaseConfig = field(default_factory=DatabaseConfig)
    model: ModelConfig = field(default_factory=ModelConfig)
    api: APIConfig = field(default_factory=APIConfig)
    logging: LoggingConfig = field(default_factory=LoggingConfig)
    cache: CacheConfig = field(default_factory=CacheConfig)
    
    def __post_init__(self):
        """Configuración post-inicialización"""
        # Asegurar que las rutas sean Path objects
        if isinstance(self.project_root, str):
            self.project_root = Path(self.project_root)
        
        # Crear directorios necesarios
        self._create_directories()
    
    def _create_directories(self):
        """Crear directorios necesarios del proyecto"""
        directories = [
            self.project_root / "data" / "raw",
            self.project_root / "data" / "processed",
            self.project_root / "data" / "external",
            self.project_root / "models",
            self.project_root / "results",
            self.project_root / "logs",
            self.project_root / "temp_uploads",
            self.project_root / "tests" / "data",
            self.project_root / "tests" / "results"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    @property
    def data_dir(self) -> Path:
        """Directorio de datos"""
        return self.project_root / "data"
    
    @property
    def models_dir(self) -> Path:
        """Directorio de modelos"""
        return self.project_root / "models"
    
    @property
    def results_dir(self) -> Path:
        """Directorio de resultados"""
        return self.project_root / "results"
    
    @property
    def logs_dir(self) -> Path:
        """Directorio de logs"""
        return self.project_root / "logs"
    
    def get_config_dict(self) -> Dict[str, Any]:
        """Obtener configuración como diccionario"""
        return {
            "name": self.name,
            "version": self.version,
            "environment": self.environment.value,
            "database": self.database.__dict__,
            "model": self.model.__dict__,
            "api": self.api.__dict__,
            "logging": self.logging.__dict__,
            "cache": self.cache.__dict__,
            "paths": {
                "project_root": str(self.project_root),
                "data_dir": str(self.data_dir),
                "models_dir": str(self.models_dir),
                "results_dir": str(self.results_dir),
                "logs_dir": str(self.logs_dir)
            }
        }
    
    def validate(self) -> bool:
        """Validar configuración"""
        try:
            # Validar rutas
            assert self.project_root.exists(), f"Project root no existe: {self.project_root}"
            
            # Validar configuraciones específicas
            assert 0 < self.api.port < 65536, f"Puerto inválido: {self.api.port}"
            assert 0 < self.model.learning_rate < 1, f"Learning rate inválido: {self.model.learning_rate}"
            assert 0 < self.model.validation_split < 1, f"Validation split inválido: {self.model.validation_split}"
            
            return True
            
        except AssertionError as e:
            print(f"❌ Error de validación: {e}")
            return False
    
    def print_config(self):
        """Imprimir configuración actual"""
        print("🔧 Configuración del Proyecto")
        print("=" * 50)
        print(f"Nombre: {self.name}")
        print(f"Versión: {self.version}")
        print(f"Entorno: {self.environment.value}")
        print(f"Directorio raíz: {self.project_root}")
        print("\n📁 Directorios:")
        print(f"  - Datos: {self.data_dir}")
        print(f"  - Modelos: {self.models_dir}")
        print(f"  - Resultados: {self.results_dir}")
        print(f"  - Logs: {self.logs_dir}")
        print("\n🌐 API:")
        print(f"  - Host: {self.api.host}:{self.api.port}")
        print(f"  - Debug: {self.api.debug}")
        print(f"  - CORS: {self.api.cors_enabled}")
        print("\n🤖 Modelo:")
        print(f"  - Tipo: {self.model.model_type}")
        print(f"  - Epochs: {self.model.epochs}")
        print(f"  - Learning Rate: {self.model.learning_rate}")
        print("=" * 50)


# Instancia global de configuración
config = ProjectConfig()

# Función para obtener configuración
def get_config() -> ProjectConfig:
    """Obtener instancia de configuración"""
    return config


# Función para configurar desde variables de entorno
def configure_from_env():
    """Configurar desde variables de entorno"""
    global config
    
    # Entorno
    env = os.getenv("ENVIRONMENT", "development")
    config.environment = Environment(env)
    
    # API
    config.api.host = os.getenv("API_HOST", config.api.host)
    config.api.port = int(os.getenv("API_PORT", config.api.port))
    config.api.debug = os.getenv("API_DEBUG", "true").lower() == "true"
    
    # Modelo
    config.model.epochs = int(os.getenv("MODEL_EPOCHS", config.model.epochs))
    config.model.learning_rate = float(os.getenv("MODEL_LEARNING_RATE", config.model.learning_rate))
    config.model.batch_size = int(os.getenv("MODEL_BATCH_SIZE", config.model.batch_size))
    
    # Logging
    config.logging.level = os.getenv("LOG_LEVEL", config.logging.level)
    
    print(f"✅ Configuración cargada desde variables de entorno")
    print(f"   Entorno: {config.environment.value}")


if __name__ == "__main__":
    # Ejemplo de uso
    config.print_config()
    
    if config.validate():
        print("✅ Configuración válida")
    else:
        print("❌ Configuración inválida")
