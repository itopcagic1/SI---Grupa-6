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