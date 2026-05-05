# Decision log
## **ID:** DL-01  

**Datum:** 25/04/2026  

**Naziv:** Odabir baze podataka i infrastrukture  

**Opis:**  
Potrebno je odabrati odgovarajuću bazu podataka i infrastrukturu za projekat koja će podržati razvoj aplikacije, omogućiti jednostavno upravljanje konekcijama i biti pogodna za timski rad i buduće proširenje sistema (npr. AI funkcionalnosti).  

**Razmatrane opcije:**  
- Neon  
- Supabase  
- Railway  

**Odabrana opcija:**  
Neon  

**Razlog izbora:**  
Neon je odabran jer:  
- omogućava branching baze, što olakšava paralelan rad više članova tima  
- ima ugrađen connection pooler, što pojednostavljuje rad sa konekcijama 
- pruža fleksibilnost i bolju kontrolu nad backend arhitekturom u odnosu na Supabase  
- izbjegava potencijalne dugoročne komplikacije i ograničenja koje bi mogli imati sa Supabase pristupom  

**Posljedice odluke:**  

*Pozitivne:* 
- lakši timski rad zbog branchinga  
- jednostavnije upravljanje konekcijama  
- veća fleksibilnost za budući razvoj (npr. AI funkcionalnosti)  

*Negativne:* 
- potrebno je više ručne konfiguracije u odnosu na Supabase  
- veća odgovornost tima za implementaciju pojedinih funkcionalnosti  

**Status odluke:**  
Aktivna  

## **ID:** DL-02  

**Datum:** 26/04/2026  

**Naziv:** Dodjela specijalnih korisničkih uloga putem admin odobrenja  

**Opis:**  
Potrebno je definisati način dodjele specijalnih korisničkih uloga u sistemu, uz osiguravanje kontrole i sigurnosti, kako bi se spriječio neautorizovan pristup privilegovanim funkcionalnostima.  

**Razmatrane opcije:**  
- Automatska dodjela uloge pri registraciji (bez provjere)  
- Sistem zahtjeva za ulogu uz admin odobrenje  

**Odabrana opcija:**  
Sistem zahtjeva za ulogu uz admin odobrenje  

**Razlog izbora:**  
Odabrani pristup omogućava da korisnik izrazi želju za određenom ulogom, ali sprječava automatsko dodjeljivanje bez kontrole.  
Na ovaj način se uvodi dodatni sloj sigurnosti jer admin ima konačnu odluku o dodjeli privilegovanih uloga, čime se smanjuje rizik od zloupotrebe sistema.  

**Implementacija (tok procesa):**  
1. Korisnik odabere željenu ulogu pri registraciji  
2. Backend sprema zahtjev kao requested uloga sa statusom `PENDING`  
3. Korisnik se prijavljuje sa trenutnom ulogom `NAVIJAC`  
4. Admin vidi zahtjeve u admin panelu  
5. Admin odobrava ili odbija zahtjev  
6. Ako odobri - korisnik dobija novu ulogu  
7. Ako odbije - korisnik zadržava ulogu `NAVIJAC`  

**Posljedice odluke:**  

**Pozitivne:**  
- povećana sigurnost i kontrola nad dodjelom uloga  
- smanjen rizik od zloupotrebe privilegovanih funkcionalnosti  
- jasan i kontrolisan proces upravljanja ulogama  

**Negativne:**  
- dodatni korak u procesu (potrebna admin intervencija)  
- moguće kašnjenje u dodjeli uloga  

**Status odluke:**  
Aktivna  

## **ID:** DL-03  

**Datum:** 28/04/2026  

**Naziv:** Planiranje frontend dizajna prije implementacije 

**Opis:**  
Potrebno je definisati pristup razvoju frontend i backend dijela aplikacije kako bi se smanjila kompleksnost i izbjegli nepotrebni dodatni radovi tokom razvoja.  

**Razmatrane opcije:**  
- Paralelni razvoj frontend-a i backend-a bez unaprijed definisanog dizajna  
- Ad-hoc dizajniranje frontend-a tokom implementacije  
- Unaprijed planiranje frontend dizajna za sve stranice pomoću alata za dizajn  

**Odabrana opcija:**  
Unaprijed planiranje frontend dizajna za sve stranice pomoću Figma alata  

**Razlog izbora:**  
Odlučeno je da se frontend unaprijed isplanira kako bi se smanjile kasnije izmjene i neslaganja između frontend i backend dijela.  
Korištenjem alata omogućava se jasna vizualizacija svih stranica aplikacije, što olakšava razvoj i koordinaciju unutar tima.  
Ovaj pristup smanjuje potrebu za naknadnim izmjenama i doprinosi efikasnijem razvoju.  

**Posljedice odluke:**  

**Pozitivne:**  
- jasna struktura i izgled aplikacije prije implementacije  
- lakša koordinacija između frontend i backend razvoja  
- smanjen broj izmjena tokom razvoja  

**Negativne:**  
- dodatno vrijeme potrebno za inicijalno planiranje  
- manja fleksibilnost za brze promjene tokom razvoja  

**Status odluke:**  
Aktivna  

**ID:** DL-04  

**Datum:** 29/04/2026  

**Naziv:** Privremeni deployment aplikacije na Render (free plan)  

**Opis:**  
Potrebno je omogućiti deployment aplikacije kako bi tim mogao testirati funkcionalnosti u realnom okruženju i demonstrirati napredak. Također je potrebno donijeti odluku o dugoročnom hosting rješenju.  

**Razmatrane opcije:**  
- Render (free plan)
- Amazon Web Services (AWS)
- VPS

**Odabrana opcija:**  
- Render (free plan, privremeno rješenje)  

**Razlog izbora:**  
Render je odabran kao privremeno rješenje jer omogućava brz i jednostavan deployment bez dodatnih troškova.  
Ovaj pristup omogućava timu da brzo testira aplikaciju i demonstrira funkcionalnosti tokom sprinta, bez potrebe za kompleksnom konfiguracijom infrastrukture.  
Dugoročna odluka (AWS ili VPS) je odgođena kako bi se kasnije donijela na osnovu potreba projekta.  

**Posljedice odluke:**  

**Pozitivne:**  
- brz i jednostavan deployment  
- bez troškova u ranoj fazi razvoja  
- mogućnost testiranja aplikacije u realnom okruženju  

**Negativne:**  
- ograničenja free plana (performanse, dostupnost)  
- nije dugoročno skalabilno rješenje  
- potrebna buduća migracija na drugo rješenje (AWS ili VPS)  

**Status odluke:**  
Aktivna  