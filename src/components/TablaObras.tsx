'use client'

import { useEffect, useState } from 'react'

interface Obra {
  id: number
  codigoUnico: string
  nombreInversion: string
  provincia: string
  distrito: string | null
  semaforo: string
  scoreRiesgo: number
  alertaTexto: string
  costoActualizado: number | null
  segmento: string
  diasSinDevengado: number | null
}

const SEMAFORO_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  ROJO: { bg: 'var(--semaforo-rojo-bg)', text: 'var(--semaforo-rojo)', dot: '🔴' },
  AMBAR: { bg: 'var(--semaforo-ambar-bg)', text: 'var(--semaforo-ambar)', dot: '🟡' },
  VERDE: { bg: 'var(--semaforo-verde-bg)', text: 'var(--semaforo-verde)', dot: '🟢' },
}

export default function TablaObras() {
  const [obras, setObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroSemaforo, setFiltroSemaforo] = useState('ROJO')
  const [filtroSegmento, setFiltroSegmento] = useState('EN_EJECUCION_ACTIVA')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filtroSemaforo !== 'TODOS') params.set('semaforo', filtroSemaforo)
    if (filtroSegmento !== 'TODOS') params.set('segmento', filtroSegmento)

    fetch(`/api/obras?${params}`)
      .then(r => r.json())
      .then(d => {
        setObras(d.obras)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [filtroSemaforo, filtroSegmento])

  const obrasFiltradas = obras.filter(
    o =>
      busqueda === '' ||
      o.nombreInversion.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.provincia.toLowerCase().includes(busqueda.toLowerCase()) ||
      (o.distrito || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const formatSoles = (n: number | null) =>
    n == null ? '—' : `S/ ${n.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`

  const formatDias = (d: number | null) =>
    d === 999 ? 'Sin registro' : d == null ? '—' : `${d}d`

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid var(--border-default)',
    fontSize: 13,
    background: 'var(--bg-glass)',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
      {/* Filtros */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          placeholder="🔍 Buscar obra, provincia o distrito..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            ...inputStyle,
            flex: 1,
            minWidth: 220,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
        />
        <select
          value={filtroSemaforo}
          onChange={e => setFiltroSemaforo(e.target.value)}
          style={inputStyle}
        >
          <option value="TODOS">Todos los semáforos</option>
          <option value="ROJO">🔴 Rojo</option>
          <option value="AMBAR">🟡 Ámbar</option>
          <option value="VERDE">🟢 Verde</option>
        </select>
        <select
          value={filtroSegmento}
          onChange={e => setFiltroSegmento(e.target.value)}
          style={inputStyle}
        >
          <option value="TODOS">Todos los segmentos</option>
          <option value="EN_EJECUCION_ACTIVA">En ejecución activa</option>
          <option value="EN_LIQUIDACION">En liquidación</option>
          <option value="EN_FORMULACION">En formulación</option>
          <option value="SIN_EXPEDIENTE">Sin expediente</option>
        </select>
        <span
          style={{
            color: 'var(--text-muted)',
            fontSize: 12,
            whiteSpace: 'nowrap',
            background: 'var(--bg-glass)',
            padding: '5px 10px',
            borderRadius: 20,
            border: '1px solid var(--border-default)',
          }}
        >
          {loading ? '⏳ Cargando...' : `${obrasFiltradas.length} obras`}
        </span>
      </div>

      {/* Tabla */}
      <div
        style={{
          overflowX: 'auto',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid var(--border-default)',
              }}
            >
              {[
                'Semáf.',
                'Obra',
                'Provincia / Distrito',
                'Score',
                'Alerta',
                'Costo',
                'Sin devengar',
              ].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '12px 14px',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: 40,
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 20,
                      height: 20,
                      border: '2px solid var(--border-default)',
                      borderTopColor: 'var(--accent-blue)',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      marginRight: 8,
                      verticalAlign: 'middle',
                    }}
                  />
                  Cargando...
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </td>
              </tr>
            ) : obrasFiltradas.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: 40,
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  Sin resultados
                </td>
              </tr>
            ) : (
              obrasFiltradas.slice(0, 200).map((obra, i) => {
                const sc = SEMAFORO_STYLE[obra.semaforo] || {
                  bg: 'var(--bg-glass)',
                  text: 'var(--text-muted)',
                  dot: '⚪',
                }
                return (
                  <tr
                    key={obra.id}
                    style={{
                      borderBottom: '1px solid var(--border-default)',
                      background:
                        i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={e =>
                      (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')
                    }
                    onMouseLeave={e =>
                      (e.currentTarget.style.background =
                        i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)')
                    }
                  >
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 999,
                          background: sc.bg,
                          color: sc.text,
                          fontSize: 11,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {sc.dot} {obra.semaforo}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', maxWidth: 280 }}>
                      <div
                        style={{
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          lineHeight: 1.4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          fontSize: 12,
                        }}
                      >
                        {obra.nombreInversion}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        whiteSpace: 'nowrap',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {obra.provincia}
                      <br />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {obra.distrito || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color:
                            obra.scoreRiesgo >= 60
                              ? 'var(--semaforo-rojo)'
                              : obra.scoreRiesgo >= 30
                                ? 'var(--semaforo-ambar)'
                                : 'var(--semaforo-verde)',
                        }}
                      >
                        {obra.scoreRiesgo}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        maxWidth: 220,
                        color: 'var(--text-secondary)',
                        fontSize: 12,
                        lineHeight: 1.4,
                      }}
                    >
                      {obra.alertaTexto ? obra.alertaTexto.replace('999d', 'sin registro') : '—'}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        whiteSpace: 'nowrap',
                        color: 'var(--text-primary)',
                        fontWeight: 500,
                      }}
                    >
                      {formatSoles(obra.costoActualizado)}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        whiteSpace: 'nowrap',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {formatDias(obra.diasSinDevengado)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {obrasFiltradas.length > 200 && (
        <p
          style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 12,
            marginTop: 12,
          }}
        >
          Mostrando las primeras 200 de {obrasFiltradas.length} obras
        </p>
      )}
    </div>
  )
}
