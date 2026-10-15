# Ankieta: ocena kontrfaktów RTG

Statyczna strona ankiety (GitHub Pages) i skrypt Google Apps Script, który zapisuje odpowiedzi do arkusza Google.
Lekarze nie muszą się nigdzie logować.

Przypadki są zanonimizowane (P01–P40). Mapowanie na identyfikatory badania
(`mapowanie_anonimowe_NIE_dla_oceniajacego.csv`) i klucz metod **nie są w tym repozytorium** i nie powinny tu trafić.

## 1. Arkusz Google i endpoint

1. Utwórz nowy arkusz Google (np. „Ankieta kontrfakty – odpowiedzi”).
2. W arkuszu otwórz **Rozszerzenia → Apps Script**, usuń domyślny kod i wklej zawartość `apps_script.gs`. Zapisz.
3. Kliknij **Wdróż → Nowe wdrożenie**, typ **Aplikacja internetowa**:
   - *Wykonaj jako:* **Ja**
   - *Kto ma dostęp:* **Każdy**
4. Zatwierdź uprawnienia i skopiuj **adres URL aplikacji internetowej** (kończy się na `/exec`).
5. Wklej ten adres w `index.html` w linii `const ENDPOINT = "";`.

Odpowiedzi pojawią się w zakładce `odpowiedzi` arkusza, po jednym wierszu na przypadek.
Jeśli lekarz poprawi wcześniejszy przypadek, wysyłany jest nowy wiersz. W analizie bierz ostatni wiersz
dla pary (`sesja`, `przypadek`).

Po zmianie kodu w Apps Script trzeba utworzyć **nową wersję** wdrożenia (Wdróż → Zarządzaj wdrożeniami → edytuj → Nowa wersja),
żeby adres `/exec` zaczął używać nowego kodu.

## 2. GitHub Pages

```bash
gh auth login
gh repo create ankieta-kontrfakty --public --source . --push
gh api -X POST repos/{owner}/ankieta-kontrfakty/pages -f "source[branch]=main" -f "source[path]=/"
```

Strona będzie pod adresem `https://<login>.github.io/ankieta-kontrfakty/` (pierwsze uruchomienie trwa 1–2 minuty).

## Uwagi

- Postęp lekarza zapamiętuje jego przeglądarka (localStorage). Powrót do ankiety działa na tym samym komputerze i w tej samej przeglądarce.
- Jeśli wysyłka się nie uda (brak sieci), odpowiedź czeka w kolejce i jest wysyłana ponownie. Na końcu ankiety lekarz może też pobrać kopię CSV.
- Endpoint jest publiczny: każdy, kto zna adres `/exec`, może dopisać wiersz. Kolumna `sesja` pozwala odfiltrować podejrzane wpisy.
- Bez ustawionego `ENDPOINT` strona działa w trybie testowym (pomarańczowy pasek u góry) i nic nie wysyła.
