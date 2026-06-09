# Sprint 10 - Sprint Review Summary

**Tema diskusije:** Review realizovanih funkcionalnosti i završna stabilizacija sistema <br>
**Prisutni:** Članovi tima, Asistent

Tokom Sprint 10 Review sastanka, asistent je izvršio uvid u naš rad, finalnu prezentaciju i deployment spremnost sistema.

## Šta je išlo dobro / Pohvale:

### 1. Uspješna prezentacija i stabilnost prikazanog
- **Pohvala:** Sve funkcionalnosti koje su prezentovane tokom ovog review-a radile su besprijekorno i bez tehničkih poteškoća. Asistent je pohvalio stabilnost prikazanih dijelova sistema i fluidnost same prezentacije.

---

## Šta treba izmijeniti / Šta nije bilo dobro:

### 1. Manji obim implementiranih funkcionalnosti
- **Kritika:** Uočeno je da je tokom ovog sprinta isporučen relativno mali broj novih poslovnih/korisničkih funkcionalnosti. Fokus je bio previše pomjeren na tehničku pozadinu, što je rezultiralo manjim vidljivim napretkom na samom proizvodu (feature-wise) za krajnjeg korisnika.

---

### **Akcioni plan za naredni sprint (izvučeno iz realizovanog rada):**

S obzirom na to da su u Sprintu 10 uspješno postavljeni temelji infrastrukture i dokumentacije, u narednom periodu fokus se prebacuje na održavanje te stabilnosti uz pojačan tempo razvoja novih funkcionalnosti.

1. **Održavanje i replikacija Docker & CI/CD standarda:**
   - Nastaviti koristiti postavljanje okruženja jednom komandom (`docker compose up --build`) za sve buduće mikroservise. Iskoristiti stabilni GitHub Actions workflow za automatski deployment na Railway kako bi se nove funkcionalnosti odmah testirale u produkcionom okruženju.

2. **Ekspanzija AI mikroservisa i backend integracije:**
   - Na bazi uspješno integrisanog Python FastAPI servisa sa Express backendom, planirati naprednije rute i kompleksnije AI predikcije, osiguravajući da se podaci i dalje ispravno upisuju u bazu i prikazuju na frontendu bez komplikacija u međuservisnoj komunikaciji.

3. **Optimizacija procesa dokumentovanja i QA:**
   - Kako bi se izbjegao pritisak s kraja ovog sprinta, zadaci vezani za tehničku dokumentaciju i *end-to-end* testiranje (od frontenda do AI servisa) moraju se planirati i izvršavati paralelno sa razvojem novih funkcionalnosti, a ne ostavljati za sam kraj sprinta.
