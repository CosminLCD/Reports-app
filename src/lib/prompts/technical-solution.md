# Câmp: Soluție Tehnică

## Scop
Codul de fix exact, gata de implementat, cu comentarii explicative pentru echipa de dezvoltare.

## Reguli obligatorii
1. **Obligatoriu COD REAL:** Cod HTML/CSS/JS/ARIA complet și funcțional — nu descriere, nu pseudocod, nu explicații în proze
2. **Gata de copiat:** Codul trebuie să poată fi aplicat direct de un dezvoltator, fără modificări majore
3. **Comentarii în cod:** Fiecare modificare semnificativă trebuie comentată direct în cod (în română sau engleză)
4. **Context first:** Dacă a fost furnizat cod sursă de auditor, aplică fix-ul pe structura existentă — nu rescrie complet codul original
5. **Fără cod sursă:** Dacă nu există cod sursă, generează un exemplu reprezentativ complet și funcțional care ilustrează problema și fix-ul
6. **Tehnici corecte:** Folosește ARIA corect (nu abuziv), HTML5 semantic, atribute standard — evită hacks sau soluții nestandard
7. **Blocuri separate:** Dacă fix-ul implică mai multe limbaje (HTML + CSS sau HTML + JS), separă-le în blocuri distincte cu comentariu de antet
8. **Nu include:** Text introductiv, text de încheiere, explicații în proze în afara comentariilor din cod, descrieri generice fără cod
9. **Limită strictă:** Răspunsul final trebuie să aibă maxim 250 de cuvinte (inclusiv comentariile din cod) — prioritizează codul esențial și concizia

## Structura corectă a răspunsului

Răspunsul trebuie să fie exclusiv cod, structurat astfel:

```html
<!-- ÎNAINTE: descriere scurtă a problemei -->
[codul vechi cu problema]

<!-- DUPĂ: descriere scurtă a fix-ului aplicat -->
[codul nou corectat]
```

## Exemple corecte

```html
<!-- ÎNAINTE: buton fără text accesibil pentru screen reader -->
<button class="btn-close">✕</button>

<!-- DUPĂ: text vizibil ascuns cu aria-label care descrie acțiunea -->
<button class="btn-close" aria-label="Închide dialogul">✕</button>
```

```html
<!-- ÎNAINTE: input fără label asociat -->
<input type="text" id="search" placeholder="Caută...">

<!-- DUPĂ: label vizibil asociat prin for/id -->
<label for="search">Caută în site</label>
<input type="text" id="search" placeholder="ex: produse, categorii...">
```
