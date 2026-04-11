 # Test Strategy
 ## Cilj testiranja

| Cilj | Obim | Kriterij uspjeha |
| --- |---| --- |
|Verifikacija registracije korisnika (PB-20) | Validacija unosa, odabir uloga, onemogućavanje duplih naloga. |Ispunjeni svi AC iz US-01 (validacija emaila, lozinke i uloge, te onemogućena registracija sa postojećim emailom)|
|Verifikacija prijave i upravljanja sesijom (PB-21) |Autentifikacija korisnika i ispravno preusmjeravanje.|Zadovoljeni AC iz US-02. Korisnik se uspješno prijavljuje i biva preusmjeren na ispravan dashboard.|
|Sigurnost odjave i timeout sesije (PB-21, PB-23)|Prekid sesije i automatska odjava.|Svi AC iz US-03 i US-03.1. Pristup zaštićenim rutama je nemoguć nakon odjave.|
|Provjera sistema permisija i uloga (PB-22)|Pristup modulima na osnovu uloge.| Svi AC iz US-1.1|
|Validacija upravljanja ligama i timovima (PB-24, PB-25)| Kreiranje, izmjena i brisanje čitave lige ili timova u njoj. Dodavanje dostupnih sportova.|Svi AC iz US-05. Mora biti onemogućeno kreiranje dvije lige istog naziva.|
|Potvrda ispravnosti rezervacije termina (PB-32, PB-33)|Tok od slanja zahtjeva do potvrde vlasnika objekta.|Svi AC iz US-15, 16 i 17. Status termina se mijenja u "Zauzeto" isključivo nakon potvrde.|
|Verifikacija tabela i rezultata (PB-29, PB-30)|Unos rezultata i automatsko računanje bodova i pozicije na tabeli.|Svi AC iz US-12 i US-13. Tabela se mora ažurirati odmah nakon unosa, bez grešaka u bodovanju.|
|Validacija liste čekanja i otkazivanja (PB-35)|Otkazivanje termina i slanje notifikacija.| Svi AC iz US-19 i US-20;  Otkazivanje mora biti onemogućeno 24h prije termina (ili npr. uvedeni neki penali za igrača ili trenera ukoliko otkažu termin u roku od 24h ili manje prije treninga).|
|Provjera javnog pregleda i filtera (PB-28)|Pregled rezultata i rasporeda za registrovane i neregistrovane goste.|Svi AC iz US-11.1 i US-11.2. Filteri po sportu, ligi i datumu moraju raditi ispravno.|
|Potvrda sigurnosti podataka (PB-23)| Enkripcija lozinki i zaštita privatnosti. | Svi AC iz US-04.3. Lozinke u bazi su hashirane.|
|Testiranje performansi i odziva (PB-34)|Brzina učitavanja dashboarda, pretrage i filtriranja.|NFR-01, NFR-12: 95% zahtjeva obrađeno u < 2, filtriranje velikih setova podataka u < 3s.|
|Validacija opterećenja i skalabilnosti (PB-41)|Rad sistema sa 50+ istovremenih korisnika.|NFR-02: Nema pada performansi pod normalnim opterećenjem, sistem ostaje stabilan.|
|Provjera pouzdanosti i integriteta podataka (PB-17.1)|Validacija serverske strane i onemogućavanje duplikata.|NFR-15, NFR-16: Sistem odbija negativne golove/datume u prošlosti i blokira duple rezervacije.|
|Testiranje responzivnosti i dostupnosti (PB-38)|UI na različitim browserima i mobilnim uređajima.|NFR-06, NFR-14: Ispravan prikaz na Chrome, Edge, Firefox. Navigacija optimizovana za mobitele.|
|Verifikacija brzine notifikacija (PB-35)|Slanje email obavijesti nakon promjena.|NFR-10: Email stiže korisniku u roku od 1 minute od nastanka promjene (promjena rezultata ili pozicije na rasporedu).|
|Testiranje sigurnosti (PB-23)|HTTPS, enkripcija lozinki i logovi akcija.|NFR-04, NFR-13: Komunikacija je isključivo HTTPS. Svaka promjena rezultata ostavlja zapis u logu.|



