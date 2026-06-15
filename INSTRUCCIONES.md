# YakuLab — Instrucciones de arranque para Renzo

## 0. Lo que ya está hecho
- Proyecto Next.js creado ✅
- Schema Prisma con las 25 columnas del CSV ✅
- API `/api/obras` con filtros por semáforo/segmento/provincia ✅
- API `/api/stats` para los contadores del header ✅
- Mapa Leaflet con puntos coloreados y popup ✅
- Tabla filtrable con busqueda, semáforo y segmento ✅
- Script de importación del CSV ✅

---

## 1. Instalar dependencias (ya hecho, pero por si acaso)
```bash
npm install
```

---

## 2. Copiar el CSV al proyecto
```bash
# Copia obras_piura_clean_v4.csv a la raíz del proyecto
cp /ruta/a/obras_piura_clean_v4.csv .
```

---

## 3. Base de datos — 2 opciones

### Opción A: PlanetScale (recomendado para deploy — GRATIS)

1. Ve a https://planetscale.com → crea cuenta gratis
2. Crea una base de datos llamada `yakulab` (elige región: us-east-1)
3. En el panel, ve a "Connect" → "Connect with: Prisma"
4. Copia la cadena de conexión que tiene este formato:
   ```
   mysql://usuario:password@aws.connect.psdb.cloud/yakulab?sslaccept=strict
   ```
5. Edita `.env` y reemplaza DATABASE_URL con esa cadena

### Opción B: MySQL local con Docker (para desarrollo rápido)
```bash
# Necesitas Docker instalado
docker run --name yakulab-mysql -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=yakulab -p 3306:3306 -d mysql:8
# .env ya apunta a localhost:3306
```

---

## 4. Crear tablas en la BD
```bash
npx prisma db push
```
Debería decir: "Your database is now in sync with your Prisma schema."

---

## 5. Cargar el CSV a la BD
```bash
node scripts/importObras.js
```
Resultado esperado: `✅ Total en BD: 1515`

---

## 6. Arrancar en localhost
```bash
npm run dev
```
Abre http://localhost:3000 — deberías ver el mapa con 1,515 puntos.

---

## 7. Deploy en Vercel

1. Sube el proyecto a GitHub:
   ```bash
   git init
   git add .
   git commit -m "YakuLab v1 - mapa semáforo obras Piura"
   git remote add origin https://github.com/TU_USUARIO/yakulab.git
   git push -u origin main
   ```

2. Ve a https://vercel.com → "New Project" → importa el repo de GitHub

3. En "Environment Variables" agrega:
   - `DATABASE_URL` = tu URL de PlanetScale

4. Deploy → ¡URL pública lista!

---

## 8. GeoJSON de Vanessa (cuando llegue)
Cuando Vanessa te mande `distritos_piura.geojson`:
```bash
# Cópialo a la carpeta public/
cp distritos_piura.geojson public/
```
El mapa ya está programado para cargarlo automáticamente.

---

## Checklist final para el jurado
- [ ] Mapa carga con 1,515 puntos coloreados
- [ ] Popup muestra nombre, semáforo, score y alerta_texto
- [ ] Filtro por semáforo funciona (ROJO/AMBAR/VERDE)
- [ ] Tabla muestra obras ROJO + EN_EJECUCION_ACTIVA por defecto
- [ ] URL pública en Vercel funcionando
- [ ] GeoJSON de distritos visible en el mapa

## Contactos
- Piero Marquina: piero.marquina@pucp.edu.pe · +51 920 654 277
- Discord: https://discord.gg/Txh269sWk
