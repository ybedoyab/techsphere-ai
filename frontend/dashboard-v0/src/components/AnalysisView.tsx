"use client"

import { V0Data } from '@/types/v0-data'

interface AnalysisViewProps {
  data: V0Data
  onBack: () => void
}

export default function AnalysisView({ data, onBack }: AnalysisViewProps) {
  return (
    <div className="analysis-view">
      <div className="view-header">
        <button onClick={onBack} className="back-btn">
          ← Volver
        </button>
        <h2>Análisis de Datos</h2>
        <p>Exploración detallada de tu dataset biomédico</p>
      </div>

      {/* Resumen del dataset */}
      <div className="dataset-summary">
        <h3>📊 Resumen del Dataset</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">📁</div>
            <div className="summary-content">
              <div className="summary-value">{data.basic_info.total_records.toLocaleString()}</div>
              <div className="summary-label">Total de Registros</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">🏷️</div>
            <div className="summary-content">
              <div className="summary-value">{data.label_analysis?.unique_labels || 'N/A'}</div>
              <div className="summary-label">Etiquetas Únicas</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">📝</div>
            <div className="summary-content">
              <div className="summary-value">
                {data.text_statistics?.title_stats ? 
                  Math.round(data.text_statistics.title_stats.mean) : 'N/A'}
              </div>
              <div className="summary-label">Longitud Promedio Título</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon">📄</div>
            <div className="summary-content">
              <div className="summary-value">
                {data.text_statistics?.abstract_stats ? 
                  Math.round(data.text_statistics.abstract_stats.mean) : 'N/A'}
              </div>
              <div className="summary-label">Longitud Promedio Abstract</div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por dominio */}
      <div className="domain-analysis">
        <h3>🌐 Distribución por Dominio Médico</h3>
        <div className="domain-chart">
          {data.domain_distribution?.counts && Object.entries(data.domain_distribution.counts).map(([domain, count]: [string, number]) => {
            const percentage = data.domain_distribution?.percentages?.[domain] || 0
            
            return (
              <div key={domain} className="domain-bar-item">
                <div className="domain-label">
                  <span className="domain-name">{domain}</span>
                  <span className="domain-count">{count.toLocaleString()}</span>
                </div>
                <div className="domain-bar-container">
                  <div 
                    className="domain-bar-fill" 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <span className="domain-percentage">{percentage.toFixed(1)}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Estadísticas de texto */}
      <div className="text-analysis">
        <h3>📝 Análisis de Texto</h3>
        <div className="text-stats-grid">
          <div className="text-stat-section">
            <h4>Títulos</h4>
            <div className="stat-details">
              <div className="stat-row">
                <span className="stat-label">Longitud Promedio:</span>
                <span className="stat-value">
                  {data.text_statistics?.title_stats ? 
                    Math.round(data.text_statistics.title_stats.mean) : 'N/A'} caracteres
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Longitud Mínima:</span>
                <span className="stat-value">
                  {data.text_statistics?.title_stats?.min || 'N/A'} caracteres
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Longitud Máxima:</span>
                <span className="stat-value">
                  {data.text_statistics?.title_stats?.max || 'N/A'} caracteres
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-stat-section">
            <h4>Abstracts</h4>
            <div className="stat-details">
              <div className="stat-row">
                <span className="stat-label">Longitud Promedio:</span>
                <span className="stat-value">
                  {data.text_statistics?.abstract_stats ? 
                    Math.round(data.text_statistics.abstract_stats.mean) : 'N/A'} caracteres
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Longitud Mínima:</span>
                <span className="stat-value">
                  {data.text_statistics?.abstract_stats?.min || 'N/A'} caracteres
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Longitud Máxima:</span>
                <span className="stat-value">
                  {data.text_statistics?.abstract_stats?.max || 'N/A'} caracteres
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis de etiquetas */}
      <div className="label-analysis">
        <h3>🏷️ Análisis de Etiquetas</h3>
        <div className="label-content">
          <div className="label-summary">
            <div className="label-stat">
              <span className="label-value">{data.label_analysis?.unique_labels || 'N/A'}</span>
              <span className="label-label">Etiquetas Únicas</span>
            </div>
            <div className="label-stat">
              <span className="label-value">{data.label_analysis?.total_records || 'N/A'}</span>
              <span className="label-label">Total de Registros</span>
            </div>
            <div className="label-stat">
              <span className="label-value">
                {data.label_analysis?.label_counts ? Object.keys(data.label_analysis.label_counts).length : 'N/A'}
              </span>
              <span className="label-label">Tipos de Etiquetas</span>
            </div>
          </div>
          
          {data.label_analysis?.label_counts && (
            <div className="label-distribution">
              <h4>Distribución de Etiquetas</h4>
              <div className="label-chart">
                {Object.entries(data.label_analysis.label_counts).map(([label, count]: [string, number]) => (
                  <div key={label} className="label-item">
                    <span className="label-name">{label}</span>
                    <span className="label-count">{count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insights del dataset */}
      <div className="dataset-insights">
        <h3>💡 Insights del Dataset</h3>
        <div className="insights-content">
          <div className="insight-item">
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <h4>Distribución Balanceada</h4>
              <p>
                El dataset muestra una distribución {data.domain_distribution?.counts ? 
                  (Object.values(data.domain_distribution.counts).some(count => count > 1000) ? 
                  'relativamente balanceada' : 'desbalanceada') : 'desconocida'} entre los diferentes dominios médicos, 
                lo que es típico en datasets biomédicos reales.
              </p>
            </div>
          </div>
          
          <div className="insight-item">
            <div className="insight-icon">📝</div>
            <div className="insight-content">
              <h4>Longitud de Texto</h4>
              <p>
                Los títulos tienen una longitud promedio de {data.text_statistics?.title_stats ? 
                  Math.round(data.text_statistics.title_stats.mean) : 'N/A'} caracteres, 
                mientras que los abstracts promedian {data.text_statistics?.abstract_stats ? 
                  Math.round(data.text_statistics.abstract_stats.mean) : 'N/A'} caracteres, 
                proporcionando suficiente contexto para la clasificación.
              </p>
            </div>
          </div>
          
          <div className="insight-item">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <h4>Calidad del Dataset</h4>
              <p>
                Con {data.basic_info.total_records.toLocaleString()} registros y 
                {data.label_analysis?.unique_labels || 'N/A'} etiquetas únicas, 
                este dataset proporciona una base sólida para entrenar un modelo de clasificación 
                biomédica robusto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
