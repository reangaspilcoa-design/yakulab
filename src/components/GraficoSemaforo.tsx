'use client'

import { useEffect, useRef } from 'react'

interface Props {
  rojos: number
  ambares: number
  verdes: number
}

const COLORS = {
  ROJO: '#ef4444',
  AMBAR: '#f59e0b',
  VERDE: '#22c55e'
}

export default function GraficoSemaforo({ rojos, ambares, verdes }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const total = rojos + ambares + verdes
    if (total === 0) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)

    const cx = rect.width / 2
    const cy = rect.height / 2
    const radius = Math.min(cx, cy) - 10
    const innerRadius = radius * 0.65

    let startAngle = -Math.PI / 2

    const data = [
      { value: rojos, color: COLORS.ROJO, label: 'Críticas' },
      { value: ambares, color: COLORS.AMBAR, label: 'Riesgo' },
      { value: verdes, color: COLORS.VERDE, label: 'OK' }
    ]

    data.forEach(d => {
      if (d.value === 0) return
      const sliceAngle = (d.value / total) * 2 * Math.PI

      ctx.beginPath()
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle)
      ctx.arc(cx, cy, innerRadius, startAngle + sliceAngle, startAngle, true)
      ctx.closePath()

      ctx.fillStyle = d.color
      ctx.fill()

      // Add a slight gap effect
      ctx.lineWidth = 2
      ctx.strokeStyle = '#111827' // background color
      ctx.stroke()

      startAngle += sliceAngle
    })

    // Draw total in center
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#f1f5f9'
    ctx.font = 'bold 24px Inter, sans-serif'
    ctx.fillText(total.toString(), cx, cy - 8)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px Inter, sans-serif'
    ctx.fillText('obras', cx, cy + 12)

  }, [rojos, ambares, verdes])

  const total = rojos + ambares + verdes

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Distribución de Riesgo
      </h3>
      <div style={{ flex: 1, position: 'relative', minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', maxWidth: 200, maxHeight: 200 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, gap: 8 }}>
        <LegendItem color={COLORS.ROJO} label="Rojo" value={rojos} percent={total ? Math.round((rojos/total)*100) : 0} />
        <LegendItem color={COLORS.AMBAR} label="Ámbar" value={ambares} percent={total ? Math.round((ambares/total)*100) : 0} />
        <LegendItem color={COLORS.VERDE} label="Verde" value={verdes} percent={total ? Math.round((verdes/total)*100) : 0} />
      </div>
    </div>
  )
}

function LegendItem({ color, label, value, percent }: { color: string, label: string, value: number, percent: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }}></span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{percent}%</div>
    </div>
  )
}
