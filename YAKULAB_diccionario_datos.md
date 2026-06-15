# YAKULAB — Diccionario de Datos
## Dataset: `obras_piura_clean_v4.csv`
**Reto MVCS · Hackatón Transformagob 2026**
**Versión:** 4 (final) · **Fecha de corte:** 12 de junio de 2026
**Registros:** 1,515 obras · **Campos:** 31 · **Encoding:** UTF-8 (con BOM)

---

## 1. Propósito del dataset

Consolidado único de proyectos de inversión pública en agua y saneamiento del departamento de Piura, construido a partir del cruce de cinco fuentes oficiales abiertas del Estado peruano. Cada registro representa una obra con su estado de ejecución, ubicación georreferenciada y un índice de riesgo de paralización calculado según la Ley 31589.

Este dataset es la capa de datos que alimenta la plataforma YakuLab: mapa territorial, tabla de obras críticas y vistas por actor.

---

## 2. Llave primaria y unicidad

| Propiedad | Valor |
|---|---|
| Llave primaria | `CODIGO_UNICO` (CUI de Invierte.pe) |
| Registros duplicados | 0 |
| Registros con llave nula | 0 |
| Granularidad | 1 fila = 1 obra de inversión pública |

---

## 3. Diccionario de campos

### 3.1 Identificación

| Campo | Tipo | Ejemplo | Descripción | Nulos |
|---|---|---|---|---|
| `CODIGO_UNICO` | texto | `2732563` | Código Único de Inversión (CUI) de Invierte.pe. Llave primaria. | 0% |
| `NOMBRE_INVERSION` | texto | `REHABILITACIÓN DEL SERVICIO DE AGUA POTABLE...` | Nombre oficial del proyecto. | 0% |
| `ENTIDAD` | texto | `MUNICIPALIDAD DISTRITAL DE FRÍAS` | Entidad ejecutora. | 0% |
| `NIVEL` | texto | `GL` | Nivel de gobierno: GL (local), GR (regional), GN (nacional). | 0% |

### 3.2 Estado del proyecto

| Campo | Tipo | Valores posibles | Descripción | Nulos |
|---|---|---|---|---|
| `ESTADO` | texto | Estado MEF | Estado administrativo del proyecto en el banco de inversiones. | 0% |
| `SITUACION` | texto | `APROBADO`, `VIABLE` | Situación en el ciclo de inversión. | 0% |
| `segmento` | texto | 4 valores (ver §4) | Clasificación por etapa de ejecución, derivada por YakuLab. | 0% |

### 3.3 Ubicación geográfica

| Campo | Tipo | Ejemplo | Descripción | Nulos |
|---|---|---|---|---|
| `DEPARTAMENTO` | texto | `PIURA` | Departamento. Constante en este dataset. | 0% |
| `PROVINCIA` | texto | `AYABACA` | Provincia (8 provincias de Piura). | 0% |
| `DISTRITO` | texto | `FRIAS` | Distrito. Puede tener vacíos puntuales. | <1% |
| `UBIGEO` | texto | `200601` | Código de ubicación INEI, 6 dígitos con ceros a la izquierda. Todos inician en `20`. **Tratar como texto.** | 0% |
| `LATITUD` | decimal | `-4.9281` | Coordenada en WGS84 (EPSG:4326). Nunca nula ni cero. | 0% |
| `LONGITUD` | decimal | `-79.9412` | Coordenada en WGS84 (EPSG:4326). Nunca nula ni cero. | 0% |
| `fuente_coord` | texto | `INFOBRAS_exacto`, `centroide_distrito` | Origen de la coordenada: exacta de INFOBRAS (19 obras) o centroide distrital (1,496 obras). | 0% |

### 3.4 Información financiera

| Campo | Tipo | Ejemplo | Descripción | Nulos |
|---|---|---|---|---|
| `COSTO_ACTUALIZADO` | decimal | `346598.00` | Costo de inversión vigente, en soles (MEF). | 0% |
| `DEVEN_ACUMUL_ANIO_ANT` | decimal | `15600.00` | Devengado acumulado al año anterior, en soles. | 0% |
| `avance_ejecucion_proxy` | decimal | `4.5` | Porcentaje de avance financiero, usado como proxy del avance físico. | 0% |

### 3.5 Indicadores de riesgo (calculados por YakuLab)

| Campo | Tipo | Rango | Descripción | Nulos |
|---|---|---|---|---|
| `dias_sin_devengado` | entero | 0–2202, o `999` | Días transcurridos desde el último devengado. **`999` es centinela = sin dato, no 999 días reales.** | 0% |
| `dias_sobre_plazo` | entero | 0–2841 | Días que la obra lleva con el plazo contractual vencido. | 0% |
| `score_riesgo` | entero | 0–100 | Índice de riesgo de paralización calculado según Ley 31589 (ver §5). | 0% |
| `semaforo` | texto | `ROJO`, `AMBAR`, `VERDE` | Categoría de riesgo derivada del score. | 0% |
| `alerta_texto` | texto | `Sin ejecución 1684d — paralización legal...` | Descripción legible del motivo de alerta. | 0% |

### 3.6 Información social

| Campo | Tipo | Ejemplo | Descripción | Nulos |
|---|---|---|---|---|
| `NUM_HABITANTES_BENEF` | decimal | `1250` | Población beneficiaria declarada en el MEF. **Campo incompleto en la fuente oficial (39% sin dato).** | 39% |

> **Nota sobre `NUM_HABITANTES_BENEF`:** la ausencia de este dato en el 39% de las obras —y en el 100% de las obras ROJO en ejecución activa— no es un error del procesamiento, sino un vacío en el registro oficial del MEF. Esta opacidad es, en sí misma, parte del problema que YakuLab evidencia: el Estado no tiene trazabilidad completa de cuántas familias están afectadas por cada obra paralizada.

---

## 4. Diccionario de segmentos

El campo `segmento` clasifica cada obra según su etapa real en el ciclo de inversión. Es una derivación de YakuLab a partir de `SITUACION`, etapa del Formato 8 y avance.

| Segmento | Criterio | Total | Interpretación |
|---|---|---|---|
| `EN_EJECUCION_ACTIVA` | APROBADO + ejecución física + avance < 95% | 370 | Obra en obra. Aplica Ley 31589 plena. **Las más críticas.** |
| `EN_LIQUIDACION` | APROBADO + (avance ≥ 95% o tiene Formato 9) | 197 | Obra terminada, cierre administrativo pendiente. |
| `SIN_EXPEDIENTE` | APROBADO + etapa temprana del Formato 8 | 26 | Aprobada sin expediente técnico. |
| `EN_FORMULACION` | VIABLE | 922 | Proyecto viable que aún no ejecuta. |

---

## 5. Metodología del score de riesgo

El `score_riesgo` (0–100) se calcula para el segmento `EN_EJECUCION_ACTIVA` sumando puntos según criterios derivados de la **Ley 31589** (Ley que establece medidas para la reactivación de obras públicas paralizadas) y criterios del **PNSU** (Programa Nacional de Saneamiento Urbano).

| Criterio | Puntos | Fundamento |
|---|---|---|
| Sin devengado ≥ 180 días | +45 | Paralización legal, Art. 2.1 Ley 31589 |
| Sin devengado ≥ 90 días | +25 | Alerta previa |
| Sin devengado ≥ 45 días | +10 | Alerta temprana |
| Sin devengado = sin dato (999) | +15 | Riesgo por opacidad |
| Plazo vencido ≥ 730 días | +35 | Incumplimiento severo (>2 años) |
| Plazo vencido ≥ 365 días | +25 | Incumplimiento (>1 año) |
| Plazo vencido ≥ 180 días | +15 | Incumplimiento inicial |
| Avance financiero < 15% | +20 | Atraso severo, criterio PNSU |
| Avance financiero < 30% | +10 | Atraso moderado |

**Umbrales del semáforo:**

| Semáforo | Score | Lectura |
|---|---|---|
| 🔴 ROJO | ≥ 60 | Paralización confirmada o inminente |
| 🟡 AMBAR | 30–59 | Riesgo en desarrollo, requiere atención |
| 🟢 VERDE | < 30 | Sin señales de riesgo |

**Valor diferencial:** el sistema marca AMBAR a los 45 días de inactividad, 135 días antes de que la obra alcance el umbral de paralización legal (180 días). Esto convierte el semáforo en una herramienta de alerta anticipada, no de diagnóstico tardío.

---

## 6. Trazabilidad — fuentes de origen

| Fuente | Origen institucional | Registros | Aporte al dataset |
|---|---|---|---|
| `obras_piura_maestro.csv` | MEF — Invierte.pe (cruce Detalle + Seguimiento) | 2,149 | Base principal: identificación, estado, financiero, ubicación |
| `infobras_piura_obras_geo.csv` | Contraloría — INFOBRAS | 11,825 | Coordenadas geográficas reales |
| `infobras_piura_detalle_rico.csv` | Contraloría — INFOBRAS (fichas individuales) | 113 | Tabla puente CUI↔INFOBRAS + avance físico real |
| `seguimiento_pi_2026_piura_saneamiento.csv` | MEF — Presupuesto 2026 | 5,739 | Contexto presupuestal |

Todas las fuentes son **datos abiertos de acceso público**, sin credenciales ni información personal. Cumple con las reglas de uso de datos de las bases del hackatón (§16) y con el principio de interoperabilidad del Decreto Legislativo 1412.

---

## 7. Garantías de calidad del dataset

| Verificación | Resultado |
|---|---|
| Duplicados por llave primaria | 0 |
| Llaves primarias nulas | 0 |
| Coordenadas nulas o en cero | 0 |
| UBIGEO con formato inválido | 0 |
| UBIGEO fuera de Piura | 0 |
| Cobertura del semáforo | 100% de los registros |

---

## 8. Limitaciones declaradas

1. **Coordenadas mayoritariamente a nivel de centroide distrital** (1,496 de 1,515). Solo 19 obras tienen ubicación exacta de INFOBRAS. El campo `fuente_coord` permite distinguirlas. Para análisis a nivel de localidad se requiere integración adicional con INFOBRAS por CUI.
2. **`NUM_HABITANTES_BENEF` incompleto** en la fuente oficial (39% sin dato). No se imputó para mantener la integridad del dato declarado.
3. **`avance_ejecucion_proxy` es financiero, no físico.** El avance físico real solo está disponible para las 113 obras con ficha INFOBRAS. Se usa el avance financiero como aproximación.
4. **Corte temporal:** los datos reflejan el estado al momento de la descarga (junio 2026). Una implementación en producción se conectaría a las APIs en tiempo real.

---

*Documento generado para la documentación técnica de YakuLab — Hackatón Transformagob 2026. Cumple con el criterio de "Apertura, reutilización y ética digital" (20%) y "Presentación y documentación" (15%) de la rúbrica de evaluación.*
