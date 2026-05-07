# Sprint 5 - Sprint Review Summary

**Tema diskusije:** Pregled funkcionalnosti registracije i prijave
**Prisutni:** Članovi tima, Asistent

Tokom Sprint 5 Review sastanka prezentovali smo trenutno stanje sistema za autentifikaciju. Asistent nam je dao konkretne povratne informacije i ukazao na stvari koje nisu dobre i koje se moraju izmijeniti u narednom periodu:

## Šta treba izmijeniti / Šta nije bilo dobro:

### 1. Potvrda lozinke pri registraciji (Password Confirmation)
- **Problem:** Trenutno korisnici prilikom registracije unose lozinku samo jednom.
- **Rješenje:** Moramo dodati novo polje za potvrdu lozinke kako bismo smanjili mogućnost da korisnik pogriješi pri kucanju. Forma za registraciju mora zahtijevati unos lozinke dva puta.

### 2. Način prikaza grešaka (Error Handling/UX)
- **Problem:** Greške koje se javljaju prilikom registracije i prijave se trenutno prikazuju kroz `alert` iskačuće prozore, što narušava korisničko iskustvo (UX).
- **Rješenje:** `Alert` poruke se moraju ukloniti. Umjesto toga, greške se trebaju ispisivati inline, odnosno direktno na formi uz samo polje koje je neispravno (npr. crveni tekst ispod polja za lozinku ili email).

### 3. Ograničenje broja pokušaja (Rate Limiting)
- **Problem:** Asistent je istakao da naše trenutno ograničenje nije dobro konfigurisano. Postavili smo limit od samo 10 pokušaja prijave ili registracije unutar 15 minuta.
- **Rješenje:** Potrebno je revidirati i izmijeniti logiku za ograničenje pokušaja (rate limiting) jer je postojeća konfiguracija neadekvatna.
