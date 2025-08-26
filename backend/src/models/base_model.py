"""
🤖 Interfaz base para modelos de ML
Patrón Strategy para diferentes algoritmos
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Tuple, List
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix
import joblib
from pathlib import Path

from src.utils.logger import LoggerMixin, model_logger
from src.config.settings import config


class BaseModel(ABC, LoggerMixin):
    """
    🎯 Interfaz base para todos los modelos
    """
    
    def __init__(self, model_name: str):
        super().__init__()
        self.model_name = model_name
        self.model = None
        self.is_trained = False
        self.training_history = {}
    
    @abstractmethod
    def train(self, X_train: np.ndarray, y_train: np.ndarray, **kwargs) -> Dict[str, Any]:
        """Entrenar el modelo"""
        pass
    
    @abstractmethod
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Realizar predicciones"""
        pass
    
    @abstractmethod
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Obtener probabilidades de predicción"""
        pass
    
    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        """Evaluar el modelo"""
        try:
            if not self.is_trained:
                raise ValueError("Modelo no entrenado")
            
            self.log_info(f"🔍 Evaluando modelo: {self.model_name}")
            
            # Predicciones
            y_pred = self.predict(X_test)
            y_pred_proba = self.predict_proba(X_test)
            
            # Métricas
            metrics = self._calculate_metrics(y_test, y_pred, y_pred_proba)
            
            self.log_info(f"✅ Evaluación completada para {self.model_name}")
            return metrics
            
        except Exception as e:
            self.log_error(f"❌ Error en evaluación: {e}")
            raise
    
    def _calculate_metrics(self, y_true: np.ndarray, y_pred: np.ndarray, y_pred_proba: np.ndarray) -> Dict[str, Any]:
        """Calcular métricas de evaluación"""
        try:
            # Métricas básicas
            from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
            
            metrics = {
                "accuracy": accuracy_score(y_true, y_pred),
                "f1_macro": f1_score(y_true, y_pred, average='macro'),
                "f1_weighted": f1_score(y_true, y_pred, average='weighted'),
                "precision_macro": precision_score(y_true, y_pred, average='macro'),
                "precision_weighted": precision_score(y_true, y_pred, average='weighted'),
                "recall_macro": recall_score(y_true, y_pred, average='macro'),
                "recall_weighted": recall_score(y_true, y_pred, average='weighted')
            }
            
            # Matriz de confusión
            cm = confusion_matrix(y_true, y_pred)
            metrics["confusion_matrix"] = cm.tolist()
            
            # Reporte detallado
            report = classification_report(y_true, y_pred, output_dict=True)
            metrics["classification_report"] = report
            
            return metrics
            
        except Exception as e:
            self.log_error(f"❌ Error al calcular métricas: {e}")
            raise
    
    def save_model(self, filepath: str) -> bool:
        """Guardar modelo entrenado"""
        try:
            if not self.is_trained:
                raise ValueError("No se puede guardar un modelo no entrenado")
            
            output_path = Path(filepath)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Guardar modelo
            joblib.dump(self.model, output_path)
            
            # Guardar metadatos
            metadata = {
                "model_name": self.model_name,
                "is_trained": self.is_trained,
                "training_history": self.training_history,
                "feature_names": getattr(self, 'feature_names', []),
                "label_names": getattr(self, 'label_names', [])
            }
            
            metadata_path = output_path.with_suffix('.json')
            import json
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2, default=str)
            
            self.log_info(f"✅ Modelo guardado en: {output_path}")
            return True
            
        except Exception as e:
            self.log_error(f"❌ Error al guardar modelo: {e}")
            return False
    
    def load_model(self, filepath: str) -> bool:
        """Cargar modelo guardado"""
        try:
            model_path = Path(filepath)
            metadata_path = model_path.with_suffix('.json')
            
            # Cargar modelo
            self.model = joblib.load(model_path)
            
            # Cargar metadatos
            if metadata_path.exists():
                import json
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                
                self.model_name = metadata.get("model_name", self.model_name)
                self.is_trained = metadata.get("is_trained", False)
                self.training_history = metadata.get("training_history", {})
                self.feature_names = metadata.get("feature_names", [])
                self.label_names = metadata.get("label_names", [])
            
            self.log_info(f"✅ Modelo cargado desde: {model_path}")
            return True
            
        except Exception as e:
            self.log_error(f"❌ Error al cargar modelo: {e}")
            return False
    
    def get_model_info(self) -> Dict[str, Any]:
        """Obtener información del modelo"""
        return {
            "model_name": self.model_name,
            "is_trained": self.is_trained,
            "model_type": type(self.model).__name__ if self.model else None,
            "training_history": self.training_history,
            "feature_names": getattr(self, 'feature_names', []),
            "label_names": getattr(self, 'label_names', [])
        }


class ModelRegistry:
    """
    📋 Registro de modelos disponibles
    """
    
    def __init__(self):
        self.models = {}
    
    def register(self, name: str, model_class: type):
        """Registrar un modelo"""
        self.models[name] = model_class
    
    def get_model(self, name: str) -> Optional[type]:
        """Obtener clase de modelo por nombre"""
        return self.models.get(name)
    
    def list_models(self) -> List[str]:
        """Listar modelos disponibles"""
        return list(self.models.keys())
