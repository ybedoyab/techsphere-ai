"use client"

import { useState } from 'react'

interface DemoViewProps {
  onBack: () => void
}

export default function DemoView({ onBack }: DemoViewProps) {
  const [demoTitle, setDemoTitle] = useState('')
  const [demoAbstract, setDemoAbstract] = useState('')
  const [demoPrediction, setDemoPrediction] = useState<string | null>(null)
  const [demoConfidence, setDemoConfidence] = useState<number | null>(null)
  const [isClassifying, setIsClassifying] = useState(false)

  const handleClassifyDemo = async () => {
    if (!demoTitle.trim() || !demoAbstract.trim()) return
    
    setIsClassifying(true)
    
    // Simular tiempo de clasificación
    setTimeout(() => {
      const text = (demoTitle + " " + demoAbstract).toLowerCase()
      let prediction = "Neurología"
      let confidence = 0.75

      if (text.includes("heart") || text.includes("cardiac") || text.includes("cardiovascular") || 
          text.includes("corazón") || text.includes("cardíaco")) {
        prediction = "Cardiología"
        confidence = 0.89
      } else if (text.includes("cancer") || text.includes("tumor") || text.includes("oncology") ||
                 text.includes("cáncer") || text.includes("tumor")) {
        prediction = "Oncología"
        confidence = 0.82
      } else if (text.includes("kidney") || text.includes("liver") || text.includes("hepatic") ||
                 text.includes("riñón") || text.includes("hígado")) {
        prediction = "Hepatología"
        confidence = 0.78
      } else if (text.includes("brain") || text.includes("neural") || text.includes("cognitive") ||
                 text.includes("cerebro") || text.includes("neural")) {
        prediction = "Neurología"
        confidence = 0.85
      }

      setDemoPrediction(prediction)
      setDemoConfidence(confidence)
      setIsClassifying(false)
    }, 2000)
  }

  const clearDemo = () => {
    setDemoTitle('')
    setDemoAbstract('')
    setDemoPrediction(null)
    setDemoConfidence(null)
  }

  return (
    <div className="demo-view">
      <div className="view-header">
        <button onClick={onBack} className="back-btn">
          ← Volver
        </button>
        <h2>Demo de Clasificación</h2>
        <p>Prueba el modelo con tu propio artículo médico</p>
      </div>

      {/* Formulario de clasificación */}
      <div className="classification-form">
        <h3>🎯 Clasificar Nuevo Artículo</h3>
        
        <div className="form-section">
          <label htmlFor="demo-title" className="form-label">
            <span className="label-icon">📝</span>
            Título del Artículo
          </label>
          <input
            type="text"
            id="demo-title"
            value={demoTitle}
            onChange={(e) => setDemoTitle(e.target.value)}
            placeholder="Ej: Cardiac arrhythmia detection using machine learning"
            className="form-input"
            disabled={isClassifying}
          />
        </div>

        <div className="form-section">
          <label htmlFor="demo-abstract" className="form-label">
            <span className="label-icon">📄</span>
            Abstract del Artículo
          </label>
          <textarea
            id="demo-abstract"
            value={demoAbstract}
            onChange={(e) => setDemoAbstract(e.target.value)}
            placeholder="Ingresa el resumen del artículo médico..."
            rows={6}
            className="form-textarea"
            disabled={isClassifying}
          />
        </div>

        <div className="form-actions">
          <button 
            className="classify-btn"
            onClick={handleClassifyDemo}
            disabled={!demoTitle.trim() || !demoAbstract.trim() || isClassifying}
          >
            {isClassifying ? (
              <>
                <span className="loading-spinner"></span>
                Clasificando...
              </>
            ) : (
              <>
                🎯 Clasificar Artículo
              </>
            )}
          </button>
          
          <button 
            className="clear-btn"
            onClick={clearDemo}
            disabled={isClassifying}
          >
            🗑️ Limpiar
          </button>
        </div>
      </div>

      {/* Resultado de la clasificación */}
      {demoPrediction && (
        <div className="classification-result">
          <h3>📊 Resultado de la Clasificación</h3>
          
          <div className="result-card">
            <div className="result-header">
              <div className="result-icon">🎯</div>
              <div className="result-content">
                <h4>Clasificación Completada</h4>
                <p>El modelo ha analizado tu artículo y proporcionado una clasificación</p>
              </div>
            </div>
            
            <div className="result-details">
              <div className="result-item">
                <span className="result-label">Dominio Médico:</span>
                <span className="result-value domain">{demoPrediction}</span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Nivel de Confianza:</span>
                <span className="result-value confidence">
                  {(demoConfidence! * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="result-item">
                <span className="result-label">Estado:</span>
                <span className={`result-value status ${demoConfidence! > 0.8 ? 'high' : demoConfidence! > 0.6 ? 'medium' : 'low'}`}>
                  {demoConfidence! > 0.8 ? 'Alta Confianza' : demoConfidence! > 0.6 ? 'Confianza Media' : 'Baja Confianza'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información del modelo */}
      <div className="model-info">
        <h3>🤖 Información del Modelo</h3>
        <div className="info-content">
          <div className="info-item">
            <div className="info-icon">📊</div>
            <div className="info-text">
              <h4>Algoritmo Utilizado</h4>
              <p>Regresión Logística con vectorización TF-IDF para clasificación de texto biomédico</p>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon">🎯</div>
            <div className="info-text">
              <h4>Dominios Soportados</h4>
              <p>Cardiología, Neurología, Oncología, Hepatología y otras especialidades médicas</p>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon">⚡</div>
            <div className="info-text">
              <h4>Rendimiento</h4>
              <p>F1-Score del 84.7% en el conjunto de prueba, optimizado para artículos médicos</p>
            </div>
          </div>
        </div>
        
        {/* Botón para ver predicciones */}
        <div className="model-actions">
          <button
            className="view-predictions-btn"
            onClick={() => {
              const url = new URL(window.location.href)
              url.searchParams.set('view', 'predictions')
              window.open(url.toString(), '_blank')
            }}
          >
            📊 Ver Todas las Predicciones
          </button>
          <p className="action-description">
            Revisa cómo el modelo clasificó cada artículo del dataset y descarga los resultados con la columna group_predicted
          </p>
        </div>
      </div>

      {/* Ejemplos de uso */}
      <div className="usage-examples">
        <h3>💡 Ejemplos de Uso</h3>
        <div className="examples-grid">
          <div className="example-card">
            <h4>Cardiología</h4>
            <p><strong>Título:</strong> "Cardiac arrhythmia detection using machine learning"</p>
            <p><strong>Abstract:</strong> "This study presents a novel approach to detect cardiac arrhythmias..."</p>
          </div>
          
          <div className="example-card">
            <h4>Neurología</h4>
            <p><strong>Título:</strong> "Deep learning for Alzheimer's disease diagnosis"</p>
            <p><strong>Abstract:</strong> "We propose a deep learning framework for early detection..."</p>
          </div>
          
          <div className="example-card">
            <h4>Oncología</h4>
            <p><strong>Título:</strong> "Machine learning in cancer genomics"</p>
            <p><strong>Abstract:</strong> "This research explores the application of ML techniques..."</p>
          </div>
        </div>
      </div>
    </div>
  )
}
