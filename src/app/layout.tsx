import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'YakuLab — Monitoreo de obras de agua y saneamiento · Piura',
  description:
    'Plataforma de monitoreo inteligente de obras públicas de agua y saneamiento en Piura. Sistema de alerta anticipada basado en Ley 31589 con semáforo de riesgo.',
  keywords: [
    'YakuLab',
    'obras públicas',
    'agua y saneamiento',
    'Piura',
    'monitoreo',
    'semáforo de riesgo',
    'Ley 31589',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
