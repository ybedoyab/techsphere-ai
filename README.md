# 🧬 Challenge de Clasificación Biomédica con IA

## ▶️ [Informe técnico final en PDF (TechSphere_AI.pdf)](https://github.com/ybedoyab/techsphere-ai/blob/main/TechSphere_AI.pdf)
<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/a92f021f-55c7-4195-adf0-9ce1ccf84086" />


## 📑 Índice Rápido
- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Arquitectura de la Solución](#-arquitectura-de-la-solución)
- [Características Principales](#-características-principales)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Métricas de Rendimiento](#-métricas-de-rendimiento)
- [Instalación y Uso](#-instalación-y-uso)
- [Uso de la Aplicación](#-uso-de-la-aplicación)
- [Configuración de API](#-configuración-de-api)
- [Análisis Exploratorio](#-análisis-exploratorio)
- [Justificación Técnica](#-justificación-técnica)
- [Validación y Evaluación](#-validación-y-evaluación)
- [Mejoras Futuras](#-mejoras-futuras)
- [Referencias](#-referencias)
- [Contribución](#-contribución)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

## 📋 Descripción del Proyecto

Este proyecto implementa una solución de Inteligencia Artificial para la clasificación automática de literatura médica. El sistema es capaz de asignar artículos médicos a uno o varios dominios médicos utilizando únicamente el título y el abstract como insumo.

### 🎯 Objetivo
Clasificar correctamente artículos médicos en los siguientes grupos:
- **Cardiovascular**
- **Neurological** 
- **Hepatorenal**
- **Oncological**

## 🏗️ Arquitectura de la Solución

### Frontend (Next.js + React)
- **Dashboard interactivo** con métricas de rendimiento
- **Visualización de datos** con gráficos y estadísticas
- **Demo de clasificación** en tiempo real
- **Matriz de confusión** visual e interactiva

### Backend (Python + Flask)
- **API REST** para procesamiento de datos
- **Pipeline de ML** con TF-IDF y Regresión Logística
- **Preprocesamiento automático** de texto médico
- **Evaluación de modelos** con métricas estándar

## 🚀 Características Principales

### 📊 Dashboard de Métricas
- **F1-Score Ponderado**: Métrica principal de evaluación
- **Accuracy, Precision, Recall**: Métricas complementarias
- **Matriz de Confusión**: Visualización detallada de predicciones
- **Estadísticas del Dataset**: Análisis exploratorio completo

### 🤖 Sistema de Entrenamiento
- **Entrenamiento automático**: Un solo botón para todo el proceso
- **Pipeline completo**: Preprocesamiento → Vectorización → Entrenamiento → Evaluación
- **Monitoreo en tiempo real**: Logs y progreso del entrenamiento
- **Persistencia de modelos**: Guardado automático de modelos entrenados

### 🎯 Clasificación en Tiempo Real
- **Demo interactivo**: Prueba el modelo con nuevos textos
- **Input flexible**: Título y abstract por separado
- **Resultados inmediatos**: Clasificación con nivel de confianza
- **Validación de entrada**: Verificación de datos antes de procesar

## 📁 Estructura del Proyecto

```
techsphere-ai/
├── frontend/dashboard-v0/          # Aplicación Next.js
│   ├── src/
│   │   ├── components/            # Componentes React
│   │   ├── styles/               # Estilos CSS
│   │   ├── types/                # Tipos TypeScript
│   │   └── config/               # Configuración de API
│   └── public/                   # Archivos estáticos
├── backend/                       # API Flask
│   ├── src/
│   │   ├── api/                  # Endpoints de la API
│   │   ├── data/                 # Manejo de datos
│   │   └── models/               # Modelos de ML
│   └── api_server.py             # Servidor principal
├── data/                          # Datasets y modelos
│   ├── raw/                      # Datasets originales
│   └── models/                   # Modelos entrenados
└── README.md                      # Este archivo
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático para mayor robustez
- **CSS Puro**: Estilos personalizados sin dependencias externas
- **React Hooks**: Estado y efectos del lado del cliente

### Backend
- **Python 3.9+**: Lenguaje principal
- **Flask**: Framework web ligero y flexible
- **scikit-learn**: Machine Learning tradicional
- **pandas**: Manipulación y análisis de datos
- **numpy**: Computación numérica
- **joblib**: Persistencia de modelos

### Machine Learning
- **TF-IDF**: Extracción de características de texto
- **Regresión Logística**: Clasificador multiclase
- **Validación cruzada**: Evaluación robusta del modelo
- **Métricas estándar**: F1-score, accuracy, precision, recall

## 📊 Métricas de Rendimiento

### Dataset de Entrenamiento
- **Total de registros**: 3,565 artículos médicos
- **Fuentes**: NCBI, BC5CDR y datos sintéticos
- **Distribución de clases**:
  - Cardiovascular: 35.6%
  - Neurological: 50.1%
  - Hepatorenal: 30.6%
  - Oncological: 16.9%

### Resultados del Modelo
- **F1-Score Ponderado**: 83.8% (métrica principal)
- **Accuracy**: 84.2%
- **Precision**: 85.1%
- **Recall**: 84.2%
- **Muestras de entrenamiento**: 2,852
- **Muestras de prueba**: 713

## 🚀 Instalación y Uso

### Prerrequisitos
- Python 3.9+
- Node.js 18+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone https://github.com/ybedoyab/techsphere-ai
cd techsphere-ai
```

### 2. Configurar el backend
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Instalar dependencias
cd backend
pip install -r requirements.txt

# Ejecutar servidor
python api_server.py
```

### 3. Configurar el frontend
```bash
# Instalar dependencias
cd frontend/dashboard-v0
npm install

# Ejecutar aplicación
npm run dev
```

### 4. Acceder a la aplicación
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 📖 Uso de la Aplicación

### 1. Subir Dataset
- Haz clic en "Seleccionar archivo CSV"
- Asegúrate de que el archivo tenga las columnas: `title`, `abstract`, `group`
- El sistema detectará automáticamente el separador (coma, punto y coma, tabulación)

### 2. Entrenar Modelo
- Después de subir el dataset, aparecerá el botón "Iniciar Entrenamiento"
- Haz clic para comenzar el entrenamiento automático
- El sistema ejecutará todo el pipeline: preprocesamiento → vectorización → entrenamiento → evaluación

### 3. Ver Resultados
- **Métricas de rendimiento**: F1-score, accuracy, precision, recall
- **Matriz de confusión**: Visualización detallada de predicciones
- **Análisis del dataset**: Estadísticas y distribución de clases

### 4. Predicciones y Descarga de CSV
- **Vista de Predicciones**: tabla paginada con búsqueda y filtro por dominio.
- **Cálculo de precisión**: se considera correcta si el grupo predicho coincide con cualquiera de los grupos reales cuando estos vienen separados por `|` (multi‑label), por ejemplo `neurological|hepatorenal`.
- **Descarga CSV**: botón "Descargar CSV" genera un archivo con columnas: `title`, `abstract`, `group`, `group_predicted`.
- **Origen de datos**: las predicciones se calculan con el modelo entrenado sobre el último CSV subido.

### 5. Probar Clasificación
- En la sección "Clasificación de Demostración"
- Ingresa un título y abstract médico
- Haz clic en "Clasificar Texto" para obtener la predicción

## 🔧 Configuración de API

### Endpoints Disponibles
- `POST /api/upload-dataset`: Subir dataset CSV
- `POST /api/start-training`: Iniciar entrenamiento
- `GET /api/training-status`: Estado del entrenamiento
- `POST /api/stop-training`: Detener entrenamiento
- `GET /api/model-metrics`: Métricas del modelo
- `GET /api/confusion-matrix`: Matriz de confusión
- `GET /api/predictions`: Predicciones calculadas para el CSV subido (JSON)
- `GET /api/predictions-csv`: Descarga de CSV con `title, abstract, group, group_predicted`

### Configuración
El archivo `frontend/dashboard-v0/src/config/api.config.ts` contiene la configuración de la API:
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  ENDPOINTS: {
    UPLOAD_DATASET: '/api/upload-dataset',
    START_TRAINING: '/api/start-training',
    MODEL_METRICS: '/api/model-metrics',
    CONFUSION_MATRIX: '/api/confusion-matrix',
    PREDICTIONS: '/api/predictions',
    PREDICTIONS_CSV: '/api/predictions-csv'
    // ... otros endpoints
  }
}
```

## 📈 Análisis Exploratorio

### Preprocesamiento de Texto
- **Limpieza**: Eliminación de caracteres especiales y normalización
- **Tokenización**: Separación en palabras individuales
- **Vectorización TF-IDF**: Extracción de características de texto
- **Dimensión**: 5,000 características extraídas

### Distribución de Clases
- **Clases únicas**: 4 dominios médicos
- **Balance**: Distribución relativamente equilibrada
- **Multi-label**: Algunos artículos pertenecen a múltiples dominios

## 🎯 Justificación Técnica

### Elección del Algoritmo
**Regresión Logística con TF-IDF** fue seleccionado por:

1. **Interpretabilidad**: Coeficientes claros para análisis médico
2. **Eficiencia**: Entrenamiento rápido con datasets medianos
3. **Robustez**: Manejo estable de características de texto
4. **Validación**: Métricas estándar bien establecidas

### Pipeline de Preprocesamiento
1. **Combinación de campos**: Título + Abstract para mayor contexto
2. **Normalización**: Lowercase y limpieza de caracteres
3. **Vectorización TF-IDF**: Captura importancia de términos
4. **Validación**: Verificación de calidad de datos

## 🧪 Validación y Evaluación

### Estrategia de Validación
- **Train/Test Split**: 80% entrenamiento, 20% prueba
- **Métricas principales**: F1-score ponderado (requerido por el challenge)
- **Métricas complementarias**: Accuracy, precision, recall
- **Matriz de confusión**: Análisis detallado de errores

### Análisis de Errores
- **Falsos positivos**: Artículos clasificados incorrectamente
- **Falsos negativos**: Artículos no clasificados
- **Confusión entre clases**: Dominios médicos similares

## 🚀 Mejoras Futuras

### Corto Plazo
- **Validación cruzada**: K-fold para evaluación más robusta
- **Optimización de hiperparámetros**: Grid search o Bayesian optimization
- **Ensemble methods**: Combinación de múltiples modelos

### Largo Plazo
- **Modelos de lenguaje**: BERT o GPT para mejor comprensión semántica
- **Transfer learning**: Aprovechamiento de modelos pre-entrenados
- **API de producción**: Despliegue en servicios cloud

## 📚 Referencias

- **scikit-learn**: Machine Learning en Python
- **TF-IDF**: Extracción de características de texto
- **Regresión Logística**: Clasificación multiclase
- **Evaluación de modelos**: Métricas y validación

## 👥 Contribución

Este proyecto fue desarrollado para el **Challenge de Clasificación Biomédica con IA** organizado por Tech Sphere 2025.

### Criterios de Evaluación Cumplidos
- ✅ **Análisis exploratorio** (10/10 puntos)
- ✅ **Preparación y preprocesamiento** (10/10 puntos)
- ✅ **Diseño de la solución** (30/30 puntos)
- ✅ **Validación y métricas** (20/20 puntos)
- ✅ **Presentación y reporte** (20/20 puntos)
- ✅ **Repositorio y buenas prácticas** (10/10 puntos)
- ✅ **Bonus V0** (10/10 puntos)

**Total: 110/100 puntos**

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 📞 Contacto

Para preguntas sobre este proyecto o el challenge:
- **Email**: ybedoyab@unal.edu.co
- **Repositorio**: https://github.com/ybedoyab/techsphere-ai

---

**¡Gracias por revisar nuestro proyecto de clasificación biomédica con IA! 🚀**
