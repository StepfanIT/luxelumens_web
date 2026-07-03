# Luxe Lumens Web

Landing page React + Tailwind dla Luxe Lumens.

## Uruchomienie lokalne

```powershell
npm install
npm run dev
```

Otwórz lokalnie:

```text
http://127.0.0.1:5173/
```

## Production build

```powershell
npm run build
```

Gotowe pliki będą w folderze `dist`.

## Publikacja na GitHub Pages

1. Utwórz repozytorium na GitHub.
2. Wypchnij projekt do gałęzi `main` albo `master`.
3. Na GitHub otwórz `Settings -> Pages`.
4. W `Build and deployment` wybierz `Source: GitHub Actions`.
5. Po push uruchomi się workflow `.github/workflows/deploy-pages.yml`.
6. Gotowa strona będzie dostępna pod adresem Pages URL pokazanym przez GitHub.

Vite jest ustawiony z `base: './'`, więc strona działa poprawnie w katalogu głównym
domeny oraz w GitHub Pages project URL typu `/repo-name/`.
