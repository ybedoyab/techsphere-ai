"use client"

import { useState } from 'react'
import { buildApiUrl, API_CONFIG } from '@/config/api.config'

interface UploadStatus {
  isUploading: boolean
  message: string
  error: string | null
  success: boolean
}

interface DatasetUploadProps {
  onDatasetUploaded?: (data: any) => void
}

export default function DatasetUpload({ onDatasetUploaded }: DatasetUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    message: '',
    error: null,
    success: false
  })
  const [useAsDefault, setUseAsDefault] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file)
        setUploadStatus({
          isUploading: false,
          message: `Archivo seleccionado: ${file.name}`,
          error: null,
          success: false
        })
      } else {
        setUploadStatus({
          isUploading: false,
          message: '',
          error: 'Por favor selecciona un archivo CSV válido',
          success: false
        })
        setSelectedFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({
        isUploading: false,
        message: '',
        error: 'Por favor selecciona un archivo primero',
        success: false
      })
      return
    }

    setUploadStatus({
      isUploading: true,
      message: 'Subiendo dataset...',
      error: null,
      success: false
    })

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('use_as_default', useAsDefault.toString())

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_DATASET), {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setUploadStatus({
          isUploading: false,
          message: result.message || 'Dataset subido exitosamente',
          error: null,
          success: true
        })
        
        // Limpiar selección después de subida exitosa
        setSelectedFile(null)
        if (result.analysis) {
          // Crear un objeto V0Data compatible con la estructura esperada
          const v0Data = {
            basic_info: result.analysis.basic_info,
            label_analysis: result.analysis.label_analysis,
            domain_distribution: result.analysis.domain_distribution,
            text_statistics: result.analysis.text_statistics,
            data_quality: {
              missing_values: { title: 0, abstract: 0, group: 0 },
              duplicates: "0",
              empty_strings: { title: "0", abstract: "0", group: "0" }
            }
          }
          
          if (onDatasetUploaded) {
            onDatasetUploaded(v0Data)
          }
        }
      } else {
        const errorData = await response.json()
        setUploadStatus({
          isUploading: false,
          message: '',
          error: errorData.error || 'Error al subir el dataset',
          success: false
        })
      }
    } catch (error) {
      setUploadStatus({
        isUploading: false,
        message: '',
        error: 'Error de conexión al backend',
        success: false
      })
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setSelectedFile(file)
      setUploadStatus({
        isUploading: false,
        message: `Archivo seleccionado: ${file.name}`,
        error: null,
        success: false
      })
    } else {
      setUploadStatus({
        isUploading: false,
        message: '',
        error: 'Por favor suelta un archivo CSV válido',
        success: false
      })
    }
    setIsDragOver(false)
  }

  return (
    <div className="chart-card upload-section">
      <div className="upload-icon">📁</div>
      <h3 className="upload-title">Subir Dataset</h3>
      <p className="upload-description">
        Sube tu archivo CSV con artículos médicos para comenzar el análisis
      </p>
      
      <div className="file-input-wrapper">
        <input
          type="file"
          id="file-input"
          className="file-input"
          accept=".csv"
          onChange={handleFileChange}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
        <label htmlFor="file-input" className="file-input-label">
          {isDragOver ? 'Suelta el archivo aquí' : 'Seleccionar archivo CSV'}
        </label>
      </div>
      
      {selectedFile && (
        <div className="selected-file">
          <p><strong>Archivo seleccionado:</strong> {selectedFile.name}</p>
          <p><strong>Tamaño:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}
      
      <div className="upload-controls">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={useAsDefault}
            onChange={(e) => setUseAsDefault(e.target.checked)}
          />
          <span>Usar como dataset por defecto</span>
        </label>
        
        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={!selectedFile || uploadStatus.isUploading}
        >
          {uploadStatus.isUploading ? 'Subiendo...' : '🚀 Subir Dataset'}
        </button>
      </div>
      
      {uploadStatus.message && (
        <div className={`upload-message ${uploadStatus.success ? 'success' : 'error'}`}>
          {uploadStatus.message}
        </div>
      )}
      
      {uploadStatus.error && (
        <div className="upload-error">
          <h4>❌ Error al subir:</h4>
          <p>{uploadStatus.error}</p>
        </div>
      )}
      
      <div className="format-requirements">
        <h4>📋 Requisitos de Formato:</h4>
        <ul>
          <li>Archivo CSV con columnas: <code>title</code>, <code>abstract</code>, <code>group</code></li>
          <li>Separador automáticamente detectado (coma, punto y coma, tabulación)</li>
          <li>Tamaño máximo: 50MB</li>
          <li>Sin valores nulos en las columnas requeridas</li>
        </ul>
      </div>
      
      <div className="error-suggestions">
        <h4>🔧 Soluciones comunes:</h4>
        <ul>
          <li>Verifica que el archivo sea CSV válido</li>
          <li>Asegúrate de que las columnas tengan los nombres exactos</li>
          <li>Elimina filas con valores vacíos en las columnas requeridas</li>
          <li>Verifica que el separador sea consistente en todo el archivo</li>
        </ul>
      </div>
    </div>
  )
}
