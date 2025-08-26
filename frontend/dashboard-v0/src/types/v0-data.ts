// src/types/v0-data.ts
export interface V0Data {
  basic_info: {
    total_records: number
    columns: string[]
    memory_usage?: string
    sample_records?: Array<{
      title: string
      abstract: string
      group: string
      title_length: number
      abstract_length: number
    }>
  }
  domain_distribution: {
    counts: Record<string, number>
    percentages: Record<string, number>
    total_domains: number
  }
  label_analysis: {
    label_counts: Record<string, number>
    label_percentages: Record<string, number>
    total_records: number
    unique_labels: number
  }
  text_statistics: {
    title_stats?: {
      count: number
      mean: number
      std: number
      min: number
      '25%': number
      '50%': number
      '75%': number
      max: number
    }
    abstract_stats?: {
      count: number
      mean: number
      std: number
      min: number
      '25%': number
      '50%': number
      '75%': number
      max: number
    }
    avg_title_length?: number
    avg_abstract_length?: number
  }
  data_quality?: {
    missing_values: Record<string, number>
    duplicates: string | number
    empty_strings: Record<string, string | number>
  }
}

export interface DomainData {
  name: string
  value: number
  count: number
  color: string
}

export interface LabelData {
  name: string
  value: number
  count: number
  color: string
}

export interface LengthData {
  range: string
  count: number
}
