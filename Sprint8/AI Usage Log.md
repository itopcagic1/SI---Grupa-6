# AI Usage Log - Sprint 8

---

## Zapis 1

**Datum:** 17.05.2026.

**Sprint broj:** 8

**Alat koji je korišten:** Gemini (Antigravity)

**Svrha korištenja:**
Pomoć pri implementaciji backend logike i rute za evidenciju rezultata utakmica (US-12).

**Kratak opis zadatka ili upita:**
Tražena pomoć oko optimalne strukture `resultController.js` fajla, konkretno najboljeg načina za ažuriranje `PlasmanNaTabeli` i dodjeljivanja bodova prilikom unosa rezultata, te savjeti oko pisanja testova.

**Šta je AI predložio ili generisao:**
- Predložio strukturu za `kreirajRezultat` i `azurirajRezultat` funkcije.
- Dao primjer "helper" funkcije za sabiranje bodova (3 za pobjedu, 1 za remi).
- Generisao kostur Unit testova za kontroler korištenjem mockovanog Prisma klijenta.

**Šta je tim prihvatio:**
- Osnovnu arhitekturu predloženih funkcija i način sabiranja bodova.
- Pristup testiranju kontrolera bez podizanja stvarne baze (mocking).

**Šta je tim izmijenio:**
- Rute su ručno prilagođene kako bi se slagale s postojećim konvencijama u `matchRoutes.js`.
- Značajno je prerađena i pojačana logika za provjeru autorizacije (Guard) kako bi se osiguralo da isključivo organizator dotičnog takmičenja može unositi rezultate.

**Šta je tim odbacio:**
- Generisane dijelove koda koji nisu pratili ranije postavljene sigurnosne i arhitektonske standarde aplikacije.

**Rizici, problemi ili greške koje su uočene:**
- Prilikom davanja prijedloga, AI nije pravilno uključio provjeru povlačenja atributa `organizatorId` iz baze, što je onemogućilo validaciju rola na frontendu (kasnije ručno uočeno i ispravljeno).

**Ko je koristio alat:**
Ilma Hindija

---

## Zapis 2

**Datum:** 17.05.2026.

**Sprint broj:** 8

**Alat koji je korišten:** Gemini (Antigravity)

**Svrha korištenja:**
Pomoć pri UI/UX dizajnu i implementaciji frontend modala za unos rezultata u `Raspored.jsx`.

**Kratak opis zadatka ili upita:**
Tražena ideja kako najbezbolnije integrisati opciju za unos rezultata na postojećoj stranici Raspored, uz Tailwind klase za modalni prozor i state menadžment.

**Šta je AI predložio ili generisao:**
- Tailwind CSS styling za centrirani modal i dizajn bedževa ("Čeka unos", "Uneseno").
- Prijedlog React Hookova (`useState`) za držanje podataka iz forme.
- Koncept kako asinhrono pozvati API i zatvoriti modal na uspješan odgovor.

**Šta je tim prihvatio:**
- Vizuelni Tailwind dizajn modala (sa laganim izmjenama).
- Upotrebu jednostavnog lokalnog state-a unutar komponente.

**Šta je tim izmijenio:**
- UI je prerađen kako bi se uklopio u primarne boje aplikacije.
- Ubačena je klijentska logika koja prikazuje ili sakriva dugmad ovisno o JSON objektu trenutno prijavljenog korisnika i njegovoj ulozi.

**Šta je tim odbacio:**
- Kompleksna rješenja sa dodatnim context provajderima, radije birajući jednostavniji prop-drilling ili lokalni state unutar same `Raspored.jsx` komponente.

**Rizici, problemi ili greške koje su uočene:**
- AI je u jednom trenutku predložio API URL u `tabelaApi.js` fajlu kojem je nedostajao obavezni sufiks `/api`, zbog čega je dolazilo do `404` mrežnih grešaka tokom testiranja.

**Ko je koristio alat:**
Ilma Hindija
