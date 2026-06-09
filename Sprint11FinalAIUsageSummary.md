# Final AI Usage Summary
**Projekat – SI, Grupa 6**  
*Transparentni i kritički pregled korištenja AI alata tokom razvoja (Sprint 5 – Sprint 10)*

---

## 1. Uvod


AI alati korišteni su kao podrška pri razvoju, za provjeru sintakse, prijedloge kostura funkcija, pomoć pri debugiranju i definisanje testnih scenarija. Od samog početka projekta AI je pomogao pri planiranju arhitekture i organizaciji sistema, te je kroz sve sprintove bio prisutan kao pomoćno sredstvo, a ne zamjena za rad članova tima. Svaki prijedlog je kritički analiziran te prihvaćen, prilagođen ili odbačen u skladu s postojećom arhitekturom i poslovnim pravilima projekta, a implementacije servisa, kontrolera, ruta, middleware-a i testova rađene su uz savjetovanje s AI alatima

Detaljni pojedinačni zapisi o korištenju AI alata nalaze se u fajlovima `AIUsageLog.md`.

---

## 2. Korišteni AI alati

| Alat | Sprintovi | 
|---|---|
| **Claude Sonnet 4.6** | Sprint 5, 6, 7, 8, 10 | 
| **Gemini (Antigravity / 3 Flash)** | Sprint 6, 7, 8, 10 | 
| **ChatGPT-4o / OpenAI Codex** | Sprint 7, 8 | 

---

## 3. Za šta je AI korišten

### Backend razvoj
- Konsultacija oko Prisma sintakse za compound unique ključeve i složenije upite
- Prijedlog kostura funkcija za autentifikaciju (login, registracija, reset lozinke) — tim je pisao kompletne servise i kontrolere
- Prijedlog helper funkcije za sabiranje bodova (3 za pobjedu, 1 za remi) pri unosu rezultata utakmica
- Konsultacija oko BullMQ queue arhitekture za timeout rezervacija nepouzdanih klijenata i logiku deadlinea
- Prijedlozi kostura CRUD operacija za sportske objekte s vlasništvo provjerom
- Pomoć pri proširenju statistike za više sportova (košarka, odbojka, tenis, rukomet, hokej, plivanje)
- Prijedlog strukture leaderboard servisa s agregacijom gol-razlike
- Sistem notifikacija za navijače omiljenih timova — obavještavanje pratilaca pri kreiranju rasporeda, unosu i izmjeni rezultata utakmica (`omiljeniTimNotifikacijaService.js`, `matchController.js`)


### Frontend razvoj
- Prijedlog SVG markup-a za ikone srca i Tailwind stilizacije, pri čemu je tim prilagođavao pozicioniranje i uklapanje
- `Promise.all` logika za paralelno dohvatanje podataka (sportovi, lige, timovi)
- Prijedlog strukture `useEffect` hookova i state menadžmenta
- Prijedlog Tailwind klasa za modalne dijaloge i badge elemente
- Logika za uslovno prikazivanje Navbar linkova i uklanjanje Dashboard-a
- Prijedlog `useSearchParams` za filtriranje liga klikom na ligu

### Testiranje
- Kostur unit testova (auth servis, statistika, facilityService) — tim prilagođavao mock podatke i logiku
- Kostur integracijskih testova za API rute — tim ih usklađivao sa stvarnim servisima i ulogama
- Konfiguracija testnog okruženja (Vitest, React Testing Library, jsdom, setupTests.js)
- Prijedlog pristupa testiranju bez podizanja stvarne baze (mocking Prisma klijenta)

---

## 4. Šta je prihvaćeno

Prihvaćeni su prijedlozi koji su bili usklađeni s arhitekturom i nisu uvodili nepotrebnu složenost:

- Prisma `korisnikId_timId` sintaksa za compound unique ključ (nakon što je AI-jev inicijalni prijedlog bio pogrešan)
- `Promise.all` struktura za paralelno dohvatanje podataka na frontendu
- Konfiguracija testnog okruženja (Vitest, React Testing Library, jsdom, polyfill za `localStorage`)
- Integracija SendGrid-a umjesto Gmail SMTP-a, u skladu s projektnom dokumentacijom
- Modalni dijalog za PDF greške umjesto browser `alert()`
- `calculateTimeoutMilliseconds` logika deadlinea (minimum od 24h i 2h prije termina)
- Kostur unit i integracijskih testova za auth servis, statistiku i rute (uz prilagodbu)
- Pristup mocking Prisma klijenta u testovima — bez podizanja stvarne baze
- Osnovne arhitekture predloženih servisa i kontrolera (tabela, facilityService, resultController)
- `uvoz i primjena canExportPDF()` za skrivanje PDF dugmeta neovlaštenim korisnicima

---

## 5. Šta je izmijenjeno

Većina AI prijedloga zahtijevala je značajno prilagođavanje prije integracije:

- Auth middleware (`authenticateToken`, `requireRole`) integrisan je ručno umjesto generičkih prijedloga
- API URL-ovi ispravljani su ručno zbog duplog `/api` prefiksa koji AI konzistentno nije primjećivao
- Axios import pattern prilagođen je postojećoj instanci u projektu umjesto predloženog `fetch`
- Validacione sheme prilagođene specifičnim regex pravilima i poslovnoj logici projekta
- Logika lokacije utakmica prebačena na postojeće relacije (`Utakmica.sportskiObjekat`) umjesto novih polja
- Trajanje JWT reset tokena smanjeno na 30 min umjesto predloženog 1 sat
- Rute ručno prilagođene konvencijama postojećeg `matchRoutes.js`
- `module.exports` ispravljen u pojedinim kontrolerima i servisima
- Razlog blokiranja korisnika prikazuje se tek klikom na dugme, ne uvijek vidljiv

---

## 6. Šta je odbačeno

| Odbačeni prijedlog | Razlog |
|---|---|
| Generičke auth provjere | Tim koristio vlastiti `authenticateToken` i `requireRole` middleware |
| Klijentsko filtriranje u `Raspored.jsx` i `Rezultati.jsx` | Zamijenijeno serverskim filterima |
| `fetch` API umjesto axios instance | Konzistentnost s ostatkom projekta |
| Kompleksni state management s context provajderima | Zadržan lokalni state — jednostavnije rješenje |
| Dodavanje kolona `lokacija`/`lokacijaOpis` u `Takmicenje` | Korištene postojeće relacije |
| Višekoračni striktni unos statistike | Mijenjao bi postojeći tok unosa |
| Generičke poruke grešaka | Tim koristio vlastiti `serviceError` standard |
| Testovi za nedovršene komponente (Dashboard placeholder) | Van scopea sprinta |
| Gmail SMTP konfiguracija | Zamijenjena SendGrid-om per projektna dokumentacija |
| Parcijalno ažuriranje entiteta putem `PATCH` | Tim odabrao slanje kompletnih podataka putem `PUT` |

---

## 7. Greške koje je AI napravio

| Greška | Kontekst | Kako je ispravljena |
|---|---|---|
| Pogrešna Prisma sintaksa (`where: { korisnikId, timId }`) umjesto compound ključa | `omiljeniTimService.js` | Ručno ispravljena na `korisnikId_timId` strukturu |
| Dupli `/api` prefiks u API URL-ovima | `tabelaApi.js`, više mjesta | Ručno ispravljen u svakom fajlu |
| Nedostajuća provjera `organizatorId` iz baze | `resultController.js` | Ručno dodana validacija uloge organizatora |
| Sinhronizovani Prisma pozivi umjesto `async/await` | `facilityService.js` testovi | Ručno ispravljeno |
| Predložena nepostojeća polja `lokacija`/`lokacijaOpis` na modelu `Takmicenje` | `UcesceUTakmicenju` modul | Uklonjena, regenerisan Prisma client |
| `canExportPDF()` definisana ali neimportovana u `Rezultati.jsx` | PDF izvoz | Ručno dodan import i primjena |
| `localStorage.clear is not a function` u JSDOM okruženju | Frontend testovi | Dodan polyfill u `setupTests.js` |
| Memory leak zbog brisanja komponente prije završetka async poziva | `Raspored.jsx` | Dodata `isActive` varijabla unutar `useEffect` |
| Neusklađeni migracijski fajlovi pri dodavanju novih atributa u bazu | Admin modul | Ručna sinhronizacija migracija |
| Tačan naziv axios instance u projektu nije bio poznat AI-ju | `tabelaApi.js` | Ručno prilagođen import |

---

## 8. Dijelovi sistema razvijani uz AI pomoć koji se moraju znati objasniti

AI je u svim slučajevima pružio konsultaciju ili kostur — **kompletnu implementaciju, integraciju i testiranje radio je tim**. Svaki član mora biti u stanju samostalno objasniti logiku svog dijela:

| Modul | Član tima | Šta treba objasniti |
|---|---|---|
| Forgot/reset password + promjena lozinke + SendGrid | Irma Topčagić / Maida Biber | SendGrid integracija, token trajanje, Prisma polja za reset, flow za zaboravljenu lozinku, kao i opcija promjene lozinke za prijavljenog korisnika iz profila |
| Admin upravljanje korisnicima | Irma Topčagić | Blokiranje s razlogom, promjena uloge, migracijski problemi |
| Praćenje omiljenih timova i notifikacije navijačima | Ilma Hindija / Maida Biber | Compound unique ključ, Prisma sintaksa, auth middleware integracija, grupno slanje notifikacija pratiocima tima, deduplikacija korisnika koji prate oba tima |
| `resultController.js`, bodovanje | Ilma Hindija | Ažuriranje `PlasmanNaTabeli`, provjera `organizatorId`, sabiranje bodova |
| Statistika za više sportova | Mehdi Zaimović | Validacija konzistentnosti, sport-specifični tipovi, kompatibilnost s testovima |
| `tabelaService.js`, leaderboard | Zeir Mašić | Agregacija gol-razlike, sortiranje, axios instanca |
| `facilityService.js` | Maida Biber | CRUD s vlasništvo provjerom (`vlasnikId`), kaskadno brisanje termina |
| Rezervacije + BullMQ/Redis | Zeir Mašić / Maida Biber | Queue inicijalizacija, worker logika, `calculateTimeoutMilliseconds`, flow za nepouzdane klijente |
| PDF izvoz rezultata i rasporeda | Irma Topčagić | `canExportPDF()` logika, vidljivost po ulozi, modalni dijalog za greške |
---

## 9. Zaključak

AI alati su ubrzali istraživanje mogućih pristupa, pomogli pri pisanju dijelova koda i olakšali identifikaciju potencijalnih problema. Međutim, konačne odluke nisu donosili AI alati — tim je zadržao kontrolu nad arhitekturom, poslovnim pravilima, sigurnosnim provjerama, dizajnom korisničkog sučelja i izborom tehnologija. Prihvaćena su samo rješenja koja su nakon provjere bila opravdana i usklađena sa zahtjevima projekta.
