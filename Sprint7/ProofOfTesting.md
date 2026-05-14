# Proof of Testing — Sprint 7

## Ukupni rezultati

| Nivo        | Tip testova                 | Broj testova | Rezultat        | Alat        |
|-------------|----------------------------|--------------|-----------------|-------------|
| Backend     | unit + integracijski | 290          | 0 failed        | Jest        |
| Fronted       | UI | 104          | 0 failed        | Vitest + RTL |
---

## Prikaz detalja korisnika za administratora

### UNIT TESTOVI — ADMIN CONTROLLER

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Dohvat detalja korisnika po ID-u | `getKorisnikDetalji` vraca detalje korisnika po ID-u | PASS |
| Unit | Odgovor sadrži razlog blokiranja i broj prekinutih rezervacija | `getKorisnikDetalji` vraca `razlogBlokiranja` i `brojPreksrenihRezervacija` | PASS |
| Unit | Nepostojeći korisnik vraća 404 | `getKorisnikDetalji` vraca 404 za nepostojeci ID | PASS |
| Unit | Osjetljivi podaci nisu izloženi u odgovoru | `getKorisnikDetalji` ne vraca osjetljive podatke | PASS |
| Unit | Greška baze podataka vraća 500 | `getKorisnikDetalji` obradjuje gresku iz baze i vraca 500 | PASS |
| Unit | Lista blokiranih korisnika filtrirana po statusu | `getBlokiraniKorisnici` vraca samo blokirane korisnike | PASS |
| Unit | Pretraga blokiranih po imenu ili email | `getBlokiraniKorisnici` podrzava pretragu po imenu ili emailu | PASS |
| Unit | Blokirani endpoint ne vraća osjetljive podatke | `getBlokiraniKorisnici` ne vraca osjetljive podatke | PASS |
| Unit | Greška baze na blokirani endpoint vraća 500 | `getBlokiraniKorisnici` obradjuje gresku iz baze i vraca 500 | PASS |
| Unit | Blokiranje korisnika sprema razlog blokiranja | `blokirajKorisnika` sprema razlog blokiranja | PASS |
| Unit | Odblokiravanje briše razlog blokiranja | `odblokiravanje` korisnika brise razlog blokiranja | PASS |
| Unit | Blokiranje bez razloga postavlja null | `blokirajKorisnika` bez razloga postavlja `razlogBlokiranja` na null | PASS |
| Unit | Promjena uloge ažurira ulogu i postavlja statusUloge na ODOBREN | `promijeniUlogu` mijenja ulogu i postavlja statusUloge na ODOBREN | PASS |
| Unit | Neispravna uloga vraća 400 | `promijeniUlogu` vraca 400 za neispravnu ulogu | PASS |
| Unit | Promjena uloge nepostojećeg korisnika vraća 404 | `promijeniUlogu` vraca 404 za nepostojeci korisnik | PASS |
| Unit | Promjena uloge administratora nije dozvoljena | `promijeniUlogu` ne dozvoljava promjenu uloge administratora | PASS |
| Unit | Greška baze na promjenu uloge vraća 500 | `promijeniUlogu` obradjuje gresku iz baze i vraca 500 | PASS |
| Unit | Promjena uloge ne vraća osjetljive podatke | `promijeniUlogu` ne vraca osjetljive podatke | PASS |
| Unit | Odgovor na listu korisnika ne sadrži lozinku/hash | `controller` ne vraca password/passwordHash u body response-a | PASS |
| Unit | Greška baze na dohvat korisnika vraća 500 | `controller` ispravno obradjuje gresku iz baze i vraca error response | PASS |
| Unit | Odobravanje posebne uloge ažurira status na ODOBREN | `odobravanje posebne uloge` vraca odgovarajuci response | PASS |
| Unit | Odbijanje posebne uloge sprema razlog i postavlja ODBIJEN | `odbijanje posebne uloge` vraca odgovarajuci response | PASS |
| Unit | Nevalidna akcija za obradu uloge vraća 400 | `nevalidni podaci za obradu uloge` vracaju validacijsku gresku iz controllera | PASS |

### INTEGRACIJSKI TESTOVI — ADMIN RUTE (EXPRESS + SUPERTEST)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Int. | Admin može dohvatiti listu korisnika | `admin moze dohvatiti listu korisnika` | PASS |
| Int. | Ne-admin korisnik ne može pristupiti listi korisnika (403) | `ne-admin korisnik ne moze dohvatiti listu korisnika` | PASS |
| Int. | Zahtjev bez tokena vraća 401 | `zahtjev bez tokena ne moze dohvatiti listu korisnika` | PASS |
| Int. | Admin može dohvatiti listu blokiranih korisnika | `admin moze dohvatiti listu blokiranih korisnika` | PASS |
| Int. | Odgovor za blokirane sadrži razlog i broj penala | `blokirani korisnici` odgovor sadrzi `razlogBlokiranja` i `brojPreksrenihRezervacija` | PASS |
| Int. | Ne-admin ne može dohvatiti blokirane korisnike (403) | `ne-admin ne moze dohvatiti listu blokiranih korisnika` | PASS |
| Int. | Bez tokena ne može dohvatiti blokirane korisnike (401) | `zahtjev bez tokena ne moze dohvatiti blokirane korisnike` | PASS |
| Int. | Blokirani endpoint ne vraća osjetljive podatke | `blokirani endpoint ne vraca osjetljive podatke` | PASS |
| Int. | Admin može dohvatiti detalje korisnika po ID-u | `admin moze dohvatiti detalje korisnika po ID-u` | PASS |
| Int. | Detalji sadrže razlogBlokiranja i brojPreksrenihRezervacija | `detalji korisnika sadrze razlogBlokiranja i brojPreksrenihRezervacija` | PASS |
| Int. | Dohvat nepostojećeg korisnika vraća 404 | `dohvat nepostojeceg korisnika vraca 404` | PASS |
| Int. | Detalji endpoint ne vraća osjetljive podatke | `detalji endpoint ne vraca osjetljive podatke` | PASS |
| Int. | Blokiranje sa razlogom vraća razlogBlokiranja u odgovoru | `blokiranje korisnika sa razlogom vraca razlogBlokiranja u odgovoru` | PASS |
| Int. | Odblokiravanje postavlja razlogBlokiranja na null | `odblokiravanje korisnika postavlja razlogBlokiranja na null` | PASS |
| Int. | Admin može promijeniti ulogu korisnika | `admin moze promijeniti ulogu korisnika` | PASS |
| Int. | Promjena uloge vraća 400 za neispravnu ulogu | `promjena uloge vraca 400 za neispravnu ulogu` | PASS |
| Int. | Ne-admin ne može promijeniti ulogu (403) | `ne-admin ne moze promijeniti ulogu korisnika` | PASS |
| Int. | Bez tokena ne može promijeniti ulogu (401) | `zahtjev bez tokena ne moze promijeniti ulogu` | PASS |
| Int. | Promjena uloge ne vraća osjetljive podatke | `promjena uloge ne vraca osjetljive podatke` | PASS |
| Int. | Admin može blokirati korisnika | `admin moze blokirati korisnika ako endpoint postoji` | PASS |
| Int. | Admin može obrisati korisnika | `admin moze obrisati korisnika ako endpoint postoji` | PASS |
| Int. | Rad nad nepostojećim korisnikom vraća 404 | `pokusaj rada nad nepostojecim korisnikom vraca odgovarajuci error response` | PASS |
| Int. | Nevalidni podaci vraćaju validacijsku grešku (400) | `pokusaj slanja nevalidnih podataka vraca validacijsku gresku` | PASS |

### UI TESTOVI - DETALJI O KORISNICIMA - ADMIN

| Nivo | Komponenta / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| UI | AdminKorisnici — Renderovanje | Prikazuje naslov "Admin Panel" i tabove navigacije | PASS |
| UI | AdminKorisnici — Zahtjevi | Prikazuje korisnike u PENDING tabu sa akcijama Odobri/Odbij | PASS |
| UI | AdminKorisnici — Validacija | Prikazuje grešku ako se odbije zahtjev bez unesenog razloga | PASS |
| UI | AdminKorisnici — Blokirani | Prikazuje listu blokiranih korisnika i dugmetom za odblokiravanje | PASS |
| UI | AdminKorisnici — Feedback | Prikazuje success poruku nakon uspješnog odobravanja uloge | PASS |
| UI | AdminKorisnici — Navigacija | Pravilno prebacuje između tabova i osvježava podatke | PASS |
| UI | KorisnikDetalji — Podaci | Prikazuje ime, email, ulogu i status naloga korisnika | PASS |
| UI | KorisnikDetalji — Akcije | Prikazuje sekciju za obradu zahtjeva samo za PENDING korisnike | PASS |
| UI | KorisnikDetalji — Blokiranje | Otvara textarea za razlog blokiranja i validira unos | PASS |
| UI | KorisnikDetalji — Brisanje | Prikazuje potvrdni dijalog prije pozivanja API-ja za brisanje | PASS |
| UI | KorisnikDetalji — Uloge | Onemogućava "Sačuvaj" ako uloga nije promijenjena u dropdownu | PASS |
| UI | KorisnikDetalji — Sigurnost | Sakriva admin akcije (blokiraj/obriši) ako je korisnik Administrator | PASS |

---

## Promjena zaboravljene lozinke putem maila

### UNIT TESTOVI — EMAILSERVICE

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Email se šalje sa ispravnim parametrima (primatelj, subject) | `posaljiResetEmail` poziva `sgMail.send` sa ispravnim parametrima | PASS |
| Unit | HTML tijelo emaila sadrži reset link | `posaljiResetEmail` sadrzi reset link u html-u | PASS |
| Unit | Email se šalje na ispravnu adresu primatelja | `posaljiResetEmail` salje na ispravan email | PASS |
| Unit | Email se šalje sa ispravne adrese pošiljatelja | `posaljiResetEmail` salje od ispravne adrese | PASS |
| Unit | Greška SendGrid servisa se propagira kao exception | `posaljiResetEmail` propagira gresku ako `sgMail.send` baci exception | PASS |

---

## Pregled prijava za trenera

### UNIT TESTOVI — APPLICATION SERVICE

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Trener vidi samo svoje prijave | `trener vidi samo svoje prijave` | PASS |
| Unit | Drugi trener ne vidi tuđe prijave | `drugi trener ne vidi tudje prijave` | PASS |
| Unit | Prazna lista se vraća bez greške | `prazna lista se vraca bez greske` | PASS |
| Unit | Status prijave se mapira ispravno | `status se mapira ispravno (PENDING, ODOBRENO, ODBIJENO)` | PASS |
| Unit | Fallback lokacija koristi SportskiObjekat adresu | `fallback lokacija koristi sportski objekat adresu` | PASS |
| Unit | Fallback koristi Utakmica.lokacijaOpis ako nema objekta | `fallback koristi utakmica.lokacijaOpis` | PASS |
| Unit | Vraća "Lokacija nije definisana" ako nema podataka | `fallback vraca "Lokacija nije definisana"` | PASS |

### INTEGRACIJSKI TESTOVI — APPLICATION RUTE (EXPRESS + SUPERTEST)

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Int. | TRENER može dohvatiti svoje prijave | `TRENER moze dohvatiti svoje prijave` | PASS |
| Int. | Prazna lista vraća uspješan response | `prazna lista vraca uspjesan response` | PASS |
| Int. | Zahtjev bez tokena vraća 401 | `korisnik bez tokena ne moze pristupiti endpointu` | PASS |
| Int. | Korisnik koji nije TRENER ne može pristupiti endpointu | `korisnik koji nije TRENER ne moze pristupiti endpointu` | PASS |

### UI TESTOVI — MOJE PRIJAVE

| Nivo | Komponenta / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| UI | MojePrijave — Renderovanje | Prikazuje listu prijava trenera | PASS |
| UI | MojePrijave — Podaci | Prikazuje tim, takmičenje, sport i lokaciju | PASS |
| UI | MojePrijave — Status | Prikazuje status badge (PENDING / ODOBRENO / ODBIJENO) | PASS |
| UI | MojePrijave — Empty state | Prikazuje poruku "Jos nemate prijavljenih takmicenja." | PASS |
| UI | MojePrijave — Error state | Prikazuje grešku ako API vrati error | PASS |
| UI | MojePrijave — Refresh | Refresh dugme ponovo učitava podatke | PASS |


## Početna stranica za goste (Homepage)

### INTEGRACIJSKI TESTOVI 

| Nivo          | Komponenta / Opis                  | Test koji pokriva                                                  | Rezultat |
|----------------|------------------------------------|--------------------------------------------------------------------|-----------|
| Int. | Homepage Routes — Dohvat podataka | treba vratiti podatke za homepage uspješno bez tokena (Javni API) | PASS      |
| Int. | Homepage Routes — Greška servisa  | treba vratiti 500 error kada servis baci izuzetak                 | PASS      |

### UI TESTOVI

| Nivo | Komponenta / Opis           | Test koji pokriva                                      | Rezultat |
|-------|-----------------------------|--------------------------------------------------------|-----------|
| UI    | Homepage — Renderovanje    | renders correctly and fetches data                    | PASS      |
| UI    | Homepage — Prazno stanje   | displays empty state messages when no data is returned | PASS      |



## Profil korisnika i promjena lozinke

### UNIT TESTOVI — AUTH SERVICE 

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Dohvat profila bez prikazivanja lozinke | `getUserProfile` treba vratiti korisnika bez lozinke (bez polja `lozinkaHash`) | PASS |
| Unit | Validacija podudaranja lozinki prilikom promjene lozinke| `changePassword` baca Error ako se nova lozinka i potvrda ne poklapaju | PASS |

### INTEGRACIJSKI TESTOVI — AUTH RUTE 

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Int. | Uspješan dohvat profila | `GET /api/auth/profile` vraća status 200 i objekt korisnika | PASS |
| Int. | Sigurnost i autorizacija | `GET /api/auth/profile` vraća 401 Unauthorized ako token nije poslan | PASS |

### UI TESTOVI 
| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| UI | Prikaz osnovnih informacija | Treba prikazati puno ime korisnika nakon uspješnog učitavanja profila | PASS |
| UI | Validacija unosa lozinke | Prikazuje poruku "Lozinke se ne podudaraju!" ako polja nisu ista | PASS |
---

## Generisanje rasporeda takmičenja

### UNIT TESTOVI — MATCH SERVICE 

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Unit | Uspješno generisanje rasporeda | `generisiRaspored` uspješno kreira utakmice za 2 tima | PASS |
| Unit | Provjera autorizacije (Admin) | Administrator može generisati raspored čak i ako nije direktni organizator | PASS |
| Unit | Minimalni broj timova | Baca grešku ako ima manje od 2 prijavljena tima za generisanje | PASS |
| Unit | Podrazumijevana lokacija | Koristi "Stadion Grbavica" ako lokacija nije eksplicitno proslijeđena | PASS |

### INTEGRACIJSKI TESTOVI — MATCH RUTE 

| Nivo | AC / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| Int. | Uspješan API poziv | `POST /api/matches/generate-schedule` vraća 201 i broj kreiranih utakmica | PASS |
| Int. | Validacija datuma i vremena | Vraća 400 za nevalidne formate datuma ili vremena u prošlosti | PASS |
| Int. | Autorizacija rute | Vraća 401 za zahtjev bez validnog JWT tokena | PASS |

### UI TESTOVI — GENERATE SCHEDULE

| Nivo | Komponenta / Opis | Test koji pokriva | Rezultat |
| :--- | :--- | :--- | :--- |
| UI | Renderovanje forme | Prikazuje dropdown za takmičenje, polja za datum, vrijeme i lokaciju | PASS |
| UI | Dinamičko učitavanje liga | Uspješno učitava i prikazuje ligu (npr. "Premijer liga") u dropdown-u | PASS |
| UI | Prikaz rezultata | Prikazuje poruku o uspjehu i listu generisanih timova nakon obrade | PASS |
| UI | Zaštita stranice | Automatski preusmjerava korisnike koji nisu organizatori na početnu stranicu | PASS |
