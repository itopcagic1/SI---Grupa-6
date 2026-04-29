## AI Usage Log 1

**Datum:** 25/04/2026  

**Sprint broj:** Sprint 5

**Alat koji je korišten:** Claude Sonnet 4.6  

**Svrha korištenja:**  
Ispravljanje grešaka u kodu i poboljšanje funkcionalnosti  

**Kratak opis zadatka ili upita:**  
Korišten AI alat za identifikaciju i ispravljanje grešaka u postojećem kodu, uključujući probleme sa logikom i sintaksom.  

**Šta je AI predložio ili generisao:**  
AI je predložio ispravke u kodu, uključujući izmjene u logici funkcija i pravilnije rukovanje određenim edge case-ovima.  

**Šta je tim prihvatio:**  
Većina predloženih ispravki vezanih za sintaksu i osnovnu logiku je prihvaćena.  

**Šta je tim izmijenio:**  
Određeni dijelovi koda su dodatno prilagođeni kako bi odgovarali postojećoj arhitekturi projekta.  

**Šta je tim odbacio:**  
Neki prijedlozi koji nisu bili u skladu sa strukturom projekta ili coding standardima su odbačeni.  

**Rizici, problemi ili greške koje su uočene:**  
Postoji rizik od pogrešnog razumijevanja konteksta od strane AI alata, što može dovesti do neoptimalnih rješenja ako se ne izvrši dodatna provjera.  

**Ko je koristio alat:**  
Anes Mirvić

## AI Usage Log – Zapis 2

**Datum:** 26/04/2026  

**Sprint broj:** Sprint 5

**Alat koji je korišten:** Claude Sonnet 4.6  

**Svrha korištenja:**  
Pomoć pri povezivanju ruta u projektu  

**Kratak opis zadatka ili upita:**  
Korisnik je koristio AI alat za pomoć pri definisanju i povezivanju ruta između frontend i backend dijela aplikacije.  

**Šta je AI predložio ili generisao:**  
AI je predložio način organizacije ruta, uključujući strukturu endpointa i povezivanje sa odgovarajućim komponentama i kontrolerima.  

**Šta je tim prihvatio:**  
Prihvaćen je osnovni koncept organizacije ruta i povezivanja komponenti.  

**Šta je tim izmijenio:**  
Nazivi ruta i struktura su djelimično izmijenjeni kako bi bili u skladu sa konvencijama projekta.  

**Šta je tim odbacio:**  
Odbačeni su dijelovi koji su uvodili nepotrebnu kompleksnost ili nisu bili kompatibilni sa ostatkom sistema.  

**Rizici, problemi ili greške koje su uočene:**  
Moguće je da AI predloži rješenja koja nisu optimalna za konkretan projektni kontekst, pa je potrebna dodatna validacija od strane tima.  

**Ko je koristio alat:**  
Anes Mirvić


## AI Usage Log – Zapis 3

**Datum:** 25/04/2026 - 27/04/2026  

**Sprint broj:** Sprint 5

**Alat koji je korišten:** Claude Sonnet 4.6  

**Svrha korištenja:**  
Ubrzavanje razvoja funkcionalnosti registracije i prijave korisnika (backend i frontend)  

**Kratak opis zadatka ili upita:**  
Korisnik je koristio AI alat tokom implementacije registracije i login sistema, uključujući validaciju podataka, autentifikaciju, povezivanje frontend forme sa backend rutama i upravljanje greškama.  

**Šta je AI predložio ili generisao:**  
- primjere implementacije registracije i login logike (npr. hashiranje lozinke, validacija inputa)  
- prijedloge za strukturu API ruta (npr. `/register`, `/login`)  
- način povezivanja frontend forme sa backend endpointima  
- rukovanje greškama i prikaz poruka korisniku  
- optimizacije u organizaciji koda   

**Šta je tim prihvatio:**  
- osnovnu logiku autentifikacije i validacije  
- strukturu API ruta i način komunikacije između frontend-a i backend-a  
- prijedloge za obradu grešaka i korisnički feedback  

**Šta je tim izmijenio:**  
- prilagođene su validacije kako bi odgovarale specifičnim zahtjevima projekta  
- izmijenjena je struktura odgovora sa backend-a radi konzistentnosti  

**Šta je tim odbacio:**  
- dijelovi koda koji su uvodili nepotrebne biblioteke ili kompleksnost  
- generička rješenja koja nisu odgovarala arhitekturi projekta  

**Rizici, problemi ili greške koje su uočene:**  
- AI ponekad daje rješenja koja ne odgovaraju postojećoj strukturi projekta  
- potrebno je dodatno testiranje sigurnosnih aspekata (npr. autentifikacija)  
- rizik od preuzimanja koda bez potpunog razumijevanja  

**Ko je koristio alat:**  
Maida Biber 

## AI Usage Log – Zapis 4

**Datum:** 28/04/2026  

**Sprint broj:** Sprint 5

**Alat koji je korišten:** Claude Sonnet 4.6  

**Svrha korištenja:**  
Pomoć pri implementaciji i organizaciji integracijskih testova  

**Kratak opis zadatka ili upita:**  
Korisnik je koristio AI alat prilikom rada na integracijskim testovima, tražeći savjete o najboljoj praksi za testiranje baze i izolaciju test okruženja.  

**Šta je AI predložio ili generisao:**  
- preporuku da se napravi poseban branch za testiranje  
- savjet da se u tom branchu izvrše sve migracije i koristi odvojeno test okruženje  
- naglasak da nema smisla testirati direktno na produkcionoj (pravoj) bazi zbog rizika i nekonzistentnih podataka  

**Šta je tim prihvatio:**  
- ideju o korištenju posebnog brancha za integracijske testove  
- pristup testiranju na odvojenoj bazi umjesto na glavnoj bazi  

**Šta je tim izmijenio:**  
- način organizacije test okruženja je prilagođen postojećoj strukturi projekta i alatima koji se koriste  

**Šta je tim odbacio:**  
- nisu odbačene ključne preporuke, već su sve primijenjene uz manje prilagodbe  

**Rizici, problemi ili greške koje su uočene:**  
- moguće dodatno vrijeme potrebno za održavanje odvojenog test okruženja  
- potreba za sinkronizacijom migracija između glavnog i test brancha  

**Ko je koristio alat:**  
Irma Topčagić