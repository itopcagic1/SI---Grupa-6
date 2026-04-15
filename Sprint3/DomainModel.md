## Domenski Model

---
**1. Glavni entiteti i ključni atributi**

U tabeli ispod prikazani su glavni entiteti sistema i njihovi ključni atributi. Za svaki entitet naveden je kratak opis njegove uloge u sistemu, kao i najvažniji atributi, pri čemu su posebno označeni primarni i strani ključevi.

| Entitet | Opis | Ključni atributi |
|---|---|---|
| Korisnik | Predstavlja registrovanog korisnika sistema, uključujući administratora, organizatora, igrača, trenera, navijača i vlasnika objekta. | korisnikId [PK], punoIme, email, hashLozinke, uloga, statusNaloga, statusOdobrenja, datumKreiranja |
| Sport | Predstavlja sportsku kategoriju kojoj pripadaju lige, timovi i utakmice. | sportId [PK], naziv, opis, podrzan |
| Liga | Predstavlja organizovano takmičenje unutar određenog sporta. | ligaId [PK], naziv, sezona, sportId [FK], organizatorId [FK], status, opis |
| Tim | Predstavlja sportsku ekipu koja može učestvovati u jednoj ili više liga. | timId [PK], naziv, sportId [FK], opis, logoUrl, status |
| ClanstvoTima | Predstavlja vezu između korisnika i tima, npr. igrač ili trener u određenom timu. | clanstvoTimaId [PK], timId [FK], korisnikId [FK], ulogaUTimu, datumPridruzivanja, status |
| UcesceULigi | Predstavlja prijavu i status učešća određenog tima u ligi. | ucesceULigiId [PK], ligaId [FK], timId [FK], prijavioKorisnikId [FK], statusPrijave, datumPrijave, datumOdobrenja |
| Utakmica | Predstavlja zakazanu utakmicu između dva tima u okviru lige. | utakmicaId [PK], ligaId [FK], domaciTimId [FK], gostujuciTimId [FK], objekatId [FK], datumVrijemePocetka, datumVrijemeZavrsetka, status |
| RezultatUtakmice | Predstavlja evidentirani rezultat odigrane utakmice. | rezultatUtakmiceId [PK], utakmicaId [FK], domaciRezultat, gostujuciRezultat, unioKorisnikId [FK], datumUnosa |
| StatistikaTimaNaUtakmici | Predstavlja detaljnu statistiku jednog tima u okviru konkretne utakmice. | statistikaTimaNaUtakmiciId [PK], utakmicaId [FK], timId [FK], posjedLopte, prekrsaji, zutiKartoni, crveniKartoni, sutevi, suteviUOkvir, korneri |
| StatistikaIgracaNaUtakmici | Predstavlja detaljnu statistiku pojedinačnog igrača u okviru konkretne utakmice. | statistikaIgracaNaUtakmiciId [PK], utakmicaId [FK], korisnikId [FK], timId [FK], goloviPoeni, asistencije, zutiKartoni, crveniKartoni, prekrsaji, odigraneMinute |
| StavkaTabele | Predstavlja plasman jednog tima na tabeli određene lige. | stavkaTabeleId [PK], ligaId [FK], timId [FK], odigrane, pobjede, nerijesene, porazi, datiGolovi, primljeniGolovi, golRazlika, bodovi, pozicija |
| SportskiObjekat | Predstavlja teren, dvoranu ili drugi sportski objekat kojim upravlja vlasnik. | objekatId [PK], vlasnikId [FK], naziv, adresa, opis, kapacitet, status |
| TerminObjekta | Predstavlja konkretan vremenski termin u sportskom objektu koji može biti slobodan, zauzet ili blokiran. | terminObjektaId [PK], objekatId [FK], datumVrijemePocetka, datumVrijemeZavrsetka, tipTermina, status |
| ZahtjevZaRezervaciju | Predstavlja zahtjev korisnika za rezervaciju termina koji vlasnik objekta može odobriti ili odbiti. | zahtjevZaRezervacijuId [PK], terminObjektaId [FK], korisnikId [FK], timId [FK], tipZahtjeva, status, datumZahtjeva, datumObrade, obradioKorisnikId [FK], razlogOdbijanja |
| Rezervacija | Predstavlja potvrđenu rezervaciju termina nastalu na osnovu odobrenog zahtjeva ili druge potvrđene akcije u sistemu. | rezervacijaId [PK], terminObjektaId [FK], korisnikId [FK], timId [FK], zahtjevZaRezervacijuId [FK], status, datumKreiranja, datumPotvrde, datumOtkazivanja, otkazaoKorisnikId [FK], razlogOtkazivanja |
| StavkaListeCekanja | Predstavlja korisnika koji čeka oslobađanje zauzetog termina. | stavkaListeCekanjaId [PK], terminObjektaId [FK], korisnikId [FK], redniBroj, datumKreiranja, status |
| OmiljeniTim | Predstavlja tim koji je korisnik označio kao omiljeni radi praćenja sadržaja i primanja obavještenja. | omiljeniTimId [PK], korisnikId [FK], timId [FK], datumDodavanja |
| Notifikacija | Predstavlja obavještenje poslano korisniku o rezultatima, rasporedu, rezervacijama ili drugim važnim događajima. | notifikacijaId [PK], korisnikId [FK], tip, naslov, poruka, procitana, datumSlanja, povezaniEntitetTip, povezaniEntitetId |
| AIPredikcija | Predstavlja informativnu AI procjenu ishoda utakmice ili konačnog poretka lige na osnovu historijskih podataka. | aiPredikcijaId [PK], ligaId [FK], utakmicaId [FK], predvideniIshod, vjerovatnoca, objasnjenje, datumGenerisanja |

**2. Veze između entiteta**

U tabeli ispod prikazane su ključne veze između entiteta sistema, zajedno sa kardinalnostima i kratkim objašnjenjem njihove uloge.

| Entitet 1 | Entitet 2 | Kardinalnost | Opis veze |
|---|---|---|---|
| Sport | Liga | 1:N | Jedan sport može imati više liga, dok svaka liga pripada tačno jednom sportu. |
| Sport | Tim | 1:N | Jedan sport može imati više timova, dok svaki tim pripada tačno jednom sportu. |
| Korisnik | Liga | 1:N | Jedan korisnik u ulozi organizatora može upravljati sa više liga, dok svaka liga ima jednog organizatora. |
| Korisnik | SportskiObjekat | 1:N | Jedan korisnik u ulozi vlasnika može upravljati sa više sportskih objekata, dok svaki objekat ima jednog vlasnika. |
| Korisnik | ClanstvoTima | 1:N | Jedan korisnik može imati više zapisa članstva, npr. biti igrač ili trener u jednom ili više timova. |
| Tim | ClanstvoTima | 1:N | Jedan tim može imati više članova, dok svaki zapis članstva pripada tačno jednom timu. |
| Liga | UcesceULigi | 1:N | Jedna liga može imati više prijavljenih timova kroz zapise o učešću. |
| Tim | UcesceULigi | 1:N | Jedan tim može učestvovati u više liga, dok svaki zapis o učešću pripada tačno jednom timu. |
| Korisnik | UcesceULigi | 1:N | Jedan korisnik, najčešće trener, može poslati više prijava tima na ligu ili takmičenje. |
| Liga | Utakmica | 1:N | Jedna liga sadrži više utakmica, dok svaka utakmica pripada tačno jednoj ligi. |
| Tim | Utakmica | 1:N | Jedan tim može učestvovati u više utakmica, bilo kao domaći ili gostujući tim. |
| SportskiObjekat | Utakmica | 1:N | Jedan sportski objekat može biti lokacija za više utakmica, dok se svaka utakmica igra na jednom objektu. |
| Utakmica | RezultatUtakmice | 1:0..1 | Jedna utakmica može imati najviše jedan evidentiran rezultat, a rezultat ne može postojati bez utakmice. |
| Korisnik | RezultatUtakmice | 1:N | Jedan korisnik, najčešće organizator, može unijeti više rezultata utakmica. |
| Utakmica | StatistikaTimaNaUtakmici | 1:N | Jedna utakmica može imati više zapisa timske statistike, po jedan za svaki tim koji je učestvovao u utakmici. |
| Tim | StatistikaTimaNaUtakmici | 1:N | Jedan tim može imati više zapisa timske statistike kroz različite utakmice. |
| Utakmica | StatistikaIgracaNaUtakmici | 1:N | Jedna utakmica može imati više zapisa statistike igrača, za sve igrače koji su nastupili. |
| Korisnik | StatistikaIgracaNaUtakmici | 1:N | Jedan korisnik u ulozi igrača može imati više zapisa statistike kroz različite utakmice. |
| Tim | StatistikaIgracaNaUtakmici | 1:N | Jedan tim može biti povezan sa više zapisa statistike igrača kroz različite utakmice. |
| Liga | StavkaTabele | 1:N | Jedna liga ima više stavki tabele, po jednu za svaki tim koji učestvuje u ligi. |
| Tim | StavkaTabele | 1:N | Jedan tim može imati više stavki tabele kroz različite lige ili sezone. |
| SportskiObjekat | TerminObjekta | 1:N | Jedan sportski objekat može imati više termina, dok svaki termin pripada tačno jednom objektu. |
| TerminObjekta | ZahtjevZaRezervaciju | 1:N | Za jedan termin može postojati više zahtjeva kroz vrijeme. |
| Korisnik | ZahtjevZaRezervaciju | 1:N | Jedan korisnik može podnijeti više zahtjeva za rezervaciju termina. |
| TerminObjekta | Rezervacija | 1:N | Jedan termin može imati više rezervacija kroz vrijeme, ali najviše jednu aktivnu rezervaciju u datom trenutku. |
| Korisnik | Rezervacija | 1:N | Jedan korisnik može imati više rezervacija termina. |
| ZahtjevZaRezervaciju | Rezervacija | 1:0..1 | Jedan zahtjev za rezervaciju može rezultirati najviše jednom potvrđenom rezervacijom. |
| TerminObjekta | StavkaListeCekanja | 1:N | Jedan zauzet termin može imati više korisnika na listi čekanja. |
| Korisnik | StavkaListeCekanja | 1:N | Jedan korisnik može biti prijavljen na listu čekanja za više termina. |
| Korisnik | OmiljeniTim | 1:N | Jedan korisnik može imati jedan ili više zapisa omiljenih timova, zavisno od poslovnog pravila sistema. |
| Tim | OmiljeniTim | 1:N | Jedan tim može biti označen kao omiljeni od strane više korisnika. |
| Korisnik | Notifikacija | 1:N | Jedan korisnik može primiti više notifikacija o rezultatima, rasporedu, rezervacijama i drugim važnim događajima. |
| Liga | AIPredikcija | 1:N | Jedna liga može imati više AI predikcija, npr. za poredak ili više buducih utakmica. |

**Poslovna pravila važna za model**

U nastavku su izdvojena pravila koja direktno ograničavaju entitete, njihove međusobne odnose i dozvoljena stanja unutar sistema.

- Svaki korisnik mora imati jedinstven email u sistemu.

- Funkcionalnosti koje korisnik može koristiti zavise od njegove uloge u sistemu.

- Korisnici sa specijalnim ulogama, kao što su vlasnik objekta i organizator lige, dobijaju prava za kreiranje objekata ili liga tek nakon odobrenja administratora.

- Liga i tim se uvijek posmatraju u okviru odgovarajućeg sporta.

- Tim ne može učestvovati u ligi bez prethodne prijave na takmičenje.

- Isti tim ne smije biti dodan više puta u istu ligu.

- Trener može upravljati samo timom koji mu je dodijeljen.

- Utakmica se može zakazati samo ako su uneseni validni podaci o terminu, timovima i lokaciji, te ako ne postoji preklapanje termina.

- Rezultat se može evidentirati samo za prethodno zakazanu i odigranu utakmicu.

- Nakon unosa rezultata, tabela i bodovi se automatski ažuriraju.

- Detaljna statistika timova i igrača može se evidentirati samo za prethodno zakazanu i odigranu utakmicu.

- Statistika igrača mora biti povezana sa konkretnom utakmicom, igračem i timom za koji je igrač nastupio.

- Statistika tima mora biti povezana sa konkretnom utakmicom i timom koji je učestvovao u toj utakmici.

- Zbirna statistika timova i igrača mora se automatski ažurirati na osnovu unesenih podataka sa utakmica.

- Vlasnik sportskog objekta upravlja terminima svog objekta, a termini unutar istog objekta se ne smiju preklapati.

- Rezervacija termina se zasniva na zahtjevu korisnika, a potvrđena rezervacija predstavlja poseban zapis vezan za konkretan termin.

- Za isti termin može postojati više zahtjeva i više rezervacija kroz vrijeme, ali najviše jedna aktivna rezervacija u datom trenutku.

- Nakon potvrde rezervacije termin se označava kao zauzet, a nakon otkazivanja aktivne rezervacije termin se ponovo oslobađa.

- Ako vlasnik odbije zahtjev za rezervaciju, rezervacija se ne kreira, a termin ostaje slobodan.

- Obrada zahtjeva za rezervaciju mora biti evidentirana kroz status zahtjeva, datum obrade i korisnika koji je izvršio odobravanje ili odbijanje zahtjeva.

- Otkazivanje aktivne rezervacije mora rezultirati promjenom statusa rezervacije i ponovnim oslobađanjem pripadajućeg termina u sistemu.

- Sistem ne smije dozvoliti duplu aktivnu rezervaciju istog termina, niti isti korisnik smije rezervisati isti termin više puta.

- Otkazivanjem rezervacije termin se oslobađa, a korisnici sa liste čekanja se obavještavaju o oslobođenom terminu.

- Lista čekanja ne rezerviše termin automatski, nego samo evidentira korisnike i omogućava njihovo obavještavanje po redoslijedu.

- Odabir omiljenog tima predstavlja osnovu za personalizovane notifikacije registrovanom navijaču.

- AI predikcija služi isključivo kao informativni prikaz i nema uticaj na stvarne rezultate niti na stvarni poredak na tabeli.
