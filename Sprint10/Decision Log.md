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

---

## Odluka 4

**ID:** DL-S10-04

**Datum:** 02.06.2026.

**Naziv:** Odustajanje od podrške za bosanske afrikate u PDF izvještaju

**Opis:**
PDFKit-ov ugrađeni Helvetica font ne podržava Unicode znakove (š, č, ć, ž, đ). Trebalo je odlučiti da li dodati Unicode font.

**Razmatrane opcije:**
- Koristiti sistemski font s računara (npr. Arial iz `C:\Windows\Fonts`).
- Ostaviti Helvetica bez afrikata.

**Odabrana opcija:**
Ostavljanje Helvetica fonta bez podrške za afrikate.

**Razlog izbora:**
Sistemski fontovi nisu prenosivi između različitih operativnih sistema i mašina članova tima, što bi uzrokovalo greške pri pokretanju na Linuxu ili drugom računaru. 

**Posljedice odluke:**
*Pozitivne:*
- Nema eksternih zavisnosti ni promjena u strukturi repozitorija.
- Backend radi identično na svim mašinama članova tima.
*Negativne:*
- Bosanski znakovi se ne prikazuju korektno u PDF dokumentima — poznato ograničenje za buduće sprinteve.

**Status odluke:** Prihvaćena (privremeno — ostaviti za buduće poboljšanje)

## Odluka 5
**ID:** DL-S10-05
**Datum:** 02.06.2026.  
**Naziv:** Odustajanje od kreiranja i integracije AI asistenta u ovom sprintu  
**Opis:** Razmatranje uvođenja AI integracije za predikciju rezultata ili pametne notifikacije navijačima na osnovu istorije omiljenih timova.  
**Razmatrane opcije:**  
- Implementirati osnovni AI modul (korištenjem LLM API-ja) za generisanje sedmičnih sažetaka i predikcija za navijače.  
- Potpuno odustati od AI integracije u ovom sprintu i fokusirati se na stabilnost core funkcionalnosti.  
**Odabrana opcija:** Odustajanje od kreiranja AI integracije u ovom sprintu.  
**Razlog izbora:** Primarni fokus Sprinta 10 je stabilizacija sistema notifikacija, rješavanje tehničkih zavisnosti i omogućavanje pouzdanog PDF izvještavanja. Uvođenje AI komponenti u ovoj fazi bi donijelo prevelik tehnički rizik, povećalo troškove eksternih API-jeva i potencijalno ugrozilo rokove isporuke glavnih acceptance criteria za navijače.  
**Posljedice odluke:**  
- *Pozitivne:* Smanjen obim posla (scope creep), fokus tima je ostao na kritičnim core funkcionalnostima i stabilnosti koda.  
- *Negativne:* Navijači u ovom sprintu neće imati napredne pametne preporuke niti automatizovane AI analize mečeva.  
**Status odluke:** Odbijeno / Odustalo se od implementacije
