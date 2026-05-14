# Decision Log - Sprint 7

---

## Odluka 1

**ID:** DL-S7-01

**Datum:** 09.05.2026.

**Naziv:** Odabir email servisa za slanje notifikacija — SendGrid umjesto Gmail SMTP

**Opis:**
Prilikom implementacije funkcionalnosti reset zaboravljene lozinke, razmatrano je koje rješenje koristiti za slanje emailova korisnicima. Inicijalno je testiran Gmail SMTP, ali je odlučeno da se koristi SendGrid.

**Razmatrane opcije:**
- Gmail SMTP s Nodemailer-om
- SendGrid API

**Odabrana opcija:**
SendGrid API

**Razlog izbora:**
Gmail SMTP pokazao se kao nepouzdano rješenje za deployment okruženje — česti problemi s autentifikacijom, ograničenjima i blokiranjem od strane Googlea pri pokretanju aplikacije na serverima. SendGrid pruža stabilniju i pouzdaniju infrastrukturu za slanje emailova, a besplatni plan zadovoljava potrebe projekta.

**Posljedice odluke:**

*Pozitivne:*
- Stabilno slanje emailova u produkcijskom okruženju
- Lakša konfiguracija putem API ključa

*Negativne:*
- Potrebna registracija i verifikacija sender identiteta na SendGrid platformi

**Status odluke:** Prihvaćena i implementirana

---

## Odluka 2

**ID:** DL-S7-02

**Datum:** 10.05.2026.

**Naziv:** Dodavanje razloga blokiranja

**Opis:**
Prilikom implementacije blokiranja korisnika uočeno je da administrator nema mogućnost bilježenja razloga blokiranja, što otežava praćenje i odgovaranje na eventualne žalbe korisnika.

**Razmatrane opcije:**
- Koristiti postojeće polje `razlogOdbijanja` za dvostruku svrhu
- Dodati novo polje `razlogBlokiranja` 

**Odabrana opcija:**
Novo polje `razlogBlokiranja String?` u modelu `Korisnik`

**Razlog izbora:**
Polje `razlogOdbijanja` pripada procesu odobravanja/odbijanja zahtjeva za ulogu. Jasna separacija podataka olakšava održavanje i čitljivost koda, a novo polje se automatski briše pri odblokiravanju korisnika.

**Posljedice odluke:**

*Pozitivne:*
- Administrator uvijek zna zašto je nalog blokiran
- Razlog se prikazuje na detalji stranici korisnika za buduću referencu

*Negativne:*
- Potrebna promjena baze podataka

**Status odluke:** Prihvaćena i implementirana

---

## Odluka 3

**ID:** DL-S7-03

**Datum:** 12.05.2026.

**Naziv:** Dizajn javne početne stranice (Homepage) i uklanjanje Dashboard-a

**Opis:**
Implementacija modernog dizajna za javnu početnu stranicu (sport.ba) kao glavni zadatak, što je dovelo do strateške odluke da se potpuno ukloni interno orijentisani Dashboard i navigacija centralizuje u Navbar-u.

**Razmatrane opcije:**
- Zadržati odvojen Homepage za goste i Dashboard kao centralni hub za prijavljene korisnike.
- Kreirati unificirano iskustvo gdje je Homepage centralna tačka za sve, a navigacija se vrši isključivo preko Navbar-a (uz brisanje Dashboard-a).

**Odabrana opcija:**
Unificirano iskustvo sa centralnim Homepage-om i Navbar navigacijom (uklanjanje Dashboard-a).

**Razlog izbora:**
Kao primarni zadatak dizajniran je moderan i atraktivan Homepage. Tokom razvoja uočeno je da postojanje posebnog Dashboard-a stvara nepotreban dodatni korak u navigaciji jer su sve bitne funkcije već dostupne ili se mogu lako dodati u Navbar. Prebacivanjem specifičnih akcija (npr. "Generiši raspored") direktno u Navbar na osnovu uloge korisnika, postignuto je čišće, brže i efikasnije korisničko iskustvo.

**Posljedice odluke:**

*Pozitivne:*
- Moderna i reprezentativna početna stranica
- Čišći i intuitivniji korisnički interfejs za prijavljene korisnike
- Brži pristup ključnim funkcionalnostima na osnovu uloge korisnika bez "međukoraka"
- Manje koda za održavanje

*Negativne:*
- Potrebno ažurirati sve rute, redirecte i testove koji su ranije vodili na Dashboard

**Status odluke:** Prihvaćena i implementirana

---

## Odluka 4

**ID:** DL-S7-04

**Datum:** 13.05.2026.

**Naziv:** Filtriranje utakmica na serverskoj (Backend) umjesto klijentskoj strani (Frontend)

**Opis:**
Prilikom izrade stranica za prikaz rasporeda i rezultata, razmatrano je gdje treba vršiti logiku pretrage i filtriranja utakmica na osnovu odabranog sporta, lige, tima i datuma.

**Razmatrane opcije:**
- Dohvatiti sve utakmice iz baze jednim pozivom i filtrirati ih lokalno u pregledniku pomoću Reacta.
- Slanje parametara filtera na backend API i dohvatanje samo onih utakmica koje odgovaraju uslovima.

**Odabrana opcija:**
Server-side filtriranje (slanje parametara na backend API).

**Razlog izbora:**
Iako lokalno filtriranje može djelovati jako brzo za male količine testnih podataka, dugoročno bi to predstavljalo problem. Kako aplikacija raste i bilježi hiljade utakmica, dohvatanje svih podataka odjednom bi dramatično usporilo početno učitavanje stranice i zagušilo mrežni saobraćaj korisnika. Odlukom da se filtriranje prebaci na bazu podataka i backend, frontend ostaje lagan i brz, bez obzira na to koliko podataka u sistemu postoji.

**Posljedice odluke:**

*Pozitivne:*
- Znatno brže inicijalno učitavanje stranica Raspored i Rezultati
- Daleko manja potrošnja radne memorije (RAM) na korisničkim uređajima
- Skalabilnije rješenje otporno na budući rast aplikacije

*Negativne:*
- Svaka promjena filtera na stranici sada zahtijeva novi asinhroni zahtjev (API poziv) prema serveru, što zavisno od internetske veze može prouzrokovati jako malo kašnjenje.

**Status odluke:** Prihvaćena i implementirana

---
