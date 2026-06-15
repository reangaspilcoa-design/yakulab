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

function getScoreColor(score: number): string {
  if (score >= 60) return '#ef4444'
  if (score >= 45) return '#f97316'
  if (score >= 30) return '#f59e0b'
  if (score >= 15) return '#84cc16'
  return '#22c55e'
}

function getScoreOpacity(score: number): number {
  if (score >= 60) return 0.55
  if (score >= 45) return 0.45
  if (score >= 30) return 0.35
  if (score >= 15) return 0.25
  return 0.15
}

export default function Mapa() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'TODOS' | 'ROJO' | 'AMBAR' | 'VERDE'>('TODOS')
  const [conteos, setConteos] = useState({ total: 0, ROJO: 0, AMBAR: 0, VERDE: 0 })
  const markersRef = useRef<any[]>([])
  const [capas, setCapas] = useState({
    coropleta: true,
    zonasCriticas: true,
    obras: true,
  })
  const capasLayersRef = useRef<{ coropleta: any; zonasCriticas: any }>({
    coropleta: null,
    zonasCriticas: null,
  })

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
        center: [-5.2, -80.6],
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

      // ── CAPA 1: Coropleta de riesgo por distrito ──
      try {
        const geoRes = await fetch('/distritos_riesgo.geojson')
        if (geoRes.ok) {
          const geoData = await geoRes.json()
          const coropleta = L.geoJSON(geoData, {
            style: (feature: any) => {
              const score = feature.properties.score_promedio || 0
              return {
                fillColor: getScoreColor(score),
                fillOpacity: getScoreOpacity(score),
                color: 'rgba(255,255,255,0.15)',
                weight: 0.8,
              }
            },
            onEachFeature: (feature: any, layer: any) => {
              const p = feature.properties
              const invParalizada = p.inversion_paralizada
                ? `S/ ${(p.inversion_paralizada / 1000000).toFixed(1)}M`
                : 'S/ 0'
              layer.bindPopup(`
                <div style="font-family:'Inter',sans-serif;font-size:13px;max-width:260px;line-height:1.6;color:#e2e8f0">
                  <strong style="display:block;font-size:15px;margin-bottom:6px;color:#f1f5f9">${p.distrito_nombre || '—'}</strong>
                  <span style="color:#94a3b8">${p.provincia_nombre}</span><br/>
                  <div style="display:flex;gap:12px;margin:8px 0;flex-wrap:wrap">
                    <span style="background:rgba(239,68,68,0.15);color:#ef4444;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600">🔴 ${p.obras_rojo} rojas</span>
                    <span style="background:rgba(245,158,11,0.15);color:#f59e0b;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600">🟡 ${p.obras_ambar || 0} ámbar</span>
                  </div>
                  <span style="color:#94a3b8;font-size:12px">Score promedio: <strong style="color:${getScoreColor(p.score_promedio)}">${p.score_promedio}/100</strong></span><br/>
                  <span style="color:#94a3b8;font-size:12px">Inversión paralizada: <strong style="color:#f1f5f9">${invParalizada}</strong></span><br/>
                  <small style="color:#64748b">Total obras: ${p.obras_total}</small>
                </div>
              `)
              layer.on('mouseover', function (e: any) {
                e.target.setStyle({
                  weight: 2,
                  color: '#a5b4fc',
                  fillOpacity: getScoreOpacity(p.score_promedio || 0) + 0.15,
                })
              })
              layer.on('mouseout', function (e: any) {
                coropleta.resetStyle(e.target)
              })
            },
          }).addTo(map)
          capasLayersRef.current.coropleta = coropleta
        }
      } catch {}

      // ── CAPA 2: Zonas críticas (24 distritos más graves) ──
      try {
        const zcRes = await fetch('/zonas_criticas.geojson')
        if (zcRes.ok) {
          const zcData = await zcRes.json()
          const zonasCriticas = L.geoJSON(zcData, {
            style: {
              color: '#ef4444',
              weight: 2,
              fillColor: '#ef4444',
              fillOpacity: 0.08,
              dashArray: '6 3',
            },
          }).addTo(map)
          capasLayersRef.current.zonasCriticas = zonasCriticas
        }
      } catch {}

      // ── CAPA 3: Puntos de obras (desde API / Supabase) ──
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

  // Toggle capas
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const { coropleta, zonasCriticas } = capasLayersRef.current

    if (coropleta) {
      if (capas.coropleta && !map.hasLayer(coropleta)) coropleta.addTo(map)
      if (!capas.coropleta && map.hasLayer(coropleta)) map.removeLayer(coropleta)
    }
    if (zonasCriticas) {
      if (capas.zonasCriticas && !map.hasLayer(zonasCriticas)) zonasCriticas.addTo(map)
      if (!capas.zonasCriticas && map.hasLayer(zonasCriticas)) map.removeLayer(zonasCriticas)
    }

    markersRef.current.forEach(marker => {
      if (capas.obras) {
        if (filtro === 'TODOS' || marker._semaforo === filtro) {
          if (!map.hasLayer(marker)) marker.addTo(map)
        }
      } else {
        if (map.hasLayer(marker)) map.removeLayer(marker)
      }
    })
  }, [capas, filtro])

  const toggleCapa = (capa: keyof typeof capas) => {
    setCapas(prev => ({ ...prev, [capa]: !prev[capa] }))
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Controls panel */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1000,
          background: 'rgba(17, 24, 39, 0.9)',
          backdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-default)',
          fontSize: 13,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          minWidth: 185,
        }}
      >
        {/* Capas section */}
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
          Capas del mapa
        </div>
        {([
          { key: 'coropleta' as const, label: '🗺️ Coropleta de riesgo', color: '#6366f1' },
          { key: 'zonasCriticas' as const, label: '🔴 Zonas críticas (24)', color: '#ef4444' },
          { key: 'obras' as const, label: '📍 Puntos de obras', color: '#94a3b8' },
        ]).map(c => (
          <button
            key={c.key}
            onClick={() => toggleCapa(c.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: capas[c.key] ? 'rgba(255,255,255,0.06)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 6,
              padding: '5px 8px',
              textAlign: 'left',
              fontSize: 12,
              transition: 'all 150ms ease',
              fontFamily: 'inherit',
              opacity: capas[c.key] ? 1 : 0.5,
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                flexShrink: 0,
                background: capas[c.key] ? c.color : 'transparent',
                border: `2px solid ${c.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                color: '#fff',
              }}
            >
              {capas[c.key] ? '✓' : ''}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>{c.label}</span>
          </button>
        ))}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border-default)', margin: '6px 0' }} />

        {/* Semáforo filter */}
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

      {/* Legend — bottom left */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: 12,
          zIndex: 1000,
          background: 'rgba(17, 24, 39, 0.9)',
          backdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-default)',
          fontSize: 11,
        }}
      >
        <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Score de riesgo distrital
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { label: '<15', color: '#22c55e' },
            { label: '15-29', color: '#84cc16' },
            { label: '30-44', color: '#f59e0b' },
            { label: '45-59', color: '#f97316' },
            { label: '≥60', color: '#ef4444' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ width: 28, height: 10, background: item.color, opacity: 0.7, borderRadius: i === 0 ? '3px 0 0 3px' : i === 4 ? '0 3px 3px 0' : 0 }} />
              <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <span style={{ width: 14, height: 2, background: '#ef4444', display: 'inline-block', borderTop: '1px dashed #ef4444' }} />
          <span style={{ color: 'var(--text-muted)' }}>Zona crítica</span>
        </div>
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
          Cargando mapa territorial...
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
