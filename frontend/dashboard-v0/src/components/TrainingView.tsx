"use client"

import { useState } from 'react'

interface TrainingViewProps {
  onBack: () => void
  onModelTrained?: () => void
}

export default function TrainingView({ onBack, onModelTrained }: TrainingViewProps) {
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  const startTraining = () => {
    setTrainingStatus('running')
    setProgress(0)
    setCurrentStep('Iniciando entrenamiento...')
    setLogs([])
    
    // Simular proceso de entrenamiento
    const steps = [
      { step: 'Preprocesamiento de datos...', progress: 20 },
      { step: 'Vectorización TF-IDF...', progress: 40 },
      { step: 'Entrenamiento del modelo...', progress: 60 },
      { step: 'Validación cruzada...', progress: 80 },
      { step: 'Evaluación final...', progress: 100 }
    ]
    
    let currentStepIndex = 0
    
    const trainingInterval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        const step = steps[currentStepIndex]
        setCurrentStep(step.step)
        setProgress(step.progress)
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${step.step} (${step.progress}%)`])
        currentStepIndex++
      } else {
        clearInterval(trainingInterval)
        setTrainingStatus('completed')
        setCurrentStep('Entrenamiento completado exitosamente')
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - Entrenamiento completado (100%)`])
        
        // Notificar que el modelo está entrenado
        if (onModelTrained) {
          onModelTrained()
        }
      }
    }, 2000)
  }

  const stopTraining = () => {
    setTrainingStatus('idle')
    setProgress(0)
    setCurrentStep('Entrenamiento detenido')
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - Entrenamiento detenido por el usuario`])
  }

  const resetTraining = () => {
    setTrainingStatus('idle')
    setProgress(0)
    setCurrentStep('')
    setLogs([])
  }

  return (
    <div className="training-view">
      <div className="view-header">
        <button onClick={onBack} className="back-btn">
          ← Volver
        </button>
        <h2>Entrenamiento del Modelo</h2>
        <p>Entrena el clasificador biomédico con tu dataset</p>
      </div>

      {/* Estado del entrenamiento */}
      <div className="training-status">
        <div className="status-header">
          <div className="status-indicator">
            <div className={`status-dot ${trainingStatus}`}></div>
            <span className="status-text">
              {trainingStatus === 'idle' && 'Listo para entrenar'}
              {trainingStatus === 'running' && 'Entrenando...'}
              {trainingStatus === 'completed' && 'Completado'}
              {trainingStatus === 'error' && 'Error'}
            </span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Progreso del Entrenamiento</span>
            <span className="progress-percentage">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="current-step">{currentStep}</div>
        </div>

        {/* Controles de entrenamiento */}
        <div className="training-controls">
          {trainingStatus === 'idle' && (
            <button 
              onClick={startTraining}
              className="control-btn start-btn"
            >
              🚀 Iniciar Entrenamiento
            </button>
          )}
          
          {trainingStatus === 'running' && (
            <>
              <button 
                onClick={stopTraining}
                className="control-btn stop-btn"
              >
                ⏹️ Detener Entrenamiento
              </button>
              <div className="training-info">
                <p>El entrenamiento está en progreso. Este proceso puede tomar varios minutos.</p>
              </div>
            </>
          )}
          
          {trainingStatus === 'completed' && (
            <>
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h3>¡Entrenamiento Completado!</h3>
                <p>El modelo ha sido entrenado exitosamente y está listo para usar.</p>
              </div>
              <button 
                onClick={resetTraining}
                className="control-btn reset-btn"
              >
                🔄 Entrenar Nuevamente
              </button>
            </>
          )}
          
          {trainingStatus === 'error' && (
            <>
              <div className="error-message">
                <div className="error-icon">❌</div>
                <h3>Error en el Entrenamiento</h3>
                <p>Ocurrió un error durante el proceso de entrenamiento.</p>
              </div>
              <button 
                onClick={resetTraining}
                className="control-btn retry-btn"
              >
                🔄 Reintentar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Logs del entrenamiento */}
      <div className="training-logs">
        <h3>📋 Logs del Entrenamiento</h3>
        <div className="logs-container">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="log-entry">
                {log}
              </div>
            ))
          ) : (
            <div className="empty-logs">
              <p>No hay logs disponibles. Inicia el entrenamiento para ver el progreso.</p>
            </div>
          )}
        </div>
      </div>

      {/* Información del proceso */}
      <div className="training-process-info">
        <h3>🔍 Proceso de Entrenamiento</h3>
        <div className="process-steps">
          <div className="process-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Preprocesamiento de Datos</h4>
              <p>Limpieza, normalización y preparación del texto para el análisis</p>
            </div>
          </div>
          
          <div className="process-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Vectorización TF-IDF</h4>
              <p>Conversión del texto a vectores numéricos para el aprendizaje automático</p>
            </div>
          </div>
          
          <div className="process-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Entrenamiento del Modelo</h4>
              <p>Ajuste de parámetros usando el algoritmo de Regresión Logística</p>
            </div>
          </div>
          
          <div className="process-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Validación Cruzada</h4>
              <p>Evaluación del rendimiento usando validación cruzada k-fold</p>
            </div>
          </div>
          
          <div className="process-step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h4>Evaluación Final</h4>
              <p>Cálculo de métricas finales en el conjunto de prueba</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notas importantes */}
      <div className="training-notes">
        <h3>⚠️ Notas Importantes</h3>
        <div className="notes-content">
          <div className="note-item">
            <span className="note-icon">⏱️</span>
            <span>El entrenamiento puede tomar entre 5-15 minutos dependiendo del tamaño del dataset</span>
          </div>
          <div className="note-item">
            <span className="note-icon">💾</span>
            <span>El modelo entrenado se guarda automáticamente para uso futuro</span>
          </div>
          <div className="note-item">
            <span className="note-icon">🔄</span>
            <span>Puedes entrenar el modelo múltiples veces para mejorar el rendimiento</span>
          </div>
        </div>
      </div>
    </div>
  )
}
