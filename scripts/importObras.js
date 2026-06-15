// importObras.js — carga el CSV a la base de datos
// Uso: node scripts/importObras.js

const fs = require('fs')
const path = require('path')

async function main() {
  // Importar papaparse y @prisma/client dinámicamente
  const Papa = require('papaparse')
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  const BATCH_SIZE = 500
  const CSV_PATH = path.join(__dirname, '..', 'obras_piura_clean_v4.csv')

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ No se encontró el CSV en: ${CSV_PATH}`)
    console.error('   Copia obras_piura_clean_v4.csv a la raíz del proyecto')
    process.exit(1)
  }

  const csv = fs.readFileSync(CSV_PATH, 'utf-8')
  const { data, errors } = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim(),
  })

  if (errors.length > 0) {
    console.warn(`⚠️  ${errors.length} errores al parsear CSV (continuando...)`)
  }

  const toFloat = v => {
    const n = parseFloat(String(v).replace(',', '.'))
    return isNaN(n) ? null : n
  }
  const toInt = v => {
    const n = parseInt(String(v), 10)
    return isNaN(n) ? null : n
  }
  const toStr = v => {
    if (v === null || v === undefined || String(v).trim() === '' || String(v) === 'nan') return null
    return String(v).trim()
  }

  const records = data.map(r => {
    let score = toInt(r.score_riesgo)
    let semaforo = toStr(r.semaforo)
    let alerta = toStr(r.alerta_texto) || ''
    const diasSinDev = toInt(r.dias_sin_devengado)

    // Fix 1: Corregir centinela 999 (opacidad +15 en lugar de paralización +45 = -30 puntos)
    if (diasSinDev === 999 && alerta.includes('999d')) {
      if (score !== null) {
        score -= 30
        if (score >= 60) semaforo = 'ROJO'
        else if (score >= 30) semaforo = 'AMBAR'
        else semaforo = 'VERDE'
      }
      alerta = alerta.replace('Sin ejecución 999d', 'Sin devengado registrado (sin dato)')
    }

    // Fix 2: Expandir abreviaturas para mejor legibilidad en el UI
    alerta = alerta.replace(/(\d+)a sobre plazo/, '$1 años sobre plazo')

    return {
      codigoUnico:          String(r.CODIGO_UNICO || '').trim(),
      nombreInversion:      r.NOMBRE_INVERSION || '',
      entidad:              toStr(r.ENTIDAD),
      nivel:                toStr(r.NIVEL),
      estado:               toStr(r.ESTADO),
      situacion:            toStr(r.SITUACION),
      segmento:             toStr(r.segmento),
      departamento:         toStr(r.DEPARTAMENTO),
      provincia:            toStr(r.PROVINCIA),
      distrito:             toStr(r.DISTRITO),
      ubigeo:               String(r.UBIGEO || '').trim().padStart(6, '0'),
      latitud:              toFloat(r.LATITUD),
      longitud:             toFloat(r.LONGITUD),
      fuenteCoord:          toStr(r.fuente_coord),
      costoActualizado:     toFloat(r.COSTO_ACTUALIZADO),
      devenAcumulAnioAnt:   toFloat(r.DEVEN_ACUMUL_ANIO_ANT),
      saldoEjecutar:        toFloat(r.SALDO_EJECUTAR),
      avanceEjecucionProxy: toFloat(r.avance_ejecucion_proxy),
      diasSinDevengado:     diasSinDev,
      diasSobrePlazo:       toInt(r.dias_sobre_plazo),
      scoreRiesgo:          score,
      semaforo:             semaforo,
      alertaTexto:          alerta,
      numHabitantesBenef:   toFloat(r.NUM_HABITANTES_BENEF),
      desModalidad:         toStr(r.DES_MODALIDAD),
      fecIniEjecucion:      toStr(r.FEC_INI_EJECUCION),
      fecFinEjecucion:      toStr(r.FEC_FIN_EJECUCION),
      tieneF9:              toStr(r.TIENE_F9),
      tieneF8:              toStr(r.TIENE_F8),
    }
  }).filter(r => r.codigoUnico && r.codigoUnico !== '')

  console.log(`📦 ${records.length} obras parseadas del CSV`)
  console.log(`🔄 Cargando en lotes de ${BATCH_SIZE}...`)

  // Limpiar tabla antes de insertar (SQLite no soporta skipDuplicates)
  await prisma.obra.deleteMany()
  console.log('🗑️  Tabla limpiada')

  let inserted = 0
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)
    await prisma.obra.createMany({ data: batch })
    inserted += batch.length
    console.log(`   ✓ Lote ${Math.floor(i / BATCH_SIZE) + 1} — ${inserted}/${records.length}`)
  }

  const total = await prisma.obra.count()
  console.log(`\n✅ Total en BD: ${total} (esperado: 1515)`)
  if (total !== 1515) {
    console.warn(`⚠️  El total no es 1515. Revisa el CSV o si hay duplicados.`)
  }

  await prisma.$disconnect()
}

main().catch(e => {
  console.error('❌ Error:', e.message)
  process.exit(1)
})
