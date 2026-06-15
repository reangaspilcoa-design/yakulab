'use client'

export default function FuentesDatos() {
  return (
    <div className="animate-fade-in-up stagger-1" style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Integración de Datos del Estado Peruano
        </h2>
        <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, var(--border-default) 0%, transparent 100%)' }}></div>
      </div>
      
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}></div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          position: 'relative'
        }}>
          <FuenteCard 
            icon="🏦" 
            entidad="MEF" 
            fuente="Invierte.pe" 
            registros="2,149 registros" 
            descripcion="Identificación, estado financiero y avance" 
          />
          <FuenteCard 
            icon="🔎" 
            entidad="Contraloría" 
            fuente="INFOBRAS" 
            registros="11,825 puntos geográficos" 
            descripcion="Coordenadas y fichas de avance físico" 
          />
          <FuenteCard 
            icon="📋" 
            entidad="OSCE" 
            fuente="SEACE" 
            registros="Vía identificadores" 
            descripcion="Procesos de contratación vinculados" 
          />
          <FuenteCard 
            icon="💰" 
            entidad="MEF Presupuesto" 
            fuente="Seguimiento PI 2026" 
            registros="5,739 registros" 
            descripcion="Contexto presupuestal de saneamiento" 
          />
          <FuenteCard 
            icon="🗺️" 
            entidad="INEI" 
            fuente="Geoservidor" 
            registros="Polígonos" 
            descripcion="Límites distritales y provinciales" 
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            padding: '12px 24px',
            borderRadius: 30,
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2)'
          }}>
            <span style={{ color: '#a5b4fc' }}>↘</span>
            <span>1,515 Obras de Saneamiento Consolidadas (Piura)</span>
            <span style={{ color: '#a5b4fc' }}>↙</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FuenteCard({ icon, entidad, fuente, registros, descripcion }: { icon: string, entidad: string, fuente: string, registros: string, descripcion: string }) {
  return (
    <div style={{
      background: 'var(--bg-glass)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      transition: 'all 0.2s ease',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)'
      e.currentTarget.style.background = 'var(--bg-glass-hover)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.borderColor = 'var(--border-default)'
      e.currentTarget.style.background = 'var(--bg-glass)'
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{entidad}</div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{fuente}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--accent-blue)', fontWeight: 500 }}>{registros}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{descripcion}</div>
    </div>
  )
}
