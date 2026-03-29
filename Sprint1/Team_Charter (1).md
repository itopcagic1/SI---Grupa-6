# Team Charter
## Tema 6: Sistem za upravljanje sportskim terminima i ligama
*Softverski inženjering — Akademska godina 2025/2026*

---

## 1. Naziv tima

**Sistem za upravljanje sportskim terminima i ligama - Sport Manager**

---

## 2. Članovi tima

| Ime i prezime | Broj indeksa | Kontakt | Uloga |
|---|---|---|---|
| Asistent predmeta | — | — | Product Owner |
| Irma Topčagić | 19504 | itopcagic1@etf.unsa.ba | Scrum Master |
| Anes Mirvić | 18984 | amirvic1@etf.unsa.ba | Developer |
| Semir Jamaković | 19706 | sjamakovic1@etf.unsa.ba | Developer |
| Mehdi Zaimović | 19564 | mzaimovic2@etf.unsa.ba | Developer |
| Maida Biber | 19580 | mbiber1@etf.unsa.ba | Developer / QA |
| Zeir Mašić |19801 | zmasic1@etf.unsa.ba | Developer / QA |
| Ilma Hindija | 19704 | ihindija1@etf.unsa.ba | Developer / Analitičar |
| Amna Kerla | 19355 | akerla1@etf.unsa.ba | Developer / Analitičar |



---

## 3. Način komunikacije

### Primarni kanal komunikacije

- **Viber grupa** — svakodnevna, neformalna komunikacija, brze obavijesti i koordinacija
- **Google Meet** — sedmični sprint sastanci i vanredni sastanci koji zahtijevaju diskusiju
- **ClickUp** — sve formalne komunikacije vezane za zadatke, komentari na taskovima, praćenje napretka

### Očekivano vrijeme odgovora

- Viber poruke: odgovor u roku od 12 sati tokom radnih dana
- Komentari na ClickUp taskovima: odgovor u roku od 24 sata
- Hitne situacije (blokada rada): odgovor u roku od 2 sata, uz obavezno označavanje člana u poruci.

### Način zakazivanja sastanaka

- Sedmični sastanak se zakazuje **na početku svakog sprinta** i fiksira se za cijeli sprint
- Scrum Master (Irma Topčagić) kreira Google Meet poziv i dijeli link u Viber grupi
- Vanredni sastanci se najavljuju **minimalno 24 sata unaprijed** putem Viber grupe
- Ako dogovoreni termin nije moguć za nekog člana, alternativa se predlaže **u roku od 6 sati** od objave

---

## 4. Radna pravila tima

### Kada i kako tim radi zajedno

- Tim se okuplja jednom sedmično na planiranom sprint sastanku putem **Google Meet**
- Trajanje sastanka je između **45 i 60 minuta**
- Svaki sastanak vodi Scrum Master prema unaprijed poznatoj agendi koja se objavljuje dan ranije u Viber grupi
- Individualni rad se prati kroz **ClickUp** — svaki član ažurira status svojih taskova redovno

### Kako se zadaci dogovaraju i prate

- Zadaci se definišu tokom sprint planiranja na sedmičnom sastanku
- Svaki zadatak se unosi u **ClickUp** s jasno definisanim: nazivom, opisom, nosiocem, rokomprioritizacijom i statusom
- Prihvatljivi statusi taska: `To Do` → `In Progress` → `In Review` → `Done`
- Svaki član sam ažurira statuse svojih zadataka — ne čeka se da to radi neko drugi
- Ako se zadatak ne može završiti u planiranom roku, član **sam unosi napomenu u ClickUp** i obavještava Scrum Mastera

### Kako se dokumentuju odluke

- Sve važne odluke donijete na sastancima bilježi Scrum Master u obliku kratkih **meeting notes**
- Meeting notes se objavljuju u ClickUp (dedikovan folder za dokumentaciju) **najkasnije 24 sata** nakon sastanka
- Svaka tehnička ili projektna odluka koja mijenja prethodni dogovor mora biti zabilježena s obrazloženjem

### Kako se rješavaju neslaganja

1. Neslaganje se prvo iznosi otvoreno u timu tokom sastanka ili u ClickUp komentarima
2. Pokušava se postići **konsenzus** diskusijom — svaki član iznosi svoj argument
3. Ako konsenzus nije moguć, **Scrum Master donosi finalnu odluku** uz uvažavanje argumenata svih strana
4. Ako se neslaganje tiče tehničkih odluka većeg opsega, konzultuje se **Product Owner (asistent)**
5. Lični konflikti se rješavaju direktnim razgovorom između uključenih strana, van grupnih kanala

---

## 5. Početne odgovornosti

### Koordinacija sprinta
**Odgovorna osoba: Irma Topčagić (Scrum Master)**
- Organizuje i vodi sprint planning, daily check-in i sprint review
- Prati napredak tima kroz ClickUp i uklanja prepreke koje blokiraju rad
- Osigurava da svi članovi znaju šta rade i do kada

### Backlog i zahtjevi
**Odgovorna osoba: Product Owner (asistent) uz podršku Ilme Hindija **
- Product Owner definiše i prioritizuje product backlog
- Ilma Hindija i Anes Mirvić pomažu u razradi i dokumentaciji user stories
- Svi zahtjevi se vode u ClickUp-u u obliku user stories s kriterijima prihvatanja

### Arhitektura i tehničke odluke
**Odgovorne osobe: Anes Mirvić, Semir Jamaković, Mehdi Zaimović**
- Definisanje tehničkog stacka i arhitekturnih odluka
- Donošenje odluka o strukturi koda, korištenim tehnologijama i standardima
- Sve tehničke odluke se dokumentuju u ClickUp i dostupne su cijelom timu

### Testiranje i kvalitet
**Odgovorne osobe: Maida Biber, Zeir Mašić**
- Pisanje i izvršavanje test scenarija za svaku funkcionalnost
- Code review svake izmjene prije mergea u main granu
- Prijavljivanje bugova kroz ClickUp s odgovarajućim opisom i prioritetom

### Dokumentacija i evidencije
**Odgovorna osoba: Amna Kerla, uz doprinos svih članova**
- Vođenje projektne dokumentacije (sprint notes, arhitekturni dijagrami, API dokumentacija)
- Osiguravanje da je dokumentacija ažurna i dostupna svim članovima putem ClickUp-a
- Svaki developer dokumentuje sopstveni kod prema dogovorenom standardu

---

## 6. Pravila u slučaju neispunjavanja obaveza

### Kako se član upozorava

Primjenjuje se postupak u tri koraka:

1. **Prvo upozorenje (interno)** — Scrum Master lično kontaktuje člana (privatnom porukom) i razgovara o problemu. Ovo se dešava nakon prvog propuštenog roka ili neaktivnosti bez najave.
2. **Drugo upozorenje (formalno)** — Ako se situacija ponovi u istom ili narednom sprintu, Scrum Master upozorenje dokumentuje u ClickUp-u i informiše cijeli tim o tome da postoji problem s isporukom.
3. **Eskalacija** — Ako ni nakon dva upozorenja ne dođe do promjene, problem se prijavljuje nastavnom osoblju.

### Kada se problem prijavljuje nastavnom osoblju

Problem se prijavljuje asistentnom/predmetnom nastavniku u sljedećim slučajevima:

- Član ne ispunjava obaveze **dva uzastopna sprinta** bez opravdanog razloga
- Član aktivno narušava rad tima (ignorisanje komunikacije, nepojavljivanje na sastancima)
- Interni dogovori i upozorenja nisu dali rezultata
- Situacija eskalira do konflikta koji tim ne može riješiti samostalno

Prijava se vrši putem email komunikacije Scrum Mastera s asistentom, uz kratko obrazloženje situacije.

### Kako se evidentiraju problemi u timu

- Scrum Master vodi **evidenciju problema** u posebnom dokumentu unutar ClickUp-a (npr. folder "Tim & Procesi")
- Svaki evidentirani problem sadrži: **datum, opis situacije, mjere koje su poduzete i ishod**
- Evidencija je vidljiva svim članovima tima radi transparentnosti
- Riješeni problemi se obilježavaju kao zatvoreni, ali ostaju u evidenciji kao historija

---

*Verzija 1.0 — Sprint 1*
*Svi članovi tima potvrđuju da su upoznati s ovim Charter-om i da se slažu s njegovim odredbama.*
