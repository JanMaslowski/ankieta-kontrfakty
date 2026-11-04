# Ankieta: ocena kontrfaktów RTG (wersja 2)

To strona ankiety dla lekarzy, hostowana na GitHub Pages. Odpowiedzi zapisuje Google Apps Script w Arkuszu Google.
Do wypełnienia nie trzeba zakładać konta.

- 60 przypadków z NIH ChestX-ray14: kardiomegalia, płyn w jamie opłucnej, obrzęk płuc, każda choroba po 10 przypadków dodania i 10 usunięcia.
- Każdy przypadek ma 7 zmodyfikowanych wersji (A–G) w losowej kolejności. Między przypadkami jest 33 pozycji kontroli realizmu (R01–R33).
- Od 4 XI 2026 jedna metoda jest wycofana: strona pomija jej literę w każdym przypadku (pole `ukryj` w `dane.json`)
  i jej 3 pozycje realizmu (`pomin`). Zapisane odpowiedzi zostają, a rozpoczęte sesje kontynuują od tego samego miejsca.
- Klucz liter → metod nie jest częścią repozytorium (jest u badacza).
- Wersja 1 ankiety (15 X 2026) jest w historii gita (commit `10133c1`).

## Pliki

| plik | co |
|---|---|
| `index.html` | strona ankiety |
| `config.js` | adres aplikacji Apps Script (`API_URL`) |
| `dane.json` | kolejność pozycji (P01–P60, R01–R33) |
| `img/Pnn.png` | arkusz 8 obrazów: oryginał + A–G, 512 px |
| `img/Rnn.png` | pojedynczy obraz do oceny realizmu |
| `apps_script.gs` | kod Google Apps Script (zapis do arkusza) |

## Wdrożenie skryptu (raz, przy przejściu z v1 na v2)

Strona używa tego samego adresu Apps Script co v1. Dopóki pod tym adresem działa stary skrypt, strona pokazuje
komunikat „Ankieta jest w trakcie aktualizacji” i niczego nie zapisuje.

1. Otwórz arkusz z odpowiedziami v1. Wybierz **Rozszerzenia → Apps Script**, zastąp cały kod treścią `apps_script.gs` i zapisz.
2. W **Ustawieniach projektu → Właściwości skryptu** dodaj `HASLO` z hasłem do panelu badacza.
3. Wybierz **Wdróż → Zarządzaj wdrożeniami**, kliknij ołówek przy istniejącym wdrożeniu, ustaw **Wersja: Nowa wersja** i kliknij **Wdróż**.
   Adres się nie zmienia. Jeśli Google poprosi o uprawnienia, zezwól.
4. Otwórz adres `…/exec` w przeglądarce. Powinien pokazać `{"ok":true,"ankieta":"NIH v2"}`.

Odpowiedzi v2 trafiają do nowych zakładek `v2_konta` i `v2_odpowiedzi`. Zakładka `odpowiedzi` z v1 zostaje bez zmian.

## Użycie

- **Lekarze** dostają link do strony. Każdy oceniający dostaje kod powrotu, którym może dokończyć ankietę na innym
  urządzeniu, także przez link `…/?kod=XXXXXXXXXX`. W tej samej przeglądarce ankieta otwiera się sama.
- **Badacz** otwiera `…/?panel` i podaje hasło `HASLO`. Panel pokazuje postęp i pozwala pobrać odpowiedzi jako CSV
  (jeden wiersz na przypadek × wersję plus wiersze realizmu).
- Bez internetu odpowiedzi czekają w przeglądarce i wysyłają się później.
- Przed wysłaniem linku lekarzom wypełnij jeden przypadek jako `TEST` i usuń jego wiersze z zakładek v2.
