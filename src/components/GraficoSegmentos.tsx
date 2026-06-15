'use client'

interface SegmentoStats {
  segmento: string
  total: number
  rojos: number
  ambares: number
  verdes: number
}

interface Props {
  datos: SegmentoStats[]
}

const LABELS: Record<string, string> = {
  'EN_EJECUCION_ACTIVA': 'En Ejecución Activa',
  'EN_LIQUIDACION': 'En Liquidación',
  'EN_FORMULACION': 'En Formulación',
  'SIN_EXPEDIENTE': 'Sin Expediente'
}

export default function GraficoSegmentos({ datos }: Props) {
  const maxTotal = Math.max(...(datos.length > 0 ? datos.map(d => d.total) : [1]))

  const sortedDatos = [...datos].sort((a, b) => {
    // Custom sort: Ejecucion activa first, then descending by total
    if (a.segmento === 'EN_EJECUCION_ACTIVA') return -1
    if (b.segmento === 'EN_EJECUCION_ACTIVA') return 1
    return b.total - a.total
  })

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
        Obras por Segmento
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, justifyContent: 'center' }}>
        {sortedDatos.map(d => {
          const isActiva = d.segmento === 'EN_EJECUCION_ACTIVA'
          const pctWidth = Math.max(2, (d.total / maxTotal) * 100)
          
          return (
            <div key={d.segmento} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 12 }}>
                <span style={{ 
                  color: isActiva ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isActiva ? 600 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {isActiva && <span style={{ fontSize: 14 }}>⚡</span>}
                  {LABELS[d.segmento] || d.segmento}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.total}</span>
              </div>
              
              <div style={{ 
                height: 12, 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: 6,
                overflow: 'hidden',
                display: 'flex'
              }}>
                <div style={{ 
                  width: `${pctWidth}%`, 
                  display: 'flex',
                  height: '100%'
                }}>
                  {/* Stacked bar colors */}
                  {d.rojos > 0 && <div style={{ width: `${(d.rojos/d.total)*100}%`, background: 'var(--semaforo-rojo)', height: '100%' }} title={`Rojos: ${d.rojos}`}></div>}
                  {d.ambares > 0 && <div style={{ width: `${(d.ambares/d.total)*100}%`, background: 'var(--semaforo-ambar)', height: '100%' }} title={`Ámbares: ${d.ambares}`}></div>}
                  {d.verdes > 0 && <div style={{ width: `${(d.verdes/d.total)*100}%`, background: 'var(--semaforo-verde)', height: '100%' }} title={`Verdes: ${d.verdes}`}></div>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, textAlign: 'center', fontStyle: 'italic' }}>
        * Ley 31589 aplica principalmente a obras en ejecución activa.
      </div>
    </div>
  )
}
