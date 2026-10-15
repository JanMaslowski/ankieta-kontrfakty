// Google Apps Script: odbiera odpowiedzi z ankiety i dopisuje je do arkusza.
// Instrukcja wdrożenia: README.md w tym folderze.

const KOLUMNY = ["odebrano", "sesja", "oceniajacy", "specjalizacja", "doswiadczenie_lata", "kolejnosc",
  "przypadek", "diagnoza_oryginalu", "pewnosc", "zmiana_A", "zmiana_B", "zmiana_C", "czas_s", "zapisano", "uwagi"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("odpowiedzi")
      || SpreadsheetApp.getActiveSpreadsheet().insertSheet("odpowiedzi");
    if (sheet.getLastRow() === 0) sheet.appendRow(KOLUMNY);
    d.odebrano = new Date().toISOString();
    // Apostrof przed tekstem chroni przed interpretacją wpisów jako formuł.
    sheet.appendRow(KOLUMNY.map(k => {
      const v = d[k] == null ? "" : d[k];
      return typeof v === "string" && /^[=+\-@]/.test(v) ? "'" + v : v;
    }));
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("Endpoint ankiety działa.");
}
