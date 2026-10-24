# Luxe Lumens — strona i panel

Strona produktu (PL: `/`, EN: `/en/`) i panel administracyjny (`/admin/`).
React 18 + Vite 5 + Tailwind 3. Dane i logowanie: Firebase projektu aplikacji (`luxlumens-30ad4`).

## Uruchomienie

```powershell
npm install
npm run dev        # http://127.0.0.1:5173/  ·  /en/  ·  /admin/
npm run build      # gotowa strona w dist/
```

Panel bez Firebase: `/admin/?demo` — przykładowe dane zapisywane tylko w przeglądarce.

## Co jest w środku

- `src/site/` — strona. Teksty domyślne w `copy.js`; panel nadpisuje je w Firestore (`site/content`),
  a strona nakłada zmiany na domyślne teksty, więc działa także bez połączenia z bazą.
- `src/site/lights/` — podgląd światła na domu. Zdjęcie jest rozłożone na trzy warstwy
  (`src/assets/house/`: dom bez światła, samo światło, oryginał); kolor sceny barwi warstwę światła.
  Warstwy i zrzuty ekranu aplikacji tworzy `tools/prepare_assets.py`.
- `src/admin/` — panel: zgłoszenia z formularza, treści PL/EN, realizacje (zdjęcia), opinie,
  kontakt i dane firmy, lista administratorów.

## Firebase — jednorazowa konfiguracja

1. **Firestore** — włączyć bazę w konsoli Firebase (Build → Firestore Database), region w Europie.
2. **Reguły** — są w repozytorium aplikacji (`luxe_lumens_app/firestore.rules`, sekcja „Landing page”).
   Wdrożenie z tamtego katalogu: `firebase deploy --only firestore:rules`.
3. **Logowanie** — Authentication → Sign-in method: Google (i ewentualnie e-mail/hasło);
   Authentication → Settings → Authorized domains: dodać domenę strony (np. `luxelumens.pl`
   i `stepfanit.github.io`).
4. **Pierwszy administrator** — w Firestore utworzyć dokument `site/admins` z polem
   `emails` (tablica) i wpisać w nim swój adres Google. Kolejne osoby dodaje się już w panelu (Dostęp).
5. **Konfiguracja panelu** — w GitHub → Settings → Secrets and variables → Actions → Variables dodać
   `FIREBASE_WEB_API_KEY` i `FIREBASE_WEB_APP_ID` (wartości aplikacji webowej z Project settings).
   Lokalnie te same wartości w `.env.local`:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_APP_ID=...
   ```

Strona publiczna nie potrzebuje klucza: czyta treści i zapisuje zgłoszenia przez REST,
a reguły pozwalają tylko na to.

## Testy z emulatorem

```powershell
firebase emulators:start --only firestore,auth --project luxlumens-30ad4
```

i adresy z `?emulator` (tylko na localhost): `/?emulator`, `/admin/?emulator`.

## Publikacja

Push do `main` uruchamia `.github/workflows/deploy-pages.yml` (GitHub Pages). Ścieżki są względne,
więc strona działa zarówno pod `/luxelumens_web/`, jak i na własnej domenie.
