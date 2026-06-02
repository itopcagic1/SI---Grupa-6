# Sprint 9 - Sprint Review Summary

**Tema diskusije:** Review realizovanih funkcionalnosti i unapređenja sistema
**Prisutni:** Članovi tima, Asistent

Tokom Sprint 9 Review sastanka asistent je izvršio pregled implementiranih funkcionalnosti i demonstraciju sistema. Sve planirane funkcionalnosti su uspješno realizovane i prezentovane. Asistent nije imao primjedbi niti zahtjeva za izmjenama, a tim je uspješno demonstrirao napredak ostvaren tokom sprinta.

## Šta je išlo dobro / Pohvale:

### 1. Uspješna realizacija svih planiranih zadataka

* **Pohvala:** Sve funkcionalnosti planirane za Sprint 9 su implementirane i uspješno demonstrirane. Sprint cilj je ostvaren bez većih poteškoća.

---

### 2. Stabilnost i funkcionalnost sistema

* **Pohvala:** Sistem je tokom demonstracije radio stabilno i bez grešaka. Sve funkcionalnosti su se ponašale u skladu sa očekivanjima.

---

### 3. Kvalitetna prezentacija rezultata

* **Pohvala:** Prezentacija implementiranih funkcionalnosti bila je jasna i organizovana, što je omogućilo jednostavan pregled napretka projekta.

---

## Šta treba izmijeniti / Šta nije bilo dobro:

Tim je tokom testiranja i korištenja aplikacije identifikovao nekoliko funkcionalnih nedostataka koje je bilo potrebno unaprijediti.

### 1. Nedostajala početna tabela nakon generisanja lige

* Nakon generisanja rasporeda lige nije postojala početna tabela sa nuliranim vrijednostima za sve timove.
* **Rješenje:** Dodano automatsko kreiranje početne tabele u kojoj su svi statistički podaci inicijalizovani na nulu.

---

### 2. Nedovoljna preglednost rasporeda i rezultata utakmica

* Korisnici nisu imali mogućnost direktnog pregleda rasporeda i rezultata utakmica iz prikaza tabele lige.
* **Rješenje:** Dodana opcija **"Prikaži raspored / Sakrij raspored"** koja omogućava prikaz rasporeda i rezultata utakmica direktno ispod tabele lige.

---

### 3. Neadekvatno generisanje termina utakmica

* Prilikom generisanja termina utakmica nije se vodilo računa o vremenskom razmaku između utakmica koje se igraju istog dana.
* **Rješenje:** Implementirano pravilo koje osigurava minimalni razmak od dva sata između utakmica zakazanih za isti datum.

---

### 4. Komplikovan proces brisanja liga

* Administrator nije mogao direktno obrisati ligu ukoliko su za nju postojale povezane utakmice.
* **Rješenje:** Implementirano automatsko kaskadno brisanje svih povezanih utakmica prilikom brisanja lige, čime je pojednostavljen administratorski proces.

---

### 5. Neažuriranje tabele nakon unosa rezultata

* Tabela se nije ažurirala nakon završetka pojedinačne utakmice, već tek nakon završetka kompletnog kola.
* **Rješenje:** Implementirano automatsko ažuriranje tabele odmah nakon unosa rezultata utakmice. Timovi se trenutno rerangiraju prema osvojenim bodovima, broju pobjeda, poraza i ostalim relevantnim statistikama.

---

### 6. Nepovezanost statistike lige i statistike timova

* Statistički podaci na nivou lige i statistike pojedinačnih timova nisu bili međusobno povezani, što je moglo dovesti do nekonzistentnih prikaza podataka.
* **Rješenje:** Povezane su statistike lige i statistike timova kako bi svi prikazi koristili jedinstven i konzistentan izvor podataka.

---

## Akcioni plan za naredni sprint:

1. Nastaviti sa implementacijom preostalih funkcionalnosti definisanih Product Backlogom.
2. Fokusirati se na dodatno testiranje poslovne logike i integraciju svih modula sistema.
3. Nastaviti unapređivati korisničko iskustvo i preglednost interfejsa.
4. Pripremiti sistem za završnu fazu razvoja i konačnu evaluaciju projekta.
