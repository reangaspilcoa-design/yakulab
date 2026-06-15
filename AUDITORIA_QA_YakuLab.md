# Auditoría de calidad — YakuLab (equipo, reto MVCS · Transformagob 2026)

**Auditor:** revisión independiente antes del jurado · **Fecha:** 15 jun 2026
**Fuente de verdad:** `obras_piura_clean_v4.csv` (1,515 filas; UBIGEO string; UTF-8-sig). Recalculado en bruto contra el CSV.

> Veredicto corto: las cifras del pitch están **bien calculadas y son consistentes con el CSV** (302, S/219.3M, 1 210 días, 208, Ayabaca 132, Frías 33, 24 distritos). El prototipo funciona. **Pero hay un problema crítico de método que el jurado puede detectar abriendo el dato: el centinela `999` (sin dato) se está contando como 999 días reales de paralización, lo que infla casi a la mitad la cifra estrella de "302 obras paralizadas".**

---

## 1. Reconciliación de cifras (documento vs CSV real)

| Cifra | Valor en documento | Valor real CSV | ¿Coincide? |
|---|---|---|---|
| Total de obras | 1,515 (diccionario, handoff, dashboard) | **1,515** | ✅ |
| — "1,516" (alerta del encargo) | — | 1,516 = **líneas con encabezado** (1 header + 1,515 datos) | ⚠️ No es conteo de obras; el dashboard usa 1,515 (correcto) |
| Semáforo ROJO | 388 | **388** | ✅ |
| Semáforo ÁMBAR | 679 | **679** | ✅ |
| Semáforo VERDE | 448 | **448** | ✅ |
| ROJO ∩ EN_EJECUCION_ACTIVA ("302 críticas") | 302 | **302** | ✅ |
| Inversión de las 302 (slide "S/219M") | S/ 219 M | **S/ 219.3 M** | ✅ |
| Inversión total de obras ROJO (388) | (no citada) | **S/ 1,090.1 M** | ℹ️ métrica distinta a la del slide |
| Inversión total dashboard | S/ 11,237.8 M | **S/ 11,237.8 M** | ✅ (= portafolio completo) |
| Promedio `dias_sin_devengado` excl. 999 — **ROJO** ("1 210") | 1 210 | **1,210** | ✅ |
| Promedio `dias_sin_devengado` excl. 999 — **todas** | (la "1,520" del encargo) | **1,520** | ✅ ambas existen; depende del universo |
| 208 obras con plazo vencido >2 años (slide) | 208 | **208** = `dias_sobre_plazo`>730 ∩ 302 críticas | ✅ |
| `dias_sobre_plazo` >730 / >365 / >180 (todas) | — | **747 / 914 / 986** | ℹ️ |
| `SALDO_EJECUTAR` < 0 | — | **64 obras** | ℹ️ (revisar: saldo negativo = sobre-ejecución o error de fuente) |
| Provincia con más ROJO | Ayabaca 132 | **Ayabaca 132** | ✅ |
| Top distritos ROJO | Frías 33·Huarmaca 28·Ayabaca 27·Castilla 21·Piura 20 | **idénticos** | ✅ |
| Distritos críticos (≥5 ROJO) | 24 | **24** | ✅ |
| KPI "Paralización legal ≥180d" | 917 | **917** = `dias_sin_devengado`≥180 **excluyendo** 999 | ✅ (maneja bien el centinela) |
| Caso "Frías 1 684 días" | 1 684 (representativo) | máx real Frías **4,090**; 88 obras >4,000 | ✅ coherente (es un caso, no el máximo) |
| `fuente_coord` | 19 exacto + 1 496 centroide | **19 + 1,496** | ✅ |
| `NUM_HABITANTES_BENEF` nulos | 39% | **39.2% (594)** | ✅ |
| Segmento EN_EJECUCION_ACTIVA | **370** (diccionario) | **369** | ❌ off-by-one |
| Segmento EN_FORMULACION | **922** (diccionario) | **923** | ❌ off-by-one |
| Rango `dias_sin_devengado` | **"0–2202"** (diccionario) | **11 – 5,825** | ❌ rango mal documentado |
| Rango `dias_sobre_plazo` | **"0–2841"** (diccionario) | **0 – 5,628** | ❌ rango mal documentado |

**En rojo (discrepancias reales):** los off-by-one de segmento y los rangos del diccionario. El resto del pitch reconcilia.

---

## 2. Hallazgo crítico — el centinela `999` se cuenta como paralización

El diccionario dice: *"`999` es centinela = sin dato, no 999 días reales"* y que ese caso debe sumar **+15 (opacidad)**. La realidad en el CSV:

- **231 de las 388 obras ROJO** tienen `dias_sin_devengado = 999`.
- **145 de las 302 "críticas" (48%)** tienen `999`, con `score = 65` y `alerta_texto = "Sin ejecución 999d — paralización legal (Ley 31589)"`.
- Ese `65 = 45 (regla "≥180 días") + 20 (avance <15%)`. Es decir, el centinela se puntuó como **+45 (paralización legal ≥180 días)**, no como **+15 (opacidad)**. **El código contradice su propio diccionario.**
- **145 alertas** muestran al usuario el texto **"999d"**, presentando un dato faltante como 999 días exactos.

**Inconsistencia interna doble:** el KPI del dashboard "Paralización legal ≥180d = 917" **excluye** los 999, y el promedio "1 210 días" también los excluye — pero el **semáforo/score los incluye** como paralización. El mismo concepto se trata de dos formas opuestas.

**Impacto:** si `999` se tratara como opacidad (+15) como dice el diccionario, esas 145 obras pasarían de `65 → 35` = **ÁMBAR, no ROJO**. La cifra estrella "302 paralizadas en ejecución" caería a ~157, y "388 ROJO" se reduciría de forma parecida. **Casi la mitad del titular depende de cómo se trate un dato faltante.**

> Matiz honesto: se puede *argumentar* que una obra EN_EJECUCION_ACTIVA sin ningún devengado registrado está realmente sin arrancar. Pero entonces (a) el diccionario está mal (no es "sin dato", es "cero ejecución"), y (b) el texto "999d" sigue siendo indefendible, y (c) hay que alinearlo con el KPI 917. Hoy, tal como está, es atacable.

---

## 3. Verificación del prototipo (yakulab.vercel.app) — en vivo

| Check | Resultado |
|---|---|
| KPIs se llenan con números (no "—") | ✅ TOTAL 1,515 · INVERSIÓN S/11,237.8M · PARALIZACIÓN ≥180D 917 · CRÍTICAS 388 · EN RIESGO 679 · EN EJEC. ACTIVA 369 — todos verificados contra el CSV |
| Filtro de semáforo filtra | ✅ "Rojo (388)" → tabla 200 filas todas ROJO; marcadores del mapa 1604 → 477 |
| Filtro de segmento filtra | ✅ "En liquidación" → 197 filas (exacto) |
| Mapa muestra puntos | ✅ Leaflet con ~1,600 marcadores + capa de distritos; toggles "Zonas críticas (24)" y "Puntos de obras" |
| Popups muestran datos | ✅ p.ej. Ayabaca: "🔴 27 rojas · 🟡 34 ámbar · Score 46.6/100 · Total 90" (coincide con CSV) |
| Tabla lista obras | ✅ (limitada a 200 filas; muestra "Sin resultados" cuando aplica) |

**Bugs/observaciones del prototipo:**
- **Doble control de semáforo** (botones-pill *y* dropdown) que se **desincronizan**: al resetear con el pill, el dropdown se queda en el valor anterior → estados contradictorios. Riesgo en demo en vivo.
- **Rendimiento:** con ~1,600 marcadores el render congeló las capturas; puede ir lento en la demo. Considerar clustering.
- **Etiquetas:** "CRÍTICAS 388" rotula todo ROJO como crítico aunque solo 302 están en ejecución; "INVERSIÓN S/11,237.8M" es el portafolio total (incluye formulación no ejecutada), no "plata paralizada".

---

## 4. Checklist de entregables

| Entregable | Estado | Detalle |
|---|---|---|
| Demo (URL) | ✅ | yakulab.vercel.app — operativa y verificada |
| Notebook de código | ✅ | `yakulab.ipynb` en Drive /Yakulab/ (148 KB) |
| Mapas PNG | ✅ | `mapa1_obras_semaforo.png`, `mapa2_distritos_riesgo.png`, `mapa3_zonas_criticas.png` (Drive /Yakulab/De Vanessa para Renzo/) |
| Capas GeoJSON | ✅ | distritos_piura, distritos_riesgo, obras_piura, obras_piura_jitter, zonas_criticas |
| Dataset + diccionario | ✅ | `obras_piura_clean_v4.csv` + `YAKULAB_diccionario_datos.md` (este último a corregir, §1) |
| **Ficha PDF** | ❌ **No encontrada** | Solo existen los **textos** de slides (`TAREA5_textos_slides.md`). No localicé una ficha compilada en PDF. |
| **Presentación PDF** | ❌ **No encontrada** | No localicé el deck del equipo exportado a PDF (sí está la plantilla oficial del reto, no es del equipo). |
| Carpeta pública | ⚠️ Sin confirmar | La carpeta Drive está compartida, pero no confirmé que sea **pública**; el repo del prototipo (Next.js/GitHub) no está confirmado público. |

**Falta para cerrar:** exportar/confirmar **Ficha PDF** y **Presentación PDF**, y confirmar que la **carpeta pública** y el **repo** sean efectivamente accesibles al jurado.

---

## 5. Lista priorizada de problemas (con corrección concreta)

### 🔴 CRÍTICO
1. **Centinela `999` contado como paralización (145/302 críticas; 231/388 ROJO).** Contradice el diccionario y el propio KPI 917.
   → **Corrección:** en el cálculo del score, tratar `999` como `+15` (opacidad) y **no** dispararle la regla "≥180 días (+45)". Recalcular semáforo. Y cambiar `alerta_texto` de "Sin ejecución 999d" a **"sin devengado registrado (sin dato)"**. Después, re-citar 302/388 con el número corregido. Si el equipo decide mantener 999 como "alto riesgo", debe (a) renombrar el concepto en el diccionario, (b) alinearlo con el KPI 917, y (c) quitar el "999d" del texto.

### 🟠 MEDIO
2. **86 obras ROJO están en `EN_FORMULACION` (solo VIABLE, sin ejecutar).** La metodología dice que el score solo aplica a `EN_EJECUCION_ACTIVA`; un proyecto apenas viable no puede estar en "paralización confirmada o inminente".
   → **Corrección:** no calcular ROJO fuera de `EN_EJECUCION_ACTIVA` (o crear una categoría aparte "riesgo en formulación"). Usar **302** como cifra principal, no 388.
3. **"302 obras paralizadas" presentado como hecho.** Oficialmente Contraloría reporta **15** paralizadas en Piura (dic-2025) e INFOBRAS **28** de saneamiento. La de YakuLab es *riesgo inferido*.
   → **Corrección:** reformular a **"302 obras en riesgo de paralización / sin ejecución registrada"**. Evita que el jurado lo refute con la cifra oficial.
4. **Diccionario desactualizado vs CSV final:** segmentos 370/922 (doc) vs 369/923 (real); rangos `dias_sin_devengado` "0–2202" (real 11–5,825) y `dias_sobre_plazo` "0–2841" (real 0–5,628).
   → **Corrección:** regenerar el diccionario automáticamente desde el CSV v4.
5. **Doble filtro de semáforo desincronizado** en el dashboard.
   → **Corrección:** un solo control de semáforo (o sincronizar pill ↔ dropdown con un mismo estado).

### 🟡 MENOR
6. **Conteo de distritos inconsistente en el handoff:** "64" vs "65" vs "66 UBIGEOs / 63 con polígono". → Unificar: Piura = 65 distritos; CSV = 66 UBIGEOs distintos; 3 sin polígono (no afectan porque el mapa usa puntos).
7. **Etiqueta "INVERSIÓN S/11,237.8M"** = portafolio total. → Renombrar "inversión monitoreada" para no confundir con "inversión paralizada".
8. **"CRÍTICAS 388"** rotula todo ROJO. → Mostrar "302 en ejecución" como crítico principal.
9. **Rendimiento del mapa** (~1,600 marcadores). → Clustering / carga diferida para la demo.
10. **Seguridad:** hay un `.env` en `Paquete_Ingeniero`. → Verificar que esté en `.gitignore` antes de publicar el repo (no subir secretos).
11. **Faltan Ficha PDF y Presentación PDF**, y confirmar carpeta/repo públicos (§4).

---

### Qué está sólido (para defender con confianza)
302 críticas · S/219.3M · 208 plazo>2años · 1 210 días (ROJO) · Ayabaca 132 · Frías 33 · 24 distritos críticos · 917 (≥180d, bien excluye el 999) · el prototipo funciona (KPIs, filtros, mapa, popups, tabla). Todo eso reconcilia exactamente con el CSV.
