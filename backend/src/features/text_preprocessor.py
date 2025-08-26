"""
🔍 Preprocesamiento de texto usando Chain of Responsibility
Pipeline modular y extensible para NLP
"""

import re
import string
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MultiLabelBinarizer

from src.utils.logger import LoggerMixin, text_logger
from src.config.settings import config


class TextProcessor(ABC):
    """
    🔗 Procesador base en la cadena de responsabilidad
    """
    
    def __init__(self):
        self._next_processor: Optional['TextProcessor'] = None
    
    def set_next(self, processor: 'TextProcessor') -> 'TextProcessor':
        """Establecer siguiente procesador en la cadena"""
        self._next_processor = processor
        return processor
    
    def process(self, text: str) -> str:
        """Procesar texto y pasar al siguiente"""
        processed_text = self._process_text(text)
        
        if self._next_processor:
            return self._next_processor.process(processed_text)
        
        return processed_text
    
    @abstractmethod
    def _process_text(self, text: str) -> str:
        """Procesamiento específico del texto"""
        pass


class TextCleaner(TextProcessor):
    """
    🧹 Limpieza básica de texto
    """
    
    def _process_text(self, text: str) -> str:
        """Limpiar texto básico"""
        if not isinstance(text, str):
            return ""
        
        # Convertir a minúsculas
        text = text.lower()
        
        # Remover caracteres especiales pero mantener espacios
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Remover espacios múltiples
        text = re.sub(r'\s+', ' ', text)
        
        # Remover espacios al inicio y final
        text = text.strip()
        
        return text


class MedicalAbbreviationExpander(TextProcessor):
    """
    🏥 Expansor de abreviaciones médicas
    """
    
    def __init__(self):
        super().__init__()
        self.medical_abbreviations = {
            'cv': 'cardiovascular',
            'neuro': 'neurological',
            'hepato': 'hepatorenal',
            'onco': 'oncological',
            'mi': 'myocardial infarction',
            'cad': 'coronary artery disease',
            'chf': 'congestive heart failure',
            'cva': 'cerebrovascular accident',
            'tia': 'transient ischemic attack',
            'copd': 'chronic obstructive pulmonary disease',
            'dm': 'diabetes mellitus',
            'htn': 'hypertension',
            'cva': 'cerebrovascular accident',
            'mi': 'myocardial infarction'
        }
    
    def _process_text(self, text: str) -> str:
        """Expandir abreviaciones médicas"""
        words = text.split()
        expanded_words = []
        
        for word in words:
            if word in self.medical_abbreviations:
                expanded_words.append(self.medical_abbreviations[word])
            else:
                expanded_words.append(word)
        
        return ' '.join(expanded_words)


class StopWordRemover(TextProcessor):
    """
    🚫 Removedor de palabras vacías
    """
    
    def __init__(self, custom_stop_words: Optional[List[str]] = None):
        super().__init__()
        self.stop_words = set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
        ])
        
        if custom_stop_words:
            self.stop_words.update(custom_stop_words)
    
    def _process_text(self, text: str) -> str:
        """Remover palabras vacías"""
        words = text.split()
        filtered_words = [word for word in words if word.lower() not in self.stop_words]
        return ' '.join(filtered_words)


class TextPreprocessingPipeline(LoggerMixin):
    """
    🔄 Pipeline completo de preprocesamiento de texto
    """
    
    def __init__(self):
        super().__init__()
        self._build_pipeline()
    
    def _build_pipeline(self):
        """Construir cadena de procesadores"""
        self.cleaner = TextCleaner()
        self.abbreviation_expander = MedicalAbbreviationExpander()
        self.stop_word_remover = StopWordRemover()
        
        # Construir cadena
        self.cleaner.set_next(self.abbreviation_expander)
        self.abbreviation_expander.set_next(self.stop_word_remover)
        
        self.log_info("🔗 Pipeline de preprocesamiento construido")
    
    def preprocess_text(self, text: str) -> str:
        """Preprocesar texto completo"""
        return self.cleaner.process(text)
    
    def preprocess_dataframe(self, df: pd.DataFrame, text_columns: List[str]) -> pd.DataFrame:
        """Preprocesar columnas de texto en DataFrame"""
        processed_df = df.copy()
        
        for column in text_columns:
            if column in processed_df.columns:
                self.log_info(f"🔄 Preprocesando columna: {column}")
                processed_df[f"{column}_processed"] = processed_df[column].apply(
                    self.preprocess_text
                )
        
        return processed_df


class FeatureExtractor(LoggerMixin):
    """
    🔍 Extractor de características de texto
    """
    
    def __init__(self):
        super().__init__()
        self.tfidf_vectorizer = None
        self.mlb = MultiLabelBinarizer()
        self.logger = text_logger
    
    def extract_text_features(self, texts: List[str], max_features: int = 5000) -> np.ndarray:
        """Extraer características TF-IDF"""
        try:
            self.logger.info(f"🔍 Extrayendo características TF-IDF de {len(texts)} textos")
            
            self.tfidf_vectorizer = TfidfVectorizer(
                max_features=max_features,
                ngram_range=config.text.ngram_range,
                min_df=config.text.min_df,
                max_df=config.text.max_df,
                stop_words=config.text.stop_words
            )
            
            features = self.tfidf_vectorizer.fit_transform(texts)
            self.logger.info(f"✅ Características extraídas: {features.shape}")
            
            return features.toarray()
            
        except Exception as e:
            self.logger.error(f"❌ Error al extraer características: {e}")
            raise
    
    def extract_metadata_features(self, df: pd.DataFrame) -> np.ndarray:
        """Extraer características de metadatos"""
        try:
            self.logger.info("🔍 Extrayendo características de metadatos")
            
            features = []
            
            # Longitud de título y abstract
            features.append(df['title'].str.len().values.reshape(-1, 1))
            features.append(df['abstract'].str.len().values.reshape(-1, 1))
            
            # Conteo de palabras
            features.append(df['title'].str.split().str.len().values.reshape(-1, 1))
            features.append(df['abstract'].str.split().str.len().values.reshape(-1, 1))
            
            # Conteo de oraciones (aproximado por puntos)
            features.append(df['abstract'].str.count(r'\.').values.reshape(-1, 1))
            
            # Conteo de números
            features.append(df['abstract'].str.count(r'\d+').values.reshape(-1, 1))
            
            # Conteo de mayúsculas
            features.append(df['title'].str.count(r'[A-Z]').values.reshape(-1, 1))
            
            metadata_features = np.hstack(features)
            self.logger.info(f"✅ Metadatos extraídos: {metadata_features.shape}")
            
            return metadata_features
            
        except Exception as e:
            self.logger.error(f"❌ Error al extraer metadatos: {e}")
            raise
    
    def encode_labels(self, labels: List[str]) -> np.ndarray:
        """Codificar etiquetas multi-label"""
        try:
            self.logger.info("🏷️ Codificando etiquetas multi-label")
            
            # Separar etiquetas múltiples
            separated_labels = [label.split('|') for label in labels]
            
            # Codificar con MultiLabelBinarizer
            encoded_labels = self.mlb.fit_transform(separated_labels)
            
            self.logger.info(f"✅ Etiquetas codificadas: {encoded_labels.shape}")
            return encoded_labels
            
        except Exception as e:
            self.logger.error(f"❌ Error al codificar etiquetas: {e}")
            raise
    
    def get_feature_names(self) -> List[str]:
        """Obtener nombres de características TF-IDF"""
        if self.tfidf_vectorizer:
            return self.tfidf_vectorizer.get_feature_names_out().tolist()
        return []
    
    def get_label_names(self) -> List[str]:
        """Obtener nombres de etiquetas"""
        return self.mlb.classes_.tolist()
