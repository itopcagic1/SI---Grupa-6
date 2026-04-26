**ID:** DL-01  

**Datum:** 25/04/2026  

**Naziv:** Odabir baze podataka i infrastrukture  

**Opis:**  
Potrebno je odabrati odgovarajuću bazu podataka i infrastrukturu za projekat koja će podržati razvoj aplikacije, omogućiti jednostavno upravljanje konekcijama i biti pogodna za timski rad i buduće proširenje sistema (npr. AI funkcionalnosti).  

**Razmatrane opcije:**  
- Neon  
- Supabase  
- Railway  

**Odabrana opcija:**  
Neon  

**Razlog izbora:**  
Neon je odabran jer:  
- omogućava branching baze, što olakšava paralelan rad više članova tima  
- ima ugrađen connection pooler, što pojednostavljuje rad sa konekcijama 
- pruža fleksibilnost i bolju kontrolu nad backend arhitekturom u odnosu na Supabase  
- izbjegava potencijalne dugoročne komplikacije i ograničenja koje bi mogli imati sa Supabase pristupom  

**Posljedice odluke:**  

*Pozitivne:* 
- lakši timski rad zbog branchinga  
- jednostavnije upravljanje konekcijama  
- veća fleksibilnost za budući razvoj (npr. AI funkcionalnosti)  

*Negativne:* 
- potrebno je više ručne konfiguracije u odnosu na Supabase  
- veća odgovornost tima za implementaciju pojedinih funkcionalnosti  

**Status odluke:**  
Aktivna  