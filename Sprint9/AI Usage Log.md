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

## Zapis 3

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