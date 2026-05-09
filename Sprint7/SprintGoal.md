# Sprint Goal — Sprint 7

## Ciljevi sprinta

Cilj sprinta 7 je omogućiti osnovne funkcionalnosti platforme za upravljanje takmičenjima — od prijave tima i pregleda ekipa, preko generisanja rasporeda utakmica, do prikaza i upravljanja korisničkim profilima i lozinkama.

---

## Ključne stavke koje tim želi završiti

- Prijava tima na takmičenje 
- Pregled prijavljenih ekipa s defaultnim lokacijama
- Kreiranje utakmica i automatsko generisanje rasporeda 
- Guest funkcionalnosti
- Prikaz i filtriranje rasporeda i rezultata
- Prikaz korisničkog profila s vlastitim podacima
- Prikaz detalja korisnika za administratora 
- Reset zaboravljene lozinke putem e-maila

---

## Rizici i zavisnosti

### Rizici

- Algoritam za nasumično dodjeljivanje protivnika može proizvesti neuravnotežen raspored 
- Upravljanje objektima još nije implementirano — defaultne lokacije su privremeno rješenje koje može ograničiti testiranje
- Zaštita i sigurnost podataka pri prikazu korisničkih detalja za administratora zahtijeva dodatnu pažnju kako bi se spriječio neovlašteni pristup
- Reset lozinke putem maila ovisi o ispravnoj konfiguraciji mail servera

### Zavisnosti

- Zadaci 6 i 7 (profil i promjena šifre) međusobno su vezani 
- Zadatak 2 (pregled ekipa) ovisi o završetku zadatka 1 (prijava tima)
- Zadatak 5 (prikaz rasporeda) ovisi o zadatku 3 (kreiranje utakmica i generisanje rasporeda)
- Upravljanje objektima planira se u Sprintu 8 — lokacije su za sada hardkodirane