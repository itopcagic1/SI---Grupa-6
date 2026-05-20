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

---

## Zapis 3

**Datum:** 19.05.2026.

**Sprint broj:** 8

**Alat koji je korišten:** OpenAI Codex / ChatGPT

**Svrha korištenja:**
Pomoć pri proširenju sistema statistike utakmica i validacije za više sportova (US-12 i US-12.1), uključujući frontend i backend logiku te testiranje.

**Kratak opis zadatka ili upita:**
Tražena pomoć oko proširenja postojećeg sistema statistike koji je prvobitno bio fokusiran na fudbal, kako bi podržavao više sportova (košarka, odbojka, tenis, rukomet, hokej na ledu i plivanje), uz zadržavanje postojeće arhitekture i validacija. Također traženi prijedlozi za logička ograničenja statistike (kartoni, poeni, golovi, posjed lopte i slično), kao i pomoć pri pisanju i ažuriranju testova.

**Šta je AI predložio ili generisao:**
- Prijedloge sport-specifičnih tipova statistike za igrače i timove.
- Prijedloge validacija i ograničenja za statistiku (npr. broj kartona, zbir poena/golova, validacija posjeda lopte).
- Proširenje postojećeg consistency validation servisa bez izmjene postojećeg API-ja i Prisma schema modela.
- Frontend prilagodbe za dinamičko generisanje statističkih polja po sportu.
- Ažuriranja i proširenja unit i integration testova za backend i frontend statistiku.
- `.env.example` template fajlove za lakši lokalni setup projekta.

**Šta je tim prihvatio:**
- Većinu prijedloga vezanih za validaciju statistike i organizaciju sport-specifičnih tipova statistike.
- Pristup proširenju postojećeg sistema bez velikih arhitektonskih promjena.
- Veći dio prijedloga za testiranje i pokrivanje edge-case scenarija.

**Šta je tim izmijenio:**
- Ručno su pregledani i prilagođeni predloženi tipovi statistike kako bi odgovarali postojećem modelu aplikacije.
- Dodatno su provjerene validacije između timske i igračke statistike radi očuvanja konzistentnosti podataka.
- Prilagođeni su frontend prikazi i formatiranje vrijednosti kako bi se uklopili u postojeći UI aplikacije.

**Šta je tim odbacio:**
- Prijedloge koji bi zahtijevali značajne promjene baze podataka ili postojeće API strukture.
- Kompletnu reorganizaciju toka unosa statistike (npr. striktni višekoračni unos timske pa igračke statistike).

**Rizici, problemi ili greške koje su uočene:**
- Tokom implementacije bilo je potrebno dodatno prilagoditi pojedine validacije kako bi ostala kompatibilnost sa starim testovima i postojećim fixture podacima.
- AI inicijalno nije mogao izvršiti pune test suite-ove bez lokalno instaliranih dependencies paketa, pa su testovi naknadno ručno pokrenuti i verificirani.

**Ko je koristio alat:**
Mehdi Zaimović

---

## Zapis 4

**Datum:** 19.05.2026.

**Sprint broj:** 8

**Alat koji je korišten:** Claude Sonnet 4.6

**Svrha korištenja:**
Pomoć pri implementaciji i testiranju stranica za statistiku timova, statistiku igrača i top strijelce, kao i povezivanju backend statistike sa frontend prikazima.

**Kratak opis zadatka ili upita:**
Tražena pomoć oko organizacije i generisanja testova za statističke prikaze, te povezivanja API poziva i backend podataka sa frontend stranicama za prikaz statistike.

**Šta je AI predložio ili generisao:**
- Primjere i prijedloge testova za statistiku timova, statistiku igrača i top strijelce.
- Prijedloge za povezivanje backend endpointa sa frontend komponentama.
- Primjere dohvaćanja i prikaza statističkih podataka kroz postojeću frontend arhitekturu.

**Šta je tim prihvatio:**
- Veći dio prijedloga za testove statistike.
- Osnovni pristup povezivanju backend statistike sa frontend stranicama.

**Šta je tim izmijenio:**
- Ručno su prilagođeni pojedini API pozivi i mapiranje podataka kako bi odgovarali postojećoj strukturi aplikacije.
- Prilagođeni su frontend prikazi i nazivi statističkih kategorija za više sportova.

**Šta je tim odbacio:**
- Dijelove prijedloga koji nisu bili kompatibilni sa postojećom organizacijom frontend komponenti.

**Rizici, problemi ili greške koje su uočene:**
- Pojedini prijedlozi inicijalno nisu pravilno obrađivali nedostajuće statističke vrijednosti (`null` / `undefined`), što je naknadno ručno ispravljeno.

**Ko je koristio alat:**
Amna Kerla

## Zapis 5

**Datum:** 16.05.2026.

**Sprint broj:** 8

**Alat koji je korišten:** Claude Sonnet 4.6

**Svrha korištenja:**
Pomoć pri implementaciji leaderboard tabele (US-13) – backend servis, controller, rute i frontend stranica.

**Kratak opis zadatka ili upita:**
Tražena pomoć oko kompletne implementacije `GET /api/takmicenja/:id/tabela` endpointa sa sortiranjem i agregacijom gol-razlike, te React komponente za prikaz tabele sa sortiranjem i vizualnim isticanjem top 3 mjesta.

**Šta je AI predložio ili generisao:**
- Kompletnu strukturu `tabelaService.js`, `tabelaController.js` i `tabelaRoutes.js`.
- React komponentu `Tabela.jsx` usklađenu sa postojećim stilom aplikacije (Tailwind, amber boje).
- `tabelaApi.js` za komunikaciju sa backendom.

**Šta je tim prihvatio:**
- Osnovnu arhitekturu servisa i controllera.
- Vizualni dizajn tabele sa medalijama i sortiranjem.

**Šta je tim izmijenio:**
- Ispravljen API URL u `tabelaApi.js` zbog duplog `/api` prefiksa koji je uzrokovao 404 greške na produkciji.
- Prilagođen axios import pattern prema postojećoj strukturi projekta.

**Šta je tim odbacio:**
- Inicijalni prijedlog korištenja `fetch` umjesto axios instance, kako bi se zadržala konzistentnost sa ostatkom projekta.

**Rizici, problemi ili greške koje su uočene:**
- AI inicijalno nije bio upoznat sa tačnim nazivom axios instance u projektu, što je zahtijevalo ručnu prilagodbu importa u `tabelaApi.js`.

**Ko je koristio alat:**
Zeir Mašić
---

## Zapis 6

**Datum:** 20.05.2026.

**Sprint broj:** 8

**Alat koji je korišten:** Gemini 3 Flash

**Svrha korištenja:**
Pomoć pri implementaciji full-stack logike (backend CRUD i kontrole pristupa, struktura testova) te kompletnog UI/UX izgleda forme i frontend integracije za upravljanje sportskim objektima.

**Kratak opis zadatka ili upita:**
Tražena pomoć oko optimalne strukture servisa `facilityService.js` i pripadajućih kontrolera, s fokusom na to kako kroz Prisma ORM upite osigurati da ulogovani vlasnik vidi i modifikuje isključivo svoje objekte, te generisanje testova uz mockovanje baze.

**Šta je AI predložio ili generisao:**
- Predložio arhitekturu za CRUD funkcije (kreiranje, čitanje, izmjenu i brisanje objekata) sa ugrađenom `where: { vlasnikId: ownerId }` klauzulom radi sigurnosne izolacije podataka.
- Generisao kostur testova unutar Jest okruženja koristeći mockovani Prisma klijent (`prismaMock`) za simulaciju uspješnih operacija i izolaciju od stvarne baze podataka.

**Šta je tim prihvatio:**
- Osnovnu logiku i arhitekturu provjere vlasništva nad objektom prije izvršavanja bilo kakvih operacija ažuriranja (`update`) ili brisanja (`delete`) resursa.
- Pristup i metodologiju pisanja testova kroz izolaciju servisnog sloja i mockovanje Prisma klijenta (`mocking`).

**Šta je tim izmijenio:**
- Rute i kontroleri su ručno prilagođeni i uvezani sa JWT middleware-om kako bi se identifikacioni broj korisnika bezbjedno povlačio iz tokena (`req.user.korisnikId`) umjesto da se prosljeđuje kroz tijelo zahtjeva (`req.body`).
- Izmijenjen je dio koda za brisanje objekta kako bi se osiguralo kaskadno rukovanje i brisanje svih povezanih termina odgovarajuće dvorane u bazi podataka.

**Šta je tim odbacio:**
- Generisane generičke poruke grešaka i predefinisane HTTP statuse koji nisu bili usklađeni sa ranije postavljenim globalnim standardom i strukturom za rukovanje greškama u aplikaciji (`serviceError`).

**Rizici, problemi ili greške koje su uočene:**
- U prvobitnim testnim scenarijima, AI je pogrešno pretpostavio sinhrono izvršavanje nekih Prisma metoda, što je uzrokovalo padanje Jest testova sve dok asinhroni pozivi (`async/await`) nisu ručno modifikovani i ispravljeni.

**Ko je koristio alat:**
Maida Biber
