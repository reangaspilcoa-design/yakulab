# YakuLab — Fixes urgentes para deploy · 14/06/2026

Renzo, revisé el Paquete_Ingeniero completo. Hay **2 bloqueantes para Vercel** y **1 archivo faltante** en el repo. Los fixes de mapa y README ya los apliqué yo en los archivos que me pasaste — solo necesitas copiarlos a tu repo.

---

## ✅ Ya corregido (solo copia estos archivos a tu repo)

### Fix 1 — Centro del mapa (`src/components/Mapa.tsx`, línea 57)

El centro anterior dejaba Ayabaca (la provincia más crítica, 132 obras ROJO) fuera de pantalla.

```diff
- center: [-5.19, -80.63],
+ center: [-4.8, -79.8],
```

### Fix 2 — `paralizacionLegal` siempre daba 0 (`src/app/api/stats/route.ts`, línea 5–11)

`diasSinDevengado` no estaba en el `select` de Prisma, así que el campo llegaba `undefined` al `forEach` y el contador nunca sumaba. La tarjeta en pantalla mostraba `155` hardcodeado como fallback — dato inventado.

```diff
  select: {
    provincia: true,
    segmento: true,
    semaforo: true,
    costoActualizado: true,
-   numHabitantesBenef: true
+   numHabitantesBenef: true,
+   diasSinDevengado: true
  }
```

### Fix 3 — README reescrito (`README.md`)

El README era el default de `create-next-app`. Lo reemplacé con instrucciones reales del proyecto (install, `.env`, seed, GeoJSON, deploy). Esto suma puntos en el criterio **Apertura y reutilización (20%)** de la rúbrica.

---

## 🔴 BLOQUEANTE 1 — SQLite no funciona en Vercel

**El problema:** `prisma/schema.prisma` usa `provider = "sqlite"` con el archivo `prisma/dev.db` local. Vercel es serverless — no tiene sistema de archivos persistente. Todas las llamadas a `/api/stats` y `/api/obras` van a retornar 500.

**Solución recomendada: Neon (PostgreSQL gratuito, ~30 min)**

1. Crear cuenta en https://neon.tech → New Project → copiar el `DATABASE_URL` (formato `postgresql://...`)

2. En `prisma/schema.prisma`, cambiar una sola línea:
```diff
datasource db {
- provider = "sqlite"
- url      = env("DATABASE_URL")
+ provider = "postgresql"
+ url      = env("DATABASE_URL")
}
```

3. Correr la migración apuntando a Neon:
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

4. Correr el seed apuntando a Neon:
```bash
DATABASE_URL="postgresql://..." node scripts/importObras.js
```

5. En el dashboard de Vercel → Settings → Environment Variables → agregar `DATABASE_URL` con el valor de Neon.

6. Redeploy.

**Alternativa más rápida si no quieres tocar el schema: Turso (SQLite cloud)**

Turso es SQLite serverless, casi sin cambios de código. Documentación: https://www.prisma.io/docs/orm/overview/databases/turso

---

## 🔴 BLOQUEANTE 2 — GeoJSON faltante en `public/`

`src/components/Mapa.tsx` hace `fetch('/distritos_piura.geojson')` pero ese archivo **no está en la carpeta `public/`** del repo. Sin él el mapa levanta (los marcadores sí cargan) pero no muestra los polígonos de distritos.

**Acción:**
1. Descargar `distritos_piura.geojson` del Drive (`/Carmelinosenacción/Yakulab/distritos_piura.geojson`)
2. Copiarlo a `public/distritos_piura.geojson`
3. Commitear

El archivo pesa 125 KB — no hay problema de tamaño para commitear.

---

## 📋 Checklist completo para hoy

```
[ ] Aplicar Fix 1 (centro mapa) en tu repo
[ ] Aplicar Fix 2 (select Prisma stats) en tu repo  
[ ] Copiar el README nuevo a tu repo
[ ] Crear DB en Neon → migrar schema → correr seed en cloud
[ ] Copiar distritos_piura.geojson a public/ y commitear
[ ] Configurar DATABASE_URL en Vercel
[ ] Deploy exitoso → enviarnos la URL pública
```

---

## ⏳ Lo que esperamos de Vanessa (para que estés atento)

Vanessa está generando el **mapa de calor de riesgo** (`mapa_calor_riesgo.png`) con Python. Cuando lo suba al Drive, necesitamos que lo incluyas en `public/` también, para que Piero pueda referenciarlo en el PDF del pitch.

Te avisamos en cuanto lo suba.

---

*Generado: 14/06/2026 · YAKULAB · Hackatón Transformagob 2026*
