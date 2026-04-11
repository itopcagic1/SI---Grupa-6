# Risk Register

## 1. Uvod

Ovaj dokument predstavlja identifikaciju, analizu i upravljanje rizicima za projekat *Sistem za upravljanje sportskim terminima i ligama*.

Rizici su identifikovani na osnovu Product Backloga i User Stories, te uključuju tehničke, funkcionalne, organizacione i operativne aspekte sistema.

---

## 2. Metodologija procjene rizika

Rizici su procijenjeni prema:

- **Vjerovatnoći:** Niska / Srednja / Visoka  
- **Uticaju:** Nizak / Srednji / Visok  

Na osnovu toga definisan je **prioritet rizika**.

---

## 3. Risk Register tabela

| ID | Opis rizika | Uzrok | Vjerovatnoća | Uticaj | Prioritet | Plan mitigacije | Odgovorna osoba | Status |
|----|-------------|-------|--------------|--------|------------|------------------|------------------|--------|
| R-01 | Neispravna autentifikacija korisnika | Greške u implementaciji login/registracije (PB-20, PB-21) | Srednja | Visok | Visok | Validacija inputa, testiranje auth flow-a | Anes Mirvić | Otvoren |
| R-02 | Sigurnosni propusti | Nezaštićene rute i loša enkripcija (PB-23) | Srednja | Visok | Visok | Implementacija sigurnosnih protokola i testiranje | Anes Mirvić | Otvoren |
| R-03 | Nekonzistentni podaci u tabeli | Greške u unosu rezultata ili logici (PB-29, PB-30) | Srednja | Visok | Visok | Validacija podataka i automatski update | Mehdi Zaimović | Otvoren |
| R-04 | Konflikti u rasporedu utakmica | Preklapanje termina (US-10) | Srednja | Visok | Visok | Provjera konflikata prije spremanja termina | Semir Jamaković | Otvoren |
| R-05 | Duple rezervacije termina | Nedovoljna kontrola dostupnosti (PB-32, US-14) | Srednja | Visok | Visok | Zaključavanje termina i validacija rezervacija | Mehdi Zaimović | Otvoren |
| R-06 | Nepravilno upravljanje timovima i ligama | Loša logika povezivanja (PB-24, PB-25) | Srednja | Srednji | Srednji | Jasno definisan domain model | Anes Mirvić | Otvoren |
| R-07 | AI daje netačne predikcije | Nedostatak podataka ili loš model (PB-37, US-22) | Srednja | Srednji | Srednji | Korištenje jednostavnih modela i označavanje predikcije | Anes Mirvić | Otvoren |
| R-08 | AI zavisi od nedovoljno podataka | Nedovoljno unesenih rezultata (PB-29) | Srednja | Visok | Visok | Aktivirati AI tek nakon dovoljno podataka | Semir Jamaković | Otvoren |
| R-09 | Loš korisnički interfejs | Kompleksan UI (PB-38) | Niska | Srednji | Nizak | Testiranje sa korisnicima i iterativni dizajn | Maida Biber | Otvoren |
| R-10 | Kašnjenje u razvoju | Loša procjena zadataka | Srednja | Visok | Visok | Praćenje sprintova i zadataka | Irma Topčagić | Otvoren |
| R-11 | Slaba komunikacija u timu | Nedostatak koordinacije | Srednja | Srednji | Srednji | Redovni sastanci i ClickUp praćenje | Irma Topčagić | Otvoren |
| R-12 | Kašnjenje pojedinih članova | Loša organizacija vremena | Srednja | Srednji | Srednji | Transparentnost taskova | Irma Topčagić | Otvoren |
| R-13 | Kvar opreme člana tima | Tehnički problemi | Niska | Srednji | Nizak | Cloud alati i backup plan | Svi članovi | Otvoren |
| R-14 | Gubitak podataka | Greške u bazi (PB-17) | Niska | Visok | Srednji | Backup baze i validacija | Mehdi Zaimović | Otvoren |
| R-15 | Problemi sa performansama | Velik broj korisnika | Niska | Srednji | Nizak | Optimizacija baze i API-ja | Mehdi Zaimović | Otvoren |
| R-16 | Neuspješno slanje notifikacija | Greške u sistemu notifikacija (PB-35) | Srednja | Srednji | Srednji | Retry mehanizam i fallback | Semir Jamaković | Otvoren |
| R-17 | Neusklađenost funkcionalnosti sa user stories | Pogrešna implementacija zahtjeva | Srednja | Visok | Visok | Validacija kroz acceptance criteria | Ilma Hindija | Otvoren |
| R-18 | Problemi sa rezervacijama (otkazivanje i lista čekanja) | Kompleksna logika (US-19, US-20) | Srednja | Srednji | Srednji | Testiranje edge case-ova | Maida Biber | Otvoren |

---

## 4. Praćenje rizika

- Rizici se revidiraju na početku svakog sprinta  
- Novi rizici se dodaju prema potrebi  
- Status rizika se ažurira tokom razvoja  

---

## 5. Zaključak

Upravljanje rizicima omogućava pravovremeno prepoznavanje problema i smanjenje njihovog uticaja na projekat.

Poseban fokus stavljen je na:
- sigurnost sistema  
- integritet podataka  
- tačnost AI funkcionalnosti  
- organizaciju tima  

## 6. Risk Matrix

Risk Matrix prikazuje raspodjelu rizika na osnovu njihove vjerovatnoće i uticaja.

|                | **Nizak uticaj** | **Srednji uticaj** | **Visok uticaj** |
|----------------|------------------|---------------------|------------------|
| **Visoka vjerovatnoća** | - | R-08, R-12 | - |
| **Srednja vjerovatnoća** | - | R-06, R-07, R-11, R-16, R-18 | R-01, R-02, R-03, R-04, R-05, R-10, R-17 |
| **Niska vjerovatnoća** | R-09, R-13, R-15 | - | R-14 |


### Objašnjenje

- Rizici u gornjem desnom dijelu matrice predstavljaju najkritičnije rizike (visoka vjerovatnoća i visok uticaj)
- Rizici u srednjem dijelu zahtijevaju praćenje i kontrolu
- Rizici u donjem lijevom dijelu imaju najmanji prioritet




Najkritičniji rizici u projektu su:
- R-01 (Autentifikacija)
- R-02 (Sigurnost)
- R-03 (Tabela rezultata)
- R-04 (Raspored utakmica)
- R-05 (Rezervacije termina)
- R-10 (Kašnjenje u razvoju)