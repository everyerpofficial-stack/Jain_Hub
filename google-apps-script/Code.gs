/**
 * =====================================================================
 *  Jain Finance & Mobiles Hub — Unified Google Apps Script Web App
 *  File: Code.gs
 *
 *  SETUP INSTRUCTIONS:
 *  1. Open your Google Sheet → Extensions → Apps Script
 *  2. Paste this entire file
 *  3. Replace YOUR_SPREADSHEET_ID_HERE below with your actual Sheet ID
 *     (found in the sheet URL: docs.google.com/spreadsheets/d/<<ID>>/edit)
 *  4. Deploy → New deployment → Web App
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  5. Copy the Web App URL → paste in the app Settings page
 *     (same URL works for BOTH Finance and Mobiles)
 *
 *  6. SECURITY — set a shared API key (STRONGLY recommended):
 *     - Project Settings (gear icon) → Script Properties → Add property
 *       Name: API_KEY   Value: <a long random string you generate yourself>
 *     - Put the SAME value in the app's .env as VITE_SHEETS_API_KEY and
 *       rebuild/redeploy the app. Every read/write/delete/digest request
 *       will then be rejected unless it carries this key.
 *     - Without this, ANYONE who has this Web App URL (it ships inside
 *       the app's public JS bundle — trivial to find in devtools) can
 *       read, overwrite, or delete every row in your spreadsheet, since
 *       "Who has access: Anyone" means no Google-account check happens.
 *       The key does not make this fully server-secure (it still ships
 *       to the browser), but it blocks casual scraping/scanning and lets
 *       you rotate access instantly by changing the Script Property.
 *
 *  WHY ALL GET?
 *   Google Apps Script redirects POST requests from script.google.com
 *   to script.googleusercontent.com. Browsers block this cross-origin
 *   redirect (CORS preflight failure). GET requests follow the redirect
 *   cleanly with no CORS issues.
 *
 *  API (all GET):
 *   ?action=ping                                  → health check
 *   ?action=sendOtp&email=X&otp=Y&system=Z        → send OTP via Gmail
 *                                                    (email must belong to
 *                                                    an Active Finance_Staff
 *                                                    row — otherwise rejected)
 *   ?action=read&sheet=<name>&key=<API_KEY>                     → read all rows
 *   ?action=write&sheet=<name>&payload=<b64json>&key=<API_KEY>  → clear + write rows
 *   ?action=append&sheet=<name>&payload=<b64json>&key=<API_KEY> → append rows
 *   ?action=upsert&sheet=<name>&payload=<b64json>&key=<API_KEY> → update-or-insert ONE row by its id
 *                                                                  (preferred over write/append for
 *                                                                  single-record add/edit — see below)
 *   ?action=delete&sheet=<name>&id=<rowId>&key=<API_KEY>        → delete row by ID
 * =====================================================================
 */

// ── CONFIGURATION ─────────────────────────────────────────────────────────────
// Jain Finance & Mobiles Hub — Google Spreadsheet
var SPREADSHEET_ID = "1Cqww0JJT-5m9IPMSZQMBmiU0YdTFW6or6V6HIQV_7ck";


// ── Allowed sheet tabs (security whitelist) ───────────────────────────────────
var ALLOWED_SHEETS = [
  // Finance Module
  "Finance_Customers",
  "Finance_Payments",
  "Finance_Expenses",
  "Finance_Investments",
  // Loans and profit withdraw/deposit rows used to be missing from this
  // whitelist, so every write to them came back "Sheet not allowed" and the
  // app silently kept them on one device only — clear the browser storage
  // (or open the app anywhere else) and the whole loan book was gone.
  "Finance_Loans",
  "Finance_ProfitTransactions",
  "Finance_Staff",
  // Mobiles Module
  "Mobiles_Sales",
  "Mobiles_Purchases",
  "Mobiles_Expenses",
  "Mobiles_Suppliers",
  "Mobiles_SupplierPayments",
  "Mobiles_Customers",
  "Mobiles_Products",
  "Mobiles_Accessories",
  "Mobiles_WarrantyClaims",
  // Shop profile (name/GST/address/invoice prefix) — this prints on every
  // invoice but used to live only in the browser that typed it.
  "Mobiles_Settings",
  // KYC/invoice document register. See the note on Finance_Documents in the
  // app: the row is the file's metadata, not the file's bytes.
  "Finance_Documents",
  // Audit Logs (Finance & Mobiles)
  "Finance_Audit",
  "Mobiles_Audit",
];

// ── Main GET Handler ──────────────────────────────────────────────────────────
function doGet(e) {
  var lock = null;
  try {
    var action    = (e && e.parameter && e.parameter.action)  || "";
    var sheetName = (e && e.parameter && e.parameter.sheet)   || "";
    var payload   = (e && e.parameter && e.parameter.payload) || "";
    var reqKey    = (e && e.parameter && e.parameter.key)     || "";

    // ── Script-wide lock for every action that touches the spreadsheet ──
    // A "write" does clearContents() then setValues() as two separate
    // calls with no atomicity of its own. Without this lock, a "read"
    // from another device/poll can land in between those two calls and
    // see a transiently empty sheet — which the client (reasonably)
    // treats as "the data was really deleted" and wipes its local copy.
    // Serializing every sheet-touching request through one lock removes
    // that window entirely, at the cost of requests queueing briefly
    // when two happen at the exact same moment (rare for this app's
    // traffic, and far cheaper than a data-loss bug).
    if (action === "read" || action === "write" || action === "append" || action === "upsert" || action === "delete" || action === "digest") {
      lock = LockService.getScriptLock();
      var gotLock = lock.tryLock(10000);
      if (!gotLock) {
        lock = null;
        return jsonResponse({ status: "error", error: "Server busy, please retry" });
      }
    }

    // ── 0. Guard: check spreadsheet ID is configured ──────────────────
    var isConfigured = (SPREADSHEET_ID && SPREADSHEET_ID !== "YOUR_SPREADSHEET_ID_HERE" && SPREADSHEET_ID.length > 10);

    // ── 0b. Guard: shared API key (if configured via Script Properties) ─
    // Gates every data-bearing action. "ping" stays open so the Settings
    // page can sanity-check connectivity before a key is even set up.
    if (action === "read" || action === "write" || action === "append" || action === "upsert" || action === "delete" || action === "digest" || action === "driveUpload") {
      var configuredKey = PropertiesService.getScriptProperties().getProperty("API_KEY") || "";
      if (configuredKey && reqKey !== configuredKey) {
        return jsonResponse({ status: "error", error: "Unauthorized: invalid or missing API key" });
      }
    }

    // ── 1. Health check ────────────────────────────────────────────────
    if (action === "ping") {
      if (!isConfigured) {
        return jsonResponse({
          status: "error",
          error: "SETUP_REQUIRED: Replace YOUR_SPREADSHEET_ID_HERE in Code.gs with your actual Google Spreadsheet ID, then create a New Deployment.",
          configured: false,
        });
      }
      return jsonResponse({
        status:      "ok",
        message:     "Jain Finance & Mobiles Hub — Apps Script is running",
        configured:  true,
        sheets:      ALLOWED_SHEETS,
        time:        new Date().toLocaleString("en-IN"),
      });
    }

    // ── 2. Digest — row counts and content fingerprints for all sheets ─
    // Used by the polling engine: detects additions, deletions, and edits
    if (action === "digest") {
      if (!isConfigured) {
        return jsonResponse({ status: "error", error: "SETUP_REQUIRED: Spreadsheet ID not configured." });
      }
      try {
        var ss0 = SpreadsheetApp.openById(SPREADSHEET_ID);
        var digest = {};
        for (var di = 0; di < ALLOWED_SHEETS.length; di++) {
          var sheetNameItem = ALLOWED_SHEETS[di];
          var sh0 = ss0.getSheetByName(sheetNameItem);
          if (!sh0 || sh0.getLastRow() < 2) {
            digest[sheetNameItem] = "0";
          } else {
            var rowCount = sh0.getLastRow() - 1;
            var colCount = sh0.getLastColumn();
            // Create a lightweight content fingerprint using row count, column count, and cell data length.
            // Sampled up to 5000 rows (not just the first 100) — a smaller cap meant edits to any row
            // beyond it never changed the digest, so the poller on other devices never noticed and kept
            // showing stale data indefinitely once a sheet grew past that size.
            var sampleRows = Math.min(rowCount + 1, 5000);
            var valSample = sh0.getRange(1, 1, sampleRows, colCount).getValues();
            var sampleStr = valSample.join("");
            digest[sheetNameItem] = rowCount + "_" + sampleStr.length + "_" + colCount;
          }
        }
        return jsonResponse({ status: "ok", digest: digest });
      } catch (digestErr) {
        return jsonResponse({ status: "error", error: "Digest failed: " + digestErr.toString() });
      }
    }

    // ── 3. Send OTP via Gmail ──────────────────────────────────────────

    if (action === "sendOtp") {
      var email      = (e.parameter.email  || "").trim().toLowerCase();
      var otp        = (e.parameter.otp    || "").trim();
      var systemName = "Jain Finance & Mobiles Hub"; // fixed — never taken from the request

      if (!email || !otp) {
        return jsonResponse({ status: "error", error: "Missing email or otp parameter" });
      }
      // Otp must be exactly 6 digits — rejects anything crafted to inject
      // markup/script into the email body via this parameter.
      if (!/^\d{6}$/.test(otp)) {
        return jsonResponse({ status: "error", error: "Invalid otp format" });
      }
      // Without this check, this endpoint is an open mail relay: anyone who
      // finds the Web App URL (it ships in the public JS bundle) could make
      // this Gmail account send arbitrary "verification" emails to any
      // address on the internet — a spam/phishing vector using your
      // business's identity. Only allow sending to a currently Active
      // Finance_Staff email.
      if (!isActiveStaffEmail(email)) {
        return jsonResponse({ status: "error", error: "Email is not a registered active staff member" });
      }
      // Basic per-email rate limit (5 sends / 5 minutes) so this endpoint
      // can't be hammered to burn through Gmail's daily send quota.
      var cache = CacheService.getScriptCache();
      var rlKey = "otp_rl_" + email;
      var count = parseInt(cache.get(rlKey) || "0", 10);
      if (count >= 5) {
        return jsonResponse({ status: "error", error: "Too many OTP requests — try again shortly" });
      }
      cache.put(rlKey, String(count + 1), 300); // 5 minutes

      try {
        MailApp.sendEmail({
          to:       email,
          subject:  "[" + systemName + "] Your Verification Code: " + otp,
          htmlBody: buildOtpEmailHtml(otp, systemName),
        });
        return jsonResponse({ status: "ok", message: "OTP sent to " + email });
      } catch (mailErr) {
        return jsonResponse({ status: "error", error: "Email send failed: " + mailErr.toString() });
      }
    }

    // ── 3. Read all rows from a sheet ─────────────────────────────────
    if (action === "read" || action === "write" || action === "append" || action === "upsert" || action === "delete") {
      // Guard: spreadsheet ID must be configured
      if (!isConfigured) {
        return jsonResponse({
          status: "error",
          error: "SETUP REQUIRED: Open Code.gs in Apps Script, replace YOUR_SPREADSHEET_ID_HERE with your Google Spreadsheet ID (from the sheet URL), then create a New Deployment and paste the new URL here.",
        });
      }
    }

    // ── 3. Read all rows from a sheet ─────────────────────────────────
    if (action === "read") {
      if (!sheetName) return jsonResponse({ status: "error", error: "Missing 'sheet' param" });
      if (!isAllowed(sheetName)) return jsonResponse({ status: "error", error: "Sheet not allowed: " + sheetName });

      var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName(sheetName);

      if (!sheet) return jsonResponse({ status: "ok", rows: [], message: "Sheet not found" });

      var lastRow = sheet.getLastRow();
      if (lastRow < 2) return jsonResponse({ status: "ok", rows: [] });

      var lastCol = sheet.getLastColumn();
      var data    = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      var headers = data[0];
      var rows    = data.slice(1).map(function(row) {
        var obj = {};
        for (var i = 0; i < headers.length; i++) {
          var val = row[i];
          if (val instanceof Date) {
            val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
          }
          obj[headers[i]] = (val === null || val === undefined) ? "" : val;
        }
        return obj;
      });

      return jsonResponse({ status: "ok", rows: rows, count: rows.length });
    }

    // ── 4. Write rows (clear + rewrite) ───────────────────────────────
    if (action === "write" || action === "append") {
      if (!sheetName) return jsonResponse({ status: "error", error: "Missing 'sheet' param" });
      if (!isAllowed(sheetName)) return jsonResponse({ status: "error", error: "Sheet not allowed: " + sheetName });
      if (!payload) return jsonResponse({ status: "error", error: "Missing 'payload' param" });

      var rows;
      try {
        var decoded = Utilities.newBlob(Utilities.base64Decode(payload)).getDataAsString();
        rows = JSON.parse(decoded);
      } catch (parseErr) {
        return jsonResponse({ status: "error", error: "Invalid payload (base64/JSON): " + parseErr.toString() });
      }

      if (!Array.isArray(rows) || rows.length === 0) {
        // Empty array means "clear all data" — keep headers if they exist, otherwise just clear
        if (action === "write") {
          var ss2c = SpreadsheetApp.openById(SPREADSHEET_ID);
          var sheet2c = ss2c.getSheetByName(sheetName);
          if (sheet2c) {
            sheet2c.clearContents();
          }
        }
        return jsonResponse({ status: "ok", written: 0, message: "Sheet cleared (empty payload)" });
      }

      var ss2    = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet2 = ss2.getSheetByName(sheetName);
      if (!sheet2) sheet2 = ss2.insertSheet(sheetName);

      var headers2   = Object.keys(rows[0]);
      var dataValues = rows.map(function(row) {
        return headers2.map(function(h) {
          return cellValue(row[h]);
        });
      });

      if (action === "write") {
        // Clear and rewrite from scratch
        sheet2.clearContents();
        var hr = sheet2.getRange(1, 1, 1, headers2.length);
        hr.setValues([headers2]);
        hr.setFontWeight("bold");
        hr.setBackground("#f1f5f9");
        sheet2.getRange(2, 1, dataValues.length, headers2.length).setValues(dataValues);
        // Auto-resize columns
        for (var c = 1; c <= headers2.length; c++) sheet2.autoResizeColumn(c);
        return jsonResponse({ status: "ok", written: dataValues.length });
      }

      if (action === "append") {
        var lastRow2 = sheet2.getLastRow();
        if (lastRow2 === 0) {
          // Empty sheet — write headers first
          var hr2 = sheet2.getRange(1, 1, 1, headers2.length);
          hr2.setValues([headers2]);
          hr2.setFontWeight("bold");
          hr2.setBackground("#f1f5f9");
          lastRow2 = 1;
        }
        sheet2.getRange(lastRow2 + 1, 1, dataValues.length, headers2.length).setValues(dataValues);
        return jsonResponse({ status: "ok", appended: dataValues.length });
      }
    }

    // ── 5. Upsert a single row by ID (update in place, or append if new) ──
    // This is what individual add/edit actions in the app use instead of
    // rewriting a whole sheet — see the big comment on "write" above for
    // why whole-sheet rewrites on every single edit caused lost updates.
    if (action === "upsert") {
      if (!sheetName) return jsonResponse({ status: "error", error: "Missing 'sheet' param" });
      if (!isAllowed(sheetName)) return jsonResponse({ status: "error", error: "Sheet not allowed: " + sheetName });
      if (!payload) return jsonResponse({ status: "error", error: "Missing 'payload' param" });

      var upsertRow;
      try {
        var decodedU = Utilities.newBlob(Utilities.base64Decode(payload)).getDataAsString();
        upsertRow = JSON.parse(decodedU);
      } catch (parseErrU) {
        return jsonResponse({ status: "error", error: "Invalid payload (base64/JSON): " + parseErrU.toString() });
      }
      if (!upsertRow || typeof upsertRow !== "object" || Array.isArray(upsertRow)) {
        return jsonResponse({ status: "error", error: "Payload must be a single row object" });
      }
      var rowId = String(upsertRow.id || "");
      if (!rowId) return jsonResponse({ status: "error", error: "Row must have an 'id' field" });

      var ssU    = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheetU = ssU.getSheetByName(sheetName);
      if (!sheetU) sheetU = ssU.insertSheet(sheetName);

      var lastRowU = sheetU.getLastRow();
      var lastColU = sheetU.getLastColumn();
      var headersU = lastRowU > 0 && lastColU > 0
        ? sheetU.getRange(1, 1, 1, lastColU).getValues()[0]
        : [];

      // Extend headers with any new fields this row introduces (schema evolution —
      // e.g. a field added to the app after the sheet already had data in it).
      var newKeys = Object.keys(upsertRow).filter(function(k) { return headersU.indexOf(k) === -1; });
      if (newKeys.length > 0) {
        headersU = headersU.concat(newKeys);
        var hrU = sheetU.getRange(1, 1, 1, headersU.length);
        hrU.setValues([headersU]);
        hrU.setFontWeight("bold");
        hrU.setBackground("#f1f5f9");
      }

      var rowValues = headersU.map(function(h) {
        return cellValue(upsertRow[h]);
      });

      // Find existing row with this id (column 1, since every sheet's first
      // header is always "id" per the app's schema).
      var foundRow = -1;
      if (lastRowU >= 2) {
        var idColValues = sheetU.getRange(2, 1, lastRowU - 1, 1).getValues();
        for (var ri = 0; ri < idColValues.length; ri++) {
          if (String(idColValues[ri][0]) === rowId) { foundRow = ri + 2; break; }
        }
      }

      if (foundRow > -1) {
        sheetU.getRange(foundRow, 1, 1, headersU.length).setValues([rowValues]);
        return jsonResponse({ status: "ok", action: "updated", row: foundRow });
      } else {
        var insertAt = Math.max(sheetU.getLastRow() + 1, 2);
        sheetU.getRange(insertAt, 1, 1, headersU.length).setValues([rowValues]);
        return jsonResponse({ status: "ok", action: "inserted", row: insertAt });
      }
    }

    // ── 4b. Upload a document file to Drive, in chunks ────────────────
    // WHY: a spreadsheet cell holds 50,000 characters. A KYC scan or customer
    // photo, base64-encoded, is far past that — so document FILES could never
    // live in the sheet, only the record of them. They are written to a Drive
    // folder instead and the sheet keeps the link.
    //
    // WHY CHUNKED: the payload rides in the query string (see "WHY ALL GET?"
    // above), so one request cannot carry a whole file. The client sends
    // ordered slices under one uploadId and marks the final one with last=1.
    //
    // NOTE: this is the only action that touches Drive. If you redeploy and
    // skip the Drive authorisation prompt, these calls fail and the app
    // simply keeps the file on the device that captured it.
    if (action === "driveUpload") {
      var uploadId = (e.parameter.uploadId || "").toString();
      var seq      = parseInt(e.parameter.seq || "-1", 10);
      var isLast   = (e.parameter.last || "") === "1";
      if (!uploadId || !/^[A-Za-z0-9_-]{6,64}$/.test(uploadId)) {
        return jsonResponse({ status: "error", error: "Invalid uploadId" });
      }
      if (isNaN(seq) || seq < 0) {
        return jsonResponse({ status: "error", error: "Invalid seq" });
      }

      var cache = CacheService.getScriptCache();
      // 6 hours is the cache maximum; an upload takes seconds, so this only
      // matters if the client dies partway and abandons its slices.
      cache.put("up_" + uploadId + "_" + seq, payload, 21600);

      if (!isLast) {
        return jsonResponse({ status: "ok", received: seq });
      }

      // Final slice — reassemble in order and verify nothing was evicted.
      var parts = [];
      for (var ci = 0; ci <= seq; ci++) {
        var part = cache.get("up_" + uploadId + "_" + ci);
        if (part === null) {
          return jsonResponse({ status: "error", error: "Upload incomplete: missing chunk " + ci });
        }
        parts.push(part);
      }
      for (var cd = 0; cd <= seq; cd++) cache.remove("up_" + uploadId + "_" + cd);

      var fileName = (e.parameter.name || ("document-" + uploadId)).toString();
      var mimeType = (e.parameter.mimeType || "application/octet-stream").toString();
      try {
        var bytes = Utilities.base64Decode(parts.join(""));
        var blob  = Utilities.newBlob(bytes, mimeType, fileName);
        var folder = getOrCreateDocumentsFolder_();
        var file = folder.createFile(blob);
        // Link-only sharing: the app embeds the URL, and viewers are not
        // necessarily signed into the owning Google account.
        try {
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch (shareErr) {
          // Domain policy may forbid link sharing — the file still exists.
        }
        return jsonResponse({
          status: "ok",
          fileId: file.getId(),
          url: "https://drive.google.com/uc?export=view&id=" + file.getId(),
          name: fileName,
        });
      } catch (upErr) {
        return jsonResponse({ status: "error", error: "Drive upload failed: " + upErr.toString() });
      }
    }

    // ── 5. Delete a row by ID ─────────────────────────────────────────
    if (action === "delete") {
      if (!sheetName) return jsonResponse({ status: "error", error: "Missing 'sheet' param" });
      if (!isAllowed(sheetName)) return jsonResponse({ status: "error", error: "Sheet not allowed: " + sheetName });

      var deleteId = (e.parameter.id || "").toString();
      if (!deleteId) return jsonResponse({ status: "error", error: "Missing 'id' param" });

      var ss3    = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet3 = ss3.getSheetByName(sheetName);
      if (!sheet3) return jsonResponse({ status: "ok", deleted: 0 });

      var allData     = sheet3.getDataRange().getValues();
      var deletedRows = 0;
      for (var r = allData.length - 1; r >= 1; r--) {
        if (String(allData[r][0]) === deleteId) {
          sheet3.deleteRow(r + 1);
          deletedRows++;
          break;
        }
      }
      return jsonResponse({ status: "ok", deleted: deletedRows });
    }

    return jsonResponse({ status: "error", error: "Unknown action: " + action });

  } catch (err) {
    return jsonResponse({ status: "error", error: "Server error: " + err.toString() });
  } finally {
    if (lock) {
      try { lock.releaseLock(); } catch (releaseErr) { /* already released/expired — ignore */ }
    }
  }
}

// ── Helper: the Drive folder uploaded documents land in ──────────────────────
// Kept beside the spreadsheet's own folder so the whole ERP dataset — sheet
// plus files — sits in one place in the owner's Drive.
var DOCUMENTS_FOLDER_NAME = "Jain ERP Documents";
function getOrCreateDocumentsFolder_() {
  var existing = DriveApp.getFoldersByName(DOCUMENTS_FOLDER_NAME);
  if (existing.hasNext()) return existing.next();
  return DriveApp.createFolder(DOCUMENTS_FOLDER_NAME);
}

// ── Helper: coerce a value into something a cell can actually hold ───────────
// setValues() only takes primitives. An array/object value (a sale's or
// purchase's items[] arrived that way when the client uploaded a raw record)
// got coerced to "[object Object]", permanently destroying the line items on
// that row. Serialise structured values as JSON so they survive the round trip.
function cellValue(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") {
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  }
  return v;
}

// ── Helper: is sheet name in the whitelist? ───────────────────────────────────
function isAllowed(name) {
  for (var i = 0; i < ALLOWED_SHEETS.length; i++) {
    if (ALLOWED_SHEETS[i] === name) return true;
  }
  return false;
}

// ── Helper: does this email belong to a currently Active staff row? ───────────
function isActiveStaffEmail(emailLower) {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName("Finance_Staff");
    if (!sheet || sheet.getLastRow() < 2) return false;

    var data    = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
    var headers = data[0];
    var emailCol  = headers.indexOf("email");
    var statusCol = headers.indexOf("status");
    if (emailCol === -1) return false;

    for (var r = 1; r < data.length; r++) {
      var rowEmail  = String(data[r][emailCol] || "").trim().toLowerCase();
      var rowStatus = statusCol === -1 ? "Active" : String(data[r][statusCol] || "Active");
      if (rowEmail === emailLower && rowStatus === "Active") return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

// ── Helper: Build OTP email HTML ──────────────────────────────────────────────
function buildOtpEmailHtml(otp, systemName) {
  return '<div style="font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">' +
    '<div style="text-align:center;margin-bottom:24px;">' +
    '<h2 style="color:#1e3a8a;font-size:22px;margin:0;">' + systemName + '</h2>' +
    '<p style="color:#64748b;font-size:13px;margin:6px 0 0 0;">Secure Login Verification</p>' +
    '</div>' +
    '<p style="color:#334155;font-size:14px;">Hello,</p>' +
    '<p style="color:#334155;font-size:14px;">Your one-time verification code for <strong>' + systemName + '</strong> is:</p>' +
    '<div style="text-align:center;margin:28px 0;">' +
    '<div style="display:inline-block;background:#f1f5f9;border:2px solid #cbd5e1;border-radius:12px;padding:18px 40px;">' +
    '<span style="font-size:38px;font-weight:900;letter-spacing:12px;color:#1e3a8a;">' + otp + '</span>' +
    '</div></div>' +
    '<p style="color:#64748b;font-size:13px;text-align:center;margin-top:16px;">⏱ This code expires in <strong>10 minutes</strong>.</p>' +
    '<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />' +
    '<p style="color:#94a3b8;font-size:11px;text-align:center;">If you did not request this, ignore this email.<br/>' +
    '<strong>' + systemName + '</strong> &middot; Secure ERP Portal</p>' +
    '</div>';
}

// ── Helper: JSON response ─────────────────────────────────────────────────────
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
