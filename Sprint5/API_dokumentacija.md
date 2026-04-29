# API Dokumentacija - Sprint 5: Autentifikacija i Upravljanje Ulogama

## Pregled
Ovaj dokument opisuje sve autentifikacijske API-je i rute za Sistem za upravljanje sportskim ligama. Uključuje registraciju sa PENDING sistemom, prijavu, odjavu, i admin operacije.

**Verzija:** 1.0
**Status:** Sprint 5 - In Progress

---



---

##  SVE RUTE - PREGLED

### Autentifikacijske Rute

| Metoda | Ruta | Opis | Autentifikacija |
|--------|------|------|-----------------|
| **POST** | `/api/auth/register` | Registracija korisnika | ❌ Ne |
| **POST** | `/api/auth/login` | Prijava korisnika | ❌ Ne |
| **POST** | `/api/auth/logout` | Odjava korisnika | ✅ Da |
| **GET** | `/api/auth/profile` | Dohvati profil korisnika | ✅ Da |


### Admin Rute - Upravljanje Ulogama

| Metoda | Ruta | Opis | Autentifikacija | Uloga |
|--------|------|------|-----------------|-------|
| **GET** | `/api/admin/pending-roles` | Svi zahtjevi za ulogu | ✅ Da | ADMIN |
| **POST** | `/api/admin/approve-role/:userId` | Odobri ulogu | ✅ Da | ADMIN |
| **POST** | `/api/admin/reject-role/:userId` | Odbij ulogu | ✅ Da | ADMIN |
| **GET** | `/api/admin/users` | Svi korisnici | ✅ Da | ADMIN |
| **PATCH** | `/api/admin/user/:userId/role` | Promijeni ulogu | ✅ Da | ADMIN |

---

##  AUTENTIFIKACIJSKE RUTE

### 1️⃣ REGISTRACIJA SA PENDING SISTEMOM

#### Ruta
```
POST /api/auth/register
```

#### Opis
Korisnik se registrira sa mogućnošću da odabere željenu ulogu. Ako odabere ulogu drugačiju od NAVIJAC-a, taj zahtjev ide na PENDING dok admin ne odobri.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "korisnik@primjer.ba",
  "lozinka": "SignurnaLozinka123!",
  "punoIme": "Marko Marković",
  "trazenaUloga": "VLASNIK",
  "documents": ["https://storage.example.com/doc1.pdf", "https://storage.example.com/doc2.pdf"]
}
```

**Parametri:**

| Polje | Tip | Obavezno | Opis | Primjer |
|-------|-----|----------|------|---------|
| `email` | String |  Da | Email adresa (UNIQUE) | `"korisnik@primjer.ba"` |
| `lozinka` | String |  Da | Min 8 znakova: velika/mala/broj/specijalni | `"SignurnaLozinka123!"` |
| `punoIme` | String |  Da | Puno ime korisnika | `"Marko Marković"` |
| `trazenaUloga` | Enum | Da | Željena uloga  | `"VLASNIK"` |
| `documents` | Array |  Ne | URL-ovi na dokumente | `["url1", "url2"]` |

**Dozvoljene Vrijednosti za `requestedRole`:**
```
- NAVIJAC       ( gleda samo rezultate/default)
- IGRAC         (Trebam igrati u timu)
- TRENER        (Trebam voditi tim)
- VLASNIK       (Trebam biti vlasnik objekta)

```

 **ZABRANE pri registraciji:**
- ORGANIZATOR (samo admin)
- ADMINISTRATOR (samo initial setup)

#### Success Response (201 Created)

```json
{
  "korisnik": {
    "korisnikId": 1,
    "email": "korisnik@primjer.ba",
    "punoIme": "Marko Marković",
    "trenutnaUloga": "NAVIJAC",
    "trazenaUloga": "VLASNIK",
    "statusUloge": "PENDING",
    "datumZahtjeva": "2026-04-27T10:30:00Z"
  },
 
  "poruka_uloge": {
    "trenutna": "NAVIJAC",
    "trazena": "VLASNIK",
    "status": "PENDING",
  }
}
```

#### Error Responses

**❌ 400 - Email ili Lozinka Nedostaju**
```json
{
  "greska": "GRESKA_VALIDACIJE",
  "poruka": "Email i lozinka su obavezni"
}
```

**❌ 409 - Email Već Postoji**
```json
{
  
  "greska": "EMAIL_VEC_POSTOJI",
  "poruka": "Korisnik sa ovim email-om je vec registriran"
}
```

**❌ 400 - Nevaljana Uloga**
```json
{
  "greska": "NEVALJANA_ULOGA",
  "poruka": "Uloga mora biti: NAVIJAC, IGRAC, TRENER ili VLASNIK",
  "dozvoljene": ["NAVIJAC", "IGRAC", "TRENER", "VLASNIK"]
}
```

**❌ 400 - Slaba Lozinka**
```json
{
  "greska": "SLABA_LOZINKA",
  "poruka": "Lozinka mora sadrzavati: minimum 8 znakova, velika slova, mala slova, broj, specijalni znak",
  "zahtjevi": {
    "minLength": 8,
    "trebaMalaSlova": true,
    "trebaVelikaSlova": true,
    "trebaBroj": true,
    "trebaSpecijalnZnak": "@#$%^&*"
  }
}
```

**❌ 500 - Greška Servera**
```json
{
  "greska": "GREŠKA_REGISTRACIJE",
  "poruka": "Greska pri registraciji korisnika"
}
```


 

---

### 2️⃣ PRIJAVA

#### Ruta
```
POST /api/auth/login
```

#### Opis
Autentificira korisnika sa email-om i lozinkom. Vraća JWT token i informacije o ulozi.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "korisnik@primjer.ba",
  "lozinka": "SignurnaLozinka123!"
}
```

**Parametri:**

| Polje | Tip | Obavezno | Opis |
|-------|-----|----------|------|
| `email` | String | ✅ Da | Registrirana email adresa |
| `lozinka` | String | ✅ Da | Korisnikova lozinka |

#### Success Response (200 OK)

```json
{
  
  "poruka": "Uspjesna prijava",
  "korisnik": {
    "korisnikId": 1,
    "email": "korisnik@primjer.ba",
    "punoIme": "Marko Marković",
    "trenutnaUloga": "NAVIJAC",
  },
   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   "refresh_token": "gkfjhyjytI1NiIsIn77tgryjVCJ9...",
  "isticeZa": "24h",
  "poruka_pending": "Trebam odobrenja administratora za ulogu VLASNIK"
}
```


```

#### Error Responses

**❌ 400 - Email ili Lozinka Nedostaju**
```json
{
  
  "greska": "GRESKA_VALIDACIJE",
  "poruka": "Email i lozinka su obavezni"
}
```

**❌ 404 - Korisnik Nije Pronađen**
```json
{
  
  "greska": "KORISNIK_NIJE_PRONADJEN",
  "poruka": "Korisnik sa ovim email-om nije pronadjen"
}
```

**❌ 401 - Nevaljane Akreditive**
```json
{
  
  "greska": "NEVALJANE_AKREDITIVE",
  "poruka": "Email ili lozinka nisu ispravni"
}
```



---

### 3️⃣ ODJAVA

#### Ruta
```
POST /api/auth/logout
```

#### Opis
Odjavljuje trenutnog korisnika i poništava token sesije.

#### Request

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{}
```

#### Success Response (200 OK)

```json
{
  
  "poruka": "Uspjesno ste se odjavili",
  "korisnikId": 1
}
```

#### Error Responses

**❌ 401 - Nema Tokena**
```json
{
  
  "greska": "NEOVLASTEN",
  "poruka": "Token nije pronadjen ili je nevaljani"
}
```

**❌ 403 - Token Istekao**
```json
{
  
  "greska": "TOKEN_ISTEKAO",
  "poruka": "Vaš token je istekao. Molimo prijavite se ponovno"
}
```



### 4️⃣ DOHVATI PROFIL

#### Ruta
```
GET /api/auth/profile
```

#### Opis
Dohvaća profil trenutnog korisnika (autentificiranog).

#### Request

**Headers:**
```
Authorization: Bearer <access_token>
```

#### Success Response (200 OK)

```json
{
  "uspjeh": true,
  "korisnik": {
    "korisnikId": 1,
    "email": "korisnik@primjer.ba",
    "punoIme": "Marko Marković",
    "trenutnaUloga": "NAVIJAC",
    "trazenaUloga": "VLASNIK",
    "statusUloge": "PENDING",
    "datumKreiranja": "2026-04-27T10:30:00Z",
    "datumZahtjeva": "2026-04-27T10:30:00Z",
    "documents": ["https://storage.example.com/doc1.pdf"]
  }
}
```

#### Error Responses

**❌ 401 - Nema Tokena**
```json
{
  
  "greska": "NEOVLASTEN",
  "poruka": "Token nije pronađen"
}
```



---

### 5️⃣ OSVJEŽI TOKEN

#### Ruta
```
POST /api/auth/refresh-token
```

#### Opis
Osvježi JWT token kada je o isteku ili blizu isteka.

#### Request

**Headers:**
```
Authorization: Bearer <refresh_token>
```

#### Success Response (200 OK)

```json
{
  
  "access_token": "novi_access_token_ovdje...",
  "refresh_token": "opcionalno_novi_refresh_token...",
  "isticeZa": "24h"
}
```

---

## ADMIN RUTE - UPRAVLJANJE ULOGAMA

### 1️⃣ DOHVATI SVE PENDING ZAHTJEVE

#### Ruta
```
GET /api/admin/pending-roles
```

#### Opis
Admin vidi sve zahtjeve za nove uloge koji čekaju odobrenja (status: PENDING).

#### Request

**Headers:**
```
Authorization: Bearer <access_token>
```

#### Success Response (200 OK)

```json
{
  "uspjeh": true,
  "zahtjevi": [
    {
      "zahtjevId": 1,
      "korisnik": {
        "korisnikId": 1,
        "email": "vlasnik@primjer.ba",
        "punoIme": "Jasmin Vlasnik"
      },
      "trazenaUloga": "VLASNIK",
      "statusUloge": "PENDING",
      "datumZahtjeva": "2026-04-27T10:30:00Z",
      "documents": ["https://storage/doc1.pdf", "https://storage/doc2.pdf"],
      "razlogOdbijanja": null
    },
    {
      "zahtjevId": 2,
      "korisnik": {
        "korisnikId": 2,
        "email": "trener@primjer.ba",
        "punoIme": "Aner Trener"
      },
      "trazenaUloga": "TRENER",
      "statusUloge": "PENDING",
      "datumZahtjeva": "2026-04-27T12:00:00Z",
      "documents": null
    }
  ],
  "ukupnoPending": 2
}
```




---

### 2️⃣ ODOBRI ULOGU

#### Ruta
```
POST /api/admin/approve-role/:userId
```

#### Opis
Admin odobrava zahtjev korisnika za novu ulogu. Korisnik se promovira na željanu ulogu.

#### Request

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "napomena": "Dokumenti su provjerjeni i u redu"
}
```

**Parametri URL:**

| Parametar | Tip | Opis |
|-----------|-----|------|
| `userId` | Int | ID korisnika kojem se odobrava ulogu |

#### Success Response (200 OK)

```json
{
  "uspjeh": true,
  "poruka": "Zahtjev je odobren",
  "korisnik": {
    "korisnikId": 1,
    "email": "vlasnik@primjer.ba",
    "punoIme": "Jasmin Vlasnik",
    "trenutnaUloga": "VLASNIK",
    "trazenaUloga": null,
    "statusUloge": "ODOBREN",
    "datumOdobrenja": "2026-04-27T14:30:00Z"
  }
}
```

#### Error Responses

**❌ 404 - Korisnik Nije Pronađen**
```json
{
  "uspjeh": false,
  "greška": "KORISNIK_NIJE_PRONAĐEN",
  "poruka": "Korisnik nije pronađen"
}
```

**❌ 400 - Nema PENDING Zahtjeva**
```json
{
  "uspjeh": false,
  "greška": "NEMA_ZAHTJEVA",
  "poruka": "Ovaj korisnik nema PENDING zahtjeva"
}
```


### 3️⃣ ODBIJ ULOGU

#### Ruta
```
POST /api/admin/reject-role/:userId
```

#### Opis
Admin odbija zahtjev korisnika za novu ulogu. Korisnik ostaje sa trenutnom ulogom (obično NAVIJAC).

#### Request

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "razlog": "Dokumenti nisu jasni, trebam uplata racuna"
}
```

**Parametri:**

| Polje | Tip | Obavezno | Opis |
|-------|-----|----------|------|
| `razlog` | String | ✅ Da | Zašto je zahtjev odbijen |

#### Success Response (200 OK)

```json
{
  "uspjeh": true,
  "poruka": "Zahtjev je odbijen",
  "korisnik": {
    "korisnikId": 1,
    "email": "vlasnik@primjer.ba",
    "punoIme": "Jasmin Vlasnik",
    "trenutnaUloga": "NAVIJAC",
    "trazenaUloga": null,
    "statusUloge": "ODBIJEN",
    "razlogOdbijanja": "Dokumenti nisu jasni, trebam uplata racuna",
    "datumOdbijanja": "2026-04-27T14:30:00Z"
  }
}
```



---

### 4️⃣ PROMIJENI ULOGU KORISNIKA

#### Ruta
```
PATCH /api/admin/user/:userId/role
```

#### Opis
Admin direktno promijeni ulogu korisnika (bez PENDING procesa).

#### Request

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "novaUloga": "ORGANIZATOR"
}
```

**Parametri:**

| Polje | Tip | Obavezno | Opis |
|-------|-----|----------|------|
| `novaUloga` | String | ✅ Da | Nova uloga (bilo koja) |

#### Success Response (200 OK)

```json
{
  "uspjeh": true,
  "poruka": "Ulogu je promijenjena",
  "korisnik": {
    "korisnikId": 1,
    "email": "vlasnik@primjer.ba",
    "punoIme": "Jasmin Vlasnik",
    "trenutnaUloga": "ORGANIZATOR",
    "trazenaUloga": null,
    "statusUloge": "ODOBREN"
  }
}
```



---

## KOMPLETAN TOK - PRIMJER

### Scenario: Korisnik Želi Biti Vlasnik

```
1. KORISNIK SE REGISTRIRA
   ├─ POST /api/auth/register
   ├─ requestedRole: "VLASNIK"
   └─ Odgovol: statusUloge: "PENDING"

2. KORISNIK SE PRIJAVLJUJE
   ├─ POST /api/auth/login
   └─ Vidi: trazenaUloga: "VLASNIK", statusUloge: "PENDING"

3. ADMIN VIDI ZAHTJEV
   ├─ GET /api/admin/pending-roles
   ├─ Vidi korisnika sa PENDING zahtjevom
   ├─ Gleda dokumente
   └─ Odlučuje

4. ADMIN ODOBRAVA
   ├─ POST /api/admin/approve-role/1
   └─ Korisnik je sada VLASNIK!

5. KORISNIK DOBIJA EMAIL
   ├─ "Vaša ulogu VLASNIK je odobrena"
   ├─ Peut se sad registrira objekat
   └─ Peut kreirať termine

6. KORISNIK SE PONOVNO PRIJAVLJUJE
   ├─ POST /api/auth/login
   └─ Vidi: trenutnaUloga: "VLASNIK"
```

---
