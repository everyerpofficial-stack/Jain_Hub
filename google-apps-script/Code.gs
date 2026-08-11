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
 *  WHY ALL GET?
 *   Google Apps Script redirects POST requests from script.google.com
 *   to script.googleusercontent.com. Browsers block this cross-origin
 *   redirect (CORS preflight failure). GET requests follow the redirect
 *   cleanly with no CORS issues.
 *
 *  API (all GET):
 *   ?action=ping                                  → health check
 *   ?action=sendOtp&email=X&otp=Y&system=Z        → send OTP via Gmail
 *   ?action=read&sheet=<name>                     → read all rows
 *   ?action=write&sheet=<name>&payload=<b64json>  → clear + write rows
 *   ?action=append&sheet=<name>&payload=<b64json> → append rows
 *   ?action=delete&sheet=<name>&id=<rowId>        → delete row by ID
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
];

// ── Main GET Handler ──────────────────────────────────────────────────────────
function doGet(e) {
  try {
    var action    = (e && e.parameter && e.parameter.action)  || "";
    var sheetName = (e && e.parameter && e.parameter.sheet)   || "";
    var payload   = (e && e.parameter && e.parameter.payload) || "";

    // ── 0. Guard: check spreadsheet ID is configured ──────────────────
    var isConfigured = (SPREADSHEET_ID && SPREADSHEET_ID !== "YOUR_SPREADSHEET_ID_HERE" && SPREADSHEET_ID.length > 10);

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
            // Create a lightweight content fingerprint using row count, column count, and cell data length
            var valSample = sh0.getRange(1, 1, Math.min(rowCount + 1, 100), colCount).getValues();
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
      var email      = (e.parameter.email  || "").trim();
      var otp        = (e.parameter.otp    || "").trim();
      var systemName = (e.parameter.system || "Jain Finance & Mobiles Hub").trim();

      if (!email || !otp) {
        return jsonResponse({ status: "error", error: "Missing email or otp parameter" });
      }

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
    if (action === "read" || action === "write" || action === "append" || action === "delete") {
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
          var v = row[h];
          return (v === null || v === undefined) ? "" : v;
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
  }
}

// ── Helper: is sheet name in the whitelist? ───────────────────────────────────
function isAllowed(name) {
  for (var i = 0; i < ALLOWED_SHEETS.length; i++) {
    if (ALLOWED_SHEETS[i] === name) return true;
  }
  return false;
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
