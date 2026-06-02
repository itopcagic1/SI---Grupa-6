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


## Modul: Notifikacije (Maida Biber)

### Sumarna statistika pokrivenosti testova
* **Backend Integracijski Testovi (Kontroler - `notifikacijaController.test.js`):** 4 testna scenarija — **Svi uspješni (100% PASS)**
* **Backend Unit Testovi (Servis - `notifikacijaService.test.js`):** 3 testna scenarija — **Svi uspješni (100% PASS)**
* **Frontend Unit/Regresijski Testovi (`Notifikacije.test.jsx`):** 5 testnih scenarija — **Svi uspješni (100% PASS)**

---

### Detaljni Matrični Prikaz Izvršenih Testova

### BACKEND INTEGRACIJSKI TESTOVI — KONTROLER RUTE (`notifikacijaController.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Integration | Uspješno dohvaćanje liste svih notifikacija za prijavljenog korisnika uz status 200 | `GET /api/notifikacije - treba vratiti 200 i JSON objekt sa notifikacijama` | PASS |
| Integration | Uspješno dohvaćanje broja nepročitanih obavijesti | `GET /api/notifikacije/count - treba vratiti broj nepročitanih` | PASS |
| Integration | Uspješno označavanje pojedinačne notifikacije kao pročitane | `PUT /api/notifikacije/:id/procitano - treba uspješno označiti notifikaciju` | PASS |
| Integration | Rukovanje neočekivanim greškama na ruteru i vraćanje statusa 500 | `Treba vratiti status 500 ako servis baci neočekivanu grešku` | PASS |

### BACKEND UNIT TESTOVI — SERVISNI SLOJ (`notifikacijaService.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Dohvaćanje svih notifikacija iz baze sortiranih od najnovije | `getNotifikacijeService - treba vratiti sve notifikacije sortirane od najnovije` | PASS |
| Unit | Brojanje nepročitanih notifikacija filtriranih po statusu `NEPROCITANO` | `getNeprocitaneCountService - treba vratiti broj nepročitanih notifikacija` | PASS |
| Unit | Ažuriranje statusa tačno određene notifikaciju korisnika u bazi podataka | `oznaciKaoProcitanoService - treba ažurirati točno određenu notifikaciju` | PASS |

### FRONTEND UNIT / REGRESIJSKI TESTOVI — STRANICA OBAVIJESTI (`Notifikacije.test.jsx`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| UI / Regresija | Prikazivanje animiranog loader teksta dok se podaci povlače sa API-ja | `Treba prikazati loader dok se obavijesti učitavaju` | PASS |
| UI / Regresija | Ispravan render liste, provjera stilova i klasa za pročitane i nepročitane stavke | `Treba ispravno prikazati listu notifikacija nakon učitavanja` | PASS |
| UI / Regresija | Klik na nepročitanu obavijest okida API poziv i lokalno mijenja stil u pročitano | `Klik na nepročitanu obavijest treba pozvati API i označiti je kao pročitanu` | PASS |
| UI / Regresija | Klik na dugme za masovno čitanje ažurira sve obavijesti i sklanja akciono dugme | `Klik na "Onači sve kao pročitano" treba ažurirati sve obavijesti` | PASS |
| UI / Regresija | Prikaz adekvatne prazne (placeholder) poruke kada korisnik nema obavijesti | `Treba prikazati praznu poruku ako nema obavijesti u bazi` | PASS |

---

### Manuelna Verifikacija (Zapisnik Ručnog Testiranja)

| ID testa | Koraci | Očekivano ponašanje | Rezultat |
| :--- | :--- | :--- | :--- |
| MT-S10-07 | Prijaviti se na sistem, navigirati na stranicu obavijesti (`/notifikacije` ili klikom na zvonce u Navbaru). | Učitava se stranica sa naslovom "Moje Obavijesti". Ako postoje nove, nepročitane stavke imaju podebljan font i narandžasti kružić (indikator). | PASS |
| MT-S10-08 | Kliknuti na bilo koju nepročitanu obavijest na listi. | Narandžasti kružić trenutno nestaje, font se mijenja iz `bold` u regularni. U pozadini se šalje PUT zahtjev na `/api/notifikacije/:id/procitano`. | PASS |
| MT-S10-09 | Kliknuti na dugme "Onači sve kao pročitano" na vrhu stranice. | Sve obavijesti na ekranu gube status nepročitanih, dugme za masovno označavanje nestaje sa ekrana, a bedž na zvoncu u Navbaru se poništava na 0. | PASS |
| MT-S10-10 | Pokrenuti testni scenario u kojem korisnik nema nikakvih primljenih obavijesti. | Ekran prikazuje prazno stanje (Dashed kontejner) sa porukom "Nemate obavijesti" i prigodnom ikonicom, potvrđujući da aplikacija ne puca pri praznom nizu. | PASS |