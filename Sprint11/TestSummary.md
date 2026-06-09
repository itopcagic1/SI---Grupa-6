# Test Summary / QA Izvještaj

Ovaj izvještaj predstavlja detaljan pregled stanja testiranja za cijeli sistem (Frontend i Backend) na kraju završnog sprinta. Cilj je pružiti konkretne i provjerljive dokaze o stabilnosti aplikacije.

Svi testovi na backendu i frontendu su uspješno popravljeni i **prolaze 100%**, čime je uspostavljena potpuna stabilnost sistema prije isporuke i puštanja u rad.


---

## 1. Pokretanje testova u CI/CD okruženju

Pored lokalnog pokretanja (putem konzole), testovi se automatski pokreću i provjeravaju kroz **CI/CD pipeline** (kontinuirana integracija i isporuka) .

Pipeline se automatski pokreće pri svakom `push` ili `pull request` događaju na GitHub repozitoriju. On obavlja sljedeće korake:
1. Podiže izolovana Docker okruženja za frontend i backend.
2. Pokreće prateće usluge poput Redis servera (potrebnih za pozadinske zadatke na backendu).
3. Pokreće kompletnu bateriju testova (`npm run test` za frontend i backend) u tom čistom okruženju kako bi se potvrdilo da nijedna nova izmjena ne kvari postojeću stabilnost aplikacije prije deploya.

---

## 2. Lokacije i fajlovi sa testovima (Detaljan pregled)

U nastavku je prikazana kompletna struktura i spisak svih testnih datoteka u projektu:

### A. Backend Testovi (`Projekat/backend/tests`)
Ukupno ima **52 testna suita** sa **521 testom** koji pokrivaju integraciju, kontrolere i servise:

* **Integracioni testovi ruti i dozvola (`tests/integration/`)**:
  - `adminRoutes.test.js` - Testiranje administratorskih privilegija i akcija.
  - `applicationRoutes.test.js` - Testiranje ruti za prijave na turnire.
  - `authRoutes.test.js` - Testiranje prijave i registracije (rute).
  - `facilityRoutes.test.js` - Testiranje ruti za sportske objekte.
  - `homepageRoutes.test.js` - Testiranje javnih ruti za početnu stranu.
  - `ligaRoutes.test.js` - Testiranje ruti za upravljanje ligama.
  - `matchRoutes.test.js` - Testiranje ruti za utakmice i rezultate.
  - `notifikacijaController.test.js` - Testiranje slanja obavještenja.
  - `pdfRoutes.test.js` - Testiranje ruti za generisanje PDF izvještaja.
  - `permissions.test.js` - Testiranje uloga i permisija na nivou cijelog API-ja.
  - `rezervacijaController.test.js` / `rezervacijaRoutes.test.js` - Testiranje ruti za grupne i pojedinačne rezervacije.
  - `sportRoutes.test.js` - Testiranje ruti za sportske discipline.
  - `statistikaRoutes.test.js` - Testiranje ruti za statističke podatke.
  - `teamRoutes.test.js` - Testiranje ruti za timove.

* **Unit testovi poslovne logike (`tests/unit/services/`)**:
  - `applicationService.test.js` / `authService.test.js`
  - `emailService.test.js` / `pdfService.test.js`
  - `facilityService.test.js` / `vlasnikService.test.js`
  - `grupneRezervacijeService.test.js` / `rezervacijaService.test.js`
  - `ligaService.test.js` / `matchService.test.js`
  - `notifikacijaService.test.js` / `tabelaService.test.js`
  - `sportService.test.js` / `teamService.test.js`
  - `statistikaConsistencyService.test.js` / `statistikaService.test.js`

---

### B. Frontend Testovi (`Projekat/frontend`)
Ukupno ima **32 testna fajla** sa **234 testa** koji pokrivaju UI komponente, ruter i API klijente:

* **Stranice i ključne UI cjeline (`src/pages/__tests__/`)**:
  - `AdminKorisnici.test.jsx` - Testovi upravljanja korisnicima od strane admina.
  - `FacilityTermsPage.test.jsx` - Kalendar i upravljanje terminima za vlasnike objekata.
  - `Homepage.test.jsx` - Prikaz i navigacija na početnoj stranici.
  - `IndividualTraining.test.jsx` - Rezervacija individualnih treninga za igrače.
  - `Login.test.jsx` / `Register.test.jsx` - Autentifikacija korisnika.
  - `VlasnikDashboard.test.jsx` - Dashboard za vlasnike sportskih objekata.

* **Ostale stranice aplikacije (`tests/pages/`)**:
  - `AdminRoute.test.jsx` - Provjera ruter zaštite za admina.
  - `Facilities.test.jsx` - Prikaz, pretraga i dodavanje novih objekata.
  - `GenerateSchedule.test.jsx` - Kreiranje rasporeda i generisanje utakmica.
  - `Lige.test.jsx` / `Rezultati.test.jsx` - Upravljanje ligama i unosom ishoda.
  - `MojePrijave.test.jsx` / `Notifikacije.test.jsx` - Pregled prijava igrača i notifikacija.
  - `PlayerDashboard.test.jsx` - Glavna kontrolna tabla za ulogu igrača.
  - `Profile.test.jsx` - Pregled i uređivanje korisničkog profila.
  - `Sportovi.test.jsx` / `Timovi.test.jsx` - Upravljanje sportovima i timovima.
  - `StatistikaIgraca.test.jsx` / `StatistikaTima.test.jsx` - Prikaz performansi i strijelaca.

* **API klijenti i pomoćne funkcije (`tests/api/` i `tests/utils/`)**:
  - Testovi za `adminApi`, `applicationsApi`, `matchApi`, `sportApi` i pomoćne funkcije za računanje statistike.

---

## 3. Statistika prolaznosti testova (Konkretni rezultati)

Nakon pokretanja cjelokupnog testnog paketa na lokalnom računaru, dobijeni su sljedeći rezultati:

### A. Backend (Jest)
* **Ukupno testnih suita (Test Suites)**: 52
* **Položeno suita**: 52
* **Palo suita**: 0
* **Ukupan broj testova**: 521
* **Položeno pojedinačnih testova**: 521
* **Palo pojedinačnih testova**: 0
* **Prolaznost**: **100.00%**
* **Vrijeme izvršavanja**: 7.04 sekundi

### B. Frontend (Vitest)
* **Ukupno testnih fajlova**: 32
* **Položeno fajlova**: 32
* **Palo fajlova**: 0
* **Ukupan broj testova**: 234
* **Položeno pojedinačnih testova**: 234
* **Palo pojedinačnih testova**: 0
* **Prolaznost**: **100.00%**
* **Vrijeme izvršavanja**: 13.13 sekundi

---

## 4. Analiza riješenih testnih propusta

U prethodnim verzijama su postojale neusaglašenosti u testovima koje su u potpunosti otklonjene:

1. **Izolacija Neon Baze i Transakcija (Backend)**:
   - **Problem**: Neki servisi i kontroleri (poput `grupneRezervacijeService` i `vlasnikService`) su prilikom izmjena prešli na Prisma transakcije (`$transaction`), što je izazvalo pad testova jer transakcioni klijent `tx` nije bio pravilno mockovan.
   - **Rješenje**: Mocks za Prisma klijent u `jest` okruženju su ažurirani da podržavaju transakcijski klijent sa svim specifičnim metodama, što je omogućilo prolazak svih testova bez potrebe za pravom bazom.

2. **Upravljanje Vremenom i Vremenskim Zonama u Testovima (Frontend)**:
   - **Problem**: Testovi za ekrane sa kalendarom termina (`FacilityTermsPage.test.jsx` i `IndividualTraining.test.jsx`) su imali statičke mock datume u maju 2026. Pokretanje testova u različitim mjesecima i na sistemima sa različitim vremenskim zonama uzrokovalo je filtriranje termina izvan vidljive sedmice, što je dovodilo do padova.
   - **Rješenje**: U frontend testovima je uvedeno manipulisanje sistemskim vremenom putem `vi.useFakeTimers({ toFake: ['Date'] })` i `vi.setSystemTime(...)`. Ovo je fiksiralo virtuelno sistemsko vrijeme test runnera na tačan datum u maju 2026. bez blokiranja asinhronih Testing Library funkcija, omogućavajući stabilan i pouzdan prolazak.

---

## 5. Ručno testiranje i provjereni korisnički tokovi

Pored automatizovanih testova, izvršeno je detaljno ručno QA testiranje na deployovanoj aplikaciji za sljedeće ključne uloge i tokove:

| Korisnički tok | Uloge | Opis akcije | Očekivani rezultat | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Registracija i prijava** | Svi | Popunjavanje forme, validacija formata emaila i jačine lozinke, te prijava na sistem. | Korisnik dobija JWT token, sprema se u cookies, i preusmjerava se na odgovarajući dashboard. | **PROŠLO** |
| **Kreiranje turnira i rasporeda** | Organizator | Otvaranje lige, prijava timova i automatsko generisanje rasporeda utakmica. | Sistem kreira sve utakmice (svako sa svakim) i obavještava navijače prijavljenih timova. | **PROŠLO** |
| **Unos rezultata i tabela** | Organizator | Unos rezultata završene utakmice na rasporedu. | Tabela plasmana lige se automatski rekalkuliše (pobjede, porazi, bodovi) u realnom vremenu. | **PROŠLO** |
| **Rezervacija termina** | Igrač / Vlasnik | Igrač šalje zahtjev za rezervaciju termina u objektu. Vlasnik odobrava ili odbija zahtjev. | Status rezervacije se mijenja, igraču se šalje email/notifikacija, a termin se zaključava. | **PROŠLO** |
| **AI Predikcija Utakmica** | Navijač | Otvaranje detalja predstojeće utakmice i pokretanje AI analize. | Express backend poziva Python AI, vraća vjerovatnoću u % i tekstualno obrazloženje koje se renderuje u UI-ju. | **PROŠLO** |

---

## 6. Dokaz rezultata testiranja (Logovi)

### A. Izvod iz konzole za Backend (Jest):
```text
PASS src/tests/integration/authController.register.integration.test.js (5.433 s)
PASS src/tests/integration/authController.login.integration.test.js (5.842 s)
...
Test Suites: 52 passed, 52 total
Tests:       521 passed, 521 total
Snapshots:   0 total
Time:        7.04 s
Ran all test suites.
```

### B. Izvod iz konzole za Frontend (Vitest):
```text
 RUN  v4.1.5 C:/Users/hindi/OneDrive/Desktop/SI2/SI---Grupa-6/Projekat/frontend

 ✓ src/pages/__tests__/Homepage.test.jsx (2 tests) 348ms
 ✓ tests/pages/StatistikaTima.test.jsx (5 tests) 457ms
 ✓ tests/pages/Profile.test.jsx (2 tests) 438ms
 ✓ tests/pages/MojePrijave.test.jsx (4 tests) 368ms
 ✓ tests/pages/Facilities.test.jsx (17 tests) 6118ms
 ✓ src/pages/__tests__/FacilityTermsPage.test.jsx (9 tests) 6944ms
 ✓ src/pages/__tests__/IndividualTraining.test.jsx (6 tests) 754ms
 ...
 Test Files  32 passed (32)
      Tests  234 passed (234)
   Start at  11:52:08
   Duration  13.13s (transform 7.74s, setup 9.32s, import 19.91s, tests 37.70s)
```
