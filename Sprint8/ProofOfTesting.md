# Dokaz o Testiranju (Proof of Testing) 


## Modul: Upravljanje sportskim objektima (CRUD operacije)

### Sumarna statistika pokrivenosti testova
* **Unit Testovi (`facilityService.test.js`):** 26 testnih scenarija — **Svi uspješni (100% PASS)**
* **Integracijski Testovi (`facilityRoutes.test.js`):** 13 testnih scenarija — **Svi uspješni (100% PASS)**
* **UI Testovi (`Facilities.test.jsx`):** 17 testnih scenarija — **Svi uspješni (100% PASS)**

---

###  Detaljni Matrični Prikaz Izvršenih Testova

###  UNIT TESTOVI

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Kreiranje objekta sa validnim podacima | `createFacilityService -> kreira objekat s validnim podacima` | PASS |
| Unit | Validacija naziva: naziv nedostaje | `createFacilityService -> baca grešku ako naziv nedostaje` | PASS |
| Unit | Validacija naziva: naziv sadrži samo razmake | `createFacilityService -> baca grešku ako naziv sadrži samo razmake` | PASS |
| Unit | Validacija kapaciteta: vrijednost je 0 | `createFacilityService -> baca grešku ako je kapacitet 0` | PASS |
| Unit | Validacija kapaciteta: vrijednost veća od 30 | `createFacilityService -> baca grešku ako je kapacitet veći od 30` | PASS |
| Unit | Validacija kapaciteta: unesen decimalan broj | `createFacilityService -> baca grešku ako je kapacitet decimalan broj` | PASS |
| Unit | Validacija kapaciteta: unesen negativan broj | `createFacilityService -> baca grešku ako je kapacitet negativan` | PASS |
| Unit | Granične vrijednosti kapaciteta: minimalni dozvoljeni kapacitet | `createFacilityService -> prihvata kapacitet 1 (minimum)` | PASS |
| Unit | Granične vrijednosti kapaciteta: maksimalni dozvoljeni kapacitet | `createFacilityService -> prihvata kapacitet 30 (maksimum)` | PASS |
| Unit | Podrazumijevano postavljanje statusa pri kreiranju | `createFacilityService -> postavlja status AKTIVAN ako nije proslijeđen` | PASS |
| Unit | Dohvatanje objekata za specifičnog ulogovanog vlasnika | `getAllFacilitiesService -> vraća listu objekata za datog vlasnika` | PASS |
| Unit | Dohvatanje liste objekata kada vlasnik nema unesenih podataka | `getAllFacilitiesService -> vraća praznu listu ako vlasnik nema objekata` | PASS |
| Unit | Filtriranje liste sportskih objekata po gradu | `getAllFacilitiesService -> filtrira po gradu ako je proslijeđen` | PASS |
| Unit | Podrazumijevani filter za status prilikom listanja | `getAllFacilitiesService -> koristi status AKTIVAN kao default` | PASS |
| Unit | Eksplicitno filtriranje objekata po statusu NEAKTIVAN | `getAllFacilitiesService -> može filtrirati po statusu NEAKTIVAN` | PASS |
| Unit | Dohvatanje detalja objekta preko numeričkog ID-a | `getFacilityByIdService -> vraća objekat po ID-u` | PASS |
| Unit | Rukovanje situacijom kada objekat sa ID-em ne postoji | `getFacilityByIdService -> vraća null ako objekat ne postoji` | PASS |
| Unit | Automatsko parsiranje string tekstualnog ID-a u broj | `getFacilityByIdService -> parsira string ID u broj` | PASS |
| Unit | Uspješno ažuriranje osnovnih podataka (naziv) objekta | `updateFacilityService -> uspješno ažurira naziv objekta` | PASS |
| Unit | Validacija ID-a objekta prilikom slanja zahtjeva za izmjenu | `updateFacilityService -> baca grešku za nevažeći (negativan) ID objekta` | PASS |
| Unit | Validacija kapaciteta prilikom ažuriranja podataka | `updateFacilityService -> baca grešku za nevažeći kapacitet pri izmjeni` | PASS |
| Unit | Autorizacija izmjene: korisnik nije stvarni vlasnik objekta | `updateFacilityService -> baca grešku ako korisnik nije vlasnik` | PASS |
| Unit | Autorizacija izmjene: ulogovani korisnik uopšte nema ulogu VLASNIK | `updateFacilityService -> baca grešku ako korisnik nije uloge VLASNIK` | PASS |
| Unit | Pokušaj izmjene objekta koji ne postoji u bazi podataka | `updateFacilityService -> baca grešku ako objekat ne postoji` | PASS |
| Unit | Mehanizam brisanja objekta: Soft-delete provjera statusa | `deleteFacilityService -> postavlja status NEAKTIVAN umjesto brisanja` | PASS |
| Unit | Pokušaj pokretanja brisanja za nepostojeći objekat | `deleteFacilityService -> baca grešku ako objekat ne postoji.` | PASS |

### INTEGRACIJSKI TESTOVI — FACILITY RUTE 

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Int. | Uspješno kreiranje novog sportskog objekta preko rute (201) | `POST /api/objekti -> 201 — uspješno kreira objekat` | PASS |
| Int. | Rukovanje serverskom greškom prilikom kreiranja (500) | `POST /api/objekti -> 500 — vraća grešku ako service baci izuzetak` | PASS |
| Int. | Uspješno dohvatanje niza sa objektima vlasnika (200) | `GET /api/objekti -> 200 — vraća listu objekata` | PASS |
| Int. | Dohvatanje praznog niza objekata kada nema podataka (200) | `GET /api/objekti -> 200 — vraća praznu listu ako nema objekata` | PASS |
| Int. | Presretanje neočekivanih grešaka baze pri dohvatu liste (500) | `GET /api/objekti -> 500 — vraća grešku ako service baci izuzetak` | PASS |
| Int. | Uspješno dohvatanje pojedinačnih detalja objekta po ID-u (200) | `GET /api/objekti/:id -> 200 — vraća detalje postojećeg objekta` | PASS |
| Int. | Zahtjev za detalje objekta koji ne postoji u sistemu (404) | `GET /api/objekti/:id -> 404 — vraća grešku ako objekat ne postoji` | PASS |
| Int. | Uspješno ažuriranje resursa preko PUT metode (200) | `PUT /api/objekti/:id -> 200 — uspješno ažurira objekat` | PASS |
| Int. | Blokiranje ažuriranja ukoliko korisnik krši pravo vlasništva (500) | `PUT /api/objekti/:id -> 500 — vraća grešku ako korisnik nije vlasnik` | PASS |
| Int. | Uspješno izvršavanje soft-delete akcije preko DELETE rute (200) | `DELETE /api/objekti/:id -> 200 — uspješno deaktivira objekat` | PASS |
| Int. | Pokušaj brisanja resursa koji ne postoji unutar sistema (500) | `DELETE /api/objekti/:id -> 500 — vraća grešku ako objekat ne postoji` | PASS |
| Int. | Generisanje rasporeda i masovno kreiranje termina (201) | `POST /api/objekti/:id/termini -> 201 — uspješno kreira termine` | PASS |
| Int. | Provjera sistema zaštite od preklapanja satnica termina (400) | `POST /api/objekti/:id/termini -> 400 — vraća grešku za preklapanje` | PASS |

### UI TESTOVI — FACILITIES PAGE

| Nivo | Komponenta / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| UI | Prikaz stranice: Renderovanje glavnog naslova | `Prikaz stranice -> prikazuje naslov "Upravljanje Objektima"` | PASS |
| UI | Prikaz stranice: Renderovanje prazne forme za novi unos | `Prikaz stranice -> prikazuje formu za dodavanje novog objekta` | PASS |
| UI | Prikaz stranice: Vizuelni indikator učitavanja (Loading) | `Prikaz stranice -> prikazuje "Učitavanje podataka..." dok čeka odgovor` | PASS |
| UI | Prikaz stranice: Ispis poruke kada je tabela prazna | `Prikaz stranice -> prikazuje poruku ako nema objekata` | PASS |
| UI | Prikaz stranice: Mapiranje i ispravan prikaz redova iz API-ja | `Prikaz stranice -> prikazuje listu objekata koje API vrati` | PASS |
| UI | Klijentska validacija: Polje za naziv je obavezno | `Validacija forme -> prikazuje grešku ako naziv nije unesen` | PASS |
| UI | Klijentska validacija: Naziv ne smije biti isključivo numerički | `Validacija forme -> prikazuje grešku ako je naziv samo brojevi` | PASS |
| UI | Klijentska validacija: Ograničenje kapaciteta izvan dozvoljenog opsega | `Validacija forme -> prikazuje grešku ako je broj igrača izvan raspona` | PASS |
| UI | Klijentska validacija: Adresa ne smije biti isključivo numerička | `Validacija forme -> prikazuje grešku ako je adresa samo brojevi` | PASS |
| UI | Korisničke akcije: Uspješno slanje forme i prikaz feedbacka | `Kreiranje objekta -> poziva API i prikazuje uspješnu poruku` | PASS |
| UI | Korisničke akcije: Prikaz tačne i specifične serverske greške na ekranu | `Kreiranje objekta -> prikazuje grešku ako API vrati error` | PASS |
| UI | Edit mod: Automatsko popunjavanje forme podacima selektovanog objekta | `Uređivanje objekta -> klik na "Uredi" popunjava formu s podacima` | PASS |
| UI | Edit mod: Dinamička promjena naslova sekcije i natpisa na dugmetu | `Uređivanje objekta -> prikazuje "Uredi objekat" u naslovu forme` | PASS |
| UI | Edit mod: Otkazivanje izmjene i vraćanje forme u inicijalno stanje | `Uređivanje objekta -> "Otkaži" resetuje formu i vraća na Novi objekat` | PASS |
| UI | Brisanje: Otvaranje interaktivnog dijalog prozorčića za potvrdu | `Brisanje objekta -> klik na "Ukloni" prikazuje potvrdu` | PASS |
| UI | Brisanje: Odbijanje i zatvaranje dijaloga bez pokretanja akcije | `Brisanje objekta -> "Ne" otkazuje brisanje i skriva potvrdu` | PASS |
| UI | Brisanje: Potvrda brisanja, slanje API zahtjeva i ispis uspjeha | `Brisanje objekta -> "Da" poziva API za brisanje i prikazuje poruku` | PASS |



## Modul: Upravljanje terminima i kalendarom sportskih objekata

### Sumarna statistika pokrivenosti testova
* **Unit Testovi (`facilityService.test.js`):** 16 testnih scenarija — **Svi uspješni (100% PASS)**
* **Integracijski Testovi (`facilityRoutes.test.js`):** 4 testna scenarija — **Svi uspješni (100% PASS)**
* **UI Testovi (`FacilityTermsPage.test.jsx`):** 9 testnih scenarija — **Svi uspješni (100% PASS)**

---

###  Detaljni Matrični Prikaz Izvršenih Testova

####  UNIT TESTOVI

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Uspješno kreiranje pojedinačnog termina od strane autorizovanog vlasnika | `facilityService termini objekta -> VLASNIK objekta moze kreirati jedan termin` | PASS |
| Unit | Grupno generisanje termina u sekvencama na sedmičnom nivou | `facilityService termini objekta -> SEDMICNO kreira vise termina u razmaku od sedam dana` | PASS |
| Unit | Grupno generisanje termina u sekvencama na mjesečnom nivou | `facilityService termini objekta -> MJESECNO kreira vise termina u razmaku od mjesec dana` | PASS |
| Unit | Validacija ulaznih formata datuma i odbijanje neispravnog string zapisa | `facilityService termini objekta -> odbija nevalidan datum pri kreiranju termina` | PASS |
| Unit | Validacija dozvoljenog trajanja slota i sprečavanje nevalidnih dužina | `facilityService termini objekta -> odbija nevalidno trajanje pri kreiranju termina` | PASS |
| Unit | Validacija strategije ponavljanja i odbijanje nepodržanih tipova (npr. DNEVNO) | `facilityService termini objekta -> odbija nevalidno ponavljanje pri kreiranju termina` | PASS |
| Unit | Rukovanje situacijom i vraćanje 404 greške kada matični objekat ne postoji | `facilityService termini objekta -> vraca 404 pri kreiranju termina ako objekat ne postoji` | PASS |
| Unit | Restrikcija pristupa i vraćanje 403 greške ako korisnik nije registrovani vlasnik | `facilityService termini objekta -> vraca 403 ako korisnik nije vlasnik objekta` | PASS |
| Unit | Robusna zaštita od preklapanja: blokiranje transakcije u slučaju kolizije | `facilityService termini objekta -> ne kreira nijedan termin ako postoji preklapanje` | PASS |
| Unit | Dohvatanje i filtriranje kalendarskih termina unutar specifičnog datumskog opsega | `facilityService termini objekta -> dohvata termine objekta koji se preklapaju sa datumskim opsegom` | PASS |
| Unit | Provjera vidljivosti administratorima: GET zahtjev mora uključiti i blokirane termine | `facilityService termini objekta -> GET termini vraca i BLOKIRAN termine u opsegu` | PASS |
| Unit | Ispravno rukovanje upitima nad objektima koji trenutno nemaju kreiranih termina | `facilityService termini objekta -> GET termini vraca praznu listu ako nema termina` | PASS |
| Unit | Zaštita resursa i vraćanje 404 greške pri dohvatu rasporeda za nepostojeći objekat | `facilityService termini objekta -> GET termini vraca 404 ako objekat ne postoji` | PASS |
| Unit | Uspješno ažuriranje satnice i dužine trajanja postojećeg termina od strane vlasnika | `facilityService termini objekta -> uspjesno mijenja termin ako je korisnik vlasnik objekta` | PASS |
| Unit | Autorizacija izmjene: sprečavanje pokušaja modifikacije tuđeg termina (403) | `facilityService termini objekta -> zabranjuje izmjenu termina ako korisnik nije vlasnik objekta` | PASS |
| Unit | Pokušaj slanja modifikacije za termin sa nepostojećim identifikatorom (404) | `facilityService termini objekta -> vraca 404 pri izmjeni ako termin ne postoji` | PASS |
| Unit | Validacija preklapanja satnica prilikom pomjeranja termina na novi slot | `facilityService termini objekta -> zabranjuje izmjenu termina ako novi termin ima overlap` | PASS |
| Unit | Algoritamsko ignorisanje samog sebe u provjeri preklapanja pri ažuriranju | `facilityService termini objekta -> pri izmjeni ne tretira trenutni termin kao overlap sam sa sobom` | PASS |
| Unit | Uspješno administrativno i ručno blokiranje slobodnog termina od strane vlasnika | `facilityService termini objekta -> uspjesno blokira termin ako je korisnik vlasnik objekta` | PASS |
| Unit | Autorizacija blokiranja: sprečavanje vlasnika da onesposobe termine na tuđim objektima | `facilityService termini objekta -> zabranjuje blokiranje termina ako korisnik nije vlasnik objekta` | PASS |
| Unit | Pokušaj pokretanja akcije blokiranja za termin koji ne postoji u bazi podataka | `facilityService termini objekta -> vraca 404 pri blokiranju ako termin ne postoji` | PASS |

####  INTEGRACIJSKI TESTOVI — FACILITY RUTE

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Int. | Verifikacija rute, JWT zaštite i kontrolera za kreiranje novih termina (201) | `POST /api/objekti/:id/termini je registrovan i koristi auth middleware i controller` | PASS |
| Int. | Provjera rute i controllerske logike za preuzimanje filtriranog kalendara termina (200) | `GET /api/objekti/:id/termini je registrovan i poziva controller` | PASS |
| Int. | Verifikacija rute, middleware autorizacije i kontrolera za modifikaciju termina (200) | `PUT /api/termini/:id je registrovan i koristi auth middleware i controller` | PASS |
| Int. | Provjera rute, autentifikacijskog tokena i kontrolera za blokiranje slota (200) | `DELETE /api/termini/:id je registrovan i koristi auth middleware i controller` | PASS |

####  UI TESTOVI — FACILITY TERMS PAGE

| Nivo | Komponenta / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| UI | Inicijalni prikaz: renderovanje naslova, naziva dvorane, prikaza i dd.mm.yyyy. datuma | `FacilityTermsPage -> prikazuje naslov, naziv objekta, sedmicni prikaz i datume u dd.mm.yyyy. formatu` | PASS |
| UI | Korisničke akcije: Otvaranje forme u modalu, unos podataka i kreiranje termina preko API-ja | `FacilityTermsPage -> otvara modal za kreiranje i uspjesno poziva create API` | PASS |
| UI | Rukovanje greškama: Prikaz poruke `TERMIN_SE_PREKLAPA` u modalu za kreiranje i zadržavanje modala | `FacilityTermsPage -> prikazuje TERMIN_SE_PREKLAPA gresku unutar create modala i ne zatvara ga` | PASS |
| UI | Mod za izmjenu: Selektovanje termina, otvaranje edit forme i pozivanje update API-ja | `FacilityTermsPage -> otvara detalje termina, edit modal i poziva update API` | PASS |
| UI | Rukovanje greškama: Prikaz specifične poruke o preklapanju unutar modala za ažuriranje | `FacilityTermsPage -> prikazuje TERMIN_SE_PREKLAPA gresku unutar edit modala` | PASS |
| UI | Korisničke akcije: Uspješno pokretanje blokiranja i sakrivanje akcija za već blokiran termin | `FacilityTermsPage -> blokira termin i za BLOKIRAN termin ne prikazuje Uredi niti Blokiraj` | PASS |
| UI | Klijentsko filtriranje: Dinamičko sakrivanje i ponovno vraćanje kartica termina klikom na status badge | `FacilityTermsPage -> status filteri frontend-side sakrivaju i vracaju termine` | PASS |
| UI | Kalendarska navigacija: Promjena sedmičnog opsega preko kontrolnih strelica i date picker-a | `FacilityTermsPage -> sedmicna navigacija i date picker mijenjaju prikazanu sedmicu` | PASS |
| UI | Optimizacija interfejsa: Prikaz skraćene liste i dugmeta "Vidi sve termine dana" za više od 4 stavke | `FacilityTermsPage -> prikazuje Vidi sve termine dana samo kada dan ima vise od cetiri termina` | PASS |
