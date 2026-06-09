# SportManager — CD Pipeline Dokumentacija

## Pregled

SportManager koristi **GitHub Actions** kao CD pipeline u kombinaciji s **Railway** platformom za automatski deployment kompletnog sistema na cloud. Svaki push na `main` granu automatski pokreće pipeline koji testira i deployuje sve servise.

---

## Lokacija skripte

```
.github/workflows/deploy.yml
```

---

## Kako se pokreće

Pipeline se pokreće automatski na:
- Svaki `push` na `main` granu
- Svaki `pull_request` prema `main` grani (samo testovi, bez deploymenta)

Ručno pokretanje nije potrebno.

---

## Preduvjeti

| Preduvjet | Opis |
|-----------|------|
| GitHub repozitorij | Kod mora biti na `main` grani |
| Railway account | Kreiran projekt s GitHub integracijom |
| Railway servisi | `sportmanager-backend`, `sportmanager-frontend`, `sportmanager-ai`, `sportmanager-db`, `sportmanager-redis` |
| Env varijable | Postavljene u Railway dashboardu |

---

## Varijable i Secrets

Pipeline ne koristi GitHub Secrets — Railway deployuje automatski kroz direktnu GitHub integraciju bez dodatnih hookova.

Env varijable su postavljene u Railway dashboardu:

| Servis   | Varijabla | Opis |
|----------|-----------|------|
| Backend  | `DATABASE_URL` | PostgreSQL connection string |
| Backend  | `REDIS_URL` | Redis connection string |
| Backend  | `JWT_SECRET` | JWT tajni ključ |
| Backend  | `SENDGRID_API_KEY` | SendGrid API ključ za email |
| Backend  | `FRONTEND_URL` | URL frontenda (za CORS) |
| Backend  | `NODE_ENV` | `production` |
| Frontend | `VITE_API_URL` | URL backend API-ja |
| AI Service | `DATABASE_URL` | PostgreSQL connection string |

---

## Šta se tačno deploya

### 1. Backend (Node.js/Express)
- **Build:** Dockerfile u `Projekat/backend/`
- **Migracije:** `npx prisma migrate deploy` (automatski pri startu kroz Dockerfile CMD)
- **Start:** `node src/app.js`
- **Platforma:** Railway Web Service

### 2. Frontend (React/Vite → Nginx)
- **Build:** Dockerfile u `Projekat/frontend/` — Vite builda statičke fajlove, Nginx ih servira
- **Start:** nginx
- **Platforma:** Railway Web Service

### 3. AI Service (Python/FastAPI)
- **Build:** Dockerfile u `Projekat/ai-service/`
- **Start:** `uvicorn src.app:app --host 0.0.0.0 --port $PORT`
- **Platforma:** Railway Web Service

### 4. Baza podataka
- **Tip:** PostgreSQL 16
- **Platforma:** Railway PostgreSQL servis
- **Migracije:** Automatski pri svakom backend startu

### 5. Redis
- **Tip:** Redis 7
- **Platforma:** Railway Redis servis
- **Namjena:** Bull/BullMQ queue za rezervacije i notifikacije

---

## Kako su servisi povezani

```
Browser
  │
  ▼
Frontend (Railway)
  │  VITE_API_URL
  ▼
Backend (Railway) ──── PostgreSQL (Railway / Neon)
  │                         │
  │  REDIS_URL         DATABASE_URL
  ▼                         │
Redis (Railway)        AI Service (Railway)
```

- **Frontend → Backend:** kroz `VITE_API_URL` env varijablu
- **Backend → Baza:** kroz `DATABASE_URL` env varijablu
- **Backend → Redis:** kroz `REDIS_URL` env varijablu
- **Backend → AI Service:** kroz `AI_SERVICE_URL` env varijablu
- **AI Service → Baza:** kroz `DATABASE_URL` env varijablu

---

## Koraci pipeline-a

```yaml
# .github/workflows/deploy.yml

1. Backend Tests
   - Pokreće PostgreSQL i Redis kao GitHub Actions servise
   - Instalira Node.js dependencije
   - Pokreće Prisma migracije na test bazi
   - Pokreće Jest testove

2. Frontend Tests
   - Instalira Node.js dependencije
   - Pokreće Vitest testove

3. Verify Deployment (samo na push na main)
   - Čeka 30 sekundi da Railway završi deploy
   - Provjerava da li frontend odgovara (HTTP GET)
```

---

## Provjera da je deployment uspješan

### GitHub Actions
Idi na GitHub repo → tab **Actions** → provjeri da su svi jobovi zeleni.

### Railway Dashboard
Idi na [railway.app](https://railway.app) → projekt → provjeri da svi servisi imaju status **Online**.

### Live provjera
| Servis | URL | Očekivani odgovor |
|--------|-----|-------------------|
| Frontend | https://sportmanager-frontend-production.up.railway.app | HTML stranica |
| Backend | https://sportmanager-backend-production.up.railway.app/api/homepage | JSON odgovor |
| AI Service | https://sportmanager-ai-production.up.railway.app/health | `{"status":"ok","modelLoaded":true}` |

---

## Ručni koraci (opravdani)

Sljedeći koraci se izvršavaju jednom pri inicijalnom setupu i nisu dio automatskog pipeline-a:

1. **Kreiranje Railway projekta** — jednom, pri setupu
2. **Postavljanje env varijabli** — jednom, pri setupu; mijenjaju se samo ako se mijenjaju kredencijali
3. **GitHub integracija na Railway** — jednom, pri setupu

Svi ostali koraci (build, migracije, deployment, health check) su potpuno automatizovani.

---

## Ponovljivost deploymenta

Deployment je ponovljiv — svaki push na `main` granu izvršava isti pipeline:

1. Testira kod
2. Railway automatski rebuilda Docker image
3. Pokreće migracije
4. Deploya novi kontejner
5. GitHub Actions verifikuje da je aplikacija dostupna