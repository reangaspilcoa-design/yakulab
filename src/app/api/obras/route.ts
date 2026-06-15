import { type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const semaforo  = searchParams.get('semaforo')
  const segmento  = searchParams.get('segmento')
  const provincia = searchParams.get('provincia')
  const mapa      = searchParams.get('mapa') // si mapa=1, solo campos para el mapa

  const where: Record<string, string> = {}
  if (semaforo)  where.semaforo  = semaforo
  if (segmento)  where.segmento  = segmento
  if (provincia) where.provincia = provincia

  // Para el mapa: solo campos ligeros (lat/lon/semaforo/score/alerta)
  const select = mapa === '1' ? {
    id: true,
    codigoUnico: true,
    nombreInversion: true,
    provincia: true,
    distrito: true,
    latitud: true,
    longitud: true,
    semaforo: true,
    scoreRiesgo: true,
    alertaTexto: true,
    diasSinDevengado: true,
    fuenteCoord: true,
    segmento: true,
  } : undefined

  const obras = await prisma.obra.findMany({
    where,
    ...(select ? { select } : {}),
    orderBy: { scoreRiesgo: 'desc' },
    take: 2000,
  })

  return Response.json({ obras, total: obras.length })
}
