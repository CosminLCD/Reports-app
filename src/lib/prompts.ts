import type { ManualFields, CustomField } from '@/types'

export interface PromptSelectOptions {
  disability?: string[]
  teamOfInterest?: string[]
  prioritization?: string[]
  levelOfComplexity?: string[]
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

  return `Ești un expert în accesibilitate web cu cunoaștere profundă a standardelor WCAG 2.1 și 2.2. Analizezi o problemă de accesibilitate identificată în timpul unui audit profesional.

## Context audit
- Client: ${manualFields.client}
- Pagini: ${pagesLine}
- Dispozitiv: ${manualFields.device.join(', ')}
- Sistem de operare: ${manualFields.operatingSystem.join(', ')}
- Browser: ${manualFields.browser.join(', ')}

## Descrierea problemei (de la auditor)
${descriereScurta}
${codBlock}
## Sarcina ta
Generează o analiză completă a acestei probleme de accesibilitate.

Răspunde EXCLUSIV cu un obiect JSON valid, fără text suplimentar, fără markdown, fără explicații în afara obiectului JSON.

Schema JSON exactă cerută:
{
  "problem": "string - descriere tehnică detaliată a problemei (2-4 propoziții, în română)",
  "shortDescription": "string - rezumat scurt al problemei în maxim 25 de cuvinte, în română",
  "solution": "string - explicație pentru client non-tehnic, fără jargon, scrisă ca pentru un manager de business (2-3 propoziții, în română)",
  "technicalSolution": "string - codul de fix recomandat, complet și funcțional, cu comentarii explicative",
  "wcag": "string - criteriul WCAG exact în format X.X.X (ex: 1.4.3, 2.1.1)",
  "wcagLevel": "string - nivelul de conformitate WCAG, una din: A | AA | AAA",
  "disability": "string - UN SINGUR tip de dizabilitate afectat (cea mai relevantă)${selectOptions?.disability?.length ? `, una din: ${selectOptions.disability.join(' | ')}` : ''}",
  "teamOfInterest": "string${selectOptions?.teamOfInterest?.length ? ` - una din: ${selectOptions.teamOfInterest.join(' | ')}` : ' - echipa responsabilă'}",
  "prioritization": "string${selectOptions?.prioritization?.length ? ` - una din: ${selectOptions.prioritization.join(' | ')}` : ' - prioritatea problemei'}",
  "levelOfComplexity": "string${selectOptions?.levelOfComplexity?.length ? ` - una din: ${selectOptions.levelOfComplexity.join(' | ')}` : ' - complexitatea remedierii'}"${customSchemaBlock}
}

Reguli obligatorii:
- "wcag" trebuie să fie un criteriu WCAG 2.1 sau 2.2 valid în format X.X.X
- "wcagLevel" este nivelul de conformitate: A (cel mai de bază), AA (standard), AAA (cel mai strict)
- "shortDescription" trebuie să fie maxim 25 de cuvinte
- "technicalSolution" trebuie să conțină cod HTML/CSS/JS/ARIA concret, nu descriere generică
- "prioritization" Gold = impact major asupra utilizatorilor, Bronze = impact minor
- "levelOfComplexity" Mare = necesită refactoring semnificativ al componentelor
- Dacă există imagine atașată, analizează-o vizual pentru a înțelege mai bine problema
- Câmpurile "problem", "shortDescription", "solution", "disability" trebuie scrise în limba română`
}
