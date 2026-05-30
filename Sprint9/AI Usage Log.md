# AI Usage Log - Sprint 9

---

## Zapis 1

**Datum:** 23.05.2026.

**Sprint broj:** 9

**Alat koji je korišten:** Gemini (Antigravity)

**Svrha korištenja:**
Konsultacija oko implementacije sigurne transakcije u bazi podataka za sprečavanje prekoračenja kapaciteta pri prijavi igrača (race conditions).

**Kratak opis zadatka ili upita:**
Kako u Prisma ORM-u ispravno izvesti transakcijski blok koji u isto vrijeme provjerava trenutni broj prijavljenih igrača i, ako ima slobodnih mjesta, vrši upis novog igrača na grupni trening, a da se pritom izbjegne situacija da se prijavi više ljudi nego što je dozvoljeno ako kliknu u istoj sekundi.

**Šta je AI predložio ili generisao:**
- Predložio je kostur za `$transaction` blok u kojem se najprije radi `findUnique` sa `include` relacijom za prijave, provjerava dužina niza prijava u odnosu na `maksimalanBrojIgraca`, pa se onda asinhrono poziva `create` za prijavu.

**Šta je tim (korisnik) prihvatio:**
- Prihvatila sam koncept provjere kapaciteta unutar transakcije kako bi se osigurao atomski upis.

**Šta je tim (korisnik) izmijenio:**
- Sama sam prilagodila kod da pravilno rukuje greškama i baca predefinisane izuzetke sa tačnim statusnim kodovima (`400` za popunjen kapacitet, `404` za nepostojeći trening), te osigurala da se u slučaju greške transakcija ispravno prekida.

**Šta je tim (korisnik) odbacio:**
- Odbacila sam generičke predložene funkcije za provjeru rola unutar servisa jer sam te sigurnosne provjere već imala implementirane u middleware sloju na ruti.

**Rizici, problemi ili greške koje su uočene:**
- Inicijalni prijedlog AI-ja je koristio pretragu po emailu umjesto po `korisnikId`, što sam odmah uočila i ispravila jer u sistemu koristimo ID ključeve za relacije.

**Ko je koristio alat:**
Ilma Hindija

---

## Zapis 2

**Datum:** 24.05.2026.

**Sprint broj:** 9

**Alat koji je korišten:** Gemini (Antigravity)

**Svrha korištenja:**
Pomoć oko Tailwind CSS klasa za custom modal i postavljanje strukture za unit testove Axios DELETE zahtjeva sa parametrima.

**Kratak opis zadatka ili upita:**
Pomoć oko CSS stilizacije za textarea polje unutar modala kako bi se vizuelno uklopilo u toplu narandžastu temu aplikacije, te kako pravilno konfigurisati Axios mock test za provjeru prosljeđivanja razloga u DELETE metodi.

**Šta je AI predložio ili generisao:**
- Predložio je Tailwind klase za zaobljene ivice (`rounded-2xl`) i narandžaste obrube (`focus:border-orange-500`) za tekstualno polje.
- Dao je primjer kako u testu pomoću `expect(mockApi.delete).toHaveBeenCalledWith(..., expect.objectContaining({ data: { razlog } }))` provjeriti tijelo DELETE zahtjeva.

**Šta je tim (korisnik) prihvatio:**
- Prihvatila sam stilove za textarea i primijenila ih u komponenti `GroupTrainingsBrowse.jsx`.
- Iskoristila sam predloženu strukturu za testiranje API-ja na frontendu.

**Šta je tim (korisnik) izmijenio:**
- Dodala sam `disabled` stanje na dugme za potvrdu na osnovu provjere `.trim()` unesenog teksta, te implementirala resetovanje unesenog teksta pri svakom otvaranju dijaloga.
- Prilagodila sam test da ispravno provjerava i Authorization zaglavlja sa tokenom, što je bilo specifično za naš projekat.

**Rizici, problemi ili greške koje su uočene:**
- AI je u prvom pokušaju predložio slanje body-ja u DELETE zahtjevu kao drugog argumenta funkcije `api.delete`, što je netačno za Axios jer je drugi argument zapravo config objekat. Sama sam ispravila to i umotana u `{ data: { razlog } }`.

**Ko je koristio alat:**
Ilma Hindija

---

## Zapis 3

**Datum:** 24.05.2026.

**Sprint broj:** 9

**Alat koji je korišten:** ChatGPT 

**Svrha korištenja:**
Pomoć pri strukturiranju testova i provjeri logike za ručnu verifikaciju uslovnih rezervacija nepouzdanih korisnika.

**Kratak opis zadatka ili upita:**
Korišten je AI alat za pomoć oko definisanja testnih scenarija za funkcionalnosti uslovnih rezervacija, posebno za obradu zahtjeva nepouzdanih korisnika kroz akcije `ODOBRI` i `ODBIJ`, validaciju razloga odbijanja, promjenu statusa zahtjeva i provjeru zaštite vlasničkih ruta.

**Šta je AI predložio ili generisao:**
- Predložio je podjelu testova na servisne, kontrolerske i route testove.
- Predložio je scenarije za uspješno odobravanje zahtjeva, odbijanje zahtjeva sa validnim razlogom, odbijanje bez validnog razloga i zabranu obrade zahtjeva koji više nije u pending statusu.
- Predložio je da se provjeri da ruta `PATCH /api/vlasnik/zahtjevi/:id/verifikacija` koristi `authenticateToken` i `requireRole('VLASNIK')`.

**Šta je tim (korisnik) prihvatio:**
- Prihvaćena je struktura testova po nivoima: servis, kontroler i rute.
- Prihvaćeni su testni scenariji za `ODOBRI` i `ODBIJ` akcije.
- Prihvaćena je provjera da se kod odbijanja zahtjeva pravilno upisuje `razlogOdbijanja` i mijenja status zahtjeva u `ODBIJENO`.

**Šta je tim (korisnik) izmijenio:**
- Testovi su prilagođeni stvarnim nazivima statusa koji se koriste u projektu, posebno statusu `NA_CEKANJU`.
- Prilagođeni su nazivi servisa, kontrolera i ruta prema postojećoj strukturi projekta.
- Dodane su provjere koje su specifične za projekat, kao što su validacija vlasništva nad objektom i blokiranje obrade zahtjeva koji ne pripada datom vlasniku.

**Šta je tim (korisnik) odbacio:**
- Odbijeni su prijedlozi koji bi zahtijevali promjene produkcijskog koda samo da bi testovi prošli.
- Nisu prihvaćeni generički nazivi statusa i ruta koje nisu odgovarale stvarnoj implementaciji projekta.

**Rizici, problemi ili greške koje su uočene:**
- AI je u početku koristio općenite nazive statusa za pending zahtjeve, pa je bilo potrebno ručno uskladiti testove sa stvarnim statusom `NA_CEKANJU`.
- Dio prijedloga je bio previše generički i morao je biti prilagođen postojećem middleware i service sloju projekta.

**Ko je koristio alat:**
Semir Jamaković

---
## Zapis 4

**Datum:** 25.05.2026.

**Sprint broj:** 9

**Alat koji je korišten:** Claude 

**Svrha korištenja:**
Implementacija ekrana "Moje rezervacije" za igrača i spajanje svih igračkih ekrana u jedan PlayerDashboard.

**Kratak opis zadatka ili upita:**
Kreiranje backend rute, servisa i kontrolera za dohvatanje svih nadolazećih rezervacija prijavljenog igrača (individualnih i grupnih), te izrada odgovarajućeg frontend ekrana. Nakon toga, spajanje tri odvojena ekrana (IndividualTraining, GroupTrainingsBrowse, MojeRezervacije) u jedan PlayerDashboard komponent.

**Šta je AI predložio ili generisao:**
- Kompletan `getMojeRezervacijeService` servis koji dohvata i individualne rezervacije i grupne prijave, filtrira samo nadolazeće i sortira po datumu.
- Kontroler `getMojeRezervacije` i rutu `GET /rezervacije/moje` sa odgovarajućim middlewareima.
- Frontend komponentu `MojeRezervacije.jsx` sa karticama, statusnim bedžovima i modalima za otkazivanje.
- Spojeni `PlayerDashboard.jsx` sa sve tri sekcije na jednom ekranu i jednom globalnom notifikacijom.
- Dijagnostiku i rješavanje grešaka: `MODULE_NOT_FOUND`, `EADDRINUSE`, `socket.io-client` nije instaliran, `prisma generate` nije pokrenut.

**Šta je tim (korisnik) prihvatio:**
- Strukturu backend servisa sa JavaScript filterom umjesto Prisma nested where filtera zbog stabilnosti.
- Izmjene u `App.jsx` i `Navbar.jsx` za integraciju novog ekrana.

**Šta je tim (korisnik) izmijenio:**
- Kompletnu frontend komponentu PlayerDashboard sa stilovima konzistentnim sa ostatkom aplikacije (amber/orange tema).

**Šta je tim (korisnik) odbacio:**
- Odvojene stranice `IndividualTraining.jsx`, `GroupTrainingsBrowse.jsx` i `MojeRezervacije.jsx` kao zasebne navbar stavke, zamijenjene jednom "Moj dashboard" stavkom.

**Rizici, problemi ili greške koje su uočene:**
- Nested Prisma `where` filter na relaciji `grupniTrening.terminObjekta.vrijemePocetka` nije radio pouzdano pa je filter prebačen u JavaScript.

**Ko je koristio alat:**
Irma Topčagić

## Zapis 5

**Datum:** 25.05.2026.

**Sprint broj:** 9

**Alat koji je korišten:** ChatGPT

**Svrha korištenja:**
Pomoć pri izradi izolovanih i mockovanih testova za funkcionalnosti automatizacije, tajmera i vlasničkog otkazivanja rezervacija koje je implementirao Developer 3.

**Kratak opis zadatka ili upita:**
Korišten je AI alat za pomoć oko definisanja i pisanja testova za Developer 3 funkcionalnosti: BullMQ delayed job za automatsko odbijanje pending zahtjeva nakon 60 minuta, provjeru registracije vlasničke rute za otkazivanje rezervacije i provjeru zaštite rute vlasničkom rolom.

**Šta je AI predložio ili generisao:**
- Predložio je da se BullMQ, Redis, PrismaClient i povezani servisi mockuju kako testovi ne bi zavisili od vanjskih servisa.
- Predložio je test koji provjerava da se pri kreiranju rezervacije sa statusom `NA_CEKANJU` dodaje delayed job sa payloadom `{ reservationId, termId }`.
- Predložio je provjeru da delay vrijednost iznosi `60 * 60 * 1000`.
- Predložio je route test za `POST /api/vlasnik/rezervacije/:id/otkazivanje`, uključujući provjeru da ruta koristi `requireRole('VLASNIK')`.
- Predložio je da se ne mijenja produkcijski kod ukoliko neki test ne prolazi, nego da se takav test ukloni.

**Šta je tim (korisnik) prihvatio:**
- Prihvaćen je pristup sa mockovanim i izolovanim testovima.
- Prihvaćeno je mockovanje queue/BullMQ/Redis zavisnosti umjesto pokretanja pravog Redis servera.
- Prihvaćeni su testovi za provjeru BullMQ delayed job poziva i route zaštite vlasničke rute.
- Prihvaćeno je pravilo da finalni diff smije sadržavati samo test fajlove.

**Šta je tim (korisnik) izmijenio:**
- Testovi su prilagođeni stvarnoj strukturi backend test foldera u projektu.
- Nazivi test fajlova su usklađeni sa postojećim naming convention pravilima:
  - `rezervacijaController.queue.test.js`
  - `vlasnikRoutes.otkazivanje.test.js`
- Testovi su ograničeni samo na one scenarije koji se mogu stabilno testirati bez izmjene produkcijskog koda.

**Šta je tim (korisnik) odbacio:**
- Odbijeni su testovi za worker timeout logiku jer trenutni worker nije bio stabilno testabilan bez izmjene produkcijskog koda.
- Odbijeni su testovi za vlasničko otkazivanje prema pravilu `createdAt <= 60 minuta` jer trenutna implementacija koristi drugo pravilo.
- Odbijeni su frontend testovi za 60-minutno disabled stanje dugmeta jer komponenta trenutno računa zaključavanje prema `vrijemePocetka` i 24h pravilu, a ne prema starosti rezervacije.

**Rizici, problemi ili greške koje su uočene:**
- Uočeno je da dio traženog ponašanja iz task opisa nije moguće stabilno pokriti testovima bez izmjene produkcijskog koda.
- Postojao je rizik da AI pokuša mijenjati implementaciju kako bi testovi prošli, pa je eksplicitno naglašeno da se produkcijski kod ne smije dirati.
- Komanda `npm test -- src/pages/__tests__/VlasnikDashboard.test.jsx --runInBand` nije bila validna za Vitest, pa je pokrenuta ispravna komanda bez `--runInBand`.

**Ko je koristio alat:**
Zeir Mašić i Maida Biber

## Zapis 6

**Datum:** 25.05.2026.

**Sprint broj:** 9

**Alat koji je korišten:** Claude

**Svrha korištenja:**
Konsultacija oko implementacije real-time liste čekanja za individualne termine i Socket.IO notifikacija za oslobođene termine.

**Kratak opis zadatka ili upita:**
Kako organizovati backend i frontend arhitekturu za funkcionalnost liste čekanja gdje se korisnici mogu prijaviti na zauzet termin, automatski dobiti real-time notifikaciju kada termin postane slobodan, te imati pregled svih termina na kojima čekaju unutar profila korisnika.

**Šta je AI predložio ili generisao:**

* Prijedlog strukture `listaCekanjaService` servisa sa metodama za prijavu, odjavu i dohvat waitlist termina.
* Primjer Socket.IO emit logike za slanje događaja korisnicima kada se termin oslobodi.
* Backend rute za `join waitlist`, `leave waitlist` i `get my waitlist terms`.
* Frontend API helper funkcije za komunikaciju sa waitlist endpointima.
* Ideju za real-time toast/notifikaciju unutar React aplikacije korištenjem globalnog socket listenera.
* Primjer UI stanja za dugme “Prijavi me na listu čekanja” i prikaz statusa “Nalazite se na listi čekanja”.

**Šta je tim (korisnik) prihvatio:**

* Koncept odvojene waitlist tabele i servisnog sloja za upravljanje listom čekanja.
* Korištenje Socket.IO room-ova po korisniku radi ciljane distribucije notifikacija.
* Integraciju real-time notifikacija u postojeći PlayerDashboard/Profile flow.

**Šta je tim (korisnik) izmijenio:**

* Prilagođena je validacija tako da se korisnik može prijaviti na listu čekanja isključivo za termine sa statusom `ZAUZET`.
* Dodana je provjera za sprečavanje duplih waitlist prijava za isti termin.
* Modifikovana je frontend logika kako bi se UI stanje sinhronizovalo nakon prijave/odjave bez refresh-a stranice.
* Prilagođen je izgled toast notifikacija postojećoj amber/orange temi aplikacije.

**Šta je tim (korisnik) odbacio:**

* Globalni broadcast svih oslobođenih termina svim konektovanim korisnicima zbog nepotrebnog mrežnog opterećenja i sigurnosnih razloga.
* Korištenje polling pristupa za provjeru oslobođenih termina, zamijenjeno Socket.IO eventima.

**Rizici, problemi ili greške koje su uočene:**

* AI je inicijalno predložio emitovanje događaja svim korisnicima umjesto samo korisnicima koji se nalaze na listi čekanja za konkretan termin.
* Uočena je potreba za dodatnom transakcijskom zaštitom kako bi se izbjegli race condition scenariji kod simultanog oslobađanja termina i prijava na listu čekanja.
* Frontend testovi za novu funkcionalnost nisu mogli biti izvršeni zbog postojećeg Vitest setup path problema.

**Ko je koristio alat:**
Mehdi Zaimović


## Zapis 7

**Datum:** 25.05.2026.

**Sprint broj:** 9

**Alat koji je korišten:** Claude

**Svrha korištenja:**
Pomoć pri generisanju testova za frontend API funkcije individualnih rezervacija, te pri povezivanju ruta za uspješno zakazivanje i otkazivanje individualnih termina.

**Kratak opis zadatka ili upita:**
Generisanje unit testova za API funkcije `getFreeIndividualTerms`, `reserveIndividualTerm` i `cancelIndividualTerm` uz provjeru Authorization headera, ispravnih endpointa i propagacije grešaka. Pored toga, konsultacija oko ispravnog povezivanja ruta na backendu za zakazivanje i otkazivanje individualnih termina od strane igrača.

**Šta je AI predložio ili generisao:**
- Kompletnu strukturu test suite-a u Vitestu sa `vi.mock` za Axios instancu i `beforeEach` resetovanjem.
- Testne scenarije za svaku od tri API funkcije, uključujući happy path i error path slučajeve.
- Testove za provjeru da se token iz `localStorage` ispravno koristi u Authorization headeru, uključujući edge case kada token nije prisutan (`Bearer null`).
- Prijedlog za organizaciju ruta i middleware redoslijeda za zakazivanje i otkazivanje individualnih termina.

**Šta je tim (korisnik) prihvatio:**
- Strukturu test suite-a i raspored testnih scenarija po grupama (`getFreeIndividualTerms`, `reserveIndividualTerm`, `cancelIndividualTerm`).
- Pristup testiranja Authorization headera iz `localStorage`.

**Šta je tim (korisnik) izmijenio:**
- Prilagođeni su konkretni URL endpointi i nazivi funkcija specifičnim konvencijama projekta.
- Dodani su specifični `terminId` vrijednosti i poruke grešaka usklađene sa backendom projekta.
- Prilagođen je test za `Bearer null` slučaj prema stvarnom ponašanju implementacije.

**Šta je tim (korisnik) odbacio:**
- Nije bilo značajnih odbačenih prijedloga.

**Rizici, problemi ili greške koje su uočene:**
- Nije uočena nijedna greška u finalnoj implementaciji testova.

**Ko je koristio alat:**
Amna Kerla
