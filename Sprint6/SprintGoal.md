# Sprint Goal — Sprint 6

## Ciljevi sprinta

Sprint 6 fokusiran je na uspostavljanje sigurne i funkcionalne osnove sistema kroz implementaciju autentifikacije, autorizacije i upravljanja korisnicima, uz paralelni razvoj backenda i frontenda za upravljanje ligama i timovima.

---

## Ključne stavke koje tim želi završiti

- Kompletna autentifikacija — registracija i login s validacijom i sigurnosnim protokolima 
- RBAC middleware i integracija permisija po rutama 
- Administratorsko upravljanje korisnicima — odobravanje uloga, brisanje i blokiranje 
- Backend i frontend za upravljanje timovima 
- Backend i frontend za upravljanje ligama 
- Integracija AI modula i usage loga 
- Testiranje svih implementiranih funkcionalnosti 

---

## Rizici i zavisnosti

### Rizici

- Kašnjenje u razvoju backenda može blokirati frontend implementaciju
- Prilikom testiranja mogu biti otkriveni defekti koji zahtijevaju dodatne ispravke iz prošlih sprintova

### Zavisnosti

- Fronted zavisi od završetka backenda
- Integracija permisija zavisi od popravka logina i registracije iz prethodnog sprinta
- Testiranje zavisi od završetka svih ostalih stavki