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