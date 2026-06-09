# Sprint Retrospective Summary - Sprint 11

## Šta je išlo dobro

* **Uspješna Dockerizacija sistema:** Cijeli sistem (frontend, backend, baza podataka, Redis i AI servis) uspješno je kontejnerizovan i pokreće se jednom komandom `docker compose up --build`, što značajno olakšava postavljanje okruženja za evaluaciju
* **Integracija AI mikroservisa:** Python FastAPI servis za predikciju rezultata uspješno je integrisan s Express backendom — predikcije se generišu, upisuju u bazu i prikazuju na frontendu bez većih komplikacija
* **Funkcionalan CI/CD pipeline:** GitHub Actions workflow ispravno blokira deploy kada testovi padnu i automatski pokreće deployment na Railway nakon što svi testovi prođu, što je uvelo red u proces isporuke koda
* **Ravnomjerna raspodjela zadataka po fazama:** Podjela na fazu implementacije i fazu dokumentacije/QA omogućila je paralelni rad bez međusobnog blokiranja članova tima
* **Kompletirana završna dokumentacija:** Svi planirani dokumentacijski artefakti (korisnički priručnik, deployment procedura, arhitekturalni pregled, release notes, known issues) završeni su u okviru sprinta


## Šta nije išlo dobro

* **Složenost konfiguracije međuservisne komunikacije:** Uspostavljanje ispravne mreže između Docker kontejnera (posebno između Express backenda i AI servisa) zahtijevalo je više vremena nego što je planirano
* **Veći obim dokumentacije od očekivanog:** Pisanje detaljnih dokumentacijskih artefakata pokazalo se zahtjevnijim nego što je procijenjeno, što je stvorilo pritisak prema kraju sprinta
* **Inicijalni problemi s automatskim migracijama:** Automatsko pokretanje Prisma migracija u build koraku zahtijevalo je dodatno usklađivanje s Railway konfiguracijom prije nego što je stabilno proradilo

## Šta treba promijeniti

* **Ranije planiranje dokumentacije:** Dokumentacijske zadatke treba rasporediti ravnomjernije kroz sprint umjesto da se koncentrišu pri kraju, kako ne bi konkurisali s QA aktivnostima
* **Prethodno definisanje environment varijabli:** Prije početka implementacije treba unaprijed dogovoriti i dokumentovati sve potrebne environment varijable između servisa kako bi se izbjegle blokade tokom integracije
* **Rezervisati više vremena za end-to-end testiranje:** Testiranje cjelokupnog toka kroz sve servise (od frontenda do AI mikroservisa) treba planirati kao zasebnu aktivnost, a ne ostaviti za sam kraj sprinta

## Konkretne akcije za naredni sprint

* **Verifikacija kompletnosti sistema:** Provesti finalni prolaz kroz sve funkcionalnosti i osigurati da sistem radi ispravno u Docker okruženju i na Railway platformi bez ručne intervencije
* **Završno poliranje korisničkog iskustva:** Ukloniti preostale sitne vizualne nedostatke i provjeriti da su sve korisničke poruke i notifikacije konzistentne
* **Priprema za evaluaciju:** Osigurati da sva dokumentacija precizno odražava trenutno stanje sistema i da evaluator može pokrenuti i koristiti sistem isključivo na osnovu dostavljenih uputa