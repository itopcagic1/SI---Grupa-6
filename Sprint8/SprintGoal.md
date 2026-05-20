# Sprint Goal — Sprint 8

## Ciljevi sprinta

Cilj sprinta 8 je zaokružiti sistem za praćenje rezultata i analitiku takmičenja (unos i korekcija rezultata, detaljna statistika igrača/timova, dinamičko računanje tabele plasmana, te statistički lideri lige), kao i implementirati napredni podsistem za upravljanje sportskim objektima i njihovim terminima (CRUD sa soft-delete mehanizmom, kalendar termina, rezervacije i administratorsko blokiranje).

---

## Ključne stavke koje tim želi završiti

- Unos, korekcija i pregled rezultata utakmica, integrisano sa unosom statistike
- Detaljno upravljanje statistikom i doprinosom igrača i timova na pojedinačnim utakmicama
- Dinamički proračun i automatsko generisanje tabele plasmana na osnovu unesenih rezultata
- Analitika sveukupnih individualnih i timskih performansi unutar lige (top strijelci i lideri statistike)
- CRUD upravljanje sportskim objektima uz soft-delete mehanizam i napredne validacije
- Rezervacija, otkazivanje i administratorsko blokiranje termina kroz kalendar sportskih objekata

---

## Rizici i zavisnosti

### Rizici

- **Konzistentnost i validacija statistike:** Zbir golova ili poena pojedinačnih igrača na utakmici mora se tačno podudarati sa ukupnim rezultatom tima kako bi se izbjegli neispravni podaci.
- **Konflikti u rezervacijama:** Upravljanje preklapanjem termina pri dinamičkim rezervacijama, otkazivanjima ili blokiranjima zahtijeva robusnu validaciju kako bi se spriječile dvostruke rezervacije.
- **Integritet kod soft-delete-a:** Osiguravanje da soft-delete sportskog objekta ne naruši istorijske podatke o odigranim utakmicama i ranijim rezervacijama.

### Zavisnosti

- **Zadatak 1 i Zadatak 2:** Statistika igrača i timova na utakmici se može unijeti tek nakon što je uspješno upisan i spašen konačni rezultat utakmice.
- **Zadatak 3 ovisi o Zadatku 1:** Dinamički proračun bodova i ažuriranje tabele plasmana direktno zavise od tačnog i blagovremenog unosa ili korekcije rezultata utakmice.
