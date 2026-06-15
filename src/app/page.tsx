'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import TablaObras from '@/components/TablaObras'
import FuentesDatos from '@/components/FuentesDatos'
import GraficoSemaforo from '@/components/GraficoSemaforo'
import GraficoSegmentos from '@/components/GraficoSegmentos'
import GraficoProvincias from '@/components/GraficoProvincias'

const Mapa = dynamic(() => import('@/components/Mapa'), { ssr: false })

interface Stats {
  total: number
  rojos: number
  ambares: number
  verdes: number
  enEjecucion: number
  inversionTotal: number
  poblacionBenef: number
  paralizacionLegal: number
  porProvincia: any[]
  porSegmento: any[]
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        style={{
          background: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-default)',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 16,
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.3)',
            }}
          >
            Y
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              YakuLab
            </span>
            <span
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginLeft: 10,
                letterSpacing: '0.02em',
              }}
            >
              Dashboard de Saneamiento
            </span>
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            background: 'var(--bg-glass)',
            padding: '5px 12px',
            borderRadius: 20,
            border: '1px solid var(--border-default)',
          }}
        >
          Hackatón Transformagob 2026 · Reto MVCS
        </div>
      </header>

      <main style={{ padding: '24px 28px', maxWidth: 1440, margin: '0 auto' }}>
        
        {/* Panel de Integración de Datos */}
        <FuentesDatos />

        {/* Stats Cards */}
        <div
          className="animate-fade-in-up stagger-2"
          style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}
        >
          <StatCard label="Total de obras" value={stats?.total} icon="📊" />
          <StatCard
            label="Inversión S/"
            value={stats?.inversionTotal ? `S/ ${(stats.inversionTotal / 1000000).toFixed(1)}M` : undefined}
            icon="💰"
          />
          <StatCard
            label="Paralización legal ≥180d"
            value={stats?.paralizacionLegal}
            icon="⚖️"
          />
          <StatCard
            label="Críticas"
            value={stats?.rojos}
            color="var(--semaforo-rojo)"
            bgColor="var(--semaforo-rojo-bg)"
            icon="🔴"
          />
          <StatCard
            label="En riesgo"
            value={stats?.ambares}
            color="var(--semaforo-ambar)"
            bgColor="var(--semaforo-ambar-bg)"
            icon="🟡"
          />
          <StatCard
            label="En ejecución activa"
            value={stats?.enEjecucion}
            icon="⚡"
          />
        </div>

        {/* Gráficos */}
        <div className="animate-fade-in-up stagger-3" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 16, 
          marginBottom: 24 
        }}>
          <GraficoSemaforo rojos={stats?.rojos || 0} ambares={stats?.ambares || 0} verdes={stats?.verdes || 0} />
          <GraficoSegmentos datos={stats?.porSegmento || []} />
          <GraficoProvincias datos={stats?.porProvincia || []} />
        </div>

        {/* Alert banner */}
        <div
          className="animate-fade-in-up stagger-4"
          style={{
            background:
              'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(239, 68, 68, 0.05))',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderLeft: '3px solid var(--semaforo-ambar)',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            padding: '12px 18px',
            marginBottom: 22,
            fontSize: 13,
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            lineHeight: 1.5,
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <span>
            <strong>Sistema de alerta anticipada Ley 31589:</strong>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>
              El semáforo marca ÁMBAR a los 45 días de inactividad — 135 días antes de que la obra
              entre en paralización legal (180 días).
            </span>
          </span>
        </div>

        <div className="animate-fade-in-up stagger-5" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Mapa Territorial */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Mapa Territorial de Riesgo
              </h2>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, var(--border-default) 0%, transparent 100%)' }}></div>
            </div>
            <div
              style={{
                height: 600,
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <Mapa />
            </div>
          </div>

          {/* Tabla de Obras */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Explorador de Obras
              </h2>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, var(--border-default) 0%, transparent 100%)' }}></div>
            </div>
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
                padding: 22,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <TablaObras />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          style={{
            marginTop: 40,
            textAlign: 'center',
            fontSize: 11,
            color: 'var(--text-muted)',
            paddingBottom: 20,
            lineHeight: 1.6,
          }}
        >
          Dashboard desarrollado para la Hackatón Transformagob 2026<br/>
          Fuentes: Invierte.pe (MEF) · INFOBRAS (Contraloría) · SEACE (OSCE) · INEI · Datos abiertos del
          Estado Peruano · D.L. 1412
        </footer>
      </main>
    </div>
  )
}

/* ── Stat Card Component ── */
function StatCard({
  label,
  value,
  color,
  bgColor,
  icon,
}: {
  label: string
  value?: number | string
  color?: string
  bgColor?: string
  icon?: string
}) {
  return (
    <div
      style={{
        background: bgColor || 'var(--bg-glass)',
        border: `1px solid ${color ? `${color}33` : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        flex: 1,
        minWidth: 140,
        backdropFilter: 'blur(8px)',
        transition: 'all var(--transition-normal)',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = color
          ? `0 4px 16px ${color}22`
          : 'var(--shadow-glow)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
        <span style={{ fontSize: 11, color: color || 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: color || 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}
      >
        {value != null ? (typeof value === 'number' ? value.toLocaleString('es-PE') : value) : '—'}
      </div>
    </div>
  )
}
