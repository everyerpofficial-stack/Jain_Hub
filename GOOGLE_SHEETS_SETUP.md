# 📊 Google Sheets Integration — Unified Setup Guide

This guide connects your **Jain Finance & Mobiles Hub ERP** to a **single Google Sheet** so all your Finance AND Mobiles data is automatically backed up to the cloud in one place.

---

## Step 1 — Create a Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a **new spreadsheet**
2. Name it: `Jain Finance & Mobiles Hub`
3. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/  <<< YOUR_SPREADSHEET_ID >>>  /edit
   ```

---

## Step 2 — Set Up Google Apps Script

1. In your Google Sheet, click the menu: **Extensions → Apps Script**
2. A new script editor will open. **Delete all existing code** in the editor
3. Open the file `google-apps-script/Code.gs` from this project
4. **Copy all the code** and paste it into the Apps Script editor
5. At the top of the script, replace `YOUR_SPREADSHEET_ID_HERE` with your actual Spreadsheet ID:
   ```js
   const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
   ```
   Replace it like:
   ```js
   const SPREADSHEET_ID = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms";
   ```
6. Click **💾 Save** (Ctrl+S)

---

## Step 3 — Deploy as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**
2. Click the ⚙️ gear icon next to "Select type" and choose **Web app**
3. Set the options:
   - **Description**: `Jain ERP Unified Sync`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click **Deploy**
5. If prompted, click **Authorize access** and sign in with your Google account
6. After deployment, you'll see a **Web app URL** — copy it. It looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

---

## Step 4 — Configure the App

1. Open the **Jain Finance Hub** app in your browser
2. Go to **Settings** (either Finance or Mobiles module — both work the same)
3. In the **Google Sheets Database Sync** section, paste the **Web App URL**
4. Click **Save URL** — it will automatically configure BOTH the Finance and Mobiles modules
5. Toggle **Sync Enabled** to ON
6. Click **Sync Now** to push all existing data to your Google Sheet

---

## Step 5 — Verify in Google Sheets

Open your Google Sheet — you should see these tabs automatically created:

### 📘 Finance Module Tabs
| Tab Name | Contains |
|---|---|
| `Finance_Customers` | All customer EMI records |
| `Finance_Payments` | All EMI payment history |
| `Finance_Expenses` | Income & expense entries |
| `Finance_Investments` | Investment records |
| `Finance_Staff` | Staff directory |

### 📱 Mobiles Module Tabs
| Tab Name | Contains |
|---|---|
| `Mobiles_Sales` | All sales bills & invoices |
| `Mobiles_Purchases` | Purchase orders from suppliers |
| `Mobiles_Expenses` | Store income/expenses |
| `Mobiles_Suppliers` | Supplier directory |
| `Mobiles_SupplierPayments` | Supplier payment history |
| `Mobiles_Customers` | Mobile store customer list |
| `Mobiles_Products` | Product catalog |
| `Mobiles_Accessories` | Accessories inventory |
| `Mobiles_WarrantyClaims` | Warranty claim records |

---

## How Sync Works

- **Offline-first**: The app always works from local browser storage — even without internet
- **Single URL, both modules**: One Apps Script URL handles ALL data for Finance and Mobiles
- **Auto-sync on write**: When you add a customer, record a payment, or create a sale, the new record is automatically sent to Google Sheets
- **Manual full sync**: Use the "Sync Now" button in Settings to push all data at once
- **Load from Sheets**: Use the "Load from Sheets" button to restore data (useful if you clear browser data or switch devices)
- **OTP Login**: The same Apps Script URL is used to send OTP verification emails during login

---

## Troubleshooting

| Problem | Solution |
|---|---|
| "Sheets sync failed: HTTP 302" | The Apps Script URL is wrong — redeploy and copy the correct URL |
| "Sheet not allowed: ..." | The sheet name is not in the approved list — check spelling |
| "Email send failed" | Gmail may have quota limits — try again after a few minutes |
| "Access denied" | Make sure "Who has access" is set to "Anyone" in deployment settings |
| Data not appearing in sheet | Click "Sync Now" button in Settings; check browser console for errors |
| CORS error in browser console | Re-save and re-deploy the Apps Script (create a new deployment version) |

---

## Security Notes

- The Apps Script Web App URL acts as an **unguessed secret** — only people who have the URL can read/write your data
- All data is stored in **your own Google account** — no third parties are involved
- For extra security, change "Who has access" to "Anyone with Google account" so only signed-in Google users can access the API
