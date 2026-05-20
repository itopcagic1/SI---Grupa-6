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



## Modul: Statistika utakmica i automatsko bodovanje

### Sumarna statistika pokrivenosti testova
* **Unit Testovi:** 51 testni scenarij — **Svi uspješni (100% PASS)**
* **Integracijski Testovi (`statistikaRoutes.test.js`):** 11 testnih scenarija — **Svi uspješni (100% PASS)**
* **UI Testovi (`StatistikaIgraca.test.jsx`, `StatistikaTima.test.jsx`, `TopStrijelci.test.jsx`):** 16 testnih scenarija — **Svi uspješni (100% PASS)**

---

### Detaljni Matrični Prikaz Izvršenih Testova

### UNIT TESTOVI

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Validacija agregata: zbir golova igrača ne smije preći rezultat tima | `odbija unos previse golova igraca u odnosu na rezultat tima` | PASS |
| Unit | Validacija agregata nakon izmjene rezultata utakmice | `odbija promjenu rezultata koja invalidira postojece golove igraca` | PASS |
| Unit | Validacija konzistentnosti kartona između igrača i tima | `odbija kartone igraca koji prelaze timske kartone` | PASS |
| Unit | Ograničenje crvenih kartona za fudbalera (maksimalno 1) | `odbija vise od jednog crvenog kartona za fudbalera` | PASS |
| Unit | Ograničenje žutih kartona za fudbalera (maksimalno 2) | `odbija vise od dva zuta kartona za fudbalera` | PASS |
| Unit | Validacija maksimalnog broja timskih žutih kartona | `odbija previse timskih zutih kartona u fudbalu` | PASS |
| Unit | Validacija posjeda lopte unutar raspona 0-100 | `odbija posjed lopte van opsega` | PASS |
| Unit | Validacija ukupnog posjeda oba tima (~100%) | `odbija kada posjed oba fudbalska tima nije priblizno 100%` | PASS |
| Unit | Validacija asistencija igrača u odnosu na timske statistike | `odbija asistencije igraca koje prelaze timske asistencije kada timska statistika postoji` | PASS |
| Unit | Validacija asistencija u odnosu na broj golova | `odbija previse asistencija u odnosu na golove tima` | PASS |
| Unit | Propuštanje validnog scenarija statistike | `propusta validan scenario` | PASS |
| Unit | Dozvola parcijalne statistike ispod timskog agregata | `propusta djelimicnu statistiku kada je zbir igraca manji od timskog agregata` | PASS |
| Unit | Dohvatanje tipova statistike po sportu | `dohvata tipove statistike za sport` | PASS |
| Unit | Unos statistike samo za igrače koji učestvuju u utakmici | `snima statistiku igraca samo ako je igrac clan tima na utakmici` | PASS |
| Unit | Odbijanje igrača koji nije član nijednog tima utakmice | `odbija igraca koji nije clan timova utakmice` | PASS |
| Unit | Ažuriranje postojeće statistike bez dupliranja zapisa | `azurira postojecu vrijednost umjesto duplikata` | PASS |
| Unit | Validacija tipa statistike za određeni sport | `odbija tip statistike koji nije vezan za sport utakmice` | PASS |
| Unit | Unos timske statistike samo za timove sa utakmice | `snima timsku statistiku za tim koji igra utakmicu` | PASS |
| Unit | Poštivanje autorizacije kao kod unosa rezultata | `postuje isti permission model kao unos rezultata` | PASS |
| Unit | Agregacija statistike igrača po tipu | `trebalo bi da agregira statistike igraca po tipu` | PASS |
| Unit | Filtriranje statistike po takmičenju | `trebalo bi da filtriraj po takmicenju` | PASS |
| Unit | Filtriranje statistike po sezoni | `trebalo bi da filtriraj po sezoni` | PASS |
| Unit | Validacija neispravnog ID-a igrača | `trebalo bi da baci gresku sa nevalidnim ID-om` | PASS |
| Unit | Vraćanje praznog rezultata kada nema statistike | `trebalo bi da vrati prazan niz ako nema statistike` | PASS |
| Unit | Agregacija timske statistike po tipu | `trebalo bi da agregira statistike tima po tipu` | PASS |
| Unit | Validacija neispravnog ID-a tima | `trebalo bi da baci gresku sa nevalidnim ID-om` | PASS |
| Unit | Sortiranje top strijelaca po vrijednosti | `trebalo bi da vrati top strijelce sortirane po vrijednosti` | PASS |
| Unit | Validacija neispravnog ID-a takmičenja | `trebalo bi da baci gresku sa nevalidnim ID-om` | PASS |
| Unit | Validacija negativnog rezultata utakmice | `vraca gresku za negativan rezultat` | PASS |
| Unit | Odbijanje nepostojeće utakmice | `vraca gresku ako utakmica nije pronadjena` | PASS |
| Unit | Autorizacija organizatora pri unosu rezultata | `vraca gresku ako korisnik nije organizator te lige` | PASS |
| Unit | Automatsko ažuriranje plasmana u istoj transakciji | `uspjesno kreira rezultat i azurira plasman u istoj transakciji` | PASS |
| Unit | Odbijanje izmjene rezultata prije prvog unosa | `vraca gresku ako rezultat jos nije unesen` | PASS |
| Unit | Atomsko ažuriranje rezultata i tabele | `uspjesno azurira rezultat i tabelu atomski` | PASS |
| Unit | Odbijanje izmjene rezultata koja kvari postojeću statistiku | `odbija promjenu rezultata koja invalidira postojecu statistiku golova` | PASS |
| Unit | Izračunavanje gol razlike i ukupnih golova | `racuna G+, G- i GR iz RezultatUtakmice za domaci i gostujuci tim` | PASS |
| Unit | Filtriranje fudbalskih statistika za igrače | `filtrira fudbalske igracke tipove statistike` | PASS |
| Unit | Filtriranje fudbalskih statistika za timove | `filtrira fudbalske timske tipove statistike` | PASS |
| Unit | Frontend ograničenja za kartone i posjed lopte | `vraca ogranicenja za fudbalske kartone i posjed` | PASS |
| Unit | Frontend validacija ograničenja statistike | `validira ogranicenja za kartone i posjed na frontendu` | PASS |
| Unit | Formatiranje procenata i vremenskih vrijednosti | `formatira procente i vremena sa jedinicama` | PASS |

---

### INTEGRACIJSKI TESTOVI — STATISTIKA RUTE

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Int. | Dohvatanje agregirane statistike igrača sa svim filterima | `dohvat agregiranih statistika igraca sa svim filtrima` | PASS |
| Int. | Dohvatanje statistike igrača bez filtera | `dohvat statistika igraca bez filtera` | PASS |
| Int. | Validacija neispravnog ID-a igrača | `greska pri dohvatu statistika igraca sa nevalidnim ID` | PASS |
| Int. | Dohvatanje agregirane statistike tima sa filterima | `dohvat agregiranih statistika tima sa filtrima` | PASS |
| Int. | Validacija neispravnog ID-a tima | `greska sa nevalidnim timId` | PASS |
| Int. | Dohvatanje top strijelaca sa svim parametrima | `dohvat top strijelaca sa svim parametrima` | PASS |
| Int. | Dohvatanje top strijelaca bez tipa statistike | `poziv bez tipStatistikeId vraca rezultat iz servisa` | PASS |
| Int. | Dohvatanje top strijelaca sa custom limitom | `top strijelci sa custom limitom` | PASS |
| Int. | Dohvatanje top strijelaca sa default limitom | `top strijelci sa default limitom` | PASS |
| Int. | Validacija neispravnog ID-a takmičenja | `greska sa nevalidnim takmicenjeId` | PASS |
| Int. | Validacija neispravnog ID-a tipa statistike | `greska sa nevalidnim tipStatistikeId` | PASS |

---

### UI TESTOVI — STATISTIKA I PRIKAZ REZULTATA

| Nivo | Komponenta / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| UI | Prikaz loading stanja za statistiku igrača | `trebalo bi da prikaze ucitavanje nakon montiranja` | PASS |
| UI | Prikaz podataka nakon uspješnog učitavanja | `trebalo bi da prikaze podatke nakon ucitavanja` | PASS |
| UI | Prikaz greške pri neuspješnom dohvatu statistike | `trebalo bi da prikaze gresku ako dohvat ne uspije` | PASS |
| UI | Filtriranje statistike po takmičenju | `trebalo bi da pozove API sa takmicenjeId filterom` | PASS |
| UI | Prikaz tabele statistike igrača | `trebalo bi da prikaze tabelu sa statistikom` | PASS |
| UI | Prikaz naziva tima u naslovu stranice | `trebalo bi da prikaze naziv tima u naslovu` | PASS |
| UI | Prikaz greške pri neuspješnom dohvatu timske statistike | `trebalo bi da prikaze gresku ako dohvat padne` | PASS |
| UI | Prikaz broja odigranih utakmica | `trebalo bi da prikaze broj odigranih utakmica` | PASS |
| UI | Prikaz tabele timske statistike | `trebalo bi da prikaze tabelu sa statistikom tima` | PASS |
| UI | Dinamičko ažuriranje API poziva pri promjeni filtera | `trebalo bi da azurira API poziv kada se filter promijeni` | PASS |
| UI | Prikaz filtera i početne poruke na Top Strijelci stranici | `trebalo bi da prikaze filtre i poruku da odaberete takmicenje` | PASS |
| UI | Dinamičko učitavanje tipova statistike nakon izbora takmičenja | `trebalo bi da ucita tipove statistike kada se takmicenje odabere` | PASS |
| UI | Prikaz rang liste/top strijelaca nakon odabira filtera | `trebalo bi da prikaze top strijelce nakon odabira` | PASS |
| UI | Vizuelni prikaz medalja za top 3 rezultata | `trebalo bi da prikaze medalje za top 3` | PASS |
| UI | Prikaz greške pri neuspješnom dohvatu top strijelaca | `trebalo bi da prikaze gresku ako dohvat ne uspije` | PASS |
| UI | Primjena korisnički definisanog limita rezultata | `trebalo bi da koristi custom limit` | PASS |
