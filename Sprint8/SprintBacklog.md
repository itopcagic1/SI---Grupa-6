# Sprint Backlog

Ovaj dokument sadrži pregled planiranih i završenih zadataka za Sprint 8, sa fokusom na međusobnu koordinaciju članova tima i logički redoslijed realizacije funkcionalnosti.

# Sprint Backlog — Sprint 8

| ID | Veze sa US &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Naziv zadatka | Odgovorna osoba | Status | Napomena / Akceptacijski kriterijumi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | US-12 | **Evidencija rezultata završene utakmice i automatsko računanje bodova** | Ilma Hindija | Done | Ekran za unos rezultata utakmice je spojen sa ekranom za unos statistike u jednu zajedničku cjelinu radi lakšeg korištenja. Sistem validira unos i sprečava negativne/nelogične rezultate. |
| **2** | US-12.1 | **Unos i upravljanje detaljnom statistikom igrača i timova unutar određene utakmice** | Mehdi Zaimović | Done | Detaljna statistika igrača (strijelci, asistencije, kartoni/prekršaji) se može unijeti tek nakon što je uspješno upisan i spašen konačni rezultat utakmice. Povezuje se direktno sa profilima igrača i timova. |
| **3** | US-13 | **Razvoj servisa za dinamički proračun i generisanje tabele poretka (Leaderboard)** | Zeir Mašić | Done | Sistem automatski preračunava broj pobjeda, poraza, neriješenih, gol razliku i ukupne bodove odmah nakon spašavanja rezultata utakmice, osiguravajući ažurnost tabele u realnom vremenu. |
| **4** | US-13.1 | **Implementacija pregleda analitike i individualnih performansi igrača i timova** | Amna Kerla | Done | Omogućava filtriranje i sortiranje sveukupne statistike po ligama ili sezonama. Ako podaci nisu dostupni, osigurava prikaz odgovarajuće sistemske poruke. |
| **5** | US-14 | **CRUD upravljanje sportskim objektima sa mehanizmom privatnosti vlasnika** | Maida Biber | Done | Za sada pregled objekata i upravljanje dostupni samo vlasniku tog sportskog objekta. Implementirane napredne validacije unosa i soft-delete logičko brisanje podataka. |
| **6** | US-14.1 / US-14.2 | **Validacija rasporeda dvorana, upravljanje dostupnošću i kreiranje slobodnih termina** | Semir Jamaković | Done | Pripremljena osnovna arhitektura i validacija kalendarskog prikaza. Osigurano sprječavanje preklapanja termina i integrisana mogućnost administratorskog blokiranja (pre-work za Sprint 9). |

#### ID: US-12
#### Naziv: Evidencija utakmice i računanje bodova
Kao organizator liga, želim izvršiti evidenciju završene utakmice i unijeti rezultate, kako bi sistem automatski izračunao bodove i prikazao tačne informacije.

**Sprint:** 8  
**Poslovna vrijednost:** Omogućava tačno praćenje rezultata utakmica, pouzdanost podataka i automatsko ažuriranje tabele poretka.  
**Prioritet:** High  
**Pretpostavke:** Organizator liga ima permisije i unosi rezultate tačno i u realnom vremenu.  

**Acceptance Criteria** - Sistem mora omogućiti unos rezultata i osnovnih informacija o utakmici za obje ekipe.  
- Ako su uneseni rezultati negativni ili nelogični, sistem ne smije dozvoliti spremanje.  
- Nakon uspješnog unosa, sistem automatski računa bodove i ažurira tabelu poretka.  

---

#### ID: US-12.1
#### Naziv: Unos statistike tima i igrača u utakmici
Kao organizator liga, želim unijeti detaljnu statistiku meča, kako bi se evidentirali pojedinačni doprinosi igrača i timova.

**Sprint:** 8  
**Poslovna vrijednost:** Omogućava kasniju analizu performansi timova i pojedinaca te povećava transparentnost informacija.  
**Prioritet:** Medium  
**Veze sa drugim storyjima:** US-12 (Statistika se unosi tek nakon što je rezultat meča spašen).  

**Acceptance Criteria** - Sistem mora omogućiti unos detaljne statistike meča: strijelci/poeni, asistencije, kartoni/prekršaji.  
- Sistem mora povezati statistiku sa pojedinačnim igračima i timovima.  
- Nakon unosa, statistika mora biti vidljiva u pregledu utakmice, profilu tima i profilu igrača.  

---

#### ID: US-13
#### Naziv: Pregled leaderboard-a timova
Kao registrovani korisnik, želim da vidim tabelu rezultata i bodova svih timova, kako bih znao na kojem mjestu se svaki tim nalazi.

**Sprint:** 8  
**Poslovna vrijednost:** Omogućava transparentan uvid u rangiranje timova i konkurentnost.  
**Prioritet:** Medium  
**Pretpostavke:** Rezultati se redovno unose, a bodovi se računaju automatski.  
**Veze sa drugim storyjima:** US-12  

**Acceptance Criteria** - Prikaz svih timova sa bodovima, rangom i statistikom (pobjede, porazi, neriješeno, gol razlika).  
- Tabela se automatski ažurira nakon novih unosa i omogućava sortiranje.  
- Ako podaci nisu dostupni, prikazuje se odgovarajuća poruka.  

---

#### ID: US-13.1
#### Naziv: Pregled statistike igrača i timova
Kao korisnik, želim da vidim detaljnu statistiku igrača i timova, kako bih mogao analizirati performanse i napredak.

**Sprint:** 8  
**Poslovna vrijednost:** Omogućava analizu performansi i poboljšava korisničko iskustvo.  
**Prioritet:** Medium  
**Veze sa drugim storyjima:** US-12.1, US-13  

**Acceptance Criteria** - Prikaz statistike igrača (golovi, asistencije, utakmice) i timova (bodovi, pobjede, gol razlika).  
- Statistika se automatski ažurira nakon meča i nudi filtriranje po ligi ili sezoni.  

---

#### ID: US-14
#### Naziv: CRUD upravljanje sportskim objektima sa mehanizmom privatnosti
Kao vlasnik sportskog objekta, želim da imam potpunu CRUD kontrolu nad svojim objektima, kako bih mogao unositi, modificirati i brisati podatke o dvoranama.

**Sprint:** 8  
**Poslovna vrijednost:** Omogućava kreiranje baze sportskih objekata, kontrolu privatnosti podataka i postavljanje osnove za upravljanje terminima.  
**Prioritet:** High  
**Pretpostavke:** Vlasnik ima registrovan nalog i autentifikovan pristup.  

**Acceptance Criteria** - Vlasnik može kreirati, pregledati, ažurirati i logički obrisati (soft-delete) podatke o svom sportskom objektu.  
- Pregled i upravljanje određenim objektom strogo su zaključani i dostupni samo vlasniku tog objekta.  
- Sistem primjenjuje napredne validacije unosa podataka (naziv, lokacija, kapacitet) prije spašavanja u bazu.  

---
---

#### ID: US-14.1
#### Naziv: Pregled kalendara termina
Kao vlasnik objekta, želim da vidim kalendar svih termina, kako bih imao jasan pregled zauzetosti.

**Sprint:** 8 (Podloga za Sprint 9)  
**Poslovna vrijednost:** Bolja organizacija rada dvorane.  
**Prioritet:** High  
**Veze sa drugim storyjima:** US-14  

**Acceptance Criteria** - Vizuelni prikaz svih termina po danima i satima uz jasno razlikovanje slobodnih i zauzetih statusa.  
- Posebna oznaka za termine koji čekaju ručno odobrenje vlasnika.  

---

#### ID: US-14.2
#### Naziv: Kreiranje slobodnog termina
Kao vlasnik objekta, želim da kreiram slobodan termin, kako bi korisnici mogli izvršiti rezervaciju.

**Sprint:** 8 (Podloga za Sprint 9)  
**Poslovna vrijednost:** Brza objava slobodnih kapaciteta i veća popunjenost.  
**Prioritet:** High  
**Veze sa drugim storyjima:** US-14  

**Acceptance Criteria** - Mogućnost pojedinačnog i grupnog kreiranja termina uz unos datuma, vremena i trajanja.  
- Sistem automatski sprečava preklapanje termina i kreiranje van radnog vremena.
