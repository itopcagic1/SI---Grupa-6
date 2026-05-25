# Sprint 8 - Sprint Review Summary

**Tema diskusije:** Review realizovanih funkcionalnosti i struktura Backloga <br>
**Prisutni:** Članovi tima, Asistent

Tokom Sprint 8 Review sastanka, asistent je izvršio uvid u naš rad i prezentaciju. 

## Šta je išlo dobro / Pohvale:

### 1. Odlična prezentacija urađenog posla
- **Pohvala:** Asistent je pohvalio dobro i detaljno prezentovanje svega što je implementirano tokom ovog sprinta. Prezentacija je bila jasna, organizovana i uspješno je demonstrirala sve funkcionalne dijelove sistema.

---

## Šta treba izmijeniti / Šta nije bilo dobro:

### 1. Logički propust u statistici utakmica i igrača
- Uočena je  greška u poslovnoj logici sistema koja dozvoljava da broj asistencija bude veći od ukupnog broja golova. 

---

### **Akcioni plan za naredni sprint:**

1. **Backend validacija poslovne logike:**
   - Implementirati restrikciju na nivou kontrolera prilikom unosa i ažuriranja statistike meča koja automatski odbija zahtjev ukoliko je `broj_asistencija > broj_golova`.

2. **Frontend UI/UX restrikcije:**
   - Dodati dinamičku validaciju na formi za unos rezultata i statistike. Polje za unos asistencija treba vizuelno signalizirati grešku i onemogućiti (disable) *Submit* dugme ako unesena vrijednost pređe broj golova.

3. **Čišćenje baze i testova:**
   - Pregledati i refaktorisati baze podataka (seedere) kako bi se uklonili svi testni podaci koji sadrže ovu nelogičnost, te napisati unit testove koji pokrivaju ovo novo pravilo validacije.