# Product Backlog - Sistem za upravljanje sportskim terminima i ligama

Ovaj dokument sadrži listu stavki koje je potrebno završiti u okviru projekta. Backlog je živi dokument i mijenja se tokom trajanja projekta.

---

### Legenda

**Prioritet:** Visok / Srednji / Nizak

**Procjena složenosti:** S (1-2 dana) / M (3-5 dana) / L (1-2 sedmice)

**Status:** To-Do / In Progress / Testing / Done

**Tipovi stavki:** Feature / Bug / Technical Task / Research / Documentation

**ID konvencija:** PB-[broj]

---

| ID | Naziv stavke | Kratak opis | Tip | Prioritet | Procjena | Status | Sprint | Napomena |
|----|-------------|-------------|-----|-----------|----------|--------|--------|----------|
| PB-01 | Definisati Team Charter | Izrada dokumenta koji definiše članove tima, uloge, pravila rada i komunikacije | Documentation | Visok | S | Done | Sprint 1 | - |
| PB-02 | Definisati Product Vision | Izrada dokumenta koji opisuje problem, ciljne korisnike, vrijednost sistema i MVP scope | Documentation | Visok | M | Done | Sprint 1 | - |
| PB-03 | Definisati Stakeholder Map | Identifikacija i mapiranje svih zainteresovanih strana, njihovih interesa i uticaja na sistem | Research | Visok | S | Done | Sprint 1 | - |
| PB-04 | Definisati početni Product Backlog | Izrada početne liste stavki s opisima, tipovima i prioritetima | Documentation | Visok | M | Done | Sprint 1 | Backlog se mijenja tokom projekta |
| PB-05 | Izraditi User Stories | Pisanje User Stories za sve prioritetne funkcionalnosti sistema, iz perspektive korisnika | Documentation | Visok | S | To-Do | Sprint 2 | Format: Kao [uloga], želim [akcija], kako bih [cilj] |
| PB-06 | Definisati Acceptance Criteria | Za svaku user story definisati jasne kriterije prihvatanja | Documentation | Visok | S | To-Do | Sprint 2 | Kriteriji moraju biti provjerljivi i mjerljivi  |
| PB-07 | Prioritizacija backlog stavki | Rangiranje stavki prema važnosti za MVP i poslovnu vrijednost | Research | Visok | S | To-Do | Sprint 2 | - |
| PB-08 | Definisati početne NFR zahtjeve | Izrada početne liste nefunkcionalnih zahtjeva (performanse, sigurnost, skalabilnost) | Documentation | Srednji | S | To-Do | Sprint 2 | - |
| PB-09 | Izraditi Risk Register | Identifikacija i procjena rizika projekta | Documentation | Srednji | M | To-Do | Sprint 3 | - |
| PB-10 | Izraditi Domain Model | Modeliranje ključnih entiteta sistema i njihovih međusobnih odnosa | Research | Visok | M | To-Do | Sprint 3 | - |
| PB-11 | Izraditi Use Case Model | Dijagrami slučajeva upotrebe  za ključne funkcionalnosti sistema | Documentation | Visok | M | To-Do | Sprint 3 | - |
| PB-12 | Izraditi Architecture Overview | Definisanje osnovnog arhitektonskog pravca sistema (tehnologije, slojevi, komunikacija) | Technical Task | Visok | L | To-Do | Sprint 3 | Arhitektura mora proizlaziti iz zahtjeva |
| PB-13 | Definisati Test Strategy | Izrada strategije testiranja sistema (šta, kako i kada se testira) | Documentation | Srednji | M | To-Do | Sprint 3 | - |
| PB-14 | Definisati Definition of Done | Izrada dokumenta koji definiše kada se stavka smatra završenom | Documentation | Nizak | S | To-Do | Sprint 4 | - |
| PB-15 | Postaviti tehnički skeleton | Kreiranje osnovne strukture projekta (folderi, konfiguracija, osnovna arhitektura) | Technical Task | Visok | L | To-Do | Sprint 4 | - |
| PB-16 | Setup razvojnog okruženja | Postavljanje razvojnog i produkcijskog servera te automatizacija objave (CI/CD) | Technical Task | Visok | M | To-Do | Sprint 4 | - |
| PB-17 | Dizajn baze podataka | Definisanje ER dijagrama i relacija između entiteta sistema | Technical Task | Visok | L | To-Do | Sprint 4 | Mora biti urađeno prije početka implementacije|
| PB-18 | API dokumentacija | Definisanje ruta i formata podataka | Technical Task | Srednji | M | To-Do | Sprint 4 | Radi olakšanja implementacije|
| PB-19 | Uspostaviti AI Usage Log i Decision Log| Kreirati Decision log dokument koji se koristi za evidentiranje važnih projektnih odluka, kao i AI Usage Log dokument u kojem se evidentira upotreba AI alata | Documentation | Visok | S | To-Do | Sprint 5 | - |
| PB-20 | Implementirati registraciju korisnika | Korisnik može kreirati nalog unosom osnovnih podataka (ime, email, lozinka) | Feature | Visok | M | To-Do | Sprint 5 | - |
| PB-21 | Implementirati prijavu i odjavu | Autentifikacija korisnika putem emaila i lozinke, te odjava sa sistema | Feature | Visok | S | To-Do | Sprint 5 | - |
| PB-22 | Implementirati sistem permisija | Tehnička implementacija dozvola za svaku ulogu korisnika | Technical Task | Visok | L | To-Do | Sprint 5 | - |
| PB-23 | Sigurnosni protokoli | Zaštita ruta, enkripcija lozinki i zaštita privatnih podataka | Technical Task | Visok | M | To-Do | Sprint 6 | - |
| PB-24 | Implementirati upravljanje ligama | Omogućiti kreiranje, uređivanje i brisanje liga u odnosu na prethodno definisane permisije | Feature | Visok | M | To-Do | Sprint 6 | - |
| PB-25 | Implementirati upravljanje timovima | Organizator dodaje, uređuje i briše timove te ih povezuje sa ligama | Feature | Visok | M | To-Do | Sprint 6 | - |
| PB-26 | Implementirati prijavu ekipa | Trener prijavljuje ekipu na ligu ili turnir | Feature | Srednji | M | To-Do | Sprint 6 | - |
| PB-27 | Implementirati kreiranje rasporeda | Omogućiti organizatoru da kreira raspored utakmica s datumom, vremenom i lokacijom | Feature | Visok | M | To-Do | Sprint 7 | - |
| PB-28 | Implementirati javni pregled i filtriranje | Omogućiti svim korisnicima (uključujući goste) pregled rasporeda, rezultata i tabela uz filtriranje po ligi, timu i datumu. | Feature | Visok | S | To-Do | Sprint 7 | Ne zahtijeva login (US-05.1) |
| PB-29 | Implementirati unos rezultata | Odgovorni unosi rezultate odigranih utakmica | Feature | Visok | S | To-Do | Sprint 8 | - |
| PB-30 | Implementirati automatsku tabelu | Nakon unosa rezultata sistem automatski ažurira tabelu i bodove | Feature | Visok | L | To-Do | Sprint 8 | - |
| PB-31 | Implementirati upravljanje objektima | Vlasnici unose i ažuriraju dostupnost svojih terena i dvorana | Feature | Srednji | M | To-Do | Sprint 9 | - |
| PB-32 | Implementirati rezervaciju termina | Omogućiti korisniku da pošalje zahtjev za rezervaciju termina | Feature | Srednji | M | To-Do | Sprint 9 | - |
| PB-33 | Implementirati proces potvrde termina | Omogućiti vlasniku objekta da odobri ili odbije zahtjev za rezervaciju, uz automatsku promjenu statusa termina | Feature | Srednji | L | To-Do | Sprint 9 | - |
| PB-34 | Validacija podataka | Sprečavanje unosa netačnih podataka u svim formama sistema | Technical Task | Visok | M | To-Do | Sprint 9 | - |
| PB-35 | Implementirati sistem obavještenja | Automatizovane notifikacije o rezultatima i tabelama za navijače (o  timu za koji navijaju) i igrače (o timu za koji igraju), te notifikacije igračima i trenerima o potvrdi, podsjetniku ili promjeni zauzetosti termina za rezervacije treninga. | Feature | Srednji | L | To-Do | Sprint 10 | - |
| PB-36 | Implementirati odabir omiljenog tima | Omogućiti registrovanim navijačima odabir omiljenog tima| Feature | Visok | S | To-Do | Sprint 10 | Osnova za personalizovane notifikacije |
| PB-37 | Implementirati AI predikciju rezultata i poretka na tabeli | Na osnovu prijašnjih rezultata i trenutne forme timova sistem generiše predikciju ishoda narednih utakmica i konačnog poretka lige | Feature | Srednji | L | To-Do | Sprint 10 | Predikcija nema uticaj na stvarne rezultate i služi kao informativni prikaz |
| PB-38| Responzivni UI dizajn | Optimizacija fronteda za mobilne uređaje i različite veličine ekrana | Technical Task | Nizak | L | To-Do | Sprint 10 | Web-first pristup |
| PB-39| PDF izvoz tabela i rasporeda | Omogućiti korisnicima izvoz tabela, rasporeda i statistika u PDF format | Feature | Nizak | M | To-Do | Sprint 11 | Nije prioritetno za MVP |
| PB-40 | Testiranje sistema | Pisanje i izvršavanje unit testova za ključne funkcionalnosti | Technical Task | Visok | L | To-Do | Sprint 11 | - |



> **Napomena:** Ovaj dokument predstavlja primarni izvor zahtjeva. Počevši od Sprinta 5, tim će za svaki razvojni ciklus kreirati specifičan Sprint Backlog koji će sadržavati tehničke pod-zadatke (sub-tasks) i precizna zaduženja članova tima. Product Backlog će se redovno revidirati.
