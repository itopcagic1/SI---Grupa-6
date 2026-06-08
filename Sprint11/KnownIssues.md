# Known issues / limitations

Ovaj dokument sadrži iskrenu listu poznatih problema, tehničkih ograničenja i nedovršenih funkcionalnosti sistema za upravljanje sportskim terminima i ligama. 



---

## 1. Poznati bugovi

- Trenutno nisu zabilježeni bugovi u sistemu. 

---

## 2. Tehnička ograničenja

### 2.1 Ovisnost o eksternom AI servisu za predikciju

Funkcionalnost AI predikcije rezultata i poretka na tabeli (PB-37) oslanja se na poziv eksternom AI API-ju. Ovo znači:

- Ako eksterni servis nije dostupan, predikcija neće biti generisana.
- Svaki poziv nosi latenciju koja ovisi o opterećenju eksternog servisa.
- Kvalitet predikcije direktno ovisi o količini i kvaliteti historijskih podataka u sistemu - pri malom broju odigranih utakmica predikcija može biti nepouzdana ili trivijalna.

### 2.2 Ručni unos podataka

Sistem u potpunosti ovisi o ovlaštenim licima (organizatori, treneri, vlasnici objekata) koja ručno unose podatke. Nije implementovana nijedna forma automatskog uvoza podataka (npr. iz vanjskih liga ili rasporeda). Posljedice:

- Kvalitet i potpunost podataka direktno ovisi o disciplini korisnika koji unose podatke.
- Sistem ne može detektovati ni ispraviti namjerno ili slučajno unešene netačne podatke (npr. pogrešan rezultat utakmice).
- Nema mehanizma bulk uvoza (CSV, Excel) — svaki unos je individualan kroz UI.

### 2.3 Infrastruktura i skalabilnost


- Redis (korišten kroz Bull/BullMQ za zadatke u redu čekanja) mora biti aktivan za rad notifikacija i asinhronih procesa. Pad Redis instance uzrokuje prekid ovih funkcionalnosti bez vidljive greške prema korisniku.
- PostgreSQL baza podataka se oslanja na `DATABASE_URL` iz `.env` fajla — nije konfigurisan connection pooling za veće opterećenje.

### 2.4 Email notifikacije

- Notifikacije putem emaila se šalju kroz SendGrid servis. Bez validnog API ključa i konfiguracije, notifikacije neće biti isporučene.
- Sistem ne rukuje bounce-ovima niti nedostavljenim emailovima — nema ponovnog pokušaja slanja ni obavještenja administratoru.

### 2.5 Čuvanje dokumenata korisnika

- U modelu `Korisnik` postoji polje `documents String[]` koje čuva putanje ili reference na dokumente (npr. za verifikaciju uloge). Sistem za stvarno pohranjivanje fajlova (file storage) nije implementovan kao zasebni servis — fajlovi se vjerovatno čuvaju lokalno, što nije pogodno za produkcijsko okruženje.

---

## 3. Sigurnosna ograničenja


- **Refresh tokeni** su pohranjeni direktno u bazi (`refreshToken String?`) bez dodatnog sloja enkripcije. Kompromitovanje baze izlaže sve aktivne sesije.
- **Autorizacija uloga** je implementovana na nivou aplikacijske logike, no nije provođen sigurnosni audit kako bi se potvrdilo da ne postoje putevi zaobilaženja provjera.
- Sistem nema implementovanu zaštitu od brute-force napada na endpoint za prijavu izvan standardnog `express-rate-limit` paketa, koji je konfigurisan globalno, a ne specifično po osjetljivim rutama.
- Ne postoji mehanizam za detekciju i blokiranje neobičnih obrazaca ponašanja (npr. previše zahtjeva za rezervaciju u kratkom periodu od jednog korisnika).

---

## 4. Nedovršene funkcionalnosti

- **PDF izvoz** (PB-39): Paket `pdfkit` je dodan kao zavisnost, ali funkcionalnost izvoza tabela i rasporeda u PDF format nije implementovana.
- **Statistike igrača i timova**: Modeli `StatistikaIgracaNaUtakmici`, `StatistikaTimaNaUtakmici`, `TipStatistike` i prateće vrijednosti postoje u shemi baze podataka, ali UI za unos i prikaz statistika nije implementovan.
- **Lista čekanja za rezervacije** (`StavkaListeCekanja`): Model postoji u bazi, ali logika automatskog preuzimanja termina sa liste čekanja nije potvrđeno implementovana.
- **Grupni treninzi**: Model `GrupniTrening` i `PrijavaGrupnogTreninga` su definirani u shemi, ali ova funkcionalnost nije eksplicitno navedena kao završena u backlogu.
- **Responzivni UI** (PB-38): Sistem je razvijan web-first pristupom. Optimizacija za mobilne uređaje je planirana ali nije potvrđeno završena.
- **Verifikacija uloga korisnika**: Polja `trazenaUloga`, `statusUloge`, `datumZahtjeva` i `documents` na modelu `Korisnik` sugerišu da postoji tok zahtjeva za promjenu uloge, ali kompletnost ovog toka nije potvrđena.

---

## 5. Pretpostavke koje sistem pravi

- **Korisnik je svjestan dostupnosti funkcionalnosti prema ulozi.** Sistem pretpostavlja da korisnici razumiju da određene akcije (kreiranje lige, rezervacija termina, unos rezultata) zahtijevaju prijavu i odgovarajuću ulogu. Ne postoji proaktivno vođenje neregistrovanih korisnika kroz onboarding.
- **Organizator je pouzdan akter.** Sistem pretpostavlja da organizator koji kreira takmičenje i raspoređuje utakmice unosi tačne podatke. Ne postoji mehanizam za prigovor ili korekciju od strane učesničkih timova.
- **Vlasnik objekta aktivno prati sistem.** Logika verifikacije rezervacija pretpostavlja da vlasnik redovno provjerava dashboard i reaguje u zadanom roku (24h, odnosno 2h prije termina). Pasivni vlasnici uzrokuju automatska odbijanja.
- **Jedan korisnik = jedna uloga.** Sistem dodjeljuje jednu primarnu ulogu po korisniku. Korisnik koji je istovremeno, npr., trener i vlasnik objekta mora koristiti dva odvojena naloga ili mu se mora ručno prilagoditi uloga od strane administratora.
- **Sportovi i tipovi statistike su unaprijed definirani.** Sistem pretpostavlja da administrator ili inicijalni setup unosi sportove i tipove statistike. Nije predviđeno da krajnji korisnici dodaju nove sportove samoinicijativno.
- **Internetska veza je stabilna.** Real-time funkcionalnosti (Socket.IO notifikacije, AI predikcije) pretpostavljaju stabilnu konekciju. Sistem nema offline mode niti graceful degradation za slučaj prekida veze.

---

## 6. Dijelovi sistema koje ne treba predstavljati kao potpuno završene

- **AI predikcija rezultata** je implementovana kao funkcionalan poziv prema eksternom servisu, ali nije prošla opsežno testiranje sa stvarnim podacima. 
- **Sistem notifikacija** je arhitekturalno postavljen (Bull/BullMQ + SendGrid + Socket.IO), ali end-to-end testiranje svih notifikacijskih tokova nije potvrđeno završeno.

- **Sigurnosni sloj** zadovoljava osnovne zahtjeve (bcrypt, JWT, rate limiting), ali to nije formalno potvrđeno od strane nekoga ko aktivno traži rupe u sistemu.


---

