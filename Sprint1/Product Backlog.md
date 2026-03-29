# Product Backlog – SportManager

---

## Osnovna autentifikacija i korisnici

- **PB-01 – Registracija korisnika**
  - Korisnik može kreirati nalog unosom osnovnih podataka (ime, email, lozinka).
  - Tip: Feature
  - Prioritet: Visok

---

- **PB-02 – Prijava i odjava korisnika**
  - Autentifikacija korisnika putem emaila i lozinke, te odjava sa sistema.
  - Tip: Feature
  - Prioritet: Visok

---

- **PB-03 – Upravljanje ulogama**
  - Sistem podržava uloge (gledalac, organizator, administrator, vlasnik objekta, igrač itd.), pri čemu svaka uloga ima različite dozvole i pristup funkcionalnostima.
  - Tip: Feature
  - Prioritet: Visok
  - Napomena: Administrator se kreira u bazi pri inicijalnom pokretanju sistema.

---

- **PB-04 – Sistem permisija i kontrole pristupa**
  - Tehnička implementacija dozvola za svaku ulogu – korisnik može pristupiti samo onim funkcionalnostima koje njegova uloga dozvoljava.
  - Tip: Technical Task
  - Prioritet: Visok
  - Napomena: Osnova za sve ostale funkcionalnosti sistema.

---

- **PB-05 – Administratorski panel za upravljanje korisnicima**
  - Administrator može pregledati sve korisnike, odobriti ili odbiti zahtjeve, te deaktivirati naloge.
  - Tip: Feature
  - Prioritet: Visok

---

- **PB-06 – Korisnički profil**
  - Korisnik može pregledati i uređivati svoje lične podatke.
  - Tip: Feature
  - Prioritet: Srednji

---

- **PB-07 – Oporavak lozinke**
  - Korisnik može resetovati lozinku putem email linka u slučaju da je zaboravi.
  - Tip: Feature
  - Prioritet: Srednji
  - Napomena: Nije kritično za MVP, ali poboljšava korisničko iskustvo.

---

## Takmičarska logika

- **PB-08 – Upravljanje kategorijama sportova**
  - Administrator definiše i uređuje kategorije sportova dostupnih u sistemu (npr. fudbal, košarka, odbojka).
  - Tip: Feature
  - Prioritet: Visok

---

- **PB-09 – Kreiranje lige**
  - Organizator može kreirati novu ligu i definisati njene osnovne parametre (naziv, sport, sezona).
  - Tip: Feature
  - Prioritet: Visok

---

- **PB-10 – Upravljanje timovima**
  - Organizator može dodavati, uređivati i brisati timove unutar lige.
  - Tip: Feature
  - Prioritet: Visok

---

- **PB-11 – Registracija igrača u tim**
  - Igrači se mogu pridružiti timu ili biti dodani od strane organizatora ili kapetena ekipe.
  - Tip: Feature
  - Prioritet: Visok

---

- **PB-12 – Kreiranje rasporeda utakmica**
  - Organizator kreira raspored utakmica s datumom, vremenom, lokacijom i parovima ekipa.
  - Tip: Feature
  - Prioritet: Visok

---

- **PB-13 – Pregled rasporeda**
  - Svi korisnici mogu pregledati raspored predstojećih utakmica s mogućnošću filtriranja po sportu, ligi, timu ili datumu.
  - Tip: Feature
  - Prioritet: Visok

---

- **PB-14 – Unos rezultata utakmica**
  - Organizator unosi rezultate odigranih utakmica (broj golova/poena za svaki tim).
  - Tip: Feature
  - Prioritet: Visok

---

- **PB-15 – Automatsko generisanje tabele**
  - Nakon unosa rezultata sistem automatski ažurira tabelu, bodove i gol-razliku.
  - Tip: Feature
  - Prioritet: Visok
  - Napomena: Potrebno definisati pravila bodovanja za svaku sportsku kategoriju.
---

- **PB-16 – Pregled historije rezultata**
  - Korisnici mogu pregledati historiju svih odigranih utakmica i rezultata tokom sezone.
  - Tip: Feature
  - Prioritet: Srednji

---

- **PB-17 – Osnovna statistika tima**
  - Prikaz osnovnih statistika tima: broj utakmica, pobjeda, poraza, remija i golova.
  - Tip: Feature
  - Prioritet: Srednji
  - Napomena: Napredna statistika igrača nije u MVP-u.

---

## Upravljanje terminima

- **PB-18 – Upravljanje sportskim objektima**
  - Vlasnici objekata mogu unositi i ažurirati dostupnost svojih terena, dvorana i sala u sistemu.
  - Tip: Feature
  - Prioritet: Visok
  - Napomena: Potreban je unos vlasnika o zauzetosti ukoliko rezervacija nije izvršena putem sistema.

---

- **PB-19 – Pregled slobodnih termina**
  - Svi korisnici mogu pregledati slobodne i zauzete termine sportskih objekata bez direktnog kontakta s vlasnikom.
  - Tip: Feature
  - Prioritet: Srednji

---

- **PB-20 – Rezervacija termina**
  - Može se poslati zahtjev za rezervaciju slobodnog termina, a vlasnik objekta ga odobrava ili odbija.
  - Tip: Feature
  - Prioritet: Srednji
  - Napomena: Nakon odobrenja, termin se automatski označava kao zauzet.

---

## Tehnički zadaci

- **PB-21 – Dizajn baze podataka**
  - Definisanje ER dijagrama i relacija između entiteta sistema.
  - Tip: Technical Task
  - Prioritet: Visok
  - Napomena: Mora biti urađeno prije početka implementacije.

---

- **PB-22 – Validacija podataka**
  - Sprečavanje unosa netačnih ili nepotpunih podataka (npr. pogrešan format datuma, negativan rezultat).
  - Tip: Technical Task
  - Prioritet: Visok

---

- **PB-23 – Sigurnosni protokoli**
  - Zaštita ruta, enkripcija lozinki i zaštita privatnih podataka korisnika.
  - Tip: Technical Task
  - Prioritet: Visok

---

- **PB-24 – Sistem obavještenja**
  - Automatsko slanje obavještenja korisnicima o promjenama rasporeda, otkazivanjima i novim rezultatima.
  - Tip: Feature
  - Prioritet: Srednji
  - Napomena: Email ili in-app notifikacije.

---

## Završni procesi

- **PB-25 – Testiranje sistema**
  - Pisanje i izvršavanje unit i integracionih testova za ključne funkcionalnosti sistema.
  - Tip: Technical Task
  - Prioritet: Srednji

---

- **PB-26 – Dokumentacija sistema**
  - Izrada tehničke i korisničke dokumentacije za sve ključne funkcionalnosti platforme.
  - Tip: Documentation
  - Prioritet: Nizak

---



