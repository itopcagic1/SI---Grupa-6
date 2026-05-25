# Proof of Testing - Sprint 9

## Modul: Upravljanje grupnim treninzima i kapacitetom (Ilma Hindija)

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

## Modul: Ručna verifikacija i uslovne rezervacije (Semir Jamaković)

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
| UI | Dashboard prikazuje posebnu sekciju "Zahtjevi nepouzdanih korisnika na čekanju" | `prikazuje posebnu sekciju za pending zahtjeve nepouzdanih korisnika` | PASS |
| UI | Pending zahtjevi se filtriraju po `izvor === 'ZAHTJEV_ZA_REZERVACIJU'` i statusu `NA_CEKANJU` uz fallback za `CEKANJE` | `prikazuje posebnu sekciju za pending zahtjeve nepouzdanih korisnika` | PASS |
| UI | Nepouzdan korisnik se prikazuje uz crveno upozorenje i broj prekršaja | `prikazuje posebnu sekciju za pending zahtjeve nepouzdanih korisnika` | PASS |
| UI | Klik na dugme "Odobri" poziva API sa `{ akcija: 'ODOBRI' }` i osvježava dashboard | `šalje ODOBRI akciju i osvježava dashboard` | PASS |
| UI | Klik na dugme "Odbij" otvara modal sa tekstom "Unesite razlog odbijanja termina" | `otvara ODBIJ modal i ne dozvoljava potvrdu prije 10 karaktera` | PASS |
| UI | Dugme "Potvrdi odbijanje" je disabled dok razlog nema najmanje 10 karaktera | `otvara ODBIJ modal i ne dozvoljava potvrdu prije 10 karaktera` | PASS |
| UI | Validan razlog šalje API payload `{ akcija: 'ODBIJ', razlogOdbijanja: '<razlog>' }` | `otvara ODBIJ modal i ne dozvoljava potvrdu prije 10 karaktera` | PASS |

---

## Modul: Vlastiti kalendar i pregled rezervacija igrača (Irma Topčagić)

### Sumarna statistika pokrivenosti testova
* **Backend Unit Testovi (Servis - `rezervacijaService.test.js`):** 12 testnih scenarija za `getAllTermsService`, `createIndividualReservationService`, `cancelIndividualReservationService` i `getMojeRezervacijeService` — **Svi uspješni (100% PASS)**
* **Backend Integracijski Testovi (Rute - `rezervacijaRoutes.test.js`):** 14 testnih scenarija za sve rute rezervacija uključujući `GET /api/rezervacije/moje` — **Svi uspješni (100% PASS)**
* **Frontend UI Testovi (Komponenta - `PlayerDashboard.test.jsx`):** 27 testnih scenarija za sve tri sekcije dashboarda — **Svi uspješni (100% PASS)**

---

### Detaljni Matrični Prikaz Izvršenih Testova

### BACKEND UNIT TESTOVI — SERVIS (`rezervacijaService.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Vraća termine i označava `jeMojaRezervacija=true` za korisnikove termine | `getAllTermsService vraća slobodne i korisnikove rezervisane termine` | PASS |
| Unit | Označava `naListiCekanja=true` kada je korisnik na listi čekanja | `getAllTermsService označava naListiCekanja=true kada je korisnik na listi čekanja` | PASS |
| Unit | Vraća praznu listu kada nema termina | `getAllTermsService vraća praznu listu kada nema termina` | PASS |
| Unit | Kreira potvrđenu rezervaciju za pouzdanog korisnika i vraća `REZERVISANO` | `createIndividualReservationService kreira potvrđenu rezervaciju ako je igrač pouzdan` | PASS |
| Unit | Kreira zahtjev `NA_CEKANJU` za nepouzdanog korisnika bez direktne rezervacije | `createIndividualReservationService kreira zahtjev ako igrač nije pouzdan` | PASS |
| Unit | Baca grešku `TERMIN_NIJE_DOSTUPAN` ako termin nije slobodan | `createIndividualReservationService baca grešku kada termin ne postoji` | PASS |
| Unit | Baca grešku ako termin ne postoji u bazi | `createIndividualReservationService baca grešku kada termin ne postoji` | PASS |
| Unit | Baca grešku `DUPLI_TERMIN` ako korisnik već ima aktivnu rezervaciju | `createIndividualReservationService baca grešku za duplu rezervaciju` | PASS |
| Unit | Baca grešku `NEVALIDAN_ID` za nevažeći `terminId` format | `createIndividualReservationService baca grešku za neispravan terminId` | PASS |
| Unit | Uspješno otkazuje rezervaciju i oslobađa termin | `cancelIndividualReservationService uspješno otkazuje rezervaciju` | PASS |
| Unit | Baca grešku `REZERVACIJA_NIJE_PRONADJENA` ako rezervacija ne postoji | `cancelIndividualReservationService baca grešku kada rezervacija ne postoji` | PASS |
| Unit | Baca grešku `TERMIN_VEC_PROSAO` ako je termin već prošao | `cancelIndividualReservationService baca grešku za termin koji je već prošao` | PASS |
| Unit | Vraća sortirane individualne i grupne rezervacije za korisnika | `getMojeRezervacijeService vraća sortirane individualne i grupne rezervacije` | PASS |
| Unit | Filtrira prošle termine i vraća samo nadolazeće | `getMojeRezervacijeService filtrira prošle termine i vraća samo nadolazeće` | PASS |
| Unit | Vraća praznu listu ako nema rezervacija | `getMojeRezervacijeService vraća praznu listu ako nema rezervacija` | PASS |

### BACKEND INTEGRACIJSKI TESTOVI — RUTE (`rezervacijaRoutes.test.js`)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Integracijski | Uspješan dohvat slobodnih individualnih termina za ulogu IGRAC | `GET /api/rezervacije/slobodni/individualni - success for IGRAC` | PASS |
| Integracijski | Blokiranje pristupa za neovlaštenu ulogu TRENER | `GET /api/rezervacije/slobodni/individualni - 403 for TRENER` | PASS |
| Integracijski | Uspješno kreiranje individualne rezervacije za ulogu IGRAC | `POST /api/rezervacije/individualne/:id - success for IGRAC` | PASS |
| Integracijski | Uspješno otkazivanje individualne rezervacije za ulogu IGRAC | `DELETE /api/rezervacije/individualne/:id - success for IGRAC` | PASS |
| Integracijski | Uspješan dohvat nadolazećih rezervacija prijavljenog korisnika | `GET /api/rezervacije/moje - success for IGRAC` | PASS |
| Integracijski | Blokiranje dohvata rezervacija bez tokena | `GET /api/rezervacije/moje - 401 bez tokena` | PASS |

### FRONTEND UI TESTOVI — KOMPONENTA (`PlayerDashboard.test.jsx`)

#### Pristup i zaglavlje (3 testa)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| UI | Prikazuje poruku o odbijenom pristupu za neulogovane korisnike | `prikazuje poruku o odbijenom pristupu za neulogovane korisnike` | PASS |
| UI | Prikazuje dashboard sa naslovom za prijavljenog igrača | `prikazuje dashboard za igrača` | PASS |
| UI | Prikazuje broj nadolazećih rezervacija u headeru | `prikazuje broj nadolazećih rezervacija u headeru` | PASS |

#### Individualni treninzi (8 testova)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| UI | Prikazuje sekciju Individualni treninzi | `prikazuje sekciju Individualni treninzi` | PASS |
| UI | Prikazuje dropdown za odabir sportskog objekta | `prikazuje dropdown za odabir sportskog objekta` | PASS |
| UI | Prikazuje placeholder tekst kada objekat nije odabran | `prikazuje placeholder tekst kada objekat nije odabran` | PASS |
| UI | Prikazuje sedmičnu mrežu termina nakon odabira objekta | `prikazuje sedmicu i termine nakon odabira objekta` | PASS |
| UI | Prikazuje navigacijske gumbe za kretanje kroz sedmice | `prikazuje navigacijske gumbe za sedmice` | PASS |
| UI | Otvara modal za potvrdu rezervacije na klik slobodnog termina | `otvara modal za rezervaciju na klik slobodnog termina` | PASS |
| UI | Zatvara modal na klik dugmeta Odustani | `zatvara modal na klik Odustani` | PASS |
| UI | Poziva `reserveIndividualTerm` sa ispravnim `terminId` na potvrdu | `poziva reserveIndividualTerm na potvrdu rezervacije` | PASS |

#### Grupni treninzi (7 testova)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| UI | Prikazuje sekciju Grupni treninzi | `prikazuje sekciju Grupni treninzi` | PASS |
| UI | Prikazuje dostupan grupni trening sa imenom trenera i objektom | `prikazuje dostupan grupni trening` | PASS |
| UI | Prikazuje dugme Prijavi se za slobodan trening | `prikazuje dugme Prijavi se za slobodan trening` | PASS |
| UI | Poziva `prijaviSeNaGrupniTrening` sa ispravnim ID-em na klik | `poziva prijaviSeNaGrupniTrening na klik Prijavi se` | PASS |
| UI | Prikazuje status Prijavljeni ste i dugme Odjavi se kada je korisnik prijavljen | `prikazuje Odjavi se i Prijavljeni ste kada je korisnik prijavljen` | PASS |
| UI | Prikazuje Popunjeno i onemogućava prijavu kada je dostignut kapacitet | `prikazuje Popunjeno kada je trening pun` | PASS |
| UI | Prikazuje empty state poruku kada nema dostupnih grupnih treninga | `prikazuje empty state kada nema grupnih treninga` | PASS |

#### Moje rezervacije (9 testova)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| UI | Prikazuje sekciju Moje rezervacije | `prikazuje sekciju Moje rezervacije` | PASS |
| UI | Prikazuje individualnu rezervaciju sa ispravnim tipom i objektom | `prikazuje individualnu rezervaciju sa ispravnim tipom` | PASS |
| UI | Prikazuje grupnu rezervaciju sa imenom trenera | `prikazuje grupnu rezervaciju sa imenom trenera` | PASS |
| UI | Prikazuje dugme Otkaži termin za svaku rezervaciju | `prikazuje dugme Otkaži termin za svaku rezervaciju` | PASS |
| UI | Otvara modal za otkazivanje na klik Otkaži termin | `otvara modal za otkazivanje na klik Otkaži termin` | PASS |
| UI | Poziva `cancelIndividualTerm` sa ispravnim `terminId` na potvrdu otkazivanja | `poziva cancelIndividualTerm na potvrdu otkazivanja individualnog termina` | PASS |
| UI | Zahtijeva unos razloga odjave za grupni trening i onemogućava potvrdu bez njega | `zahtijeva razlog odjave za grupni trening` | PASS |
| UI | Prikazuje empty state poruku kada nema nadolazećih rezervacija | `prikazuje empty state kada nema rezervacija` | PASS |
| UI | Prikazuje grešku ako učitavanje podataka ne uspije | `prikazuje grešku ako učitavanje ne uspije` | PASS |

---