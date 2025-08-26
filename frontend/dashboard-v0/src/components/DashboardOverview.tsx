"use client"

import { V0Data } from '@/types/v0-data'

interface DashboardOverviewProps {
  data: V0Data
  onSectionChange: (section: string) => void
}

export default function DashboardOverview({ data, onSectionChange }: DashboardOverviewProps) {
  return (
    <div className="dashboard-overview">
      {/* Métricas principales */}
      <div className="metrics-section">
        <h3>Métricas del Dataset</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <div className="metric-value">{data.basic_info.total_records}</div>
              <div className="metric-label">Total de Registros</div>
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">🏷️</div>
            <div className="metric-content">
              <div className="metric-value">{data.label_analysis?.unique_labels || 'N/A'}</div>
              <div className="metric-label">Etiquetas Únicas</div>
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">📝</div>
            <div className="metric-content">
              <div className="metric-value">
                {data.text_statistics?.title_stats ? 
                  Math.round(data.text_statistics.title_stats.mean) : 'N/A'}
              </div>
              <div className="metric-label">Longitud Promedio Título</div>
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">📄</div>
            <div className="metric-content">
              <div className="metric-value">
                {data.text_statistics?.abstract_stats ? 
                  Math.round(data.text_statistics.abstract_stats.mean) : 'N/A'}
              </div>
              <div className="metric-label">Longitud Promedio Abstract</div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por dominio */}
      <div className="domain-section">
        <h3>Distribución por Dominio Médico</h3>
        <div className="domain-chart">
          {data.domain_distribution?.counts && Object.entries(data.domain_distribution.counts).map(([domain, count]: [string, number]) => {
            const percentage = data.domain_distribution?.percentages?.[domain] || 0
            
            return (
              <div key={domain} className="domain-bar-item">
                <div className="domain-label">
                  <span className="domain-name">{domain}</span>
                  <span className="domain-count">{count}</span>
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

      {/* Acciones rápidas */}
      <div className="quick-actions">
        <h3>Acciones Rápidas</h3>
        <div className="actions-grid">
          <button 
            onClick={() => onSectionChange('training')}
            className="action-card"
          >
            <div className="action-icon">🤖</div>
            <div className="action-content">
              <h4>Entrenar Modelo</h4>
              <p>Inicia el entrenamiento del clasificador</p>
            </div>
          </button>
          
          <button 
            onClick={() => onSectionChange('demo')}
            className="action-card"
          >
            <div className="action-icon">🎯</div>
            <div className="action-content">
              <h4>Probar Clasificación</h4>
              <p>Testea el modelo con nuevos textos</p>
            </div>
          </button>
          
          <button 
            onClick={() => onSectionChange('analysis')}
            className="action-card"
          >
            <div className="action-icon">🔍</div>
            <div className="action-content">
              <h4>Análisis Detallado</h4>
              <p>Explora estadísticas avanzadas</p>
            </div>
          </button>
          
          <button 
            onClick={() => onSectionChange('metrics')}
            className="action-card"
          >
            <div className="action-icon">📈</div>
            <div className="action-content">
              <h4>Ver Métricas</h4>
              <p>Rendimiento del modelo</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
