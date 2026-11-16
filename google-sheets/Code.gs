/**
 * @OnlyCurrentDoc
 * (hadkan akses skrip ini kepada Sheet ini sahaja, bukan semua Sheet anda)
 */

/**
 * Kad jemputan → Google Sheets
 *
 * Tampal kod ini dalam Extensions → Apps Script pada Google Sheet anda,
 * kemudian Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Salin URL "Web app" dan letak dalam config.js → sheetUrl.
 *
 * Dua tab akan dibuat secara automatik:
 *   RSVP   : Masa | Nama | Telefon | Kehadiran | Dewasa | Kanak-kanak
 *   Ucapan : Masa | Nama | Ucapan
 *
 * Website hanya boleh MEMBACA nama + ucapan (untuk dipaparkan).
 * Nombor telefon dalam tab RSVP tidak pernah dihantar balik ke website.
 */

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const now = new Date();

    if (d.type === "rsvp") {
      sheet_("RSVP", ["Masa", "Nama", "Telefon", "Kehadiran", "Dewasa", "Kanak-kanak"]).appendRow([
        now,
        clean_(d.name, 80),
        clean_(d.phone, 20, true),
        d.going ? "Hadir" : "Tidak Hadir",
        d.going ? clean_(d.adults, 20) : "",
        d.going ? clean_(d.kids, 20) : ""
      ]);
    } else if (d.type === "wish") {
      if (!String(d.name || "").trim() || !String(d.wish || "").trim()) return json_({ ok: false });
      sheet_("Ucapan", ["Masa", "Nama", "Ucapan"]).appendRow([now, clean_(d.name, 80), clean_(d.wish, 500)]);
    } else {
      return json_({ ok: false });
    }
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// Returns the latest wishes (name + wish only) for the website to show.
function doGet() {
  const sh = sheet_("Ucapan", ["Masa", "Nama", "Ucapan"]);
  const rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues() : [];
  const wishes = rows.reverse().slice(0, 300).map(r => ({ name: String(r[1]), wish: String(r[2]) }));
  return json_({ wishes: wishes });
}

function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sh;
}

// Trim, cap length, and stop text being treated as a formula (=, +, -, @).
function clean_(v, max, keepAsText) {
  let s = String(v == null ? "" : v).trim().slice(0, max);
  if (/^[=+\-@]/.test(s) || keepAsText) s = "'" + s;
  return s;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
