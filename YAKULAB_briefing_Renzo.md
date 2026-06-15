# YAKULAB — Briefing técnico para el Ingeniero de Sistemas
## Hackatón Transformagob 2026 · Reto MVCS
**Fecha:** 12 de junio de 2026 — Día 1
**Deadline inapelable:** Domingo 14 de junio · 11:59 pm · formulario Facilita Perú

---

## 0. TL;DR — lo que tienes que entregar

1. Backend Next.js + MySQL + Prisma que sirve las 1,515 obras desde el CSV
2. Mapa Leaflet de Piura con puntos coloreados por semáforo (rojo/ambar/verde)
3. Tabla filtrable de obras críticas con el campo `alerta_texto`
4. Vista por actor (MVCS, ejecutoras, supervisores, contratistas, GL)
5. Deploy en Vercel con URL pública para la demo
6. Capturas para la slide 5 del PDF

**Prioridad si el tiempo aprieta:** mapa + tabla + deploy. Las vistas por actor y los filtros avanzados son "nice to have". Un mapa con semáforo desplegado en URL pública vale más que un dashboard perfecto en localhost.

---

## 1. El archivo de datos

**Ubicación:** `/Carmelinosenacción/Yakulab/obras_piura_clean_v4.csv`
**Filas:** 1,515 · **Columnas:** 31 · **Encoding:** `utf-8-sig`

### Esquema completo

| Campo | Tipo | Notas críticas |
|---|---|---|
| `CODIGO_UNICO` | string | CUI de Invierte.pe. **Llave primaria. Sin duplicados.** |
| `NOMBRE_INVERSION` | string | Nombre del proyecto. Puede tener tildes y ñ. |
| `ENTIDAD` | string | Quién ejecuta |
| `NIVEL` | string | `GL` / `GR` / `GN` (gobierno local/regional/nacional) |
| `ESTADO` | string | Estado MEF |
| `SITUACION` | string | `APROBADO` / `VIABLE` |
| `segmento` | string | Ver tabla de segmentos abajo |
| `DEPARTAMENTO` | string | Siempre "PIURA" |
| `PROVINCIA` | string | 8 provincias |
| `DISTRITO` | string | Puede tener nulos en casos raros (ya limpiado) |
| `UBIGEO` | string | **6 dígitos con ceros a la izquierda. LEER COMO STRING.** Todos empiezan en `20`. |
| `LATITUD` | float | Nunca nula ni 0 |
| `LONGITUD` | float | Nunca nula ni 0 |
| `fuente_coord` | string | `INFOBRAS_exacto` (19 obras) o `centroide_distrito` (1,496) |
| `COSTO_ACTUALIZADO` | float | Costo vigente en soles |
| `DEVEN_ACUMUL_ANIO_ANT` | float | Devengado acumulado |
| `avance_ejecucion_proxy` | float | % de avance financiero (proxy del físico) |
| `dias_sin_devengado` | int | **`999` = sin dato, NO 999 días reales. Filtrar aparte.** |
| `dias_sobre_plazo` | int | Días que lleva vencido el plazo contractual |
| `score_riesgo` | int | 0–100 |
| `semaforo` | string | `ROJO` / `AMBAR` / `VERDE` |
| `alerta_texto` | string | Texto legible del motivo de alerta — úsalo en el tooltip y la tabla |
| `NUM_HABITANTES_BENEF` | float | **39% nulos. No usar como campo obligatorio.** |

### Gotchas que te van a ahorrar horas

1. **`UBIGEO` como string siempre.** Si lo lees como número pierdes el cero inicial (aunque todos empiezan en `20`, mantén el tipo string por consistencia con el GeoJSON de Vanessa).
2. **`dias_sin_devengado = 999` es un centinela, no un valor real.** En la UI muéstralo como "sin registro de ejecución", no como "999 días". Para ordenar/filtrar trátalo aparte.
3. **`NUM_HABITANTES_BENEF` tiene 39% de nulos.** No lo pongas como columna obligatoria en la tabla. Si quieres mostrarlo, usa "sin dato" cuando esté vacío.
4. **`DISTRITO` puede tener nulos puntuales.** Maneja el caso en el front (mostrar "—" o el nombre de la provincia).
5. **El campo `fuente_coord` te dice la precisión de la coordenada.** Las 19 obras `INFOBRAS_exacto` tienen ubicación real; las demás están en el centroide del distrito. Útil para el tooltip: "ubicación aproximada (centroide distrital)".

### Distribución del semáforo (para que valides al cargar)

| Segmento | Total | 🔴 ROJO | 🟡 AMBAR | 🟢 VERDE |
|---|---|---|---|---|
| EN_EJECUCION_ACTIVA | 370 | 303 | 59 | 8 |
| EN_LIQUIDACION | 197 | 0 | 141 | 56 |
| SIN_EXPEDIENTE | 26 | 0 | 4 | 22 |
| EN_FORMULACION | 922 | 85 | 475 | 362 |
| **TOTAL** | **1,515** | **388** | **679** | **448** |

> Nota: el conteo total tras la limpieza es 1,515 (se dropeó 1 fila sin distrito ni UBIGEO válido). Si tu carga da 1,515 filas, está correcto.

---

## 2. Lógica de los segmentos (para la vista por actor)

Cada obra está clasificada en un segmento según su etapa real en el ciclo de inversión:

- **EN_EJECUCION_ACTIVA** — obra en ejecución física con avance < 95%. Aquí aplica la Ley 31589 plena. **Son las más críticas: 303 de las 388 obras ROJO están aquí.**
- **EN_LIQUIDACION** — obra terminada (avance ≥ 95% o con Formato 9), pendiente de cierre. Riesgo administrativo, no de parálisis física.
- **SIN_EXPEDIENTE** — aprobada pero sin expediente técnico. Riesgo de arranque.
- **EN_FORMULACION** — proyecto viable que aún no ejecuta. Riesgo de quedar en cartera.

Esto te sirve para la **vista por actor**: el MVCS y los supervisores se enfocan en `EN_EJECUCION_ACTIVA`; las gerencias de formulación en `EN_FORMULACION`; las áreas de liquidación en `EN_LIQUIDACION`.

---

## 3. Lógica del semáforo (para que la expliques en la demo)

El semáforo NO es arbitrario. Está basado en la **Ley 31589** (reactivación de obras paralizadas) y criterios del PNSU. Para el segmento EN_EJECUCION_ACTIVA, el score acumula puntos así:

| Condición | Puntos |
|---|---|
| Sin devengado ≥ 180 días | +45 (paralización legal, Art. 2.1 Ley 31589) |
| Sin devengado ≥ 90 días | +25 (alerta previa) |
| Sin devengado ≥ 45 días | +10 |
| Sin devengado = sin dato (999) | +15 |
| Plazo vencido ≥ 730 días | +35 |
| Plazo vencido ≥ 365 días | +25 |
| Plazo vencido ≥ 180 días | +15 |
| Avance financiero < 15% | +20 (atraso severo, criterio PNSU) |
| Avance financiero < 30% | +10 |

**Umbrales del semáforo:** ROJO ≥ 60 · AMBAR 30–59 · VERDE < 30

El valor diferencial para el pitch: **el sistema marca AMBAR a los 45 días, 135 días antes de que la obra entre en paralización legal a los 180 días.** Eso es la alerta anticipada. Vale la pena que aparezca visible en la demo.

---

## 4. Arquitectura recomendada

```
[obras_piura_clean_v4.csv]
        ↓ (script de carga por lotes)
   [MySQL + Prisma]
        ↓ (Next.js Server Actions / API Routes)
   [Frontend Next.js]
        ├── Mapa Leaflet (puntos semáforo + capa GeoJSON distritos)
        ├── Tabla filtrable (obras ROJO con alerta_texto)
        └── Vista por actor (filtro por segmento)
        ↓
   [Deploy Vercel — URL pública]
```

**Para el argumento de interoperabilidad** (criterio 20% de la rúbrica), en la slide de arquitectura muestra que las fuentes de datos son APIs abiertas del Estado:
- Invierte.pe (MEF) — datos de inversión
- INFOBRAS (Contraloría) — avance físico y coordenadas
- SEACE (OSCE) — procesos de contratación

No las consumes en vivo en el MVP (usas el CSV ya procesado), pero la arquitectura está diseñada para conectarse a ellas. Deja eso explícito en el diagrama: "fuentes integrables vía API" con línea punteada hacia el CSV.

---

## 5. Esquema Prisma sugerido

```prisma
model Obra {
  id                    Int      @id @default(autoincrement())
  codigoUnico           String   @unique @map("codigo_unico")
  nombreInversion       String   @map("nombre_inversion") @db.Text
  entidad               String?
  nivel                 String?
  estado                String?
  situacion             String?
  segmento              String?
  departamento          String?
  provincia             String?
  distrito              String?
  ubigeo                String?  @db.VarChar(6)
  latitud               Float?
  longitud              Float?
  fuenteCoord           String?  @map("fuente_coord")
  costoActualizado      Float?   @map("costo_actualizado")
  devenAcumulAnioAnt    Float?   @map("deven_acumul_anio_ant")
  avanceEjecucionProxy  Float?   @map("avance_ejecucion_proxy")
  diasSinDevengado      Int?     @map("dias_sin_devengado")
  diasSobrePlazo        Int?     @map("dias_sobre_plazo")
  scoreRiesgo           Int?     @map("score_riesgo")
  semaforo              String?
  alertaTexto           String?  @map("alerta_texto") @db.Text
  numHabitantesBenef    Float?   @map("num_habitantes_benef")

  @@index([semaforo])
  @@index([segmento])
  @@index([provincia])
  @@map("obras")
}
```

Los índices en `semaforo`, `segmento` y `provincia` son los que más vas a filtrar — ponlos desde el inicio.

---

## 6. Script de carga por lotes (Node.js)

Reusa tu patrón de `importData.js` del SGTI. Aquí la versión adaptada:

```javascript
// importObras.js
const fs = require('fs');
const Papa = require('papaparse');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BATCH_SIZE = 500;

async function main() {
  const csv = fs.readFileSync('./obras_piura_clean_v4.csv', 'utf-8');
  const { data } = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim(),
  });

  const toFloat = v => {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  };
  const toInt = v => {
    const n = parseInt(v, 10);
    return isNaN(n) ? null : n;
  };

  const records = data.map(r => ({
    codigoUnico:          String(r.CODIGO_UNICO).trim(),
    nombreInversion:      r.NOMBRE_INVERSION || '',
    entidad:              r.ENTIDAD || null,
    nivel:                r.NIVEL || null,
    estado:               r.ESTADO || null,
    situacion:            r.SITUACION || null,
    segmento:             r.segmento || null,
    departamento:         r.DEPARTAMENTO || null,
    provincia:            r.PROVINCIA || null,
    distrito:             r.DISTRITO && r.DISTRITO !== 'nan' ? r.DISTRITO : null,
    ubigeo:               String(r.UBIGEO).trim().padStart(6, '0'),
    latitud:              toFloat(r.LATITUD),
    longitud:             toFloat(r.LONGITUD),
    fuenteCoord:          r.fuente_coord || null,
    costoActualizado:     toFloat(r.COSTO_ACTUALIZADO),
    devenAcumulAnioAnt:   toFloat(r.DEVEN_ACUMUL_ANIO_ANT),
    avanceEjecucionProxy: toFloat(r.avance_ejecucion_proxy),
    diasSinDevengado:     toInt(r.dias_sin_devengado),
    diasSobrePlazo:       toInt(r.dias_sobre_plazo),
    scoreRiesgo:          toInt(r.score_riesgo),
    semaforo:             r.semaforo || null,
    alertaTexto:          r.alerta_texto || null,
    numHabitantesBenef:   toFloat(r.NUM_HABITANTES_BENEF),
  }));

  console.log(`Cargando ${records.length} obras en lotes de ${BATCH_SIZE}...`);

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await prisma.obra.createMany({ data: batch, skipDuplicates: true });
    console.log(`  Lote ${i / BATCH_SIZE + 1} cargado (${batch.length} filas)`);
  }

  const total = await prisma.obra.count();
  console.log(`Total en BD: ${total} (esperado: 1515)`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
```

Validación esperada al final: `Total en BD: 1515`.

---

## 7. Mapa Leaflet — colores y tooltip

```javascript
const COLORS = {
  ROJO:  '#E24B4A',
  AMBAR: '#EF9F27',
  VERDE: '#639922',
};

obras.forEach(obra => {
  if (!obra.latitud || !obra.longitud) return;

  const marker = L.circleMarker([obra.latitud, obra.longitud], {
    radius: obra.semaforo === 'ROJO' ? 7 : 5,
    fillColor: COLORS[obra.semaforo] || '#888780',
    color: '#fff',
    weight: 1,
    fillOpacity: 0.85,
  });

  const precision = obra.fuenteCoord === 'INFOBRAS_exacto'
    ? 'Ubicación exacta'
    : 'Ubicación aproximada (centroide distrital)';

  const dias = obra.diasSinDevengado === 999
    ? 'Sin registro de ejecución'
    : `${obra.diasSinDevengado} días sin devengado`;

  marker.bindPopup(`
    <strong>${obra.nombreInversion}</strong><br/>
    ${obra.distrito || '—'}, ${obra.provincia}<br/>
    <span style="color:${COLORS[obra.semaforo]}">●</span> ${obra.semaforo} · score ${obra.scoreRiesgo}/100<br/>
    ${obra.alertaTexto || ''}<br/>
    <small>${dias} · ${precision}</small>
  `);

  marker.addTo(map);
});
```

Vanessa te entrega `distritos_piura.geojson` (campo `ubigeo_distrito`) para la capa de polígonos. Agrégala como capa de fondo con `L.geoJSON` y opacidad baja para que no tape los puntos.

Centro inicial del mapa para Piura: `[-5.19, -80.63]`, zoom 8.

---

## 8. Tabla de obras críticas

Las columnas que importan para el jurado, en este orden:

`semáforo (badge color) · NOMBRE_INVERSION · provincia/distrito · score_riesgo · alerta_texto · COSTO_ACTUALIZADO`

Filtro por defecto: mostrar solo ROJO + segmento EN_EJECUCION_ACTIVA (las 302–303 más críticas). Permite togglear para ver todas.

Ordenar por `score_riesgo` descendente. Las 5 primeras tienen score 100 — son las que se mencionan en el pitch (todas en Ayabaca, distritos Lagunas y Frías).

---

## 9. Deploy

- **Vercel** es lo más rápido para Next.js. Conecta el repo de GitHub y listo.
- Para la base de datos en producción: **PlanetScale** (MySQL serverless, plan gratis) o **Railway** (MySQL con plan gratis limitado). PlanetScale juega mejor con Prisma.
- Variable de entorno `DATABASE_URL` en Vercel apuntando a la BD remota.
- Corre `importObras.js` contra la BD remota una vez para poblarla.
- **Objetivo: URL pública funcionando antes de las 6pm del día 2 (sábado 14).** Eso te da margen para capturas y ajustes el domingo.

---

## 10. Lo que necesitas de los demás

| De quién | Qué | Cuándo |
|---|---|---|
| Piero | `obras_piura_clean_v4.csv` (ya está en Drive) | Listo ahora |
| Vanessa | `distritos_piura.geojson` (campo `ubigeo_distrito`, <2MB) | Día 1, mañana |
| Piero | Confirmar texto de la arquitectura para slide de interoperabilidad | Día 2 |

---

## 11. Cronograma

| Día | Fecha | Tus entregables |
|---|---|---|
| Día 1 | Viernes 13 jun | Carga CSV en BD · esqueleto Next.js · mapa con puntos funcionando en localhost |
| Día 2 | Sábado 14 jun | GeoJSON integrado · tabla filtrable · **deploy URL pública antes de 6pm** · mentoría técnica 10am o 4pm |
| Día 3 | Domingo 15 jun | Capturas para slide 5 · ajustes finales · envío Facilita Perú antes de 11:59pm |

> El cierre del formulario es **inapelable**. No hay excepciones por correo.

---

## 12. Mentoría del día 2

Hay mentorías técnicas a las 10am y 4pm. Lleva una pregunta concreta, por ejemplo:
> "¿El semáforo basado en Ley 31589 es argumento técnico suficiente para el criterio de calidad, o el jurado espera ver una capa de ML predictivo en el MVP?"

La respuesta te dice si vale la pena invertir tiempo en algo más allá del mapa + tabla, o si con eso ya estás sólido.

---

## 13. Contactos

| Persona | Rol | Contacto |
|---|---|---|
| Piero Marquina | Líder | piero.marquina@pucp.edu.pe · +51 920 654 277 |
| Rubén Jiménez | Punto focal MVCS | rjimenez@vivienda.gob.pe |
| Soporte | Discord oficial | https://discord.gg/Txh269sWk |

---

## 14. La frase que resume la solución

> "Los datos ya estaban en Invierte.pe, INFOBRAS y SEACE. El problema es que nadie los cruzaba en tiempo real. YakuLab los integra y los pone en un mapa que cualquier funcionario entiende en 5 segundos."

El backend que construyes es la prueba viva de esa frase. Si el mapa carga y el semáforo se ve, el argumento se demuestra solo.
