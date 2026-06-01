# AI Usage Log - Sprint 10

---

## Zapis 1

**Datum:** 01.06.2026.

**Sprint broj:** 10

**Alat koji je korišten:** Gemini (Antigravity)

**Svrha korištenja:**
Konsultacija oko Prisma ORM sintakse za compound unique ključeve i Tailwind CSS/SVG stilizacije za ikonu srca u Reactu.

**Kratak opis zadatka ili upita:**
- Kako u Prisma ORM-u pravilno definisati pretragu i brisanje zapisa koristeći compound unique ključ definisan na tabeli `OmiljeniTim` (`korisnikId` + `timId`).
- Kako definisati SVG ikone za prazno i popunjeno srce koje se vizuelno uklapaju u narandžastu temu aplikacije na stranici `Timovi.jsx`.

**Šta je AI predložio ili generisao:**
- Predložio je format za Prisma lookup/delete koristeći `korisnikId_timId` objekat:
  ```javascript
  where: {
    korisnikId_timId: {
      korisnikId,
      timId
    }
  }
  ```
- Predložio je SVG markup za ikone srca sa odgovarajućim Tailwind klasama (`text-red-500`, `fill-current`, `stroke-current`).

**Šta je korisnik prihvatio:**
- Prihvaćena je sintaksa za brisanje i pretragu compound unique ključa u Prisma servisu.
- Prihvaćen je osnovni SVG kod za prikazivanje srca.

**Šta je korisnik izmijenio:**
- Sama sam napisala kompletne servise (`omiljeniTimService.js`), kontrolere (`omiljeniTimController.js`) i registrovala rute. Odbila sam generičke predložene auth provjere i sama integrisala rute sa postojećim `authenticateToken` i `requireRole('NAVIJAC')` middleware funkcijama.
- Sama sam prilagodila pozicioniranje srca u flex kontejneru kartice tima na stranici `Timovi.jsx` kako bi se vizuelno uklopilo uz postojeći dropdown meni za administratore.
- Sama sam napisala API klijent funkcije na frontendu i povezala ih sa stanjem stranice.

**Rizici, problemi ili greške koje su uočene:**
- Inicijalni prijedlog AI-ja za brisanje je pokušao koristiti odvojena `where: { korisnikId, timId }` polja, što Prisma ne dopušta za brisanje bez eksplicitnog compound ključa ili primarnog ključa. Sama sam ispravila to na `korisnikId_timId` strukturu.

**Ko je koristio alat:**
Ilma Hindija
