# Definition of Done (DoD)

## 1. Uvod

Ovaj dokument definiše skup kriterija koje svaka stavka mora zadovoljiti kako bi se smatrala završenom u okviru projekta *Sistem za upravljanje sportskim terminima i ligama*.

Svrha ovog dokumenta je eliminisati nejasnoće oko toga šta znači da je zadatak "gotov", te osigurati da svi članovi tima imaju isto razumijevanje završetka rada.

Ovaj dokument važi za sve stavke u svim sprintovima i koristi se kao kontrolna lista prilikom završetka svakog zadatka.

---

## 2. Svrha dokumenta

Cilj Definition of Done dokumenta je:

- osigurati konzistentan kvalitet implementacije kroz cijeli projekat
- omogućiti svim članovima tima jasno razumijevanje kada je zadatak zaista završen
- spriječiti situacije gdje je funkcionalnost djelimično implementirana ili nedovoljno testirana
- osigurati da svaka stavka zadovoljava i funkcionalne i tehničke zahtjeve
- omogućiti lakšu saradnju i integraciju rada između članova tima
- smanjiti rizik od grešaka i regresija u sistemu

---

## 3. Kriteriji za završetak stavke

Stavka se smatra završenom (**Done**) isključivo kada su svi sljedeći kriteriji definisani u ovom dokumentu u potpunosti ispunjeni:

---

### 1. Funkcionalnost je implementirana

Implementacija stavke je završena u skladu sa opisom i poslovnom vrijednošću definisanom u odgovarajućoj User Story-ji.

To podrazumijeva da:
- su implementirani svi potrebni dijelovi sistema (frontend i backend gdje je primjenjivo)
- funkcionalnost odgovara opisu iz User Story-ja
- funkcionalnost je dostupna odgovarajućim korisničkim ulogama (admin, trener, igrač, vlasnik objekta, gost)
- su poštovana pravila pristupa i autorizacije
- implementacija je usklađena sa postojećom arhitekturom sistema
- funkcionalnost je pravilno integrisana u postojeći sistem bez narušavanja drugih dijelova

---

### 2. Acceptance Criteria su u potpunosti zadovoljeni

Svi acceptance criteria definisani u odgovarajućem User Story-ju su implementirani, testirani i potvrđeni.

To znači da:
- stavka se ne može smatrati završenom bez potpunog ispunjenja acceptance criteria.
- Product Owner ili odgovorni član tima potvrdio je da funkcionalnost odgovara poslovnoj namjeri stavke

---

### 3. Funkcionalnost radi u razvojnom (dev) okruženju

Implementirana funkcionalnost je uspješno pokrenuta i testirana u razvojnom okruženju.

To podrazumijeva da:
- aplikacija se može uspješno buildati bez grešaka
- nema runtime grešaka tokom izvršavanja funkcionalnosti
- funkcionalnost radi stabilno u integraciji sa ostatkom sistema
- podaci se ispravno obrađuju, čuvaju i prikazuju
- sistem se ponaša očekivano u realnim scenarijima korištenja

---

### 4. Stavka je pregledana unutar tima

Stavka je pregledana od strane tima, i to na dva nivoa:

**Pregled koda (Code Review):**
- kod je pregledan od strane najmanje dva člana tima prije integracije u glavni branch
- provjerena je ispravnost implementacije i usklađenost sa zahtjevima stavke
- provjerena je struktura, čitljivost i organizacija koda
- identifikovani su potencijalni problemi, sigurnosni rizici ili loše prakse
- sve primjedbe iz code review-a su riješene prije merge-a

**Pregled funkcionalnosti:**
- implementacija je demonstrirana ili pregledana unutar tima
- tim je potvrdio da stavka odgovara opisanim zahtjevima i poslovnoj namjeri

---

### 5. Testiranje je izvršeno

Funkcionalnost je testirana i potvrđeno je da radi ispravno.

Testiranje uključuje:
- provjeru osnovnih scenarija korištenja (happy path)
- provjeru negativnih scenarija (nevalidni inputi, greške)
- provjeru edge case-ova (duplikati, konflikti termina, ograničenja sistema)
- provjeru da izmjene ne utiču negativno na postojeće funkcionalnosti (regresija)

Svi planirani testovi (unit, integracijski ili ručni) moraju biti uspješno izvršeni bez grešaka.

---

### 6. Performanse su prihvatljive

Implementirana funkcionalnost radi u prihvatljivom vremenskom okviru i ne uvodi performansne probleme u sistem.

To podrazumijeva da:
- učitavanje podataka i odgovori sistema su u prihvatljivom vremenskom okviru
- za kompleksne operacije (rezervacije, generisanje rasporeda, statistike) posebno je provjerena efikasnost logike

---

### 7. Stavka je evidentirana u relevantnim artefaktima

Stavka i sve relevantne promjene su evidentirane u alatima i dokumentaciji projekta.

To podrazumijeva da:
- stavka je označena kao "Done" u Product Backlogu 
- eventualne tehničke odluke ili značajne promjene su dokumentovane 
- test podaci korišteni tokom razvoja su uklonjeni i baza podataka nije zagađena testnim unosima

---

### 8. Sigurnost je provjerena

To podrazumijeva da:
- Implementacija zadovoljava sigurnosne zahtjeve sistema.
- Dodavanje novih funkcionalnosti ili modifikacija postojećeg koda nije narušilo uspostavljene sigurnosne protokole niti stvorilo nove ranjivosti.

---

### 9. UI/UX konzistentnost je osigurana

Korisnički interfejs je konzistentan sa ostatkom aplikacije.

To podrazumijeva da:
- UI komponente su usklađene sa postojećim stilom aplikacije 
- funkcionalnost je dostupna i upotrebljiva za sve predviđene korisničke uloge

---

### 10. Kod je integrisan u glavni branch

Implementacija je uspješno integrisana u zajednički repozitorij projekta.

To podrazumijeva da:
- je razvoj izvršen u posebnoj grani (feature branch)
- izmjene su commitane sa jasnim i smislenim commit porukama
- kod je pushan na udaljeni repozitorij
- merge je izvršen u glavni branch (main) bez konflikata
- kod je dostupan svim članovima tima za dalji razvoj

---


### 11. Tim je obaviješten

Ostali članovi tima su obaviješteni o završetku stavke ukoliko njihov rad zavisi od implementirane funkcionalnosti.

---

### 12. Stavka je spremna za demonstraciju na Sprint Review-u

Implementirana funkcionalnost je demonstrabilna i pripremljena za prikaz na Sprint Review-u.

To podrazumijeva da:
- funkcionalnost se može demonstrirati u razvojnom okruženju bez grešaka
- član tima je u stanju prikazati i objasniti implementiranu funkcionalnost
- nema otvorenih blokatora koji bi spriječili demonstraciju
- funkcionalnost je usklađena sa ciljevima sprinta

---

### 13. Izvršena je završna provjera (Final Review)

Nakon integracije, izvršena je finalna provjera stavke.

To uključuje:
- provjeru rada funkcionalnosti nakon merge-a
- provjeru da nema regresija u sistemu
- provjeru usklađenosti sa ostatkom aplikacije
- potvrdu od strane tima da stavka zadovoljava sve zahtjeve

Tek nakon ove provjere, stavka može biti označena kao završena.

---

## 4. Dodatna pravila

Pored osnovnih kriterija, važe i sljedeća pravila:

- implementacija mora biti jasno povezana sa odgovarajućom stavkom 
- za kompleksne funkcionalnosti (rezervacije, evidencija utakmica, AI predikcije) mora se posebno provjeriti logika i stabilnost sistema
- Definition of Done se ne mijenja tokom aktivnog sprinta; eventualne izmjene se dogovaraju između sprintova

---

## 5. Izuzeci i prilagodbe

U određenim situacijama pojedini kriteriji možda nisu primjenjivi. Tim može odlučiti o izuzetku uz sljedeće uslove:

- **Dokumentacijske stavke** — kriteriji vezani za kod (code review, merge, testiranje) se ne primjenjuju
- **Istraživačke stavke (spike) i prototipovi** — kriteriji kvaliteta koda mogu biti ublaženi uz eksplicitnu saglasnost tima
- **Ostali izuzeci** — tim može glasanjem odlučiti da određeni kriterij nije primjenjiv za konkretnu stavku, uz obaveznu dokumentaciju razloga

---

## 6. Kontrolna lista (Checklist)

Prije nego što se stavka označi kao **Done**, svaki član tima koji završava zadatak treba provjeriti sljedeće:

- [ ] Funkcionalnost je implementirana u skladu sa User Story-jem
- [ ] Svi acceptance criteria su ispunjeni i potvrđeni
- [ ] Funkcionalnost radi stabilno u razvojnom okruženju
- [ ] Testiranje je izvršeno (happy path, negativni scenariji, edge case-ovi, regresija)
- [ ] Performanse su prihvatljive
- [ ] Sigurnosne provjere su zadovoljene
- [ ] UI/UX je konzistentan sa ostatkom aplikacije
- [ ] Stavka je pregledana unutar tima (code review + pregled funkcionalnosti)
- [ ] Kod je integrisan u glavni branch bez konflikata
- [ ] Stavka je evidentirana u relevantnim artefaktima
- [ ] Tim je obaviješten gdje je potrebno
- [ ] Stavka je demonstrabilna i spremna za Sprint Review
- [ ] Završna provjera je izvršena

