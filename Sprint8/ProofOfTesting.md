# Dokaz o Testiranju (Proof of Testing) 


## Upravljanje sportskim objektima (CRUD operacije)

### Sumarna statistika pokrivenosti testova
* **Unit Testovi (`facilityService.test.js`):** 26 testnih scenarija — **Svi uspješni (100% PASS)**
* **Integracijski Testovi (`facilityRoutes.integration.test.js`):** 13 testnih scenarija — **Svi uspješni (100% PASS)**
* **UI Testovi (`FacilitiesPage.ui.test.jsx`):** 17 testnih scenarija — **Svi uspješni (100% PASS)**

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
