# Proof of Testing - Sprint 10

## Modul: Omiljeni tim (Ilma Hindija)

### Sumarna statistika pokrivenosti testova
* **Backend Unit Testovi (Kontroler - `omiljeniTimController.test.js`):** 3 testna scenarija — **Svi uspješni (100% PASS)**
* **Frontend Regresijski Testovi (`Timovi.test.jsx` i `Profile.test.jsx`):** 7 testnih scenarija — **Svi uspješni (100% PASS)**

---

### Detaljni Matrični Prikaz Izvršenih Testova

### BACKEND UNIT TESTOVI — KONTROLER (`omiljeniTimController.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Uspješno dodavanje tima u omiljene za prijavljenog korisnika | `setOmiljeniTim successfully adds favorite team` | PASS |
| Unit | Uspješno uklanjanje tima iz omiljenih | `removeOmiljeniTim successfully removes favorite team` | PASS |
| Unit | Uspješno dohvaćanje liste svih omiljenih timova korisnika | `getOmiljeniTimovi retrieves all favorite teams` | PASS |

### FRONTEND REGRESIJSKI TESTOVI — PROFIL I TIMOVI (`Profile.test.jsx`, `Timovi.test.jsx`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| UI / Regresija | Stranica prikazuje listu timova iz mockanog API-ja | `Timovi.test.jsx -> stranica prikazuje listu timova iz mockanog API-ja` | PASS |
| UI / Regresija | Forma za kreiranje tima šalje ispravne podatke prema API-ju | `Timovi.test.jsx -> forma za kreiranje tima salje ispravne podatke` | PASS |
| UI / Regresija | Kreiranje bez naziva ili sporta ne šalje zahtjev | `Timovi.test.jsx -> kreiranje bez naziva ne salje request` | PASS |
| UI / Regresija | Brisanje tima poziva odgovarajući API | `Timovi.test.jsx -> delete tima poziva odgovarajuci API` | PASS |
| UI / Regresija | Prikazuje grešku ako API vrati error | `Timovi.test.jsx -> prikazuje gresku ako API vrati error` | PASS |
| UI / Regresija | Profil uspješno učitava i prikazuje podatke o prijavljenom korisniku | `Profile.test.jsx -> učitava profil` | PASS |
| UI / Regresija | Profil prikazuje grešku pri neuspješnom učitavanju | `Profile.test.jsx -> prikazuje grešku ako profil ne učita` | PASS |

---

### Manuelna Verifikacija (Zapisnik Ručnog Testiranja)

| ID testa | Koraci | Očekivano ponašanje | Rezultat |
| :--- | :--- | :--- | :--- |
| MT-S10-01 | Prijaviti se na sistem sa ulogom `NAVIJAC`, navigirati na stranicu `/teams` (Timovi). | Pored svakog tima se prikazuje ikona srca (prazan obrub ako tim nije u omiljenim). | PASS |
| MT-S10-02 | Kliknuti na ikonu srca pored nekog tima. | Ikona srca se popunjava crvenom bojom. U pozadini se šalje POST zahtjev na `/api/omiljeni-tim/:timId` koji vraća 201. | PASS |
| MT-S10-03 | Ponovo kliknuti na isto (popunjeno) srce. | Ikona se vraća u prazno stanje (sivi obrub). U pozadini se šalje DELETE zahtjev na `/api/omiljeni-tim/:timId` koji vraća poruku o uspjehu. | PASS |
| MT-S10-04 | Navigirati na stranicu profila (`/profile`) dok je ulogovan `NAVIJAC` sa dodatim omiljenim timovima. | U lijevoj koloni ispod aktivnih angažmana prikazuje se nova sekcija "Moji omiljeni timovi" sa spiskom svih favorizovanih timova i pripadajućim sportom. | PASS |
| MT-S10-05 | Na stranici profila kliknuti na dugme "Ukloni" pored nekog od omiljenih timova. | Tim se uklanja sa liste, šalje se DELETE zahtjev na backend, a lista se trenutno ažurira na ekranu i prikazuje se success poruka. | PASS |
| MT-S10-06 | Prijaviti se sa ulogom `ADMINISTRATOR` ili `TRENER`, ili posjetiti stranice kao gost bez prijave. | Ikone srca na stranici Timovi se uopšte ne rendersiraju, niti se na profilu prikazuje sekcija "Moji omiljeni timovi". | PASS |

---

## Modul: PDF izvoz rezultata i rasporeda (Irma Topčagić, Zeir Mašić)

### Sumarna statistika pokrivenosti testova
* **Backend Unit Testovi (`pdfService.test.js`):** 8 testnih scenarija — **Svi uspješni (100% PASS)**
* **Backend Integracijski Testovi (`pdfRoutes.test.js`):** 12 testnih scenarija — **Svi uspješni (100% PASS)**
* **Frontend API Testovi (`pdfApi.test.js`):** 11 testnih scenarija — **Svi uspješni (100% PASS)**

---

### Detaljni Matrični Prikaz Izvršenih Testova

### BACKEND UNIT TESTOVI — SERVIS (`pdfService.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | `generateRezultatiPDF` vraća Buffer kada postoje utakmice | `vraca Buffer kada postoje utakmice` | PASS |
| Unit | `generateRezultatiPDF` vraća Buffer i za prazan skup rezultata | `vraca Buffer i kada nema utakmica (prazan izvjestaj)` | PASS |
| Unit | `generateRezultatiPDF` baca grešku za nepostojeće takmičenje | `baca gresku kada takmicenje ne postoji` | PASS |
| Unit | `generateRezultatiPDF` pravilno filtrira po datumOd i datumDo | `filtrira utakmice po datumOd i datumDo` | PASS |
| Unit | `generateRasporedPDF` vraća Buffer kada postoje utakmice | `vraca Buffer kada postoje utakmice` | PASS |
| Unit | `generateRasporedPDF` vraća Buffer i za prazan raspored | `vraca Buffer i kada nema utakmica` | PASS |
| Unit | `generateRasporedPDF` baca grešku za nepostojeće takmičenje | `baca gresku kada takmicenje ne postoji` | PASS |
| Unit | `generateTabelaPDF` vraća Buffer sa validnim podacima tabele | `vraca Buffer sa validnim podacima tabele` | PASS |

### BACKEND INTEGRACIJSKI TESTOVI — RUTE (`pdfRoutes.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Integracija | Zahtjev bez tokena vraća 401 na svim PDF rutama | `zahtjev bez tokena vraca 401 na svim rutama` | PASS |
| Integracija | Uloga `IGRAC` ne može preuzeti PDF (403) | `IGRAC ne moze preuzeti PDF (403)` | PASS |
| Integracija | Uloga `ADMINISTRATOR` može preuzeti PDF rezultata | `ADMINISTRATOR moze preuzeti PDF rezultata` | PASS |
| Integracija | Uloga `ORGANIZATOR` može preuzeti PDF rasporeda | `ORGANIZATOR moze preuzeti PDF rasporeda` | PASS |
| Integracija | Uloga `TRENER` može preuzeti PDF rezultata | `TRENER moze preuzeti PDF rezultata` | PASS |
| Integracija | `GET /rezultati` bez `takmicenjeId` vraća 400 | `GET /rezultati bez takmicenjeId vraca 400` | PASS |
| Integracija | `GET /raspored` bez `takmicenjeId` vraća 400 | `GET /raspored bez takmicenjeId vraca 400` | PASS |
| Integracija | `GET /tabela` bez `takmicenjeId` vraća 400 | `GET /tabela bez takmicenjeId vraca 400` | PASS |
| Integracija | `GET /rezultati` vraća PDF sa ispravnim Content-Type i Content-Disposition headerima | `GET /rezultati vraca PDF sa ispravnim headerima` | PASS |
| Integracija | `GET /raspored` vraća PDF sa ispravnim headerima | `GET /raspored vraca PDF sa ispravnim headerima` | PASS |
| Integracija | Servis koji baci "Takmicenje nije pronađeno" rezultira 404 odgovorom | `vraca 404 kada takmicenje nije pronadjeno` | PASS |
| Integracija | Neočekivana greška servisa rezultira 500 odgovorom | `vraca 500 na neocekivanu gresku servisa` | PASS |

### FRONTEND API TESTOVI (`pdfApi.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | `canExportPDF` vraća `true` za `ADMINISTRATOR` | `vraca true za ADMINISTRATOR` | PASS |
| Unit | `canExportPDF` vraća `true` za `ORGANIZATOR` | `vraca true za ORGANIZATOR` | PASS |
| Unit | `canExportPDF` vraća `true` za `TRENER` | `vraca true za TRENER` | PASS |
| Unit | `canExportPDF` vraća `false` za `IGRAC` | `vraca false za IGRAC` | PASS |
| Unit | `canExportPDF` vraća `false` kada nema tokena | `vraca false kada nema tokena` | PASS |
| Unit | `downloadTabelaPDF` poziva ispravan endpoint sa `takmicenjeId` | `poziva ispravan endpoint sa takmicenjeId` | PASS |
| Unit | `downloadRezultatiPDF` dodaje `datumOd` i `datumDo` u params kada su proslijeđeni | `dodaje datumOd i datumDo u params` | PASS |
| Unit | `downloadRezultatiPDF` ne dodaje datum parametre kada nisu proslijeđeni | `ne dodaje datumOd/datumDo kada nisu proslijedjeni` | PASS |
| Unit | `downloadRasporedPDF` poziva ispravan endpoint `/pdf/raspored` | `poziva ispravan endpoint sa takmicenjeId` | PASS |
| Unit | `downloadRasporedPDF` dodaje datum parametre kada su proslijeđeni | `dodaje datumOd i datumDo u params` | PASS |
| Unit | `downloadRasporedPDF` triggeruje download fajla klikom na generisani link | `triggeruje download fajla` | PASS |

---

### Manuelna Verifikacija (Zapisnik Ručnog Testiranja)

| ID testa | Koraci | Očekivano ponašanje | Rezultat |
| :--- | :--- | :--- | :--- |
| MT-S10-07 | Prijaviti se kao `ADMINISTRATOR`, otići na `/rezultati`, ne odabirati ligu, kliknuti "Izvezi u PDF". | Prikazuje se modalni prozor sa porukom "Odaberite ligu iz filtera da biste generisali PDF izvještaj." Modalni prozor se može zatvoriti klikom na "U redu" ili se sam zatvara nakon 5 sekundi. | PASS |
| MT-S10-08 | Prijaviti se kao `ADMINISTRATOR`, na `/rezultati` odabrati ligu, kliknuti "Izvezi u PDF". | Dugme prikazuje spinner i tekst "Izvoz u toku...", a nakon završetka preuzima se fajl `rezultati.pdf`. | PASS |
| MT-S10-09 | Prijaviti se kao `ORGANIZATOR`, otići na `/raspored`, odabrati ligu, kliknuti "Izvezi u PDF". | Preuzima se fajl `raspored.pdf` sa tabelom utakmica (domaći tim, gostujući tim, datum, lokacija). | PASS |
| MT-S10-10 | Prijaviti se kao `TRENER`, provjeriti dostupnost PDF dugmeta na `/rezultati` i `/raspored`. | Dugme "Izvezi u PDF" je vidljivo i funkcionalno za ulogu `TRENER`. | PASS |
| MT-S10-11 | Prijaviti se kao `IGRAC` ili pristupiti stranici bez prijave, otići na `/rezultati`. | Dugme "Izvezi u PDF" se ne prikazuje na stranici. | PASS |
| MT-S10-12 | Prijaviti se kao `ADMINISTRATOR`, odabrati ligu i datum na `/rezultati`, kliknuti "Izvezi u PDF". | PDF sadrži samo utakmice za odabrani datum. | PASS |
