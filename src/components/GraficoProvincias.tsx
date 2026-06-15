'use client'

interface ProvinciaStats {
  provincia: string
  total: number
  rojos: number
  ambares: number
  verdes: number
}

interface Props {
  datos: ProvinciaStats[]
}

export default function GraficoProvincias({ datos }: Props) {
  // Sort by ROJO desc, then total desc
  const sortedDatos = [...datos].sort((a, b) => {
    if (a.rojos !== b.rojos) return b.rojos - a.rojos
    return b.total - a.total
  }).slice(0, 8) // Top 8

  const maxRojos = Math.max(...(sortedDatos.length > 0 ? sortedDatos.map(d => d.rojos) : [1]))

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          Riesgo por Provincia
        </h3>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-glass)', padding: '2px 8px', borderRadius: 12 }}>Top 8</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, justifyContent: 'center' }}>
        {sortedDatos.map(d => {
          const pctWidth = Math.max(2, (d.rojos / maxRojos) * 100)
          
          return (
            <div key={d.provincia} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, alignItems: 'flex-end' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 11, textTransform: 'capitalize' }}>
                  {d.provincia.toLowerCase()}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--semaforo-rojo)', fontSize: 13 }}>{d.rojos}</span>
              </div>
              
              <div style={{ 
                height: 8, 
                background: 'var(--bg-glass)', 
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${pctWidth}%`, 
                  background: 'linear-gradient(90deg, #991b1b, #ef4444)',
                  height: '100%',
                  borderRadius: 4
                }}>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
