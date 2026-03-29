# Product Vision

---

## Naziv projekta
Sistem za upravljanje sportskim terminima i ligama - SportManager

---

## Problem koji sistem rješava

Osnovni problem koji ovaj sistem rješava je neefikasnost i fragmentacija u organizaciji sporta, naročito rekreativnog i amaterskog. Problem je  prisutan na svim nivoima — od malih lokalnih liga i turnira, pa sve do ozbiljnijih sportskih organizacija. Većina sportskih centara i amaterskih liga i dalje se oslanja na neformalne kanale komunikacije (Viber/WhatsApp grupe), plakate, usmeno dogovaranje ili papirnu evidenciju. To je pristup podložan greškama, teško skalabilan, i rezultira nejasnim rasporedima i propuštenim informacijama.

#### Ključni problemi:
* **Organizacijski propusti:** Obavještenja o rasporedu se šalju putem društvenih mreža, igrači i gledaoci prekasno saznaju o promjenama rasporeda ili otkazivanjem, jer su informacije rasute po različitim platformama. Vođenje tabela sa rezultatima se vrši ručno, a često i samo na papiru.
* **Netransparentnost i nedostatak podataka:** Ne postoji jednostavan način za pregled historije rezultata ili statistika timova. Gledaoci i navijači su isključeni iz dešavanja jer nemaju uvid u trenutno stanje i rezultate u realnom vremenu.
* **Finansijska neažurnost:** Problemi sa evidencijom uplata članarina ili zakupa termina.
* **Slaba popunjenost kapaciteta:** Potencijalni korisnici nemaju jednostavan način da provjere slobodne termine bez direktnog zvanja vlasnika terena. S druge strane, mnoga sportska dešavanja ostaju neposjećena jer ne postoji jedinstveno mjesto gdje bi se publika mogla informisati o lokalnim ligama i utakmicama.

Rješavanje ovih problema direktno utiče na profesionalizaciju amaterskog sporta. Ovaj sistem rješava navedene probleme tako što omogućava centralizovan pristup svim informacijama na jednom mjestu. Sistem nudi platformu za automatsko generisanje tabela i uvid u raspored. Organizatori u nekoliko koraka obavještavaju sve učesnike o relevantnim informacijama. Ekipe samostalno upravljaju svojim prijavama i učešćem. Također,  vlasnici terena dobijaju alat za bolju popunjenost kapaciteta, dok igrači i gledaoci imaju uvid u svaku promjenu, čime se stvara moderna i transparentna sportska zajednica.

---

## Ciljni korisnici

1. Organizatori liga i turnira
2. Igrači, treneri
3. Gledaoci i lokalna zajednica, ljubitelji sporta
4. Vlasnici i menadžeri sportskih objekata

---

## Vrijednost sistema

Glavne vrijednosti koje sistem donosi su:

1. Smanjuje se vrijeme utrošeno na administraciju – rasporedi se kreiraju automatski, rezultati se unose brzo, a tabele se ažuriraju trenutno, što svodi greške na minimum. 
2. Centralizovan pristup informacijama
Sistem služi kao jedinstvena platforma za sve učesnike:
* **Igrači i treneri** više ne moraju pretraživati historiju poruka u Viber grupama; svi rasporedi, lokacije i satnice su im dostupni u dva klika.
* **Gledaoci i mediji** dobijaju uvid u rezultate i stanje na tabeli u realnom vremenu.
3. Pojednostavljena organizacija i prijava – Organizatori mogu brzo slati obavještenja svim učesnicima, dok se ekipe prijavljuju i upravljaju svojim učešćem direktno kroz platformu, bez potrebe za razmjenom poruka ili papirnom evidencijom.
4. Vlasnici sportskih objekata dobijaju alat koji direktno utiče na njihovu profitabilnost:
* Veća vidljivost slobodnih termina smanjuje broj neiskorištenih sati u dvoranama.
* Jasna evidencija o uplatama (članarina ili zakupa) omogućava bolju finansijsku kontrolu.
5. Dobiva se skalabilan sistem koji podiže nivo profesionalnosti amaterskog sporta. Digitalna prisutnost čine ligu privlačnijom za sponzore i nove partnere.
6. Transparentnost i fair-play – Automatsko generisanje tabele na osnovu unesenih rezultata eliminiše mogućnost manipulacije i gradi povjerenje među učesnicima.
---

## Scope MVP verzije

- Registracija i upravljanje korisnicima – Registracija korisnika s podrškom za različite uloge (administrator, organizator, igrač, gledaoc, vlasnik objekta, trener)
- Upravljanje sportskim sadržajem – Unos i uređivanje kategorija sporta, liga, turnira i ekipa od strane organizatora
- Unos rezultata i automatske tabele – Nakon unosa rezultata utakmice, sistem automatski ažurira tabelu, bodove i statistiku
- Kreiranje i pregled rasporeda – Organizatori kreiraju rasporede utakmica koji su vidljivi svim korisnicima u realnom vremenu
- Pregled sportskih dešavanja – Prikaz predstojećih i odigranih utakmica s mogućnošću filtriranja po sportu, ligi, timu ili datumu
- Prijava ekipa na takmičenje, učešće u ligi 
- Pregled dostupnosti sportskih objekata – Korisnici mogu pregledati slobodne i zauzete termine dvorana i terena bez direktnog kontakta s vlasnikom
-Rezervacija termina – Može se poslati zahtjev za rezervaciju slobodnog termina, a vlasnik objekta ga odobrava ili odbija. Nakon odobrenja, termin se automatski označava kao zauzet.
- Obavještenja i notifikacije – Slanje obavještenja učesnicima o promjenama rasporeda, rezultatima i važnim informacijama

---

## Šta ne ulazi u MVP

- Online plaćanje – Plaćanje kotizacija, članarina i zakupa objekata nije podržano; finansijske transakcije se obavljaju van sistema
- Detaljna statistika igrača: (npr. broj žutih kartona, asistencije - za sada samo rezultat tima)
- Višejezičnost
- Chat i direktna komunikacija – Razmjena poruka između korisnika unutar sistema nije podržana
- Napredni izvještaji i PDF izvoz – Izvoz tabela, rasporeda ili statistika u PDF format nije planiran u MVP-u

---

## Ključna ograničenja i pretpostavke

### Tehnička ograničenja
* Obavezna je stabilna veza za ažuriranje i pregled podataka u realnom vremenu
* Web-first pristup: Sistem se razvija prvenstveno kao responzivna web aplikacija optimizovana i za mobilne uređaje
* Sistem ne podržava integraciju s vanjskim kalendarima u MVP

### Poslovna ograničenja
* U MVP fazi ne postoji integracija s kartičnim plaćanjem; finansijske transakcije se obavljaju van sistema
* Sistem je prvenstveno namijenjen amaterskim i rekreativnim ligama

### Organizacijska ograničenja
* Sistem zavisi o ažurnosti administratora. Ako se rezultati ne unose na vrijeme, sistem gubi "real-time" vrijednost - ne podržava automatski uvoz rezultata iz vanjskih izvora
* Vlasnici i menadžeri sportskih objekata odgovorni su za pravovremeno ažuriranje dostupnosti svojih prostora
* Pravna odgovornost: Organizatori su odgovorni za prikupljanje saglasnosti igrača za javnu objavu njihovih podataka na platformi

### Ključne pretpostavke
* Pretpostavlja se da svi korisnici imaju osnovno znanje korištenja web aplikacija
* Organizatori liga preuzimaju odgovornost za upravljanje ligom i unosom podataka
* Ispravnost unesenih rezultata – pretpostavlja se da odgovorni unosi ispravne podatke
* Pretpostavlja se da postoji dovoljan interes korisnika za korištenje ovakvog sistema u lokalnoj sportskoj zajednici
