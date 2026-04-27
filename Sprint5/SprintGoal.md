# Sprint Goal - Sprint 5

## Ciljevi sprinta

Glavni cilj ovog sprinta je uspostavljanje fizičke strukture baze podataka i implementacija osnovnog sistema autentifikacije (User Management), uz striktno poštovanje mjerljivih kriterija iz Definition of Done (DoD) dokumenta.

---

## Ključne stavke koje tim želi završiti

- Infrastruktura baze podataka: Izvršavanje svih migracija i kreiranje relacija na nivou fizičke baze podataka
- Autentifikacija korisnika: Potpuna implementacija registracije, prijave i odjave (Login/Logout) 
- QA & Validacija: Postizanje definisane pokrivenosti (code coverage) za module autentifikacije, uključujući unit i integracijske testove
- Tehnička dokumentacija: Izrada baze za API dokumentaciju i evidentiranje svih odluka u Decision Log 

---


## Rizici i zavisnosti

### Rizici

- Vremenski okvir za testiranje: Implementacija validacijskih testova može trajati duže od planiranog razvoja samih funkcionalnost


### Zavisnosti

- Baza podataka: Razvoj registracije i prijave direktno zavisi od uspješnog kreiranja tabela i migracija. Ovo je "blocker" za ostale razvojne zadatke

- Validacija DoD-a: Svi zadaci u ovom sprintu zavise od ispravne primjene kriterija definisanih u DoD