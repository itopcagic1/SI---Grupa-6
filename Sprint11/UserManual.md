# User Manual

**Naziv sistema:** Sistem za upravljanje sportskim takmičenjima, timovima, sportskim objektima i rezervacijama

**Verzija:** Finalna isporuka

**Datum:** 09.06.2026.

**Namjena dokumenta:** Ovaj dokument opisuje kako krajnji korisnici koriste sistem, koje korisničke uloge postoje, kako se izvršavaju najvažniji korisnički tokovi i koja su ograničenja sistema.

---

## 1. Uvod

Sistem je web aplikacija namijenjena za upravljanje sportskim takmičenjima, timovima, utakmicama, sportskim objektima, terminima, rezervacijama, grupnim treninzima, statistikama i AI predikcijama.

Aplikacija omogućava različitim korisnicima da, u zavisnosti od svoje uloge, obavljaju zadatke kao što su registracija i prijava, upravljanje korisnicima, kreiranje timova i liga, prijava ekipe na takmičenje, pregled rasporeda i rezultata, rezervacija sportskih termina, organizacija grupnih treninga, pregled notifikacija i korištenje AI predikcija.

Ovaj priručnik je pisan za krajnjeg korisnika sistema i ne zahtijeva tehničko znanje o implementaciji aplikacije.

---

## 2. Kome je sistem namijenjen

Sistem je namijenjen sljedećim grupama korisnika:

* administratorima sistema,
* organizatorima sportskih takmičenja,
* trenerima,
* igračima,
* vlasnicima sportskih objekata,
* navijačima,
* javnim korisnicima koji žele pregledati utakmice, rezultate, raspored i tabelu.

Cilj sistema je da na jednom mjestu omogući organizaciju sportskih aktivnosti, upravljanje takmičenjima i rezervacijama, te bolji pregled sportskih informacija za sve učesnike.

---

## 3. Korisničke uloge

Sistem podržava više korisničkih uloga. Svaka uloga ima različite mogućnosti unutar aplikacije.

### 3.1. Administrator

Administrator upravlja korisnicima i korisničkim ulogama.

Administrator može:

* pregledati korisnike,
* pretraživati korisnike,
* odobriti ili odbiti zahtjev za korisničku ulogu,
* blokirati korisnika,
* obrisati korisnika,
* promijeniti korisničku ulogu.

### 3.2. Organizator

Organizator upravlja takmičarskim dijelom sistema.

Organizator može:

* upravljati sportovima,
* upravljati ligama,
* upravljati timovima,
* prijaviti ekipe na takmičenje,
* generisati raspored utakmica,
* unositi i uređivati rezultate utakmica,
* pregledati tabele i statistike.

### 3.3. Trener

Trener upravlja aktivnostima vezanim za timove i treninge.

Trener može:

* pregledati svoje timove,
* učestvovati u radu tima,
* kreirati grupne treninge,
* pregledati prijavljene igrače,
* otkazati grupni trening.

### 3.4. Igrač

Igrač koristi sistem za praćenje i učestvovanje u sportskim aktivnostima.

Igrač može:

* pregledati dostupne termine,
* poslati zahtjev za individualnu rezervaciju,
* prijaviti se na grupni trening,
* odjaviti se sa grupnog treninga,
* pregledati svoje rezervacije,
* pregledati utakmice, rezultate, raspored i tabelu.

### 3.5. Vlasnik sportskog objekta

Vlasnik upravlja sportskim objektima, terminima i zahtjevima za rezervaciju.

Vlasnik može:

* kreirati sportske objekte,
* pregledati svoje objekte,
* kreirati termine,
* uređivati termine,
* blokirati termine,
* pregledati zahtjeve za rezervaciju,
* odobriti ili odbiti zahtjeve za rezervaciju.

### 3.6. Navijač

Navijač koristi sistem za praćenje sportskih informacija.

Navijač može:

* pregledati utakmice,
* pregledati rezultate,
* pregledati raspored,
* pregledati tabelu,
* odabrati omiljeni tim,
* pregledati informacije povezane sa omiljenim timom.

---

## 4. Pristup sistemu

Sistemu se pristupa putem web preglednika.

Korisnik treba otvoriti link deploy verzije aplikacije:

```text
https://sportmanager-frontend-production.up.railway.app/
```

Nakon otvaranja aplikacije korisniku se prikazuje početna stranica ili stranica za prijavu.

**Slika 1. Početna stranica sistema**
<img width="2508" height="1327" alt="image" src="https://github.com/user-attachments/assets/5f296c14-f3d5-46e9-bf9f-40b7f697d9b1" />

---

## 5. Testni korisnici i demo kredencijali

Za potrebe testiranja i demonstracije sistema mogu se koristiti demo korisnički računi.

> Napomena: U tabelu ispod potrebno je unijeti stvarne demo kredencijale iz deploy baze ili seed podataka.

| Uloga         | Email                 | Lozinka     |
| ------------- | --------------------- | ----------- |
| Administrator | `[admin@gmail.com]`       | `[Sifra123!]` |
| Organizator   | `[organizator@gmail.com]` | `[Organizator123!]` |
| Trener        | `[trener@gmail.com]`      | `[Sifra123!]` |
| Nepouzdan igrač         | `[lamineyamal@gmail.com ]`       | `[Lozinka123!]` |
| Pouzdan igrač         | `[eddzeko@gmail.com ]`       | `[Lozinka123!]` |
| Vlasnik       | `[vlasnik@gmail.com]`     | `[Lozinka123]` |
| Navijač       | `[navijac2@gmail.com]`     | `[Lozinka123!]` |

Demo korisnici služe za brzu provjeru funkcionalnosti sistema bez potrebe za kreiranjem novih korisničkih računa.

---

## 6. Glavni ekrani sistema

### 6.1. Početna stranica

Početna stranica predstavlja ulaznu tačku u sistem.

Na početnoj stranici korisnik može:

* otvoriti formu za prijavu,
* otvoriti formu za registraciju,
* pregledati javno dostupne informacije, ako su omogućene,
* pristupiti glavnim dijelovima sistema nakon prijave.

**Slika 2. Početna stranica**
<img width="2508" height="1327" alt="image" src="https://github.com/user-attachments/assets/5f296c14-f3d5-46e9-bf9f-40b7f697d9b1" />

---

### 6.2. Ekran za prijavu

Ekran za prijavu omogućava korisniku da se prijavi u sistem pomoću email adrese i lozinke.

Na ovom ekranu korisnik unosi:

* email adresu,
* lozinku.

Nakon uspješne prijave sistem korisnika preusmjerava na odgovarajući dashboard prema njegovoj ulozi.

**Slika 3. Forma za prijavu**
<img width="1636" height="1234" alt="image" src="https://github.com/user-attachments/assets/07a9170d-6b78-41e9-bb16-625942778f4f" />

---

### 6.3. Ekran za registraciju

Ekran za registraciju omogućava novom korisniku da kreira korisnički račun.

Korisnik unosi osnovne podatke, kao što su:

* ime,
* prezime,
* email,
* lozinka,
* željena korisnička uloga, ako je omogućena kroz formu.

Nakon registracije korisnik se može prijaviti u sistem ili čekati odobrenje uloge, u zavisnosti od pravila sistema.

**Slika 4. Forma za registraciju**
<img width="973" height="1245" alt="image" src="https://github.com/user-attachments/assets/fc77a923-3311-444c-bc70-de778f9b871d" />
---

### 6.4. Korisnički dashboard

Nakon prijave, korisniku se prikazuje dashboard prilagođen njegovoj ulozi.

Dashboard može sadržavati:

* navigaciju prema dostupnim funkcionalnostima,
* pregled relevantnih podataka,
* notifikacije,
* brze akcije,
* status korisničkih zahtjeva.

**Slika 5. Korisnički dashboard**
<img width="2496" height="1093" alt="image" src="https://github.com/user-attachments/assets/7d2515b8-1b26-45f6-8ba0-57975709fcbd" />

---

### 6.5. Admin dashboard

Admin dashboard je namijenjen administratoru sistema.

Administrator na ovom ekranu može:

* pregledati listu korisnika,
* pretraživati korisnike,
* odobravati ili odbijati zahtjeve za uloge,
* blokirati korisnike,
* brisati korisnike,
* mijenjati korisničke uloge.

**Slika 6. Admin dashboard**
<img width="2521" height="716" alt="image" src="https://github.com/user-attachments/assets/340f990a-0960-469d-99db-1c3f3f308f58" />

---

### 6.6. Ekran za timove i lige

Ovaj ekran omogućava rad sa timovima, ligama i takmičenjima.

Korisnik sa odgovarajućom ulogom može:

* kreirati tim,
* pregledati timove,
* dodavati igrače i trenere u tim,
* kreirati ligu,
* prijaviti ekipu na takmičenje,
* generisati raspored utakmica.

**Slika 7.1. Timovi**
<img width="2011" height="1034" alt="image" src="https://github.com/user-attachments/assets/fe0d0d41-e53a-4959-82d3-75ade678ebff" />

**Slika 7.2. Lige**
<img width="2049" height="1094" alt="image" src="https://github.com/user-attachments/assets/d2946828-7f93-4565-8537-a9848d6c0c11" />

---

### 6.7. Ekran za utakmice, rezultate i tabelu

Ovaj ekran omogućava pregled utakmica, rasporeda, rezultata i tabela.

Korisnici mogu:

* pregledati raspored utakmica,
* pregledati rezultate,
* pregledati stanje na tabeli,
* pregledati statistike,
* izvesti podatke u PDF formatu, ako je opcija dostupna.

**Slika 8.1. Raspored**
<img width="2012" height="937" alt="image" src="https://github.com/user-attachments/assets/f82b7205-62b2-47b8-80b0-cf8b4c016f6b" />

**Slika 8.2. Rezultati**
<img width="2093" height="1072" alt="image" src="https://github.com/user-attachments/assets/a69eb4f0-8ba5-43b3-b36d-780bc5304845" />

**Slika 8.3. Tabela**
<img width="2034" height="1188" alt="image" src="https://github.com/user-attachments/assets/4cbace4a-5d9d-40c5-af6a-4876144a087d" />

---

### 6.8. Ekran za sportske objekte i termine

Ovaj ekran omogućava pregled sportskih objekata i dostupnih termina.

Igrači mogu pregledati termine i poslati zahtjev za rezervaciju, dok vlasnici objekata mogu kreirati i uređivati termine.

**Slika 9.1. Sportski objekti**
<img width="2313" height="1319" alt="image" src="https://github.com/user-attachments/assets/fb50b4bf-be04-4d11-af86-6131a8815eb9" />

**Slika 9.2. Termini**
<img width="1948" height="1136" alt="image" src="https://github.com/user-attachments/assets/e0fc7ad5-dd26-475f-958a-a87ef9b7e210" />

---

### 6.9. Ekran za grupne treninge

Ekran za grupne treninge omogućava trenerima organizaciju treninga, a igračima prijavu na dostupne treninge.

**Slika 10. Grupni treninzi**
<img width="1790" height="662" alt="image" src="https://github.com/user-attachments/assets/33bc2240-aeb4-414e-9a82-72b38e1cf4c6" />

---

## 7. Korak-po-korak upute za najvažnije korisničke tokove

---

## 7.1. Registracija korisnika

Ovaj tok koristi novi korisnik koji želi kreirati račun u sistemu.

### Koraci

1. Otvoriti početnu stranicu sistema.
2. Kliknuti na opciju **Registracija**.
3. Unijeti tražene podatke:

   * ime,
   * prezime,
   * email,
   * lozinku,
4. Odabrati korisničku ulogu.
5. Kliknuti na dugme **Registruj se**.

### Očekivani rezultat

Nakon uspješne registracije sistem kreira korisnički račun.

Korisnik se može prijaviti u sistem ili, ako izabrana uloga zahtijeva odobrenje, neće imati pristup svim funkcionalnostima dok administrator ne odobri njegov zahtjev.

---

## 7.2. Prijava korisnika

Ovaj tok koristi postojeći korisnik koji želi pristupiti svom računu.

### Koraci

1. Otvoriti početnu stranicu sistema.
2. Kliknuti na opciju **Prijava**.
3. Unijeti email adresu.
4. Unijeti lozinku.
5. Kliknuti na dugme **Prijavi se**.

### Očekivani rezultat

Ako su podaci tačni, sistem prijavljuje korisnika i prikazuje dashboard prilagođen njegovoj ulozi.

Ako podaci nisu tačni, sistem prikazuje poruku o grešci.


---

## 7.3. Odjava korisnika

Ovaj tok koristi prijavljeni korisnik koji želi završiti sesiju.

### Koraci

1. U navigaciji pronaći opciju **Odjava** ili **Logout**.
2. Kliknuti na opciju za odjavu.

### Očekivani rezultat

Sistem odjavljuje korisnika i vraća ga na početnu stranicu ili stranicu za prijavu.

---

## 7.4. Resetovanje zaboravljene lozinke

Ovaj tok koristi korisnik koji je zaboravio lozinku.

### Koraci

1. Otvoriti ekran za prijavu.
2. Kliknuti na opciju **Zaboravljena lozinka**.
3. Unijeti email adresu povezanu sa korisničkim računom.
4. Potvrditi zahtjev.
5. Otvoriti email poruku za reset lozinke.
6. Kliknuti na link za reset lozinke.
7. Unijeti novu lozinku.
8. Potvrditi promjenu.

### Očekivani rezultat

Sistem postavlja novu lozinku. Korisnik se nakon toga može prijaviti pomoću nove lozinke.

---

## 7.5. Administrator odobrava ili odbija zahtjev za ulogu

Ovaj tok koristi administrator kada korisnik zatraži određenu ulogu u sistemu.

### Koraci

1. Prijaviti se kao administrator.
2. Otvoriti **Admin dashboard**.
3. Pronaći listu korisnika ili zahtjeva za uloge.
4. Pronaći korisnika čiji zahtjev treba obraditi.
5. Pregledati podatke korisnika.
6. Kliknuti na opciju **Odobri** ako je zahtjev validan.
7. Kliknuti na opciju **Odbij** ako zahtjev nije validan.

### Očekivani rezultat

Ako administrator odobri zahtjev, korisnik dobija traženu ulogu i može koristiti funkcionalnosti vezane za tu ulogu.

Ako administrator odbije zahtjev, korisnik ne dobija traženu ulogu i ostaje bez pristupa funkcionalnostima koje zahtijevaju tu ulogu.

---

## 7.6. Administrator mijenja ili blokira korisnika

Ovaj tok koristi administrator kada treba upravljati korisničkim računima.

### Koraci za promjenu uloge

1. Prijaviti se kao administrator.
2. Otvoriti **Admin dashboard**.
3. Pronaći korisnika u listi.
4. Odabrati opciju za promjenu uloge.
5. Izabrati novu ulogu.
6. Potvrditi izmjenu.

### Očekivani rezultat

Sistem ažurira korisničku ulogu. Korisnik nakon toga ima pristup funkcionalnostima nove uloge.

### Koraci za blokiranje korisnika

1. Prijaviti se kao administrator.
2. Otvoriti listu korisnika.
3. Pronaći korisnika.
4. Kliknuti na opciju **Blokiraj**.
5. Potvrditi akciju.

### Očekivani rezultat

Sistem blokira korisnika. Blokirani korisnik ne može normalno koristiti sistem dok mu administrator ponovo ne omogući pristup.

---

## 7.7. Kreiranje sporta, lige i tima

Ovaj tok koristi korisnik sa organizatorskim ovlaštenjima.

### Koraci za kreiranje sporta

1. Prijaviti se kao organizator.
2. Otvoriti modul za sportove.
3. Kliknuti na opciju **Dodaj sport**.
4. Unijeti naziv sporta.
5. Sačuvati unos.

### Očekivani rezultat

Sistem dodaje novi sport u listu dostupnih sportova.

### Koraci za kreiranje lige

1. Otvoriti modul za lige.
2. Kliknuti na opciju **Dodaj ligu**.
3. Unijeti naziv lige.
4. Odabrati sport kojem liga pripada.
5. Unijeti dodatne podatke ako ih forma zahtijeva.
6. Sačuvati ligu.

### Očekivani rezultat

Sistem kreira novu ligu i omogućava prijavu timova u tu ligu.

### Koraci za kreiranje tima

1. Otvoriti modul za timove.
2. Kliknuti na opciju **Dodaj tim**.
3. Unijeti naziv tima.
4. Odabrati sport ili ligu ako forma to zahtijeva.
5. Sačuvati tim.

### Očekivani rezultat

Sistem kreira tim i prikazuje ga u listi timova.

---

## 7.8. Dodavanje igrača ili trenera u tim

Ovaj tok koristi korisnik koji ima dozvolu za upravljanje timom.

### Koraci

1. Prijaviti se u sistem.
2. Otvoriti modul **Timovi**.
3. Odabrati željeni tim.
4. Otvoriti detalje tima.
5. Odabrati opciju za dodavanje igrača ili trenera.
6. Pronaći korisnika kojeg treba dodati.
7. Potvrditi dodavanje.

### Očekivani rezultat

Sistem dodaje izabranog korisnika u tim. Korisnik se nakon toga prikazuje u listi članova tima.

---

## 7.9. Prijava ekipe na takmičenje

Ovaj tok koristi korisnik koji ima pravo da prijavi ekipu na takmičenje.

### Koraci

1. Prijaviti se u sistem.
2. Otvoriti modul **Takmičenja** ili **Lige**.
3. Odabrati ligu ili takmičenje na koje se ekipa prijavljuje.
4. Kliknuti na opciju **Prijavi ekipu**.
5. Odabrati tim koji se prijavljuje.
6. Provjeriti podatke o ekipi.
7. Potvrditi prijavu.

### Očekivani rezultat

Sistem evidentira prijavu ekipe na takmičenje. Ekipa se nakon toga prikazuje u listi prijavljenih timova za izabrano takmičenje.

Ako prijava nije moguća, sistem prikazuje odgovarajuću poruku, na primjer ako je ekipa već prijavljena ili ako korisnik nema odgovarajuću ulogu.


---

## 7.10. Generisanje rasporeda utakmica

Ovaj tok koristi organizator nakon što su ekipe prijavljene na takmičenje.

### Koraci

1. Prijaviti se kao organizator.
2. Otvoriti željenu ligu ili takmičenje.
3. Provjeriti da li su ekipe prijavljene.
4. Kliknuti na opciju **Generiši raspored**.
5. Potvrditi akciju ako sistem traži potvrdu.

### Očekivani rezultat

Sistem generiše raspored utakmica za izabrano takmičenje.

Nakon generisanja, utakmice se prikazuju u rasporedu i dostupne su korisnicima za pregled.


---

## 7.11. Pregled utakmica, rezultata i tabele

Ovaj tok može koristiti svaki korisnik koji želi pratiti takmičenje.

### Koraci

1. Otvoriti aplikaciju.
2. Otvoriti modul **Utakmice**, **Raspored**, **Rezultati** ili **Tabela**.
3. Odabrati ligu ili takmičenje.
4. Pregledati dostupne podatke.

### Očekivani rezultat

Sistem prikazuje utakmice, rezultate i tabelu za izabrano takmičenje.

Ako utakmice još nisu odigrane ili rezultati nisu uneseni, sistem prikazuje trenutno dostupno stanje.


---

## 7.12. Unos ili izmjena rezultata utakmice

Ovaj tok koristi korisnik sa ovlaštenjem za unos rezultata.

### Koraci

1. Prijaviti se u sistem.
2. Otvoriti modul **Utakmice** ili **Rezultati**.
3. Pronaći utakmicu za koju se unosi rezultat.
4. Kliknuti na opciju **Unesi rezultat** ili **Izmijeni rezultat**.
5. Unijeti rezultat za obje ekipe.
6. Sačuvati promjene.

### Očekivani rezultat

Sistem čuva rezultat utakmice i automatski ažurira tabelu, statistike i povezane prikaze.

Ako rezultat nije validan, sistem prikazuje poruku o grešci.


---

## 7.13. Pregled statistika

Ovaj tok koristi korisnik koji želi vidjeti učinak igrača ili timova.

### Koraci

1. Otvoriti modul **Statistike**.
2. Odabrati prikaz statistika igrača ili timova.
3. Po potrebi odabrati ligu, tim ili igrača.
4. Pregledati prikazane podatke.

### Očekivani rezultat

Sistem prikazuje statističke podatke, kao što su statistike igrača, statistike timova i lista najboljih strijelaca.


---

## 7.14. Kreiranje sportskog objekta

Ovaj tok koristi vlasnik sportskog objekta.

### Koraci

1. Prijaviti se kao vlasnik.
2. Otvoriti modul **Sportski objekti**.
3. Kliknuti na opciju **Dodaj objekat**.
4. Unijeti podatke o objektu:

   * naziv objekta,
   * lokaciju,
   * opis,
   * kapacitet.
5. Sačuvati objekat.

### Očekivani rezultat

Sistem kreira sportski objekat i prikazuje ga u listi objekata vlasnika.

---

## 7.15. Kreiranje termina za sportski objekat

Ovaj tok koristi vlasnik sportskog objekta.

### Koraci

1. Prijaviti se kao vlasnik.
2. Otvoriti modul **Sportski objekti**.
3. Odabrati objekat za koji se kreira termin.
4. Otvoriti opciju **Termini**.
5. Kliknuti na **Dodaj termin**.
6. Unijeti datum, vrijeme i ostale podatke o terminu.
7. Sačuvati termin.

### Očekivani rezultat

Sistem kreira novi termin. Termin se prikazuje kao dostupan korisnicima, osim ako je označen kao blokiran ili zauzet.

---

## 7.16. Blokiranje ili izmjena termina

Ovaj tok koristi vlasnik kada želi spriječiti rezervaciju određenog termina ili promijeniti njegove podatke.

### Koraci za blokiranje termina

1. Prijaviti se kao vlasnik.
2. Otvoriti listu termina za sportski objekat.
3. Pronaći željeni termin.
4. Kliknuti na opciju **Blokiraj**.
5. Potvrditi akciju.

### Očekivani rezultat

Sistem označava termin kao blokiran. Korisnici ga ne mogu rezervisati dok je blokiran.

### Koraci za izmjenu termina

1. Pronaći termin u listi termina.
2. Kliknuti na opciju **Izmijeni**.
3. Promijeniti potrebne podatke.
4. Sačuvati izmjene.

### Očekivani rezultat

Sistem ažurira podatke o terminu i prikazuje novo stanje korisnicima.

---

## 7.17. Individualna rezervacija termina

Ovaj tok koristi igrač ili korisnik koji želi rezervisati slobodan termin.

### Koraci

1. Prijaviti se u sistem.
2. Otvoriti modul **Termini**.
3. Pregledati dostupne termine.
4. Odabrati željeni termin.
5. Kliknuti na opciju **Rezerviši**.

### Očekivani rezultat

Ako je termin slobodan i rezervacija ne zahtijeva dodatnu provjeru, sistem evidentira rezervaciju.

Ako korisnik ili termin zahtijevaju odobrenje vlasnika, sistem šalje zahtjev vlasniku objekta. Korisniku se prikazuje status da je zahtjev na čekanju.

---

## 7.18. Vlasnik odobrava ili odbija zahtjev za rezervaciju

Ovaj tok koristi vlasnik sportskog objekta kada korisnik pošalje zahtjev za rezervaciju.

### Koraci

1. Prijaviti se kao vlasnik.
2. Otvoriti **Monitoring rezervacija**.
4. Pronaći zahtjev za rezervaciju.
5. Pregledati podatke o korisniku, objektu i terminu.
6. Kliknuti na **Odobri** ako je zahtjev prihvatljiv.
7. Kliknuti na **Odbij** ako zahtjev nije prihvatljiv.

### Očekivani rezultat

Ako vlasnik odobri zahtjev, sistem potvrđuje rezervaciju i termin postaje zauzet.

Ako vlasnik odbije zahtjev, rezervacija se ne kreira, a termin ostaje dostupan ili se vraća u odgovarajući status.

Korisnik dobija informaciju o statusu zahtjeva kroz sistem.

---

## 7.19. Lista čekanja za zauzet termin

Ovaj tok koristi korisnik koji želi pokazati interes za termin koji trenutno nije slobodan.

### Koraci

1. Prijaviti se u sistem.
2. Otvoriti listu termina.
3. Pronaći termin koji je zauzet.
4. Kliknuti na opciju **Lista čekanja** ili **Prijavi se na listu čekanja**.
5. Potvrditi prijavu.

### Očekivani rezultat

Sistem dodaje korisnika na listu čekanja za izabrani termin.

Korisnik se evidentira kao zainteresovan za termin koji trenutno nije dostupan.

---

## 7.20. Kreiranje grupnog treninga

Ovaj tok koristi trener.

### Koraci

1. Prijaviti se kao trener.
2. Otvoriti modul **Grupni treninzi**.
3. Kliknuti na opciju **Kreiraj grupni trening**.
4. Odabrati termin ili unijeti podatke o treningu.
5. Unijeti maksimalan broj igrača, ako forma to zahtijeva.
6. Sačuvati grupni trening.

### Očekivani rezultat

Sistem kreira grupni trening. Trening se prikazuje igračima kao dostupan za prijavu.

---

## 7.21. Prijava igrača na grupni trening

Ovaj tok koristi igrač.

### Koraci

1. Prijaviti se kao igrač.
2. Otvoriti modul **Grupni treninzi**.
3. Pregledati dostupne termine.
4. Odabrati željeni termin.
5. Kliknuti na željeni termin kako bi se prijavili
6. U prozoru odabrati tim za koji želimo napraviti grupni trening

### Očekivani rezultat

Sistem evidentira prijavu igrača na grupni trening.

Ako je trening popunjen ili prijava nije moguća, sistem prikazuje odgovarajuću poruku.

---

## 7.22. Odjava sa grupnog treninga

Ovaj tok koristi igrač koji želi otkazati svoju prijavu.

### Koraci

1. Prijaviti se kao igrač.
2. Otvoriti listu svojih grupnih treninga.
3. Pronaći trening sa kojeg se želi odjaviti.
4. Kliknuti na opciju **Otkaži trening**.
5. Potvrditi odjavu.

### Očekivani rezultat

Sistem uklanja igrača sa liste prijavljenih za taj trening.

---

## 7.23. Otkazivanje grupnog treninga

Ovaj tok koristi trener koji je kreirao grupni trening.

### Koraci

1. Prijaviti se kao trener.
2. Otvoriti modul **Moji grupni treninzi**.
3. Pronaći trening koji treba otkazati.
4. Kliknuti na opciju **Otkaži trening**.
5. Potvrditi akciju.

### Očekivani rezultat

Sistem otkazuje grupni trening i ažurira njegov status.

Igrači koji su bili prijavljeni vide da trening više nije aktivan.

---

## 7.24. Odabir omiljenog tima

Ovaj tok koristi navijač.

### Koraci

1. Prijaviti se kao navijač.
2. Otvoriti modul **Timovi**.
3. Pronaći željeni tim.
4. Kliknuti na ikonicu srca pored željenog tima.

### Očekivani rezultat

Sistem čuva izabrani tim kao omiljeni tim korisnika.

Navijač nakon toga može lakše pratiti informacije povezane sa tim timom.

---

## 7.25. Pregled AI predikcija utakmica

Ovaj tok koristi korisnik koji želi vidjeti AI procjenu ishoda utakmice.

### Koraci

1. Prijaviti se u sistem.
2. Otvoriti modul **AI predikcije** unutar ekrana lige.
3. Odabrati opciju za predikciju utakmice.
4. Izabrati utakmicu ili timove za koje se želi prikazati predikcija.
5. Kliknuti na opciju **Prikaži predikciju** ili sličnu dostupnu akciju.

### Očekivani rezultat

Sistem prikazuje AI predikciju ishoda utakmice.

Predikcija može sadržavati procjenu pobjednika, vjerovatnoću ishoda ili drugi prikaz zavisno od implementacije ekrana.

AI predikcija je pomoćna informacija i ne predstavlja garantovan rezultat utakmice.

---

## 7.26. Pregled AI predikcije konačnog poretka lige

Ovaj tok koristi korisnik koji želi vidjeti AI procjenu konačnog plasmana u ligi.

### Koraci

1. Otvoriti modul **AI predikcije**.
2. Odabrati opciju za predikciju konačnog poretka lige.
3. Izabrati ligu.
4. Kliknuti na opciju **Prikaži predikciju**.

### Očekivani rezultat

Sistem prikazuje AI predikciju konačnog poretka lige.

Predikcija zavisi od dostupnih historijskih podataka, rezultata i drugih informacija koje sistem koristi.

---

## 7.27. PDF izvoz tabela, rezultata i rasporeda

Ovaj tok koristi korisnik koji želi preuzeti podatke iz sistema u PDF formatu.

### Koraci

1. Otvoriti modul **Tabela**, **Rezultati** ili **Raspored**.
2. Odabrati ligu ili takmičenje.
3. Provjeriti prikazane podatke.
4. Kliknuti na opciju **Izvezi u PDF**.
5. Sačekati da sistem generiše PDF dokument.

### Očekivani rezultat

Sistem generiše PDF dokument i omogućava korisniku njegovo preuzimanje.

PDF može sadržavati tabelu, rezultate ili raspored, zavisno od ekrana sa kojeg je izvoz pokrenut.

---

## 7.28. Pregled notifikacija

Ovaj tok koristi korisnik koji želi vidjeti obavijesti iz sistema.

### Koraci

1. Prijaviti se u sistem.
2. Otvoriti ikonu ili modul **Notifikacije**.
3. Pregledati listu primljenih notifikacija.
4. Otvoriti pojedinačnu notifikaciju ako je potrebno.

### Očekivani rezultat

Sistem prikazuje obavijesti vezane za aktivnosti korisnika, kao što su promjene statusa, rezervacije, zahtjevi ili druge važne informacije.

---

## 7.29. Pregled i izmjena profila

Ovaj tok koristi korisnik koji želi pregledati ili promijeniti podatke svog profila.

### Koraci

1. Prijaviti se u sistem.
2. Otvoriti modul **Profil**.
3. Pregledati trenutne podatke.
4. Izmijeniti dozvoljene podatke.
5. Sačuvati promjene.

### Očekivani rezultat

Sistem ažurira profil korisnika i prikazuje nove podatke.

---

## 7.30. Promjena lozinke

Ovaj tok koristi prijavljeni korisnik koji želi promijeniti svoju lozinku.

### Koraci

1. Prijaviti se u sistem.
2. Otvoriti modul **Profil** ili **Postavke**.
3. Odabrati opciju **Promjena lozinke**.
4. Unijeti trenutnu lozinku.
5. Unijeti novu lozinku.
6. Potvrditi novu lozinku.
7. Sačuvati promjenu.

### Očekivani rezultat

Sistem mijenja lozinku korisnika.

Korisnik se pri narednoj prijavi treba prijaviti pomoću nove lozinke.

---

## 8. Očekivano ponašanje sistema nakon važnih akcija

| Akcija                         | Očekivani rezultat                                                      |
| ------------------------------ | ----------------------------------------------------------------------- |
| Registracija korisnika         | Sistem kreira novi korisnički račun.                                    |
| Prijava korisnika              | Sistem prikazuje dashboard prema korisničkoj ulozi.                     |
| Odjava korisnika               | Sistem završava sesiju i vraća korisnika na početnu ili login stranicu. |
| Odobravanje uloge              | Korisnik dobija pristup funkcionalnostima nove uloge.                   |
| Kreiranje tima                 | Tim se prikazuje u listi timova.                                        |
| Prijava ekipe na takmičenje    | Ekipa se prikazuje u listi prijavljenih timova.                         |
| Generisanje rasporeda          | Sistem kreira utakmice i prikazuje raspored.                            |
| Unos rezultata                 | Sistem ažurira rezultat, tabelu i povezane prikaze.                     |
| Kreiranje objekta              | Objekat se prikazuje u listi sportskih objekata.                        |
| Kreiranje termina              | Termin se prikazuje kao dostupan, osim ako je blokiran.                 |
| Slanje zahtjeva za rezervaciju | Zahtjev se prikazuje vlasniku objekta.                                  |
| Odobravanje rezervacije        | Termin postaje rezervisan ili zauzet.                                   |
| Odbijanje rezervacije          | Zahtjev se odbija, a termin ostaje u odgovarajućem statusu.             |
| Prijava na grupni trening      | Igrač se prikazuje kao prijavljen na trening.                           |
| Odjava sa grupnog treninga     | Igrač se uklanja iz liste prijavljenih.                                 |
| Odabir omiljenog tima          | Sistem pamti omiljeni tim korisnika.                                    |
| AI predikcija                  | Sistem prikazuje procjenu ishoda utakmice ili poretka lige.             |
| PDF izvoz                      | Sistem generiše i preuzima PDF dokument.                                |

---

## 9. Ograničenja sistema

Finalna verzija sistema ima određena ograničenja koja korisnici trebaju imati u vidu.

### 9.1. AI predikcije

AI predikcije zavise od dostupnosti AI servisa i kvaliteta podataka u sistemu.

Predikcije ne predstavljaju službeni rezultat i ne garantuju stvarni ishod utakmice ili konačni poredak lige.

AI predikcije treba koristiti kao pomoćnu informaciju.

---

### 9.2. Email notifikacije

Sistem koristi email prvenstveno za tok zaboravljene lozinke i resetovanja lozinke.

Ostale obavijesti se uglavnom prikazuju kao in-app notifikacije unutar aplikacije.

---

### 9.3. Rezervacije i dostupnost termina

Korisnik može rezervisati samo termine koji su dostupni ili za koje sistem dopušta slanje zahtjeva.

Ako je termin zauzet, korisnik ga ne može direktno rezervisati, ali može koristiti listu čekanja ako je ta opcija dostupna.

Ako rezervacija zahtijeva odobrenje vlasnika, korisnik treba sačekati odluku vlasnika.

---

### 9.4. PDF izvoz

PDF izvoz je dostupan za određene prikaze, kao što su tabela, rezultati i raspored.

Ako korisnik ne vidi opciju za PDF izvoz na nekom ekranu, to znači da izvoz za taj ekran nije predviđen.

---

## 10. Šta korisnik ne može raditi

U finalnoj verziji sistema korisnik ne može raditi akcije koje nisu povezane sa njegovom ulogom.

Primjeri ograničenja:

* korisnik bez administratorske uloge ne može odobravati, blokirati ili brisati korisnike,
* korisnik bez organizatorskih ovlaštenja ne može kreirati ligu ili generisati raspored,
* igrač ne može sam potvrditi vlastiti zahtjev za rezervaciju ako je potrebno odobrenje vlasnika,
* navijač ne može unositi rezultate utakmica,
* korisnik ne može rezervisati blokiran termin,
* korisnik ne može direktno mijenjati AI predikciju,
* korisnik ne može koristiti tuđi profil ili mijenjati podatke drugih korisnika bez odgovarajuće dozvole,
* korisnik ne može koristiti funkcionalnosti koje zahtijevaju prijavu ako nije prijavljen.

---

