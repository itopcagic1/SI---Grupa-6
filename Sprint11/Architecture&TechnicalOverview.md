# Tehnički pregled sistema

---

## 1. Pregled sistema

Projekat je full-stack web aplikacija za praćenje i predikciju rezultata sportskih utakmica, kao i upravljanje rezervisanjem slobodnih termina. Sistem se sastoji od pet glavnih cjelina koje rade zajedno unutar Docker okruženja:

- **Frontend** – React SPA aplikacija (Vite + TailwindCSS) koja komunicira s backendom putem REST API-ja i WebSocket veze.
- **Backend** – Node.js/Express API server s Prisma ORM-om koji upravlja svim poslovnim logikama i bazom podataka.
- **AI Service** – Samostalni Python/Flask mikroservis koji prima podatke o utakmici i vraća predikcije koristeći trenirani ML model.
- **Nginx** – Reverse proxy koji rutira HTTP saobraćaj prema frontendu ili backendu, te servira statičke fajlove.
- **Redis + BullMQ** – Redis služi kao broker za BullMQ queue sistem koji upravlja asinhronom obradom rezervacija (timeout logika za nepouzdane klijente, ograničenje otkazivanja termina unutar 24h).

---

## 2. Dijagram arhitekture

```
┌─────────────────────────────────────────────┐
│              KLIJENT (Browser)              │
└───────────────────┬─────────────────────────┘
                    │ HTTPS
┌───────────────────▼─────────────────────────┐
│          NGINX  (Reverse Proxy)             │
│         Static files  │  /api/* proxy       │
└──────────┬────────────┴────────────┬────────┘
           │                         │
┌──────────▼──────────┐   ┌──────────▼──────────┐
│      FRONTEND       │   │       BACKEND        │
│  React + Vite       │   │  Node.js + Express   │
│  TailwindCSS        │◄──►  Prisma ORM          │
│                     │   │  Socket.io           │
└─────────────────────┘   └──────┬──────┬────────┘
       WebSocket (real-time)     │      │
                        ┌────────▼─┐  ┌─▼──────────┐
                        │PostgreSQL│  │ AI Service  │
                        │(Prisma)  │  │ Python/Flask│
                        └──────────┘  └─────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │     Redis + BullMQ          │
                    │                             │
                    └─────────────────────────────┘
```

> WebSocket veza (Socket.io) omogućava real-time ažuriranja između backenda i frontenda (notifikacije).

---

## 3. Komponente i ključni kod

### 3.1 Frontend (`frontend/`)

| | |
|---|---|
| **Tehnologije** | React 18, Vite, TailwindCSS, React Router, Socket.io-client |
| **Entry point** | `frontend/src/main.jsx` → `App.jsx` |
| **Stranice** | `frontend/src/pages/` |
| **Komponente** | `frontend/src/components/` |
| **API pozivi** | `frontend/src/api/` |
| **Real-time** | `frontend/src/realtime/` |
| **Utils** | `frontend/src/utils/` |

`App.jsx` definira routing i globalni layout. Stranice u `pages/` odgovaraju URL rutama, a komponente u `components/` su višekratno upotrebljivi UI elementi. `realtime/` folder sadrži Socket.io logiku za live ažuriranja.

---

### 3.2 Backend (`backend/`)

| | |
|---|---|
| **Tehnologije** | Node.js, Express.js, Prisma ORM, PostgreSQL, JWT, Socket.io, BullMQ, Redis (IORedis) |
| **Entry point** | `backend/src/app.js` |
| **Rute** | `backend/src/routes/` |
| **Kontroleri** | `backend/src/controllers/` |
| **Servisi** | `backend/src/services/` |
| **Middleware** | `backend/src/middleware/` |
| **DTO validacija** | `backend/src/dto/` |
| **Queues (Bull)** | `backend/src/queues/` |
| **Workers** | `backend/src/workers/` |
| **WebSocket** | `backend/src/websocket/` |
| **Konfiguracija** | `backend/src/config/` |
| **Testovi** | `backend/tests/` |

---

### 3.3 AI Service (`ai-service/`)

| | |
|---|---|
| **Tehnologije** | Python, Flask, scikit-learn |
| **Entry point** | `ai-service/src/app.py` |
| **ML features** | `ai-service/src/features.py` |
| **Predikcija** | `ai-service/src/predict.py` |
| **Trening** | `ai-service/src/train.py` |
| **Baza podataka** | `ai-service/src/db.py` |
| **Trenirani model** | `ai-service/model/model.pkl` |
| **Feature columns** | `ai-service/model/feature_columns.pkl` |
| **Trening report** | `ai-service/model/training_report.json` |

AI servis je izolovani mikroservis. Backend šalje HTTP zahtjev s podacima o utakmici, a servis vraća predikciju rezultata. Model je unaprijed treniran i persistiran kao `.pkl` fajl.

---

### 3.4 Baza podataka

| | |
|---|---|
| **Engine** | PostgreSQL |
| **ORM** | Prisma – schema: `backend/prisma/schema.prisma` |
| **Migracije** | `backend/prisma/migrations/` |
| **Seed skripte** | `backend/seed.js`, `backend/prisma/seed-ai-history.js` |

---

### 3.5 Nginx (`nginx/`)

| | |
|---|---|
| **Konfiguracija** | `nginx/nginx.conf` |
| **Uloga** | Reverse proxy, static file serving, SSL termination |

---

### 3.6 Redis + BullMQ

| | |
|---|---|
| **Tehnologije** | Redis (broker), BullMQ (queue), IORedis (klijent), date-fns |
| **Queue definicija** | `backend/src/queues/reservationQueue.js` |
| **Worker** | `backend/src/workers/reservationWorker.js` |
| **Timeout logika** | `backend/src/utils/calculateTimeoutMilliseconds.js` |
| **Queue naziv** | `reservationTimeout` |
| **Redis konekcija** | `REDIS_URL` env varijabla (default: `redis://127.0.0.1:6379`) |

Redis se koristi isključivo kao broker za BullMQ job queue. Implementirana su dva poslovna slučaja:

**1. Timeout za rezervacije nepouzdanih klijenata**
Kada klijent koji se nalazi na nepouzdanoj listi pošalje zahtjev za slobodan termin, rezervacija ne biva automatski odobrena nego dobija status `NA_CEKANJU`. Controller u tom trenutku dodaje job u `reservationTimeout` queue s odgovarajućim delay-om. Ako vlasnik ne reaguje unutar sat vremena, worker automatski mijenja status rezervacije u `REJECTED` i oslobađa termin (`isBooked: false`).

**2. Ograničenje otkazivanja termina unutar 24h**
Ako termin počinje za manje od 24 sata, backend stavlja vremensko ograničenje koje sprečava vlasnika objekta da otkaže taj termin. Funkcija `calculateTimeoutMilliseconds` računa deadline kao minimum između:
- `sada + 24h`
- `početak termina − 2h`

...i vraća precizno trajanje delay-a u milisekundama za BullMQ job.

---

## 4. Komunikacija između komponenti

| Od | Ka / Protokol / Opis |
|---|---|
| Browser → Nginx | HTTPS – sav web saobraćaj prolazi kroz Nginx |
| Nginx → Frontend | Servira statičke React fajlove (build output) |
| Nginx → Backend | Proxy prosljeđuje `/api/*` pozive ka Express serveru |
| Frontend → Backend | REST API (JSON over HTTP) – autentifikacija, podaci |
| Frontend ↔ Backend | WebSocket (Socket.io) – real-time live rezultati i notifikacije |
| Backend → AI Service | HTTP REST – backend šalje features, prima predikciju |
| Backend ↔ PostgreSQL | Prisma ORM – sve CRUD operacije nad bazom |
| Backend → Bull Queue | Asinhrona obrada zadataka (workers) |
| Backend → Redis | Controller dodaje job u `reservationTimeout` queue pri rezervaciji nepouzdanog klijenta |
| Redis → Worker | Po isteku delay-a, BullMQ isporučuje job `reservationWorker`-u |
| Worker → PostgreSQL | Worker ažurira status rezervacije (`REJECTED`) i oslobađa termin (`isBooked: false`) |

---

## 5. Najvažnije sigurnosne odluke

### JWT Autentifikacija
Backend implementira login/logout s JWT tokenima (access + refresh token). Middleware u `backend/src/middleware/` provjerava JWT na zaštićenim rutama. Refresh token mehanizam omogućava duže sesije bez ponovne prijave.

### Izolacija AI servisa
AI servis nema direktan pristup bazi podataka. Sva komunikacija ide kroz backend, koji kontrolira koje podatke prosljeđuje AI servisu. Ovo ograničava površinu napada.

### Nginx kao jedini ulaz
Nginx je jedini servis izložen prema internetu. Frontend i backend kontejneri nisu direktno dostupni – sve prolazi kroz Nginx, koji kontrolira rutiranje i može primjenjivati rate limiting i TLS.

### Env varijable za tajne
Svi kredencijali (JWT secret, DB connection string, API ključevi) čuvaju se u `.env` fajlovima koji nisu commitani. Primjeri se nalaze u `.env.example` fajlovima.

### DTO validacija
Svi ulazni podaci s frontenda validiraju se kroz DTO sloj (`backend/src/dto/`) prije nego što stignu do servisnog sloja.

---

## 6. Pokretanje projekta

| | |
|---|---|
| **Razvoj** | `docker-compose.yml` – lokalno okruženje s hot reload |
| **Produkcija** | `docker-compose.prod.yml` – optimizovano za deploy |
| **Servisi** | frontend, backend, ai-service, nginx, postgres |

```bash
docker compose up --build
```

---

## 7. Mapa projekta – ključni fajlovi

| Putanja | Svrha |
|---|---|
| `backend/src/app.js` | Entry point – registracija middleware i ruta |
| `backend/prisma/schema.prisma` | Cijeli DB model |
| `backend/src/services/` | Poslovna logika – srž aplikacije |
| `backend/src/controllers/` | HTTP request/response handleri |
| `backend/src/middleware/` | Auth provjera, error handling, logging |
| `frontend/src/App.jsx` | Root React komponenta i routing |
| `frontend/src/pages/` | Stranice aplikacije (1:1 s rutama) |
| `frontend/src/api/` | Centralizovani API pozivi ka backendu |
| `ai-service/src/predict.py` | Ulaz za predikciju (poziva model) |
| `ai-service/src/features.py` | Feature engineering |
| `ai-service/model/model.pkl` | Serializovani ML model |
| `nginx/nginx.conf` | Routing pravila i proxy konfiguracija |
| `backend/src/queues/reservationQueue.js` | BullMQ queue inicijalizacija + Redis konekcija |
| `backend/src/workers/reservationWorker.js` | Worker – auto-reject rezervacije po isteku timeouta |
| `backend/src/utils/calculateTimeoutMilliseconds.js` | Izračun delay-a (24h limit ili 2h prije termina) |
| `docker-compose.yml` | Lokalna Docker definicija svih servisa |
