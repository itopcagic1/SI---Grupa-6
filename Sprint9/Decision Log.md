# Decision Log - Sprint 9

---

## Odluka 1

**ID:** DL-S9-01

**Datum:** 23.05.2026.

**Naziv:** Korištenje postojeće tabele `Notifikacija` za sistem obavijesti o odjavama igrača

**Opis:**
Trebalo je odlučiti kako perzistirati i prenositi informacije o tome da se igrač odjavio sa treninga i koji je razlog naveo (da li uvoditi novu tabelu u bazu ili iskoristiti postojeći model).

**Razmatrane opcije:**
- Proširiti bazu podataka novom tabelom `OdjavaIgraca` ili dodavanjem kolona u `PrijavaGrupnogTreninga`.
- Iskoristiti već postojeću tabelu `Notifikacija` i u njoj pohranjivati poruke sa priloženim razlozima odjave.

**Odabrana opcija:**
Iskorištavanje postojeće tabele `Notifikacija`.

**Razlog izbora:**
Neon baza podataka ima ograničen pristup tokom lokalnog testiranja kod nekih članova tima, te bi svaka izmjena sheme i kreiranje novih migracionih fajlova za stvari koje nisu ključni entiteti (kao što su tekstualne obavijesti) mogle dovesti do nepotrebnih konflikata pri spajanju grana. Korištenjem postojeće tabele `Notifikacija` sa custom tipom poruke u potpunosti smo izbjegli potrebu za novim migracijama za ovaj dio funkcionalnosti.

**Posljedice odluke:**

*Pozitivne:*
- Nema dodatnih komplikacija sa migracijom baze na Neon-u.
- Jednostavnije i brže učitavanje notifikacija na Coach Dashboardu.
- Smanjen rizik od konflikata prilikom spajanja grana ostalih kolega.

*Negativne:*
- Podaci o razlozima odjave su spremljeni kao strukturirani tekst u koloni `sadrzajPoruke`, što otežava eventualnu kasniju naprednu analitiku ili statistiku nad tim razlozima (npr. grupisanje po kategoriji povrede), ali za potrebe trenutnih zahtjeva ovo je sasvim dovoljno.

**Status odluke:** Prihvaćena i implementirana

---

## Odluka 2

**ID:** DL-S9-02

**Datum:** 24.05.2026.

**Naziv:** Prikazivanje zauzetih i blokiranih termina u kalendaru za trenere (umjesto skrivanja)

**Opis:**
Trebalo je odlučiti da li treneri u svom kalendaru slobodnih termina za objekte trebaju vidjeti samo slobodne termine ili i one koji su zauzeti odnosno blokirani.

**Razmatrane opcije:**
- Filtrirati na backendu/frontendu i prikazati samo termine sa statusom `SLOBODAN`.
- Prikazati kompletnu mrežu termina, ali vizuelno onemogućiti klik i označiti statuse `ZAUZET` i `BLOKIRAN` odgovarajućim bojama (crvena/siva).

**Odabrana opcija:**
Prikazivanje svih termina sa različitim vizuelnim statusima.

**Razlog izbora:**
Ukoliko treneri vide samo slobodne termine, gube pregled nad cjelokupnim rasporedom objekta. Prikazivanjem zauzetih termina (uz informacije o tome koji trener i tim su ih zakupili), treneri lakše mogu planirati druge termine, dogovarati prijateljske utakmice ili se prijavljivati na liste čekanja ako se termin oslobodi.

**Posljedice odluke:**

*Pozitivne:*
- Mnogo bolja preglednost i upotrebljivost kalendara.
- Smanjuje se mogućnost da treneri misle da sistem ne radi jer je "kalendar prazan".

*Negativne:*
- Veća količina podataka se prenosi sa API-ja na klijent (potrebno je povući i relacije o rezervacijama).

**Status odluke:** Prihvaćena i implementirana

---

## Odluka 3

**ID:** DL-S9-03

**Datum:** 24.05.2026.

**Naziv:** Implementacija custom React modala umjesto browser `alert()` i `confirm()` prozora

**Opis:**
Odlučeno je da se standardni pretraživački popupi za potvrdu akcija (npr. potvrda otkazivanja treninga i unos razloga odjave) zamijene custom React komponentama.

**Razmatrane opcije:**
- Korištenje ugrađenih `window.confirm()` i `window.prompt()` dijaloga.
- Razvoj i integracija custom animiranih modala stilizovanih u skladu sa dizajnom aplikacije.

**Odabrana opcija:**
Custom React modali.

**Razlog izbora:**
Ugrađeni browser pop-up prozori (poput "localhost says...") narušavaju vizuelni identitet aplikacije, izgledaju neprofesionalno i onemogućavaju klijentsku validaciju forme (npr. ne možemo lako spriječiti korisnika da klikne "OK" na prazan prompt). Custom React modal omogućava elegantan dizajn sa narandžastim tonovima, fluidne animacije i onemogućavanje dugmeta za potvrdu ako obavezno polje za razlog odjave nije popunjeno.

**Posljedice odluke:**

*Pozitivne:*
- Premium UI/UX izgled u skladu sa dizajnom projekta.
- Mogućnost dodavanja naprednih kontrola i validacija (npr. `disabled` dugme za potvrdu).

*Negativne:*
- Povećava kompleksnost koda i stanje komponente (`useState` za modal, otvorenost, sadržaj).

**Status odluke:** Prihvaćena i implementirana


## Odluka 4

**ID:** DL-S9-04

**Datum:** 25.05.2026.

**Naziv:** Jedna zajednička stranica za igrača gdje će upravljati prijavom na treninge.

**Opis:**
Odlučeno je da se implementira jedna zajednička stranica za upravljanje individualnim, grupnim treninzima i prikaz nadolazećih rezervacija, umjesto kreiranja odvojenih ekrana i ruta za svaku od ovih funkcionalnosti.

**Razmatrane opcije:**
- **Modularno-razdvojeni pristup (3 odvojene stranice)**
  - Posebna stranica za pretragu i rezervaciju individualnih termina 
  - Posebna stranica za pregled i prijavu na grupne treninge/liste čekanja 
  - Posebna stranica "Moje rezervacije" za kalendarski prikaz i otkazivanje termina 
- **Opcija 2: Centralizovani "All-in-One" Dashboard za igrače**
  - Jedinstvena stranica koja kombinuje centralnu `FullCalendar` komponentu (sa vizuelno kodiranim tipovima termina), tabove/filtere za prebacivanje između individualnih i grupnih treninga, te bočni panel (ili sekciju) za brzi pregled nadolazećih rezervacija i statusa pouzdanosti

**Odabrana opcija:**
- **Opcija 2:** Centralizovani "All-in-One" Dashboard za igrače.

**Razlog izbora:**
- **Superioran UX (Korisničko iskustvo):** Igrač ne mora skakati s rute na rutu da bi vidio šta je rezervisao, šta je slobodno i gdje je na listi čekanja. Sve je vidljivo na jednom ekranu.
- **Lakša real-time sinhronizacija:** Pošto WebSockets (Socket.io) upravljaju listama čekanja i brzim oslobađanjem termina, mnogo je jednostavnije osvježiti stanje (state) jedne komponente i kalendara na istom ekranu, nego pratiti i sinhronizovati podatke kroz tri različite rute.
- **Smanjenje dupliranja koda:** Izbjegnuto je višestruko inicijalizovanje kompleksne `FullCalendar` komponente na različitim mjestima u aplikaciji.

**Posljedice odluke:**

*Pozitivne:*
- Čist i kompaktan korisnički interfejs koji igraču daje osjećaj kontrole i preglednosti nad svim terminima.
- Centralizovan State Management na frontend-u za sve akcije vezane za igrača.
- Lakša integracija globalnog kaznenog sistema (igrač na istoj stranici vidi upozorenje o prekršajima i odmah unutar kalendara/rezervacija ima restrikcije ako postane "NEPOUZDAN").

*Negativne:*
- **Kompleksnost komponente:** Stvorena je velika i kompleksna frontend datoteka sa mnogo uslovnog renderovanja (conditional rendering) i poslovne logike.

**Status odluke:** Prihvaćena i implementirana.