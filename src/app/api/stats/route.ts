import obrasData from '../../../../YAKULAB_DATA.json'

export async function GET() {
  const obras = obrasData as any[];

  let total = 0;
  let rojos = 0;
  let ambares = 0;
  let verdes = 0;
  let enEjecucion = 0;
  let inversionTotal = 0;
  let poblacionBenef = 0;
  let paralizacionLegal = 0;

  const porProvincia: Record<string, { provincia: string; total: number; rojos: number; ambares: number; verdes: number }> = {};
  const porSegmento: Record<string, { segmento: string; total: number; rojos: number; ambares: number; verdes: number }> = {};

  obras.forEach(o => {
    total++;
    if (o.semaforo === 'ROJO') rojos++;
    if (o.semaforo === 'AMBAR') ambares++;
    if (o.semaforo === 'VERDE') verdes++;
    if (o.segmento === 'EN_EJECUCION_ACTIVA') enEjecucion++;
    if (o.diasSinDevengado !== null && o.diasSinDevengado >= 180 && o.diasSinDevengado !== 999) paralizacionLegal++;

    inversionTotal += o.costoActualizado || 0;
    poblacionBenef += o.numHabitantesBenef || 0;

    const prov = o.provincia || 'DESCONOCIDA';
    if (!porProvincia[prov]) porProvincia[prov] = { provincia: prov, total: 0, rojos: 0, ambares: 0, verdes: 0 };
    porProvincia[prov].total++;
    if (o.semaforo === 'ROJO') porProvincia[prov].rojos++;
    if (o.semaforo === 'AMBAR') porProvincia[prov].ambares++;
    if (o.semaforo === 'VERDE') porProvincia[prov].verdes++;

    const seg = o.segmento || 'OTRO';
    if (!porSegmento[seg]) porSegmento[seg] = { segmento: seg, total: 0, rojos: 0, ambares: 0, verdes: 0 };
    porSegmento[seg].total++;
    if (o.semaforo === 'ROJO') porSegmento[seg].rojos++;
    if (o.semaforo === 'AMBAR') porSegmento[seg].ambares++;
    if (o.semaforo === 'VERDE') porSegmento[seg].verdes++;
  });

  return Response.json({
    total,
    rojos,
    ambares,
    verdes,
    enEjecucion,
    inversionTotal,
    poblacionBenef,
    paralizacionLegal,
    porProvincia: Object.values(porProvincia),
    porSegmento: Object.values(porSegmento)
  })
}
