import '@/styles/globals.css'
import '@/styles/components.css'

export const metadata = {
  title: 'Dashboard de Análisis Biomédico',
  description: 'Clasificación y análisis de artículos médicos - Challenge IA Biomédica',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  )
}
