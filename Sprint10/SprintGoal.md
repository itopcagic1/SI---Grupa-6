# Sprint Goal — Sprint 10

## Ciljevi sprinta

Cilj sprinta 10 je unapređenje korisničkog iskustva za registrovane navijače kroz personalizaciju sadržaja, što obuhvata odabir omiljenih timova i automatsko primanje notifikacija o njihovim rezultatima i rasporedu utakmica. Pored toga, cilj je proširenje administrativnih mogućnosti sistema kroz implementaciju robusnog podsistema za generisanje i preuzimanje zvaničnih PDF izvještaja (tabela, rezultata i rasporeda utakmica) prilagođenih ulogama administratora, organizatora i trenera.

---

## Ključne stavke koje tim želi završiti

### 1. Dodavanje omiljenog tima 
- Omogućavanje registrovanim korisnicima sa ulogom `NAVIJAC` da selektuju omiljeni tim pomoću interaktivne ikone srca na stranici Timovi.
- Prikaz liste odabranih omiljenih timova u lijevoj koloni profila korisnika ispod aktivnih angažmana sa opcijom brzog uklanjanja.
- Implementacija backend podrške (Prisma model `OmiljeniTim`) i zaštita ruta kako bi ova opcija bila restriktovana isključivo na ulogu navijača.

### 2. Notifikacije o omiljenom timu 
- Kreiranje posebnog ekrana "Notifikacije" u korisničkom interfejsu (dostupnog preko zvona u navigaciji) za pregled svih obavještenja vezanih za omiljene timove.
- Implementacija backend logike koja automatski generiše notifikaciju za navijače kada se unese rezultat ili zakaže nova utakmica za njihov omiljeni tim.
- Omogućavanje označavanja pojedinačnih obavijesti kao pročitane, kao i opcije masovnog označavanja ("Onači sve kao pročitano").

### 3. Generisanje PDF dokumenta 
- Implementacija backend servisa (korištenjem PDFKit-a) za dinamičko generisanje i izvoz tabela plasmana, rezultata i rasporeda utakmica u PDF format.
- Dodavanje dugmeta "Izvezi u PDF" na stranicama tabela, rezultata i rasporeda, uz uvođenje autorizacije koja opciju prikazuje i dopušta samo ulogama administratora, organizatora i trenera.
- Poboljšanje korisničkog iskustva kroz zamjenu standardnih pretraživačkih `alert()` poruka prilagođenim modalnim prozorima za greške i loading stanjima dugmeta.

---

## Rizici i zavisnosti

### Rizici
- **Nedostatak podrške za Unicode znakove u PDF-u (Afrikate):** PDFKit-ov podrazumijevani Helvetica font ne podržava karaktere poput č, ć, š, ž, đ. Rješava se privremenim izostavljanjem podrške za ove znakove do narednih iteracija radi prenosivosti sistema bez eksternih zavisnosti.
- **Upravljanje Prisma compound unique constraint-om:** Model `OmiljeniTim` koristi kompozitni ključ `korisnikId_timId` koji zahtijeva tačnu Prisma sintaksu za `findUnique` i `delete` operacije kako bi se izbjeglo pucanje baze ili dupliranje zapisa.
- **Prikaz i autorizacija na frontendu:** Osiguravanje da neautorizovani korisnici (gosti i igrači) nemaju pristup PDF izvozu, niti opciji omiljenih timova, što zahtijeva pažljivo uslovno renderovanje i middleware zaštitu.

### Zavisnosti
- **Zadatak 2 (Notifikacije) ovisi o Zadatku 1 (Omiljeni tim):** Navijači ne mogu dobijati obavijesti ukoliko nemaju definisan mehanizam za odabir i spašavanje omiljenog tima u bazi podataka.
- **Zadatak 2 (Notifikacije) ovisi o modulima utakmica i rezultata:** Automatsko okidanje notifikacija zahtijeva integraciju sa postojećim servisima za unos rezultata i zakazivanje utakmica iz prethodnih sprinteva.
- **Zadatak 3 (PDF izvoz) ovisi o stabilnosti baze podataka i postojećim tabelama:** Generisanje PDF dokumenata direktno zavisi od tačnosti podataka o ligama, timovima, utakmicama i rezultatima.
