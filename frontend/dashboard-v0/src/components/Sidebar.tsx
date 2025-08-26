"use client"

import { useState } from 'react'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  hasDataset: boolean
  isModelTrained: boolean
  datasetInfo?: {
    name: string
    records: number
  }
}

export default function Sidebar({ activeSection, onSectionChange, hasDataset, isModelTrained, datasetInfo }: SidebarProps) {
  const menuItems = [
    {
      id: 'overview',
      label: 'Resumen',
      icon: '📊',
      description: 'Vista general del sistema',
      requiresDataset: false
    },
    {
      id: 'upload',
      label: 'Subir Dataset',
      icon: '📁',
      description: 'Cargar archivos CSV',
      requiresDataset: false
    },
    {
      id: 'training',
      label: 'Entrenamiento',
      icon: '🤖',
      description: 'Entrenar modelo',
      requiresDataset: true
    },
    {
      id: 'metrics',
      label: 'Métricas',
      icon: '📈',
      description: 'Rendimiento del modelo',
      requiresDataset: true,
      requiresTraining: true
    },
    {
      id: 'analysis',
      label: 'Análisis',
      icon: '🔍',
      description: 'Análisis de datos',
      requiresDataset: true,
      requiresTraining: true
    },
    {
      id: 'demo',
      label: 'Demo',
      icon: '🎯',
      description: 'Clasificación en tiempo real',
      requiresDataset: true,
      requiresTraining: true
    }
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🧬</span>
          <div className="logo-text">
            <h3>TechSphere AI</h3>
            <p>Biomedical Analysis</p>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-button ${activeSection === item.id ? 'active' : ''} ${(!hasDataset && item.requiresDataset) || (!isModelTrained && item.requiresTraining) ? 'disabled' : ''}`}
                onClick={() => onSectionChange(item.id)}
                title={item.description}
                disabled={(!hasDataset && item.requiresDataset) || (!isModelTrained && item.requiresTraining)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {((!hasDataset && item.requiresDataset) || (!isModelTrained && item.requiresTraining)) && (
                  <span className="lock-icon">🔒</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Estado del Dataset */}
      <div className="dataset-status">
        <div className="status-header">
          <span className="status-icon">📁</span>
          <span className="status-title">Dataset</span>
        </div>
        
        {hasDataset && datasetInfo ? (
          <div className="dataset-info">
            <div className="dataset-name">{datasetInfo.name}</div>
            <div className="dataset-records">{datasetInfo.records} registros</div>
            <div className="status-badge success">Cargado</div>
          </div>
        ) : (
          <div className="dataset-info empty">
            <div className="dataset-name">Sin dataset</div>
            <div className="dataset-records">Sube un archivo CSV</div>
            <div className="status-badge warning">Pendiente</div>
          </div>
        )}
      </div>
      
      {/* Estado del Modelo */}
      <div className="model-status">
        <div className="status-header">
          <span className="status-icon">🤖</span>
          <span className="status-title">Modelo</span>
        </div>
        
        {isModelTrained ? (
          <div className="model-info">
            <div className="model-name">Modelo Entrenado</div>
            <div className="model-status-text">Listo para usar</div>
            <div className="status-badge success">Activo</div>
          </div>
        ) : (
          <div className="model-info empty">
            <div className="model-name">Sin entrenar</div>
            <div className="model-status-text">{hasDataset ? 'Listo para entrenar' : 'Requiere dataset'}</div>
            <div className="status-badge warning">Pendiente</div>
          </div>
        )}
      </div>
      
      <div className="sidebar-footer">
        <div className="status-indicator">
          <div className={`status-dot ${hasDataset ? 'online' : 'offline'}`}></div>
          <span>{hasDataset ? 'Sistema Activo' : 'Sistema Inactivo'}</span>
        </div>
      </div>
    </div>
  )
}
