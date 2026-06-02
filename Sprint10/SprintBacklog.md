# Sprint Backlog

Ovaj dokument sadrži pregled planiranih i završenih zadataka za Sprint 10, sa fokusom na registraciju navijača, notifikacije i PDF izvještaje.

# Sprint Backlog — Sprint 10

| ID | Veze sa US | Naziv zadatka | Odgovorna osoba | Status | Napomena / Akceptacijski kriterijumi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | US-21 | **Dodavanje omiljenog tima** | Ilma Hindija | Done | Omogućiti navijačima da mogu dodati omiljeni tim |
| **2** | US-22 | **Notifikacije o omiljenom timu** | Maida Biber | Done | Kreirati poseban ekran 'Notifikacije' dostupan isključivo navijačima i omogućiti automatsko kreiranje pri evidentiranju rezultata ili zakazivanju utakmice omiljenog tima|
| **3* | US-23 | **Generisanje PDF dokumenta** | Irma Topčagić, Zeir Mašić | Done | Omogućiti izvoz tabela rezultata i rasporeda u PDF, ograničiti opciju samo na administratora, organizatora i trenera  |

---

#### ID: US-21
#### Naziv: Biranje omiljenog tima uz registraciju
Kao navijač, želim opciju registracije, kako bih pored svih navedenih funkcionalnosti koje su dostupne gostu mogao selektovati omiljeni tim, te primati notifikacije o njegovim rezultatima i rasporedu igranja utakmica.

**Sprint:** 10  
**Prioritet:** Srednji  
**Pretpostavke:** Postoji lista timova u ligi.  
**Veze sa drugim storyjima:** US-22

**Acceptance Criteria**

- Sistem mora omogućiti registraciju navijača
- Registrovani korisnik ima iste mogućnosti pregleda kao gost + biranja omiljenog tima i primanja notifikacija
- Pored svakog tima u ligi postoji ikona "srce" koja se može selektovati kao omiljeni tim
- Sistem ne smije ograničiti osnovni pregled neregistrovanim korisnicima

---

#### ID: US-22
#### Naziv: Notifikacije za praćenje sadržaja omiljenog tima
Kao navijač koji je selektovao omiljeni tim, želim opciju primanja notifikacija o njegovim rezultatima i rasporedu igranja utakmica.

**Sprint:** 10  
**Prioritet:** Srednji  
**Pretpostavke:** Korisnik je registrovan i ima selektovan omiljeni tim.  
**Veze sa drugim storyjima:** US-21

**Acceptance Criteria**

- Sistem ima poseban dio koji se zove "Notifikacije"
- Registrovani korisnik dobija obavještenja o svom omiljenom timu (rezultati, raspored utakmica)
- U notifikacijama postoji lista svih sadržaja vezanih za omiljeni tim
- Opcionalni dolazak notifikacija i na e-mail korisnika

---

#### ID: US-23
#### Naziv: Izvoz podataka u PDF formatu
Kao administrator ili organizator liga, želim da izvezem izvještaje o tabelama, rezultatima i statistikama u PDF formatu, kako bih mogao dijeliti zvanične podatke van sistema ili ih arhivirati.

**Sprint:** 10  
**Prioritet:** Nizak  
**Pretpostavke:** Postoje generisani podaci u bazi (rezultati, tabele) koji se mogu izvesti.  
**Veze sa drugim storyjima:** US-13

**Acceptance Criteria**

- Sistem mora omogućiti generisanje PDF dokumenta jednim klikom na opciju "Izvezi u PDF"
- PDF dokument mora biti pregledan i sadržavati relevantne kolone (pozicija, ime tima, odigrane utakmice, bodovi)
- Dokument mora sadržavati datum i vrijeme generisanja izvještaja
- Sistem mora osigurati da se podaci u PDF-u podudaraju sa trenutnim stanjem na tabeli u aplikaciji