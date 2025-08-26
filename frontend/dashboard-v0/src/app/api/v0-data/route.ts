// src/app/api/v0-data/route.ts
import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // Intentar múltiples rutas para encontrar el archivo de datos
    const possiblePaths = [
      // Desde el directorio actual del frontend
      join(process.cwd(), '..', '..', 'backend', 'results', 'v0_analysis_data.json'),
      // Desde la raíz del workspace
      join(process.cwd(), '..', '..', '..', 'backend', 'results', 'v0_analysis_data.json'),
      // Ruta absoluta (fallback)
      '/d:/Code%2C%203D%2C%20Audio/Coding/GitHub/techsphere-ai/backend/results/v0_analysis_data.json'
    ]
    
    let data = null
    let dataPath = null
    
    for (const path of possiblePaths) {
      try {
        data = readFileSync(path, 'utf-8')
        dataPath = path
        break
      } catch (err) {
        console.log(`Failed to read from path: ${path}`)
        continue
      }
    }
    
    if (!data) {
      return NextResponse.json(
        { 
          error: 'Ruta de datos no disponible',
          message: 'No se pudo acceder al archivo v0_analysis_data.json. Verifica que el análisis se haya ejecutado correctamente.',
          details: 'Ejecuta: python main.py --export-v0 desde el directorio backend'
        },
        { status: 500 }
      )
    }
    
    console.log(`Successfully read data from: ${dataPath}`)
    const jsonData = JSON.parse(data)
    
    return NextResponse.json(jsonData)
  } catch (error) {
    console.error('Error reading V0 data:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al procesar los datos del análisis biomédico.',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
