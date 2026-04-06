## 1. USER STORY – Registracija korisnika

**ID storyja:** US-01

**Naziv storyja:** Registracija korisnika

**Opis:**
Kao novi korisnik, želim da se registrujem na sistem, kako bih mogao koristiti funkcionalnosti platforme.

**Poslovna vrijednost:**
Omogućava pristup sistemu i diferencijaciju korisnika po ulogama (igrač, trener, vlasnik, admin).

**Prioritet:** Visok

**Pretpostavke i otvorena pitanja:**

- Korisnik ima validan email
- Da li je potrebna verifikacija emaila?

**Veze:** Login (US-02)

**Acceptance Criteria:**
- Kada korisnik unese validne podatke, ako klikne na “Registracija”, tada se korisnički nalog kreira
- Sistem mora omogućiti unos: email, lozinka, uloga
- Sistem ne smije dozvoliti registraciju sa već postojećim emailom
- Kada korisnik unese nevalidan email, tada sistem prikazuje grešku
- Kada korisnik unese neispravnu šifru, tada sistem prikazuje grešku
- Korisnik treba dobiti potvrdu o uspješnoj registraciji

## 2. USER STORY – Login

**ID storyja:** US-02

**Naziv storyja:** Prijava korisnika

**Opis:**
Kao registrovani korisnik, želim da se prijavim na sistem, kako bih pristupio svom nalogu.

**Poslovna vrijednost:**
Omogućava siguran pristup personalizovanim funkcijama.

**Prioritet:** Visok

**Pretpostavke:**

- Korisnik je već registrovan

**Veze:** Registracija (US-01)

**Acceptance Criteria:**
- Kada korisnik unese tačne kredencijale, ako klikne “Login”, tada se uspješno prijavljuje
- Sistem mora omogućiti unos emaila i lozinke
- Sistem ne smije dozvoliti login sa pogrešnim podacima
- Kada su podaci pogrešni, tada sistem prikazuje poruku o grešci
-Korisnik treba biti preusmjeren na dashboard nakon uspješne prijave

## 3. USER STORY – Vlasnik objekta (upravljanje terminima)

**ID storyja:** US-03

**Naziv storyja:** Upravljanje dostupnošću termina

**Opis:**
Kao vlasnik sportskog objekta, želim da upravljam dostupnim terminima, kako bih maksimalno popunio kapacitete.

**Poslovna vrijednost:**
Direktno utiče na prihod i iskorištenost objekta.

**Prioritet:** Visok

**Pretpostavke:**

- Vlasnik ima registrovan nalog

**Veze:** Rezervacije termina

**Acceptance Criteria:**
- Kada vlasnik doda novi termin, tada se on prikazuje kao slobodan
- Sistem mora omogućiti pregled kalendara termina
- Sistem mora omogućiti ručno blokiranje termina
- Kada vlasnik odobri zahtjev, tada se termin označava kao zauzet
- Sistem ne smije dozvoliti dvostruku rezervaciju istog termina
- Korisnik treba dobiti obavještenje o promjeni statusa termina


 ### 3.1 USER STORY – Pregled kalendara termina

**ID storyja:** US-03.1

**Naziv storyja:** Pregled kalendara termina

**Opis:**
Kao vlasnik objekta, želim da vidim kalendar svih termina, kako bih imao jasan pregled zauzetosti.

**Poslovna vrijednost:**
Omogućava bolju organizaciju i pregled iskorištenosti kapaciteta.

**Prioritet:** Visok

**Pretpostavke i otvorena pitanja:**

- Vlasnik je prijavljen u sistem
- Kalendar prikazuje ažurne podatke

**Veze:** US-03 Upravljanje terminima

**Acceptance Criteria:**
- Kada vlasnik otvori kalendar, tada vidi sve termine
- Sistem mora prikazati termine po danima i satima
- Sistem mora jasno razlikovati slobodne i zauzete termine
- Korisnik treba imati mogućnost pregleda različitih datuma

### 3.2 USER STORY – Kreiranje slobodnog termina

**ID storyja:** US-03.2

**Naziv storyja:** Kreiranje slobodnog termina

**Opis:**
Kao vlasnik objekta, želim da kreiram slobodan termin, kako bi korisnici mogli izvršiti rezervaciju.

**Poslovna vrijednost:**
Povećava mogućnost popunjenosti objekta.

**Prioritet:** Visok

**Pretpostavke:**
- Vlasnik ima pristup kalendaru

**Veze:** US-03

**Acceptance Criteria:**
- Kada vlasnik unese termin, tada se on sprema u sistem
- Sistem mora omogućiti unos datuma, vremena i trajanja
- Sistem ne smije dozvoliti preklapanje termina
- Novi termin treba biti prikazan kao slobodan

### 3.3 USER STORY – Blokiranje termina

**ID storyja:**  US-03.3

**Naziv storyja:** Blokiranje termina

**Opis:**
Kao vlasnik objekta, želim blokirati termin, kako bih ga rezervisao za interne potrebe.

**Poslovna vrijednost:**
Omogućava fleksibilno upravljanje resursima.

**Prioritet:** Srednji

**Pretpostavke:**
- Termin već postoji

**Veze:** US-03

**Acceptance Criteria:**
- Kada vlasnik blokira termin, tada postaje nedostupan
- Sistem mora jasno označiti blokiran termin
- Sistem ne smije dozvoliti rezervaciju blokiranog termina




### 4. USER STORY – Vlasnik objekta (odobravanje rezervacija)

**ID storyja:** US-04

**Naziv storyja:** Obrada zahtjeva za rezervaciju

**Opis:**
Kao vlasnik objekta, želim da odobrim ili odbijem zahtjeve za rezervaciju, kako bih kontrolisao korištenje termina.

**Poslovna vrijednost:**
Kontrola nad rasporedom i korisnicima.

**Prioritet:** Visok

**Acceptance Criteria:**
- Kada postoji zahtjev za rezervaciju, tada ga vlasnik vidi na listi
- Sistem mora omogućiti opciju “odobri” ili “odbij”
- Kada vlasnik odobri zahtjev, tada termin postaje zauzet
- Kada vlasnik odbije zahtjev, tada termin ostaje slobodan
- Korisnik treba dobiti notifikaciju o odluci

### 4.1 USER STORY – Pregled zahtjeva

**ID storyja:** US-04.1

**Naziv storyja:** Pregled zahtjeva za rezervaciju

**Opis:**
Kao vlasnik objekta, želim pregledati pristigle zahtjeve, kako bih mogao odlučiti o njima.

**Poslovna vrijednost:**
Omogućava efikasno upravljanje rezervacijama.

**Prioritet:** Visok

**Pretpostavke:**
- Postoje poslani zahtjevi

**Veze:** US-04 Obrada rezervacija

**Acceptance Criteria:**
- Kada postoji zahtjev, tada se prikazuje na listi
- Sistem mora prikazati korisnika i termin
- Sistem mora omogućiti pregled po datumu


### 4.2 USER STORY – Odobravanje rezervacije

**ID storyja:** US-04.2

**Naziv storyja:** Odobravanje rezervacije

**Opis:**
-Kao vlasnik objekta, želim odobriti rezervaciju, kako bi termin bio zauzet.

**Poslovna vrijednost:**
Omogućava kontrolu nad korištenjem termina.

**Prioritet:** Visok

**Pretpostavke:**
- Zahtjev postoji

**Veze:** US-04

**Acceptance Criteria:**
- Kada vlasnik odobri zahtjev, tada termin postaje zauzet
- Sistem mora spriječiti nove zahtjeve za isti termin
- Korisnik treba dobiti potvrdu


### 4.3 USER STORY – Odbijanje rezervacije

**ID storyja:** US-04.3

**Naziv storyja:** Odbijanje rezervacije

**Opis:**
Kao vlasnik objekta, želim odbiti rezervaciju, kako bih zadržao termin slobodnim.

**Poslovna vrijednost:**
Omogućava selekciju korisnika i upravljanje rasporedom.

**Prioritet:** Srednji

**Pretpostavke:**
- Zahtjev postoji

**Veze:** US-04

**Acceptance Criteria:**
- Kada vlasnik odbije zahtjev, tada termin ostaje slobodan
- Sistem mora evidentirati odbijanje
- Korisnik treba dobiti obavještenje

### 5. USER STORY – Navijač (pregled utakmica)

**ID storyja:** US-05

**Naziv storyja:** Pregled utakmica i rezultata

**Opis:**
Kao navijač, želim da pregledam utakmice i rezultate, kako bih bio informisan o dešavanjima.

**Poslovna vrijednost:**
Povećava angažman i posjećenost platforme.

**Prioritet:** Srednji

**Pretpostavke:**
- Nije potrebna registracija

**Acceptance Criteria:**
- Kada korisnik otvori aplikaciju, tada vidi listu utakmica
- Sistem mora omogućiti filtriranje po ligi, timu i datumu
- Sistem mora prikazati rezultate u realnom vremenu
- Sistem ne smije zahtijevati login za pregled
- Korisnik treba vidjeti detalje utakmice (timovi, rezultat, vrijeme)

### 5.1 USER STORY – Pregled bez registracije

**ID storyja:** US-05.1 

**Naziv storyja:** Pregled bez registracije

**Opis:**
Kao navijač, želim da pregledam utakmice bez prijave, kako bih brzo došao do informacija.

**Acceptance Criteria:**
- Kada korisnik otvori aplikaciju, tada može pregledati utakmice bez login-a
- Sistem ne smije zahtijevati registraciju za pregled
- Sistem mora prikazati osnovne informacije (timovi, rezultat, vrijeme)

### 5.2 USER STORY – Filtriranje sadržaja

**ID storyja:** US-05.2

**Naziv storyja:** Filtriranje sadržaja

**Opis:**
Kao navijač, želim da filtriram utakmice, kako bih lakše pronašao željene informacije.

**Acceptance Criteria:**
- Kada korisnik odabere filter, tada se lista ažurira
- Sistem mora omogućiti filtriranje po ligi, timu i datumu
- Sistem mora prikazati rezultate filtriranja u realnom vremenu

### 5.3 USER STORY – Registracija navijača

**ID storyja:** US-05.3 
 
**Naziv storyja:** Opcionalna registracija navijača

**Opis:**
Kao navijač, želim opciju registracije, kako bih mogao dobiti dodatne funkcionalnosti.

**Acceptance Criteria:**
- Sistem mora omogućiti registraciju navijača
- Registrovani korisnik treba imati iste mogućnosti pregleda + dodatne opcije (npr. notifikacije)
- Sistem ne smije ograničiti osnovni pregled neregistrovanim korisnicima

### 5.4 USER STORY – Pregled tabele

**ID storyja:** US-05.4 
 
**Naziv storyja:** Pregled tabele i rezultata

**Opis:**
Kao navijač, želim vidjeti tabelu lige, kako bih pratio stanje timova.

**Acceptance Criteria:**
- Kada korisnik otvori ligu, tada vidi tabelu
- Sistem mora prikazati bodove i pozicije timova
- Sistem mora automatski ažurirati tabelu nakon unosa rezultata

### 6. USER STORY – Administrator (upravljanje korisnicima)

**ID storyja:** US-06

**Naziv storyja:** Upravljanje korisnicima

**Opis:**
Kao administrator, želim da upravljam korisnicima, kako bih osigurao sigurnost sistema.

**Poslovna vrijednost:**
Osigurava kontrolu i kvalitet platforme.

**Prioritet:** Visok

**Acceptance Criteria:**
- Kada administrator pregleda korisnike, tada vidi listu svih naloga
- Sistem mora omogućiti brisanje korisnika
- Sistem mora omogućiti blokiranje korisnika
- Sistem ne smije dozvoliti neautorizovan pristup admin funkcijama
-Administrator treba imati pristup svim korisničkim podacima

### 6.1 USER STORY – Pregled korisnika

**ID storyja:** US-06.1 

**Naziv storyja:** Pregled svih korisnika

**Opis:**
Kao administrator, želim vidjeti sve korisnike, kako bih imao kontrolu nad sistemom.

**Acceptance Criteria:**
- Kada admin otvori modul korisnika, tada vidi listu svih naloga
- Sistem mora prikazati osnovne podatke (email, uloga)
- Sistem mora omogućiti pretragu korisnika

### 6.2 USER STORY – Upravljanje korisničkim nalozima

**ID storyja:** US-06.2 

**Naziv storyja:** Upravljanje korisničkim nalozima

**Opis:**
Kao administrator, želim upravljati korisnicima, kako bih osigurao sigurnost.

**Acceptance Criteria:**
- Sistem mora omogućiti brisanje korisnika
- Sistem mora omogućiti blokiranje korisnika
- Sistem ne smije dozvoliti pristup blokiranim korisnicima

### 7. USER STORY – Administrator (upravljanje sadržajem)

**ID storyja:** US-07
**Naziv storyja:** Upravljanje sportovima i ligama

**Opis:**
Kao administrator, želim da upravljam sportovima i ligama, kako bih održavao sistem ažurnim.

**Poslovna vrijednost:**
Osigurava relevantnost i tačnost sadržaja.

**Prioritet:** Visok

**Acceptance Criteria:**
- Kada administrator doda sport, tada se on pojavljuje u sistemu
- Sistem mora omogućiti uređivanje i brisanje sportova
- Sistem mora omogućiti upravljanje ligama
- Sistem ne smije dozvoliti nevalidne podatke
- Korisnici treba da vide ažurirane podatke odmah

### 7.1 USER STORY – Upravljanje sportovima

**ID storyja:** US-07.1 

**Naziv storyja:** Upravljanje sportovima

**Opis:**
Kao administrator, želim upravljati sportovima, kako bih održavao sistem organizovanim.

**Acceptance Criteria:**
- Kada admin doda sport, tada se pojavljuje u sistemu
- Sistem mora omogućiti uređivanje i brisanje sportova
- Sistem ne smije dozvoliti duplikate

### 7.2 USER STORY – Upravljanje ligama i sadržajem

**ID storyja:** US-07.2 

**Naziv storyja:** Upravljanje ligama i sadržajem

**Opis:**
Kao administrator, želim upravljati ligama i podacima, kako bih održavao tačnost sistema.

**Acceptance Criteria:**
- Sistem mora omogućiti kreiranje i brisanje liga
- Sistem mora omogućiti izmjenu podataka o ligi
- Promjene treba da budu odmah vidljive korisnicima

### 7.3 USER STORY – Administracija baze i sistema

**ID storyja:** US-07.3 
 
**Naziv storyja:** Administracija baze i sistema

**Opis:**
Kao administrator, želim imati kontrolu nad podacima sistema, kako bih osigurao stabilnost i sigurnost.

**Acceptance Criteria:**
- Sistem mora omogućiti pregled svih ključnih podataka (korisnici, lige, termini)
- Sistem mora ograničiti pristup ovim funkcijama samo administratoru
- Sistem ne smije dozvoliti neautorizovane izmjene podataka
- Administrator treba imati mogućnost uklanjanja neispravnih ili lažnih podataka

## 8. USER STORY – Odjava korisnika (Logout)

**ID storyja:** US-08  
**Naziv storyja:** Odjava korisnika  

**Opis:**  
Kao prijavljeni korisnik, želim da se odjavim sa sistema, kako bih zaštitio svoj nalog i završio sesiju korištenja aplikacije.  

**Poslovna vrijednost:**  
Osigurava sigurnost korisničkih podataka i sprječava neovlašten pristup nalogu nakon korištenja aplikacije.  

**Prioritet:** Visok  

**Pretpostavke i otvorena pitanja:**  
- Korisnik je prijavljen u sistem  
- Postoji aktivna korisnička sesija  
- Da li sistem treba automatski odjaviti korisnika nakon perioda neaktivnosti?  

**Veze:**  
- US-02 Login  

### Acceptance Criteria

- Kada je korisnik prijavljen, ako klikne na opciju “Odjava”, tada se uspješno odjavljuje iz sistema  
- Sistem mora prekinuti aktivnu korisničku sesiju nakon odjave  
- Sistem mora preusmjeriti korisnika na početnu ili login stranicu  
- Sistem ne smije omogućiti pristup zaštićenim stranicama nakon odjave  
- Kada korisnik pokuša pristupiti zaštićenoj stranici nakon odjave, tada sistem zahtijeva ponovnu prijavu  
- Korisnik treba dobiti potvrdu ili vizuelni indikator da je uspješno odjavljen  

### 8.1 USER STORY – Automatska odjava (timeout)

**ID storyja:** US-08.1  

**Opis:**  
Kao korisnik, želim da sistem automatski izvrši odjavu nakon perioda neaktivnosti, kako bi moj nalog bio siguran.  

**Poslovna vrijednost:**  
Dodatna sigurnost sistema.  

**Prioritet:** Srednji  

#### Acceptance Criteria
- Kada korisnik nije aktivan određeni vremenski period, tada se automatski odjavljuje  
- Sistem mora upozoriti korisnika prije automatske odjave  
- Nakon odjave, korisnik mora ponovo unijeti kredencijale  

## 9. USER STORY – Zakazivanje termina utakmice

**ID storyja:** US-09

**Naziv storyja:** Zakazivanje termina utakmice

**Opis:**
Kao organizator liga, želim zakazati termin utakmice, kako bi timovi mogli imati unaprijed poznati termin utakmice.

**Poslovna vrijednost:**
- Omogućava efikasnu organizaciju utakmica
- Smanjuje konflikte u rasporedu
- Povećava zadovoljstvo timova zbog fleksibilnosti termina

**Prioritet:** Visok

**Pretpostavke:**
- Organizator liga ima permisije da dodaje nove termine utakmica
- Pri završetku user storya u sistemu se nalazi novi termin utakmice

**Otvorena pitanja:**
- Koliko detalja moraju unijeti organizatori liga pri zakazivanju termina
- Da li će biti potrebna povratna informacija trenera nakon zakazivanja termina utakmice

**Acceptance Criteria:**

- Kada organizator liga ima pristup sistemu i unese podatke o terminu, ako su podaci validni, tada sistem mora sačuvati novi termin utakmice  
- Kada organizator unese termin koji se preklapa sa postojećim, tada sistem ne smije dozvoliti unos i mora prikazati poruku o grešci  
- Sistem mora omogućiti unos osnovnih podataka (datum, vrijeme, timovi, lokacija)  
- Nakon uspješnog unosa, korisnik treba dobiti potvrdu da je termin uspješno zakazan  
- Ako podaci nisu potpuni, sistem ne smije dozvoliti spremanje termina  

---

## 10. USER STORY – Evidencija utakmice

**ID storyja:** US-10

**Naziv storyja:** Evidencija utakmice

**Opis:**
Kao organizator liga, želim izvršiti evidenciju završene utakmice, kako bi korisnici mogli dobiti željene informacije o istim.

**Poslovna vrijednost:**
- Omogućava tačno praćenje rezultata utakmica
- Povećava transparentnost informacija za sve korisnike
- Omogućava kasniju analizu performansi timova

**Prioritet:** Srednji

**Pretpostavke:**
- Organizator liga ima permisije da vrši evidenciju utakmica

**Otvorena pitanja:**
- Koje informacije mora sadržavati evidencija utakmice (rezultat, strijelci, kartoni)
- Da li postoji unaprijed definisan template za unos podataka
- Da li je moguće naknadno uređivati evidenciju utakmice

**Veze:** US-09

**Acceptance Criteria:**

- Kada organizator unese podatke o završenoj utakmici, ako su podaci validni, tada sistem mora sačuvati evidenciju  
- Sistem mora omogućiti unos rezultata i osnovnih informacija o utakmici  
- Ako podaci nisu validni ili nedostaju, sistem ne smije dozvoliti spremanje  
- Nakon unosa, korisnik treba dobiti potvrdu o uspješnoj evidenciji  
- Sistem mora omogućiti kasniji pregled unesenih podataka  

---

## 10.1. USER STORY – Računanje bodova utakmice

**ID storyja:** US-10.1

**Naziv storyja:** Računanje bodova utakmice

**Opis:**
Kao organizator liga, želim unijeti bodove utakmice, kako bi sistem automatski izračunao rezultate.

**Poslovna vrijednost:**
- Omogućava prikaz tačnih rezultata u sistemu
- Povećava pouzdanost podataka o utakmicama
- Omogućava ažuriranje tabele i statistika

**Prioritet:** Visok

**Pretpostavke:**
- Organizator će tačno i brzo unijeti sve bodove u realnom vremenu

**Otvorena pitanja:**
- Da li će postojati dodatna validacija unosa bodova organizatora

**Veze:** US-10

**Acceptance Criteria:**

- Kada organizator unese bodove, ako su validni, tada sistem mora prikazati tačne rezultate  
- Ako su bodovi negativni ili nelogični, sistem ne smije dozvoliti unos  
- Nakon unosa bodova, sistem mora automatski ažurirati tabelu  
- Korisnik treba dobiti potvrdu o uspješnom unosu bodova  
- Sistem mora omogućiti unos bodova za obje ekipe 

---

## 11. USER STORY – Pregled stanja na tabeli termina (igrač)

**ID storyja:** US-11

**Naziv storyja:** Pregled stanja na tabeli termina

**Opis:**
Kao igrač, želim da vidim stanje rasporeda termina u tabeli, kako bih mogao uskladiti privatne obaveze.

**Poslovna vrijednost:**
- Omogućava transparentnost rasporeda
- Povećava organizaciju igrača

**Prioritet:** Srednji

**Pretpostavke:**
- Termini su jasno definisani i prikazani u sistemu
- Individualni termini igrača su također dostupni korisniku u tabeli

**Otvorena pitanja:**
- Da li su odvojeno označeni individualni termini treninga?
- Da li se informacije prikazuju u realnom vremenu?

**Veze:** US-09

**Acceptance Criteria:**

- Kada igrač pristupi tabeli, sistem mora prikazati sve dostupne termine  
- Ako postoje različiti tipovi termina, sistem treba jasno označiti individualne i grupne termine  
- Sistem mora omogućiti pregled po datumu i vremenu  
- Korisnik treba dobiti ažurne informacije o rasporedu  
- Sistem ne smije prikazivati zastarjele ili netačne podatke  

---

## 12. USER STORY – Pregled tabele rezultata i bodova 

**ID storyja:** US-12

**Naziv storyja:** Pregled leaderboard-a timova

**Opis:**
Kao registrovani korisnik, želim da vidim tabelu rezultata i bodova svih timova, kako bih znao na kojem mjestu se svaki tim nalazi.

**Poslovna vrijednost:**
- Omogućava transparentan uvid u rangiranje timova
- Motivira igrače i navijače kroz praćenje napretka i konkurencije

**Prioritet:** Srednji

**Pretpostavke:**
- Rezultati utakmica se redovno unose u sistem
- Bodovi se automatski izračunavaju na osnovu rezultata
- Svi korisnici imaju pristup leaderboard tabeli

**Otvorena pitanja:**
- Da li se tabela ažurira u realnom vremenu nakon unosa rezultata?
- Da li postoji mogućnost filtriranja ili sortiranja tabele (npr. po broju bodova, gol razlici)?

**Veze:** US-10, US-10.1

**Acceptance Criteria:**

- Kada korisnik pristupi tabeli, sistem mora prikazati sve timove sa njihovim bodovima i rangom  
- Sistem mora prikazati tačne i ažurne podatke na osnovu unesenih rezultata utakmica  
- Kada se unesu novi rezultati, tabela se mora automatski ažurirati  
- Sistem mora omogućiti sortiranje tabele po bodovima ili drugim relevantnim parametrima (npr. gol razlika)  
- Ako podaci nisu dostupni, sistem mora prikazati odgovarajuću poruku umjesto prazne ili netačne tabele  

---

## 13. USER STORY – Rezervisanje termina za individualni trening

**ID storyja:** US-13

**Naziv storyja:** Rezervisanje termina za individualni trening

**Opis:**
Kao igrač, želim da rezervišem termin za individualni trening, kako bih mogao poboljšati svoje vještine i performanse.

**Poslovna vrijednost:**
- Omogućava brže zakazivanje pregleda
- Povećava zadovoljstvo svih uključenih stakeholdera

**Prioritet:** Srednji

**Pretpostavke:**
- Igrač je prijavljen u sistem
- Postoji barem jedan slobodan termin za individualni trening

**Otvorena pitanja:**
- Postoji li ograničen broj rezervacija individualnih termina po igraču u mjesecu?

**Veze:** US-09

**Acceptance Criteria:**

- Kada igrač izabere slobodan termin, tada sistem mora omogućiti rezervaciju  
- Sistem mora prikazati samo dostupne termine  
- Ako termin nije dostupan, sistem ne smije dozvoliti rezervaciju  
- Korisnik treba dobiti potvrdu o uspješnoj rezervaciji  
- Sistem ne smije dozvoliti istom igraču da rezerviše isti termin više puta  

---

## 14. USER STORY – Rezervisanje termina grupnih treninga

**ID storyja:** US-14

**Naziv storyja:** Rezervisanje termina grupnih treninga

**Opis:**
Kao trener, želim da rezervišem termin za grupni trening, kako bi tim mogao trenirati zajedno i unaprijediti svoju formu.

**Poslovna vrijednost:**
- Omogućava brže zakazivanje pregleda
- Povećava zadovoljstvo svih uključenih stakeholdera
- Smanjuje količinu administrativnih obaveza trenera

**Prioritet:** Visok

**Pretpostavke:**
- Trener je prijavljen u sistem
- Postoji barem jedan slobodan termin za grupni trening

**Otvorena pitanja:**
- Postoji li ograničen broj rezervacija grupnih termina u mjesecu?

**Veze:** US-10, US-10.1

**Acceptance Criteria:**

- Kada trener izabere slobodan termin, tada sistem mora sačuvati rezervaciju  
- Sistem mora prikazati dostupne termine za grupne treninge  
- Ako termin nije dostupan, sistem ne smije dozvoliti rezervaciju  
- Korisnik treba dobiti potvrdu o uspješnoj rezervaciji  
- Sistem mora omogućiti pregled svih zakazanih grupnih treninga 

---

## 15. USER STORY – Prijavljivanje tima na takmičenje

**ID storyja:** US-15

**Naziv storyja:** Prijavljivanje tima na takmičenje

**Opis:**
Kao trener, želim da prijavim tim na takmičenje, kako bi tim mogao učestvovati u turnirima, ligama i slično.

**Poslovna vrijednost:**
- Omogućava bržu prijavu na takmičenja
- Povećava zadovoljstvo i vremensku efikasnost svih uključenih stakeholdera
- Smanjuje količinu administrativnih obaveza trenera

**Prioritet:** Visok

**Pretpostavke:**
- Trener je prijavljen u sistem
- Tim ispunjava uslove za učešće na takmičenju

**Otvorena pitanja:**
- Da li trener može prijaviti tim na više takmičenja odjednom

**Acceptance Criteria:**

- Kada trener unese validne podatke, tada sistem mora evidentirati prijavu tima  
- Ako tim ne ispunjava uslove, sistem ne smije dozvoliti prijavu  
- Sistem mora omogućiti unos svih potrebnih informacija o timu i takmičenju  
- Korisnik treba dobiti potvrdu o uspješnoj prijavi  
- Sistem mora omogućiti pregled svih prijavljenih takmičenja za tim

---

## 16. USER STORY – Otkazivanje rezervacije individualnih/grupnih termina 

**ID storyja:** US-16

**Naziv storyja:** Otkazivanje rezervacije individualnih/grupnih termina

**Opis:**
Kao registrovani korisnik (Igrač/Trener), želim otkazati rezervisani termin, kako bih oslobodio termin drugima ako sam spriječen doći.

**Poslovna vrijednost:**
- Optimizacija popunjenosti kapaciteta objekta
- Ažurnost kalendara u realnom vremenu
- Smanjenje broja neiskorištenih termina (no-shows)

**Prioritet:** Visok

**Pretpostavke:**
- Korisnik ima aktivnu rezervaciju u sistemu

**Otvorena pitanja:**
- Koliko tačno iznosi vremensko ograničenje za otkazivanje (npr. 12h ili 24h ranije)?
- Da li postoje različita pravila otkazivanja za "Trenera" u odnosu na "Igrača"?

**Veze:** US-03, US-13, US-14

**Acceptance Criteria:**

- Kada korisnik pristupi svojim rezervacijama, sistem mora prikazati listu predstojećih termina sa opcijom “Otkaži”
- Ako korisnik pokuša otkazati termin unutar nedozvoljenog vremenskog okvira (npr. manje od 24h prije), sistem mora prikazati upozorenje o penalima ili onemogućiti akciju
- Prije konačnog otkazivanja, sistem mora prikazati notifikaciju sa pitanjem “Da li ste sigurni da želite otkazati ovaj termin?”
- Nakon potvrde otkazivanja, sistem mora automatski poslati notifikaciju vlasniku objekta i korisnicima na listi čekanja
- Odmah nakon otkazivanja, status termina u javnom kalendaru se mora promijeniti iz “Zauzeto” u “Slobodno”
- Korisnik treba dobiti vizuelnu potvrdu da je rezervacija uspješno poništena
---

## 17. USER STORY – Lista čekanja za termine

**ID storyja:** US-17

**Naziv storyja:** Prijava na listu čekanja

**Opis:**
Kao korisnik (Igrač/Trener), želim da se prijavim na listu čekanja za već zauzet termin, kako bih bio obaviješten ako se taj termin oslobodi.

**Poslovna vrijednost:**
- Povećava šansu za popunjavanje termina nakon iznenadnog otkazivanja
- Poboljšava korisničko iskustvo pružanjem alternative

**Prioritet:** Srednji

**Veze:** US-16

**Acceptance Criteria:**
- Kada korisnik vidi termin koji je "Zauzet", sistem mora ponuditi opciju "Prijavi me na listu čekanja"
- Sistem mora evidentirati korisnika na listu za taj specifičan termin i datum
- Kada se taj termin otkaže (prema US-16), sistem mora poslati notifikaciju svim korisnicima sa liste čekanja
- Sistem ne smije automatski rezervisati termin, već omogućiti korisniku sa liste da ga sam prvi rezerviše
- Korisnik treba imati mogućnost da se ukloni sa liste čekanja ako mu termin više nije potreban

---

## 18. USER STORY – Pregled AI predikcije

**ID storyja:** US-18

**Naziv storyja:** Pregled AI predikcije

**Opis:**
Kao registrovani korisnik, želim da imam pristup AI predikciji ishoda narednih utakmica i konačnog poretka lige, kako bih bolje planirao strategiju i pratio konkurenciju.

**Poslovna vrijednost:**
- Povećava angažman korisnika kroz analitičke funkcionalnosti
- Diferencira aplikaciju od konkurencije korištenjem AI funkcionalnosti
- Pruža dodatnu vrijednost i za trenere, igrače i navijače

**Prioritet:** Srednji

**Pretpostavke:**
- Postoji AI model ili servis koji generiše predikcije
- Dostupni su relevantni podaci (rezultati, statistike, forma timova)
- Korisnici imaju osnovno razumijevanje šta znači AI predikcija
- Sistem ima dovoljno performansi za obradu i prikaz podataka u realnom vremenu ili blizu realnog vremena

**Otvorena pitanja:**
- Koliko često se AI predikcije ažuriraju?
- Da li će korisnici vidjeti detaljne statistike iza predikcije ili samo rezultat?
- Kako prikazati nepouzdanost ili grešku predikcije (confidence score)?
- Da li će korisnici moći upoređivati predikcije sa stvarnim rezultatima?


**Veze:** US-10, US-10.1

**Acceptance Criteria:**
- Korisnik može vidjeti AI predikciju za naredne utakmice (pobjednik, rezultat ili vjerovatnoće)
- Korisnik može vidjeti predikciju konačnog poretka lige
- Predikcije su jasno označene kao AI generisane
- Prikaz uključuje osnovno objašnjenje ili faktore (npr. forma tima, prethodni rezultati)
- Sistem omogućava osvježavanje predikcija (npr. nakon novih utakmica ili podataka)
- Pristup je ograničen samo na registrovane korisnike
- UI prikaz je pregledan i razumljiv svim tipovima korisnika

---