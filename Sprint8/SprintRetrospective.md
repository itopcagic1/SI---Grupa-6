# Sprint Retrospective Summary - Sprint 8

## Šta je išlo dobro

- **Uspješna integracija uprkos zavisnostima:** Iako su moduli bili usko povezani (npr. statistika igrača i tabela plasmana su direktno zavisile od unosa rezultata utakmica), integracija je prošla glatko i sve je završeno na vrijeme.
- **Poštovanje rokova i dogovora sa sastanka:** Prije samog početka rada održali smo sastanak na kojem smo se čvrsto dogovorili da se ne smije kasniti sa prvobitnom verzijom koda. Ovaj dogovor je u potpunosti ispoštovan.
- **Paralelni razvoj i dobra podjela rada:** Podjela posla na analitiku takmičenja (rezultati, tabele, statistika) i podsistem za upravljanje sportskim objektima omogućila je članovima tima jasan fokus.

## Šta nije išlo dobro

- **Sinhronizacija lokalnih okruženja:** Manji zastoji u lokalnom radu prilikom regenerisanja Prisma klijenta zbog zaključanih procesa u pozadini.

## Šta treba promijeniti

- **Zadržavanje prakse planiranja:** Obavezno nastaviti sa održavanjem kratkih usklađujućih sastanaka prije samog početka koda, jer su se pokazali ključnim za poštovanje rokova.

## Konkretne akcije za naredni sprint

- Detaljnije integracijsko testiranje cijelog toka (Unos rezultata -> ažuriranje statistike igrača -> rekalkulacija tabele plasmana).
- Optimizacija brzine učitavanja ključnih ekrana (poput rasporeda i rezultata) u bazi podataka.
- Poliranje korisničkog iskustva na kalendaru rezervacija i upravljanju sportskim objektima.
