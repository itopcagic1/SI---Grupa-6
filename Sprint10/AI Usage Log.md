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

---

## Zapis 2

**Datum:** 02.06.2026.

**Sprint broj:** 10

**Alat koji je korišten:** Claude Code (Anthropic)

**Svrha korištenja:**
Implementacija funkcionalnosti izvoza PDF izvještaja za rezultate i raspored utakmica, te popravka pratećih problema ( UX greške, autorizacija).

**Kratak opis zadatka ili upita:**
- Zamjena browser `alert()` poruka za greške pri PDF izvozu ljepšim modalnim prozorom.
- Provjera da li postoje nelogičnosti oko PDF dugmeta (vidljivost za sve uloge).
- Dodavanje podrške za ulogu `TRENER` u PDF izvoz.
- Implementacija PDF izvoza rasporeda utakmica (novi backend servis, controller, ruta i frontend integracija).
- Kreiranje testnih fajlova za PDF izvoz po uzoru na postojeće testove u projektu.

**Šta je AI predložio ili generisao:**
- Uvoz i korištenje postojeće funkcije `canExportPDF()` iz `pdfApi.js` koja je bila definisana ali nekorištena u `Rezultati.jsx`.
-Implementaciju `generateRasporedPDF` funkcije u `pdfService.js`, odgovarajućeg controllera u `pdfController.js`, rute u `pdfRoutes.js`, `downloadRasporedPDF` funkcije u `pdfApi.js`, te dugmeta i logike u `Raspored.jsx`.

**Šta je korisnik prihvatio:**
- Modalni prozor za greške umjesto `alert()`.
- Uvoz i primjena `canExportPDF()` za skrivanje dugmeta neovlaštenim korisnicima.


**Šta je korisnik izmijenio:**
- Tekst loading stanja dugmeta promijenjen je iz "GARDENJE..." u "Izvoz u toku..." po vlastitoj odluci korisnika.

**Rizici, problemi ili greške koje su uočene:**
- `canExportPDF()` funkcija je bila definisana u `pdfApi.js` ali nigdje importovana ni korištena u `Rezultati.jsx`, što je značilo da je PDF dugme bilo vidljivo svim korisnicima bez obzira na ulogu.

**Ko je koristio alat:**
Irma Topčagić
