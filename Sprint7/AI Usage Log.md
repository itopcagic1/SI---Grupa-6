# AI Usage Log - Sprint 7

## Zapis 1

**Datum:** 09.05.2026.

**Sprint broj:** 7

**Alat koji je korišten:** Claude Sonnet 4.6

**Svrha korištenja:**
Implementacija funkcionalnosti za reset zaboravljene lozinke putem emaila.

**Kratak opis zadatka ili upita:**
Implementacija kompletnog forgot/reset password flow-a na backendu, uključujući integraciju email servisa za slanje reset linka korisniku.

**Šta je AI predložio ili generisao:**
- Kompletnu backend implementaciju: rute, controller funkcije (`forgotPassword`, `resetPassword`), servisne funkcije u `authService.js`, te `emailService.js` za slanje emailova
- Ažuriranje Prisma sheme s poljima `resetToken` i `resetTokenExpires` na modelu `Korisnik`
- Konfiguraciju Nodemailer-a za Gmail SMTP, te naknadno migraciju na SendGrid
- Frontend komponente `ForgotPassword.jsx` i `ResetPassword.jsx` s validacijom forme
- API pozive `forgotPassword` i `resetPassword` u `authApi.js`
- Registraciju novih ruta u `App.jsx` i ažuriranje `Login.jsx`
- Upute za generisanje Gmail App Password i postavljanje SendGrid sender identiteta

**Šta je tim prihvatio:**
- Cjelokupna struktura implementacije (controller → service → emailService)
- Prisma migracija s novim poljima za reset token
- Integracija SendGrid-a umjesto Gmail SMTP-a, u skladu s prethodno definisanom projektnom dokumentacijom

**Šta je tim izmijenio:**
- Naziv pošiljaoca emaila promijenjen u `"SportManager"` umjesto defaultnog
- Trajanje tokena smanjeno na 30 minuta umjesto 1 sat, uz usklađivanje poruke u emailu
- Slučajno dupliran `require('crypto')` u `authService.js` uočen i uklonjen

**Šta je tim odbacio:**
- Inicijalna Gmail SMTP konfiguracija zamijenjena SendGrid-om zbog usklađenosti s prethodno definisanom projektnom dokumentacijom

**Rizici, problemi ili greške koje su uočene:**
- Greška zbog nepodešenih `.env` varijabli za email servis

**Ko je koristio alat:**
Irma Topčagić

---

## Zapis 2

**Datum:** 10.5.2026.

**Sprint broj:** 7

**Alat koji je korišten:** Claude Sonnet 4.6

**Svrha korištenja:**
Implementacija funkcionalnosti za upravljanje korisnicima od strane administratora — pregled detalja korisnika, blokiranje s razlogom, promjena uloge i prikaz blokiranih korisnika s penalima.

**Kratak opis zadatka ili upita:**
Implementacija admin stranice za detalje korisnika (`/admin/korisnici/:id`), dodavanje taba "Blokirani korisnici" u admin panel, dodavanje razloga blokiranja (novo polje u bazi), prikaz broja prekinutih rezervacija, te pisanje unit i integracionih testova za sve nove funkcionalnosti.

**Šta je AI predložio ili generisao:**
- Novu stranicu `AdminKorisnikDetalji.jsx` s prikazom detalja korisnika, admin akcijama (promjena uloge, blokiranje, brisanje)
- Izmjene u `AdminKorisnici.jsx` — uklanjanje modala, navigacija na detalji stranicu, novi tab "Blokirani korisnici"
- Backend: nove funkcije `getKorisnikDetalji`, `getBlokiraniKorisnici`, `promijeniUlogu` u `adminController.js`, nove rute u `adminRoutes.js`
- Dodavanje novog polja u bazi `razlogBlokiranja`

**Šta je tim prihvatio:**
Svi generirani fajlovi su prihvaćeni.

**Šta je tim izmijenio:**
- Ispravljen `module.exports` u `authController.js` i `authService.js` 
- Razlog blokiranja prikazuje tek nakon klika na dugme "Blokiraj", a ne uvijek vidljiv

**Šta je tim odbacio:**
- Odbacivani cijeli generisani fajlovi i samo vršena zamjena potrebnih dijelova.

**Rizici, problemi ili greške koje su uočene:**
- Javio se problem s bazom prilikom dodavanja novih atributa, zbog neusklađenosti migracijskih fajlova.

**Ko je koristio alat:**
Irma Topčagić

---

## Zapis 3

**Datum:** 12.05.2026.

**Sprint broj:** 7

**Alat koji je korišten:** Gemini 3 Flash

**Svrha korištenja:**
Razvoj javne početne stranice (Homepage) i reorganizacija navigacije (uklanjanje Dashboarda).

**Kratak opis zadatka ili upita:**
Kreiranje modernog UI-a za "sport.ba" početnu stranicu, te uklanjanje suvišne Dashboard stranice uz prebacivanje svih funkcionalnosti direktno u Navbar i ostale dijelove aplikacije. Također, dodavanje direktnog filtriranja rasporeda klikom na ligu.

**Šta je AI predložio ili generisao:**
- Strukturu i dizajn Homepage-a s fokusom na moderne estetike
- Logiku za uslovno prikazivanje Navbar linkova na osnovu korisničkih uloga (npr. "Generiši raspored" samo za admine/organizatore)
- Redirect logiku za uklanjanje Dashboard-a (preusmjeravanje sa `/dashboard` na `/`)
- Implementaciju `useSearchParams` u `Raspored.jsx` za automatsko filtriranje liga
- Stilsko usklađivanje `GenerateSchedule.jsx` sa ostatkom aplikacije

**Šta je tim prihvatio:**
- Većinu UI dizajna i logiku za navigaciju
- Odluku o potpunom uklanjanju Dashboard-a radi čišćeg korisničkog iskustva
- Direktno filtriranje liga kao UX poboljšanje

**Šta je tim izmijenio:**
- AI je pružio pomoć pri osnovnoj strukturi i logici preusmjeravanja, dok je ostatak implementacije i finog podešavanja dizajna urađen od strane autora

**Šta je tim odbacio:**
- Određene vizuelne prijedloge koji se nisu uklapali u postojeći brending

**Rizici, problemi ili greške koje su uočene:**
- Potreba za ažuriranjem svih postojećih testova koji su očekivali navigaciju na `/dashboard`

**Ko je koristio alat:**
Ilma Hindija

---

## Zapis 4

**Datum:** 13.05.2026.

**Sprint broj:** 7

**Alat koji je korišten:** ChatGPT-4o

**Svrha korištenja:**
Implementacija stranica za prikaz rasporeda utakmica i rezultata uz kompleksno filtriranje.

**Kratak opis zadatka ili upita:**
Razvoj `Raspored.jsx` i `Rezultati.jsx` komponenti. Dohvatanje podataka sa backenda, te implementacija višestrukih padajućih menija za filtere (po sportu, ligi, timu, datumu).

**Šta je AI predložio ili generisao:**
- Logiku za paralelno dohvatanje podataka (sportovi, lige, timovi) pomoću `Promise.all` radi znatno bržeg inicijalnog učitavanja stranice.
- Pomoćne funkcije za bezbjedno formatiranje datuma, vremena i rezultata (tzv. *null-checking* kako aplikacija ne bi pucala na "undefined" vrijednostima).
- Pomoć pri optimizaciji `useEffect` hookova prilikom izmjene filtera.

**Šta je tim prihvatio:**
- Predloženu asinhronu `Promise.all` strukturu i sve pomoćne funkcije za čisto renderovanje podataka.

**Šta je tim izmijenio:**
- UI komponente su prepravljene "od nule" pomoću dogovorenih Tailwind klasa kako bi se vizuelno stopile sa premium izgledom aplikacije, umjesto generičkog izgleda koji je alat predložio.

**Šta je tim odbacio:**
- Prijedlog AI-a da se svo filtriranje (pretraga i filteri) radi na frontendu (klijentskoj strani).

**Rizici, problemi ili greške koje su uočene:**
- Brisanje komponenti prije nego što se asinhroni pozivi završe je uzrokovalo "memory leak" upozorenja u Reactu, što je naknadno riješeno dodavanjem `isActive` varijable unutar `useEffect` kuka.

**Ko je koristio alat:**
Semir Jamaković

---

## Zapis 5

**Datum:** 14.05.2026.

**Sprint broj:** 7

**Alat koji je korišten:** OpenAI Codex / ChatGPT

**Svrha korištenja:**
Implementacija funkcionalnosti “Moje prijave” (PB-26) za pregled prijava trenera na takmičenja.

**Kratak opis zadatka ili upita:**
Implementacija backend endpointa `GET /api/applications/my` i frontend stranice “Moje prijave”, uključujući prikaz statusa prijave, lokacije, empty state-a i testova za autorizaciju i filtriranje podataka po treneru.

**Šta je AI predložio ili generisao:**
- Backend implementaciju endpointa za dohvat prijava trenutno prijavljenog trenera
- Service logiku za filtriranje prijava po korisniku i obradu fallback lokacije
- Frontend stranicu “Moje prijave”
- Status badge prikaz za `PENDING`, `ODOBRENO` i `ODBIJENO`
- Loading, error i empty state prikaz
- Unit, integration i frontend testove za PB-26
- Prisma upite i povezivanje postojećih relacija između `UcesceUTakmicenju`, `Takmicenje`, `Utakmica` i `SportskiObjekat`

**Šta je tim prihvatio:**
- Strukturu endpointa i frontend prikaza
- Predložene test scenarije
- Korištenje postojeće tabele `UcesceUTakmicenju` za prijave

**Šta je tim izmijenio:**
- Uklonjena su dodatna Prisma polja `lokacija` i `lokacijaOpis` iz modela `Takmicenje`
- Logika za lokaciju prebačena je na postojeće relacije preko `Utakmica.sportskiObjekat` i `Utakmica.lokacijaOpis`
- Ispravljena test očekivanja nakon promjene logike lokacije

**Šta je tim odbacio:**
- Dodavanje novih kolona u tabelu `Takmicenje`, jer je ustanovljeno da projekat već koristi postojeće relacije za lokaciju utakmica i objekata

**Rizici, problemi ili greške koje su uočene:**
- Došlo je do greške zbog neusklađenosti Prisma sheme i postojeće baze (`Takmicenje.lokacija does not exist`)
- Problem je riješen uklanjanjem nepotrebnih kolona iz Prisma sheme i regenerisanjem Prisma clienta

**Ko je koristio alat:**
Mehdi Zaimović

---
