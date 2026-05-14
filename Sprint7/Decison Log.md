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


