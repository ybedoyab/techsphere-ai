"use client"

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TrainingView from '@/components/TrainingView'
import DatasetUpload from '@/components/DatasetUpload'
import DashboardOverview from '@/components/DashboardOverview'
import MetricsView from '@/components/MetricsView'
import AnalysisView from '@/components/AnalysisView'
import DemoView from '@/components/DemoView'
import PredictionsView from '@/components/PredictionsView'
import { V0Data } from '@/types/v0-data'

export default function Home() {
  const [data, setData] = useState<V0Data | null>(null)
  const [hasDataset, setHasDataset] = useState(false)
  const [isModelTrained, setIsModelTrained] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')

  // Restore persisted state on mount
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      const viewParam = sp.get('view')
      if (viewParam) {
        setActiveSection(viewParam)
      }
      const storedDataset = localStorage.getItem('v0_dataset')
      const storedHasDataset = localStorage.getItem('v0_hasDataset')
      const storedTrained = localStorage.getItem('v0_isModelTrained')
      const storedSection = localStorage.getItem('v0_activeSection')
      if (storedDataset) {
        setData(JSON.parse(storedDataset))
      }
      if (storedHasDataset) {
        setHasDataset(storedHasDataset === 'true')
      }
      if (storedTrained) {
        setIsModelTrained(storedTrained === 'true')
      }
      if (storedSection && !viewParam) {
        setActiveSection(storedSection)
      }
    } catch {}
  }, [])

  // Persist active section
  useEffect(() => {
    try { localStorage.setItem('v0_activeSection', activeSection) } catch {}
  }, [activeSection])

  const handleDatasetUploaded = (uploadedData: V0Data) => {
    setData(uploadedData)
    setHasDataset(true)
    try {
      localStorage.setItem('v0_dataset', JSON.stringify(uploadedData))
      localStorage.setItem('v0_hasDataset', 'true')
    } catch {}
  }

  const handleModelTrained = () => {
    setIsModelTrained(true)
    try { localStorage.setItem('v0_isModelTrained', 'true') } catch {}
  }

  const handleResetAll = () => {
    setData(null)
    setHasDataset(false)
    setIsModelTrained(false)
    setActiveSection('overview')
    try {
      localStorage.removeItem('v0_dataset')
      localStorage.removeItem('v0_hasDataset')
      localStorage.removeItem('v0_isModelTrained')
      // keep last section optional
    } catch {}
  }

  const handleBackToOverview = () => {
    setActiveSection('overview')
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="overview-section">
            <div className="section-header">
              <h1>Dashboard de Análisis Biomédico</h1>
              <p>Clasificación y análisis de artículos médicos - Challenge IA Biomédica</p>
            </div>
            
            {hasDataset && data ? (
              <DashboardOverview 
                data={data} 
                onSectionChange={setActiveSection} 
              />
            ) : (
              <div className="overview-grid">
                <div className="overview-card">
                  <div className="card-icon">📊</div>
                  <h3>Estado del Sistema</h3>
                  <p>Sin dataset cargado</p>
                  <div className="status-badge warning">
                    Pendiente
                  </div>
                </div>
                
                <div className="overview-card">
                  <div className="card-icon">📁</div>
                  <h3>Dataset</h3>
                  <p>No cargado</p>
                  <div className="card-action">
                    <button 
                      onClick={() => setActiveSection('upload')}
                      className="action-btn"
                    >
                      Cargar Dataset
                    </button>
                  </div>
                </div>
                
                <div className="overview-card">
                  <div className="card-icon">🤖</div>
                  <h3>Modelo</h3>
                  <p>Requiere dataset</p>
                  <div className="card-action">
                    <button 
                      onClick={() => setActiveSection('upload')}
                      className="action-btn"
                      disabled={true}
                    >
                      Entrenar
                    </button>
                  </div>
                </div>
                
                <div className="overview-card">
                  <div className="card-icon">🎯</div>
                  <h3>Demo</h3>
                  <p>Clasificación en tiempo real</p>
                  <div className="card-action">
                    <button 
                      onClick={() => setActiveSection('upload')}
                      className="action-btn"
                      disabled={true}
                    >
                      Probar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      
      case 'upload':
        return (
          <div className="upload-section">
            <div className="section-header">
              <h2>Subir Dataset</h2>
              <p>Carga tu archivo CSV con artículos médicos para comenzar el análisis</p>
            </div>
            <DatasetUpload onDatasetUploaded={handleDatasetUploaded} />
          </div>
        )
      
      case 'training':
        return (
          <TrainingView 
            onBack={handleBackToOverview} 
            onModelTrained={handleModelTrained}
          />
        )
      
      case 'metrics':
        return (
          hasDataset && isModelTrained ? (
            <MetricsView onBack={handleBackToOverview} />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📈</div>
              <h3>Métricas no disponibles</h3>
              <p>{!hasDataset ? 'Primero debes cargar un dataset' : 'Primero debes entrenar el modelo'}</p>
              <button 
                onClick={() => setActiveSection(!hasDataset ? 'upload' : 'training')}
                className="primary-btn"
              >
                {!hasDataset ? 'Cargar Dataset' : 'Entrenar Modelo'}
              </button>
            </div>
          )
        )
      
      case 'analysis':
        return (
          hasDataset && data && isModelTrained ? (
            <AnalysisView data={data} onBack={handleBackToOverview} />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>Análisis no disponible</h3>
              <p>{!hasDataset ? 'Primero debes cargar un dataset' : !isModelTrained ? 'Primero debes entrenar el modelo' : 'No hay datos para analizar'}</p>
              <button 
                onClick={() => setActiveSection(!hasDataset ? 'upload' : 'training')}
                className="primary-btn"
              >
                {!hasDataset ? 'Cargar Dataset' : 'Entrenar Modelo'}
              </button>
            </div>
          )
        )
      
      case 'demo':
        return (
          hasDataset && isModelTrained ? (
            <DemoView onBack={handleBackToOverview} />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>Demo no disponible</h3>
              <p>{!hasDataset ? 'Primero debes cargar un dataset' : 'Primero debes entrenar el modelo'}</p>
              <button 
                onClick={() => setActiveSection(!hasDataset ? 'upload' : 'training')}
                className="primary-btn"
              >
                {!hasDataset ? 'Cargar Dataset' : 'Entrenar Modelo'}
              </button>
            </div>
          )
        )
      
      case 'predictions':
        return (
          hasDataset && isModelTrained ? (
            <PredictionsView onBack={handleBackToOverview} />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>Predicciones no disponibles</h3>
              <p>{!hasDataset ? 'Primero debes cargar un dataset' : 'Primero debes entrenar el modelo'}</p>
              <button 
                onClick={() => setActiveSection(!hasDataset ? 'upload' : 'training')}
                className="primary-btn"
              >
                {!hasDataset ? 'Cargar Dataset' : 'Entrenar Modelo'}
              </button>
            </div>
          )
        )
      
      default:
        return null
    }
  }

  // Información del dataset para la sidebar
  const datasetInfo = hasDataset && data ? {
    name: 'challenge_data-18-ago.csv',
    records: (data as any).basic_info?.total_records || 0
  } : undefined

  return (
    <div className="app-layout">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        hasDataset={hasDataset}
        isModelTrained={isModelTrained}
        datasetInfo={datasetInfo}
        onReset={handleResetAll}
      />
      <main className="main-content">
        {renderSection()}
      </main>
    </div>
  )
}
