# Sprint Retrospective Summary - Sprint 9

## Šta je išlo dobro

- **Kompletna realizacija:** Svi planirani zadaci su uspješno realizirani
- **Tehnička kompleksnost:** Uspješno implementirane kompleksne tehnologije (*BullMQ/Redis* za automatizaciju tajmera, *WebSockets (Socket.io)* za real-time komunikaciju i liste čekanja), za koje smo predviđali da će biti problema
- **Pokrivenost poslovne logike:** U potpunosti je zaokružen ciklus rezervacija i monitoringa za sve tri uloge u sistemu (vlasnici, treneri, igrači)
- **Dobra komunikacija unutar tima**

## Šta nije išlo dobro

- **Prekasno završavanje zadataka:** Većina ključnih funkcionalnosti je završena pred sam kraj roka. Ovo je stvorilo ogroman pritisak na tim u posljednjim danima
- **Preobiman sprint:** Zbog povezanosti određenih dijelova u poslovnoj logici, dosta zadataka iz Sprinta 10 prebačeno u Sprint 9

## Šta treba promijeniti

- **Procjena i dekompozicija zadataka:** Zadaci koji uključuju eksterne servise i kompleksne backend arhitekture moraju se bolje procjenjivati i razbijati na još manje, nezavisne cjeline
- - **Inkrementalno spajanje koda:** Umjesto spajanja velikih funkcionalnosti tek na kraju završenog zadatka, trebali smo češće raditi merge sa mainom

## Konkretne akcije za naredni sprint

- **Hitni Code Review i refaktorisanje na startu Sprinta 10:** Odvojiti prva dva dana narednog sprinta za detaljan pregled koda i refaktorisanje, kako bi se osigurala stabilnost prije uvođenja novih feature-a

- **Uvođenje internih rokova:** Za sve zadatke koji predstavljaju zavisnost za druge programere, definisati strogi interni rok unutar prve polovine sprinta 

