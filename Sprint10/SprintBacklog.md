# Sprint Backlog — Sprint 10

Ovaj dokument sadrži pregled planiranih i završenih zadataka za Sprint 10, sa fokusom na dodavanje omiljenih timova, dobijanje notifikacija za navijače, izvoz podataka, upravljanje tabelama termina, otkazivanje rezervacija, te liste čekanja i verifikaciju.

| ID | Veze sa US | Naziv zadatka | Odgovorna osoba | Status | Napomena |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | US-18 | **Tabela termina za Igrače** | Amna Kerla| Done | Implementacija kalendarskog prikaza sa jasnim razdvajanjem individualnih i grupnih treninga u realnom vremenu (Završeno ranije) |
| **2** | US-18.1 | **Tabela termina za Trenere** | Ilma Hindija | Done | Razvoj interfejsa za trenere sa uvidom u timske grupne treninge i brojačem prijavljenih igrača (Završeno ranije) |
| **3** | US-19 | **Sistem za otkazivanje rezervacija** | Maida Biber | Done | Implementacija rute za otkazivanje, potvrdnih modala i kaznenog sistema za otkazivanja unutar 24h (Završeno ranije) |
| **4** | US-20, US-20.1 | **Upravljanje listom čekanja (Zauzet termin)** | Mehdi Zaimović| Done | Razvoj logike "brzog prsta", prijava/odjava sa liste čekanja i slanje notifikacija kada se termin oslobodi (Završeno ranije) |
| **5** | US-20.2 | **Uslovna rezervacija (Lista za verifikaciju)** | Maida Biber, Zeir Mašić, Semir Jamaković | Done | Preusmjeravanje nepouzdanih korisnika na ručnu provjeru, blokiranje termina na 1h i automatsko odbijanje (Završeno ranije) |
| **6** | US-21 | **Dodavanje omiljenog tima** | Ilma Hindija | Done | Omogućiti navijačima da mogu dodati omiljeni tim (Završeno u trenutnoj sedmici) |
| **7** | US-22 | **Notifikacije o omiljenom timu** | Maida Biber | Done | Kreirati poseban ekran 'Notifikacije' dostupan isključivo navijačima i omogućiti automatsko kreiranje pri evidentiranju rezultata ili zakazivanju utakmice omiljenog tima (Završeno u trenutnoj sedmici) |
| **8** | US-23 | **Generisanje PDF dokumenta** | Irma Topčagić, Zeir Mašić | Done | Omogućiti izvoz tabela rezultata i rasporeda u PDF, ograničiti opciju samo na administratora, organizatora i trenera (Završeno u trenutnoj sedmici) |

---

#### ID: US-18
#### Naziv: Pregled stanja na tabeli termina (igrač)
Kao igrač, želim da vidim stanje rasporeda termina u tabeli, kako bih mogao uskladiti privatne obaveze.

**Sprint:** 10  
**Prioritet:** Visok  
**Pretpostavke:** Termini su jasno definisani i prikazani u sistemu. Individualni termini igrača su također dostupni korisniku u tabeli.  
**Veze sa drugim storyjima:** US-10

**Acceptance Criteria**
- Kada igrač pristupi tabeli, sistem mora prikazati sve dostupne termine.
- Sistem mora prikazati listu svih rezervisanih termina korisnika.
- Sistem posjeduje jasno označene individualne i grupne termine.
- Igrač vidi: svoje individualne termine i grupne treninge na koje je prijavljen.
- Sistem mora omogućiti pregled po datumu i vremenu.
- Korisnik treba dobiti ažurne informacije o rasporedu u realnom vremenu.
- Sistem ne smije prikazivati zastarjele ili netačne podatke.

---

#### ID: US-18.1
#### Naziv: Pregled stanja na tabeli termina (trener)
Kao trener, želim da vidim stanje rasporeda termina u tabeli, kako bih mogao organizovati termin koji svima odgovara.

**Sprint:** 10  
**Prioritet:** Visok  
**Pretpostavke:** Termini su jasno definisani i prikazani u sistemu.  
**Veze sa drugim storyjima:** US-10

**Acceptance Criteria**
- Kada trener pristupi tabeli, sistem mora prikazati sve dostupne termine.
- Sistem mora prikazati listu svih rezervisanih termina korisnika.
- Sistem posjeduje jasno označene individualne i grupne termine.
- Trener vidi: grupne treninge (za tim) i tačan broj prijavljenih igrača.
- Sistem mora omogućiti pregled po datumu i vremenu.
- Korisnik treba dobiti ažurne informacije o rasporedu u realnom vremenu.
- Sistem ne smije prikazivati zastarjele ili netačne podatke.

---

#### ID: US-19
#### Naziv: Otkazivanje rezervacije individualnih/grupnih termina
Kao registrovani korisnik (Igrač/Trener), želim otkazati rezervisani termin, kako bih oslobodio termin drugima ako sam spriječen doći.

**Sprint:** 10  
**Prioritet:** Visok  
**Pretpostavke:** Korisnik ima aktivnu rezervaciju u sistemu.  
**Veze sa drugim storyjima:** US-16, US-17

**Acceptance Criteria**
- Kada korisnik pristupi svojim rezervacijama, sistem mora prikazati listu predstojećih termina sa opcijom “Otkaži”.
- Prije konačnog otkazivanja, sistem mora prikazati notifikaciju sa pitanjem “Da li ste sigurni da želite otkazati ovaj termin?”.
- Nakon potvrde otkazivanja, sistem mora automatski poslati notifikaciju vlasniku objekta i korisnicima na listi čekanja.
- Odmah nakon otkazivanja, status termina u javnom kalendaru se mora promijeniti iz “Zauzeto” u “Slobodno”.
- Korisnik treba dobiti vizuelnu potvrdu da je rezervacija uspješno poništena.
- Ako korisnik otkaže termin unutar nedozvoljenog vremenskog okvira (manje od 24h prije početka), sistem to evidentira kao prekršaj.
- Nakon 3 evidentirana prekršaja, sistem automatski dodaje korisnika na listu nepouzdanih korisnika vlasniku objekta.
- Korisnik dobija notifikaciju da je dodan na listu nepouzdanih korisnika i iz kog tačno razloga.

---

#### ID: US-20
#### Naziv: Upravljanje zahtjevima na čekanju
Kao sistem, želim omogućiti funkcionalnost "čekanja" za termine koji nisu odmah dostupni za automatsku potvrdu (bilo zbog zauzetosti termina ili zbog potrebe za ručnom provjerom korisnika), kako bi se osigurala maksimalna popunjenost i sigurnost objekta.

**Sprint:** 10  
**Prioritet:** Visok  
**Veze sa drugim storyjima:** US-19

**Acceptance Criteria**
- Sistem mora razlikovati dvije vrste čekanja: listu čekanja za popunjen termin i listu za ručnu verifikaciju.
- Korisnik mora dobiti povratnu informaciju o statusu svog zahtjeva u realnom vremenu.
- Svaka promjena statusa na čekanju mora generisati notifikaciju relevantnim stranama (vlasnik/korisnik).

---

#### ID: US-20.1
#### Naziv: Prijava na listu čekanja za zauzet termin
Kao korisnik (Igrač/Trener), želim da se prijavim na listu čekanja za već zauzet termin, kako bih bio obaviješten ako se taj termin oslobodi.

**Sprint:** 10  
**Prioritet:** Visok  
**Veze sa drugim storyjima:** US-19, US-20

**Acceptance Criteria**
- Kada korisnik vidi termin koji je "Zauzet", sistem mora ponuditi opciju "Prijavi me na listu čekanja".
- Sistem mora badminton/evidentirati korisnika na listu za taj specifičan termin i datum.
- Kada se taj termin otkaže, sistem šalje notifikaciju svim korisnicima sa liste čekanja.
- Sistem ne smije automatski rezervisati termin, već omogućiti korisnicima sa liste da ga sami prvi rezervišu po principu "brzog prsta".
- Korisnik treba imati mogućnost da se jednostavno ukloni sa liste čekanja ako mu termin više nije potreban.

---

#### ID: US-20.2
#### Naziv: Uslovna rezervacija za nepouzdane korisnike
Kao nepouzdan korisnik (korisnik sa historijom prekršaja), želim pokušati rezervisati slobodan termin, pri čemu moja rezervacija ide na listu čekanja kako bi vlasnik sportskog objekta obavio ručnu provjeru.

**Sprint:** 10  
**Prioritet:** Visok  
**Veze sa drugim storyjima:** US-20

**Acceptance Criteria**
- Kada korisnik sa liste nepouzdanih pokuša rezervaciju, sistem je ne potvrđuje automatski već je šalje u sekciju "Na čekanju".
- Korisnik dobija jasnu poruku: "Vaša rezervacija zahtijeva odobrenje vlasnika zbog prethodnih prekršaja."
- Vlasnik sportskog objekta dobija hitnu notifikaciju da ima novi zahtjev koji čeka ručnu provjeru.
- Vlasnik ima vremenski rok od 1h da odluči o zahtjevu (Odobri/Odbij).
- Termin je privremeno "blokiran" za druge dok vlasnik ne donese odluku ili dok ne istekne 1h (nakon čega sistem kroz pozadinski posao automatski odbija zahtjev).

---

#### ID: US-21
#### Naziv: Biranje omiljenog tima uz registraciju
Kao navijač, želim opciju registracije, kako bih pored svih navedenih funkcionalnosti koje su dostupne gostu mogao selektovati omiljeni tim, te primati notifikacije o njegovim rezultatima i rasporedu igranja utakmica.

**Sprint:** 10  
**Prioritet:** Srednji  
**Pretpostavke:** Postoji lista timova u ligi.  
**Veze sa drugim storyjima:** US-22

**Acceptance Criteria**
- Sistem mora omogućiti registraciju navijača.
- Registrovani korisnik ima iste mogućnosti pregleda kao gost + biranja omiljenog tima i primanja notifikacija.
- Pored svakog tima u ligi postoji ikona "srce" koja se može selektovati kao omiljeni tim.
- Sistem ne smije ograničiti osnovni pregled neregistrovanim korisnicima.

---

#### ID: US-22
#### Naziv: Notifikacije za praćenje sadržaja omiljenog tima
Kao navijač koji je selektovao omiljeni tim, želim opciju primanja notifikacija o njegovim rezultatima i rasporedu igranja utakmica.

**Sprint:** 10  
**Prioritet:** Srednji  
**Pretpostavke:** Korisnik je registrovan i ima selektovan omiljeni tim.  
**Veze sa drugim storyjima:** US-21

**Acceptance Criteria**
- Sistem ima poseban dio koji se zove "Notifikacije".
- Registrovani korisnik dobija obavještenja o svom omiljenom timu (rezultati, raspored utakmica).
- U notifikacijama postoji lista svih sadržaja vezanih za omiljeni tim.
- Opcionalni dolazak notifikacija i na e-mail korisnika.

---

#### ID: US-23
#### Naziv: Izvoz podataka u PDF formatu
Kao administrator ili organizator liga, želim da izvezem izvještaje o tabelama, rezultatima i statistikama u PDF formatu, kako bih mogao dijeliti zvanične podatke van sistema ili ih arhivirati.

**Sprint:** 10  
**Prioritet:** Nizak  
**Pretpostavke:** Postoje generisani podaci u bazi (rezultati, tabele) koji se mogu izvesti.  
**Veze sa drugim storyjima:** US-13

**Acceptance Criteria**
- Sistem mora omogućiti generisanje PDF dokumenta jednim klikom na opciju "Izvezi u PDF".
- PDF dokument mora biti pregledan i sadržavati relevantne kolone (pozicija, ime tima, odigrane utakmice, bodovi).
- Dokument mora sadržavati datum i vrijeme generisanja izvještaja.
- Sistem mora osigurati da se podaci u PDF-u podudaraju sa trenutnim stanjem na tabeli u aplikaciji.
