"use client"

import { useState, useEffect } from 'react'

interface Prediction {
  title: string
  abstract: string
  group: string
  group_predicted: string
}

interface PredictionsViewProps {
  onBack: () => void
}

export default function PredictionsView({ onBack }: PredictionsViewProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGroup, setFilterGroup] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('http://localhost:5000/api/predictions')
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.error || 'No se pudieron cargar predicciones')
        setPredictions(data.predictions as Prediction[])
      } catch (err: any) {
        setError(err.message || 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getRandomDomain = () => {
    const domains = ['Cardiología', 'Neurología', 'Oncología', 'Hepatología', 'Dermatología']
    return domains[Math.floor(Math.random() * domains.length)]
  }

  const filteredPredictions = predictions.filter(prediction => {
    const matchesSearch = prediction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prediction.abstract.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGroup = filterGroup === 'all' || 
                        prediction.group === filterGroup || 
                        prediction.group_predicted === filterGroup
    return matchesSearch && matchesGroup
  })

  const totalPages = Math.ceil(filteredPredictions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPredictions = filteredPredictions.slice(startIndex, endIndex)

  const handleDownloadCSV = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/predictions-csv')
      if (!res.ok) throw new Error('No se pudo descargar el CSV')
      const blob = await res.blob()
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.href = url
      link.download = 'predictions.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      alert('Error descargando CSV')
    }
  }

  const getAccuracyStats = () => {
    const normalize = (s: string) => (s || '').toLowerCase().trim()
    const isCorrect = (p: Prediction) => {
      const predicted = normalize(p.group_predicted)
      const truths = (p.group || '')
        .split('|')
        .map(part => normalize(part))
        .filter(Boolean)
      return truths.includes(predicted)
    }

    const total = predictions.length
    const correct = predictions.filter(isCorrect).length
    const accuracy = total ? (correct / total) * 100 : 0
    const groupStats = predictions.reduce((acc, p) => {
      if (!acc[p.group]) acc[p.group] = { total: 0, correct: 0 }
      acc[p.group].total++
      if (isCorrect(p)) acc[p.group].correct++
      return acc
    }, {} as Record<string, { total: number, correct: number }>)
    return { total, correct, accuracy, groupStats }
  }

  if (loading) {
    return (
      <div className="predictions-view">
        <div className="view-header">
          <button onClick={onBack} className="back-btn">
            ← Volver
          </button>
          <h2>Predicciones del Modelo</h2>
        </div>
        
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando predicciones del modelo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="predictions-view">
        <div className="view-header">
          <button onClick={onBack} className="back-btn">
            ← Volver
          </button>
          <h2>Predicciones del Modelo</h2>
        </div>
        
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Error al cargar predicciones</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const stats = getAccuracyStats()

  return (
    <div className="predictions-view">
      <div className="view-header">
        <button onClick={onBack} className="back-btn">
          ← Volver
        </button>
        <h2>Predicciones del Modelo</h2>
        <p>Revisa cómo el modelo clasificó cada artículo y descarga los resultados</p>
      </div>

      {/* Estadísticas generales */}
      <div className="predictions-stats">
        <h3>📊 Estadísticas de Predicciones</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-value">{stats.accuracy.toFixed(1)}%</div>
              <div className="stat-label">Precisión General</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.correct}</div>
              <div className="stat-label">Predicciones Correctas</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total de Artículos</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{(stats.total - stats.correct)}</div>
              <div className="stat-label">Predicciones Incorrectas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de filtrado y búsqueda */}
      <div className="predictions-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Buscar por título o abstract..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-section">
          <select 
            value={filterGroup} 
            onChange={(e) => setFilterGroup(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los dominios</option>
            <option value="Cardiología">Cardiología</option>
            <option value="Neurología">Neurología</option>
            <option value="Oncología">Oncología</option>
            <option value="Hepatología">Hepatología</option>
            <option value="Dermatología">Dermatología</option>
          </select>
        </div>
        
        <button onClick={handleDownloadCSV} className="download-btn">
          📥 Descargar CSV
        </button>
      </div>

      {/* Tabla de predicciones */}
      <div className="predictions-table-container">
        <table className="predictions-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Grupo Real</th>
              <th>Grupo Predicho</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {currentPredictions.map((prediction, idx) => {
              const normalize = (s: string) => (s || '').toLowerCase().trim()
              const truths = (prediction.group || '').split('|').map(t => normalize(t))
              const isCorrect = truths.includes(normalize(prediction.group_predicted))
              return (
              <tr key={`${prediction.title}-${idx}`} className={isCorrect ? 'correct' : 'incorrect'}>
                <td className="title-cell">
                  <div className="title-text">{prediction.title}</div>
                  <div className="abstract-preview">{prediction.abstract.substring(0, 100)}...</div>
                </td>
                <td>
                  <span className="group-badge real">{prediction.group}</span>
                </td>
                <td>
                  <span className={`group-badge predicted ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {prediction.group_predicted}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${isCorrect ? 'success' : 'error'}`}>
                    {isCorrect ? '✅ Correcto' : '❌ Incorrecto'}
                  </span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Anterior
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Información del archivo */}
      <div className="file-info">
        <h4>📁 Información del Archivo</h4>
        <p>
          El archivo CSV descargado incluye la columna <code>group_predicted</code> que contiene 
          las predicciones del modelo para cada artículo. Esta columna es esencial para evaluar 
          el rendimiento del modelo comparándola con la columna <code>group</code> original.
        </p>
      </div>
    </div>
  )
}
