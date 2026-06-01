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
