// Configuración de la API
export const API_CONFIG = {
  // URL base del backend
  BASE_URL: 'http://localhost:5000',

  // Endpoints
  ENDPOINTS: {
    TRAINING_STATUS: '/api/training-status',
    START_TRAINING: '/api/start-training',
    STOP_TRAINING: '/api/stop-training',
    UPLOAD_DATASET: '/api/upload-dataset',
    HEALTH_CHECK: '/api/health',
    MODEL_METRICS: '/api/model-metrics',
    CONFUSION_MATRIX: '/api/confusion-matrix'
  }
}

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}
