export type WCAGLevel = 'A' | 'AA' | 'AAA'

export interface WCAGCriterion {
  name: string
  nameRo: string
  shortDesc: string
  level: WCAGLevel
  slug: string
  version: '2.0' | '2.1' | '2.2'
}

export const WCAG_CRITERIA: Record<string, WCAGCriterion> = {
  '1.1.1': { name: 'Non-text Content', nameRo: 'Conținut non-text', shortDesc: 'Toate imaginile și elementele non-text au alternativă text echivalentă', level: 'A', slug: 'non-text-content', version: '2.0' },

  '1.2.1': { name: 'Audio-only and Video-only (Prerecorded)', nameRo: 'Doar audio și doar video (preînregistrat)', shortDesc: 'Conținut doar audio sau doar video are alternativă text/audio', level: 'A', slug: 'audio-only-and-video-only-prerecorded', version: '2.0' },
  '1.2.2': { name: 'Captions (Prerecorded)', nameRo: 'Subtitrări (preînregistrat)', shortDesc: 'Conținutul video preînregistrat are subtitrări sincronizate', level: 'A', slug: 'captions-prerecorded', version: '2.0' },
  '1.2.3': { name: 'Audio Description or Media Alternative (Prerecorded)', nameRo: 'Descriere audio sau alternativă media (preînregistrat)', shortDesc: 'Video preînregistrat are descriere audio sau alternativă text', level: 'A', slug: 'audio-description-or-media-alternative-prerecorded', version: '2.0' },
  '1.2.4': { name: 'Captions (Live)', nameRo: 'Subtitrări (live)', shortDesc: 'Conținutul audio live are subtitrări sincronizate', level: 'AA', slug: 'captions-live', version: '2.0' },
  '1.2.5': { name: 'Audio Description (Prerecorded)', nameRo: 'Descriere audio (preînregistrat)', shortDesc: 'Video preînregistrat are descriere audio', level: 'AA', slug: 'audio-description-prerecorded', version: '2.0' },
  '1.2.6': { name: 'Sign Language (Prerecorded)', nameRo: 'Limbaj semne (preînregistrat)', shortDesc: 'Audio preînregistrat are interpretare în limbaj semne', level: 'AAA', slug: 'sign-language-prerecorded', version: '2.0' },
  '1.2.7': { name: 'Extended Audio Description (Prerecorded)', nameRo: 'Descriere audio extinsă (preînregistrat)', shortDesc: 'Video are descriere audio extinsă când pauzele sunt insuficiente', level: 'AAA', slug: 'extended-audio-description-prerecorded', version: '2.0' },
  '1.2.8': { name: 'Media Alternative (Prerecorded)', nameRo: 'Alternativă media (preînregistrat)', shortDesc: 'Există alternativă text pentru toate mediile preînregistrate', level: 'AAA', slug: 'media-alternative-prerecorded', version: '2.0' },
  '1.2.9': { name: 'Audio-only (Live)', nameRo: 'Doar audio (live)', shortDesc: 'Conținut audio live are alternativă text echivalentă', level: 'AAA', slug: 'audio-only-live', version: '2.0' },

  '1.3.1': { name: 'Info and Relationships', nameRo: 'Informații și relații', shortDesc: 'Structura și relațiile semantice pot fi determinate programatic', level: 'A', slug: 'info-and-relationships', version: '2.0' },
  '1.3.2': { name: 'Meaningful Sequence', nameRo: 'Secvență logică', shortDesc: 'Ordinea de citire a conținutului este logică și poate fi determinată', level: 'A', slug: 'meaningful-sequence', version: '2.0' },
  '1.3.3': { name: 'Sensory Characteristics', nameRo: 'Caracteristici senzoriale', shortDesc: 'Instrucțiunile nu se bazează doar pe formă, culoare sau poziție', level: 'A', slug: 'sensory-characteristics', version: '2.0' },
  '1.3.4': { name: 'Orientation', nameRo: 'Orientare', shortDesc: 'Conținutul nu este restricționat la o singură orientare a ecranului', level: 'AA', slug: 'orientation', version: '2.1' },
  '1.3.5': { name: 'Identify Input Purpose', nameRo: 'Identificarea scopului input-ului', shortDesc: 'Scopul câmpurilor de input este identificabil programatic (autocomplete)', level: 'AA', slug: 'identify-input-purpose', version: '2.1' },
  '1.3.6': { name: 'Identify Purpose', nameRo: 'Identificarea scopului', shortDesc: 'Scopul componentelor UI poate fi determinat programatic', level: 'AAA', slug: 'identify-purpose', version: '2.1' },

  '1.4.1': { name: 'Use of Color', nameRo: 'Utilizarea culorii', shortDesc: 'Culoarea nu este singurul mijloc de transmitere a informației', level: 'A', slug: 'use-of-color', version: '2.0' },
  '1.4.2': { name: 'Audio Control', nameRo: 'Control audio', shortDesc: 'Audio care pornește automat poate fi oprit sau controlat', level: 'A', slug: 'audio-control', version: '2.0' },
  '1.4.3': { name: 'Contrast (Minimum)', nameRo: 'Contrast (minim)', shortDesc: 'Raport contrast text ≥ 4.5:1 (3:1 pentru text mare)', level: 'AA', slug: 'contrast-minimum', version: '2.0' },
  '1.4.4': { name: 'Resize Text', nameRo: 'Redimensionare text', shortDesc: 'Textul poate fi redimensionat până la 200% fără pierdere de funcționalitate', level: 'AA', slug: 'resize-text', version: '2.0' },
  '1.4.5': { name: 'Images of Text', nameRo: 'Imagini cu text', shortDesc: 'Textul real este preferat în locul imaginilor cu text', level: 'AA', slug: 'images-of-text', version: '2.0' },
  '1.4.6': { name: 'Contrast (Enhanced)', nameRo: 'Contrast (sporit)', shortDesc: 'Raport contrast text ≥ 7:1 (4.5:1 pentru text mare)', level: 'AAA', slug: 'contrast-enhanced', version: '2.0' },
  '1.4.7': { name: 'Low or No Background Audio', nameRo: 'Audio de fundal redus sau absent', shortDesc: 'Audio cu vorbire are fundal scăzut sau lipsește', level: 'AAA', slug: 'low-or-no-background-audio', version: '2.0' },
  '1.4.8': { name: 'Visual Presentation', nameRo: 'Prezentare vizuală', shortDesc: 'Blocurile de text au opțiuni de personalizare (culoare, spațiere, lățime)', level: 'AAA', slug: 'visual-presentation', version: '2.0' },
  '1.4.9': { name: 'Images of Text (No Exception)', nameRo: 'Imagini cu text (fără excepție)', shortDesc: 'Imaginile cu text sunt folosite doar pentru decor sau esențial', level: 'AAA', slug: 'images-of-text-no-exception', version: '2.0' },
  '1.4.10': { name: 'Reflow', nameRo: 'Reflow', shortDesc: 'Conținutul se reformatează fără scroll orizontal la 320px lățime', level: 'AA', slug: 'reflow', version: '2.1' },
  '1.4.11': { name: 'Non-text Contrast', nameRo: 'Contrast non-text', shortDesc: 'Componentele UI și grafica au raport contrast ≥ 3:1 cu vecinii', level: 'AA', slug: 'non-text-contrast', version: '2.1' },
  '1.4.12': { name: 'Text Spacing', nameRo: 'Spațiere text', shortDesc: 'Textul rămâne lizibil când utilizatorul ajustează spațierea', level: 'AA', slug: 'text-spacing', version: '2.1' },
  '1.4.13': { name: 'Content on Hover or Focus', nameRo: 'Conținut la hover sau focus', shortDesc: 'Tooltip-urile pot fi închise, planează deasupra și persistă', level: 'AA', slug: 'content-on-hover-or-focus', version: '2.1' },

  '2.1.1': { name: 'Keyboard', nameRo: 'Tastatură', shortDesc: 'Toată funcționalitatea este accesibilă de la tastatură', level: 'A', slug: 'keyboard', version: '2.0' },
  '2.1.2': { name: 'No Keyboard Trap', nameRo: 'Fără capcană tastatură', shortDesc: 'Focusul tastaturii nu rămâne blocat într-un element', level: 'A', slug: 'no-keyboard-trap', version: '2.0' },
  '2.1.3': { name: 'Keyboard (No Exception)', nameRo: 'Tastatură (fără excepție)', shortDesc: 'Toată funcționalitatea este disponibilă de la tastatură fără excepție', level: 'AAA', slug: 'keyboard-no-exception', version: '2.0' },
  '2.1.4': { name: 'Character Key Shortcuts', nameRo: 'Scurtături cu o singură tastă', shortDesc: 'Scurtăturile cu o singură tastă pot fi dezactivate sau remapate', level: 'A', slug: 'character-key-shortcuts', version: '2.1' },

  '2.2.1': { name: 'Timing Adjustable', nameRo: 'Timp ajustabil', shortDesc: 'Limitele de timp pot fi oprite, ajustate sau extinse de utilizator', level: 'A', slug: 'timing-adjustable', version: '2.0' },
  '2.2.2': { name: 'Pause, Stop, Hide', nameRo: 'Pauză, oprire, ascundere', shortDesc: 'Conținut în mișcare/clipire poate fi pus în pauză sau ascuns', level: 'A', slug: 'pause-stop-hide', version: '2.0' },
  '2.2.3': { name: 'No Timing', nameRo: 'Fără limitare de timp', shortDesc: 'Nu există limite de timp pentru funcționalitate', level: 'AAA', slug: 'no-timing', version: '2.0' },
  '2.2.4': { name: 'Interruptions', nameRo: 'Întreruperi', shortDesc: 'Întreruperile pot fi amânate sau suprimate', level: 'AAA', slug: 'interruptions', version: '2.0' },
  '2.2.5': { name: 'Re-authenticating', nameRo: 'Re-autentificare', shortDesc: 'La expirare sesiune, datele utilizatorului sunt păstrate', level: 'AAA', slug: 're-authenticating', version: '2.0' },
  '2.2.6': { name: 'Timeouts', nameRo: 'Expirări', shortDesc: 'Utilizatorii sunt avertizați despre expirări care duc la pierdere de date', level: 'AAA', slug: 'timeouts', version: '2.1' },

  '2.3.1': { name: 'Three Flashes or Below Threshold', nameRo: 'Trei clipiri sau sub prag', shortDesc: 'Conținutul nu clipește mai mult de 3 ori pe secundă', level: 'A', slug: 'three-flashes-or-below-threshold', version: '2.0' },
  '2.3.2': { name: 'Three Flashes', nameRo: 'Trei clipiri', shortDesc: 'Conținutul nu clipește mai mult de 3 ori pe secundă (strict)', level: 'AAA', slug: 'three-flashes', version: '2.0' },
  '2.3.3': { name: 'Animation from Interactions', nameRo: 'Animație din interacțiuni', shortDesc: 'Animațiile declanșate de interacțiuni pot fi dezactivate', level: 'AAA', slug: 'animation-from-interactions', version: '2.1' },

  '2.4.1': { name: 'Bypass Blocks', nameRo: 'Sărit blocuri', shortDesc: 'Există mecanism pentru a sări peste blocuri repetate (skip link)', level: 'A', slug: 'bypass-blocks', version: '2.0' },
  '2.4.2': { name: 'Page Titled', nameRo: 'Titlu pagină', shortDesc: 'Pagina are un titlu descriptiv care indică scopul', level: 'A', slug: 'page-titled', version: '2.0' },
  '2.4.3': { name: 'Focus Order', nameRo: 'Ordinea focusului', shortDesc: 'Ordinea focusului tastaturii este logică și păstrează semnificația', level: 'A', slug: 'focus-order', version: '2.0' },
  '2.4.4': { name: 'Link Purpose (In Context)', nameRo: 'Scopul link-ului (în context)', shortDesc: 'Scopul fiecărui link este determinabil din textul link-ului sau context', level: 'A', slug: 'link-purpose-in-context', version: '2.0' },
  '2.4.5': { name: 'Multiple Ways', nameRo: 'Moduri multiple', shortDesc: 'Există mai multe căi de a găsi o pagină (meniu, sitemap, căutare)', level: 'AA', slug: 'multiple-ways', version: '2.0' },
  '2.4.6': { name: 'Headings and Labels', nameRo: 'Titluri și etichete', shortDesc: 'Titlurile și etichetele descriu subiectul sau scopul', level: 'AA', slug: 'headings-and-labels', version: '2.0' },
  '2.4.7': { name: 'Focus Visible', nameRo: 'Focus vizibil', shortDesc: 'Focusul tastaturii are indicator vizibil clar', level: 'AA', slug: 'focus-visible', version: '2.0' },
  '2.4.8': { name: 'Location', nameRo: 'Locație', shortDesc: 'Există informații despre locația utilizatorului în site (breadcrumbs)', level: 'AAA', slug: 'location', version: '2.0' },
  '2.4.9': { name: 'Link Purpose (Link Only)', nameRo: 'Scopul link-ului (doar text link)', shortDesc: 'Scopul link-ului este clar doar din textul link-ului', level: 'AAA', slug: 'link-purpose-link-only', version: '2.0' },
  '2.4.10': { name: 'Section Headings', nameRo: 'Titluri de secțiune', shortDesc: 'Secțiunile sunt organizate cu titluri pentru a indica structura', level: 'AAA', slug: 'section-headings', version: '2.0' },
  '2.4.11': { name: 'Focus Not Obscured (Minimum)', nameRo: 'Focus neacoperit (minim)', shortDesc: 'Elementul focusat nu este complet ascuns de alt conținut', level: 'AA', slug: 'focus-not-obscured-minimum', version: '2.2' },
  '2.4.12': { name: 'Focus Not Obscured (Enhanced)', nameRo: 'Focus neacoperit (sporit)', shortDesc: 'Elementul focusat nu este deloc ascuns de alt conținut', level: 'AAA', slug: 'focus-not-obscured-enhanced', version: '2.2' },
  '2.4.13': { name: 'Focus Appearance', nameRo: 'Aspect focus', shortDesc: 'Indicatorul de focus are dimensiune minimă și contrast suficient', level: 'AAA', slug: 'focus-appearance', version: '2.2' },

  '2.5.1': { name: 'Pointer Gestures', nameRo: 'Gesturi cu pointer', shortDesc: 'Gesturile complexe au alternativă cu un singur pointer', level: 'A', slug: 'pointer-gestures', version: '2.1' },
  '2.5.2': { name: 'Pointer Cancellation', nameRo: 'Anulare pointer', shortDesc: 'Acțiunile sunt declanșate la up-event, pot fi anulate', level: 'A', slug: 'pointer-cancellation', version: '2.1' },
  '2.5.3': { name: 'Label in Name', nameRo: 'Eticheta în nume', shortDesc: 'Numele accesibil conține textul vizibil al etichetei', level: 'A', slug: 'label-in-name', version: '2.1' },
  '2.5.4': { name: 'Motion Actuation', nameRo: 'Acționare prin mișcare', shortDesc: 'Funcțiile activate prin mișcare au alternativă UI', level: 'A', slug: 'motion-actuation', version: '2.1' },
  '2.5.5': { name: 'Target Size (Enhanced)', nameRo: 'Dimensiune țintă (sporit)', shortDesc: 'Țintele de click au minim 44x44 pixeli CSS', level: 'AAA', slug: 'target-size-enhanced', version: '2.1' },
  '2.5.6': { name: 'Concurrent Input Mechanisms', nameRo: 'Mecanisme input concurente', shortDesc: 'Aplicația nu restricționează metoda de input disponibilă', level: 'AAA', slug: 'concurrent-input-mechanisms', version: '2.1' },
  '2.5.7': { name: 'Dragging Movements', nameRo: 'Mișcări de tragere', shortDesc: 'Funcțiile cu drag au alternativă cu un singur pointer', level: 'AA', slug: 'dragging-movements', version: '2.2' },
  '2.5.8': { name: 'Target Size (Minimum)', nameRo: 'Dimensiune țintă (minim)', shortDesc: 'Țintele de click au minim 24x24 pixeli CSS', level: 'AA', slug: 'target-size-minimum', version: '2.2' },

  '3.1.1': { name: 'Language of Page', nameRo: 'Limba paginii', shortDesc: 'Limba implicită a paginii este definită programatic (lang)', level: 'A', slug: 'language-of-page', version: '2.0' },
  '3.1.2': { name: 'Language of Parts', nameRo: 'Limba părților', shortDesc: 'Limba pasajelor diferite față de pagină este marcată programatic', level: 'AA', slug: 'language-of-parts', version: '2.0' },
  '3.1.3': { name: 'Unusual Words', nameRo: 'Cuvinte neobișnuite', shortDesc: 'Există definiții pentru jargon, idiomuri și cuvinte rare', level: 'AAA', slug: 'unusual-words', version: '2.0' },
  '3.1.4': { name: 'Abbreviations', nameRo: 'Abrevieri', shortDesc: 'Există mecanism pentru identificarea formei extinse a abrevierilor', level: 'AAA', slug: 'abbreviations', version: '2.0' },
  '3.1.5': { name: 'Reading Level', nameRo: 'Nivel de lectură', shortDesc: 'Există alternativă pentru text peste nivel gimnaziu inferior', level: 'AAA', slug: 'reading-level', version: '2.0' },
  '3.1.6': { name: 'Pronunciation', nameRo: 'Pronunție', shortDesc: 'Există mecanism pentru pronunție când sensul depinde de ea', level: 'AAA', slug: 'pronunciation', version: '2.0' },

  '3.2.1': { name: 'On Focus', nameRo: 'La focus', shortDesc: 'Focusul pe un element nu declanșează schimbare neașteptată de context', level: 'A', slug: 'on-focus', version: '2.0' },
  '3.2.2': { name: 'On Input', nameRo: 'La input', shortDesc: 'Modificarea unui input nu declanșează schimbare neașteptată de context', level: 'A', slug: 'on-input', version: '2.0' },
  '3.2.3': { name: 'Consistent Navigation', nameRo: 'Navigare consistentă', shortDesc: 'Mecanismele de navigare apar în aceeași ordine pe pagini', level: 'AA', slug: 'consistent-navigation', version: '2.0' },
  '3.2.4': { name: 'Consistent Identification', nameRo: 'Identificare consistentă', shortDesc: 'Componentele cu aceeași funcție sunt identificate la fel', level: 'AA', slug: 'consistent-identification', version: '2.0' },
  '3.2.5': { name: 'Change on Request', nameRo: 'Schimbare la cerere', shortDesc: 'Schimbările de context sunt inițiate doar la cererea utilizatorului', level: 'AAA', slug: 'change-on-request', version: '2.0' },
  '3.2.6': { name: 'Consistent Help', nameRo: 'Ajutor consistent', shortDesc: 'Mecanismele de ajutor apar în aceeași ordine relativă pe pagini', level: 'A', slug: 'consistent-help', version: '2.2' },

  '3.3.1': { name: 'Error Identification', nameRo: 'Identificare erori', shortDesc: 'Erorile de input sunt identificate și descrise în text', level: 'A', slug: 'error-identification', version: '2.0' },
  '3.3.2': { name: 'Labels or Instructions', nameRo: 'Etichete sau instrucțiuni', shortDesc: 'Câmpurile care necesită input au etichete sau instrucțiuni', level: 'A', slug: 'labels-or-instructions', version: '2.0' },
  '3.3.3': { name: 'Error Suggestion', nameRo: 'Sugestie eroare', shortDesc: 'Pentru erorile cunoscute se oferă sugestii de corectare', level: 'AA', slug: 'error-suggestion', version: '2.0' },
  '3.3.4': { name: 'Error Prevention (Legal, Financial, Data)', nameRo: 'Prevenire erori (legal, financiar, date)', shortDesc: 'Tranzacțiile importante sunt reversibile, verificabile sau confirmabile', level: 'AA', slug: 'error-prevention-legal-financial-data', version: '2.0' },
  '3.3.5': { name: 'Help', nameRo: 'Ajutor', shortDesc: 'Există ajutor contextual disponibil', level: 'AAA', slug: 'help', version: '2.0' },
  '3.3.6': { name: 'Error Prevention (All)', nameRo: 'Prevenire erori (toate)', shortDesc: 'Toate trimiterile sunt reversibile, verificabile sau confirmabile', level: 'AAA', slug: 'error-prevention-all', version: '2.0' },
  '3.3.7': { name: 'Redundant Entry', nameRo: 'Introducere redundantă', shortDesc: 'Informațiile cerute anterior sunt auto-completate sau selectabile', level: 'A', slug: 'redundant-entry', version: '2.2' },
  '3.3.8': { name: 'Accessible Authentication (Minimum)', nameRo: 'Autentificare accesibilă (minim)', shortDesc: 'Autentificarea nu se bazează doar pe teste cognitive', level: 'AA', slug: 'accessible-authentication-minimum', version: '2.2' },
  '3.3.9': { name: 'Accessible Authentication (Enhanced)', nameRo: 'Autentificare accesibilă (sporit)', shortDesc: 'Autentificarea nu cere teste cognitive (incl. recunoaștere obiecte)', level: 'AAA', slug: 'accessible-authentication-enhanced', version: '2.2' },

  '4.1.1': { name: 'Parsing', nameRo: 'Parsare', shortDesc: 'Marcajul este bine format (deprecat în WCAG 2.2)', level: 'A', slug: 'parsing', version: '2.0' },
  '4.1.2': { name: 'Name, Role, Value', nameRo: 'Nume, rol, valoare', shortDesc: 'Componentele UI au nume, rol și valoare expuse programatic', level: 'A', slug: 'name-role-value', version: '2.0' },
  '4.1.3': { name: 'Status Messages', nameRo: 'Mesaje de stare', shortDesc: 'Mesajele de stare sunt expuse programatic (aria-live)', level: 'AA', slug: 'status-messages', version: '2.1' },
}

export function getCriterion(num: string): WCAGCriterion | undefined {
  return WCAG_CRITERIA[num]
}

export function getUnderstandingUrl(num: string): string {
  const c = WCAG_CRITERIA[num]
  return c
    ? `https://www.w3.org/WAI/WCAG22/Understanding/${c.slug}`
    : 'https://www.w3.org/WAI/WCAG22/Understanding/'
}
