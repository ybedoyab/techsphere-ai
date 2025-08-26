"""
📝 Sistema de logging profesional
Patrón Factory para diferentes tipos de loggers
"""

import logging
import sys
from pathlib import Path
from typing import Optional
from datetime import datetime
from src.config.settings import config


class LoggerFactory:
    """
    🏭 Factory para crear diferentes tipos de loggers
    """
    
    @staticmethod
    def create_logger(
        name: str,
        level: str = "INFO",
        log_to_file: bool = True,
        log_to_console: bool = True
    ) -> logging.Logger:
        """
        Crear logger con configuración específica
        
        Args:
            name: Nombre del logger
            level: Nivel de logging
            log_to_file: Si debe escribir a archivo
            log_to_console: Si debe escribir a consola
            
        Returns:
            Logger configurado
        """
        logger = logging.getLogger(name)
        logger.setLevel(getattr(logging, level.upper()))
        
        # Evitar duplicar handlers
        if logger.handlers:
            return logger
        
        formatter = logging.Formatter(
            fmt=config.logging.format,
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        
        # Handler para consola
        if log_to_console:
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setFormatter(formatter)
            logger.addHandler(console_handler)
        
        # Handler para archivo
        if log_to_file:
            log_file = config.logs_dir / f"{name}_{datetime.now().strftime('%Y%m%d')}.log"
            file_handler = logging.FileHandler(log_file, encoding='utf-8')
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
        
        return logger


class LoggerMixin:
    """
    🔧 Mixin para agregar logging a cualquier clase
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = LoggerFactory.create_logger(self.__class__.__name__)
    
    def log_info(self, message: str):
        """Log de información"""
        self.logger.info(message)
    
    def log_warning(self, message: str):
        """Log de advertencia"""
        self.logger.warning(message)
    
    def log_error(self, message: str):
        """Log de error"""
        self.logger.error(message)
    
    def log_debug(self, message: str):
        """Log de debug"""
        self.logger.debug(message)


# Logger principal del proyecto
main_logger = LoggerFactory.create_logger("main")
data_logger = LoggerFactory.create_logger("data")
model_logger = LoggerFactory.create_logger("model")
text_logger = LoggerFactory.create_logger("text")

