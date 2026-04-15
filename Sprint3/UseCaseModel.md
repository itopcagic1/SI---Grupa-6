# Use Case Model

---

# UC-01: Registracija korisnika
### Akter:
Novi korisnik (Gost)
### Naziv use casea:
Registracija korisnika (Gosta)
### Kratak opis:
Novi korisnik (gost) kreira korisnički nalog u sistemu unosom email adrese, lozinke i odabirom uloge. Nakon uspješne registracije, korisnik dobija pristup funkcionalnostima koje odgovaraju odabranoj ulozi.
### Preduslovi:
* Korisnik nije registrovan u sistemu
* Korisnik ima pristup formi za registraciju
* Korisnik posjeduje validnu email adresu
### Glavni tok:
1. Korisnik otvara formu za registraciju
2. Korisnik unosi email adresu, lozinku i odabira ulogu
3. Korisnik klikne dugme "Registracija"
4. Sistem validira unesene podatke (format emaila, jačina lozinke, dostupnost emaila)
5. Sistem kreira novi korisnički nalog
6. Sistem prikazuje potvrdu o uspješnoj registraciji
### Alternativni tokovi:
A1: Email već postoji – ako email već postoji u sistemu, prikazuje se poruka: "Ovaj email je već registrovan"

A2: Nevalidan email – ako email nije u ispravnom formatu, sistem prikazuje poruku: "Unesite ispravan email"

A3: Neispravna lozinka – ako lozinka ne zadovoljava minimalne uslove (dužina, složenost), sistem prikazuje poruku: "Lozinka nije ispravna"

### Ishod:
Korisnički nalog je uspješno kreiran i korisnik može pristupiti sistemu koristeći registrovane podatke. Korisnik je preusmjeren na stranicu za prijavu ili direktno na dashboard.

---

# UC-02: Prijava korisnika
### Akter:
Registrovani korisnik
### Naziv use casea:
Prijava korisnika (Login)
### Kratak opis:
Registrovani korisnik se prijavljuje u sistem unosom email adrese i lozinke kako bi pristupio svom nalogu i funkcionalnostima koje su mu dodijeljene prema ulozi.
### Preduslovi:
* Korisnik posjeduje registrovan nalog u sistemu
* Korisnik nije trenutno prijavljen
* Sistem je dostupan
### Glavni tok:
1. Korisnik unosi svoju email adresu i lozinku
2. Korisnik klikne dugme "Login"
3. Sistem provjerava ispravnost unesenih podataka
4. Sistem prijavljuje korisnika i kreira sesiju
5. Sistem preusmjerava korisnika na odgovarajući dashboard
### Alternativni tokovi:
A1: Pogrešni podaci – ako su email ili lozinka netačni, sistem prikazuje poruku: "Pogrešan email ili lozinka"

A2: Sistem nedostupan – prijava nije moguća, prikazuje se odgovarajuća poruka o grešci

### Ishod:
Korisnik je uspješno prijavljen u sistem. Korisnička sesija je uspostavljena i korisnik ima pristup svim funkcionalnostima koje odgovaraju njegovoj ulozi.

---

# UC-03: Odjava
### Akter:
Korisnik / Administrator / Organizator / Trener / Igrač
### Naziv use casea:
Odjava iz sistema (Logout)
### Kratak opis:
Prijavljeni korisnik se odjavljuje iz sistema kako bi zaštitio svoj nalog i spriječio neovlašteni pristup, naročito na dijeljenim uređajima. Sistem sigurno prekida aktivnu sesiju.
### Preduslovi:
* Korisnik je trenutno prijavljen u sistem
* Postoji aktivna korisnička sesija
### Glavni tok:
1. Korisnik klikne opciju "Odjava" ili "Logout"
2. Sistem prekida i poništava aktivnu sesiju korisnika
3. Sistem preusmjerava korisnika na stranicu za prijavu
4. Sistem onemogućava pristup zaštićenim stranicama bez ponovne prijave
### Alternativni tokovi:
Nema – odjava je uvijek uspješna dok postoji aktivna sesija

### Ishod:
Korisnik je uspješno odjavljen iz sistema. Sesija je poništena, svi pristupni tokeni su invalidovani i korisnik više ne može pristupiti zaštićenim sadržajima bez ponovne prijave.

---

# UC-04: Upravljanje korisnicima
### Akter:
Administrator
### Naziv use casea:
Upravljanje korisnicima
### Kratak opis:
Administrator pregledava listu svih korisnika sistema i upravlja njihovim nalozima – ima mogućnost brisanja ili blokiranja korisnika radi održavanja reda i sigurnosti platforme.
### Preduslovi:
* Administrator je prijavljen u sistem
* Administrator posjeduje odgovarajuća administratorska prava
* U sistemu postoje registrovani korisnici
### Glavni tok:
1. Administrator otvara listu svih korisnika u administratorskom panelu
2. Administrator pretražuje ili filtrira korisnike po potrebi
3. Administrator odabira željenog korisnika
4. Administrator izvršava akciju (brisanje ili blokiranje korisničkog naloga)
5. Sistem sprema promjene i ažurira status korisnika
### Alternativni tokovi:
A1: Neautorizovan pristup – ako korisnik nema administratorska prava, sistem prikazuje poruku: "Nemate pristup ovoj funkciji"

A2: Pokušaj brisanja sopstvenog naloga – sistem sprečava administratora da obriše vlastiti nalog

### Ishod:
Korisnički nalog je uspješno izmijenjen ili uklonjen iz sistema. Promjene su evidentirane.

---

# UC-05: Upravljanje sportovima i ligama
### Akter:
Administrator
### Naziv use casea:
Upravljanje sportovima i ligama
### Kratak opis:
Administrator dodaje nove sportove i lige u sistem ili uređuje postojeće kako bi osigurao ažurnost i tačnost kataloga sportskog sadržaja koji je dostupan korisnicima.
### Preduslovi:
* Administrator je prijavljen u sistem
* Administrator posjeduje odgovarajuća prava za upravljanje sadržajem
### Glavni tok:
1. Administrator bira opciju za dodavanje ili uređivanje sporta/lige
2. Administrator unosi ili mijenja potrebne podatke
3. Administrator potvrđuje i sprema promjene
4. Sistem validira unesene podatke
5. Sistem ažurira katalog sportova i liga
### Alternativni tokovi:
A1: Duplikat – ako sport ili liga već postoji u sistemu, sistem prikazuje poruku: "Podatak već postoji"

A2: Nevalidni podaci – ako podaci nisu u ispravnom formatu ili su nepotpuni, sistem prikazuje poruku: "Unesite ispravne podatke"

### Ishod:
Katalog sportova i liga je uspješno ažuriran. Novi ili izmijenjeni sadržaj je odmah vidljiv korisnicima u sistemu.

---

# UC-06: Prijava tima na takmičenje
### Akter:
Trener
### Naziv use casea:
Prijava tima na takmičenje
### Kratak opis:
Trener prijavljuje tim na određeno takmičenje ili ligu unosom potrebnih podataka o timu. Sistem provjerava ispunjenost svih uslova za učešće prije nego što potvrdi prijavu.
### Preduslovi:
* Trener je prijavljen u sistem
* Takmičenje/liga je dostupna za prijave
* Tim je registrovan u sistemu
### Glavni tok:
1. Trener odabira takmičenje i otvara formu za prijavu tima
2. Trener unosi ili potvrđuje podatke tima
3. Trener klikne dugme "Prijava"
4. Sistem validira podatke i provjrava ispunjenost uslova za učešće
5. Sistem sprema prijavu i evidentira tim kao prijavljen
6. Sistem prikazuje potvrdu uspješne prijave
### Alternativni tokovi:
A1: Neispunjeni uslovi – ako tim ne ispunjava uslove za učešće (npr. nedovoljno igrača, administrativni razlozi), sistem prikazuje poruku: "Tim ne ispunjava uslove"

### Ishod:
Tim je uspješno prijavljen na takmičenje. Prijava je evidentirana u sistemu i trener dobija potvrdu. Tim je vidljiv u listi prijavljenih timova.

---

# UC-07: Zakazivanje utakmice
### Akter:
Organizator
### Naziv use casea:
Zakazivanje utakmice
### Kratak opis:
Organizator kreira termin utakmice odabirom datuma, vremena i timova koji igraju. Sistem provjerava dostupnost termina i timova kako bi spriječio konflikte u rasporedu.
### Preduslovi:
* Organizator je prijavljen u sistem
* Postoje registrovani timovi u sistemu
* Željeni termin je slobodan
### Glavni tok:
1. Organizator otvara formu za zakazivanje utakmice
2. Organizator unosi datum, vrijeme i odabira timove koji igraju
3. Organizator klikne dugme "Spremi"
4. Sistem validira podatke i provjrava dostupnost termina i timova
5. Sistem sprema zakazanu utakmicu
6. Sistem prikazuje potvrdu i obavještava relevantne učesnike
### Alternativni tokovi:
A1: Termin je već zauzet – ako postoji preklapanje sa drugim utakmicom ili terminom, sistem prikazuje poruku: "Termin je već zauzet"

A2: Nepotpuni podaci – ako nedostaju obavezni podaci, sistem prikazuje poruku: "Popunite sva polja"

### Ishod:
Utakmica je uspješno zakazana i evidentirana u sistemu. Termin je vidljiv u rasporedu i relevantni korisnici su obaviješteni.

---

# UC-08: Pregled sadržaja
### Akter:
Gost / Korisnik
### Naziv use casea:
Pregled utakmica i rezultata
### Kratak opis:
Korisnik ili neregistrovani gost pregledava dostupan sportski sadržaj – utakmice, rezultate i rasporede. Pregled je moguć bez registracije i prijave, uz mogućnost korištenja filtera za lakše pronalaženje željenog sadržaja.
### Preduslovi:
* Sistem je dostupan
* Postoje evidentirani podaci u sistemu (nije uslov za samo otvaranje sekcije)
### Glavni tok:
1. Korisnik otvara aplikaciju ili navigira do sekcije sa sadržajem
2. Sistem prikazuje dostupne utakmice, rezultate i rasporede
3. Korisnik koristi filtere (sport, liga, datum, tim) za preciziranje prikaza
4. Sistem ažurira prikaz prema odabranim filterima
### Alternativni tokovi:
A1: Nema podataka – ako nema evidentiranih utakmica ili rezultata, sistem prikazuje poruku: "Nema dostupnih podataka"

### Ishod:
Korisniku su prikazani traženi sportski podaci. Sadržaj je dostupan bez obaveze registracije ili prijave.

---

# UC-09: Evidencija utakmice
### Akter:
Organizator
### Naziv use casea:
Unos rezultata utakmice
### Kratak opis:
Organizator unosi rezultate odigrane utakmice u sistem kako bi se ažurirali statistike, tabele i historija. Sistem validira unesene podatke i ažurira sve relevantne sekcije.
### Preduslovi:
* Organizator je prijavljen u sistem
* Utakmica je prethodno zakazana i evidentirana u sistemu
* Utakmica je odigrana
### Glavni tok:
1. Organizator odabira odigranu utakmicu
2. Organizator unosi konačne rezultate i eventualne statistike
3. Organizator klikne dugme "Spremi"
4. Sistem validira unesene podatke
5. Sistem sprema rezultate i ažurira tabele i statistike
### Alternativni tokovi:
A1: Nevalidni podaci – ako su uneseni podaci u neispravnom formatu ili logički netačni (npr. negativan rezultat), sistem prikazuje poruku: "Neispravni podaci"

### Ishod:
Rezultati utakmice su uspješno evidentirani. Tabele i statistike su automatski ažurirani i nova informacija je vidljiva svim korisnicima.

---

# UC-10: Pregled tabele
### Akter:
Korisnik
### Naziv use casea:
Pregled leaderboarda / rang tabele
### Kratak opis:
Korisnik pregledava trenutni poredak timova ili igrača u odabranoj ligi ili takmičenju. Tabela se automatski ažurira na osnovu evidentiranih rezultata utakmica.
### Preduslovi:
* U sistemu postoje evidentirani rezultati utakmica
* Tabela je generisana na osnovu odigranih mečeva
### Glavni tok:
1. Korisnik otvara sekciju za pregled tabele
2. Korisnik odabira ligu ili takmičenje
3. Sistem prikazuje aktuelni poredak timova/igrača sa relevantnim statistikama
### Alternativni tokovi:
A1: Nema podataka – ako tabela još nije generisana ili nema odigranih utakmica, sistem prikazuje poruku: "Nema dostupne tabele"

### Ishod:
Korisniku je prikazana ažurna rang tabela za odabranu ligu ili takmičenje sa svim relevantnim statistikama.

---

# UC-11: Rezervacija termina
### Akter:
Igrač
### Naziv use casea:
Rezervacija slobodnog termina
### Kratak opis:
Igrač rezerviše slobodan termin za korištenje sportskog objekta zbog individualnog treninga. Sistem provjerava dostupnost termina i sprečava dvostruke rezervacije kako bi se osigurala fer raspodjela kapaciteta.
### Preduslovi:
* Igrač je prijavljen u sistem
* Postoji slobodan termin u sistemu
* Igrač nema drugu rezervaciju u istom terminu
### Glavni tok:
1. Igrač pregledava dostupne termine
2. Igrač odabira željeni **slobodan** termin
3. Igrač klikne dugme "Rezerviši"
4. Sistem provjerava da li igrač već ima rezervaciju u tom terminu, kao i status korisnika (da li je na listi nepouzdanih korisnika)
5. a) Sistem automatski potvrđuje rezervaciju i označava termin kao zauzet (ako korisnik nije na listi nepouzdanih korisnika) <br> b) Ako je korisnik na listi nepouzdanih korisnika, rezervacija se stavlja na čekanje i šalje se notifikacija korisniku
### Alternativni tokovi:
A1: Termin je već zauzet – ako je termin u međuvremenu zauzet, sistem prikazuje poruku: "Termin je već rezervisan"

A2: Dupla rezervacija – ako igrač već ima rezervaciju u tom periodu, sistem prikazuje poruku: "Već imate rezervaciju u ovom terminu"


### Ishod:
Termin je uspješno rezervisan. Rezervacija je evidentirana u sistemu i igrač dobija potvrdu. Termin je označen kao zauzet i vidljiv ostalim korisnicima.

---

# UC-12: Otkazivanje rezervacije
### Akter:
Korisnik
### Naziv use casea:
Otkazivanje rezervacije termina
### Kratak opis:
Korisnik otkazuje prethodno rezervisan termin u slučaju da ga više ne može iskoristiti. Sistem oslobađa termin i eventualno obavještava korisnike sa liste čekanja.
### Preduslovi:
* Korisnik je prijavljen u sistem
* Korisnik posjeduje aktivnu rezervaciju
* Nije istekao rok za otkazivanje
### Glavni tok:
1. Korisnik otvara pregled svojih rezervacija
2. Korisnik odabira rezervaciju koju želi otkazati
3. Korisnik klikne dugme "Otkaži"
4. Sistem traži potvrdu akcije
5. Korisnik potvrđuje otkazivanje
6. Sistem briše rezervaciju i oslobađa termin
7. Sistem obavještava prvog korisnika sa liste čekanja (ako postoji)
8. Sistem provjerava vrijeme otkazivanja: ako je prekasno, korisniku se upisuje "prekršaj" u profil.
### Alternativni tokovi:
A1: Prekasno otkazivanje – ako je prošao rok za otkazivanje, sistem prikazuje poruku: "Ne možete otkazati termin u ovom periodu"

A2: Vlasnik sportskog objekta može otkazati automatski potvrđenu rezervaciju najkasnije 24 sata prije početka termina uz obavezno navođenje razloga

### Ishod:
Rezervacija je uspješno otkazana. Termin je oslobođen i dostupan ostalim korisnicima. Korisnici na listi čekanja su obaviješteni o oslobođenom terminu.

---

# UC-13: Lista čekanja
### Akter:
Korisnik
### Naziv use casea:
Upravljanje statusom na čekanju i uslovna verifikacija
### Kratak opis:
Sistem stavlja korisnika u status čekanja bilo na njegov zahtjev (za zauzete termine) ili automatski (za nepouzdane korisnike), kako bi se omogućila naknadna rezervacija ili ručna provjera vlasnika.
### Preduslovi:
* Korisnik je prijavljen u sistem
* Termin je zauzet ili je korisnik označen kao nepouzdan
* Korisnik nije već na listi čekanja za taj termin
### Glavni tok:
1. Korisnik pokušava rezervisati termin ili bira opciju za prijavu na listu.
2. Sistem vrši provjeru dostupnosti termina i statusa korisnika:
3. a) Ako je termin zauzet: Korisnik potvrđuje prijavu na listu čekanja. <br>
   b) Ako termin nije zauzet, ali je korisnik nepouzdan: Sistem automatski prebacuje zahtjev na listu za verifikaciju vlasniku (UC-16).
4. Sistem evidentira korisnika u odgovarajuću bazu čekanja (pasivna lista za obavijesti ili aktivna za verifikaciju).
5. Sistem prikazuje potvrdu korisniku o statusu "Na čekanju".
### Alternativni tokovi:
A1: Već prijavljen – ako je korisnik već na listi čekanja za taj termin, sistem prikazuje poruku: "Već ste na listi čekanja"

A2: Odustajanje – Korisnik može u svakom trenutku povući svoj zahtjev sa liste čekanja.
### Ishod:
Korisnik je stavljen na listu čekanja ili verifikacije. U slučaju oslobađanja termina ili odobrenja od strane vlasnika, korisnik biva obaviješten o mogućnosti finalizacije rezervacije.
---

# UC-14: Upravljanje terminima
### Akter:
Vlasnik objekta
### Naziv use casea:
Upravljanje dostupnim terminima
### Kratak opis:
Vlasnik sportskog objekta kreira, uređuje ili uklanja dostupne termine za korištenje objekta. Vlasnik definiše radno vrijeme objekta i fiksno trajanje termina (60/90 min). Sistem sprječava preklapanje termina i osigurava konzistentnost rasporeda.
### Preduslovi:
* Vlasnik objekta je prijavljen u sistem
* Vlasnik posjeduje prava za upravljanje terminima
### Glavni tok:
1. Vlasnik otvara kalendar i pregled termina svog objekta
2. Vlasnik odabira opciju za dodavanje novog ili uređivanje postojećeg termina
3. Vlasnik unosi ili mijenja podatke termina (datum, vrijeme, trajanje, kapacitet)
4. Vlasnik sprema promjene
5. Sistem validira podatke i provjerava preklapanja
6. Sistem ažurira raspored dostupnih termina
### Alternativni tokovi:
A1: Preklapanje termina – ako se novi termin preklapa sa već postojećim, sistem prikazuje poruku: "Termin se preklapa sa postojećim"

### Ishod:
Termini su uspješno ažurirani. Promjene su vidljive korisnicima koji pretražuju dostupne termine.

---

# UC-15: Pregled zahtjeva za rezervaciju
### Akter:
Vlasnik objekta
### Naziv use casea:
Pregled pristiglih zahtjeva za rezervaciju
### Kratak opis:
Vlasnik pregledava sve rezervacije u realnom vremenu. Sistem automatski odvaja potvrđene termine od onih koji čekaju na ručnu verifikaciju.
### Preduslovi:
* Vlasnik objekta je prijavljen u sistem
* U sistemu postoje pristigli zahtjevi za rezervaciju
### Glavni tok:
1. Vlasnik otvara Dashboard sekciju za rezervacije.
2. Sistem prikazuje hronološku listu rezervacija sa jasno označenim statusima (Potvrđeno, Na čekanju, Otkazano).
3. Vlasnik selektuje određenu rezervaciju kako bi vidio detaljan profil korisnika.
4. Sistem prikazuje podatke o korisniku: ime, kontakt i evidenciju prekršaja (broj nepojavljivanja ili kasnih otkazivanja).
5. Sistem prikazuje preostalo vrijeme za odluku o nepouzdanim korisnicima (24h od zahtjeva ili 2h pred termin), dok za pouzdane korisnike omogućava otkazivanje samo ako je do termina ostalo više od 24h.
6. Vlasnik na osnovu uvida u profil i tajmer donosi odluku o daljim akcijama (odobravanje, odbijanje ili otkazivanje).
### Alternativni tokovi:
A1: Nema zahtjeva – ako ne postoje pristigli zahtjevi, sistem prikazuje poruku: "Nema dostupnih zahtjeva"

A2: Istekao rok – ako je preostalo vrijeme do termina manje od 24h, opcija otkazivanja za pouzdane korisnike se zaključava.
### Ishod:
Vlasnik objekta ima potpun uvid u status termina i kredibilitet korisnika, što mu omogućava informisano upravljanje kapacitetima.

---

# UC-16: Odobravanje rezervacije sa liste čekanja za korisnike koji imaju prethodne prekršaje
### Akter:
Vlasnik objekta
### Naziv use casea:
Odobravanje zahtjeva za rezervaciju
### Kratak opis: Vlasnik objekta vrši ručnu validaciju i odobrava zahtjev za rezervaciju korisnika koji se nalazi na listi nepouzdanih (zbog prethodnih prekršaja). Sistem nakon odobrenja finalizuje rezervaciju i obavještava korisnika.
### Preduslovi:
* Vlasnik objekta je prijavljen u sistem
* Postoji zahtjev za rezervaciju koji čeka na odobrenje
* Nije istekao rok za odluku (24h od zahtjeva ili 2h pred termin)
### Glavni tok:
1. Vlasnik pregledava zahtjev za rezervaciju
2. Vlasnik otvara detalje zahtjeva kako bi pregledao profil korisnika i historiju njegovih prethodnih prekršaja.
3. Vlasnik klikne dugme "Odobri", čime potvrđuje da prihvata rizik rezervacije za navedenog korisnika.
4. Sistem validira dostupnost termina u realnom vremenu kako bi osigurao da nije došlo do preklapanja.
5. Sistem mijenja status rezervacije iz "Na čekanju" u "Potvrđeno".
6. Sistem automatski prekida tajmer za verifikaciju koji je bio vezan za taj zahtjev.
7. Sistem šalje notifikaciju korisniku sa potvrdom da je vlasnik ručno odobrio njegov termin.
### Alternativni tokovi:
A1: Termin već zauzet – ako je termin u međuvremenu već zauzet, sistem prikazuje poruku: "Termin više nije dostupan" i zahtjev se ne može odobriti

A2: Istek vremena za odobrenje – Ako vlasnik ne izvrši korak 3 unutar predviđenog roka (24h/2h pred termin), sistem automatski odbija zahtjev.

### Ishod:
Rezervacija je uspješno odobrena. Termin je označen kao zauzet i korisnik je obaviješten o odobrenoj rezervaciji.

---

# UC-17: Odbijanje zahtjeva ili otkazivanje rezervacije
### Akter:
Vlasnik objekta
### Naziv use casea:
Odbijanje zahtjeva ili otkazivanje rezervacije
### Kratak opis:
Vlasnik objekta odbija zahtjev nepouzdanog korisnika u predviđenom roku ili otkazuje pouzdanu automatski potvrđenu rezervaciju najkasnije 24h prije početka.
### Preduslovi:
* Vlasnik objekta je prijavljen u sistem
* Zahtjev je u statusu "Na čekanju" ili je rezervacija "Potvrđena".
### Glavni tok:
1. Vlasnik na Dashboardu selektuje rezervaciju koju želi odbiti ili otkazati.
2. Sistem provjerava preostalo vrijeme (tajmer) kako bi utvrdio da li je intervencija i dalje moguća.
3. Vlasnik klikne dugme "Odbij/Otkaži"
4. Sistem otvara prozor za unos obrazloženja, gdje je vlasnik obavezan navesti razlog (npr. "Korisnik na listi nepouzdanih korisnika", "Privatni termin", "Tehnički kvar").
5. Vlasnik potvrđuje akciju nakon unosa razloga.
6. Sistem mijenja status rezervacije u "Odbijeno" ili "Otkazano"
7. Sistem oslobađa termin u kalendaru, čineći ga ponovo dostupnim za druge korisnike.
8. Sistem šalje notifikaciju korisniku koja sadrži informaciju o otkazivanju i navedeno obrazloženje vlasnika.
### Alternativni tokovi:
A1: Isteklo vrijeme za otkazivanje – ako je do početka termina ostalo manje od 24 sata, sistem onemogućava opciju otkazivanja.

A2: Nedostaje obrazloženje – ako vlasnik pokuša potvrditi otkazivanje bez unosa teksta, sistem prikazuje poruku: "Morate navesti razlog otkazivanja" i ne dozvoljava završetak akcije.

### Ishod:
Zahtjev za rezervaciju je odbijen ili otkazan. Korisnik je obaviješten o tome, a termin je oslobođen za nove zahtjeve.

---

# UC-18: Rezervacija grupnog termina
### Akter:
Trener
### Naziv use casea:
Rezervacija grupnog termina za tim
### Kratak opis:
Trener rezerviše termin za cijeli tim radi treninga. Sistem provjerava dostupnost termina i kapacitet objekta u odnosu na veličinu grupe.
### Preduslovi:
* Trener je prijavljen u sistem
* Postoji slobodan termin koji odgovara potrebama grupe
* Tim je registrovan u sistemu
### Glavni tok:
1. Trener pregledava dostupne termine
2. Trener odabira termin pogodan za grupnu aktivnost
3. Trener unosi podatke o grupi (naziv tima, broj učesnika, aktivnost)
4. Trener klikne dugme "Rezerviši"
5. Sistem provjerava listu nepouzdanih korisnika
6. a) Ako trener nije na listi nepouzdanih korisnika – automatski potvrđuje rezervaciju <br>
   b) Ako jest – stavlja na čekanje i šalje notifikaciju treneru
### Alternativni tokovi:
A1: Termin je već zauzet – ako je termin u međuvremenu zauzet, sistem prikazuje poruku: "Termin je već rezervisan"

A2: Nevalidni podaci – ako uneseni podaci nisu ispravni ili aktivnost nije validna, sistem prikazuje odgovarajuću poruku o grešci

### Ishod:
Grupni termin je uspješno rezervisan. Rezervacija je evidentirana u sistemu i trener dobija potvrdu. Termin je označen kao zauzet.

---

# UC-19: Pregled rasporeda
### Akter:
Igrač
### Naziv use casea:
Pregled rasporeda termina
### Kratak opis:
Igrač pregledava raspored svih dostupnih i zakazanih termina u sistemu. Uz mogućnost filtriranja po datumu, tipu aktivnosti ili objektu, igrač može planirati vlastito učešće.
### Preduslovi:
* Igrač je prijavljen u sistem
* U sistemu postoje zakazani ili dostupni termini
### Glavni tok:
1. Igrač otvara sekciju za pregled rasporeda
2. Sistem prikazuje listu ili kalendarski prikaz rasporeda termina
3. Igrač filtrira termine po datumu, objektu ili tipu aktivnosti
4. Sistem prikazuje filtrirane rezultate
### Alternativni tokovi:
A1: Nema termina – ako ne postoje zakazani termini za odabrani period ili filter, sistem prikazuje poruku: "Nema dostupnih termina"

### Ishod:
Igraču je prikazan kompletan raspored termina prema odabranim filterima. Na osnovu pregleda, igrač može planirati rezervacije.

---

# UC-20: Notifikacije
### Akter:
Navijač / Korisnik
### Naziv use casea:
Praćenje omiljenog tima i primanje notifikacija
### Kratak opis:
Korisnik bira omiljeni tim ili timove koje želi pratiti. Sistem automatski šalje notifikacije o relevantnim događajima vezanim za odabrane timove (rezultati, zakazane utakmice i sl.).
### Preduslovi:
* Korisnik je registrovan i prijavljen u sistem
* U sistemu postoje registrovani timovi
### Glavni tok:
1. Korisnik otvara postavke ili profil
2. Korisnik pronalazi i odabira omiljeni tim
3. Sistem sprema izbor korisnika
4. Sistem počinje slati notifikacije o relevantnim događajima za odabrani tim
### Alternativni tokovi:
A1: Nije odabran tim – ako korisnik pokuša potvrditi bez odabira tima, sistem prikazuje poruku: "Odaberite tim"

### Ishod:
Notifikacije su aktivirane za odabrani tim. Korisnik će automatski primati obavještenja o relevantnim događajima vezanim za praćeni tim.

---

# UC-21: AI predikcija
### Akter:
Korisnik
### Naziv use casea:
Pregled AI predikcija utakmica
### Kratak opis:
Korisnik pristupa sekciji sa AI generisanim predikcijama ishoda utakmica. Sistem na osnovu historijskih podataka i relevantnih faktora generiše vjerovatnoće i analitičke uvide za predstojeće mečeve.
### Preduslovi:
* Korisnik je prijavljen u sistem
* Postoje predstojeće utakmice za koje su dostupni analitički podaci
* AI servis je dostupan i funkcionalan
### Glavni tok:
1. Korisnik otvara sekciju "AI Predikcije"
2. Sistem dohvata i prikazuje predikcije za predstojeće utakmice
3. Korisnik pregledava i analizira prikazane predikcije i statistike
### Alternativni tokovi:
A1: Nema podataka – ako AI servis nema dovoljno podataka za generisanje predikcija ili je nedostupan, sistem prikazuje poruku: "Predikcije trenutno nisu dostupne"

### Ishod:
Korisniku su prikazane AI predikcije za predstojeće utakmice. Predikcije pomažu korisnicima u donošenju informisanijih odluka vezanih za praćenje sportskih takmičenja.

---

# UC-22: Administracija sistema
### Akter:
Administrator
### Naziv use casea:
Upravljanje i kontrola sistema
### Kratak opis:
Administrator pristupa administratorskom panelu gdje ima uvid u ključne parametre sistema, može vršiti sistemske izmjene i nadzirati rad platforme radi osiguranja stabilnosti i sigurnosti.
### Preduslovi:
* Administrator je prijavljen u sistem sa administratorskim pravima
* Administrator posjeduje važeće administratorske kredencijale
### Glavni tok:
1. Administrator pristupa administratorskom panelu
2. Sistem prikazuje pregled ključnih sistemskih podataka i statistika
3. Administrator pregledava podatke i identifikuje stavke za izmjenu
4. Administrator vrši potrebne izmjene ili konfiguracije
5. Sistem sprema i primjenjuje promjene
### Alternativni tokovi:
A1: Neautorizovan pristup – ako korisnik nema administratorska prava, sistem prikazuje poruku: "Pristup odbijen" i preusmjerava na korisničku stranicu

### Ishod:
Sistemske promjene su uspješno primijenjene. Administrator ima potpun uvid u stanje sistema i može efikasno upravljati platformom.

---

# UC-23: Generisanje PDF izvještaja
### Akter:
Administrator / Organizator
### Naziv use casea:
Izvoz podataka u PDF format
### Kratak opis:
Administrator ili organizator generiše PDF izvještaj o odabranim podacima iz sistema (rezultati, raspored, statistike) radi dokumentacije, arhiviranja ili dijeljenja sa zainteresovanim stranama.
### Preduslovi:
* Korisnik je prijavljen u sistem sa odgovarajućim pravima
* U sistemu postoje podaci koji mogu biti izvezeni
* PDF servis je dostupan
### Glavni tok:
1. Korisnik odabira opciju eksportovanja podataka
2. Korisnik specificira parametre izvještaja (period, tip podataka, format)
3. Sistem generiše PDF dokument na osnovu odabranih parametara
4. Sistem nudi preuzimanje generisanog dokumenta
### Alternativni tokovi:
A1: Nema podataka – ako za odabrane parametre nema dostupnih podataka, sistem prikazuje poruku: "Nema podataka za izvoz"

### Ishod:
PDF izvještaj je uspješno generisan i dostupan za preuzimanje. Izvještaj sadrži sve tražene podatke u čitljivom i organizovanom formatu.

