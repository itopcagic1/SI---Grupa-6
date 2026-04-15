# Architecture Overview

---

## 1. Kratak opis arhitektonskog pristupa

Sistem je zasnovan na **troslojevitoj klijent-server arhitekturi** (Three-Tier Architecture) s jasnom podjelom odgovornosti između prezentacijskog sloja, poslovne logike i sloja podataka. Komunikacija između klijenta i servera odvija se isključivo putem **REST API-ja**, što omogućava nezavisnost frontend i backend komponenti.

Arhitektura je dizajnirana da podrži zahtjeve definisane u NFR dokumentu — posebno skalabilnost (NFR-02), sigurnost kroz RBAC (NFR-05), pouzdanost sa 99% uptime (NFR-03) i responzivan interfejs (NFR-06). Sistem predviđa i integrisanu **AI komponentu** za predikciju rezultata (NFR-17) kao odvojeni servis koji komunicira s ostatkom sistema putem internog API poziva.

Arhitekturni stil prati **modularan monolitni pristup** u početnoj fazi razvoja (MVP), s mogućnošću budućeg prelaska na mikroservise kako sistem bude rastao (NFR-09).

---

## 2. Glavne komponente sistema

### 2.1 Korisničke uloge

U sistemu je definisano sedam tipova korisnika:

- **Administrator** – puni pristup sistemu; upravlja korisnicima, ligama i sistemskim postavkama
- **Organizator** – kreira i upravlja ligama, rasporedima utakmica i unosi rezultate
- **Trener** – prijavljuje tim na takmičenja, rezerviše termine za grupne treninge
- **Igrač** – pregledava raspored i rezultate svog tima, prima notifikacije
- **Vlasnik objekta** – unosi dostupnost terena, odobrava ili odbija zahtjeve za rezervaciju
- **Navijač** – prati omiljeni tim, prima notifikacije o rezultatima i rasporedu
- **Gost** – javni pregled rasporeda, tabela i rezultata bez registracije i prijave

Sve uloge prolaze kroz isti Auth & RBAC sloj na backendu koji na osnovu JWT tokena određuje dozvole za svaki zahtjev.

---

### 2.2 Prezentacijski sloj – Frontend

| Komponenta | Tehnologija |
|---|---|
| Frontend (klijentska aplikacija) | React.js |

Korisnički interfejs kojeg koriste sve uloge u sistemu. Realizovan kao Single Page Application (SPA).

- Prikaz rasporeda utakmica i tabele lige
- Forme za unos rezultata, zakazivanje utakmica i rezervaciju termina
- Dashboard prilagođen ulozi korisnika
- Sekcija AI predikcija
- Admin panel za upravljanje korisnicima i ligama
- Responzivan dizajn za desktop i mobilne uređaje (NFR-06, NFR-14)

---

### 2.3 Aplikativni sloj – Backend

| Komponenta | Tehnologija |
|---|---|
| Backend (API server) | Node.js + Express |

Odgovoran za poslovnu logiku sistema, validaciju svih podataka na serverskoj strani, autentifikaciju i autorizaciju, te komunikaciju između svih ostalih komponenti.

Najznačajniji dio ove komponente jeste Auth & RBAC sloj. Nakon što se korisnik prijavi, backend izdaje JWT token (trajanje 15 min) koji prati svaki naredni zahtjev prema API-ju. Refresh token se čuva u `httpOnly` cookieu. RBAC zatim provjerava permisije te odobrava ili odbija zahtjev na osnovu uloge korisnika.

Kada zahtjev prođe autorizaciju, nastupa poslovna logika sistema. Ona obuhvata upravljanje ligama i timovima, zakazivanje utakmica i provjeru dostupnosti termina, unos rezultata i automatsko ažuriranje tabela, te upravljanje rezervacijama. Svaka od ovih akcija komunicira s bazom podataka, a po potrebi i s AI servisom ili email servisom. Backend bilježi sve važne akcije korisnika u audit log (NFR-13), čime se osigurava sljedivost svakog unosa i izmjene u sistemu.

Posebnu ulogu ima podsistem za notifikacije. Kada dođe do relevantnog događaja (promjena rasporeda, potvrda rezervacije, novi rezultat), backend asinhrono poziva email servis i šalje obavještenje relevantnim korisnicima bez blokiranja odgovora prema frontendu (NFR-10).

#### Ključne funkcionalnosti backenda:

- RESTful API s CORS whitelistom (dozvoljen pristup samo s domena frontend aplikacije)
- Autentifikacija i autorizacija (JWT + RBAC)
- Upravljanje ligama, timovima, rasporedom i rezultatima
- Upravljanje rezervacijama i terminima
- Automatsko računanje tabele i bodova
- Upravljanje notifikacijama (async)
- Audit log akcija (NFR-13)

---

### 2.4 AI servis

| Komponenta | Tehnologija |
|---|---|
| AI servis | Python + scikit-learn + Flask |

Odvojena komponenta odgovorna za generisanje predikcija ishoda utakmica. Komunicira s backendom isključivo kroz interni API poziv i nije direktno dostupna frontendu ni internetu. Podatke dobija isključivo od backenda u obliku JSON payloada — nema direktan pristup bazi podataka.

Servis se sastoji od dva sloja:

1. **ML sloj** – trenira model na historijskim podacima (rezultati, forma timova), generiše numeričke vjerovatnoće za svaki mogući ishod (pobjeda/neriješeno/poraz) koristeći scikit-learn klasifikatore
2. **Prezentacijski sloj** – formatira numeričke nalaze u čitljiv prikaz koji se vraća backendu i prikazuje korisniku kao informativan sadržaj

Ciljna tačnost predikcije iznosi 60–70% (NFR-17). Predikcije nemaju nikakav uticaj na stvarne rezultate i služe isključivo kao informativni prikaz.

---

### 2.5 Sloj podataka – Baza podataka i Data Access Layer

| Komponenta | Tehnologija |
|---|---|
| Baza podataka | PostgreSQL (Primary + Replica) |
| Data Access Layer (DAL) | Sequelize ORM |

Centralno trajno skladište svih podataka sistema. Jedino backend ima direktan pristup bazi, i to isključivo **kroz Sequelize ORM** — nigdje u backend kodu ne pišu se sirovi SQL upiti direktno.

#### PostgreSQL

- Korisnici, uloge i permisije
- Timovi, lige, utakmice i raspored
- Rezultati i tabele
- Rezervacije i dostupnost terena
- Audit log akcija

Baza na nivou ograničenja (constraints) sprečava kreiranje duplih rezervacija za isti teren i vremenski interval putem pessimistic lockinga (NFR-16), te osigurava referencijalni integritet između entiteta. PostgreSQL Primary + Replica konfiguracija osigurava visoku dostupnost i failover za postizanje 99% uptime (NFR-03, NFR-11).

#### Sequelize ORM — Data Access Layer

Sequelize je ORM (Object-Relational Mapper) za Node.js koji služi kao jedini posrednik između backend poslovne logike i PostgreSQL baze podataka. Uvođenjem Sequelizea kao DAL-a postiže se jasna granica između sloja poslovne logike i sloja podataka.

**Zašto Sequelize:**
- Nativna podrška za PostgreSQL s dobro poznatim driver-om (`pg`)
- Kompatibilan s Node.js + Express stackom koji je odabran za backend
- Modeli se definišu kao JavaScript klase, što je konzistentno s ostatkom backend koda
- Ugrađena zaštita od SQL injection napada kroz parametrizovane upite
- Podrška za migracije (`sequelize-cli`) — verzionisane izmjene sheme baze

**Uloga Sequelizea u sistemu:**

Svaki entitet iz domenskog modela (Korisnik, Tim, Liga, Utakmica, Rezervacija, itd.) definiše se kao Sequelize Model. Model opisuje kolone tablice, tipove podataka, validacije na nivou modela i veze prema drugim modelima (`hasMany`, `belongsTo`, `belongsToMany`).

**Migracije:**

Sve izmjene sheme baze (dodavanje kolona, kreiranje tabela, izmjena ograničenja) provode se isključivo kroz Sequelize migracije (`sequelize-cli`). Ovo osigurava da su izmjene verzionisane, ponovljive i reverzibilne u svim okruženjima (development, staging, production).

---

### 2.6 Pomoćni servisi

- **Email servis** (SendGrid) — asinhrono slanje notifikacija korisnicima (NFR-10)
- **PDF generator** (Puppeteer, server-side) — generisanje PDF izvještaja rasporeda i tabela (PB-39, UC-23)

---

## 3. Dijagram arhitekture

![Architecture Diagram](./SI-ArchitectureOverview_drawio1.png)

---

## 4. Odgovornosti komponenti

| Komponenta | Odgovornost |
|---|---|
| Frontend | Prikazuje podatke korisniku prema njegovoj ulozi, prikuplja input putem formi, vrši osnovnu klijentsku validaciju. Ne sadrži poslovnu logiku i ne pristupa bazi niti AI servisu direktno. |
| Backend API | Provodi autentifikaciju i autorizaciju (JWT + RBAC), implementira poslovnu logiku, upravlja pozivima prema bazi, AI servisu i email servisu. Jedina komponenta s direktnim pristupom bazi. |
| AI servis | Prima historijske podatke od backenda kao JSON payload, generiše predikcije ishoda utakmica, vraća rezultate u strukturiranom formatu. Nije izložen frontendu. |
| Baza podataka | Trajno čuva sve poslovne podatke. Jedino backend pristupa bazi direktno. |
| Email servis | Asinhrono šalje notifikacije korisnicima o relevantnim događajima (promjena rasporeda, potvrda rezervacije, novi rezultat). |
| Auth & RBAC | Upravlja korisničkim identitetima, sesijama i pravima pristupa. Svaki API poziv prolazi kroz ovaj sloj. |
| PDF generator | Server-side generisanje PDF dokumenata putem Puppeteera; vraća se frontendu kao `Content-Disposition: attachment` response. |

---

## 5. Tok podataka i interakcija

Korisnik komunicira isključivo s frontend aplikacijom putem web preglednika. Frontend ne pristupa bazi podataka niti AI servisu direktno — svaki zahtjev šalje se backendu kao HTTPS poziv na odgovarajuću API rutu. Backend je centralna tačka sistema: prima zahtjev, provjerava autentifikaciju i autorizaciju, izvršava poslovnu logiku i po potrebi komunicira s bazom podataka, AI servisom ili email servisom. Rezultat se vraća frontendu koji ga prikazuje korisniku.

Baza podataka nije direktno dostupna nijednoj komponenti osim backendu. AI servis ne komunicira s bazom — backend mu pri svakom pozivu šalje potrebne historijske podatke kao JSON payload. Email servis se poziva asinhrono, što znači da slanje notifikacije ne blokira odgovor koji korisnik čeka.

### 5.1 Tok autentifikacije (UC-01, UC-02)

Korisnik unosi kredencijale na frontendu → backend validira podatke i provjerava bazu → izdaje JWT token (trajanje 15 min) i refresh token (httpOnly cookie) → frontend šalje JWT pri svakom narednom zahtjevu → backend provjerava token i ulogu korisnika putem RBAC-a → odobrava ili odbija zahtjev.

### 5.2 Tok zakazivanja utakmice (UC-07)

Organizator popunjava formu na frontendu → zahtjev ide na backend → backend provjerava dostupnost termina i timova u bazi → sprema utakmicu → asinhrono šalje notifikaciju relevantnim korisnicima putem email servisa.

### 5.3 Tok unosa rezultata i ažuriranja tabele (UC-09, UC-10)

Ovlašteni korisnik unosi rezultat putem frontenda → backend sprema rezultat u bazu → backend automatski izračunava bodove i ažurira tabelu u istoj transakciji → frontend dohvata ažuriranu tabelu pri sljedećem polling ciklusu (max 30 sekundi kašnjenja u prikazu).

### 5.4 Tok rezervacije termina (UC-14, UC-16, UC-17)

Korisnik šalje zahtjev za rezervaciju → backend primjenjuje pessimistic lock na termin → kreira zahtjev u bazi sa statusom "na čekanju" → vlasnik objekta pregleda zahtjev i odobrava ili odbija → backend mijenja status termina u bazi → asinhrono šalje notifikaciju korisniku o ishodu zahtjeva.

### 5.5 Tok AI predikcije (UC-21)

Korisnik otvara sekciju predikcija → frontend šalje zahtjev backendu → backend dohvata historijske podatke iz baze i prosljeđuje ih AI servisu kao JSON payload → AI servis generiše predikciju i vraća rezultat backendu → backend vraća predikciju frontendu → prikazuje se korisniku kao informativan sadržaj.

### 5.6 Tok generisanja PDF-a (UC-23)

Korisnik inicira izvoz → frontend šalje zahtjev backendu s parametrima izvještaja → backend dohvata podatke iz baze, renderuje HTML predložak i konvertuje ga u PDF putem Puppeteera → vraća PDF kao attachment → browser preuzima fajl.

---

## 6. Ključne tehničke odluke

| Odluka | Odabir | Obrazloženje |
|---|---|---|
| Arhitekturni stil | Modularan monolith (MVP) | Brži razvoj u ranoj fazi; olakšava debugiranje i testiranje u timu; modularna struktura koda omogućava kasniju migraciju |
| Komunikacija klijent–server | REST API (JSON) over HTTPS | Standardizovan, dobro podržan u svim razvojnim alatima, jednostavan za dokumentovanje putem OpenAPI/Swagger standarda |
| CORS konfiguracija | Whitelist specifičnih origina | Sprečava neovlaštene cross-origin zahtjeve na API |
| Autentifikacija | JWT (15 min) + refresh token (httpOnly cookie) | Kratko trajanje minimizuje rizik zloupotrebe; refresh token u httpOnly cookieu sprečava XSS krađu tokena |
| Model pristupa | RBAC | Uloge su definirane na nivou backenda; sprečava neautorizovani pristup resursima (NFR-05) |
| Baza podataka | PostgreSQL (relacijska) | Kompleksne relacije između entiteta zahtijevaju relacijski model s referencijalnim integritetom |
| Frontend framework | React.js (finalna odluka) | Komponentna arhitektura prikladna za dinamičan UI s više uloga; velika zajednica |
| AI biblioteka | scikit-learn | Dovoljna složenost za ciljanu tačnost 60–70%; lakše za održavanje od TensorFlow-a u MVP fazi |
| AI data flow | Backend prosljeđuje snapshot podataka AI servisu | AI servis nema direktan pristup bazi — izolacija podataka, kontrolisani API, lakša zamjena modela |
| Real-time ažuriranje | Polling (interval: 30s) | WebSocket zahtijeva dodatnu infrastrukturu; polling je dostatan jer se rezultati unose ručno |
| Locking za rezervacije | Pessimistic locking na nivou baze | Sprečava race condition pri istovremenim zahtjevima za isti termin (NFR-16) |
| Sigurnost | HTTPS + bcrypt + RBAC | Enkripcija komunikacije i lozinki te zaštita svih ruta (NFR-04, NFR-05) |
| Notifikacije | Email async (SendGrid) | Najdostupniji kanal; asinhrona obrada ne blokira korisničke zahtjeve (NFR-10) |
| PDF generisanje | Server-side, Puppeteer | Konzistentan output bez ovisnosti o browser okruženju |
| Visoka dostupnost | PostgreSQL Primary + Replica | Replica kao failover za postizanje 99% uptime (NFR-03) |

---

## 7. Ograničenja i rizici

### 7.1 Tehnička ograničenja

- **Nedostatak historijskih podataka** – AI servis zahtijeva dovoljnu količinu historijskih podataka o utakmicama i formi timova. U ranoj fazi, predikcije mogu biti neprecizne dok se baza ne popuni.
- **Monolitni backend** – trenutna arhitektura otežava nezavisno skaliranje pojedinih modula. Ako sistem značajno poraste, može biti potrebna migracija prema mikroservisima.
- **Skalabilnost baze** – relacijska baza može postati usko grlo pri velikom broju istovremenih upita, posebno pri generisanju tabela i filtriranju rasporeda (NFR-12).
- **Polling kašnjenje** – promjena podataka nije vidljiva korisniku trenutno, već s maksimalnim kašnjenjem od 30 sekundi. Prihvatljivo za ovaj tip sistema.

### 7.2 Sigurnosni rizici

- **Konflikt rezervacija** – istovremeni zahtjevi za isti termin mogu uzrokovati duplu rezervaciju. Riješeno pessimistic lockingom na nivou baze (NFR-16).
- **JWT invalidacija** – standardni JWT tokeni ne mogu biti odmah poništeni. Riješeno kratkim trajanjem (15 min) i refresh token mehanizmom.
- **Neautorizovani pristup** – pogrešna konfiguracija uloga može dovesti do curenja podataka. Zahtijeva temeljno testiranje RBAC sloja za svaku ulogu.

### 7.3 Arhitektonski rizici

- **Ovisnost o jednom AI modelu** – ako odabrani pristup ne daje zadovoljavajuće rezultate, zamjena zahtijeva redizajn AI modula. Izolacija AI servisa umanjuje uticaj na ostatak sistema.
- **Email kao jedini notifikacijski kanal** – korisnici koji ne prate email mogu propustiti važne obavijesti. U kasnijim sprintovima može se razmotriti in-app notifikacijski sistem.
- **AI payload veličina** – pri velikom historijskom datasetu, JSON payload prema AI servisu može biti spor. Rješava se limitiranjem na posljednjih N utakmica po timu.

---

## 8. Otvorena pitanja

| Pitanje | Status |
|---|---|
| Hosting i deployment infrastruktura | Nije odlučeno — cloud, VPS ili lokalni server? Utiče na CI/CD pipeline (PB-16) i konfiguraciju replika baze. |
| Strategija za inicijalne podatke | Kako popuniti bazu s dovoljno historijskih podataka za AI komponentu prije prvog produkcijskog korišćenja? |
| Monitoring i alerting | Koji alat za praćenje zdravlja sistema (uptime, greške, performanse)? Potrebno definisati prije deploymenta. |
| Notifikacijski kanal | Ostati samo na email notifikacijama ili dodati in-app obavještenja u kasnijim sprintovima? |

---


