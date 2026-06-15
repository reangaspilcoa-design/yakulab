# YakuLab 💧

**Plataforma de monitoreo inteligente de obras públicas de agua y saneamiento en Piura, Perú.**

Sistema de alerta anticipada basado en la **Ley 31589** que integra datos de Invierte.pe (MEF), INFOBRAS (Contraloría), SEACE (OSCE) e INEI para detectar obras en riesgo de paralización — **135 días antes** de que alcancen el umbral legal.

> Desarrollado para la **Hackatón Transformagob 2026** · Reto MVCS

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19 · TypeScript |
| Base de Datos | PostgreSQL (Supabase) |
| ORM | Prisma 6 |
| Mapa | Leaflet 1.9 |
| Estilos | CSS Variables · Dark Theme |
| Deploy | Vercel |

## 📊 Datos

- **1,515 obras** de saneamiento en 65 distritos de Piura
- **5 fuentes oficiales** del Estado peruano integradas
- **Score de riesgo 0–100** basado en criterios de Ley 31589 y PNSU
- **Semáforo**: 🔴 388 críticas · 🟡 679 en riesgo · 🟢 448 sin alertas

---

## ⚡ Instalación

### 1. Clonar e instalar
```bash
git clone https://github.com/TU_USUARIO/yakulab.git
cd yakulab
npm install
```

### 2. Configurar base de datos
Crea un archivo `.env` en la raíz:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 3. Crear tablas
```bash
npx prisma db push
```

### 4. Cargar datos (1,515 obras)
```bash
node scripts/importObras.js
```
Resultado esperado: `✅ Total en BD: 1515`

### 5. Arrancar en desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000)

---

## 🌍 Deploy en Vercel

1. Sube el repo a GitHub
2. Ve a [vercel.com](https://vercel.com) → "New Project" → importa el repo
3. En **Settings → Environment Variables** agrega:
   - `DATABASE_URL` = tu URL de Supabase
   - `DIRECT_URL` = tu URL de Supabase
4. Deploy → URL pública lista

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx              # Dashboard principal
│   ├── layout.tsx            # Layout con SEO
│   ├── globals.css           # Sistema de diseño
│   └── api/
│       ├── obras/route.ts    # API de obras (filtrable)
│       └── stats/route.ts    # Estadísticas agregadas
├── components/
│   ├── Mapa.tsx              # Mapa Leaflet con 3 capas
│   ├── TablaObras.tsx        # Tabla filtrable
│   ├── FuentesDatos.tsx      # Panel de interoperabilidad
│   ├── GraficoSemaforo.tsx   # Donut chart de riesgo
│   ├── GraficoSegmentos.tsx  # Barras por segmento
│   └── GraficoProvincias.tsx # Ranking por provincia
└── lib/
    └── prisma.ts             # Singleton PrismaClient
```

---

## 📜 Fuentes de Datos Abiertas

| Fuente | Institución | Aporte |
|--------|-------------|--------|
| Invierte.pe | MEF | Identificación, estado, financiero |
| INFOBRAS | Contraloría | Coordenadas, avance físico |
| SEACE | OSCE | Procesos de contratación |
| Seguimiento PI | MEF Presupuesto | Contexto presupuestal |
| Geoservidor | INEI | Límites distritales |

Todas las fuentes son datos abiertos de acceso público, sin credenciales ni información personal. Cumple con el **D.L. 1412** (Decreto de Gobierno Digital).

---

## 👥 Equipo YakuLab

Desarrollado por el equipo **Carmelinos en Acción** para la Hackatón Transformagob 2026 · Reto MVCS.

---

*Los datos ya estaban en Invierte.pe, INFOBRAS y SEACE. El problema es que nadie los cruzaba en tiempo real. YakuLab los integra y los pone en un mapa que cualquier funcionario entiende en 5 segundos.*
