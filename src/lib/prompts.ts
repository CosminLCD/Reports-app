import fs from 'fs'
import path from 'path'
import type { ManualFields, CustomField } from '@/types'

export type RegenerableField = 'shortDescription' | 'problem' | 'solution' | 'technicalSolution'

function loadFieldInstructions(filename: string): string {
  return fs.readFileSync(
    path.join(process.cwd(), 'src', 'lib', 'prompts', filename),
    'utf-8'
  )
}

const fieldMarkdown: Record<RegenerableField, string> = {
  shortDescription: loadFieldInstructions('short-description.md'),
  problem: loadFieldInstructions('problem.md'),
  solution: loadFieldInstructions('solution.md'),
  technicalSolution: loadFieldInstructions('technical-solution.md'),
}

const fieldInstructions: Record<RegenerableField, string> = {
  shortDescription: 'maxim 20 de cuvinte, în română',
  problem: '2-4 propoziții tehnice, în română',
  solution: '2-3 propoziții non-tehnice pentru manager de business, în română',
  technicalSolution: 'cod HTML/CSS/JS/ARIA complet și funcțional cu comentarii',
}

export function buildFieldRegenerationPrompt(
  field: RegenerableField,
  currentValue: string,
  comment: string,
  manualFields: ManualFields,
  descriereScurta: string,
  codSursa?: string,
): string {
  const pagesLine = manualFields.pages.map((p) => `${p.pageName} (${p.pageLink})`).join(', ')
  const codBlock = codSursa?.trim()
    ? `\n## Cod sursă relevant\n\`\`\`\n${codSursa}\n\`\`\`\n`
    : ''

  return `Ești un expert în accesibilitate web. Ai generat anterior conținut pentru o problemă de accesibilitate.

## Context audit
- Client: ${manualFields.client}
- Pagini: ${pagesLine}
- Dispozitiv: ${manualFields.device.join(', ')}
- Sistem de operare: ${manualFields.operatingSystem.join(', ')}
- Browser: ${manualFields.browser.join(', ')}

## Descrierea problemei (de la auditor)
${descriereScurta}${codBlock}
## Valoarea curentă generată de AI
${currentValue}

## Feedback utilizator
${comment}

## Instrucțiuni detaliate pentru câmpul „${field}"
${fieldMarkdown[field]}

## Sarcina ta
Regenerează EXCLUSIV câmpul „${field}" (${fieldInstructions[field]}), respectând instrucțiunile de mai sus și feedback-ul utilizatorului.

Răspunde EXCLUSIV cu noua valoare a câmpului, fără JSON, fără explicații, fără text suplimentar. Doar conținutul câmpului.`
}

export interface PromptSelectOptions {
  disability?: string[]
  teamOfInterest?: string[]
  prioritization?: string[]
  levelOfComplexity?: string[]
  wcagCategory?: string[]
}

export function buildAccessibilityAnalysisPrompt(
  manualFields: ManualFields,
  descriereScurta: string,
  codSursa?: string,
  customFields?: CustomField[],
  selectOptions?: PromptSelectOptions
): string {
  const customFieldsSchema = customFields
    ?.filter((f) => f.aiGenerated)
    .map((f) => {
      const typeHint =
        f.type === 'select' && f.options?.length
          ? `string - una din: ${f.options.join(' | ')}`
          : 'string'
      return `  "${f.id}": "${typeHint} - ${f.label}"`
    })
    .join(',\n')

  const customSchemaBlock = customFieldsSchema
    ? `,\n  "customFields": {\n${customFieldsSchema}\n  }`
    : ''

  const codBlock = codSursa?.trim()
    ? `\n## Cod sursă relevant (furnizat de auditor)\n\`\`\`\n${codSursa}\n\`\`\`\nFolosește acest cod pentru a genera o soluție tehnică precisă cu fix-ul exact aplicat pe structura existentă.\n`
    : ''

  const pagesLine = manualFields.pages
    .map((p) => `${p.pageName} (${p.pageLink})`)
    .join(', ')

  const activeBrandColors = manualFields.brandColors?.filter(
    (c) => /^#[0-9A-Fa-f]{6}$/.test(c.hex)
  ) ?? []

  const brandColorsBlock = activeBrandColors.length > 0
    ? `\n## Culori de brand ale clientului\n${activeBrandColors.map((c) => `- ${c.label}: ${c.hex}`).join('\n')}\n\nIMPORTANT: Dacă această problemă implică contrast de culori (ex: WCAG 1.4.3, 1.4.11), propune soluții SPECIFICE care utilizează sau se armonizează cu aceste culori de brand. Nu sugera culori generice. Calculează sau estimează rapoartele de contrast față de aceste culori și propune combinații care respectă WCAG AA (minim 4.5:1 pentru text, 3:1 pentru elemente non-text).\n`
    : ''

  return `Ești un expert în accesibilitate web cu cunoaștere profundă a standardelor WCAG 2.1 și 2.2. Analizezi o problemă de accesibilitate identificată în timpul unui audit profesional.

## Context audit
- Client: ${manualFields.client}
- Pagini: ${pagesLine}
- Dispozitiv: ${manualFields.device.join(', ')}
- Sistem de operare: ${manualFields.operatingSystem.join(', ')}
- Browser: ${manualFields.browser.join(', ')}${brandColorsBlock}

## Descrierea problemei (de la auditor)
${descriereScurta}
${codBlock}
## Instrucțiuni detaliate pentru câmpuri

### shortDescription
${fieldMarkdown.shortDescription}

### problem
${fieldMarkdown.problem}

### solution
${fieldMarkdown.solution}

### technicalSolution
${fieldMarkdown.technicalSolution}

## Sarcina ta
Generează o analiză completă a acestei probleme de accesibilitate respectând instrucțiunile de mai sus pentru fiecare câmp.

Răspunde EXCLUSIV cu un obiect JSON valid, fără text suplimentar, fără markdown, fără explicații în afara obiectului JSON.

Schema JSON exactă cerută:
{
  "problem": "string - ${fieldInstructions.problem}",
  "shortDescription": "string - ${fieldInstructions.shortDescription}",
  "solution": "string - ${fieldInstructions.solution}",
  "technicalSolution": "string - ${fieldInstructions.technicalSolution}",
  "wcag": "string - criteriile WCAG relevante în format X.X.X, separate prin '/' dacă sunt mai multe (ex: \"1.4.3\" sau \"1.4.3/2.1.1\" sau \"1.3.1/1.4.1/2.4.6\"). Include toate criteriile care se aplică problemei, maxim 3.",
  "wcagLevel": "string - nivelul de conformitate WCAG, una din: A | AA | AAA",
  "wcagCategory": "string - categoria/categoriile WCAG${selectOptions?.wcagCategory?.length ? `, una sau mai multe din: ${selectOptions.wcagCategory.join(' | ')}, separate prin '/' dacă sunt mai multe` : ', separate prin \"/\" dacă sunt mai multe'}",
  "disability": "string - tipurile de dizabilitate afectate${selectOptions?.disability?.length ? `, una sau mai multe din: ${selectOptions.disability.join(' | ')}, separate prin '/' dacă sunt mai multe (ex: \"Visual\" sau \"Visual/Motor\")` : ', separate prin \"/\" dacă sunt mai multe'}",
  "teamOfInterest": "string - echipele responsabile${selectOptions?.teamOfInterest?.length ? `, una sau mai multe din: ${selectOptions.teamOfInterest.join(' | ')}, separate prin '/' dacă sunt mai multe (ex: \"Design\" sau \"Design/Tehnic\")` : ', separate prin \"/\" dacă sunt mai multe'}",
  "prioritization": "string${selectOptions?.prioritization?.length ? ` - una din: ${selectOptions.prioritization.join(' | ')}` : ' - prioritatea problemei'}",
  "levelOfComplexity": "string${selectOptions?.levelOfComplexity?.length ? ` - una din: ${selectOptions.levelOfComplexity.join(' | ')}` : ' - complexitatea remedierii'}"${customSchemaBlock}
}

Reguli obligatorii:
- "wcag" trebuie să conțină criterii WCAG 2.1 sau 2.2 valide în format X.X.X; dacă problema afectează mai multe criterii, include-le pe toate (max 3), separate prin '/'
- "wcagLevel" este nivelul de conformitate: A (cel mai de bază), AA (standard), AAA (cel mai strict)
- "shortDescription" trebuie să fie maxim 20 de cuvinte
- "technicalSolution" trebuie să conțină cod HTML/CSS/JS/ARIA concret, nu descriere generică
- "prioritization" Gold = impact major asupra utilizatorilor, Bronze = impact minor
- "levelOfComplexity" Mare = necesită refactoring semnificativ al componentelor
- Dacă există imagine atașată, analizează-o vizual pentru a înțelege mai bine problema
- "disability" trebuie să conțină doar valori din lista furnizată, separate prin '/' dacă sunt mai multe
- "wcagCategory" trebuie să conțină doar valori din lista furnizată (dacă există), separate prin '/' dacă sunt mai multe
- Câmpurile "problem", "shortDescription", "solution", "disability" trebuie scrise în limba română`
}
