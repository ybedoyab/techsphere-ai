"use client"

import { useState, useEffect } from 'react'

interface MetricsViewProps {
  onBack: () => void
}

export default function MetricsView({ onBack }: MetricsViewProps) {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simular carga de métricas
    setTimeout(() => {
      setMetrics({
        f1_score: 0.847,
        accuracy: 0.823,
        precision: 0.856,
        recall: 0.839,
        training_samples: 2852,
        test_samples: 713,
        model_type: 'Regresión Logística con TF-IDF'
      })
      setLoading(false)
    }, 1500)
  }, [])

  if (loading) {
    return (
      <div className="metrics-view">
        <div className="view-header">
          <button onClick={onBack} className="back-btn">
            ← Volver
          </button>
          <h2>Métricas de Rendimiento</h2>
        </div>
        
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando métricas del modelo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="metrics-view">
        <div className="view-header">
          <button onClick={onBack} className="back-btn">
            ← Volver
          </button>
          <h2>Métricas de Rendimiento</h2>
        </div>
        
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Error al cargar métricas</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="metrics-view">
      <div className="view-header">
        <button onClick={onBack} className="back-btn">
          ← Volver
        </button>
        <h2>Métricas de Rendimiento</h2>
        <p>Análisis detallado del rendimiento del modelo entrenado</p>
      </div>

      {/* Métricas principales */}
      <div className="metrics-overview">
        <h3>Resumen de Rendimiento</h3>
        <div className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-header">
              <span className="metric-icon">🎯</span>
              <span className="metric-label">F1-Score Ponderado</span>
            </div>
            <div className="metric-value">{(metrics.f1_score * 100).toFixed(1)}%</div>
            <div className="metric-description">
              Medida balanceada entre precisión y recall
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">✅</span>
              <span className="metric-label">Accuracy</span>
            </div>
            <div className="metric-value">{(metrics.accuracy * 100).toFixed(1)}%</div>
            <div className="metric-description">
              Proporción de predicciones correctas
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">🎯</span>
              <span className="metric-label">Precision</span>
            </div>
            <div className="metric-value">{(metrics.precision * 100).toFixed(1)}%</div>
            <div className="metric-description">
              Exactitud de las predicciones positivas
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">📊</span>
              <span className="metric-label">Recall</span>
            </div>
            <div className="metric-value">{(metrics.recall * 100).toFixed(1)}%</div>
            <div className="metric-description">
              Sensibilidad del modelo
            </div>
          </div>
        </div>
        
        {/* Indicador de rendimiento general */}
        <div className="performance-indicator">
          <div className="performance-score">
            <span className="score-label">Rendimiento General</span>
            <span className="score-value">{(metrics.f1_score * 100).toFixed(0)}%</span>
          </div>
          <div className="performance-bar">
            <div 
              className="performance-fill" 
              style={{ width: `${(metrics.f1_score * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Información del entrenamiento */}
      <div className="training-info">
        <h3>Información del Entrenamiento</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Muestras de Entrenamiento</span>
            <span className="info-value">{metrics.training_samples.toLocaleString()}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Muestras de Prueba</span>
            <span className="info-value">{metrics.test_samples.toLocaleString()}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Tipo de Modelo</span>
            <span className="info-value">{metrics.model_type}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Fecha de Entrenamiento</span>
            <span className="info-value">{new Date().toLocaleDateString('es-ES')}</span>
          </div>
        </div>
      </div>

      {/* Interpretación de métricas */}
      <div className="metrics-interpretation">
        <h3>Interpretación de Métricas</h3>
        <div className="interpretation-content">
          <div className="interpretation-item">
            <h4>🎯 F1-Score ({(metrics.f1_score * 100).toFixed(1)}%)</h4>
            <p>
              Un F1-Score de {(metrics.f1_score * 100).toFixed(1)}% indica un rendimiento 
              {metrics.f1_score > 0.8 ? ' excelente' : metrics.f1_score > 0.7 ? ' bueno' : ' aceptable'} 
              del modelo. Esta métrica combina precisión y recall, siendo ideal para datasets 
              desbalanceados como el biomédico.
            </p>
          </div>
          
          <div className="interpretation-item">
            <h4>✅ Accuracy ({(metrics.accuracy * 100).toFixed(1)}%)</h4>
            <p>
              La precisión general del {(metrics.accuracy * 100).toFixed(1)}% muestra que el modelo 
              clasifica correctamente la mayoría de los artículos médicos. Sin embargo, en datasets 
              desbalanceados, esta métrica puede ser engañosa.
            </p>
          </div>
          
          <div className="interpretation-item">
            <h4>📊 Balance del Modelo</h4>
            <p>
              Con una precisión del {(metrics.precision * 100).toFixed(1)}% y un recall del 
              {(metrics.recall * 100).toFixed(1)}%, el modelo muestra un buen balance entre 
              identificar correctamente las clases y no perder casos importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
