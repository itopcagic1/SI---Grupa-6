## AI Usage Log 1 - Zapis 1

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

**Datum:** 25/04/2026 

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

## AI Usage Log – Zapis 5

**Datum:** 28/04/2026  

**Sprint broj:** Sprint 5

**Alat koji je korišten:** Claude Sonnet 4.6  

**Svrha korištenja:**  
Pomoć pri podešavanju testnog okruženja i instalaciji potrebnih zavisnosti  

**Kratak opis zadatka ili upita:**  
Korisnik je koristio AI alat tokom rada na testovima kako bi dobio informacije o dodatnim paketima, konfiguraciji i fajlovima koji su potrebni da testovi ispravno rade.  

**Šta je AI predložio ili generisao:**  
- listu potrebnih instalacija i paketa za test okruženje  
- sugestije o dodatnim konfiguracionim fajlovima  
- preporuke za ispravnu strukturu test setup-a  

**Šta je tim prihvatio:**  
- instalaciju potrebnih paketa i zavisnosti  
- osnovnu strukturu test okruženja  

**Šta je tim izmijenio:**  
- prilagođena je konfiguracija prema postojećoj strukturi projekta  
- određeni koraci su pojednostavljeni zbog specifičnosti implementacije  

**Šta je tim odbacio:**  
- dodatne kompleksne konfiguracije koje nisu bile potrebne za trenutni scope projekta  

**Rizici, problemi ili greške koje su uočene:**  
- mogućnost neslaganja između lokalnog i test okruženja  
- potreba za dodatnim ručnim podešavanjem zavisnosti  

**Ko je koristio alat:**  
Ilma Hindija

## AI Usage Log – Zapis 6

**Datum:** 25/04/2026  

**Sprint broj:** Sprint 5

**Alat koji je korišten:** Claude Sonnet 4.6  

**Svrha korištenja:**  
Analiza ERD dijagrama i relacija između entiteta  

**Kratak opis zadatka ili upita:**  
Korisnik je koristio AI alat za analizu ERD dijagrama kako bi provjerio logičku ispravnost i konzistentnost veza između entiteta u bazi podataka. Fokus je bio na razumijevanju strukture modela i međusobnih relacija tabela.  

**Šta je AI predložio ili generisao:**  
- analiza ERD dijagrama i veza između entiteta  
- provjera logičke konzistentnosti relacija između tabela  
- identifikacija potencijalnih nejasno definisanih ili dvosmislenih veza  
- objašnjenje kako su entiteti međusobno povezani u okviru sistema  

**Šta je tim prihvatio:**  
- uvid u trenutno stanje ERD dijagrama i relacija između entiteta  
- zaključke o tome da su postojeće veze logički konzistentne / gdje postoje nejasnoće  
- smjernice koje dijelove modela baze treba dodatno provjeriti ili razjasniti  

**Šta je tim izmijenio:**  
- nije bilo direktnih izmjena u modelu baze na osnovu ove analize  

**Šta je tim odbacio:**  
- nije bilo konkretnih implementacionih prijedloga za odbacivanje  
- analiza nije rezultirala promjenom arhitekture u ovoj fazi  

**Rizici, problemi ili greške koje su uočene:**  
- moguće nejasnoće u definiciji pojedinih relacija između entiteta  
- potreba za dodatnom validacijom modela kroz implementaciju i testiranje  
- rizik da se logičke neusklađenosti ne uoče bez praktične provjere  

**Ko je koristio alat:**  
Semir Jamaković

## AI Usage Log – Zapis 7

**Datum:** 27/04/2026  

**Sprint broj:** Sprint 5

**Alat koji je korišten:** Claude Sonnet 4.6  

**Svrha korištenja:**  
Pomoć pri implementaciji validacije podataka i strukture autentifikacijskog sistema  

**Kratak opis zadatka ili upita:**  
Korisnik je koristio AI alat kao pomoć pri implementaciji validacije podataka koristeći Zod, kao i pri strukturiranju kontrolera za autentifikaciju korisnika, uključujući login i registraciju.  

**Šta je AI predložio ili generisao:**  
- implementaciju validacije koristeći Zod 
- strukturu kontrolera za autentifikaciju (register/login)  
- način obrade grešaka i konzistentne API odgovore  
- organizaciju koda prema separation of concerns principu  

**Šta je tim prihvatio:**  
- Zod validacijski pristup  
- osnovnu strukturu auth kontrolera  
- standardizovan način obrade grešaka  

**Šta je tim izmijenio:**  
- prilagođene su validacione šeme specifičnim poslovnim pravilima projekta  
- struktura fajlova je prilagođena postojećoj arhitekturi backend-a  

**Šta je tim odbacio:**  
- generičke implementacije koje nisu odgovarale projektu  
- nepotrebne dodatne apstrakcije  

**Rizici, problemi ili greške koje su uočene:**  
- potreba za dodatnim testiranjem validacije  
- moguće neslaganje frontend i backend validacija ako nisu usklađene  

**Ko je koristio alat:**  
Mehdi Zaimović

## AI Usage Log – Zapis 8

**Datum:** 27/04/2026  

**Sprint broj:** Sprint 5  

**Alat koji je korišten:** Claude Sonnet 4.6  

**Svrha korištenja:**  
Instalacija i konfiguracija ključnih frontend biblioteka te unapređenje UX-a na autentifikacijskim formama  

**Kratak opis zadatka ili upita:**  
Korisnik je koristio AI alat za pomoć pri instalaciji i konfiguraciji frontend zavisnosti, implementaciji validacije formi, dodavanju animacija i povezivanju frontend-a sa backend API-jem. Fokus je bio na poboljšanju korisničkog iskustva na registraciji i login formama.  

**Šta je AI predložio ili generisao:**  
- upute za instalaciju i konfiguraciju biblioteka u projektu  
- implementaciju React Hook Form za naprednu validaciju formi  
- implementaciju Framer Motion za animacije i poboljšanje UX-a  
- preporuke za organizaciju dependencies i rješavanje grešaka pri instalaciji paketa  
- način povezivanja frontend validacije sa vizuelnim feedback-om  
- pristup asinhronoj komunikaciji sa backend-om kroz API klijent  

**Šta je tim prihvatio:**  
- korištenje React Hook Form za validaciju formi  
- korištenje Framer Motion za animacije  
- konfiguraciju axios klijenta za komunikaciju sa backend-om  
- osnovni pristup asinhronom rukovanju greškama  

**Šta je tim izmijenio:**  
- struktura formi prilagođena potrebama aplikacije  
- axios konfiguracija organizovana u authApi.js radi modularnosti  
- UI feedback dodatno prilagođen (poruke grešaka i validacije)  

**Šta je tim odbacio:**  
- alternativne biblioteke koje nisu bile kompatibilne sa projektom  
- nepotrebno kompleksna rješenja iz AI prijedloga  

**Rizici, problemi ili greške koje su uočene:**  
- moguće greške pri instalaciji zbog verzija paketa  
- potreba za usklađivanjem frontend i backend validacije  
- rizik nekonzistentnog UX-a ako se pravila ne sinhronizuju  

**Ko je koristio alat:**  
Maida Biber