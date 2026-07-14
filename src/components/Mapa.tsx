'use client'

import { useEffect, useRef, useState } from 'react'

interface Obra {
  id: number
  codigoUnico: string
  nombreInversion: string
  provincia: string
  distrito: string | null
  latitud: number
  longitud: number
  semaforo: string
  scoreRiesgo: number
  alertaTexto: string
  diasSinDevengado: number
  fuenteCoord: string
  segmento: string
}

const COLORS: Record<string, string> = {
  ROJO: '#ef4444',
  AMBAR: '#f59e0b',
  VERDE: '#22c55e',
}

export default function Mapa() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'TODOS' | 'ROJO' | 'AMBAR' | 'VERDE'>('TODOS')
  const [conteos, setConteos] = useState({ total: 0, ROJO: 0, AMBAR: 0, VERDE: 0 })
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (mapInstanceRef.current) return

    // Cargar Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = async () => {
      const L = (window as any).L

      if (!mapRef.current || mapInstanceRef.current) return

      const map = L.map(mapRef.current, {
        center: [-5.19, -80.63],
        zoom: 8,
        zoomControl: true,
      })

      mapInstanceRef.current = map

      // Dark tile layer — CartoDB Dark Matter
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OSM</a> · © <a href="https://carto.com/">CARTO</a>',
          maxZoom: 18,
          subdomains: 'abcd',
        }
      ).addTo(map)

      // Cargar GeoJSON si existe
      try {
        const geoRes = await fetch('/distritos_piura.geojson')
        if (geoRes.ok) {
          const geoData = await geoRes.json()
          L.geoJSON(geoData, {
            style: {
              color: '#6366f1',
              weight: 0.8,
              fillOpacity: 0.04,
              fillColor: '#6366f1',
            },
          }).addTo(map)
        }
      } catch {}

      // Cargar obras
      try {
        const res = await fetch('/api/obras?mapa=1')
        const data = await res.json()
        const obras: Obra[] = data.obras

        const cnt = { total: obras.length, ROJO: 0, AMBAR: 0, VERDE: 0 }
        obras.forEach(o => {
          if (o.semaforo in cnt) (cnt as any)[o.semaforo]++
        })
        setConteos(cnt)

        obras.forEach(obra => {
          if (!obra.latitud || !obra.longitud) return

          const color = COLORS[obra.semaforo] || '#64748b'
          const radius =
            obra.semaforo === 'ROJO' ? 7 : obra.semaforo === 'AMBAR' ? 5 : 4

          const diasTexto =
            obra.diasSinDevengado === 999
              ? 'Sin registro de ejecución'
              : `${obra.diasSinDevengado} días sin devengado`

          const precisionTexto =
            obra.fuenteCoord === 'INFOBRAS_exacto'
              ? '📍 Ubicación exacta'
              : '📌 Ubicación aprox. (centroide)'

          const marker = L.circleMarker([obra.latitud, obra.longitud], {
            radius,
            fillColor: color,
            color: 'rgba(255,255,255,0.3)',
            weight: 1,
            fillOpacity: 0.9,
          })

          marker.bindPopup(`
            <div style="font-family:'Inter',sans-serif;font-size:13px;max-width:280px;line-height:1.5;color:#e2e8f0">
              <strong style="display:block;margin-bottom:6px;color:#f1f5f9;font-size:14px">${obra.nombreInversion}</strong>
              <span style="color:#94a3b8">${obra.distrito || '—'}, ${obra.provincia}</span><br/>
              <span style="color:${color};font-weight:600">● ${obra.semaforo}</span>
              <span style="color:#64748b"> · score ${obra.scoreRiesgo}/100</span><br/>
              <span style="color:#94a3b8;font-size:12px">${(obra.alertaTexto || '').replace('999d', 'sin registro')}</span><br/>
              <small style="color:#64748b">${diasTexto} · ${precisionTexto}</small>
            </div>
          `)

          marker._semaforo = obra.semaforo
          marker.addTo(map)
          markersRef.current.push(marker)
        })

        setLoading(false)
      } catch {
        setError('Error cargando obras. ¿Está la BD conectada?')
        setLoading(false)
      }
    }
    document.head.appendChild(script)
  }, [])

  // Filtro por semáforo
  useEffect(() => {
    if (!mapInstanceRef.current) return
    markersRef.current.forEach(marker => {
      const map = mapInstanceRef.current
      if (filtro === 'TODOS' || marker._semaforo === filtro) {
        if (!map.hasLayer(marker)) marker.addTo(map)
      } else {
        if (map.hasLayer(marker)) map.removeLayer(marker)
      }
    })
  }, [filtro])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Controls panel */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1000,
          background: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-default)',
          fontSize: 13,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          minWidth: 170,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            marginBottom: 4,
            color: 'var(--text-secondary)',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Filtrar semáforo
        </div>
        {(['TODOS', 'ROJO', 'AMBAR', 'VERDE'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFiltro(s)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background:
                filtro === s ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 6,
              padding: '5px 8px',
              textAlign: 'left',
              fontSize: 12,
              transition: 'all 150ms ease',
              fontFamily: 'inherit',
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                flexShrink: 0,
                background: s === 'TODOS' ? '#64748b' : COLORS[s],
                boxShadow:
                  s !== 'TODOS' ? `0 0 6px ${COLORS[s]}66` : 'none',
              }}
            />
            <span style={{ color: 'var(--text-secondary)' }}>
              {s === 'TODOS'
                ? `Todos (${conteos.total})`
                : s === 'ROJO'
                  ? `Rojo (${conteos.ROJO})`
                  : s === 'AMBAR'
                    ? `Ámbar (${conteos.AMBAR})`
                    : `Verde (${conteos.VERDE})`}
            </span>
          </button>
        ))}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 14, 26, 0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-md)',
            fontSize: 14,
            color: 'var(--text-secondary)',
            gap: 10,
          }}
        >
          <span
            style={{
              width: 20,
              height: 20,
              border: '2px solid var(--border-default)',
              borderTopColor: 'var(--accent-blue)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          Cargando obras...
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 14, 26, 0.9)',
            borderRadius: 'var(--radius-md)',
            fontSize: 14,
            color: 'var(--semaforo-rojo)',
            padding: 20,
            textAlign: 'center',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 28 }}>⚠️</span>
          {error}
        </div>
      )}

      <div
        ref={mapRef}
        style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)' }}
      />
    </div>
  )
}
