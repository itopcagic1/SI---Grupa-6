# Dokaz o Testiranju (Proof of Testing) - Sprint 9

## Modul: Upravljanje grupnim treninzima i kapacitetom (Developer 5 - Ilma Hindija)

### Sumarna statistika pokrivenosti testova
* **Unit Testovi (Servis - `grupneRezervacijeService.test.js`):** 9 testnih scenarija — **Svi uspješni (100% PASS)**
* **Unit Testovi (Kontroler - `grupneRezervacijeController.test.js`):** 11 testnih scenarija — **Svi uspješni (100% PASS)**
* **Integracijski Testovi (Rute - `rezervacijaRoutes.test.js`):** 12 testnih scenarija — **Svi uspješni (100% PASS)**
* **Frontend API Testovi (`reservationApi.test.js`):** 17 testnih scenarija — **Svi uspješni (100% PASS)**

---

### Detaljni Matrični Prikaz Izvršenih Testova

### BACKEND INTEGRACIJSKI TESTOVI — RUTE (`rezervacijaRoutes.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Integracijski | Uspješan dohvat slobodnih individualnih termina za ulogu IGRAC | `GET /api/rezervacije/slobodni/individualni - success for IGRAC` | PASS |
| Integracijski | Blokiranje dohvata slobodnih individualnih termina za neovlaštenu ulogu TRENER | `GET /api/rezervacije/slobodni/individualni - 403 for TRENER` | PASS |
| Integracijski | Uspješno kreiranje individualne rezervacije za ulogu IGRAC | `POST /api/rezervacije/individualne/:id - success for IGRAC` | PASS |
| Integracijski | Uspješno otkazivanje individualne rezervacije za ulogu IGRAC | `DELETE /api/rezervacije/individualne/:id - success for IGRAC` | PASS |
| Integracijski | Uspješno kreiranje grupnog treninga za ulogu TRENER | `POST /api/rezervacije/grupne/:id - success for TRENER` | PASS |
| Integracijski | Blokiranje kreiranja grupnog treninga za neovlaštenu ulogu IGRAC | `POST /api/rezervacije/grupne/:id - 403 for IGRAC` | PASS |
| Integracijski | Uspješna prijava igrača na grupni trening | `POST /api/rezervacije/grupne/:id/prijave - success for IGRAC` | PASS |
| Integracijski | Uspješan dohvat vlastitih grupnih treninga trenera | `GET /api/rezervacije/grupne/moje - success for TRENER` | PASS |
| Integracijski | Uspješan dohvat svih grupnih treninga za igrače | `GET /api/rezervacije/grupne/sve - success for IGRAC` | PASS |
| Integracijski | Uspješno otkazivanje grupnog treninga od strane trenera | `DELETE /api/rezervacije/grupne/:id - success for TRENER` | PASS |
| Integracijski | Uspješna odjava igrača sa grupnog treninga | `DELETE /api/rezervacije/grupne/:id/prijave - success for IGRAC` | PASS |
| Integracijski | Uspješan dohvat notifikacija za trenera o odjavama igrača | `GET /api/rezervacije/grupne/notifikacije - success for TRENER` | PASS |

### BACKEND UNIT TESTOVI — SERVIS (`grupneRezervacijeService.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Uspješno kreiranje grupnog treninga sa ispravnim podacima | `kreirajGrupniTreningService -> uspješno kreira grupni trening` | PASS |
| Unit | Sprečavanje kreiranja treninga ako je kapacitet manji od 2 | `kreirajGrupniTreningService -> baca grešku ako je kapacitet manji od 2` | PASS |
| Unit | Sprečavanje kreiranja treninga ako je kapacitet veći od 30 | `kreirajGrupniTreningService -> baca grešku ako je kapacitet veći od 30` | PASS |
| Unit | Sprečavanje kreiranja ako je termin već zauzet | `kreirajGrupniTreningService -> baca grešku ako je termin već zauzet` | PASS |
| Unit | Uspješna prijava igrača na trening unutar kapaciteta | `prijaviSeNaGrupniTreningService -> uspješno prijavljuje igrača` | PASS |
| Unit | Blokiranje prijave ako je dostignut maksimalan kapacitet treninga | `prijaviSeNaGrupniTreningService -> baca grešku ako je popunjen kapacitet` | PASS |
| Unit | Sprečavanje duple prijave istog igrača na isti trening | `prijaviSeNaGrupniTreningService -> baca grešku ako se igrač već prijavio` | PASS |
| Unit | Uspješna odjava igrača sa treninga uz prosljeđivanje razloga i slanje notifikacije | `odjaviSeSaGrupnogTreningaService -> uspješno odjavljuje igrača i šalje notifikaciju treneru` | PASS |
| Unit | Pokušaj odjave igrača koji uopšte nije bio prijavljen na trening | `odjaviSeSaGrupnogTreningaService -> baca grešku ako igrač nije prijavljen` | PASS |

### BACKEND UNIT TESTOVI — KONTROLER (`grupneRezervacijeController.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Kontroler ispravno kreira grupni trening i vraća JSON sa statusom 200 | `kreirajGrupniTrening -> kreira grupni trening` | PASS |
| Unit | Kontroler ispravno prijavljuje igrača i vraća status 200 | `prijaviSeNaGrupniTrening -> prijavljuje igrača na grupni trening` | PASS |
| Unit | Kontroler uspješno odjavljuje igrača i prosljeđuje unesen razlog odjave | `odjaviSeSaGrupnogTreninga -> odjavljuje igrača sa grupnog treninga` | PASS |
| Unit | Dohvatanje aktivnih treninga za trenera koji je prijavljen | `getTrenerGrupniTreninzi -> dohvata grupne treninge trenera` | PASS |
| Unit | Dohvatanje svih dostupnih grupnih treninga za igrače | `getGrupniTreninzi -> dohvata sve grupne treninge` | PASS |

### FRONTEND API TESTOVI (`reservationApi.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Slanje GET zahtjeva za slobodne individualne termine sa autorizacijom | `getFreeIndividualTerms -> dohvata slobodne individualne termine` | PASS |
| Unit | Slanje POST zahtjeva za individualnu rezervaciju sa ID-em termina | `reserveIndividualTerm -> rezerviše individualni termin` | PASS |
| Unit | Slanje DELETE zahtjeva za otkazivanje individualne rezervacije | `cancelIndividualTerm -> otkazuje individualnu rezervaciju` | PASS |
| Unit | Slanje POST zahtjeva za kreiranje grupnog treninga sa kapacitetom i ID-em tima | `kreirajGrupniTrening -> kreira grupni trening sa ispravnim parametrima` | PASS |
| Unit | Slanje POST zahtjeva za prijavu igrača na grupni trening | `prijaviSeNaGrupniTrening -> prijavljuje se na grupni trening` | PASS |
| Unit | Slanje DELETE zahtjeva sa priloženim razlogom za odjavu sa treninga | `odjaviSeSaGrupnogTreninga -> odjavljuje se sa grupnog treninga` | PASS |
| Unit | Slanje GET zahtjeva za dohvatanje notifikacija trenera o odjavama igrača | `getTrenerNotifikacije -> dohvata notifikacije trenera o odjavama` | PASS |
| Unit | Slanje GET zahtjeva za listanje svih timova trenera | `getAllTeams -> dohvata sve timove` | PASS |
