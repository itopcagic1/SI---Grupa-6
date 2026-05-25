# Sprint Backlog

Ovaj dokument sadrži pregled planiranih i završenih zadataka za Sprint 9, sa fokusom na rezervaciju i upravljanje terminima sportskih objekata

# Sprint Backlog — Sprint 9

| ID | Veze sa US | Naziv zadatka | Odgovorna osoba | Status | Napomena / Akceptacijski kriterijumi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | US-15 | **Glavni pregled i monitoring popunjenosti za vlasnika** | Anes Mirvić | Done | Tabela sa filterima (teren, datum), paginacija 15/stranici |
| **2** | US-15.1, US-20.2 | **Ručna verifikacija i uslovne rezervacije** | Semir Jamaković | Done | Middleware za NEPOUZDAN status, modal za odbijanje (min. 10 karaktera), sekcija zahtjeva na čekanju |
| **3** | US-15.1, US-15.2 | **Automatizacija, tajmeri i vlasnička otkazivanja** |  | To Do | Auto-odbijanje nakon 60 min, blokada vlasničkog otkazivanja nakon 60 min |
| **4** | US-16 | **Rezervacija treninga za igrače** | Amna Kerla | Done | Sedmični kalendar slobodnih termina |
| **5** | US-17 | **Rezervacija treninga za trenere i upravljanje kapacitetom** | Ilma Hindija | Done | Kreiranje grupnog treninga s limitom (2–30), blokada prijave kad je kapacitet pun |
| **6** | US-19 | **Korisničko otkazivanje i kazneni sistem** |  | To Do | +1 prekršaj pri otkazivanju <24h, automatski NEPOUZDAN na 3 prekršaja |
| **7** | US-20, US-20.1 | **Real-time komunikacija i liste čekanja** | Mehdi Zaimović| Done | Prijava/odjava sa liste čekanja, real-time obavijest kad se termin oslobodi |
| **8** | US-18, US-18.1 | **Vlastiti kalendar treninga** | Irma Topčagić | Done | Prikaz nadolazećih termina, role-based podaci |


#### ID: US-15
#### Naziv: Pregled i monitoring svih rezervacija
Kao vlasnik objekta, želim imati pregled svih rezervacija u realnom vremenu, kako bih mogao pratiti popunjenost i intervenisati po potrebi.

**Sprint:** 9
**Poslovna vrijednost:** Omogućava efikasno upravljanje rezervacijama.  
**Prioritet:** Visok
**Pretpostavke:** Postoje poslani zahtjevi. 
**Veze sa drugim storyjima:** US-14 Obrada rezervacija

**Acceptance Criteria** 

- Vlasnik vidi hronološku listu svih rezervacija (i automatskih i onih na čekanju).
- Sistem jasno označava status svake rezervacije (Potvrđeno, Na čekanju, Otkazano).
- Za svaku rezervaciju vidi se profil korisnika i njegova historija prekršaja (broj nepojavljivanja).
- Sistem omogućava filtriranje rezervacija po datumu i specifičnom terenu/sali.

---

#### ID: US-15.1
#### Naziv: Odobravanje ili odbijanje zahtjeva korisnika pod restrikcijom
Kao vlasnik objekta, želim da lično pregledam zahtjeve korisnika koji su na listi nepouzdanih, kako bih odlučio da li ću im dozvoliti termin.

**Sprint:** 9
**Poslovna vrijednost:** Omogućava kontrolu nad korištenjem termina.
**Prioritet:** Visok
**Pretpostavke:** Zahtjev postoji.
**Veze sa drugim storyjima:** US-14

**Acceptance Criteria** 
- Kada nepouzdan korisnik pokuša rezervisati slobodan termin, zahtjev se ne potvrđuje odmah, već ide u sekciju "Zahtjevi na čekanju".
- Vlasnik mora dobiti notifikaciju o novom zahtjevu koji čeka ručnu provjeru.
- Vlasnik ima opciju "Odobri" (termin postaje zauzet) ili "Odbij" (termin se oslobađa).
- Prilikom odbijanja, vlasnik unosi obrazloženje koje se šalje korisniku.
- Ukoliko vlasnik ne reaguje u roku od 1h od momenta slanja zahtjeva, sistem automatski odbija zahtjev kako termin ne bi ostao blokiran za druge.  

---

#### ID: US-15.2
#### Otkazivanje bilo koje rezervacije od strane vlasnika u roku od 1h
Kao vlasnik objekta, želim imati pravo da otkažem bilo koju automatski potvrđenu rezervaciju u roku od sat vremena, ukoliko mi iznenada zatreba slobodan termin.

**Sprint:** 9
**Poslovna vrijednost:** Omogućava selekciju korisnika i upravljanje rasporedom.
**Prioritet:** Srednji
**Pretpostavke:** - Zahtjev postoji
**Veze sa drugim storyjima:** US-14

**Acceptance Criteria** 
- Vlasnik može otkazati rezervaciju **svaku** isključivo u roku od 1h od trenutka rezervacije
- Nakon isteka 1h, otkazivanje od strane vlasnika više nije moguće
- Vlasnik mora unijeti razlog otkazivanja (npr. "Tehnički kvar na terenu" ili "Privatni termin").
- Korisnik dobija notifikaciju sa razlogom otkazivanja
- Otkazani termin se vraća u status "Slobodan"

---

#### ID: US-16
#### Naziv: Rezervisanje termina za individualni trening
Kao igrač, želim da rezervišem termin za individualni trening, kako bih mogao poboljšati svoje vještine i performanse.

**Sprint:** 9
**Poslovna vrijednost:**
- Omogućava brže zakazivanje pregleda
- Povećava zadovoljstvo svih uključenih stakeholdera
**Prioritet:** Srednji
**Pretpostavke:**
- Igrač je prijavljen u sistem
- Postoji barem jedan slobodan termin za individualni trening
**Veze sa drugim storyjima:** US-10

**Acceptance Criteria** 
- Kada igrač izabere slobodan termin, tada sistem mora omogućiti rezervaciju  
- Sistem mora prikazati samo dostupne termine
- Ako igrač nije na listi nepouzdanih korisnika, sistem automatski potvrđuje rezervaciju bez čekanja na vlasnika
- Ako je igrač na listi nepouzdanih korisnika, sistem šalje rezervaciju na ručno odobrenje i obavještava igrača notifikacijom sa razlogom
- Vlasnik objekta ima 1h da otkaže automatski potvrđenu rezervaciju
- Ako termin nije dostupan, sistem ne smije dozvoliti rezervaciju  
- Korisnik treba dobiti potvrdu o uspješnoj rezervaciji  
- Sistem ne smije dozvoliti istom igraču da rezerviše isti termin više puta

---

#### ID: US-17
#### Naziv: Rezervisanje termina grupnih treninga
Kao trener, želim da rezervišem termin za grupni trening, kako bi tim mogao trenirati zajedno i unaprijediti svoju formu.

**Sprint:** 9 
**Poslovna vrijednost:**
- Omogućava brže zakazivanje pregleda
- Povećava zadovoljstvo svih uključenih stakeholdera
- Smanjuje količinu administrativnih obaveza trenera
**Prioritet:** Visok
**Pretpostavke:**
- Trener je prijavljen u sistem
- Postoji barem jedan slobodan termin za grupni trening
**Veze sa drugim storyjima:** US-12, US-12.1

**Acceptance Criteria** 

- Kada trener izabere slobodan termin, tada sistem mora sačuvati rezervaciju  
- Sistem mora prikazati dostupne termine za grupne treninge  
- Ako termin nije dostupan, sistem ne smije dozvoliti rezervaciju
- Trener može definisati maksimalan broj igrača za grupni trening
- Sistem mora spriječiti prijavu više igrača od dozvoljenog broja
- Ako trener nije na listi nepouzdanih korisnika, sistem automatski potvrđuje rezervaciju bez čekanja na vlasnika
- Ako je trener na listi nepouzdanih korisnika, sistem šalje rezervaciju na ručno odobrenje i obavještava trenera notifikacijom sa razlogom
- Vlasnik ima 1h da otkaže automatski potvrđenu rezervaciju
- Korisnik treba dobiti potvrdu o uspješnoj rezervaciji  
- Sistem mora omogućiti pregled svih zakazanih grupnih treninga 

---

#### ID: US-18
#### Naziv: Pregled stanja na tabeli termina (igrač)
Kao igrač, želim da vidim stanje rasporeda termina u tabeli, kako bih mogao uskladiti privatne obaveze.

**Sprint:** 9 
**Poslovna vrijednost:**
- Omogućava transparentnost rasporeda
- Povećava organizaciju igrača
**Prioritet:** Visok
**Pretpostavke:**
- Termini su jasno definisani i prikazani u sistemu
- Individualni termini igrača su također dostupni korisniku u tabeli
**Veze sa drugim storyjima:** US-10

**Acceptance Criteria:**

- Kada igrač pristupi tabeli, sistem mora prikazati sve dostupne termine 
- Sistem mora prikazati listu svih rezervisanih termina korisnika
- Sistem posjeduje jasno označene individualne i grupne termine
- Igrač vidi:
  - svoje individualne termine
  - grupne treninge na koje je prijavljen  
- Sistem mora omogućiti pregled po datumu i vremenu  
- Korisnik treba dobiti ažurne informacije o rasporedu  
- Sistem ne smije prikazivati zastarjele ili netačne podatke 

---

#### ID: US-18.1
#### Naziv: Pregled stanja na tabeli termina
Kao trener, želim da vidim stanje rasporeda termina u tabeli, kako bih mogao organizovati termin koji svima odgovara.

**Sprint:** 9 
**Poslovna vrijednost:**
- Omogućava transparentnost rasporeda
- Povećava organizaciju igrača
**Prioritet:** Visok
**Pretpostavke:**
- Termini su jasno definisani i prikazani u sistemu
**Veze sa drugim storyjima:** US-10

**Acceptance Criteria:**

- Kada trener pristupi tabeli, sistem mora prikazati sve dostupne termine 
- Sistem mora prikazati listu svih rezervisanih termina korisnika
- Sistem posjeduje jasno označene individualne i grupne termine
- Trener vidi:
  - grupne treninge (za tim)
  - broj prijavljenih igrača 
- Sistem mora omogućiti pregled po datumu i vremenu  
- Korisnik treba dobiti ažurne informacije o rasporedu  
- Sistem ne smije prikazivati zastarjele ili netačne podatke  

---

#### ID: US-19
#### Naziv: Otkazivanje rezervacije individualnih/grupnih termina
Kao registrovani korisnik (Igrač/Trener), želim otkazati rezervisani termin, kako bih oslobodio termin drugima ako sam spriječen doći.

**Sprint:** 9  
**Poslovna vrijednost:**
- Optimizacija popunjenosti kapaciteta objekta
- Ažurnost kalendara u realnom vremenu
- Smanjenje broja neiskorištenih termina (no-shows)
**Prioritet:** Visok
**Pretpostavke:**
- Korisnik ima aktivnu rezervaciju u sistemu
**Veze sa drugim storyjima:** US-16, US-17

**Acceptance Criteria** 
- Kada korisnik pristupi svojim rezervacijama, sistem mora prikazati listu predstojećih termina sa opcijom “Otkaži”
- Prije konačnog otkazivanja, sistem mora prikazati notifikaciju sa pitanjem “Da li ste sigurni da želite otkazati ovaj termin?”
- Nakon potvrde otkazivanja, sistem mora automatski poslati notifikaciju vlasniku objekta i korisnicima na listi čekanja
- Odmah nakon otkazivanja, status termina u javnom kalendaru se mora promijeniti iz “Zauzeto” u “Slobodno”
- Korisnik treba dobiti vizuelnu potvrdu da je rezervacija uspješno poništena
- Ako korisnik otkaže termin unutar nedozvoljenog vremenskog okvira (npr. manje od 24h prije), sistem to evidentira kao prekršaj
- Nakon definisanog broja evidentiranih prekršaja (npr. 3), sistem automatski dodaje korisnika na listu nepouzdanih korisnika vlasniku objekta
- Korisnik dobija notifikaciju da je dodan na listu nepouzdanih korisnika i iz kog razloga

---

#### ID: US-20
#### Naziv: Upravljanje listama čekanja i verifikacijom
Kao sistem, želim omogućiti funkcionalnost "čekanja" za termine koji nisu odmah dostupni za automatsku potvrdu (bilo zbog zauzetosti termina ili zbog potrebe za ručnom provjerom korisnika), kako bi se osigurala maksimalna popunjenost i sigurnost objekta.

**Sprint:** 9  
**Poslovna vrijednost:**
- Centralizuje logiku čekanja i verifikacije.
- Povećava iskorištenost kapaciteta objekta.
- Pruža vlasniku dodatni sloj sigurnosti.
**Prioritet:** Visok
**Veze sa drugim storyjima:** US-19

**Acceptance Criteria** 
- Sistem mora razlikovati dvije vrste čekanja: listu čekanja za popunjen termin i listu za ručnu verifikaciju.
- Korisnik mora dobiti povratnu informaciju o statusu svog zahtjeva u realnom vremenu.
- Svaka promjena statusa na čekanju mora generisati notifikaciju relevantnim stranama (vlasnik/korisnik)

---

#### ID: US-20.1
#### Naziv: Prijava na listu čekanja za zauzet termin
Kao korisnik (Igrač/Trener), želim da se prijavim na listu čekanja za već **zauzet** termin, kako bih bio obaviješten ako se taj termin oslobodi.

**Sprint:** 9  
**Poslovna vrijednost:**
- Povećava šansu za popunjavanje termina nakon iznenadnog otkazivanja.
- Poboljšava korisničko iskustvo pružanjem alternative.

**Acceptance Criteria** 
- Kada korisnik vidi termin koji je "Zauzet", sistem mora ponuditi opciju "Prijavi me na listu čekanja".
- Sistem mora evidentirati korisnika na listu za taj specifičan termin i datum.
- Kada se taj termin otkaže (shodno US-15.2 ili US-19), sistem šalje notifikaciju svim korisnicima sa liste čekanja.
- Sistem ne smije automatski rezervisati termin, već omogućiti korisnicima sa liste da ga sami prvi rezervišu po principu "brzog prsta".
- Korisnik treba imati mogućnost da se ukloni sa liste čekanja ako mu termin više nije potreban.