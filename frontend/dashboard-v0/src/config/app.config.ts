/**
 * ⚙️ Configuración de la aplicación frontend
 */

export interface AppConfig {
  // Información de la aplicación
  name: string;
  version: string;
  description: string;
  
  // Configuración de la API
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  
  // Configuración de la interfaz
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    refreshInterval: number;
  };
  
  // Configuración de características
  features: {
    datasetUpload: boolean;
    realTimeTraining: boolean;
    modelInference: boolean;
    dataVisualization: boolean;
  };
}

// Configuración por defecto
const defaultConfig: AppConfig = {
  name: 'Medical Classification AI Dashboard',
  version: '1.0.0',
  description: 'Dashboard interactivo para clasificación biomédica con IA',
  
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    timeout: 30000, // 30 segundos
    retries: 3,
  },
  
  ui: {
    theme: 'auto',
    language: 'es',
    refreshInterval: 5000, // 5 segundos
  },
  
  features: {
    datasetUpload: true,
    realTimeTraining: true,
    modelInference: true,
    dataVisualization: true,
  },
};

// Configuración del entorno de desarrollo
const developmentConfig: Partial<AppConfig> = {
  api: {
    baseUrl: 'http://localhost:5000/api',
    timeout: 60000, // 60 segundos en desarrollo
    retries: 5,
  },
  ui: {
    theme: 'auto',
    language: 'es',
    refreshInterval: 2000, // 2 segundos en desarrollo
  },
};

// Configuración del entorno de producción
const productionConfig: Partial<AppConfig> = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.medical-classification.com/api',
    timeout: 15000, // 15 segundos en producción
    retries: 2,
  },
  ui: {
    theme: 'auto',
    language: 'es',
    refreshInterval: 10000, // 10 segundos en producción
  },
};

// Función para obtener la configuración según el entorno
export function getConfig(): AppConfig {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    return { ...defaultConfig, ...productionConfig };
  }
  
  if (env === 'development') {
    return { ...defaultConfig, ...developmentConfig };
  }
  
  return defaultConfig;
}

// Función para validar la configuración
export function validateConfig(config: AppConfig): boolean {
  try {
    // Validar URL de la API
    const url = new URL(config.api.baseUrl);
    if (!url.protocol || !url.hostname) {
      console.error('❌ URL de API inválida:', config.api.baseUrl);
      return false;
    }
    
    // Validar timeouts y reintentos
    if (config.api.timeout <= 0 || config.api.retries < 0) {
      console.error('❌ Configuración de API inválida');
      return false;
    }
    
    // Validar intervalos de refresco
    if (config.ui.refreshInterval <= 0) {
      console.error('❌ Intervalo de refresco inválido');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error validando configuración:', error);
    return false;
  }
}

// Función para imprimir la configuración actual
export function printConfig(): void {
  const config = getConfig();
  
  console.log('🔧 Configuración de la Aplicación Frontend');
  console.log('='.repeat(50));
  console.log(`Nombre: ${config.name}`);
  console.log(`Versión: ${config.version}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n🌐 API:`);
  console.log(`  - Base URL: ${config.api.baseUrl}`);
  console.log(`  - Timeout: ${config.api.timeout}ms`);
  console.log(`  - Reintentos: ${config.api.retries}`);
  console.log(`\n🎨 UI:`);
  console.log(`  - Tema: ${config.ui.theme}`);
  console.log(`  - Idioma: ${config.ui.language}`);
  console.log(`  - Intervalo de refresco: ${config.ui.refreshInterval}ms`);
  console.log(`\n🚀 Características:`);
  console.log(`  - Subida de datasets: ${config.features.datasetUpload ? '✅' : '❌'}`);
  console.log(`  - Entrenamiento en tiempo real: ${config.features.realTimeTraining ? '✅' : '❌'}`);
  console.log(`  - Inferencia del modelo: ${config.features.modelInference ? '✅' : '❌'}`);
  console.log(`  - Visualización de datos: ${config.features.dataVisualization ? '✅' : '❌'}`);
  console.log('='.repeat(50));
}

// Exportar configuración por defecto
export const appConfig = getConfig();

// Validar configuración al cargar
if (typeof window !== 'undefined') {
  // Solo en el navegador
  if (process.env.NODE_ENV === 'development') {
    printConfig();
  }
  
  if (!validateConfig(appConfig)) {
    console.warn('⚠️ Configuración inválida detectada');
  }
}
