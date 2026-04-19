# Initial Release Plan

## Planirani inkrementi / release cjeline

Razvoj sistema *Sistem za upravljanje sportskim terminima i ligama* organizovan je kroz Scrum metodologiju. Release plan je definisan na osnovu prioriteta iz Product Backlog-a, User Stories i Risk Register-a.

Plan uključuje četiri ključna release-a:
- Release 1: nakon Sprinta 6  
- Release 2: nakon Sprinta 8  
- Release 3: nakon Sprinta 10  
- Release 4: nakon Sprinta 11  

Ovakva struktura omogućava postepeno uvođenje funkcionalnosti – od osnovne platforme, preko upravljanja takmičenjima i resursima, do naprednih funkcionalnosti i finalizacije sistema.

---

## RELEASE 1 – CORE PLATFORM (MVP)

### Cilj inkrementa
Implementirati osnovnu funkcionalnost sistema koja omogućava autentifikaciju korisnika i upravljanje ključnim entitetima (korisnici, timovi, lige i sportovi).

### Glavne funkcionalnosti
- PB-20: Registracija korisnika  
- PB-21: Prijava i odjava  
- PB-22: Sistem permisija (RBAC)  
- PB-23: Sigurnosni protokoli  
- PB-24: Upravljanje ligama  
- PB-25: Upravljanje timovima  
- PB-26: Prijava ekipa  

### Zavisnosti
- PB-10: Domain model  
- PB-12: Architecture overview  
- PB-17: Dizajn baze podataka  
- PB-15, PB-16: Tehnička infrastruktura  

### Glavni rizici
- R-01: Neispravna autentifikacija  
- R-02: Sigurnosni propusti  
- R-19: RBAC propust  
- R-23: Session leak  

### Okvirni sprintovi
- Sprint 5: autentifikacija i permisije  
- Sprint 6: upravljanje ligama i timovima  

### Vrijednost
Ovaj release predstavlja minimalno funkcionalan proizvod koji omogućava korisnicima pristup sistemu i osnovno upravljanje sportskim strukturama. Postavlja temelj za sve naredne funkcionalnosti sistema.

---

## RELEASE 2 – COMPETITION MANAGEMENT SYSTEM

### Cilj inkrementa
Omogućiti kompletno upravljanje sportskim takmičenjima kroz raspored utakmica, unos rezultata i automatsko generisanje tabela.

### Glavne funkcionalnosti
- PB-27: Kreiranje rasporeda utakmica  
- PB-28: Pregled rasporeda  
- PB-29: Unos rezultata  
- PB-30: Automatsko generisanje tabela  

### Zavisnosti
- Postojeći timovi i lige (Release 1)  
- Validan model takmičenja  

### Glavni rizici
- R-03: Nekonzistentni podaci u tabeli  
- R-04: Konflikti u rasporedu  
- R-17: Neusklađenost sa zahtjevima  
- R-37: Nedostatak testnih podataka  

### Okvirni sprintovi
- Sprint 7: raspored i pregled  
- Sprint 8: rezultati i tabela  

### Vrijednost
Sistem postaje operativna platforma za upravljanje ligama i turnirima. Korisnici mogu organizovati takmičenja, pratiti rezultate i analizirati performanse timova.

---

## RELEASE 3 – RESERVATION & RESOURCE MANAGEMENT

### Cilj inkrementa
Omogućiti upravljanje sportskim objektima i rezervaciju termina, čime sistem dobija praktičnu i operativnu vrijednost.

### Glavne funkcionalnosti
- PB-31: Upravljanje sportskim objektima  
- PB-32: Rezervacija termina  
- PB-33: Potvrda/odbijanje rezervacija  
- PB-34: Validacija podataka  
- PB-35: Sistem obavještenja  

### Zavisnosti
- Autentifikacija i korisnici (Release 1)  
- Sistem timova i liga (Release 2)  

### Glavni rizici
- R-05: Duple rezervacije  
- R-18: Kompleksna logika rezervacija  
- R-26: Problemi sa eksternim servisima  
- R-10: Kašnjenje u razvoju  

### Okvirni sprintovi
- Sprint 9: objekti i rezervacije  
- Sprint 10: notifikacije i validacija  

### Vrijednost 
Sistem omogućava upravljanje realnim sportskim resursima (tereni i termini), čime postaje alat za svakodnevnu upotrebu i potencijalnu komercijalizaciju.

---

## RELEASE 4 – ADVANCED FEATURES & FINALIZATION

### Cilj inkrementa
Dodati napredne funkcionalnosti i završne komponente sistema koje poboljšavaju korisničko iskustvo i omogućavaju analitiku.

### Glavne funkcionalnosti
- PB-36: Responzivni UI  
- PB-37: PDF izvoz podataka  
- PB-38: Testiranje sistema  

*(Napomena: AI funkcionalnosti su planirane kao opcionalno proširenje sistema i zavise od dostupnosti podataka i stabilnosti sistema.)*

### Zavisnosti
- Stabilan sistem iz prethodnih release-ova  
- Dostupni historijski podaci  

### Glavni rizici
- R-07: Netačne AI predikcije  
- R-08: Nedostatak podataka za AI  
- R-36: Greške u PDF-u  
- R-33: Performanse sistema  

### Okvirni sprintovi
- Sprint 11: napredne funkcionalnosti i finalizacija  

### Vrijednost release-a
Finalni release unapređuje sistem kroz bolje korisničko iskustvo, izvještavanje i stabilnost, čime se dobija kompletna verzija spremna za produkcijsko korištenje.

---

## ZAKLJUČAK

Release plan je definisan tako da prati prirodan razvoj sistema kroz četiri faze:

- Faza 1: osnovna infrastruktura i autentifikacija (MVP)
- Faza 2: upravljanje takmičenjima i poslovna logika
- Faza 3: upravljanje resursima i rezervacijama
- Faza 4: napredne funkcionalnosti i finalizacija

Svaki release predstavlja samostalno upotrebljiv i vrijednosno značajan inkrement, u skladu sa Scrum principima.
