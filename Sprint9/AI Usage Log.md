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
Zeir Masić
