# Struktura repozitorija i tehnički setup
## Sistem za upravljanje sportskim terminima i ligama

---

## 1. Branching strategija

### 1.1 Odabrana strategija: GitHub Flow

Tim je odabrao **GitHub Flow** kao branching strategiju za ovaj projekat.

GitHub Flow je lagana strategija zasnovana na kratkim, fokusiranim granama koje se direktno merguju u `main`. Sastoji se od jedne stalne grane (`main`) i kratkotrajnih feature/fix grana koje žive samo dok traje razvoj određene funkcionalnosti.

### 1.2 Struktura grana

```
main
├── feature/PB-20-registracija-korisnika
├── feature/PB-21-prijava-odjava
├── feature/PB-24-upravljanje-ligama
├── fix/bug-opis-problema
└── chore/PB-16-ci-cd-setup
```

**Jedina stalna grana:**

- `main` — uvijek sadrži stabilnu, deployabilnu verziju koda. Svaki merge u `main` pokreće automatski deployment na produkciju putem CI/CD pipelinea.

**Kratkotrajne grane (brišu se nakon mergea):**

- `feature/PB-[ID]-kratki-opis` — nova funkcionalnost vezana za backlog stavku
- `fix/kratki-opis-buga` — ispravka greške
- `chore/kratki-opis` — tehnički zadaci koji nisu feature ni fix (konfiguracija, dependency update i sl.)

### 1.3 Proces rada na grani

1. Kreirati granu iz `main` s odgovarajućim prefiksom i nazivom
2. Razvijati funkcionalnost u malim, logičnim commitovima
3. Otvoriti Pull Request prema `main` čim je rad spreman za pregled
4. Direktan push na `main` granu nije dozvoljen — sve promjene moraju ići kroz Pull Request (branch protection rules)
5. Koristi se "squash merge" kako bi commit historija ostala čista i pregledna
6. Barem jedan drugi član tima vrši code review i odobrava PR
7. Nakon odobrenja, Scrum Master ili odgovorni developer merguje PR u `main`
8. Grana se briše nakon mergea
9. CI/CD pipeline automatski deployuje novu verziju

### Pravila za Pull Request

- Svaki PR mora sadržavati opis implementirane funkcionalnosti
- PR mora referencirati odgovarajući Product Backlog ID (npr. PB-20)
- PR mora biti pregledan i odobren od strane najmanje jednog člana tima prije merge-a

### 1.4 Konvencija commit poruka

Commit poruke prate sljedeći format:

```
tip(opseg): kratki opis u imperativu

Primjeri:
feat(auth): dodati registraciju korisnika
fix(rezervacije): ispraviti duplu rezervaciju istog termina
chore(ci): podesiti GitHub Actions workflow
docs(api): dokumentovati endpoint za login
```

**Tipovi:** `feat` / `fix` / `chore` / `docs` / `test` / `refactor`

### 1.5 Zašto GitHub Flow, a ne nešto složenije?

Tim je razmatrao i GitLab Flow te Gitflow, ali su odbačeni iz sljedećih razloga:

| Strategija | Razlog odbacivanja |
|---|---|
| **Gitflow** | Previše grana (`develop`, `release`, `hotfix`) za tim veličine 8 osoba i jednogodišnji akademski projekat |
| **GitLab Flow** | Optimizovan za projekte s više produkcijskih okruženja i složenijim release ciklusima — prevelika složenost za MVP |


---

## 2. Tehnički setup

### 2.1 Pregled tech stacka

| Sloj | Tehnologija | Verzija |
|---|---|---|
| Frontend | React.js | 18.x |
| Frontend build alat | Vite | 5.x |
| Backend | Node.js + Express | Node 20 LTS + Express 4.x |
| Baza podataka | PostgreSQL | 16.x |
| ORM | Prisma | 5.x |
| AI servis | Python + Flask + scikit-learn | Python 3.11, Flask 3.x |
| Autentifikacija | JWT + bcrypt | jsonwebtoken 9.x, bcrypt 5.x |
| Email servis | SendGrid | SDK 8.x |
| PDF generator | Puppeteer | 22.x |
| Kontejnerizacija | Docker + Docker Compose | Docker 26.x |
| CI/CD | GitHub Actions | — |
| Web server | Nginx | 1.26.x |

---

### 2.2 Frontend — React.js

**Programski jezik:** JavaScript (ES2022+)

**Framework:** React.js 18 s funkcionalnim komponentama i Hooks-ima

**Build alat:** Vite — brži od Create React App, nativan ESM support

**Ključne biblioteke:**

- `react-router-dom` — klijentsko rutiranje između stranica
- `axios` — HTTP klijent za komunikaciju s backend API-jem
- `react-query` (TanStack Query) — upravljanje serverskim stanjem, polling (30s interval za tabele i rasporede)
- `react-hook-form` — upravljanje formama i validacija na klijentskoj strani
- `tailwindcss` — utility-first CSS framework za responzivan dizajn (NFR-06, NFR-14)

**Struktura projekta (frontend):**

```
frontend/
├── public/
├── src/
│   ├── api/          # axios instance i API pozivi po modulu
│   ├── components/   # zajednički UI komponenti
│   ├── pages/        # stranice vezane za rute
│   ├── hooks/        # custom React hooks
│   ├── context/      # React Context (auth stanje, korisnička uloga)
│   ├── utils/        # helper funkcije
│   └── main.jsx      # entry point
├── .env.example
├── vite.config.js
└── package.json
```

---

### 2.3 Backend — Node.js + Express

**Programski jezik:** JavaScript (Node.js 20 LTS)

**Framework:** Express 4.x

**ORM:** Prisma 5.x — type-safe pristup bazi, automatske migracije, čitljiva schema definicija

**Ključne biblioteke i moduli:**

- `jsonwebtoken` — generisanje i verifikacija JWT tokena
- `bcrypt` — hashiranje lozinki (salt rounds: 12)
- `cors` — konfiguracija CORS whiteliste
- `helmet` — sigurnosni HTTP headeri (Content-Security-Policy, XSS zaštita)
- `express-rate-limit` — zaštita od brute-force napada na auth endpointe
- `winston` — strukturirano logovanje (audit log — NFR-13). Logovi se čuvaju u JSON formatu i zapisuju u fajlove na serveru.
U produkciji je moguće koristiti eksterni log sistem (npr. ELK stack).
- `nodemailer` + SendGrid transport — slanje email notifikacija
- `puppeteer` — server-side generisanje PDF dokumenata
- `zod` — validacija i parsiranje ulaznih podataka na serverskoj strani (NFR-15)
- `dotenv` — upravljanje environment varijablama

**Struktura projekta (backend):**

```
backend/
├── prisma/
│   ├── schema.prisma   # definicija modela baze podataka
│   └── migrations/     # automatski generisane migracije
├── src/
│   ├── routes/         # Express rute po modulu (auth, lige, utakmice, rezervacije...)
│   ├── controllers/    # obrada zahtjeva, pozivi servisa
│   ├── services/       # poslovna logika
│   ├── middleware/      # auth middleware, RBAC provjera, error handler
│   ├── utils/          # helper funkcije (jwt, logger, email...)
│   └── app.js          # Express app inicijalizacija
├── .env.example
├── Dockerfile
└── package.json
```



### 2.3.1 API dokumentacija

Backend API je dokumentovan pomoću OpenAPI (Swagger) standarda.

- Dokumentacija dostupna na `/api/docs`
- Omogućava pregled i testiranje endpointa
- Definiše request/response modele i error kodove
---

### 2.4 Baza podataka — PostgreSQL

**Verzija:** PostgreSQL 16.x

**ORM/Migration alat:** Prisma — schema se definira u `prisma/schema.prisma`, migracije se generišu i primjenjuju automatski

**Konfiguracija:**

- `DATABASE_URL` se čuva kao environment varijabla, nikad se ne commit-uje u repozitorij
- U produkciji: PostgreSQL Primary + Replica za visoku dostupnost i failover (NFR-03)
- Redovni backup: pg_dump automatizovan kroz cron job (NFR-11)

**Pokretanje lokalno:** PostgreSQL se pokreće kao Docker kontejner definisan u `docker-compose.yml`

---

### 2.5 AI servis — Python + Flask

**Programski jezik:** Python 3.11

**Framework:** Flask 3.x — minimalan web framework za izlaganje predikcijskog endpointa

**Ključne biblioteke:**

- `scikit-learn` — ML modeli za predikciju ishoda utakmica
- `pandas` — obrada i transformacija historijskih podataka
- `numpy` — numeričke operacije
- `joblib` — serijalizacija i učitavanje treniranog modela

**Komunikacija:** AI servis izlaže jedan interni REST endpoint (`/predict`) koji prima JSON payload s historijskim podacima od backenda i vraća predikciju. Nije dostupan javno — komunikacija je isključivo unutar Docker mreže.

**Struktura projekta (AI servis):**

```
ai-service/
├── model/
│   └── model.pkl       # serijalizovani trenirani model
├── src/
│   ├── app.py          # Flask app i /predict endpoint
│   ├── predict.py      # logika predikcije
│   └── train.py        # skripta za trening modela
├── requirements.txt
└── Dockerfile
```

---

### 2.6 Kontejnerizacija — Docker

Svi servisi pokreću se u Docker kontejnerima orkestriranim s **Docker Compose**. Ovo osigurava konzistentnost između razvojnog i produkcijskog okruženja — "radi na mom računaru" problem je eliminisan.

**`docker-compose.yml` definira četiri servisa:**

```
services:
  frontend      → React app (Nginx serving build)
  backend       → Node.js + Express
  ai-service    → Python + Flask
  db            → PostgreSQL
```

Svi servisi su na istoj internoj Docker mreži. AI servis i baza podataka nisu izloženi prema internetu — dostupni su samo unutar Docker mreže (backend im pristupa po nazivu servisa).

**Struktura repozitorija (cijeli projekat):**

```
SI---Grupa-6/
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── Dockerfile
│   └── package.json
├── ai-service/
│   ├── src/
│   ├── Dockerfile
│   └── requirements.txt
├── nginx/
│   └── nginx.conf        # reverse proxy konfiguracija
├── docker-compose.yml    # razvojno okruženje
├── docker-compose.prod.yml  # produkcijsko okruženje
└── .github/
    └── workflows/
        └── deploy.yml    # CI/CD pipeline
```

---

### 2.7 Web server i deployment

#### Web server: Nginx

**Nginx** se koristi u dvije uloge:

1. **Reverse proxy** — prima sve dolazne HTTPS zahtjeve i prosljeđuje ih odgovarajućem servisu
2. **Static file server** — servira React build (HTML, CSS, JS) direktno, bez potrebe za Node.js serverom za statičke fajlove

**Routing logika u Nginx:**

```
/ → servira React SPA (index.html + statički assets)
/api/* → prosljeđuje na backend (Node.js:3000)
```

**SSL/TLS:** Let's Encrypt certifikat, automatski obnavljan putem Certbota.

Nginx konfiguracija uključuje sigurnosne headere kao što su HSTS, X-Frame-Options i X-Content-Type-Options radi dodatne zaštite aplikacije.

#### Hosting: VPS (Virtual Private Server)

Tim je odabrao **VPS** kao hosting platformu iz sljedećih razloga:

| Opcija | Razlog odluke |
|---|---|
| Fizički server |  Visok trošak, potrebno fizičko održavanje |
| Managed cloud (Heroku, Render) |  Ograničena kontrola, skuplje pri rastu, free tier ograničenja |
| **VPS** (DigitalOcean / Hetzner) |  Puna kontrola, niska cijena (5–10 €/mj.), dovoljno resursa za MVP |

**Operativni sistem:** Ubuntu 24.04 LTS — stabilan, dugoročna podrška, široka dokumentacija

**Aplikacijski server:** Node.js proces koji pokreće Express app unutar Docker kontejnera — nije potreban poseban aplikacijski server (kao što je npr. PM2 van Dockera) jer Docker Compose upravlja pokretanjem i restartem servisa.

#### Okruženja (Environments)

Sistem koristi dva osnovna okruženja:

- **Development** — lokalno razvojno okruženje pokrenuto putem Docker Compose-a
- **Staging** — testno okruženje identično produkciji koje služi za validaciju prije produkcijskog deploya
- **Production** — produkcijsko okruženje deployano na VPS serveru

Deployment tok: development → staging → production


---

### 2.8 CI/CD pipeline — GitHub Actions

Svaki merge u `main` granu automatski pokreće **GitHub Actions** workflow koji prolazi kroz sljedeće korake:

```
1. Checkout koda
2. Install dependencies (npm ci za backend i frontend)
3. Lint provjera (ESLint)
4. Pokretanje unit testova
5. Build Docker image-a
6. Push image-a na Docker Hub (ili GitHub Container Registry)
7. SSH na VPS → pull novih image-a → docker compose up -d
```

**Environment varijable** (DATABASE_URL, JWT_SECRET, SENDGRID_API_KEY i sl.) čuvaju se kao **GitHub Actions Secrets** i nikad se ne nalaze u kodu repozitorija.

**`.env.example`** fajl postoji u svakom servisu i dokumentuje koje varijable su potrebne, bez stvarnih vrijednosti — služi kao vodič za lokalno podešavanje.


Docker image-i se verzionišu pomoću tagova (npr. latest, v1.0.0).

U slučaju neuspješnog deploymenta, sistem omogućava rollback na prethodnu stabilnu verziju image-a.
---
