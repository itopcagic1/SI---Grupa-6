# SportManager — Deployment Dokumentacija

## 1. Naziv aplikacije i opis arhitekture

**SportManager** je web platforma za upravljanje sportskim ligama, rezervacijama terena, timovima i rezultatima. Sistem se sastoji od pet servisa:

- **Frontend** — React aplikacija buildana Vite-om, servirana preko Nginx-a. Korisnici pristupaju aplikaciji kroz browser i komuniciraju s backendom putem REST API-ja.
- **Backend** — Node.js/Express REST API koji obrađuje poslovnu logiku, autentifikaciju korisnika i real-time komunikaciju putem WebSocketa (Socket.IO).
- **AI Service** — Python/FastAPI servis koji na osnovu historijskih podataka o utakmicama koristi ML model za predikciju rezultata.
- **PostgreSQL** — glavna relacijska baza podataka u kojoj se čuvaju svi podaci aplikacije. Prisma ORM se koristi za upravljanje shemom i migracijama.
- **Redis** — brza in-memory baza koja služi kao red čekanja (queue). Kada korisnik napravi rezervaciju ili se treba poslati notifikacija, zadatak se privremeno pohrani u Redis, a worker ga obradi u pozadini bez da korisnik čeka na odgovor.

---

## 2. Tehnologije

| Komponenta   | Tehnologija                        |
|--------------|------------------------------------|
| Frontend     | React 19, Vite 8, Tailwind CSS 4   |
| Backend      | Node.js 20, Express 5, Prisma 5    |
| AI Service   | Python 3.14, FastAPI, scikit-learn |
| Baza         | PostgreSQL 16                      |
| Queue/Cache  | Redis 7                            |
| Kontejneri   | Docker, Docker Compose             |
| CI/CD        | GitHub Actions                     |
| Cloud        | Railway                            |

---

## 3. Potrebni alati i verzije

| Alat             | Minimalna verzija |
|------------------|-------------------|
| Node.js          | 20.x              |
| npm              | 10.x              |
| Python           | 3.11+             |
| Docker Desktop   | 4.x               |
| Docker Compose   | 2.x (ugrađen)     |
| Git              | 2.x               |

---

## 4. Environment varijable

### Backend (`Projekat/backend/.env`)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@db:5432/sportmanager?schema=public
JWT_SECRET=<min-32-karaktera>
FRONTEND_URL=http://localhost
SENDGRID_API_KEY=<sendgrid-api-key>
REDIS_URL=redis://redis:6379
```

### Frontend (`Projekat/frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

### AI Service (`Projekat/ai-service/.env`)

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/sportmanager?schema=public
```

---

## 5. Lokalno pokretanje — cijeli sistem 

### Preduvjeti
- Docker Desktop pokrenut
- Kopirani `.env` fajlovi prema sekciji 4

### Pokretanje

```bash
cd Projekat
docker compose up --build
```

Sistem je dostupan na:
- Frontend: `http://localhost`
- Backend API: `http://localhost:3000`
- AI Service: `http://localhost:8000/docs`

### Zaustavljanje

```bash
docker compose down
```

Za brisanje baze:

```bash
docker compose down -v
```

---

## 6. Lokalno pokretanje — backend (bez Dockera)

### Preduvjeti
- PostgreSQL i Redis pokrenuti lokalno ili cloud baza (Neon)
- `backend/.env` popunjen

```bash
cd Projekat/backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Backend sluša na `http://localhost:3000`.

---

## 7. Lokalno pokretanje — frontend (bez Dockera)

### Preduvjeti
- Backend pokrenut
- `frontend/.env` popunjen

```bash
cd Projekat/frontend
npm install
npm run dev
```

Frontend sluša na `http://localhost:5173`.

---

## 8. Pokretanje baze

### Lokalno (Docker)
Baza se automatski pokreće kao dio `docker compose up`. Dostupna je na `localhost:5432`.

### Produkcija
Koristi se Railway PostgreSQL servis. Connection string se automatski injektuje kao `DATABASE_URL` env varijabla.

---

## 9. Migracije i seed podaci

### Migracije

```bash
cd Projekat/backend
npx prisma migrate deploy
```

> Migracije se automatski primjenjuju pri svakom deployu (u `docker-compose.yml` i Railway build komandi).

### Seed podaci

```bash
cd Projekat/backend
node seed.js
# ili
node prisma/seed-ai-history.js
```

---

## 10. Pokretanje testova

### Backend testovi (Jest)

```bash
cd Projekat/backend
npm test
# ili sa coverage izvještajem:
npm run test:coverage
```

> Testovi zahtijevaju `.env.test` fajl s test bazom.

### Frontend testovi (Vitest)

```bash
cd Projekat/frontend
npm test
```

---

## 11. Produkcijski deployment (Railway)

### CD skripta

Skripta se nalazi u `.github/workflows/deploy.yml` u korijenu repozitorija.

#### Lokacija
```
.github/workflows/deploy.yml
```

#### Kako se pokreće
Automatski na svaki `push` na `main` granu.

#### Preduvjeti
- GitHub repo s pristupom na `main` granu
- Railway account s kreiranim servisima
- GitHub Secrets postavljeni 

#### GitHub Secrets

| Secret                        | Opis                              |
|-------------------------------|-----------------------------------|
| `RENDER_DEPLOY_HOOK_BACKEND`  | Railway deploy hook za backend    |
| `RENDER_DEPLOY_HOOK_FRONTEND` | Railway deploy hook za frontend   |
| `RENDER_DEPLOY_HOOK_AI`       | Railway deploy hook za AI servis  |

> Hookovi se nalaze u Railway dashboardu: servis → Settings → Deploy Hook.

#### Šta pipeline radi

1. **Backend Tests** — pokreće Jest testove s PostgreSQL i Redis servisima
2. **Frontend Tests** — pokreće Vitest testove
3. **Deploy to Railway** — triggera Railway deploy hookove (samo na `push` na `main`, nakon testova)

### Railway konfiguracija servisa

| Servis               | Root Directory        | Build Command                                              | Start Command                                      |
|----------------------|-----------------------|------------------------------------------------------------|----------------------------------------------------|
| sportmanager-backend | `Projekat/backend`    | `npm ci && npx prisma generate && npx prisma migrate deploy` | `node src/app.js`                                  |
| sportmanager-frontend| `Projekat/frontend`   | `npm ci && npm run build` (Dockerfile)                     | nginx (Dockerfile)                                 |
| sportmanager-ai      | `Projekat/ai-service` | `pip install -r requirements.txt` (Dockerfile)             | `uvicorn src.app:app --host 0.0.0.0 --port $PORT` |

### Railway env varijable (produkcija)

Backend:
```
NODE_ENV=production
DATABASE_URL=<railway-postgres-connection-string>
REDIS_URL=${{sportmanager-redis.DATABASE_URL}}
JWT_SECRET=<produkcijski-secret>
SENDGRID_API_KEY=<sendgrid-key>
FRONTEND_URL=https://sportmanager-frontend-production.up.railway.app
```

Frontend:
```
VITE_API_URL=https://sportmanager-backend-production.up.railway.app/api
```

AI Service:
```
DATABASE_URL=<railway-postgres-connection-string>
```

### Ručni koraci (opravdani)

Sljedeći koraci se moraju izvršiti jednom ručno pri inicijalnom setupu:
1. Kreiranje Railway projekta i servisa
2. Postavljanje env varijabli u Railway dashboardu
3. Dodavanje GitHub Secrets za deploy hookove

---

## 12. Linkovi na deployment

| Servis    | URL                                                                 |
|-----------|---------------------------------------------------------------------|
| Frontend  | https://sportmanager-frontend-production.up.railway.app             |
| Backend   | https://sportmanager-backend-production.up.railway.app              |
| AI Service| https://sportmanager-ai-production.up.railway.app                   |
| API Docs  | https://sportmanager-ai-production.up.railway.app/docs              |

---

## 13. Poznata ograničenja

- **Railway Trial** — besplatni tier ima ograničenje od $5 kredita (30 dana). Nakon isteka servisi se gase.
- **Sleep mode** — Railway gasi neaktivne servise, pa prvi request može biti sporiji (cold start).
- **WebSocket na produkciji** — Socket.IO radi direktno na backend URL-u, ne kroz nginx proxy (frontend se direktno spaja na backend).

---

## 14. Najčešći problemi i rješenja


