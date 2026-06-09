# Dokumentovanje rada — Sistem za upravljanje sportskim terminima i ligama

## 1. O projektu

Projekat je razvijen u okviru predmeta Softverski inženjering. Radi se o web aplikaciji za upravljanje sportskim takmičenjima, ligama i rezervacijama sportskih objekata, građenoj kroz trinaest sprintova od inicijalne projektne dokumentacije do potpuno deployovanog sistema.

Tehnički, sistem se sastoji od React + Vite frontenda, Node.js + Express backenda, PostgreSQL baze podataka s Prisma ORM-om, Redis instance za asinhrono procesiranje, te zasebnog Python mikroservisa koji vrši predikciju rezultata utakmica metodama mašinskog učenja.

---

## 2. Zašto je sistem napravljen

Ideja iza projekta dolazi iz konkretnog problema s kojim se susreću organizatori sportskih liga i vlasnici sportskih objekata: ne postoji jedno mjesto gdje se može pratiti sve — ko je rezervisao teren, koji je raspored utakmica ove sedmice, gdje stoji tim na tabeli, ko je pouzdan korisnik a ko nije.

Organizatori liga vode rasporede u Excelu ili u glavi. Vlasnici terena primaju rezervacije telefonom bez ikakve zaštite ako korisnik ne dođe. Navijači moraju pitati direktno trenera ili igrača da bi saznali kad je sljedeća utakmica. Rezultati se objavljuju sa zakašnjenjem ili uopšte ne.

Ovaj sistem sve to stavlja na jedno mjesto, s jasnim pravilima ko šta smije raditi i automatizacijom tamo gdje je to moguće — posebno u dijelu upravljanja rezervacijama i vođenja tabele.

---

## 3. Ko koristi sistem

Sistem prepoznaje šest tipova korisnika, svaki s drugačijim skupom mogućnosti:

**Administrator** ima potpuni nadzor nad sistemom — može upravljati nalozima, mijenjati uloge korisnika, blokirati korisnike i obrađivati zahtjeve za promjenu uloge.

**Organizator** je centralna figura u ligaškom dijelu sistema. Kreira takmičenja, prima prijave timova, sastavlja rasporede utakmica i unosi rezultate. Jedini je koji može pokrenuti AI predikciju za određenu utakmicu.

**Trener** upravlja svojom ekipom — prijavljuje je na takmičenja, organizuje grupne treninge i prati raspored i rezultate.

**Igrač** vidi raspored svog tima, prijavljuje se na treninge i dobiva obavještenja kad se nešto promijeni u rasporedu ili rezervacijama.

**Vlasnik sportskog objekta** unosi svoje terene i dvorane u sistem, definiše kad su slobodni, te odobrava ili odbija zahtjeve za rezervaciju. Sistem mu nameće rokove — mora reagovati u roku od 24 sata, a za termine koji uskoro počinju taj rok se skraćuje na 2 sata.

**Navijač** ne mora ni biti prijavljen da bi vidio rezultate i rasporede — ali ako se registruje, može pratiti omiljeni tim i dobivati personalizovana obavještenja.

---

## 4. Šta je implementovano

### Korisnički nalozi i pristup

Sistem podržava registraciju, prijavu i odjavu, reset lozinke putem emaila, te zahtjev za promjenu uloge uz prateću dokumentaciju. Autentifikacija je zasnovana na JWT tokenima s refresh mehanizmom. Svaka ruta u sistemu zaštićena je prema ulozi korisnika.

### Ligaški modul

Organizatori mogu kreirati takmičenja i lige, primati i obrađivati prijave timova, te sastavljati rasporede utakmica s tačnim datumom, vremenom i lokacijom. Nakon odigrane utakmice, unos rezultata automatski ažurira tabelu i bodovanje — nema ručnog računanja.

Svi ovi podaci — raspored, tabela, rezultati su dostupni javno, bez prijave, uz mogućnost filtriranja po ligi, timu ili datumu.

### Rezervacija termina

Vlasnik objekta definira slobodne termine. Korisnik šalje zahtjev za rezervaciju. Šta se dalje dešava ovisi o tome je li korisnik "pouzdan" ili ne:

- Pouzdanom korisniku rezervacija se automatski potvrđuje. Vlasnik je može otkazati uz obrazloženje, ali samo do 24 sata prije početka — nakon toga, opcija otkazivanja se zaključava kako korisnik ne bi bio ostavljen bez termina u zadnji čas.
- Nepouzdanom korisniku zahtjev čeka na odobrenje vlasnika. Ako vlasnik ne reaguje u roku, sistem automatski odbija zahtjev.

Postoji i lista čekanja za zauzete termine, a broj prekinutih rezervacija od strane korisnika utiče na njegovu ocjenu pouzdanosti.

### Grupni treninzi

Treneri mogu kreirati grupne treninge vezane za određeni termin i objekat, s ograničenim brojem mjesta. Igrači se prijavljuju direktno kroz sistem.

### Obavještenja

Sistem šalje notifikacije putem dva kanala — email (SendGrid) i in-app poruke u realnom vremenu (Socket.IO). Navijači dobivaju obavještenja o svom omiljenom timu, igrači o terminima i rezultatima, a treneri o potvrdi ili promjeni rezervacija.

Asinhrono procesiranje (BullMQ + Redis) omogućava da se notifikacije šalju u pozadini bez blokiranja ostatka sistema, te da se automatska odbijanja rezervacija pokreću u pravo vrijeme.

### AI predikcija

Poseban Python mikroservis (FastAPI + scikit-learn, Random Forest model) prima podatke o dvjema ekipama i vraća procjenu vjerovatnoće svakog ishoda utakmice, uz tekstualno objašnjenje. Express backend poziva taj servis, rezultat upisuje u bazu i prikazuje ga na stranici detalja utakmice. Predikcija je čisto informativnog karaktera.

---

## 5. Kako je tekao razvoj

| Sprint | Šta je rađeno |
|--------|---------------|
| Sprint 1 | Team Charter, Product Vision, Stakeholder Map, inicijalni backlog |
| Sprint 2 | User Stories, Acceptance Criteria, NFR zahtjevi, prioritizacija |
| Sprint 3 | Risk Register, Domain Model, Use Case dijagrami, Architecture Overview, Test Strategy |
| Sprint 4 | Definition of Done, Release Plan, tehnički skelet projekta, branching strategija i tech stack |
| Sprint 5 | ER dijagram i fizička baza, API dokumentacija, Decision i AI Usage log, registracija i prijava |
| Sprint 6 | RBAC sistem permisija, sigurnosni protokoli, upravljanje ligama i timovima |
| Sprint 7 | Prijava ekipa, kreiranje rasporeda, javni pregled s filtriranjem |
| Sprint 8 | Unos rezultata, automatska tabela i bodovanje |
| Sprint 9 | Upravljanje objektima, logika rezervacija, dashboard za vlasnike, validacija podataka |
| Sprint 10 | Notifikacije, omiljeni tim, AI predikcija, responzivnost, testiranje |
| Sprint 11 | Docker, CI/CD pipeline, AI mikroservis, proširenje testova, sva završna dokumentacija |

---

## 6. Status backlog stavki

### Završeno

Svih 49 stavki u backlogu evidentirano je kao završeno, od početne projektne dokumentacije u Sprintu 1 do završnih artefakata u Sprintu 12. To uključuje kompletnu implementaciju svih planiranih funkcionalnosti, testiranje, te dokumentaciju (korisnički priručnik, tehnička dokumentacija, Release Notes, Known Issues).



### Nije završeno
Ostali su i određeni tehnički i operativni aspekti koji nisu definisani u product backlogu, a bi bili prioritet u budućem razvitku projekta:

| Oblast | Napomena |
|--------|----------|
| Neovisni sigurnosni pregled | Sistem nije prošao formalnu sigurnosnu provjeru van tima |
| Load testing | Nije rađeno testiranje pod opterećenjem |
| Bulk uvoz podataka | Nema podrške za uvoz rasporeda ili timova iz CSV-a ili sličnih formata |

---

## 7. Ključne tehničke odluke

**React + Vite / Node.js + Express kao odvojeni slojevi** — Tim je od početka napravio jasan rez između frontenda i backenda koji komuniciraju isključivo preko REST API-ja. Ovo je omogućilo da različiti članovi tima rade na različitim dijelovima paralelno, ali je zahtijevalo rano dogovaranje oko API ugovora, što je riješeno kroz PB-18 (API dokumentacija).

**Prisma ORM i Neon PostgreSQL** — Prisma shema (`schema.prisma`) koristi se kao jedini izvor istine za strukturu baze. Svi entiteti — od `Korisnik` i `Takmicenje` do `ZahtjevZaRezervaciju` i `AIPredikcija` — definirani su tamo. Baza je hostovana na Neon cloud platformi.

**BullMQ + Redis za vremenski osjetljive zadatke** — Automatska odbijanja rezervacija (24h / 2h pravilo) i slanje notifikacija implementovano je kao asinhroni red zadataka. Redis je preduslov za rad ovog dijela sistema.

**Python mikroservis za AI** — Namjerna odluka da se ML logika potpuno odvoji od Express backenda. Mikroservis izgrađen u FastAPI-ju prima matchId, samostalno gradi feature set iz baze podataka i vrši predikciju Random Forest modelom (200 stabala, scikit-learn), vraćajući vjerovatnoće za svaki od tri moguća ishoda.

**Docker + GitHub Actions** — Za završni sprint uvedena je potpuna Dockerizacija kroz `docker-compose.yml` koji podiže sve servise lokalno jednom komandom, te CI/CD pipeline koji blokira deploy ako padnu testovi.

**Railway Blueprint (`railway.toml`)** — Cijela cloud infrastruktura opisana je u jednom konfiguracionom fajlu, što deployovanje čini ponovljivim i dokumentovanim.

---

## 8. Izazovi tokom razvoja

**Logika rezervacija** bila je daleko najsloženiji dio sistema za implementirati. Različita pravila za pouzdane i nepouzdane korisnike, rokovi koji ovise o tome kad termin počinje, zaključavanje opcije otkazivanja, automatska odbijanja — sve to moralo je funkcionisati konzistentno. Rješenje je bilo detaljno definisanje u acceptance kriterijima još u fazi planiranja, pa je implementacija imala jasan cilj.

**Koordinacija većeg tima** postaje problem kad frontend i backend tima rade nezavisno na funkcionalnostima koje moraju biti usklađene. Rano pisanje API dokumentacije (Sprint 5) smanjilo je broj situacija gdje jedna strana čeka drugu ili pretpostavlja drugačiji format podataka.

**Produkcijsko okruženje s pet servisa** — frontend, backend, AI servis, PostgreSQL (Neon), Redis — zahtijevalo je pažljivo upravljanje environment varijablama i međusobnim URL-ovima. Railway Blueprint je uveden upravo kako bi se ta složenost stavila pod kontrolu i dokumentovala na jednom mjestu.

**Vremenski rokovi u rezervacijama** u kombinaciji s asinhronim procesiranjem zahtijevali su posebnu pažnju oko vremenskih zona i tačnosti pokretanja BullMQ zadataka. Greška od nekoliko sekundi ovdje nije toliko bitna, ali greška od sata može uzrokovati da se rezervacija odbije ranije ili kasniije nego što treba.

**Ručni unos kao jedini izvor podataka** — sistem ne može znati jesu li podaci koje unosi organizator ili vlasnik tačni. Ovo nije greška u implementaciji, nego inherentno ograničenje dizajna, ali se mora imati u vidu pri evaluaciji kvalitete AI predikcija koje ovise o tim podacima.

---

## 9. Šta bi se promijenilo u nastavku




**Testna pokrivenost:** Jedinični i integracijski testovi pokrivaju ključne tokove, ali moduli poput notifikacija i rezervacija zaslužuju dublju pokrivenost, pogotovo rubni slučajevi s vremenskim rokovima.

**Monitoring:** Trenutno nema centralnog sistema za praćenje grešaka u produkciji. Integracija s nečim poput Sentryja bila bi logičan sljedeći korak.

**Bulk uvoz:** Organizatori koji prelaze iz Excela na ovaj sistem ne mogu uvesti postojeće podatke. CSV uvoz za rasporede, timove i historijske rezultate bio bi koristan za prihvatanje sistema u praksi.

---

## 10. Zaključak

Projekat je rezultovao funkcionalnim sistemom koji pokriva cijeli životni ciklus sportskog takmičenja — od osnivanja lige i prijave timova, kroz raspoređivanje utakmica i vođenje tabele, do rezervacije i upravljanja sportskim objektima. Sistem je deployovan, dokumentovan i pokretan jednom Docker komandom bez ručne intervencije.

Ono što izdvaja ovaj projekat od jednostavnog CRUD sistema je logika rezervacija s pouzdanošću korisnika, real-time notifikacije i AI predikcija kao zasebni mikroservis. Svaka tehnička odluka donesena tokom razvoja bila je direktno vezana za konkretne zahtjeve sistema, a ne za tehnološke preferencije tima.

---