// src/lib/data-provider.ts
import { V0Data } from '@/types/v0-data'

export async function getV0Data(): Promise<V0Data> {
  try {
    const response = await fetch('/api/v0-data')
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      if (response.status === 500) {
        if (errorData.error === 'Ruta de datos no disponible') {
          throw new Error('No se pudo acceder a los datos del análisis. Verifica que se haya ejecutado correctamente.')
        } else {
          throw new Error(errorData.message || 'Error interno del servidor al procesar los datos')
        }
      } else {
        throw new Error(`Error ${response.status}: ${errorData.message || 'Error desconocido'}`)
      }
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching V0 data:', error)
    
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('Error desconocido al obtener los datos')
    }
  }
}

export function getMockV0Data(): V0Data {
  return {
    basic_info: {
      total_records: 3565,
      columns: ["title", "abstract", "group"]
    },
    domain_distribution: {
      counts: {
        "Neurological": 1785,
        "Cardiovascular": 1268,
        "Hepatorenal": 1091,
        "Oncological": 601
      },
      percentages: {
        "Neurological": 50.1,
        "Cardiovascular": 35.6,
        "Hepatorenal": 30.6,
        "Oncological": 16.9
      },
      total_domains: 4
    },
    label_analysis: {
      label_counts: {
        "Neurological": 1785,
        "Cardiovascular": 1268,
        "Hepatorenal": 1091,
        "Oncological": 601
      },
      label_percentages: {
        "Neurological": 50.1,
        "Cardiovascular": 35.6,
        "Hepatorenal": 30.6,
        "Oncological": 16.9
      },
      total_records: 3565,
      unique_labels: 4
    },
    text_statistics: {
      title_stats: {
        count: 3565,
        mean: 69.3,
        std: 15.2,
        min: 25,
        '25%': 58,
        '50%': 68,
        '75%': 80,
        max: 120
      },
      abstract_stats: {
        count: 3565,
        mean: 696.5,
        std: 125.8,
        min: 150,
        '25%': 580,
        '50%': 690,
        '75%': 800,
        max: 1200
      }
    }
  }
}
