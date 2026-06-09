# Release Notes

**Naziv sistema:** Sistem za upravljanje sportskim takmičenjima, timovima, sportskim objektima i rezervacijama

**Verzija:** Finalna isporuka

**Datum:** 09.06.2026.

**Namjena dokumenta:** Ovaj dokument opisuje šta je uključeno u finalnu verziju sistema, koje funkcionalnosti su isporučene, koja ograničenja postoje, koji su poznati bugovi i šta nije dio finalne isporuke.

---

## 1. Pregled finalne verzije

Finalna verzija sistema predstavlja full-stack web aplikaciju namijenjenu za upravljanje sportskim takmičenjima, korisnicima, timovima, utakmicama, sportskim objektima, terminima, rezervacijama i AI predikcijama.

Sistem podržava više korisničkih uloga i omogućava različite tokove rada za administratore, organizatore, trenere, igrače, vlasnike sportskih objekata i navijače.

Core funkcionalnosti sistema su uglavnom implementirane i obuhvataju autentifikaciju, upravljanje korisnicima, timovima, ligama, utakmicama, rezultatima, tabelama, statistikama, rezervacijama termina, grupnim treninzima, notifikacijama, PDF izvozom i AI predikcijama.

---

## 2. Šta je uključeno u finalnu verziju

Finalna verzija sistema uključuje sljedeće glavne cjeline:

* autentifikaciju i upravljanje korisničkim računima,
* rad sa različitim korisničkim ulogama,
* administratorski modul,
* upravljanje sportovima, ligama i timovima,
* prijavu ekipa na takmičenja,
* generisanje rasporeda utakmica,
* javni pregled utakmica, rezultata, rasporeda i tabela,
* unos i izmjenu rezultata utakmica,
* automatsko formiranje tabela/plasmana,
* statistike igrača i timova,
* upravljanje sportskim objektima i terminima,
* individualne rezervacije termina,
* grupne treninge,
* vlasnički dashboard za zahtjeve i rezervacije,
* listu čekanja za zauzete termine,
* odabir omiljenog tima za navijače,
* in-app notifikacije,
* real-time komunikacijski sloj preko Socket.IO,
* PDF izvoz tabela, rezultata i rasporeda,
* AI predikcije utakmica i konačnog poretka lige,

---

## 3. Najvažnije isporučene funkcionalnosti

### 3.1. Autentifikacija i korisnički računi

Sistem omogućava korisnicima osnovne tokove rada vezane za korisnički račun:

* registraciju korisnika,
* prijavu korisnika,
* odjavu korisnika,
* pregled i izmjenu profila,
* promjenu lozinke,
* zaboravljenu lozinku,
* reset lozinke putem email servisa.

Podržane korisničke uloge su:

* ADMINISTRATOR,
* ORGANIZATOR,
* TRENER,
* IGRAC,
* VLASNIK,
* NAVIJAC.

---

### 3.2. Administratorski modul

Administrator ima mogućnost upravljanja korisnicima i korisničkim ulogama.

Isporučene funkcionalnosti uključuju:

* pregled korisnika,
* pretragu korisnika,
* odobravanje i odbijanje zahtjeva za uloge,
* blokiranje korisnika,
* brisanje korisnika,
* promjenu korisničke uloge.

Ova funkcionalnost omogućava kontrolu pristupa sistemu i administraciju korisničke baze.

---

### 3.3. Upravljanje sportovima, ligama i timovima

Sistem omogućava organizaciju sportskih takmičenja kroz rad sa sportovima, ligama i timovima.

Isporučene funkcionalnosti uključuju:

* kreiranje i upravljanje sportovima,
* kreiranje i upravljanje ligama,
* kreiranje i upravljanje timovima,
* dodavanje igrača u tim,
* uklanjanje igrača iz tima,
* dodavanje trenera u tim,
* uklanjanje trenera iz tima,
* prijavu ekipe na takmičenje.

Ove funkcionalnosti čine osnovu takmičarskog dijela sistema.

---

### 3.4. Utakmice, raspored i rezultati

Sistem podržava upravljanje utakmicama i rezultatima.

Isporučene funkcionalnosti uključuju:

* generisanje rasporeda utakmica,
* javni pregled rasporeda,
* javni pregled rezultata,
* javni pregled tabela lige,
* unos rezultata utakmice,
* izmjenu rezultata utakmice,
* automatsko ažuriranje tabele nakon unosa rezultata.

Nakon unosa ili izmjene rezultata, sistem automatski ažurira stanje na tabeli i povezane prikaze.

---

### 3.5. Statistike

Sistem omogućava prikaz statistika za igrače i timove.

Isporučene funkcionalnosti uključuju:

* statistiku igrača,
* statistiku timova,
* prikaz najboljih strijelaca,

Ove funkcionalnosti korisnicima omogućavaju lakši pregled učinka pojedinaca i ekipa.

---

### 3.6. Sportski objekti i termini

Sistem podržava upravljanje sportskim objektima i terminima.

Isporučene funkcionalnosti uključuju:

* kreiranje sportskih objekata,
* pregled sportskih objekata,
* kreiranje termina,
* izmjenu termina,
* blokiranje termina,
* pregled dostupnih termina,
* upravljanje terminima od strane vlasnika objekta.

Ova funkcionalnost je osnova za modul rezervacija.

---

### 3.7. Individualne rezervacije

Sistem podržava individualne rezervacije termina.

Isporučene funkcionalnosti uključuju:

* pregled slobodnih termina,
* slanje zahtjeva za rezervaciju,
* prikaz statusa rezervacije,
* potvrđivanje ili odbijanje zahtjeva od strane vlasnika,
* prikaz rezervacija korisnika.

Za korisnike koji zahtijevaju verifikaciju, sistem podržava tok u kojem se zahtjev prvo šalje vlasniku objekta na odobravanje.

---

### 3.8. Grupni treninzi

Sistem omogućava rad sa grupnim treninzima.

Isporučene funkcionalnosti uključuju:

* kreiranje grupnog treninga od strane trenera,
* pregled dostupnih grupnih treninga,
* prijavu igrača na grupni trening,
* odjavu igrača sa grupnog treninga,
* otkazivanje grupnog treninga,
* pregled grupnih treninga od strane trenera.

Ovaj modul omogućava trenerima da organizuju treninge, a igračima da se prijave na dostupne termine.

---

### 3.9. Vlasnički dashboard

Vlasnici sportskih objekata imaju poseban dashboard za upravljanje rezervacijama i zahtjevima.

Isporučene funkcionalnosti uključuju:

* pregled rezervacija,
* pregled zahtjeva na čekanju,
* odobravanje zahtjeva,
* odbijanje zahtjeva,
* pregled statusa termina.

Ova funkcionalnost omogućava vlasniku objekta da kontroliše korištenje termina i upravlja zahtjevima korisnika.

---

### 3.10. Lista čekanja

Sistem podržava listu čekanja za zauzete termine.

Isporučene funkcionalnosti uključuju:

* dodavanje korisnika na listu čekanja,
* pregled korisnika na listi čekanja,
* povezivanje liste čekanja sa zauzetim terminima.

Ova funkcionalnost omogućava korisnicima da pokažu interes za termin koji trenutno nije slobodan.

---

### 3.11. Omiljeni tim

Navijači mogu odabrati omiljeni tim.

Isporučene funkcionalnosti uključuju:

* odabir omiljenog tima,
* pregled informacija povezanih sa omiljenim timom.

Ova funkcionalnost je namijenjena personalizaciji korisničkog iskustva za navijače.

---

### 3.12. Notifikacije

Sistem ima implementiran modul za notifikacije.

Isporučene funkcionalnosti uključuju:

* in-app notifikacije,
* real-time sloj preko Socket.IO,
* obavještavanje korisnika o važnim promjenama unutar sistema.

Email notifikacije nisu implementirane kao univerzalan sistem za sve korisničke događaje, već se email koristi prvenstveno za tok resetovanja lozinke.

---

### 3.13. PDF izvoz

Sistem podržava PDF izvoz za određene dijelove aplikacije.

Isporučene funkcionalnosti uključuju:

* PDF izvoz tabela,
* PDF izvoz rezultata,
* PDF izvoz rasporeda.

PDF izvoz je implementiran u finalnoj verziji sistema i omogućava izvoz tabela, rezultata i rasporeda u PDF formatu.

---

### 3.14. AI predikcije

Sistem uključuje AI servis za predikcije.

Isporučene funkcionalnosti uključuju:

* AI predikciju ishoda utakmica,
* AI predikciju konačnog poretka lige,
* korištenje posebnog FastAPI servisa za AI funkcionalnosti.

AI predikcije zavise od dostupnosti AI servisa i kvaliteta historijskih podataka. Zbog toga se rezultati predikcija trebaju posmatrati kao pomoćna informacija, a ne kao garantovan ishod.

---

## 4. Poznata ograničenja sistema

Finalna verzija sistema ima sljedeća poznata ograničenja:

### 4.1. AI servis

AI predikcije zavise od posebnog AI servisa. Ako AI servis nije pokrenut ili nije dostupan, predikcije neće biti moguće prikazati.

Kvalitet predikcija zavisi od dostupnih historijskih podataka. Ako nema dovoljno podataka o utakmicama, timovima i rezultatima, predikcija može biti manje pouzdana.

---

### 4.2. Email notifikacije

Sistem nema potpun univerzalni email notification modul za sve događaje u aplikaciji.

Email servis se koristi prvenstveno za funkcionalnosti zaboravljene lozinke i resetovanja lozinke. Većina ostalih obavijesti realizovana je kroz in-app notifikacije.

---

## 5. Poznati bugovi

### 5.1. Neusklađenost timeout pravila u dokumentaciji

Dokumentacija nije potpuno usklađena po pitanju vremena za automatsko odbijanje rezervacija.

Na različitim mjestima spominju se različita pravila, kao što su:

* 1 sat,
* 2 sata,
* 24 sata.

Kod sadrži posebnu logiku za računanje timeout vrijednosti, ali zbog problema sa workerom nije sigurno da se ovaj tok izvršava pouzdano.

---

### 5.2. Zastarjela API dokumentacija za admin rute

Dio API dokumentacije za administratorske rute nije usklađen sa stvarnim stanjem u kodu.

Dokumentacija spominje neke starije rute, dok finalni kod koristi drugačije rute za upravljanje korisnicima i ulogama.

Ovo ne znači nužno da funkcionalnost ne postoji, već da dokumentacija ne odražava tačan finalni API oblik.

---

## 6. Šta nije dio finalne isporuke

Sljedeće funkcionalnosti nisu dio finalne isporuke ili nisu isporučene kao potpuno završene funkcionalnosti:

### 6.1. Automatska odjava nakon neaktivnosti

Automatska odjava korisnika nakon perioda neaktivnosti nije pronađena kao potpuno implementiran frontend/backend tok.

Sistem ima standardnu odjavu korisnika, ali nema jasno implementiran idle-timeout mehanizam koji automatski odjavljuje korisnika nakon neaktivnosti.

---

### 6.2. Univerzalne email notifikacije

Sistem ne uključuje univerzalni email notification modul za sve korisničke akcije.

Email se koristi za reset lozinke, dok su ostale notifikacije uglavnom realizovane kao in-app notifikacije.

---

