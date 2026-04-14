# Architecture Overview

---

## 1. Kratak opis arhitektonskog pristupa

Sistem je zasnovan na **troslojevitoj klijent-server arhitekturi** (Three-Tier Architecture) s jasnom podjelom odgovornosti između prezentacijskog sloja, poslovne logike i sloja podataka. Komunikacija između klijenta i servera odvija se isključivo putem **REST API-ja**, što omogućava nezavisnost frontend i backend komponenti.

Arhitektura je dizajnirana da podrži zahtjeve definisane u NFR dokumentu — posebno skalabilnost (NFR-02), sigurnost kroz RBAC (NFR-05), pouzdanost sa 99% uptime (NFR-03) i responzivan interfejs (NFR-06). Sistem predviđa i integrisanu **AI komponentu** za predikciju rezultata (NFR-17) kao odvojeni servis koji komunicira s ostatkom sistema putem internog API poziva.

Arhitekturni stil prati **modularan monolitni pristup** u početnoj fazi razvoja (MVP), s mogućnošću budućeg prelaska na mikroservise kako sistem bude rastao (NFR-09).

---

## 2. Glavne komponente sistema

Sistem se sastoji od četiri glavne komponente:

| Komponenta | Tehnologija (prijedlog) | Opis |
|---|---|---|
| **Frontend (klijentska aplikacija)** | React.js | Korisnički interfejs dostupan putem web preglednika |
| **Backend (API server)** | Node.js + Express | Poslovna logika i REST API |
| **Baza podataka** | PostgreSQL | Trajno čuvanje svih podataka sistema |
| **AI servis** | Python + scikit-learn / Flask | Modul za predikciju rezultata utakmica |

Pored ovih, sistem koristi i sljedeće pomoćne servise:
- **Email servis** (npr. SendGrid / Nodemailer) — za slanje notifikacija (NFR-10)
- **Sistem za autentifikaciju** — JWT tokeni za upravljanje sesijama
- **PDF generator** — za izvoz tabela i rasporeda (PB-39, UC-23)

---

## 3. Odgovornosti komponenti

### Frontend — React.js
- Prikazuje korisnički interfejs prilagođen ulozi korisnika (gost, igrač, trener, organizator, administrator, vlasnik objekta)
- Komunicira s backendom isključivo putem HTTP zahtjeva na REST API
- Implementira responzivan dizajn za desktop i mobilne uređaje (NFR-06, NFR-14)
- Rukuje lokalnim stanjem aplikacije i rutiranjem između stranica

### Backend — Node.js + Express
- Prima i obrađuje sve zahtjeve s frontenda
- Implementira **poslovnu logiku**: upravljanje ligama, rasporedima, rezultatima, rezervacijama
- Provodi autentifikaciju i autorizaciju putem **RBAC sistema** (NFR-05)
- Komunicira s bazom podataka i AI servisom
- Bilježi audit log svih važnih akcija korisnika (NFR-13)
- Šalje zahtjeve email servisu za slanje notifikacija

### Baza podataka — PostgreSQL
- Trajno čuva sve podatke: korisnike, timove, lige, utakmice, rezultate, rezervacije, objekte
- Garantuje integritet podataka kroz ograničenja (sprečavanje duplikata rezervacija — NFR-16)
- Podržava redovni backup i restore (NFR-11)
- Optimizovana za brzo filtriranje i pretraživanje rasporeda i rezultata (NFR-12)

### AI servis — Python + Flask
- Trenira model na historijskim podacima utakmica i formi timova
- Na zahtjev backenda generiše predikcije ishoda nadolazećih utakmica
- Vraća predikcije backendu koji ih proslijeđuje frontend aplikaciji
- Ciljna tačnost predikcije: 60–70% (NFR-17)
- Dostupan kao odvojeni interni mikroservis

---

## 4. Tok podataka i interakcija

Korisnik komunicira isključivo s frontend aplikacijom putem web preglednika. Frontend ne pristupa bazi podataka direktno — svaki zahtjev koji zahtijeva podatke ili akciju šalje se backendu kao HTTP poziv na odgovarajuću API rutu. Backend je centralna tačka sistema: prima zahtjev, provjerava autentifikaciju i autorizaciju korisnika, izvršava poslovnu logiku i po potrebi komunicira s bazom podataka, AI servisom ili email servisom. Rezultat se vraća frontendu koji ga prikazuje korisniku.

Baza podataka nije direktno dostupna ni jednoj komponenti osim backendu, što osigurava jedinstven i kontrolisan pristup podacima. AI servis funkcioniše kao odvojeni interni servis koji reaguje samo na pozive backenda — ne prima zahtjeve s frontenda i nema direktan pristup bazi, već historijske podatke potrebne za predikcije dobija od backenda. Email servis se poziva asinhrono, što znači da slanje notifikacije ne blokira odgovor koji korisnik čeka.

### Opis ključnih tokova

**Tok autentifikacije (UC-01, UC-02):**
Korisnik unosi kredencijale na frontendu → backend validira podatke i provjerava bazu → izdaje JWT token → frontend čuva token i šalje ga pri svakom narednom zahtjevu → backend provjerava token i ulogu korisnika (RBAC).

**Tok zakazivanja utakmice (UC-07):**
Organizator popunjava formu na frontendu → zahtjev ide na backend → backend provjerava dostupnost termina u bazi → sprema utakmicu → šalje notifikaciju relevantnim korisnicima putem email servisa.

**Tok unosa rezultata i ažuriranja tabele (UC-08, UC-09):**
Ovlašteni korisnik unosi rezultat → backend sprema rezultat u bazu → backend automatski izračunava bodove i ažurira tabelu → frontend prikazuje ažuriranu tabelu u realnom vremenu.

**Tok rezervacije termina (UC-14, UC-16, UC-17):**
Korisnik šalje zahtjev za rezervaciju → backend provjerava dostupnost → kreira zahtjev u bazi sa statusom "na čekanju" → vlasnik objekta pregleda zahtjev i odobrava/odbija → sistem mijenja status termina i šalje notifikaciju korisniku.

**Tok AI predikcije (UC-21):**
Korisnik otvara sekciju predikcija → frontend šalje zahtjev backendu → backend prosljeđuje zahtjev AI servisu → AI servis dohvata historijske podatke iz baze i generiše predikciju → backend vraća predikciju frontendu → prikazuje se korisniku kao informativni sadržaj.

---

## 5. Ključne tehničke odluke

| Odluka | Odabir | Razlog |
|---|---|---|
| Arhitekturni stil | Modularan monolith (MVP) | Brži razvoj u ranoj fazi; olakšava debugiranje i testiranje u timu |
| Komunikacija klijent–server | REST API (JSON) | Standardizovan, dobro podržan, jednostavan za testiranje i dokumentovanje |
| Autentifikacija | JWT (JSON Web Token) | Bez stanja na serveru (stateless), pogodno za skaliranje; podržava RBAC |
| Baza podataka | PostgreSQL (relacijska) | Kompleksne relacije između entiteta (timovi, lige, utakmice, rezervacije) zahtijevaju relacijski model; podrška za transakcije i integritet |
| Frontend framework | React.js | Komponentna arhitektura, velika zajednica, pogodna za dinamičan UI s više uloga |
| AI servis | Odvojen Python/Flask servis | Izolacija AI logike od poslovne logike; lakša zamjena modela bez uticaja na ostatak sistema |
| Sigurnost | HTTPS + bcrypt + RBAC | Zahtjevi NFR-04 i NFR-05; enkripcija lozinki i zaštita svih ruta |
| Notifikacije | Email (async) | Najdostupniji kanal za sve uloge korisnika; zadovoljava NFR-10 (max 1 min kašnjenje) |

---

## 6. Ograničenja i rizici arhitekture

| # | Ograničenje / Rizik | Uticaj | Moguće rješenje |
|---|---|---|---|
| 1 | Monolitna arhitektura otežava nezavisno skaliranje pojedinih modula | Srednji | Planirati modularnu strukturu koda radi lakše migracije na mikroservise u budućnosti |
| 2 | AI servis zahtijeva dovoljno historijskih podataka za kvalitetne predikcije | Visok | Koristiti javno dostupne sportske datasete u ranoj fazi; jasno obavijestiti korisnike da su predikcije informativne |
| 3 | Istovremeni zahtjevi za rezervaciju mogu uzrokovati konflikt podataka | Visok | Implementirati optimistic locking ili database-level locking za rezervacije (NFR-16) |
| 4 | JWT tokeni ne mogu biti invalidovani bez dodatne infrastrukture (token blacklist) | Srednji | Implementirati kratko trajanje tokena + refresh token mehanizam |
| 5 | Email notifikacije mogu biti označene kao spam | Nizak | Koristiti provjerenog email providera (npr. SendGrid) s autentifikovanom domenom |
| 6 | Responzivan dizajn zahtijeva dodatno testiranje na različitim uređajima | Nizak | Integrirati testiranje na različitim browserima u Definition of Done (NFR-14) |

---

## 7. Otvorena pitanja

- **Koji JavaScript framework za frontend?** — React.js je predložen, ali tim treba donijeti finalnu odluku i evidentirati je u Decision Logu.
- **Hosting i deployment infrastruktura** — Gdje će sistem biti hostovan (cloud, VPS, lokalni server)? Ovo utiče na CI/CD pipeline (PB-16).
- **Konkretna biblioteka za AI model** — scikit-learn, TensorFlow Lite ili drugi? Ovisi o raspoloživim podacima i složenosti modela.
- **Real-time ažuriranje tabele** — Koristiti polling ili WebSocket konekciju za prikaz rezultata u realnom vremenu?
- **Strategija za seed podatke** — Kako inicijalno popuniti bazu dovoljnim količinama historijskih podataka za AI komponentu?


## 8. Veza sa Risk Registerom

Ograničenja i rizici navedeni u ovoj sekciji povezani su sa detaljno definisanim rizicima u Risk Register dokumentu.

Arhitekturne odluke sistema direktno su povezane sa identifikovanim rizicima iz Risk Register dokumenta, kako bi se smanjila vjerovatnoća njihovog nastanka i njihov uticaj na sistem.

U nastavku su prikazane ključne veze između arhitekture i identifikovanih rizika:

- **R2 (Netačan prikaz podataka):**  
  Backend sloj implementira validaciju i kontrolu podataka, dok se kroz jasno definisan API osigurava konzistentan prikaz između baze i frontend-a.

- **R3 (Filtriranje i performanse):**  
  Optimizacija upita i razdvajanje logike između frontend-a i backend-a smanjuju rizik pogrešnih rezultata i usporenja sistema.

- **R6 (RBAC sigurnost):**  
  Auth & RBAC komponenta osigurava da svaki API poziv prolazi kroz provjeru dozvola, čime se sprječava neovlašten pristup podacima.

- **R7 (Autentifikacija i sesije):**  
  Korištenje JWT tokena omogućava sigurno i skalabilno upravljanje korisničkim sesijama.

- **R10 i R11 (Uvoz podataka):**  
  Data Ingestion servis implementira parsiranje, validaciju i mapiranje podataka prije njihovog unosa u bazu.

- **R12 i R13 (AI nepouzdanost):**  
  AI modul je izdvojen kao zaseban servis, što omogućava njegovu nezavisnu evaluaciju, zamjenu i unapređenje bez uticaja na ostatak sistema.

- **R14 (Notifikacije):**  
  Notification Engine centralizuje generisanje i slanje upozorenja, čime se smanjuje rizik nepravilnog obavještavanja korisnika.

- **R18 (Model baze podataka):**  
  Relacijska baza sa jasno definisanim odnosima smanjuje rizik nekonzistentnosti i grešaka u povezivanju podataka.

- **R21 (Dostupnost sistema):**  
  Docker kontejnerizacija i planirani monitoring omogućavaju veću otpornost sistema i lakši oporavak u slučaju greške.

- **R22 (Kašnjenje razvoja):**  
  Modularna arhitektura omogućava paralelan rad više članova tima i smanjuje zavisnosti između komponenti.


