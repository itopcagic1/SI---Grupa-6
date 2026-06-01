# Decision Log - Sprint 10

---

## Odluka 1

**ID:** DL-S10-01

**Datum:** 01.06.2026.

**Naziv:** Korištenje postojećeg Prisma modela sa compound unique constraint-om

**Opis:**
Trebalo je odlučiti kako strukturirati tabelu za spremanje omiljenih timova. 

**Razmatrane opcije:**
- Kreirati potpuno novu tabelu sa sopstvenim auto-increment primarnim ključem.
- Iskoristiti već postojeći model `OmiljeniTim` iz sheme baze koji posjeduje compound unique ključ `@@unique([korisnikId, timId])`.

**Odabrana opcija:**
Iskorištavanje postojećeg modela `OmiljeniTim` sa compound unique constraint-om.

**Razlog izbora:**
Postojeći model u bazi je već imao definisan unique constraint nad kombinacijom `korisnikId` i `timId`, što prirodno sprječava situaciju da isti korisnik doda isti tim više puta u omiljene na nivou same baze. Ovo je ubrzalo rad jer nije bilo potrebe za kreiranjem novih migracionih fajlova i izbjegnuti su potencijalni konflikti pri spajanju grana.

**Posljedice odluke:**
*Pozitivne:*
- Nema novih migracija baze podataka.
- Integritet podataka je zaštićen na nivou same baze (compound unique constraint).
*Negativne:*
- Zahtijeva specifičnu Prisma sintaksu za `findUnique` i `delete` operacije koristeći `korisnikId_timId` kompozitni ključ.

**Status odluke:** Prihvaćena i implementirana

---

## Odluka 2

**ID:** DL-S10-02

**Datum:** 01.06.2026.

**Naziv:** Restrikcija i uslovno prikazivanje opcije omiljenih timova samo za ulogu `NAVIJAC`

**Opis:**
Trebalo je odlučiti ko može dodavati omiljene timove i kome se ta opcija uopšte nudi u interfejsu.

**Razmatrane opcije:**
- Prikazati ikonu srca svim posjetiocima (gostima, trenerima, administratorima, igračima).
- Prikazati ikonu srca isključivo ulogovanim korisnicima sa aktivnom ulogom `NAVIJAC`.

**Odabrana opcija:**
Prikazivanje i omogućavanje opcije isključivo za ulogu `NAVIJAC`.

**Razlog izbora:**
Funkcionalnost "omiljeni tim" je specifična za navijače koji prate sportska dešavanja i timove. Treneri i administratori imaju administrativne i upravljačke uloge nad timovima, dok igrači imaju angažmane u timovima, pa bi uvođenje ove opcije za njih stvorilo nepotreban šum u korisničkom interfejsu. Rute na backendu su takođe zaštićene middleware-om da prihvate zahtjeve samo od korisnika sa ulogom `NAVIJAC`.

**Posljedice odluke:**
*Pozitivne:*
- Korisnički interfejs je čistiji i prilagođen specifičnoj ulozi korisnika.
- Backend i frontend su konzistentno zaštićeni.
*Negativne:*
- Povećana količina uslovnog renderovanja na frontendu (`isAuthenticated && korisnikData?.trenutnaUloga === 'NAVIJAC'`).

**Status odluke:** Prihvaćena i implementirana

---

## Odluka 3

**ID:** DL-S10-03

**Datum:** 01.06.2026.

**Naziv:** Integracija sekcije "Moji omiljeni timovi" u lijevu kolonu profila ispod angažmana

**Opis:**
Određivanje pozicije prikaza omiljenih timova na stranici `Profile.jsx`.

**Razmatrane opcije:**
- Kreirati poseban tab ili novu stranicu u navigaciji.
- Dodati novu karticu u lijevoj koloni profila ispod "Aktivni angažmani".

**Odabrana opcija:**
Dodavanje nove kartice u lijevoj koloni profila ispod aktivnih angažmana.

**Razlog izbora:**
Lijeva kolona na profilu služi za prikaz osnovnih korisničkih informacija i trenutnih uloga/angažmana. Prikazivanje omiljenih timova na ovom mjestu pruža brz i jasan pregled korisničkih preferencija čim se otvori profil, te vizuelno balansira stranicu bez potrebe za komplikovanjem navigacije.

**Posljedice odluke:**
*Pozitivne:*
- Odlična preglednost i intuitivan UX.
- Dizajn kartice prati stil "Aktivnih angažmana", čime se čuva vizuelna konzistentnost aplikacije.
- Omogućeno brzo uklanjanje omiljenog tima direktno sa profila bez navigacije na stranicu Timovi.
*Negativne:*
- Ukoliko korisnik ima mnogo omiljenih timova, lijeva kolona se može izdužiti, ali s obzirom na to da se prikazuju samo osnovni podaci (sport i naziv tima), to ne narušava izgled stranice.

**Status odluke:** Prihvaćena i implementirana
