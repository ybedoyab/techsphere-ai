"use client"

import { useState, useEffect } from 'react'
import { buildApiUrl, API_CONFIG } from '@/config/api.config'

interface MetricsViewProps {
  onBack: () => void
}

export default function MetricsView({ onBack }: MetricsViewProps) {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, cmRes] = await Promise.all([
          fetch(buildApiUrl(API_CONFIG.ENDPOINTS.MODEL_METRICS)),
          fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CONFUSION_MATRIX))
        ])

        let metricsData: any = null
        if (metricsRes.ok) {
          const raw = await metricsRes.json()
          // Backend may wrap values under `metrics`
          metricsData = raw && raw.metrics ? raw.metrics : raw
        }

        let cmData: any = null
        if (cmRes.ok) {
          const raw = await cmRes.json()
          // Normalize to { labels, matrix }
          if (raw && Array.isArray(raw.confusion_matrix) && Array.isArray(raw.classes)) {
            cmData = {
              labels: raw.classes.map((c: string) => c.charAt(0).toUpperCase() + c.slice(1)),
              matrix: raw.confusion_matrix
            }
          }
        }

        setMetrics(metricsData)
        ;(window as any).__CONF_MATRIX__ = cmData // optional debug
      } catch (e) {
        setError('No fue posible obtener las métricas del backend')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const safePercent = (v: any, fallback = 0) => {
    const n = typeof v === 'number' ? v : fallback
    return (n * 100).toFixed(1)
  }

  const safeNumber = (v: any) => (typeof v === 'number' ? v.toLocaleString() : '—')

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

  if (!metrics) {
    return (
      <div className="metrics-view">
        <div className="view-header">
          <button onClick={onBack} className="back-btn">← Volver</button>
          <h2>Métricas de Rendimiento</h2>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No disponible</h3>
          <p>No hay métricas calculadas aún. Entrena el modelo para ver resultados.</p>
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
            <div className="metric-value">{safePercent(metrics?.f1_score)}</div>
            <div className="metric-description">
              Medida balanceada entre precisión y recall
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">✅</span>
              <span className="metric-label">Accuracy</span>
            </div>
            <div className="metric-value">{safePercent(metrics?.accuracy)}</div>
            <div className="metric-description">
              Proporción de predicciones correctas
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">🎯</span>
              <span className="metric-label">Precision</span>
            </div>
            <div className="metric-value">{safePercent(metrics?.precision)}</div>
            <div className="metric-description">
              Exactitud de las predicciones positivas
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">📊</span>
              <span className="metric-label">Recall</span>
            </div>
            <div className="metric-value">{safePercent(metrics?.recall)}</div>
            <div className="metric-description">
              Sensibilidad del modelo
            </div>
          </div>
        </div>
        
        {/* Indicador de rendimiento general */}
        <div className="performance-indicator">
          <div className="performance-score">
            <span className="score-label">Rendimiento General</span>
            <span className="score-value">{parseFloat(safePercent(metrics?.f1_score)).toFixed(0)}%</span>
          </div>
          <div className="performance-bar">
            <div 
              className="performance-fill" 
              style={{ width: `${Math.min(100, Math.max(0, (typeof metrics?.f1_score === 'number' ? metrics.f1_score * 100 : 0)))}%` }}
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
            <span className="info-value">{safeNumber(metrics?.training_samples)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Muestras de Prueba</span>
            <span className="info-value">{safeNumber(metrics?.test_samples)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Tipo de Modelo</span>
            <span className="info-value">{metrics?.model_type || '—'}</span>
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

      {/* Matriz de confusión */}
      <div className="confusion-matrix">
        <h3>Matriz de Confusión</h3>
        {(() => {
          const cm: any = (window as any).__CONF_MATRIX__
          if (!cm || !Array.isArray(cm.matrix) || !Array.isArray(cm.labels)) {
            return (
              <div className="empty-state">
                <div className="empty-icon">🧩</div>
                <h3>No disponible</h3>
                <p>Entrena y evalúa el modelo para generar la matriz de confusión.</p>
              </div>
            )
          }
          const labels: string[] = cm.labels
          const matrix: number[][] = cm.matrix
          const totalsRow = matrix.map((row: number[]) => row.reduce((a, b) => a + b, 0))
          const totalsCol = labels.map((_: string, c: number) => matrix.reduce((sum, r) => sum + r[c], 0))
          const totalAll = totalsRow.reduce((a, b) => a + b, 0)
          return (
            <div className="matrix-wrapper">
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th className="corner"></th>
                    {labels.map((l) => (
                      <th key={`pred-${l}`} className="axis">Pred: {l}</th>
                    ))}
                    <th className="axis">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row: number[], r: number) => (
                    <tr key={`row-${r}`}>
                      <th className="axis">Real: {labels[r]}</th>
                      {row.map((val: number, c: number) => (
                        <td key={`cell-${r}-${c}`} className={`cell ${r === c ? 'diag' : ''}`}>{val}</td>
                      ))}
                      <td className="total">{totalsRow[r]}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th className="axis">Total</th>
                    {totalsCol.map((v: number, i: number) => (
                      <td key={`tcol-${i}`} className="total">{v}</td>
                    ))}
                    <td className="total all">{totalAll}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
