# ⚽ Mundial 2026 Tracker

Predicciones estadísticas del Mundial 2026 en tiempo real para compartir con amigos y familia.
Modelo Poisson + Monte Carlo (8,000 simulaciones) basado en el ranking FIFA.

## Stack
- React 18 + Vite
- Firebase Realtime Database (sync en tiempo real)
- Tailwind CSS
- Sin backend propio

---

## Setup (5 pasos)

### 1. Crear proyecto Firebase
1. Ve a https://console.firebase.google.com
2. "Añadir proyecto" → nombre: `mundial-tracker`
3. En el proyecto: **Realtime Database** → Crear base de datos → Modo de prueba → USA (us-central1)
4. En **Configuración del proyecto** → "Tus apps" → Web → Registrar app
5. Copia las credenciales de `firebaseConfig`

### 2. Configurar reglas Firebase
En Realtime Database → Reglas, pega esto:
```json
{
  "rules": {
    "results": {
      ".read": true,
      ".write": true
    }
  }
}
```

### 3. Crear archivo .env.local
```bash
cp .env.example .env.local
```
Llena los valores con tus credenciales de Firebase:
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=mundial-tracker.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://mundial-tracker-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=mundial-tracker
VITE_FIREBASE_STORAGE_BUCKET=mundial-tracker.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abc123
```

### 4. Instalar y correr
```powershell
npm install
npm run dev
```
Abre: http://localhost:5173

### 5. Compartir con tu papá y amigos
```powershell
npm run build
```
Sube la carpeta `dist/` a Vercel, Netlify o Firebase Hosting.
Todos los que abran el link ven los mismos resultados en tiempo real.

---

## Uso diario
1. Entra a la pestaña **Resultados**
2. Selecciona el grupo que jugó
3. Ingresa el marcador y presiona **Guardar**
4. Las predicciones se actualizan automáticamente para todos

---

## Cómo funciona el modelo
- **Goles esperados (λ)**: basado en el rating FIFA de cada equipo
  - `λ = 1.15 × (rating_ataque / 1620)² / (rating_defensa / 1620)^1.5`
- **Distribución de Poisson**: calcula la probabilidad de cada marcador posible
- **Monte Carlo**: simula 8,000 torneos completos para obtener probabilidades
- **Actualización**: cada resultado real ajusta el contexto para el resto del torneo

---

## Estructura del proyecto
```
src/
  data/
    teams.js     ← 48 equipos con ratings FIFA
    fixtures.js  ← 72 partidos de grupos
  model/
    simulation.js ← Poisson + Monte Carlo
  pages/
    Home.jsx     ← Candidatos al campeonato
    Mexico.jsx   ← Vista enfocada en México
    Groups.jsx   ← Los 12 grupos
    Admin.jsx    ← Ingreso de resultados
```
