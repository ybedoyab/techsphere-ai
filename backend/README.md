# 🐍 Backend - TechSphere AI

Esta carpeta contiene todo el código Python del proyecto TechSphere AI, incluyendo el análisis de datos, preprocesamiento y pipeline de machine learning.

## 📁 Estructura

```
backend/
├── 🐍 main.py                  # Script principal del análisis
├── 🧪 test_pipeline.py         # Pruebas del pipeline
├── 📦 requirements.txt          # Dependencias de Python
├── 📊 src/                      # Código fuente organizado
│   ├── ⚙️ config/              # Configuración del proyecto
│   │   └── settings.py         # Configuración centralizada
│   ├── 📊 data/                 # Manejo de datos
│   │   └── repository.py       # Repositorio de datos
│   ├── 🔍 features/             # Extracción de características
│   │   └── text_preprocessor.py # Preprocesamiento de texto
│   ├── 🤖 models/               # Modelos de ML
│   │   └── base_model.py       # Interfaz base para modelos
│   ├── 🎨 visualization/        # Visualizaciones
│   └── 📝 utils/                # Utilidades
│       └── logger.py            # Sistema de logging
├── 📁 data/                     # Datos del proyecto
│   ├── 📁 raw/                  # Datos originales
│   └── 📁 processed/            # Datos procesados
├── 🏗️ models/                   # Modelos entrenados
├── 📈 results/                  # Resultados del análisis
│   ├── 📊 v0_analysis_data.json # Datos para V0
│   └── 🎨 dashboard.html        # Dashboard básico
└── 📝 logs/                     # Archivos de log
```

## 🚀 Funcionalidades

### 📊 Análisis de Datos
- **Carga robusta**: Manejo de CSV con formato especial
- **Validación**: Verificación de integridad de datos
- **Estadísticas**: Análisis exploratorio automático
- **Métricas**: Calidad y distribución de datos

### 🔧 Preprocesamiento
- **Limpieza de texto**: Caracteres especiales y espacios
- **Expansión médica**: Abreviaciones a términos completos
- **Stop words**: Remoción de palabras vacías
- **Pipeline modular**: Fácil extensión y modificación

### 🎯 Machine Learning
- **Extracción de características**: TF-IDF y metadatos
- **Codificación**: Multi-label binarizado
- **Preparación**: Datos listos para entrenamiento
- **Validación**: Métricas de calidad

## 🛠️ Tecnologías Utilizadas

### Core Libraries
- **Python 3.12+**: Lenguaje principal
- **pandas**: Manipulación de datos
- **numpy**: Computación numérica
- **scikit-learn**: Machine Learning

### NLP & ML
- **nltk**: Procesamiento de lenguaje natural
- **spacy**: Análisis lingüístico avanzado
- **transformers**: Modelos de transformers
- **torch**: Deep Learning con PyTorch

### Visualización
- **matplotlib**: Gráficos básicos
- **seaborn**: Visualizaciones estadísticas
- **plotly**: Gráficos interactivos

## 🏗️ Arquitectura

### Patrones de Diseño Implementados
1. **🏭 Factory Pattern**: Creación de loggers
2. **🎯 Strategy Pattern**: Fuentes de datos intercambiables
3. **🗄️ Repository Pattern**: Acceso centralizado a datos
4. **🔗 Chain of Responsibility**: Pipeline de preprocesamiento
5. **⚙️ Singleton Pattern**: Configuración global
6. **🔧 Service Layer**: Lógica de negocio

### Principios SOLID
- **Single Responsibility**: Cada clase tiene una responsabilidad
- **Open/Closed**: Extensible sin modificar código existente
- **Liskov Substitution**: Implementaciones intercambiables
- **Interface Segregation**: Interfaces específicas
- **Dependency Inversion**: Dependencias inyectadas

## 📋 Comandos de Uso

### Ejecución Completa
```bash
# Desde la raíz del proyecto
python main.py --export-v0 --verbose

# Desde el directorio backend
python main.py --export-v0 --verbose
```

### Pruebas del Sistema
```bash
# Verificar que todo funcione
python test_pipeline.py
```

### Análisis Específico
```bash
# Solo análisis básico
python main.py

# Con exportación para V0
python main.py --export-v0

# Con logging detallado
python main.py --verbose
```

## 🔧 Configuración

### Variables de Entorno
El sistema usa configuración centralizada en `src/config/settings.py`:

- **Paths**: Rutas relativas y absolutas
- **Logging**: Niveles y formatos
- **Modelos**: Parámetros de ML
- **Datos**: Configuración de fuentes

### Dependencias
Instalar todas las dependencias:

```bash
pip install -r requirements.txt
```

## 📊 Datos de Entrada

### Formato del Dataset
- **Archivo**: `data/raw/challenge_data-18-ago.csv`
- **Columnas**: title, abstract, group
- **Formato**: Multi-label separado por '|'
- **Dominios**: Cardiovascular, Neurological, Hepatorenal, Oncological

### Estructura de Datos
```csv
title,abstract,group
"Título del artículo","Abstract del artículo","Cardiovascular|Neurological"
```

## 📈 Resultados

### Archivos Generados
1. **v0_analysis_data.json**: Datos estructurados para V0
2. **dashboard.html**: Dashboard básico HTML
3. **logs/**: Archivos de log detallados
4. **models/**: Modelos entrenados (futuro)

### Métricas del Análisis
- **Total de registros**: 3,565 artículos
- **Distribución por dominio**: Porcentajes y conteos
- **Análisis de etiquetas**: Single vs multi-label
- **Estadísticas de texto**: Longitudes y métricas

## 🔍 Desarrollo

### Agregar Nuevos Procesadores
1. Crear clase que herede de `TextProcessor`
2. Implementar método `_process_text()`
3. Agregar al pipeline en `TextPreprocessingPipeline`

### Nuevos Modelos de ML
1. Crear clase que herede de `BaseModel`
2. Implementar métodos requeridos
3. Registrar en `ModelRegistry`

### Extender Fuentes de Datos
1. Crear clase que implemente `DataSource`
2. Implementar método `load_data()`
3. Usar con `DataRepository`

## 🧪 Testing

### Ejecutar Pruebas
```bash
python test_pipeline.py
```

### Verificar Componentes
- ✅ Importaciones
- ✅ Configuración
- ✅ Logging
- ✅ Carga de datos
- ✅ Preprocesamiento

## 📝 Logging

### Niveles de Log
- **INFO**: Información general del proceso
- **WARNING**: Advertencias no críticas
- **ERROR**: Errores que requieren atención
- **DEBUG**: Información detallada para desarrollo

### Archivos de Log
- **Ubicación**: `logs/`
- **Formato**: `YYYY-MM-DD_HH-MM-SS.log`
- **Rotación**: Por fecha y tamaño

## 🚀 Despliegue

### Requisitos del Sistema
- **Python**: 3.12 o superior
- **Memoria**: Mínimo 4GB RAM
- **Espacio**: 2GB libre en disco
- **Dependencias**: Todas las librerías de requirements.txt

### Optimización
- **Cache**: Datos en memoria para reutilización
- **Paralelización**: Procesamiento en lotes
- **Logging**: Solo información esencial en producción

---

**🏥 TechSphere AI** - Challenge de Clasificación Biomédica con IA
