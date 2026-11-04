// Ankieta NIH v2: zapis odpowiedzi do tego Arkusza Google (wersja na GitHub Pages, bez logowania).
// Instrukcja wdrożenia: README.md w repozytorium. Hasło do panelu badacza: Ustawienia projektu → Właściwości skryptu → HASLO.
//
// Zakładki: "v2_konta" (jeden wiersz na kod powrotu: sesje, oceniający, postęp) i "v2_odpowiedzi" (jeden wiersz na
// kod × <sesja>__<pozycja>). Kolumny: token, klucz, aktualizacja, dane (JSON). Wiersz jest nadpisywany przy każdej zmianie.
//   GET  ?akcja=wczytaj&token=…   dane jednego kodu (żeby wrócić do ankiety)
//   GET  ?akcja=eksport&haslo=…   wszystko (panel badacza)
//   GET  (bez akcji)              {ok, ankieta: "NIH v2"}: strona sprawdza tym, że wdrożony jest ten skrypt
//   POST {akcja:"zapisz", token, wpisy:[{rodzaj:"konto"|"odp", klucz, dane}]}

const ARKUSZE = { konto: "v2_konta", odp: "v2_odpowiedzi" };   // zakładka "odpowiedzi" należy do ankiety v1
const NAGLOWEK = ["token", "klucz", "aktualizacja", "dane"];
const TOKEN = /^[A-Z0-9]{8,40}$/;
const KLUCZ = /^[A-Za-z0-9_]{1,40}$/;

function arkusz(nazwa) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(nazwa);
  if (!sh) {
    sh = ss.insertSheet(nazwa);
    sh.getRange("A:D").setNumberFormat("@");   // tekst: kod typu "2E345678" nie może zamienić się w liczbę
    sh.appendRow(NAGLOWEK); sh.setFrozenRows(1);
  }
  return sh;
}
function wiersze(sh) {
  const n = sh.getLastRow();
  return n < 2 ? [] : sh.getRange(2, 1, n - 1, 4).getValues();
}
function wynik(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const p = e.parameter || {};
  try {
    if (p.akcja === "wczytaj") {
      if (!TOKEN.test(p.token || "")) return wynik({ ok: false, blad: "zły kod" });
      const k = wiersze(arkusz(ARKUSZE.konto)).find(r => r[0] === p.token);
      const odp = wiersze(arkusz(ARKUSZE.odp)).filter(r => r[0] === p.token).map(r => JSON.parse(r[3]));
      return wynik({ ok: true, konto: k ? JSON.parse(k[3]) : null, odp });
    }
    if (p.akcja === "eksport") {
      const haslo = PropertiesService.getScriptProperties().getProperty("HASLO");
      if (!haslo || p.haslo !== haslo) return wynik({ ok: false, blad: "złe hasło" });
      return wynik({
        ok: true,
        konta: wiersze(arkusz(ARKUSZE.konto)).map(r => ({ token: r[0], aktualizacja: r[2], dane: JSON.parse(r[3]) })),
        odp: wiersze(arkusz(ARKUSZE.odp)).map(r => ({ token: r[0], dane: JSON.parse(r[3]) })),
      });
    }
    return wynik({ ok: true, ankieta: "NIH v2" });
  } catch (err) {
    return wynik({ ok: false, blad: String(err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const b = JSON.parse(e.postData.contents);
    if (b.akcja !== "zapisz" || !TOKEN.test(b.token || "")) return wynik({ ok: false, blad: "zły kod" });
    const wpisy = (b.wpisy || []).slice(0, 200);
    for (const rodzaj of Object.keys(ARKUSZE)) {
      const moje = wpisy.filter(w => w.rodzaj === rodzaj && KLUCZ.test(w.klucz || ""));
      if (!moje.length) continue;
      const sh = arkusz(ARKUSZE[rodzaj]);
      const v = wiersze(sh);
      for (const w of moje) {
        const json = JSON.stringify(w.dane);
        if (json.length > 45000) throw new Error("za duży wpis " + w.klucz);   // limit komórki: 50 000 znaków
        const row = [b.token, w.klucz, new Date().toISOString(), json];
        const i = v.findIndex(r => r[0] === b.token && r[1] === w.klucz);
        if (i >= 0) { sh.getRange(i + 2, 1, 1, 4).setValues([row]); v[i] = row; }
        else { sh.appendRow(row); v.push(row); }
      }
    }
    return wynik({ ok: true, n: wpisy.length });
  } catch (err) {
    return wynik({ ok: false, blad: String(err) });
  } finally {
    lock.releaseLock();
  }
}
