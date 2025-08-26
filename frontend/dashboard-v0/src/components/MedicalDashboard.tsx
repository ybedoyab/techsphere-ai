"use client"

import { V0Data } from '@/types/v0-data'

interface MedicalDashboardProps {
  data: V0Data
  onDatasetUploaded: (data: V0Data) => void
}

export default function MedicalDashboard({ data, onDatasetUploaded }: MedicalDashboardProps) {
  return (
    <div className="medical-dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Médico</h2>
        <p>Dataset cargado exitosamente</p>
      </div>
      
      <div className="dataset-info">
        <h3>📊 Información del Dataset</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Total de Registros:</span>
            <span className="info-value">{data.basic_info.total_records.toLocaleString()}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Etiquetas Únicas:</span>
            <span className="info-value">{data.label_analysis?.unique_labels || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Dominios Médicos:</span>
            <span className="info-value">
              {data.domain_distribution?.counts ? Object.keys(data.domain_distribution.counts).length : 'N/A'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="next-steps">
        <h3>🚀 Próximos Pasos</h3>
        <div className="steps-list">
          <div className="step-item completed">
            <span className="step-icon">✅</span>
            <span className="step-text">Dataset cargado</span>
          </div>
          <div className="step-item pending">
            <span className="step-icon">🔄</span>
            <span className="step-text">Entrenar modelo</span>
          </div>
          <div className="step-item pending">
            <span className="step-icon">📊</span>
            <span className="step-text">Ver métricas</span>
          </div>
          <div className="step-item pending">
            <span className="step-icon">🎯</span>
            <span className="step-text">Probar clasificación</span>
          </div>
        </div>
      </div>
    </div>
  )
}
