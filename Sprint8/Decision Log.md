# Decision Log - Sprint 8

---

## Odluka 1

**ID:** DL-S8-01

**Datum:** 17.05.2026.

**Naziv:** Ažuriranje `PlasmanNaTabeli` direktno prilikom unosa rezultata (US-12 integracija)

**Opis:**
Prilikom implementacije evidencije rezultata utakmice, bilo je potrebno donijeti odluku gdje i kada izvršiti preračunavanje bodova (3 za pobjedu, 1 za remi) i ažuriranje poretka u `PlasmanNaTabeli`.

**Razmatrane opcije:**
- Ažurirati tabelu direktno unutar kontrolera za rezultat (`resultController.js`) odmah prilikom njegovog upisa u bazu.
- Čekati da drugi član tima napravi kompletan, odvojeni servis za statistiku koji bi to radio asinhrono.

**Odabrana opcija:**
Ažuriranje tabele direktno unutar kontrolera za rezultate, ne čekajući poseban servis.

**Razlog izbora:**
Glavni razlog za ovaj pristup bio je omogućavanje trenutnog, end-to-end (E2E) testiranja tabele na frontendu odmah po unosu rezultata. Umjesto da aplikacija ostane polufunkcionalna, tabela se sada osvježava u realnom vremenu. Član tima zadužen za naprednu statistiku (US-12.1) sada se može neometano fokusirati na složeniji dio priče: statistiku igrača, posjed lopte i kartone.

**Posljedice odluke:**

*Pozitivne:*
- Aplikacija odmah djeluje povezano (unos rezultata -> tabela).
- Znatno lakše ručno i E2E testiranje protoka informacija.
- Rasterećenje tima pri dodjeli zadataka iz domene statistike.

*Negativne:*
- `resultController.js` sada pokriva i dio logike tabele, što blago narušava striktnu separaciju, mada je to rješivo kasnijim refaktorisanjem.

**Status odluke:** Prihvaćena i implementirana

---

## Odluka 2

**ID:** DL-S8-02

**Datum:** 17.05.2026.

**Naziv:** Korištenje modalnog prozora za unos rezultata (umjesto nove stranice)

**Opis:**
Trebalo je odlučiti na koji način organizatorima omogućiti upis ili korekciju samog rezultata na postojećoj UI (korisničkoj) strukturi, s težištem na stranicu "Raspored".

**Razmatrane opcije:**
- Dodavanje linka/dugmeta koji korisnika preusmjerava na sasvim novu rutu (npr. `/utakmice/:id/rezultat`).
- Implementacija Modalnog (Pop-up) prozora direktno preko ekrana Rasporeda.

**Odabrana opcija:**
Modalni prozor na stranici Raspored.

**Razlog izbora:**
Modalni prozor pruža drastično bolji UX (User Experience). Korisnik (Organizator/Administrator) najčešće unosi rezultate za više utakmica zaredom. Otvaranjem nove stranice, korisnik gubi kontekst ostalih utakmica i mora klikati "Back" u browseru. Pomoću modala, čitav proces unosa traje par sekundi, a korisnik ostaje na pregledu cijelog rasporeda.

**Posljedice odluke:**

*Pozitivne:*
- Efikasniji i brži unos podataka za korisnike.
- Manje pisanja koda za routing (nove rute i layouti na frontendu).

*Negativne:*
- State komponente `Raspored.jsx` postaje složeniji zbog potrebe upravljanja podacima o otvorenom modalu (koja je utakmica odabrana, greške unosa itd.).

**Status odluke:** Prihvaćena i implementirana

---
