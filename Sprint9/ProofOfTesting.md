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
---
## Modul: Ručna verifikacija i uslovne rezervacije (Developer 2 - Semir Jamaković)

### Sumarna statistika pokrivenosti testova
* **Backend Unit Testovi (Servis - `rezervacijaService.test.js`):** status pending zahtjeva za nepouzdane korisnike usaglašen na `NA_CEKANJU` — **Svi relevantni testovi uspješni (PASS)**
* **Backend Unit Testovi (Servis - `vlasnikService.test.js`):** 7 testnih scenarija za ODOBRI/ODBIJ verifikaciju zahtjeva — **Svi uspješni (100% PASS)**
* **Backend Unit Testovi (Kontroler - `vlasnikController.test.js`):** 3 testna scenarija za prosljeđivanje i obradu grešaka — **Svi uspješni (100% PASS)**
* **Backend Unit Testovi (Rute - `vlasnikRoutes.test.js`):** 1 testni scenarij za PATCH rutu i zaštitu vlasničkom rolom — **Uspješan (100% PASS)**
* **Frontend UI Testovi (`VlasnikDashboard.test.jsx`):** 3 testna scenarija za pending sekciju, ODOBRI akciju i ODBIJ modal — **Svi uspješni (100% PASS)**
* **Frontend Build (`npm run build`):** produkcijski build uspješno izvršen — **PASS**

---

### Detaljni Matrični Prikaz Izvršenih Testova

### BACKEND UNIT TESTOVI - STATUS PENDING ZAHTJEVA (`rezervacijaService.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Nepouzdan korisnik ne dobija direktnu rezervaciju nego zahtjev za ručnu obradu | `createIndividualReservationService kreira zahtjev ako igrač nije pouzdan` | PASS |
| Unit | Novi pending zahtjev se kreira sa statusom `NA_CEKANJU` umjesto starog `CEKANJE` | `expect(... status: 'NA_CEKANJU')` u `rezervacijaService.test.js` | PASS |
| Unit | Duplicate provjera prepoznaje aktivne pending zahtjeve i sprječava duplu rezervaciju | `createIndividualReservationService baca grešku za duplu rezervaciju` | PASS |

### BACKEND UNIT TESTOVI - SERVIS (`vlasnikService.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | VLASNIK može odobriti pending zahtjev | `VLASNIK može odobriti pending zahtjev` | PASS |
| Unit | ODOBRI kreira stvarnu `Rezervacija`, postavlja zahtjev na `ODOBRENO` i termin na `ZAUZET` | `VLASNIK može odobriti pending zahtjev` | PASS |
| Unit | ODOBRI kreira notifikaciju korisniku | `tipNotifikacije: 'ZAHTJEV_REZERVACIJE_ODOBREN'` | PASS |
| Unit | VLASNIK može odbiti pending zahtjev sa validnim razlogom | `VLASNIK može odbiti pending zahtjev sa validnim razlogom` | PASS |
| Unit | ODBIJ upisuje `razlogOdbijanja`, `obradioKorisnikId` i status `ODBIJENO` | `VLASNIK može odbiti pending zahtjev sa validnim razlogom` | PASS |
| Unit | ODBIJ bez razloga ili sa manje od 10 karaktera vraća validacionu grešku | `ODBIJ bez validnog razloga vraća 400` | PASS |
| Unit | Nevalidna akcija vraća grešku `NEISPRAVNA_AKCIJA` | `nevalidna akcija vraća 400` | PASS |
| Unit | Zahtjev koji više nije pending ne može se ponovo obraditi | `ne može se obraditi zahtjev koji nije pending` | PASS |
| Unit | ODOBRI je blokiran ako je termin u međuvremenu zauzet | `ne može se odobriti zahtjev ako je termin zauzet` | PASS |
| Unit | VLASNIK ne može obraditi zahtjev koji ne pripada njegovom objektu | `VLASNIK ne može obraditi zahtjev koji ne pripada njegovom objektu` | PASS |

### BACKEND UNIT TESTOVI - KONTROLER (`vlasnikController.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Kontroler prosljeđuje `params.id`, `akcija` i `razlogOdbijanja` servisu | `obradiZahtjevVerifikacije prosljeđuje id, akciju i razlog servisu` | PASS |
| Unit | Kontroler vraća rezultat servisa za uspješnu obradu zahtjeva | `obradiZahtjevVerifikacije prosljeđuje id, akciju i razlog servisu` | PASS |
| Unit | Kontroler vraća status i format greške dobijen iz servisa | `obradiZahtjevVerifikacije vraća status i grešku iz servisa` | PASS |

### BACKEND UNIT TESTOVI - RUTE (`vlasnikRoutes.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Ruta `PATCH /api/vlasnik/zahtjevi/:id/verifikacija` je registrovana na vlasničkom routeru | `PATCH /api/vlasnik/zahtjevi/:id/verifikacija je registrovan...` | PASS |
| Unit | Ruta koristi `authenticateToken` i `requireRole('VLASNIK')` | `PATCH /api/vlasnik/zahtjevi/:id/verifikacija je registrovan...` | PASS |

### FRONTEND UI TESTOVI (`VlasnikDashboard.test.jsx`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| UI | Dashboard prikazuje posebnu sekciju “Zahtjevi nepouzdanih korisnika na čekanju” | `prikazuje posebnu sekciju za pending zahtjeve nepouzdanih korisnika` | PASS |
| UI | Pending zahtjevi se filtriraju po `izvor === 'ZAHTJEV_ZA_REZERVACIJU'` i statusu `NA_CEKANJU` uz fallback za `CEKANJE` | `prikazuje posebnu sekciju za pending zahtjeve nepouzdanih korisnika` | PASS |
| UI | Nepouzdan korisnik se prikazuje uz crveno upozorenje i broj prekršaja | `prikazuje posebnu sekciju za pending zahtjeve nepouzdanih korisnika` | PASS |
| UI | Klik na dugme “Odobri” poziva API sa `{ akcija: 'ODOBRI' }` i osvježava dashboard | `šalje ODOBRI akciju i osvježava dashboard` | PASS |
| UI | Klik na dugme “Odbij” otvara modal sa tekstom “Unesite razlog odbijanja termina” | `otvara ODBIJ modal i ne dozvoljava potvrdu prije 10 karaktera` | PASS |
| UI | Dugme “Potvrdi odbijanje” je disabled dok razlog nema najmanje 10 karaktera | `otvara ODBIJ modal i ne dozvoljava potvrdu prije 10 karaktera` | PASS |
| UI | Validan razlog šalje API payload `{ akcija: 'ODBIJ', razlogOdbijanja: '<razlog>' }` | `otvara ODBIJ modal i ne dozvoljava potvrdu prije 10 karaktera` | PASS |

---

---
## Modul: Automatizacija, tajmeri i vlasnička otkazivanja (Developer 3 - Zeir Mašić)

### Sumarna statistika pokrivenosti testova
* **Backend Unit Testovi (Kontroler - `rezervacijaController.queue.test.js`):** 1 testni scenarij za BullMQ delayed job pri kreiranju pending rezervacije — **Uspješan (100% PASS)**
* **Backend Unit Testovi (Rute - `vlasnikRoutes.otkazivanje.test.js`):** 2 testna scenarija za vlasničku rutu otkazivanja i zaštitu vlasničkom rolom — **Svi uspješni (100% PASS)**
* **Frontend Regresioni Testovi (`VlasnikDashboard.test.jsx`):** postojeći frontend test suite pokrenut kao regresiona provjera dashboarda — **Svi uspješni (100% PASS)**

---

### Detaljni Matrični Prikaz Izvršenih Testova

### BACKEND UNIT TESTOVI - KONTROLER (`rezervacijaController.queue.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Kada se za nepouzdanog korisnika kreira zahtjev sa statusom `NA_CEKANJU`, sistem dodaje BullMQ delayed job za automatsku obradu nakon 60 minuta | `kreirajIndividualnuRezervaciju dodaje timeout job za NA_CEKANJU rezervaciju` | PASS |
| Unit | BullMQ job se dodaje sa ispravnim payloadom koji sadrži `reservationId` i `termId` | `expect(queue.add).toHaveBeenCalledWith(... { reservationId, termId } ...)` | PASS |
| Unit | BullMQ job koristi odlaganje od tačno 60 minuta | `expect(... delay: 60 * 60 * 1000 ...)` | PASS |
| Unit | Test ne koristi pravi Redis/BullMQ servis nego mockovane zavisnosti | Mockovani `queue`, PrismaClient, rezervacioni servis i timeout calculator | PASS |

### BACKEND UNIT TESTOVI - RUTE (`vlasnikRoutes.otkazivanje.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Ruta `POST /api/vlasnik/rezervacije/:id/otkazivanje` je registrovana na vlasničkom routeru | `POST /api/vlasnik/rezervacije/:id/otkazivanje je registrovan...` | PASS |
| Unit | Ruta za vlasničko otkazivanje koristi zaštitu vlasničkom rolom `VLASNIK` | `expect(requireRole).toHaveBeenCalledWith('VLASNIK')` | PASS |
| Unit | Neovlašten pristup ruti za vlasničko otkazivanje vraća `403 Forbidden` kada role middleware zabrani pristup | `POST /api/vlasnik/rezervacije/:id/otkazivanje vraća 403 za neovlaštenu ulogu` | PASS |

### DODATNA REGRESIONA PROVJERA - FRONTEND (`VlasnikDashboard.test.jsx`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| UI / Regresija | Postojeći dashboard test suite se i dalje uspješno izvršava nakon dodavanja Developer 3 testova | `npm test -- src/pages/__tests__/VlasnikDashboard.test.jsx` | PASS |
| UI / Regresija | Potvrđeno da dodani backend testovi nisu narušili postojeće frontend testove dashboarda | `VlasnikDashboard.test.jsx - 1 passed, 3 tests passed` | PASS |

---
