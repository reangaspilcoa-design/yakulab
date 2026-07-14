import { type NextRequest } from 'next/server'
import obrasData from '../../../../YAKULAB_DATA.json'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const semaforo  = searchParams.get('semaforo')
  const segmento  = searchParams.get('segmento')
  const provincia = searchParams.get('provincia')
  const mapa      = searchParams.get('mapa') // si mapa=1, solo campos para el mapa

  let obras = obrasData as any[];

  if (semaforo)  obras = obras.filter(o => o.semaforo === semaforo);
  if (segmento)  obras = obras.filter(o => o.segmento === segmento);
  if (provincia) obras = obras.filter(o => o.provincia === provincia);

  obras.sort((a, b) => (b.scoreRiesgo || 0) - (a.scoreRiesgo || 0));

  // Para el mapa: solo campos ligeros (lat/lon/semaforo/score/alerta)
  if (mapa === '1') {
    obras = obras.map(o => ({
      id: o.id,
      codigoUnico: o.codigoUnico,
      nombreInversion: o.nombreInversion,
      provincia: o.provincia,
      distrito: o.distrito,
      latitud: o.latitud,
      longitud: o.longitud,
      semaforo: o.semaforo,
      scoreRiesgo: o.scoreRiesgo,
      alertaTexto: o.alertaTexto,
      diasSinDevengado: o.diasSinDevengado,
      fuenteCoord: o.fuenteCoord,
      segmento: o.segmento,
    }));
  }

  return Response.json({ obras: obras.slice(0, 2000), total: obras.length })
}
