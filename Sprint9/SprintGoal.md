# Sprint Goal — Sprint 9

## Ciljevi sprinta

Cilj sprinta 9 je implementirati i zaokružiti cjelokupni sistem rezervacija, upravljanja kapacitetima i monitoringa termina. To obuhvata napredne preglede za vlasnike objekata sa statusom pouzdanosti korisnika, ručnu verifikaciju nepouzdanih korisnika, automatizaciju i vremenska ograničenja otkazivanja pomoću pozadinskih poslova (BullMQ/Redis), rezervacione tokove za individualne (igrači) i grupne treninge (treneri) uz transakcijsku zaštitu, kazneni sistem i penalizaciju za kasno otkazivanje, te real-time notifikacije i liste čekanja podržane WebSockets (Socket.io) protokolom, uz centralni kalendarski prikaz prilagođen korisničkim ulogama.

---

## Ključne stavke koje tim želi završiti

### 1. Vlasnički Dashboard i Monitoring Rezervacija (Developer 1)
- Objedinjeni API pregled i monitoring popunjenosti za vlasnika (spajanje direktnih rezervacija i zahtjeva na čekanju sa paginacijom i filterima).
- Prikaz statusa rezervacija pomoću obojenih bedževa i integracija detalja o pouzdanosti korisnika (broj prekršaja).

### 2. Ručna Verifikacija i Uslovne Rezervacije (Developer 2)
- Middleware za provjeru pouzdanosti koji nepouzdane korisnike preusmjerava na sistem zahtjeva za verifikaciju umjesto direktne potvrde.
- Vlasnički interfejs za odobravanje/odbijanje sa obaveznim modalnim unosom obrazloženja (minimalno 10 karaktera) i vizuelnim indikatorima upozorenja.

### 3. Automatizacija, Tajmeri i Vlasnička Otkazivanja (Developer 3)
- Integracija BullMQ i Redis baze za pokretanje odloženih poslova koji automatski odbijaju zahtjeve na čekanju nakon 60 minuta neaktivnosti vlasnika.
- Backend i frontend zaštitna logika koja zaključava i onemogućava opciju vlasničkog otkazivanja potvrdjenih rezervacija nakon 60 minuta od kreiranja.

### 4. Rezervacioni Tok za Igrače - Individualni Treninzi (Developer 4)
- API za pretragu slobodnih individualnih termina i sprečavanje duplih rezervacija istog termina.
- Klijentski interfejs sa sedmičnim kalendarom slobodnih termina i dinamičkim Toast/obavještenjima o statusu rezervacije (potvrđeno vs. na čekanju).

### 5. Rezervacioni Tok za Trenere i Upravljanje Kapacitetom (Developer 5)
- Kreiranje grupnih treninga od strane trenera sa definisanim kapacitetom grupe (2-30) i opcionim odabirom tima.
- Prijava igrača na grupne treninge sa transakcijskom zaštitom od prekoračenja kapaciteta i preklapanja, te odjava igrača uz obavezno obrazloženje i notifikacije.

### 6. Korisničko Otkazivanje i Kazneni Sistem - Penalizacija (Developer 6)
- API ruta za otkazivanje rezervacija koja kažnjava otkazivanja unutar 24 sata prije početka termina povećanjem broja prekršaja.
- Automatski trigger za prebacivanje korisnika u status "NEPOUZDAN" nakon 3 prekršaja, te klijentski UI "Moje rezervacije" sa potvrdnim modalom i upozorenjima.

### 7. Real-time Komunikacija i Liste Čekanja (Developer 7)
- Inicijalizacija Socket.io i WebSocket gateway-a za real-time komunikaciju.
- Upravljanje listom čekanja za zauzete termine i real-time WebSocket obavještavanje svih prijavljenih korisnika čim se termin oslobodi ("princip brzog prsta").

### 8. Centralni Kalendar i Globalni Notifikacioni UI (Developer 8)
- Napredna GET ruta za raspored sa ugrađenom zaštitom privatnosti (filtriranje detalja o tuđim rezervacijama na osnovu uloge korisnika).
- Centralna FullCalendar komponenta sa vizuelnim kodiranjem tipova termina, te Navbar zvončić sa real-time brojačem i Toast notifikacijama.

---

## Rizici i zavisnosti

### Rizici
- **Konkurentnost i Race Conditions (Grupni treninzi & Lista čekanja):** Više korisnika može pokušati rezervisati posljednje slobodno mjesto ili slobodan termin u istoj milisekundi. Rješava se Prisma transakcijama na backendu i WebSocket "brzim prstima" principom na frontend-u.
- **Konfiguracija Redis/BullMQ u Dockeru:** Usklađivanje lokalnih i produkcijskih Redis instanci za stabilan rad BullMQ workera i tajmera.
- **Pravovremenost Real-time Notifikacija:** Kašnjenje WebSocket poruka može dovesti do toga da korisnici vide zastarjele statuse slobodnih/zauzetih termina.

### Zavisnosti
- **Zadaci Developera 2 i 3 ovise o radu Developera 1:** Upravljanje i otkazivanje rezervacija zavise od stabilnog vlasničkog dashboarda i rute za dohvatanje podataka.
- **Zadatak 4 (Igrači) i Zadatak 5 (Treneri) ovise o Kalendaru Vlasnika:** Zakazivanje individualnih i grupnih treninga zahtijeva prethodno kreirane slobodne termine od strane vlasnika objekta (pre-work iz Sprinta 8).
- **Zvončić i notifikacije (Developer 8) ovise o WebSocket gateway-u (Developer 7):** Integracija real-time notifikacija na Navbaru zahtijeva funkcionalnu Socket.io infrastrukturu.
