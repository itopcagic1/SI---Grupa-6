# Sprint Backlog

Ovaj dokument sadrži pregled planiranih i završenih zadataka za Sprint 8, sa fokusom na međusobnu koordinaciju članova tima i logički redoslijed realizacije funkcionalnosti.

# Sprint Backlog — Sprint 8

| ID | Veze sa US &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Naziv zadatka | Odgovorna osoba | Status | Napomena / Akceptacijski kriterijumi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | US-12 | **Evidencija rezultata završene utakmice i automatsko računanje bodova** | Ilma Hindija | Done | Ekran za unos rezultata utakmice je spojen sa ekranom za unos statistike u jednu zajedničku cjelinu radi lakšeg korištenja. Sistem validira unos i sprečava negativne/nelogične rezultate. |
| **2** | US-12.1 | **Unos i upravljanje detaljnom statistikom igrača i timova unutar određene utakmice** | Mehdi Zaimović | Done | Detaljna statistika igrača (strijelci, asistencije, kartoni/prekršaji) se može unijeti tek nakon što je uspješno upisan i spašen konačni rezultat utakmice. Povezuje se direktno sa profilima igrača i timova. |
| **3** | US-13 | **Razvoj servisa za dinamički proračun i generisanje tabele poretka (Leaderboard)** | Zeir Mašić | Done | Sistem automatski preračunava broj pobjeda, poraza, neriješenih, gol razliku i ukupne bodove odmah nakon spašavanja rezultata utakmice, osiguravajući ažurnost tabele u realnom vremenu. |
| **4** | US-13.1 | **Implementacija pregleda analitike i individualnih performansi igrača i timova** | Amna Kerla | Done | Omogućava filtriranje i sortiranje sveukupne statistike po ligama ili sezonama. Ako podaci nisu dostupni, osigurava prikaz odgovarajuće sistemske poruke. |
| **5** | US-14 | **CRUD upravljanje sportskim objektima sa mehanizmom privatnosti vlasnika** | Maida Biber | Done | Za sada pregled objekata i upravljanje dostupni samo vlasniku tog sportskog objekta. Implementirane napredne validacije unosa i soft-delete logičko brisanje podataka. |
| **6** | US-14.1 / US-14.2 | **Validacija rasporeda dvorana, upravljanje dostupnošću i kreiranje slobodnih termina** | Semir Jamaković | Done | Pripremljena osnovna arhitektura i validacija kalendarskog prikaza. Osigurano sprječavanje preklapanja termina i integrisana mogućnost administratorskog blokiranja (pre-work za Sprint 9). |
