# Câmp: Problemă

## Scop
Descriere tehnică detaliată a problemei, destinată auditorului și echipei tehnice de dezvoltare.

## Reguli obligatorii
1. **Lungime:** Exact 2-4 propoziții — nu mai puțin, nu mai mult
2. **Limbă:** Exclusiv în limba română
3. **Nivel tehnic:** Limbaj tehnic specific accesibilității web (ARIA, HTML semantic, focus, contrast, screen reader etc.)
4. **Conținut obligatoriu în răspuns:**
   - Elementul HTML sau componenta afectată (ex: `<input>`, `<button>`, `<img>`, `<nav>`)
   - Comportamentul actual problematic — ce se întâmplă acum, în mod greșit
   - Impactul concret asupra utilizatorilor cu dizabilități — ce nu pot face sau ce experiență negativă au
   - De ce reprezintă o barieră de accesibilitate
5. **Ton:** Descriptiv, precis, bazat pe fapte observate
6. **Nu include:** Soluții, cod de fix, recomandări, numerele criteriului WCAG menționate explicit în text

## Exemple corecte
- „Elementul `<input type='text'>` nu are un atribut `aria-label` sau un element `<label>` asociat prin `for`/`id`. Utilizatorii de screen reader nu primesc nicio informație despre scopul câmpului în momentul navigării cu Tab. Aceasta face imposibilă completarea formularului pentru persoanele cu deficiențe vizuale care folosesc tehnologii asistive."
- „Butonul de submit al formularului de contact conține doar o iconiță SVG, fără text vizibil sau atribut `aria-label`. Screen reader-ul anunță elementul ca „buton" fără a indica acțiunea sa. Utilizatorii care navighează exclusiv cu tastatura sau cu tehnologii asistive nu pot determina funcția butonului."
