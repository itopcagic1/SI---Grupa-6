### **SPRINT 5** (PB-20, PB-21, PB-22)

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

#### **US-1.1** – Odobravanje specijalnih uloga**
**Opis:** Kao administrator, želim verifikovati vlasnike objekata i organizatore liga.
**Acceptance Criteria:**
* Admin vidi listu zahtjeva "Na čekanju".
* Tek nakon odobrenja, korisnik dobija dozvolu za kreiranje objekata ili liga.

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

## 3. USER STORY – Odjava korisnika (Logout)

**ID storyja:** US-03  
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

### 3.1 USER STORY – Automatska odjava (timeout)

**ID storyja:** US-03.1  

**Opis:**  
Kao korisnik, želim da sistem automatski izvrši odjavu nakon perioda neaktivnosti, kako bi moj nalog bio siguran.  

**Poslovna vrijednost:**  
Dodatna sigurnost sistema.  

**Prioritet:** Srednji  

#### Acceptance Criteria
- Kada korisnik nije aktivan određeni vremenski period, tada se automatski odjavljuje  
- Sistem mora upozoriti korisnika prije automatske odjave  
- Nakon odjave, korisnik mora ponovo unijeti kredencijal


### **SPRINT 6** (PB-23, PB-24, PB-25)

### 4. USER STORY – Upravljanje korisnicima (Administrator)

**ID storyja:** US-04

**Naziv storyja:** Upravljanje korisnicima

**Opis:**
Kao administrator, želim da upravljam korisnicima, kako bih osigurao kvalitetan rad i sigurnost sistema.

**Poslovna vrijednost:**
Osigurava kontrolu i kvalitet platforme.

**Prioritet:** Visok

**Acceptance Criteria:**
- Kada administrator pregleda korisnike, tada vidi listu svih naloga
- Sistem mora omogućiti brisanje korisnika
- Sistem mora omogućiti blokiranje korisnika
- Sistem ne smije dozvoliti neautorizovan pristup admin funkcijama
- Administrator treba imati pristup korisničkim podacima
- Sistem mora zastiti privatne podatke korisnika/ enkripcija lozinke

### 4.1 USER STORY – Pregled korisnika

**ID storyja:** US-04.1 

**Naziv storyja:** Pregled svih korisnika

**Opis:**
Kao administrator, želim vidjeti sve korisnike, kako bih imao kontrolu nad sistemom.

**Acceptance Criteria:**
- Kada admin otvori modul korisnika, tada vidi listu svih naloga
- Sistem mora prikazati osnovne podatke (email, uloga)
- Sistem mora omogućiti pretragu korisnika 

### US-04.2 – Korisnički profil

**Opis:**
Kao registrovani korisnik, želim pregledati i urediti svoj profil, kako bih održavao tačne podatke o sebi.

**Poslovna vrijednost:**
Omogućava korisnicima kontrolu nad svojim podacima.

**Prioritet:** Srednji

**Acceptance Criteria:**
- Kada korisnik otvori profil, tada vidi svoje podatke (ime, email, uloga, timovi)
- Sistem mora omogućiti uređivanje imena i lozinke
- Sistem ne smije dozvoliti unos nevalidnih podataka
- Nakon izmjene, korisnik treba dobiti potvrdu o uspješnoj promjeni

### US-04.3 – Zastita podataka

**Opis:**
Kao registrovani korisnik, želim da su moji podaci zasticeni, kako bih sigurno koristio sistem.

**Poslovna vrijednost:**
Omogućava korisnicima kontrolu nad svojim podacima.

**Prioritet:** Srednji

**Acceptance Criteria:**
- Lozinke moraju biti enkriptovane
- Sistem mora koristiti autentifikaciju za zasticene rute
- Neautorizovan pristup mora biti blokiran

### 5. USER STORY – Administrator (upravljanje sadržajem)

**ID storyja:** US-05
**Naziv storyja:** Upravljanje sadržajem (sportovima,timovima i ligama)

**Opis:**
Kao administrator, želim da upravljam sportovima, timovima i ligama, kako bih održavao sistem ažurnim.

**Poslovna vrijednost:**
Osigurava relevantnost i tačnost sadržaja.

**Prioritet:** Visok

**Acceptance Criteria:**
- Kada administrator doda sport, tada se on pojavljuje u sistemu
- Sistem mora omogućiti uređivanje i brisanje sportova
- Sistem mora omogućiti dodavanje i brisanje timova u ligama
- Sistem ne smije dozvoliti nevalidne podatke
- Korisnici treba da vide ažurirane podatke odmah

### 5.1 USER STORY – Upravljanje sportovima

**ID storyja:** US-05.1 

**Naziv storyja:** Upravljanje sportovima

**Opis:**
Kao administrator, želim upravljati sportovima, kako bih održavao sistem organizovanim.

**Acceptance Criteria:**
- Kada admin doda sport, tada se pojavljuje u sistemu
- Sistem omogucava biranje sporta iz date liste sportova
- Sistem mora omogućiti uređivanje i brisanje sportova
- Sistem ne smije dozvoliti duplikate

### 5.2 USER STORY – Upravljanje ligama 

**ID storyja:** US-05.2 

**Naziv storyja:** Upravljanje ligama 

**Opis:**
Kao administrator, želim upravljati ligama i podacima koji se vezuju za odredjenu ligu  kako bih održavao tačnost sistema.

**Acceptance Criteria:**
- Sistem mora omogućiti kreiranje i brisanje liga kao i timova u njoj
- Sistem mora omogućiti izmjenu podataka o ligi
- Promjene treba da budu odmah vidljive korisnicima
- Sistem mora prikazati listu postojećih liga

### 5.2.1 USER STORY – Dodavanje tima u ligu

**ID storyja:** US-05.2.1

**Naziv storyja:** Dodavanje tima u ligu

**Opis:**
Kao administrator, želim dodati tim u ligu, kako bi mogao učestvovati u takmičenju.

**Acceptance Criteria:**
- Admin može izabrati postojeći tim
- Admin može izabrati ligu
- Sistem mora spriječiti dodavanje istog tima više puta u istu ligu
- Nakon dodavanja, tim se prikazuje u ligi

### 5.2.2 USER STORY – Uklanjanje tima iz lige

**ID storyja:** US-05.2.2

**Naziv storyja:** Uklanjanje tima iz lige

**Opis:**
Kao administrator, želim ukloniti tim iz lige, kako bih ažurirao sastav takmičenja.

**Acceptance Criteria:**
- Admin može ukloniti tim iz lige
- Sistem mora tražiti potvrdu
- Tim više ne smije biti vidljiv u toj ligi
- Historijski podaci (rezultati) moraju ostati sačuvani (ako postoji)

### 5.3 USER STORY – Upravljanje timovima 

**ID storyja:** US-05.3 

**Naziv storyja:** Upravljanje timovima

**Opis:**
Kao administrator, želim upravljati timovima ili timovima koji se nalaze u odredjenoj ligi,  kako bih održavao tačnost sistema.

**Acceptance Criteria:**
- Sistem mora omogućiti kreiranje i brisanje timova
- Sistem mora omogućiti izmjenu podataka o timovima
- Promjene treba da budu odmah vidljive korisnicima
- Sistem mora prikazati tabele postojećih timova
- Administratorske funkcije su ograničene na nadzor i korekciju podataka, dok operativno upravljanje timovima vrše treneri”

### 5.3.1 USER STORY – Kreiranje timova

**ID storyja:** US-05.3.1

**Naziv storyja:** Kreiranje timova

**Opis:**
Kao administrator, želim kreirati novi tim, kako bih omogućio njegovo učešće u ligama.

**Acceptance Criteria:**
- Admin može unijeti naziv tima
- Admin mora odabrati sport kojem tim pripada
- Admin može dodati osnovne informacije (opis, logo – opcionalno)
- Sistem ne smije dozvoliti duplikat naziva tima
- Nakon kreiranja, tim se pojavljuje u listi timova
- Administratorske funkcije su ograničene na nadzor i korekciju podataka, dok operativno upravljanje timovima vrše treneri”

### 5.3.2 USER STORY – Uređivanje tima

**ID storyja:** US-05.3.2 

**Naziv storyja:** Uređivanje tima

**Opis:**
Kao administrator, želim urediti podatke o timu, kako bih održavao tačnost informacija.

**Acceptance Criteria:**
- Admin može promijeniti naziv tima i osnovne informacije o timu
- Promjene se odmah ažuriraju u sistemu
- Sistem mora validirati unesene podatke
- Administratorske funkcije su ograničene na nadzor i korekciju podataka, dok operativno upravljanje timovima vrše treneri”

### 5.3.3 USER STORY – Brisanje tima

**ID storyja:** US-05.3.3 

**Naziv storyja:** Brisanje tima

**Opis:**
Kao administrator, želim obrisati tim, kako bih uklonio nevažeće ili neaktivne ekipe.

**Acceptance Criteria:**
- Admin može obrisati tim
- Sistem mora tražiti potvrdu prije brisanja od trenera/organizatora tima
- Ako je tim povezan sa ligom, sistem mora:
 - ili spriječiti brisanje
 - ili upozoriti admina
- Nakon brisanja, tim više nije vidljiv u sistemu
- Administratorske funkcije su ograničene na nadzor i korekciju podataka, dok operativno upravljanje timovima vrše treneri”

### 5.4 USER STORY – Dodjela trenera timu

**ID storyja:** US-05.4

**Naziv storyja:** Dodjela trenera timu

**Opis:**
Kao administrator, želim dodijeliti trenera timu, kako bi tim imao odgovornu osobu.

**Acceptance Criteria:**
- Admin može odabrati korisnika sa ulogom trener
- Jedan tim može imati jednog ili više trenera
- Sistem mora validirati da korisnik ima odgovarajuću ulogu
- Administratorske funkcije su ograničene na nadzor i korekciju podataka, dok operativno upravljanje timovima vrše treneri

### 6. USER STORY – Trener (Upravljanje timom)

**ID storyja:** US-06

**Naziv storyja:** Upravljanje podacima tima na operativnom nivou

**Opis:**
Kao trener, želim da mogu uređivati podatke svog tima, kako bih održavao tačne i ažurne informacije o timu.

**Poslovna vrijednost:**
Omogućava tačnost podataka o timovima
Smanjuje potrebu za intervencijom administratora
Povećava autonomiju trenera

**Prioritet:** Visok

**Pretpostavke:**
Trener je prijavljen u sistem
Trener je dodijeljen određenom timu

**Acceptance Criteria:**

- Trener može urediti osnovne informacije o timu ( opis, slika, igraci)
- Sistem mora ograničiti pristup samo na tim koji je dodijeljen treneru
- Ako podaci nisu validni, sistem ne smije dozvoliti spremanje
- Nakon izmjena, sistem treba prikazati potvrdu o uspješnom ažuriranju
- Promjene moraju biti odmah vidljive u sistemu

### 7. USER STORY – Trener (Upravljanje igračima u timu)

**ID storyja:** US-07

**Naziv storyja:** Upravljanje igračima u timu

**Opis:**
Kao trener, želim da mogu dodavati i uklanjati igrače iz svog tima, kako bih imao kontrolu nad sastavom ekipe.

**Poslovna vrijednost:**
Omogućava fleksibilno upravljanje timom
Olakšava organizaciju ekipe
Povećava tačnost evidencije igrača

**Prioritet:** Visok

**Pretpostavke:**
Trener upravlja jednim ili više timova

**Acceptance Criteria:**
- Trener može dodati novog igrača u tim
- Trener može ukloniti igrača iz tima
- Sistem mora spriječiti duplikate igrača u istom timu
- Sistem mora prikazati listu svih igrača u timu
- Nakon izmjena, sistem treba prikazati potvrdu

### 8. USER STORY – Pregled tima (trener)

**ID storyja:** US-08

**Naziv storyja:** Pregled detalja tima

**Opis:**
Kao registrovani korisnik, želim da imam pregled tima, kako bih imao uvid u sve relevantne informacije.

**Poslovna vrijednost:**
Omogućava bolju organizaciju
Povećava preglednost podataka
Olakšava donošenje odluka

**Prioritet:** Srednji

**Acceptance Criteria:**
- Korisnik može vidjeti sve osnovne informacije o timu
- Sistem mora prikazati listu igraca i njhovu statistiku 
- Sistem mora prikazati ligu u kojoj tim učestvuje
- Podaci moraju biti ažurni
---

### **SPRINT 7** (PB-26, PB-27, PB-28)

## 9. USER STORY – Prijavljivanje tima na takmičenje

**ID storyja:** US-09

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

## 10. USER STORY – Zakazivanje termina utakmice

**ID storyja:** US-10

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

### 11. USER STORY – Navijač (pregled sadržaja)

**ID storyja:** US-11

**Naziv storyja:** Pregled rezultata utakmica i rasporeda

**Opis:**
Kao posjetilac stranice (gost) želim da imam uvid u rezultate i tabele uz mogućnost filtriranja, dok kao registrovani korisnik želim dodatnu opciju praćenja omiljenog tima.

**Poslovna vrijednost:**
Povećava angažman i posjećenost platforme.

**Prioritet:** Srednji

**Pretpostavke:**
- Registracija je opcionalna

**Acceptance Criteria:**
- Kada korisnik otvori aplikaciju, tada vidi tabelu utakmica, sa rezultatima i rasporedom
- Sistem mora omogućiti filtriranje po sportu, ligi, timu i datumu
- Sistem mora prikazati rezultate u realnom vremenu
- Sistem ne smije zahtijevati login za pregled
- Sistem treba omogućiti registraciju korisniku, ukoliko on to želi, kako bi mogao imati pristup dodatnim funkcionalnostima

### 11.1 USER STORY – Pregled bez registracije

**ID storyja:** US-11.1 

**Naziv storyja:** Pregled bez registracije

**Opis:**
Kao gost, želim da pregledam rezultate, bodove, pozicije timova kao i raspored utakmica bez prijave,na dijelu rezultate i raspored,  kako bih brzo došao do informacija.

**Acceptance Criteria:**
- Korisnik moze pristupati informacijama bez login-a
- Sistem ne smije zahtijevati registraciju za pregled
- Sistem mora prikazati vrijeme održavanja utakmica (raspored)
- Korisnik može pronaci dio "raspored utakmica" (proslih i nadolazecih)
- Korisnik moze pregledati dio "rezultati" gdje su napisani krajnji rezultati utakmice sa strijelcima date utakmice 
- Sistem mora posjedovati tabele liga u kojima su timovi
- Sistem mora automatski ažurirati tabele

### 11.2 USER STORY – Filtriranje sadržaja

**ID storyja:** US-11.2

**Naziv storyja:** Filtriranje sadržaja

**Opis:**
Kao gost, želim da filtriram sportove i lige, kako bih lakše pronašao željene informacije

**Acceptance Criteria:**
- Kada korisnik otvori aplikaciju, sistem mora prikazati listu dostupnih sportova
- Kada korisnik odabere sport, sistem mora prikazati sve lige vezane za taj sport
- Sistem mora prikazati osnovne informacije o ligama (naziv, broj timova)
- Kada korisnik odabere ligu, sistem mora prikazati timove u toj ligi
- Sistem mora prikazati poredak timova u ligama na osnovu prethodnih utakmica i njenih rezultata
- Sistem mora omogućiti jednostavnu navigaciju nazad na listu sportova
- Kada korisnik odabere filter, tada se lista ažurira
- Sistem mora prikazati rezultate filtriranja u realnom vremenu



### **SPRINT 8** (PB-29, PB-30)

 
## 12. USER STORY – Evidencija utakmice

**ID storyja:** US-12

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

**Veze:** US-10

**Acceptance Criteria:**

- Kada organizator unese podatke o završenoj utakmici, ako su podaci validni, tada sistem mora sačuvati evidenciju  
- Sistem mora omogućiti unos rezultata i osnovnih informacija o utakmici  
- Ako podaci nisu validni ili nedostaju, sistem ne smije dozvoliti spremanje  
- Organizator liga unosi sve rezultate za utakmice i timove u toj ligi za koju je vezan 
- Organizator liga unosi statistiku vezanu za tu utakmicu - strijelci, posjed lopte, crveni i zuti kartoni i ostalo 
- Sistem mora omogućiti kasniji pregled unesenih podataka  

---

## 12.1. USER STORY – Računanje bodova utakmice

**ID storyja:** US-12.1

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

**Veze:** US-12

**Acceptance Criteria:**

- Kada organizator unese bodove, ako su validni, tada sistem mora prikazati tačne rezultate  
- Ako su bodovi negativni ili nelogični, sistem ne smije dozvoliti unos  
- Nakon unosa bodova, sistem mora automatski ažurirati tabelu  
- Korisnik treba dobiti potvrdu o uspješnom unosu bodova  
- Sistem mora omogućiti unos bodova za obje ekipe 

---
## 13. USER STORY – Pregled tabele rezultata i bodova 

**ID storyja:** US-13

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

**Veze:** US-12, US-12.1

**Acceptance Criteria:**

- Kada korisnik pristupi tabeli, sistem mora prikazati sve timove sa njihovim bodovima i rangom  
- Sistem mora prikazati tačne i ažurne podatke na osnovu unesenih rezultata utakmica  
- Kada se unesu novi rezultati, tabela se mora automatski ažurirati  
- Sistem mora omogućiti sortiranje tabele po bodovima ili drugim relevantnim parametrima (npr. gol razlika)  
- Ako podaci nisu dostupni, sistem mora prikazati odgovarajuću poruku umjesto prazne ili netačne tabele  

---

### **SPRINT 9** (PB-31,32,33,34)

## 14. USER STORY – Vlasnik objekta (upravljanje terminima)

**ID storyja:** US-14

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
- Vlasnik može unijeti radno vrijeme objekta (npr. 08:00–22:00)
- Vlasnik može definisati trajanje termina (npr. 60 ili 90 minuta)
- Vlasnik može unositi dostupne termine na nivou sedmice ili mjeseca
- Kada vlasnik doda novi termin, tada se on automatski prikazuje u sistemu kao slobodan
- Sistem mora omogućiti pregled kalendara termina
- Sistem mora omogućiti ručno blokiranje termina
- Sistem automatski dodaje korisnika na listu nepouzdanih korisnika nakon definisanog broja prekršaja (npr. 3 nepojavljivanja ili kasna otkazivanja)
- Vlasnik može ručno dodati ili ukloniti korisnika sa liste nepouzdanih korisnika uz navođenje razloga
- Sistem automatski označava termin kao zauzet odmah nakon rezervacije, ukoliko korisnik nije na listi nepouzdanih korisnika
- Ako je korisnik na listi nepouzdanih korisnika, rezervacija se stavlja na čekanje i vlasnik je dužan u roku od 1h odobriti ili odbiti zahtjev, a korisnik dobija notifikaciju o razlogu čekanja
- Vlasnik može otkazati automatski potvrđenu rezervaciju u roku od 1h od trenutka rezervacije uz obavezno navođenje razloga, nakon čega korisnik dobija notifikaciju
- Sistem ne smije dozvoliti dvostruku rezervaciju istog termina
- Korisnik treba dobiti obavještenje o svakoj promjeni statusa termina


 ### 14.1 USER STORY – Pregled kalendara termina

**ID storyja:** US-14.1

**Naziv storyja:** Pregled kalendara termina

**Opis:**
Kao vlasnik objekta, želim da vidim kalendar svih termina, kako bih imao jasan pregled zauzetosti.

**Poslovna vrijednost:**
Omogućava bolju organizaciju i pregled iskorištenosti kapaciteta.

**Prioritet:** Visok

**Pretpostavke i otvorena pitanja:**

- Vlasnik je prijavljen u sistem
- Kalendar prikazuje ažurne podatke


**Acceptance Criteria:**
- Kada vlasnik otvori kalendar, tada vidi sve termine
- Sistem mora prikazati termine po danima i satima
- Sistem mora jasno razlikovati slobodne i zauzete termine
- Korisnik treba imati mogućnost pregleda različitih datuma
- Sistem mora prikazati jasnu oznaku za termine koji čekaju odobrenje vlasnika (korisnici sa liste nepouzdanih korisnika)

### 14.2 USER STORY – Kreiranje slobodnog termina

**ID storyja:** US-14.2

**Naziv storyja:** Kreiranje slobodnog termina

**Opis:**
Kao vlasnik objekta, želim da kreiram slobodan termin, kako bi korisnici mogli izvršiti rezervaciju.

**Poslovna vrijednost:**
Povećava mogućnost popunjenosti objekta.

**Prioritet:** Visok

**Pretpostavke:**
- Vlasnik ima pristup kalendaru

**Veze:** US-14

**Acceptance Criteria:**
- Vlasnik može kreirati termine grupno (na nivou sedmice ili mjeseca), a ne samo pojedinačno
- Sistem mora omogućiti unos datuma, vremena i trajanja
- Sistem mora automatski spriječiti kreiranje termina van definisanog radnog vremena
- Kada vlasnik unese termin, tada se on sprema u sistema
- Sistem ne smije dozvoliti preklapanje termina
- Novi termin treba biti prikazan kao slobodan



## 15. USER STORY – Dashboard za vlasnika (Upravljanje rezervacijama)
**ID storyja:** US-15

**Naziv storyja:** Pregled i monitoring svih rezervacija

**Opis:** Kao vlasnik objekta, želim imati pregled svih rezervacija u realnom vremenu, kako bih mogao pratiti popunjenost i intervenisati po potrebi.

**Poslovna vrijednost:**
Omogućava efikasno upravljanje rezervacijama.

**Prioritet:** Visok

**Pretpostavke:**
- Postoje poslani zahtjevi

**Veze:** US-14 Obrada rezervacija

**Acceptance Criteria:**
- Vlasnik vidi hronološku listu svih rezervacija (i automatskih i onih na čekanju).
- Sistem jasno označava status svake rezervacije (Potvrđeno, Na čekanju, Otkazano).
- Za svaku rezervaciju vidi se profil korisnika i njegova istorija prekršaja (broj nepojavljivanja).
- Sistem omogućava filtriranje rezervacija po datumu i specifičnom terenu/sali.

### 15.1 USER STORY – Ručna verifikacija (Korisnici sa liste nepouzdanih)

**ID storyja:** US-15.1

**Naziv storyja:** Odobravanje ili odbijanje zahtjeva korisnika pod restrikcijom

**Opis:** Kao vlasnik objekta, želim da lično pregledam zahtjeve korisnika koji su na listi nepouzdanih, kako bih odlučio da li ću im dozvoliti termin.

**Poslovna vrijednost:**
Omogućava kontrolu nad korištenjem termina.

**Prioritet:** Visok

**Pretpostavke:**
- Zahtjev postoji

**Veze:** US-14

**Acceptance Criteria:**
- Kada nepouzdan korisnik pokuša rezervisati slobodan termin, zahtjev se ne potvrđuje odmah, već ide u sekciju "Zahtjevi na čekanju".
- Vlasnik mora dobiti notifikaciju o novom zahtjevu koji čeka ručnu provjeru.
- Vlasnik ima opciju "Odobri" (termin postaje zauzet) ili "Odbij" (termin se oslobađa).
- Prilikom odbijanja, vlasnik unosi obrazloženje koje se šalje korisniku.
- Ukoliko vlasnik ne reaguje u roku od 1h od momenta slanja zahtjeva, sistem automatski odbija zahtjev kako termin ne bi ostao blokiran za druge.

---

### 15.2 USER STORY – Otkazivanje bilo koje rezervacije od strane vlasnika u roku od 1h

**ID storyja:** US-15.2

**Naziv storyja:** Otkazivanje bilo koje rezervacije od strane vlasnika u roku od 1h

**Opis:** Kao vlasnik objekta, želim imati pravo da otkažem bilo koju automatski potvrđenu rezervaciju u roku od sat vremena, ukoliko mi iznenada zatreba slobodan termin.

**Poslovna vrijednost:**
Omogućava selekciju korisnika i upravljanje rasporedom.

**Prioritet:** Srednji

**Pretpostavke:**
- Zahtjev postoji

**Veze:** US-14

**Acceptance Criteria:**
- Vlasnik može otkazati rezervaciju **svaku** isključivo u roku od 1h od trenutka rezervacije
- Nakon isteka 1h, otkazivanje od strane vlasnika više nije moguće
- Vlasnik mora unijeti razlog otkazivanja (npr. "Tehnički kvar na terenu" ili "Privatni termin").
- Korisnik dobija notifikaciju sa razlogom otkazivanja
- Otkazani termin se vraća u status "Slobodan"

## 16. USER STORY – Rezervisanje termina za individualni trening

**ID storyja:** US-16

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

**Veze:** US-10

**Acceptance Criteria:**

- Kada igrač izabere slobodan termin, tada sistem mora omogućiti rezervaciju  
- Sistem mora prikazati samo dostupne termine
- Ako igrač nije na listi nepouzdanih korisnika, sistem automatski potvrđuje rezervaciju bez čekanja na vlasnika
- Ako je igrač na listi nepouzdanih korisnika, sistem šalje rezervaciju na ručno odobrenje i obavještava igrača notifikacijom sa razlogom
- Vlasnik objekta ima 1h da otkaže automatski potvrđenu rezervaciju
- Ako termin nije dostupan, sistem ne smije dozvoliti rezervaciju  
- Korisnik treba dobiti potvrdu o uspješnoj rezervaciji  
- Sistem ne smije dozvoliti istom igraču da rezerviše isti termin više puta  

---

## 17. USER STORY – Rezervisanje termina grupnih treninga

**ID storyja:** US-17

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

**Veze:** US-12, US-12.1

**Acceptance Criteria:**

- Kada trener izabere slobodan termin, tada sistem mora sačuvati rezervaciju  
- Sistem mora prikazati dostupne termine za grupne treninge  
- Ako termin nije dostupan, sistem ne smije dozvoliti rezervaciju
- Ako trener nije na listi nepouzdanih korisnika, sistem automatski potvrđuje rezervaciju bez čekanja na vlasnika
- Ako je trener na listi nepouzdanih korisnika, sistem šalje rezervaciju na ručno odobrenje i obavještava trenera notifikacijom sa razlogom
- Vlasnik ima 1h da otkaže automatski potvrđenu rezervaciju
- Korisnik treba dobiti potvrdu o uspješnoj rezervaciji  
- Sistem mora omogućiti pregled svih zakazanih grupnih treninga 

---

### **SPRINT 10** (PB-35,36,37)


## 18. USER STORY – Pregled stanja na tabeli termina (igrač)

**ID storyja:** US-18

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

**Veze:** US-10

**Acceptance Criteria:**

- Kada igrač pristupi tabeli, sistem mora prikazati sve dostupne termine  
- Ako postoje različiti tipovi termina, sistem treba jasno označiti individualne i grupne termine  
- Sistem mora omogućiti pregled po datumu i vremenu  
- Korisnik treba dobiti ažurne informacije o rasporedu  
- Sistem ne smije prikazivati zastarjele ili netačne podatke  

---

## 19. USER STORY – Otkazivanje rezervacije individualnih/grupnih termina 

**ID storyja:** US-19

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

**Veze:**  US-16, US-17

**Acceptance Criteria:**

- Kada korisnik pristupi svojim rezervacijama, sistem mora prikazati listu predstojećih termina sa opcijom “Otkaži”
- Prije konačnog otkazivanja, sistem mora prikazati notifikaciju sa pitanjem “Da li ste sigurni da želite otkazati ovaj termin?”
- Nakon potvrde otkazivanja, sistem mora automatski poslati notifikaciju vlasniku objekta i korisnicima na listi čekanja
- Odmah nakon otkazivanja, status termina u javnom kalendaru se mora promijeniti iz “Zauzeto” u “Slobodno”
- Korisnik treba dobiti vizuelnu potvrdu da je rezervacija uspješno poništena
- Ako korisnik otkaže termin unutar nedozvoljenog vremenskog okvira (npr. manje od 24h prije), sistem to evidentira kao prekršaj
- Nakon definisanog broja evidentiranih prekršaja (npr. 3), sistem automatski dodaje korisnika na listu nepouzdanih korisnika vlasniku objekta
- Korisnik dobija notifikaciju da je dodan na listu nepouzdanih korisnika i iz kog razloga


---

## 20. USER STORY – Lista čekanja za termine

**ID storyja:** US-20

**Naziv storyja:** Lista čekanja za zauzet termin

**Opis:**
Kao korisnik (Igrač/Trener), želim da se prijavim na listu čekanja za već **zauzet** termin, kako bih bio obaviješten ako se taj termin oslobodi. 

**Poslovna vrijednost:**
- Povećava šansu za popunjavanje termina nakon iznenadnog otkazivanja
- Poboljšava korisničko iskustvo pružanjem alternative

**Prioritet:** Srednji

**Veze:** US-19

**Acceptance Criteria:**
- Kada korisnik vidi termin koji je "Zauzet", sistem mora ponuditi opciju "Prijavi me na listu čekanja"
- Sistem mora evidentirati korisnika na listu za taj specifičan termin i datum
- Kada se taj termin otkaže (prema US-16), sistem mora poslati notifikaciju svim korisnicima sa liste čekanja
- Sistem ne smije automatski rezervisati termin, već omogućiti korisniku sa liste da ga sam prvi rezerviše
- Korisnik treba imati mogućnost da se ukloni sa liste čekanja ako mu termin više nije potreban


### 20.1  USER STORY – Lista čekanja za nepouzdane korisnike 
**ID storyja:** US-20

**Naziv storya:** Uslovna rezervacija za nepouzdane korisnike
**Opis:** Kao nepouzdan korisnik, želim pokušati rezervisati slobodan termin, pri čemu moja rezervacija ide na listu čekanja kako bi vlasnik sportskog objekta obavio ručnu provjeru

**Acceptance Criteria:**
- Korisnik dobija jasnu poruku: "Vaša rezervacija zahtijeva odobrenje vlasnika zbog prethodnih prekršaja."
- Vlasnik sportskog objekta dobija hitnu notifikaciju da ima zahtjev na čekanju.
- Vlasnik ima vremenski rok (1 h) da odluči.
- Termin je "blokiran" za druge dok vlasnik ne odbije ovog korisnika.

---

### 21. USER STORY – Biranje omiljenog tima

**ID storyja:** US-21
 
**Naziv storyja:** Biranje omiljenog tima uz registraciju

**Opis:**
Kao navijač, želim opciju registracije, kako bih pored svih navedenih funkcionalnosti koje su dostupne gostu mogao selektovati omiljeni tim, te primati notifikacije o njegovim rezultatima i rasporedu igranja utakmica

**Acceptance Criteria:**
- Sistem mora omogućiti registraciju navijača
- Registrovani korisnik treba imati iste mogućnosti pregleda kao i gost + dodatne opcije biranja omiljenog tima i primanja notifikacija 
- Pored svakog tima koji se nalazi u ligi ima opcija "srce" koja se moze selektovati, da bi to postao vas omiljeni tim 
- Sistem ne smije ograničiti osnovni pregled neregistrovanim korisnicima

### 21.1 USER STORY - Notifikacije za pracenje sadrzaja omiljenog tima

**ID storyja:** US-21
 
**Naziv storyja:** Notifikacije za pracenje sadrzaja omiljenog tima

**Opis:**
Kao navijač koji je selektovao omiljeni tim, zelim opciju  primanja  notifikacija o njegovim rezultatima i rasporedu igranja utakmica

**Acceptance Criteria:**
- Sistem ima poseban dio koji se zove "notifikacije"
- Registrovani korisnik dobija obavjestenja o svom omiljenom timu
- U notifikacijama postoji lista svih sadrzaja vezanih za omiljeni tim
- Opcionalni dolazak notifikacija i na e-mail korisnika 

## 22. USER STORY – Pregled AI predikcije

**ID storyja:** US-22

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


**Veze:** US-13, US-13.1

**Acceptance Criteria:**
- Korisnik može vidjeti AI predikciju za naredne utakmice (pobjednik, rezultat ili vjerovatnoće)
- Korisnik može vidjeti predikciju konačnog poretka lige
- Predikcije su jasno označene kao AI generisane
- Prikaz uključuje osnovno objašnjenje ili faktore (npr. forma tima, prethodni rezultati)
- Sistem omogućava osvježavanje predikcija (npr. nakon novih utakmica ili podataka)
- Pristup je ograničen samo na registrovane korisnike
- UI prikaz je pregledan i razumljiv svim tipovima korisnika

---

### **SPRINT 11** (PB-39, PB-41)

### 23. USER STORY – Administracija sistema

**ID storyja:** US-23
 
**Naziv storyja:** Administracija sistema

**Opis:**
Kao administrator, želim imati potpunu kontrolu nad podacima i stabilnošću sistema, kako bih osigurao ispravan rad platforme, riješio pronađene greške i održavao integritet podataka.
Poslovna vrijednost.

**Poslovna vrijednost:**
- Osigurava stabilnost i pouzdanost sistema za sve korisnike
- Omogućava brzo reagovanje na greške i neispravne podatke
- Povećava povjerenje korisnika u tačnost i sigurnost platforme
- Smanjuje rizik od zloupotrebe ili neispravnog korištenja sistema

**Prioritet:** Srednji

**Pretpostavke:**
- Administrator je prijavljen u sistem
- Administrator ima najviši nivo pristupa u sistemu

**Otvorena pitanja:**
- Da li administrator treba imati uvid u logove svih akcija korisnika?
- Da li postoji mogućnost vraćanja obrisanih podataka (soft delete)?

**Veze:** US-07, US-07.1

**Acceptance Criteria:**
- Sistem mora omogućiti pregled svih ključnih podataka (korisnici, lige, termini)
- Sistem mora ograničiti pristup ovim funkcijama samo administratoru
- Sistem ne smije dozvoliti neautorizovane izmjene podataka
- Administrator treba imati mogućnost uklanjanja neispravnih ili lažnih podataka

### 24. USER STORY – Generisanje PDF izvještaja

**ID storyja:** US-24
 
**Naziv storyja:** Izvoz podataka u PDF formatu

**Opis:**
Kao administrator ili organizator liga, želim da izvezem izvještaje o tabelama, rezultatima i statistikama u PDF formatu, kako bih mogao dijeliti zvanične podatke van sistema ili ih arhivirati.

**Poslovna vrijednost:**
- Olakšava offline arhiviranje sezona i takmičenja
- Omogućava profesionalno dijeljenje rezultata i tabela sa sponzorima, medijima ili timovima
- Povećava transparentnost rada organizatora kroz zvanične dokumente

**Prioritet:** Nizak

**Pretpostavke:**
- Postoje generisani podaci u bazi (rezultati, tabele) koji se mogu izvesti

**Otvorena pitanja:**
- Da li obični korisnici (navijači/treneri) trebaju imati pravo na izvoz tabele ili samo administratori?

**Veze:** US-13, US-23

**Acceptance Criteria:**
- Sistem mora omogućiti generisanje PDF dokumenta jednim klikom na opciju "Izvezi u PDF"
- PDF dokument mora biti pregledan i sadržavati relevantne kolone (pozicija, ime tima, odigrane utakmice, bodovi)
- Dokument mora sadržavati datum i vrijeme generisanja izvještaja
- Sistem mora osigurati da se podaci u PDF-u podudaraju sa trenutnim stanjem na tabeli u aplikaciji






