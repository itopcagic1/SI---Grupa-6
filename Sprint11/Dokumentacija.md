# ZAVRŠNI IZVJEŠTAJ PROJEKTA
## Sistem za upravljanje sportskim terminima i ligama – SportManager

---

## 1. SVRHA I PROBLEM KOJI SISTEM RJEŠAVA

### Svrha sistema

SportManager je digitalna platforma koja centralizuje upravljanje amaterskim i rekreativnim sportskim ligama, turnirima i rezervacijama sportskih objekata. Sistem omogućava jednostavnu organizaciju sportskih dešavanja, transparentan pristup informacijama i bolji kapacitet popunjenosti sportskih terena.

### Problem koji sistem rješava

Prije razvoja ovog sistema, organizacija amaterskog sporta je bila fragmentirana i neformalna:

- **Neefikasna komunikacija:** Obavještenja o rasporedu sportskih dešavanja obavljala su se preko Viber grupa, što je izazivalo propuštene poruke i nesporazume.
- **Manualno upravljanje:** Tabele bodova su se vodile ručno, često na papiru, sa visokim rizikom od grešaka.
- **Nedostatak transparentnosti:** Igrači i gledaoci nisu imali jasan pregled rezultata, rasporeda i statusa timova.
- **Loša popunjenost terena:** Vlasnici objekata nisu imali jednostavan način za upravljanje slobodnim terminima, što je redovito rezultiralo neiskorištenim kapacitetima.
- **Nedostatak povjerenja:** Manipulacija rezultatima i podacima jer nije postojao centralizovan sistem evidencije.

SportManager direktno rješava sve ove probleme pružanjem jedinstvene, moderne i profesionalne platforme.

---

## 2. GLAVNE KORISNIČKE ULOGE

Sistem je dizajniran za sedam tipova korisnika, svaki sa specifičnim potrebama:

| Uloga | Opis | Glavne funkcionalnosti |
|-------|------|----------------------|
| **Administrator** | Upravlja platformom, korisnicima i sistemskim postavkama | Kreiranje sportskih kategorija, odobravanje organizatora, monitoring sistema |
| **Organizator** | Kreira i upravlja ligama i turnirima | Kreiranje rasporeda, unos rezultata, upravljanje timovima |
| **Trener** | Vodi tim i upravlja treninzima | Prijava tima na takmičenja, rezervacija termina za grupne treninge |
| **Igrač** | Učestvuje u timovima i trenira | Pregled rasporeda, rezervacija individualnih termina, pregled rezultata |
| **Vlasnik objekta** | Upravlja sportskim terenima i dvoranama | Unos dostupnosti termina, odobravanje/odbijanje rezervacija |
| **Navijač** | Prati rezultate utakmica, raspored održavanja i omiljene timove | Pregled rezultata, odabir omiljenih timova, primanje notifikacija o omiljenom timu |
| **Gost** | Javni posjetilac platforme | Pregled rasporeda, tabela i rezultata bez potrebe za registracijom |

---

## 3. GLAVNE IMPLEMENTIRANE FUNKCIONALNOSTI

### Sprint 1–3: Planiranje i pripreme
- **Sprint 1:** Definisanje Project Vision, Product Backlog, Team Charter, Stakeholder Map
- **Sprint 2:** Pisanje User Stories sa Acceptance Criteria-ima, prioritizacija backlog stavki
- **Sprint 3:** Izrada Domain modela, Use Case modela, Risk Register-a, Architecture Overview-a

### Sprint 4–6: Tehnička infrastruktura i osnovna funkcionalnost
- **Sprint 4:** Tehnički setup, postavljanje Docker okruženja, inicijalizacija baze podataka
- **Sprint 5:** Implementacija autentifikacije (registracija i prijava korisnika), JWT + RBAC sistem
- **Sprint 6:** Upravljanje ligama i timovima, kreiranje timskih entiteta, dodavanje članova u timove

### Sprint 7: Zakazivanje utakmica
- Implementacija generisanja rasporeda za lige (automated scheduling)
- Pregled rasporeda s mogućnošću filtriranja po ligama, datumima i timovima
- Automatski razmak od najmanje 2 sata između utakmica

### Sprint 8: Rezultati i tabele
- Unos rezultata odigranih utakmica (modal interfejs)
- Automatsko ažuriranje tabele odmah nakon unosa rezultata
- Računanje bodova (3 za pobjedu, 1 za remi, 0 za poraz)
- Dinamička gol-razlika i rerangiranje timova

### Sprint 9: Upravljanje objektima i rezervacije
- Pregled dostupnosti sportskih terena i dvorana u realnom vremenu
- Sistem rezervacije sa zahtjevima (pending status) koje odobrava vlasnik
- Odjava sa termina sa razlogom (povrede, nezgodna dospjeća)
- Lista čekanja za zauzete termine sa "brzim prstom" mehanizmom
- Kazneni sistem za prekršaje (otkazivanja unutar 24h, dodavanje na listu nepouzdanih)

### Sprint 10: Navijači i finalne funkcionalnosti
- Dodavanje omiljenih timova (srce ikona) za registrovane navijače
- Automatske notifikacije o rezultatima i rasporedu omiljenih timova
- Ekran "Notifikacije" sa mogućnošću označavanja kao pročitane
- PDF izvoz tabela, rezultata i rasporeda (ograničeno na administratora, organizatora, trenera)
- Zamjena standardnih browser alert/confirm prozora sa prilagođenim React modalima

---

## 4. PREGLED RADA KROZ SPRINTOVE

### Statistika završetka po sprintovima

| Sprint | Glavni fokus | Funkcionalnosti | Status | Napomena |
|--------|-------------|-----------------|--------|----------|
| **1–3** | Planiranje i dizajn | 8 stavki (Vision, Models, Architecture) | Done | Sve dokumentacije završene |
| **4** | Tehnički setup | Docker, DB, CI/CD | Done | Infrastructure ready |
| **5** | Autentifikacija | Login/Register, JWT, RBAC | Done | Security foundation |
| **6** | Upravljanje ligama | Lige, Timovi, Članstva | Done | Core entities |
| **7** | Rasporedi | Generisanje, Pregled, Filtriranje | Done | Automated scheduling |
| **8** | Rezultati & Tabele | Unos rezultata, auto-ažuriranje tabele | Done | Real-time table updates |
| **9** | Rezervacije | Termini, Zahtjevi, Lista čekanja, Otkazivanja | Done | Complex booking logic |
| **10** | Notifikacije & PDF | Omiljeni timovi, Notifikacije, PDF izvoz | Done | Final user features |

### Ukupna statistika
- **Ukupno planiranih stavki:** 38 (PB-01 do PB-38)
- **Završeno:** ~36 stavki (94%)
- **Jednostavno napušteno:** 2 stavke (PDF export u Sprint 10, Online plaćanje van MVP scope-a)

---

## 5. ŠTA JE ZAVRŠENO, DJELIMIČNO ZAVRŠENO ILI NIJE ZAVRŠENO

### ✅ Potpuno završeno

1. **Autentifikacija i autorizacija** – JWT + bcrypt + RBAC po ulogama
2. **Upravljanje ligama i timovima** – Kompletna CRUD operacija
3. **Generisanje rasporeda** – Automatski scheduling sa minimalnim razmakom
4. **Unos rezultata i ažuriranje tabele** – Real-time ažuriranje bodova i plasmana
5. **Sistem rezervacija termina** – Zahtjevi, odobrenja, otkazivanja, lista čekanja
6. **Kazneni sistem** – Praćenje prekršaja i restrikcije nepouzdanih korisnika
7. **Notifikacije** – Email notifikacije za sve bitne promjene
8. **Omiljeni timovi** – Odabir i praćenje timova za navijače
9. **PDF izvoz** – Tabele, rasporedi i rezultati u PDF formatu
10. **Responzivan UI** – Desktop i mobilna optimizacija
11. **Security** – HTTPS, CORS whitelist, RBAC, SQL injection zaštita, Audit log

### ⚠️ Djelimično završeno

1. **AI predikcija** – Arhitektura je pripremljena (Python + scikit-learn), ali nije u produkciji (ostavljena je kao NFR-17 za buduće sprintove)
2. **Bosanski znakovi u PDF-u** – PDFKit ne podržava afrikate (š, č, ć, ž, đ) — poznato ograničenje
3. **Advanced statistika igrača** – Samo osnovni rezultati; žute kartone, asistencije i sl. nije implementirano

### ❌ Nije završeno (van MVP scope-a)

1. **Online plaćanje** – Kotizacije, članarine i zakup se plaćaju van sistema
2. **Integracija s vanjskim kalendarima** – Google Calendar, Outlook sinhronizacija nije implementirana
3. **Mobile aplikacija** – Samo web-based responzivan UI; native iOS/Android aplikacija nije razvijena

---

## 6. GLAVNE TEHNIČKE ODLUKE

### 1. Arhitektonski stil: Modularan monolith (MVP)
**Odabir:** Brži je za razvoj u ranoj fazi, lakši za debugiranje i testiranje, a modularni pristup omogućava kasniju migraciju prema mikroservisima.

### 2. Frontend: React.js + Vite
**Odabir:** Komponentna arhitektura, dostatan ekosistem za SPA aplikacije, većina tima je već znala React.

### 3. Backend: Node.js + Express + Prisma
**Odabir:** Brz razvoj, type-safe pristup bazi, automatske migracije, laka provjera greška.

### 4. Baza podataka: PostgreSQL sa Prisma ORM-om
**Odabir:** Relacijski model je odličan za kompleksne veze između entiteta, Prisma pruža type safety i lakše migracije.

### 5. Autentifikacija: JWT (15 min) + refresh token u httpOnly cookie
**Odabir:** Kratko trajanje JWT-a minimizuje rizik od neovlaštenog pristupa ako se token ukrade, refresh token u httpOnly cookie je zaštićen od XSS napada.

### 6. RBAC (Role-Based Access Control)
**Odabir:** Sedam specifičnih uloga s jasno definisanim dozvolama, čime se osigurava fleksibilnost i sigurnost sistema.

### 7. Real-time ažuriranje: Polling (30s interval) umjesto WebSockets
**Odabir:** Rezultati se unose ručno (ne automatski), pa je polling dovoljno dobar, manje kompleksnosti, lakšeg održavanja.

### 8. Locking za rezervacije: Pessimistic locking na nivou baze
**Odabir:** Sprečava race condition pri istovremenim zahtjevima za isti termin.

### 9. Email notifikacije: Async processing sa SendGrid
**Odabir:** Asinhorna obrada ne blokira korisničke zahtjeve, SendGrid je pouzdan servis.

### 10. PDF generisanje: Server-side sa Puppeteer-om
**Odabir:** Konzistentan output bez ovisnosti o browser okruženju; PDFKit korišten kasnije, ali bez podrške za Unicode znakove.

### 11. Hosting: VPS umjesto cloud platformi
**Odabir:** Puna kontrola, niska cijena (5–10 €/mj), dovoljno resursa za MVP. Alternativa (Heroku/Render) bi bila skuplja i sa manje kontrole.

### 12. CI/CD: GitHub Actions sa automatskim deployment-om
**Odabir:** Integrisan sa GitHub repozitorijumom, besplatan za open source/javne repozitorijume.

---

## 7. NAJVEĆI PROBLEMI TOKOM RAZVOJA I RJEŠENJA

### Problem 1: Konflikt pri migraciji baze na Neon
**Opis:** Neon (cloud PostgreSQL) je imao ograničenja pri lokalnom testiranju. Svaka nova migracija bi dovela do konflikata između članova tima.

**Rješenje:**
- Odluka da se koriste samo postojeće tabele gdje god je moguće (npr. `Notifikacija` za odjave umjesto nove tabele)
- Manje, fokusirane migracije sa jasnom dokumentacijom
- **Rezultat:** Smanjeni konflikti, brža integracija

### Problem 2: Automatsko ažuriranje tabele nakon unosa rezultata
**Opis:** Nije bilo jasno da li tabelu treba ažurirati odmah ili tek kada završi cijelo kolo.

**Rješenje:**
- Implementacija automatskog ažuriranja odmah nakon unosa rezultata
- Računanje bodova i rerangiranje u istoj transakciji
- **Rezultat:** Real-time tabela, bolje korisničko iskustvo

### Problem 3: Nedostajala početna tabela nakon generisanja lige
**Opis:** Kada se raspored generiše, nije postojala inicijalna tabela sa nuliranim vrijednostima.

**Rješenje:**
- Automatsko kreiranje početne tabele sa svim timovima na 0 bodova
- Kaskadno brisanje tabele kada se liga briše
- **Rezultat:** Konzistentan prikaz tabele od početka

### Problem 4: Neadekvatna preglednost rasporeda iz tabele
**Opis:** Korisnici nisu mogli vidjeti raspored utakmica direktno iz prikaza tabele — trebalo je preći na drugu stranicu.

**Rješenje:**
- Dodana opcija "Prikaži raspored" koja expanduje listu utakmica direktno ispod tabele
- **Rezultat:** Bolja preglednost, manje klikanja

### Problem 5: Race condition pri simultanim rezervacijama
**Opis:** Dva korisnika mogu pokušati da rezerviraju isti termin istovremeno.

**Rješenje:**
- Implementacija pessimistic lockinga na nivou baze
- Provjera dostupnosti termina prije kreiranja zahtjeva
- **Rezultat:** Nema duplih rezervacija

### Problem 6: Nepouzdani korisnici (otkazivanja unutar 24h)
**Opis:** Trebalo je spriječiti korisnike da otkažu termine u zadnji čas i ometaju druge korisnike.

**Rješenje:**
- Kazneni sistem koji broji prekršaje
- Nakon 3 prekršaja korisnik ide na listu nepouzdanih i mora ručnu provjeru
- Termin je blokiran 1h čekanja dok vlasnik ne donese odluku
- **Rezultat:** Smanjeni "no-show" scenariji, veća odgovornost korisnika

### Problem 7: Nedostatak bosanskih znakova u PDF-u
**Opis:** PDFKit koristi Helvetica font koji ne podržava š, č, ć, ž, đ.

**Rješenje:**
- Privremeno odustajanje od Unicode podrške (sistemski fontovi nisu prenosivi između OS-a)
- Dokumentovanje kao poznato ograničenje za buduće sprintove
- **Rezultat:** Radi bez eksternih zavisnosti, može se poboljšati kasnije

### Problem 8: Kompleksnost React komponente za igrače (All-in-One Dashboard)
**Opis:** Stranica za pregled termina je postala veoma kompleksna sa više state-ova i logike.

**Rješenje:**
- Centralizovani dashboard sa FullCalendar komponentom
- Custom React modali umjesto browser alert/confirm
- Conditional rendering za različite tipove termina
- **Rezultat:** Bolji UX, manje rutinga, ali kompleksniji kod

---

## 8. ŠTA BI TIM UNAPRIJEDIO AKO SE PROJEKAT NASTAVLJA

### 1. AI predikcija (NFR-17)
- Kompletan AI servis (Python + scikit-learn) sa Flask API-jem
- Predikcija ishoda utakmica sa tačnošću 60–70%
- Model treniranje na historijskim podacima
- **Prioritet:** Srednji

### 2. Unicode podrška u PDF-u
- Korištenje cross-platform Unicode fontova (npr. DejaVu)
- Testiranje sa svim bosanskim znakovima
- **Prioritet:** Nizak (kozmetički problem)

### 3. Mikroservisi arhitektura
- Odvajanje modula u odvojene servise (auth, rezultati, rezervacije)
- Bolja skalabilnost i independentni deployment
- **Prioritet:** Nizak (za narednu godinu)

### 4. Advanced statistika igrača
- Detaljne statistike: žute kartone, asistencije, osvojene lopte
- Istorija igrača kroz sezone
- **Prioritet:** Srednji

### 5. WebSockets za real-time notifikacije
- Zamjena polinga sa WebSocket-ima (Socket.io)
- Trenutne notifikacije umjesto email-a
- **Prioritet:** Srednji

### 6. Integracija s vanjskim kalendarima
- Google Calendar sinhronizacija
- Outlook kalendar export
- **Prioritet:** Nizak

### 7. Mobile aplikacija
- Native iOS/Android aplikacija (React Native)
- Offline mode sa sinhronizacijom
- **Prioritet:** Nizak (web je dovoljno responzivan)

### 8. Integracija s payment sistemima
- Stripe/PayPal za online plaćanja
- Automatsko obračunavanje kotizacija
- **Prioritet:** Srednji

### 9. Advanced role management
- Sub-roles (npr. "asistent trenera")
- Time-limited permissions (npr. administrator "po kolu")
- **Prioritet:** Nizak

### 10. Analytics dashboard
- Trends u rezervacijama
- Najpopularniji termini
- Aktivnost korisnika
- **Prioritet:** Nizak

---

## 9. TEHNIČKA SPECIFIKACIJA

### Tech Stack

| Sloj | Tehnologija | Verzija |
|------|-------------|---------|
| Frontend | React.js + Vite | 18.x / 5.x |
| Backend | Node.js + Express | 20 LTS / 4.x |
| Baza | PostgreSQL + Prisma | 16.x / 5.x |
| AI | Python + scikit-learn | 3.11 / 1.3.x |
| Email | SendGrid | 8.x |
| PDF | Puppeteer | 22.x |
| Kontejner | Docker + Docker Compose | 26.x |
| CI/CD | GitHub Actions | — |
| Web server | Nginx | 1.26.x |

### Arhitektura
- **Stil:** Troslojevita (Three-Tier) + modularan monolith
- **Komunikacija:** REST API (JSON over HTTPS)
- **Autentifikacija:** JWT + RBAC
- **Baza:** PostgreSQL Primary + Replica za failover
- **Deployment:** VPS sa Docker Compose

### Performance & Security
- **Uptime:** 99% (NFR-03)
- **Response time:** Max 2s za 95% zahtjeva (NFR-01)
- **Sigurnost:** HTTPS, bcrypt lozinke, RBAC, Audit log (NFR-04, NFR-05, NFR-13)
- **Skalabilnost:** Podržava više aktivnih korisnika bez pada performansi (NFR-02)

---

## 10. ZAKLJUČAK

SportManager je uspješno razvijen sistem koji rješava konkretne probleme u organizaciji amaterskog sporta. Projekat je prošao kroz 10 sprint ciklusa sa jasnom evolucijom od planiranja, preko arhitekturnog dizajna, infrastrukture, do kompletnih funkcionalnosti.

### Ključni uspjesi
✅ **Sve planirane funkcionalnosti implementirane** – 94% Product Backlog stavki završeno
✅ **Čvrsta infrastruktura** – Docker, CI/CD, PostgreSQL sa failover-om
✅ **Sigurnost prioritet** – JWT + RBAC, bcrypt, audit log, penetration-ready
✅ **Kvalitetna dokumentacija** – Architecture Overview, API docs, Decision logovi
✅ **Stabilan sistem** – Minimalno bugova, prolazne sve funkcionalnosti

### Izazovi prevladani
⚠️ Konflikt migracija baze → Rješenje: fokusirane migracije
⚠️ Race condition rezervacija → Rješenje: pessimistic locking
⚠️ Kompleksne komponente → Rješenje: centralizovani dashboards
⚠️ Unicode znakovi u PDF-u → Rješenje: dokumentovano kao buduće poboljšanje

### Produkcija
Sistem je dostupan na:
- **Frontend:** https://sportmanager-frontend.onrender.com
- **Backend API:** /api sa OpenAPI dokumentacijom
- **Baza:** PostgreSQL sa backupima

---

**Tim:** Grupa 6 – Elektrotehnički fakultet UNSA
**Završeno:** Juni 2026
**Verzija:** 1.0 (MVP)