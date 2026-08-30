// All action dialogs for the ERP. Mounted once from __root.tsx.
// Each dialog is opened via the useUi() store.

import { useState, useEffect } from "react";
import { create } from "zustand";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  MOBILE_BRANDS, RAM_ROM_OPTIONS, INTEREST_OPTIONS, EMI_COUNT_OPTIONS,
  REGIONS, calcEmi, calculateEmi, useStore, formatDateToInr, formatDateToYmd,
  VILLAGES_BY_REGION, type Payment, type Expense, type Investment,
} from "@/lib/store";
import { readFileForStorage } from "@/lib/imageFile";

// Every key here MUST have a matching dialog rendered in <AppDialogs/> below.
// "report" used to sit in this union with no component behind it, which is
// how openDialog("loan") became a button that opened nothing — keep the two
// lists in step so wiring a key with no dialog fails to compile.
type DialogKey = null | "customer" | "loan" | "expense" | "investment" | "payment" | "collect" | "withdrawProfit" | "depositProfit";

type UiState = {
  open: DialogKey;
  prefill?: Record<string, string>;
  openDialog: (key: DialogKey, prefill?: Record<string, string>) => void;
  close: () => void;
};

export const useUi = create<UiState>((set) => ({
  open: null,
  openDialog: (key, prefill) => set({ open: key, prefill }),
  close: () => set({ open: null, prefill: undefined }),
}));

const getTodayYmd = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ---- Shared form components ----
function Field({
  label, value, onChange, placeholder, type = "text", readOnly = false, highlight = false, maxLength, inputMode, min,
}: {
  label: string; value: string | number; onChange?: (v: string) => void;
  placeholder?: string; type?: string; readOnly?: boolean; highlight?: boolean;
  maxLength?: number; inputMode?: "search" | "text" | "email" | "tel" | "url" | "numeric" | "decimal" | "none";
  min?: string | number;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        min={min ?? (type === "number" ? 0 : undefined)}
        value={value}
        onChange={(e) => {
          let val = e.target.value;
          if (type === "number") {
            val = val.replace(/-/g, "");
          }
          onChange?.(val);
        }}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`mt-1 h-9 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 ${
          readOnly
            ? "border-border/60 bg-muted/10 text-foreground/75 cursor-not-allowed"
            : highlight
            ? "border-success/50 bg-success/5 border-border focus:border-success/60"
            : "border-border bg-surface"
        }`}
      />
    </label>
  );
}

function Select({
  label, value, onChange, options, readOnly = false,
}: {
  label: string; value: string; onChange?: (v: string) => void;
  options: string[]; readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={readOnly}
        className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:bg-muted/40"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

function CalcRow({ label, value, big = false, accent = false }: { label: string; value: string; big?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-medium ${big ? "text-base" : "text-sm"} ${accent ? "text-success" : ""}`}>{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground border-b border-border pb-1.5 mb-3 mt-1">
      {children}
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="h-9 px-5 rounded-md bg-foreground text-background text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity">
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="h-9 px-3 rounded-md border border-border bg-surface text-sm hover:bg-accent transition-colors">
      {children}
    </button>
  );
}

function CustomerDialog() {
  const { open, close } = useUi();
  const addCustomer = useStore((s) => s.addCustomer);

  // Personal
  const [firstName, setFirstName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [surname, setSurname] = useState("");
  const [mobile, setMobile] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [guarantyName, setGuarantyName] = useState("");
  const [guarantyMobile, setGuarantyMobile] = useState("");
  const [region, setRegion] = useState(REGIONS[0]);
  const [village, setVillage] = useState("");

  const availableVillages = VILLAGES_BY_REGION[region] || [];

  // Reset village when region changes
  useEffect(() => {
    setVillage(availableVillages[0] || "");
  }, [region, availableVillages]);

  // Mobile device
  const [mobileBrand, setMobileBrand] = useState(Object.keys(MOBILE_BRANDS)[0] || "Apple");
  const [mobileModel, setMobileModel] = useState("");
  const [ramRom, setRamRom] = useState("4GB/64GB");
  const [imei1, setImei1] = useState("");
  const [imei2, setImei2] = useState("");

  // Finance

  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [interestRate, setInterestRate] = useState("5");
  const [noOfEmi, setNoOfEmi] = useState("6");
  const [billDate, setBillDate] = useState(getTodayYmd());
  const [emiDate, setEmiDate] = useState(getTodayYmd());
  const [fileChargeVal, setFileChargeVal] = useState("");

  // Auto-calculate file charge (10% of price) when price changes
  useEffect(() => {
    if (price) {
      setFileChargeVal(Math.round(Number(price) * 0.1).toString());
    } else {
      setFileChargeVal("");
    }
  }, [price]);

  // File Upload states
  const [aadhaarFile, setAadhaarFile] = useState<{ name: string; url: string; size: string } | undefined>(undefined);
  const [photoFile, setPhotoFile] = useState<{ name: string; url: string; size: string } | undefined>(undefined);

  // Reset form when dialog closes
  useEffect(() => {
    if (open !== "customer") {
      setFirstName(""); setFatherName(""); setSurname(""); setMobile(""); setAadhaar("");
      setGuarantyName(""); setGuarantyMobile(""); setRegion(REGIONS[0]); setVillage(VILLAGES_BY_REGION[REGIONS[0]]?.[0] || "");
      setMobileBrand(Object.keys(MOBILE_BRANDS)[0] || "Apple"); setRamRom("4GB/64GB"); setImei1(""); setImei2("");
      setPrice(""); setDeposit(""); setInterestRate("5"); setNoOfEmi("6");
      setBillDate(getTodayYmd());
      setEmiDate(getTodayYmd());
      setFileChargeVal("");
      setAadhaarFile(undefined); setPhotoFile(undefined);
    }
  }, [open]);

  const handleBillDateChange = (val: string) => {
    setBillDate(val);
    if (!emiDate || emiDate === billDate) {
      setEmiDate(val);
    }
  };

  // Auto calculations
  const priceNum = Number(price) || 0;
  const depositNum = Number(deposit) || 0;
  const interestNum = Number(interestRate) || 0;
  const emiCount = Number(noOfEmi) || 0;
  const fileChargeNum = fileChargeVal !== "" ? Number(fileChargeVal) : undefined;
  const { fileCharge, balance, interestPerMonth, totalInterest, totalEmiAmount, perMonthEmi } =
    calcEmi(priceNum, depositNum, interestNum, emiCount, fileChargeNum);

  const isMobileValid = /^\d{10}$/.test(mobile.trim());
  const isAadhaarValid = /^\d{12}$/.test(aadhaar.trim());
  const isGuarantyMobileValid = !guarantyMobile.trim() || /^\d{10}$/.test(guarantyMobile.trim());

  const getValidationError = (): string | null => {
    if (!firstName.trim()) return "Please enter Customer First Name";
    if (!mobile.trim()) return "Please enter Mobile Number";
    if (!isMobileValid) return "Mobile Number must be exactly 10 digits";
    if (!aadhaar.trim()) return "Please enter Aadhaar Card Number";
    if (!isAadhaarValid) return "Aadhaar Card Number must be exactly 12 digits";
    if (guarantyMobile.trim() && !isGuarantyMobileValid) return "Guarantor Mobile Number must be exactly 10 digits";
    if (!mobileModel.trim()) return "Please enter Mobile Model Name";
    if (!priceNum || priceNum <= 0) return "Please enter a valid Device Price (₹)";
    if (!billDate.trim()) return "Please select Finance Creation Date";
    if (!emiDate.trim()) return "Please select EMI Start Date";
    return null;
  };

  const canSubmit = !getValidationError();

  // Both uploads go through readFileForStorage, which downscales camera-sized
  // images. Storing them raw was what exhausted this browser's storage budget
  // after a few registrations — see imageFile.ts.
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    label: string,
    apply: (f: { name: string; url: string; size: string }) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const stored = await readFileForStorage(file);
      apply(stored);
      toast.success(`${label} uploaded: ${file.name}`, { description: `Stored as ${stored.size}` });
    } catch (err) {
      console.error(`[CustomerDialog] ${label} upload failed:`, err);
      toast.error(`Could not read ${file.name}`, {
        description: err instanceof Error ? err.message : "Please try a different file.",
      });
    }
  };

  const handleAadhaarUpload = (e: React.ChangeEvent<HTMLInputElement>) =>
    void handleUpload(e, "Aadhaar Xerox", setAadhaarFile);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) =>
    void handleUpload(e, "Customer Photo", setPhotoFile);

  return (
    <Dialog open={open === "customer"} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-foreground text-background rounded-t-xl">
          <h2 className="text-base font-semibold tracking-tight">New Customer Registration</h2>
          <p className="text-xs opacity-70 mt-0.5">Mobile phone EMI finance · Jain Finance ERP</p>
        </div>

        <div className="grid grid-cols-2 gap-0 divide-x divide-border">
          {/* LEFT — Personal Details */}
          <div className="p-5 space-y-3">
            <SectionTitle>Personal Information</SectionTitle>
            <Field label="Customer Name (First)" value={firstName} onChange={setFirstName} placeholder="e.g. Avinash" />
            <Field label="Father's Name" value={fatherName} onChange={setFatherName} placeholder="e.g. Ramesh" />
            <Field label="Surname" value={surname} onChange={setSurname} placeholder="e.g. Patil" />
            <Field
              label="Mobile No"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={(v) => setMobile(v.replace(/\D/g, "").slice(0, 10))}
              placeholder="9876543210"
            />
            {mobile.trim() && !/^\d{10}$/.test(mobile.trim()) && (
              <span className="text-[10px] text-red-500 font-semibold mt-0.5 block">Phone number must be exactly 10 digits</span>
            )}
            <Field
              label="Adhar Card No"
              inputMode="numeric"
              maxLength={12}
              value={aadhaar}
              onChange={(v) => setAadhaar(v.replace(/\D/g, "").slice(0, 12))}
              placeholder="123456789012"
            />
            {aadhaar.trim() && !/^\d{12}$/.test(aadhaar.trim()) && (
              <span className="text-[10px] text-red-500 font-semibold mt-0.5 block">Aadhaar card number must be exactly 12 digits</span>
            )}

            <SectionTitle>Guarantor Details</SectionTitle>
            <Field label="Guaranty Name" value={guarantyName} onChange={setGuarantyName} placeholder="e.g. Anna" />
            <Field
              label="Guaranty Mobile No"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={guarantyMobile}
              onChange={(v) => setGuarantyMobile(v.replace(/\D/g, "").slice(0, 10))}
              placeholder="9876543210"
            />
            {guarantyMobile.trim() && !/^\d{10}$/.test(guarantyMobile.trim()) && (
              <span className="text-[10px] text-red-500 font-semibold mt-0.5 block">Guarantor mobile must be exactly 10 digits</span>
            )}

            <SectionTitle>Location</SectionTitle>
            <Select label="Region" value={region} onChange={setRegion} options={REGIONS} />
            <Select label="Village Name" value={village} onChange={setVillage} options={availableVillages} />
            {/* Document upload inputs */}
            <SectionTitle>Documents</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-muted-foreground font-medium block mb-1">Aadhaar Xerox</span>
                <input
                  type="file"
                  id="aadhaar-file-input"
                  className="hidden"
                  onChange={handleAadhaarUpload}
                  accept="image/*,application/pdf"
                />
                <div
                  onClick={() => document.getElementById("aadhaar-file-input")?.click()}
                  className="h-20 rounded-md border border-dashed border-border bg-surface flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-accent transition-colors px-2 text-center"
                >
                  {aadhaarFile ? (
                    <>
                      <span className="text-xs font-medium text-success truncate w-full">{aadhaarFile.name}</span>
                      <span className="text-[10px] text-muted-foreground">{aadhaarFile.size}</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">Click to select</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium block mb-1">Photo</span>
                <input
                  type="file"
                  id="photo-file-input"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  accept="image/*"
                />
                <div
                  onClick={() => document.getElementById("photo-file-input")?.click()}
                  className="h-20 rounded-md border border-dashed border-border bg-surface flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-accent transition-colors px-2 text-center"
                >
                  {photoFile ? (
                    <>
                      <span className="text-xs font-medium text-success truncate w-full">{photoFile.name}</span>
                      <span className="text-[10px] text-muted-foreground">{photoFile.size}</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">Click to select</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Mobile Device + EMI Finance */}
          <div className="p-5 space-y-3">
            <SectionTitle>Mobile Device Details</SectionTitle>
            <Select label="Mobile Brand" value={mobileBrand} onChange={setMobileBrand} options={Object.keys(MOBILE_BRANDS)} />
            <Field label="Model Name (Manual)" value={mobileModel} onChange={setMobileModel} placeholder="e.g. Redmi 12 5G" />
            <Select label="RAM / ROM" value={ramRom} onChange={setRamRom} options={RAM_ROM_OPTIONS} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="IMEI 1" value={imei1} onChange={setImei1} placeholder="15-digit" />
              <Field label="IMEI 2" value={imei2} onChange={setImei2} placeholder="15-digit" />
            </div>

            <SectionTitle>EMI Finance Details</SectionTitle>
            <Field label="Price (₹)" value={price} onChange={setPrice} type="number" placeholder="15000" />

            <Field label="Deposit (₹)" value={deposit} onChange={setDeposit} type="number" placeholder="2000" />

            <Field label="File Charge (₹)" value={fileChargeVal} onChange={setFileChargeVal} type="number" placeholder="Defaults to 10%" />

            {/* Balance for EMI — auto calculated */}
            <div className="flex items-center justify-between h-9 px-3 rounded-md border border-border bg-surface text-sm">
              <span className="text-muted-foreground text-xs font-medium">Balance for EMI</span>
              <span className="font-semibold text-foreground">₹{balance.toLocaleString("en-IN")}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Field label="Interest (% / mo)" value={interestRate} onChange={setInterestRate} type="number" inputMode="decimal" placeholder="e.g. 2" />
              </div>
              <div className="flex items-center justify-between h-9 mt-[22px] px-3 rounded-md border border-border bg-surface text-sm">
                <span className="text-muted-foreground text-xs font-medium">Interest/mo</span>
                <span className="font-semibold text-foreground">₹{interestPerMonth.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <Field label="No of EMI (months)" value={noOfEmi} onChange={setNoOfEmi} type="number" inputMode="numeric" placeholder="e.g. 6" />

            {/* Summary calculation box */}
            <div className="rounded-lg border border-border bg-surface px-4 py-3 space-y-1 mt-1">
              <CalcRow label="Total Interest" value={`₹${totalInterest.toLocaleString("en-IN")}`} />
              <CalcRow label="Total EMI Amount" value={`₹${totalEmiAmount.toLocaleString("en-IN")}`} big />
              <div className="border-t border-border pt-1 mt-1">
                <CalcRow label="Per Month EMI" value={`₹${perMonthEmi.toLocaleString("en-IN")}`} big accent />
              </div>
              <CalcRow label="No of Pending EMI" value={noOfEmi} />
              <CalcRow label="Pending EMI Amount" value={`₹${totalEmiAmount.toLocaleString("en-IN")}`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Finance Creation Date" value={billDate} onChange={handleBillDateChange} type="date" />
              <Field label="EMI Start Date" value={emiDate} onChange={setEmiDate} type="date" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3 bg-surface/50 rounded-b-xl">
          <p className="text-xs text-muted-foreground">
            {canSubmit ? `✓ Ready to register ${firstName} ${surname}` : (getValidationError() || "Fill all required fields")}
          </p>
          <div className="flex gap-2">
            <GhostBtn onClick={close}>Cancel</GhostBtn>
            <PrimaryBtn
              onClick={() => {
                const valErr = getValidationError();
                if (valErr) {
                  toast.error(valErr);
                  return;
                }
                try {
                  const c = addCustomer({
                    firstName: firstName.trim(),
                    fatherName: fatherName.trim(),
                    surname: surname.trim(),
                    mobile: mobile.trim(),
                    aadhaar: aadhaar.trim(),
                    guarantyName: guarantyName.trim(),
                    guarantyMobile: guarantyMobile.trim(),
                    region, village,
                    mobileBrand, mobileModel: mobileModel.trim(), ramRom,
                    imei1: imei1.trim(), imei2: imei2.trim(),
                    price: priceNum, deposit: depositNum,
                    interestRate: interestNum, noOfEmi: emiCount,
                    emiDate: formatDateToInr(emiDate),
                    billDate: formatDateToInr(billDate),
                    fileCharge: fileChargeNum,
                    aadhaarFile,
                    photoFile,
                  });
                  toast.success(`Customer ${c.id} registered — ${mobileBrand} ${mobileModel}`);
                  close();
                } catch (err) {
                  console.error("[CustomerDialog] registration failed:", err);
                  toast.error("Could not register the customer", {
                    description: err instanceof Error ? err.message : "Please try again.",
                  });
                  close();
                }
              }}
            >
              Register Customer
            </PrimaryBtn>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Collect EMI / Record Payment dialog ----
function CollectDialog() {
  const { open, close, prefill } = useUi();
  const customers = useStore((s) => s.customers);
  const staff = useStore((s) => s.staff);
  const currentUser = useStore((s) => s.currentUser);
  const recordPayment = useStore((s) => s.recordPayment);

  const defaultCollector = currentUser?.name || staff[0]?.name || "Avinash G";

  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [cashAmount, setCashAmount] = useState<number | "">("");
  const [bankAmount, setBankAmount] = useState<number | "">("");
  const [collector, setCollector] = useState(defaultCollector);
  const [customCollectorName, setCustomCollectorName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [date, setDate] = useState(getTodayYmd());

  const customer = customers.find((c) => c.id === customerId);

  useEffect(() => {
    if (open === "collect" || open === "payment") {
      const pid = prefill?.customerId || customers.find((c) => c.pendingEmis > 0)?.id || customers[0]?.id || "";
      setCustomerId(pid);
      const cust = customers.find((c) => c.id === pid);
      if (cust) {
        setAmount(cust.perMonthEmi.toString());
        setCashAmount(Math.floor(cust.perMonthEmi / 2));
        setBankAmount(cust.perMonthEmi - Math.floor(cust.perMonthEmi / 2));
      }
      setRemarks("");
      setDate(getTodayYmd());
      setCollector(currentUser?.name || staff[0]?.name || "Avinash G");
      setCustomCollectorName("");
      setMethod("Cash");
    }
  }, [open, prefill, customers, currentUser, staff]);

  useEffect(() => {
    if (customer) {
      setAmount(customer.perMonthEmi.toString());
      if (method === "Cash & Bank") {
        setCashAmount(Math.floor(customer.perMonthEmi / 2));
        setBankAmount(customer.perMonthEmi - Math.floor(customer.perMonthEmi / 2));
      }
    }
  }, [customerId, customer]);

  const handleAmountChange = (valStr: string) => {
    setAmount(valStr);
    const total = Number(valStr) || 0;
    if (method === "Cash & Bank") {
      const half = Math.floor(total / 2);
      setCashAmount(half);
      setBankAmount(total - half);
    }
  };

  const handleMethodChange = (m: string) => {
    setMethod(m);
    const total = Number(amount) || 0;
    if (m === "Cash & Bank") {
      const half = Math.floor(total / 2);
      setCashAmount(half);
      setBankAmount(total - half);
    }
  };

  return (
    <Dialog open={open === "collect" || open === "payment"} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record EMI Payment</DialogTitle>
          <DialogDescription>Collect monthly instalment from customer.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Field label="Payment Date" value={date} onChange={setDate} type="date" />

          <label className="block">
            <span className="text-xs text-muted-foreground font-medium">Customer</span>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.name} ({c.mobileBrand} {c.mobileModel})
                </option>
              ))}
            </select>
          </label>

          {customer && (
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Monthly EMI</div>
                <div className="font-semibold mt-0.5">₹{customer.perMonthEmi.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending EMIs</div>
                <div className="font-semibold mt-0.5">{customer.pendingEmis} / {customer.noOfEmi}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending Amt</div>
                <div className="font-semibold mt-0.5 text-warning">₹{customer.pendingAmount.toLocaleString("en-IN")}</div>
              </div>
            </div>
          )}

          <Field label="Payment Amount (₹)" value={amount} onChange={handleAmountChange} type="number" highlight />
          
          <div className="grid grid-cols-2 gap-3">
            <Select label="Payment Mode" value={method} onChange={handleMethodChange} options={["Cash", "Bank", "Cash & Bank"]} />
            <Select label="Collector" value={collector} onChange={setCollector}
              options={Array.from(new Set([...staff.map((s) => s.name).filter(Boolean), "Other (Manual Entry)"]))} />
          </div>

          {method === "Cash & Bank" && (
            <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-lg border border-border/50 animate-in fade-in duration-200">
              <Field
                label="Cash Portion (₹)"
                value={cashAmount.toString()}
                type="number"
                onChange={(val) => {
                  const c = Number(val) || 0;
                  setCashAmount(c);
                  const total = Number(amount) || 0;
                  setBankAmount(Math.max(0, total - c));
                }}
              />
              <Field
                label="Bank Portion (₹)"
                value={bankAmount.toString()}
                type="number"
                onChange={(val) => {
                  const b = Number(val) || 0;
                  setBankAmount(b);
                  const total = Number(amount) || 0;
                  setCashAmount(Math.max(0, total - b));
                }}
              />
            </div>
          )}

          {collector === "Other (Manual Entry)" && (
            <Field label="Custom Collector Name" value={customCollectorName} onChange={setCustomCollectorName} placeholder="Enter collector's name" />
          )}
          <Field label="Remarks (optional)" value={remarks} onChange={setRemarks} placeholder="e.g. Partial payment" />
        </div>
        <DialogFooter>
          <GhostBtn onClick={close}>Cancel</GhostBtn>
          <PrimaryBtn
            disabled={!customerId || !amount || !date || (collector === "Other (Manual Entry)" && !customCollectorName.trim())}
            onClick={() => {
              const activeCollector = collector === "Other (Manual Entry)" ? customCollectorName.trim() : collector;
              const finalRemarks = method === "Cash & Bank"
                ? `${remarks ? remarks + " " : ""}[Cash: ₹${cashAmount} | Bank: ₹${bankAmount}]`
                : remarks;
              recordPayment({
                customerId, amount: Number(amount), method: method as Payment["method"], collector: activeCollector, remarks: finalRemarks, date,
                cashAmount: method === "Cash & Bank" ? Number(cashAmount) || 0 : undefined,
                bankAmount: method === "Cash & Bank" ? Number(bankAmount) || 0 : undefined,
              });
              toast.success(`₹${Number(amount).toLocaleString("en-IN")} (${method}) recorded for ${customer?.name}`);
              close();
            }}
          >
            Confirm Payment
          </PrimaryBtn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Expense dialog ----
function ExpenseDialog() {
  const { open, close } = useUi();
  const addExpense = useStore((s) => s.addExpense);
  const expenses = useStore((s) => s.expenses);
  const [type, setType] = useState<"Expense" | "Income">("Expense");
  const [cat, setCat] = useState("Office Expense");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getTodayYmd());
  const [method, setMethod] = useState<string>("Cash");

  const totalIncome = expenses.filter((e) => e.type === "Income").reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalExpense = expenses.filter((e) => e.type !== "Income").reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netBalance = totalIncome - totalExpense;

  const EXPENSE_CATEGORIES = ["Office Expense", "Salary", "Travel", "Utilities", "Maintenance", "Marketing", "Other Expense"];
  const INCOME_CATEGORIES = ["Capital Infusion / Owner Investment", "Opening Cash Balance", "Interest Collection", "File Charge Income", "Capital Inflow", "Other Income"];

  // Reset category when entry type changes
  useEffect(() => {
    setCat(type === "Expense" ? "Office Expense" : "Capital Infusion / Owner Investment");
  }, [type]);

  // Reset all states on close/open
  useEffect(() => {
    if (open !== "expense") {
      setType("Expense");
      setCat("Office Expense");
      setDesc("");
      setAmount("");
      setDate(getTodayYmd());
      setMethod("Cash");
    }
  }, [open]);

  return (
    <Dialog open={open === "expense"} onOpenChange={(o) => !o && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Income / Expense Entry</DialogTitle>
          <DialogDescription>Record a cash transaction against the current month.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="col-span-2">
            <Field label="Entry Date" value={date} onChange={setDate} type="date" />
          </div>
          <Select label="Entry Type" value={type} onChange={(val) => setType(val as "Expense" | "Income")} options={["Expense", "Income"]} />
          <Select label="Category" value={cat} onChange={setCat}
            options={type === "Expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES} />
          <Field label="Amount (₹)" value={amount} onChange={setAmount} type="number" placeholder="1000" highlight />
          <Select label="Payment Method" value={method} onChange={setMethod} options={["Cash", "Bank", "Cash & Bank"]} />

          {type === "Expense" && netBalance <= 0 && (
            <div className="col-span-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
              <div className="font-semibold text-amber-800 dark:text-amber-300">
                💡 Company Net Balance is ₹{netBalance.toLocaleString("en-IN")}
              </div>
              <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
                Recording a ₹{(Number(amount) || 0).toLocaleString("en-IN")} expense will result in net balance of -₹{Math.abs(netBalance - (Number(amount) || 0)).toLocaleString("en-IN")}. If funds were invested into the firm, add <strong>Opening Cash Balance</strong> or <strong>Capital Infusion</strong> under Income.
              </p>
              <button
                type="button"
                onClick={() => {
                  setType("Income");
                  setCat("Capital Infusion / Owner Investment");
                  setDesc("Owner initial capital investment");
                }}
                className="mt-2 text-xs font-semibold text-primary underline hover:opacity-80 block"
              >
                + Switch to Add Capital / Opening Cash (+ Income)
              </button>
            </div>
          )}

          <div className="col-span-2">
            <Field label="Description" value={desc} onChange={setDesc} placeholder="e.g. Office electricity bill, EMI collection cash..." />
          </div>
        </div>
        <DialogFooter>
          <GhostBtn onClick={close}>Cancel</GhostBtn>
          <PrimaryBtn disabled={!amount || !desc || !date} onClick={() => {
            const e = addExpense({ cat, desc, amount: Number(amount), type, date, method: method as Expense["method"] });
            toast.success(`${type} entry ${e.id} recorded successfully`);
            setDesc(""); setAmount(""); close();
          }}>Save Entry</PrimaryBtn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Investment dialog ----
function InvestmentDialog() {
  const { open, close } = useUi();
  const addInvestment = useStore((s) => s.addInvestment);
  const [investor, setInvestor] = useState("");
  const [amount, setAmount] = useState("");
  const [roi, setRoi] = useState("12.5");
  const [maturity, setMaturity] = useState("31 Dec 2026");
  const [date, setDate] = useState(getTodayYmd());
  const [method, setMethod] = useState<string>("Bank");

  // Reset all states on close/open
  useEffect(() => {
    if (open !== "investment") {
      setInvestor("");
      setAmount("");
      setRoi("12.5");
      setMaturity("31 Dec 2026");
      setDate(getTodayYmd());
      setMethod("Bank");
    }
  }, [open]);

  return (
    <Dialog open={open === "investment"} onOpenChange={(o) => !o && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add investment</DialogTitle>
          <DialogDescription>Record investor capital deployed into the fund.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="col-span-2">
            <Field label="Investment Date" value={date} onChange={setDate} type="date" />
          </div>
          <Field label="Investor name" value={investor} onChange={setInvestor} placeholder="e.g. Mahavir Jain" />
          <Field label="Amount (₹)" value={amount} onChange={setAmount} type="number" placeholder="1000000" highlight />
          <Field label="ROI (%)" value={roi} onChange={setRoi} type="number" />
          <Select label="Payment Method" value={method} onChange={setMethod} options={["Cash", "Bank", "Cash & Bank"]} />
          <div className="col-span-2">
            <Field label="Maturity date" value={maturity} onChange={setMaturity} placeholder="31 Dec 2026" />
          </div>
        </div>
        <DialogFooter>
          <GhostBtn onClick={close}>Cancel</GhostBtn>
          <PrimaryBtn disabled={!investor || !amount || !date} onClick={() => {
            const i = addInvestment({ investor, amount: Number(amount), roi: Number(roi), maturity, date, method: method as Investment["method"] });
            toast.success(`Investment ${i.id} added`);
            close();
          }}>Save</PrimaryBtn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// The "loan" dialog key existed and /loans wired its "New Loan" button to
// openDialog("loan") — but no component ever rendered for that key, so the
// button set the store flag and nothing appeared. This is that missing dialog.
function LoanDialog() {
  const { open, close } = useUi();
  const addLoan = useStore((s) => s.addLoan);

  const [date, setDate] = useState(getTodayYmd());
  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [deposit, setDeposit] = useState("");
  const [interest, setInterest] = useState("");
  const [months, setMonths] = useState("");

  useEffect(() => {
    if (open !== "loan") {
      setDate(getTodayYmd());
      setCustomer("");
      setAmount("");
      setDeposit("");
      setInterest("");
      setMonths("");
    }
  }, [open]);

  const amountNum = Number(amount) || 0;
  const depositNum = Number(deposit) || 0;
  const interestNum = Number(interest) || 0;
  const monthsNum = Number(months) || 0;
  const principal = Math.max(0, amountNum - depositNum);
  const previewEmi = principal > 0 && monthsNum > 0 ? Math.round(calculateEmi(principal, interestNum, monthsNum)) : 0;
  const totalPayable = previewEmi * monthsNum;
  const totalInterest = Math.max(0, totalPayable - principal);

  const depositExceedsAmount = depositNum > amountNum && amountNum > 0;
  const canSubmit =
    !!customer.trim() && amountNum > 0 && depositNum >= 0 && !depositExceedsAmount && interest.trim() !== "" && months.trim() !== "" && !!date.trim();

  return (
    <Dialog open={open === "loan"} onOpenChange={(o) => !o && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New loan</DialogTitle>
          <DialogDescription>Register a loan for a customer.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="col-span-2">
            <Field label="Date" value={date} onChange={setDate} type="date" />
          </div>
          <div className="col-span-2">
            <Field label="Customer / Borrower Name" value={customer} onChange={setCustomer} placeholder="e.g. Ramesh Kumar" />
          </div>
          <Field label="Loan amount (₹)" value={amount} onChange={setAmount} type="number" inputMode="numeric" placeholder="15000" highlight />
          <Field label="Deposit (₹)" value={deposit} onChange={setDeposit} type="number" inputMode="numeric" placeholder="3000" />
          <Field label="Interest (% / mo)" value={interest} onChange={setInterest} type="number" inputMode="decimal" placeholder="e.g. 2" />
          <Field label="Duration (months)" value={months} onChange={setMonths} type="number" inputMode="numeric" placeholder="e.g. 12" />
        </div>

        {depositExceedsAmount && (
          <p className="text-xs text-danger font-medium -mt-1">
            Deposit cannot be more than the loan amount.
          </p>
        )}

        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 text-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider border-b border-border/60 pb-1.5">
            <span>Financed & EMI Details</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground block">Financed Principal</span>
              <span className="font-semibold text-sm">₹{principal.toLocaleString("en-IN")}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Monthly EMI</span>
              <span className="font-semibold text-sm text-success">
                ₹{previewEmi.toLocaleString("en-IN")}{monthsNum > 0 ? "/mo" : ""}
              </span>
            </div>
            {monthsNum > 0 && principal > 0 && (
              <>
                <div>
                  <span className="text-muted-foreground block">Total Interest</span>
                  <span className="font-medium text-foreground">₹{totalInterest.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Total Amount Payable</span>
                  <span className="font-medium text-foreground">₹{totalPayable.toLocaleString("en-IN")}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <GhostBtn onClick={close}>Cancel</GhostBtn>
          <PrimaryBtn
            disabled={!canSubmit}
            onClick={() => {
              try {
                const l = addLoan({
                  customer: customer.trim(),
                  amount: amountNum,
                  deposit: depositNum,
                  interest: interestNum,
                  months: monthsNum,
                  date,
                });
                toast.success(`Loan ${l.id} created for ${l.customer}`);
                close();
              } catch (err) {
                toast.error("Could not create loan", {
                  description: err instanceof Error ? err.message : String(err),
                });
              }
            }}
          >
            Save
          </PrimaryBtn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WithdrawProfitDialog() {
  const { open, close } = useUi();
  const isOpen = open === "withdrawProfit";

  const customers = useStore((s) => s.customers);
  const payments = useStore((s) => s.payments);
  const expenses = useStore((s) => s.expenses);
  const profitTransactions = useStore((s) => s.profitTransactions) || [];
  const withdrawProfit = useStore((s) => s.withdrawProfit);

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getTodayYmd());
  const [method, setMethod] = useState<"Cash" | "UPI" | "Cash & UPI">("Cash");
  const [cashAmount, setCashAmount] = useState("");
  const [upiAmount, setUpiAmount] = useState("");
  const [notes, setNotes] = useState("Withdrawal");

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDate(getTodayYmd());
      setMethod("Cash");
      setCashAmount("");
      setUpiAmount("");
      setNotes("Withdrawal");
    }
  }, [isOpen]);

  const totalFileCharge = customers.reduce((s, c) => s + (c.fileCharge || 0), 0);
  const custInterestMap = new Map(customers.map((c) => [c.id, c.interestPerMonth || 0]));
  const totalInterestIncome = payments
    .filter((p) => p.status === "Success")
    .reduce((sum, p) => sum + (custInterestMap.get(p.customerId) || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (typeof e.amount === "number" ? e.amount : Number(String(e.amount).replace(/[^\d.]/g, "")) || 0), 0);
  const netProfit = (totalFileCharge + totalInterestIncome) - totalExpenses;

  const totalWithdrawn = profitTransactions.filter((t) => t.type === "Withdrawal").reduce((s, t) => s + t.amount, 0);
  const totalRedeposited = profitTransactions.filter((t) => t.type === "Redeposit").reduce((s, t) => s + t.amount, 0);
  const currentTakenBalance = Math.max(0, totalWithdrawn - totalRedeposited);

  const amountNum = Number(amount) || 0;
  const cashNum = Number(cashAmount) || 0;
  const upiNum = Number(upiAmount) || 0;
  const isSplitValid = method !== "Cash & UPI" || (cashNum + upiNum === amountNum && amountNum > 0);
  const canSubmit = amountNum > 0 && isSplitValid;

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const num = Number(val) || 0;
    setCashAmount(String(num));
    setUpiAmount("0");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && close()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Withdraw</DialogTitle>
          <DialogDescription>
            Withdraw available net profit or capital distribution from the business fund.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/20 p-3 text-xs">
            <div>
              <span className="text-muted-foreground block">Net Profit Balance</span>
              <span className={`text-sm font-bold ${netProfit >= 0 ? "text-success" : "text-danger"}`}>
                ₹{Math.round(netProfit).toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Taken Money Balance</span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                ₹{Math.round(currentTakenBalance).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <Field
            label="Date"
            value={date}
            onChange={setDate}
            type="date"
          />

          <Field
            label="Withdrawal Amount (₹)"
            value={amount}
            onChange={handleAmountChange}
            type="number"
            inputMode="numeric"
            placeholder="e.g. 25000"
            highlight
          />

          <Select
            label="Payment Mode"
            value={method}
            onChange={(v) => {
              const m = v as "Cash" | "UPI" | "Cash & UPI";
              setMethod(m);
              if (m === "Cash & UPI") {
                setCashAmount(String(amountNum));
                setUpiAmount("0");
              }
            }}
            options={["Cash", "UPI", "Cash & UPI"]}
          />

          {method === "Cash & UPI" && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/20">
              <Field
                label="Cash Amount (₹)"
                value={cashAmount}
                onChange={(v) => {
                  setCashAmount(v);
                  const c = Number(v) || 0;
                  setUpiAmount(String(Math.max(0, amountNum - c)));
                }}
                type="number"
                inputMode="numeric"
                placeholder="0"
              />
              <Field
                label="UPI Amount (₹)"
                value={upiAmount}
                onChange={(v) => {
                  setUpiAmount(v);
                  const u = Number(v) || 0;
                  setCashAmount(String(Math.max(0, amountNum - u)));
                }}
                type="number"
                inputMode="numeric"
                placeholder="0"
              />
            </div>
          )}

          <Field
            label="Reason / Notes"
            value={notes}
            onChange={setNotes}
            placeholder="e.g. Personal profit distribution"
          />

          {amountNum > netProfit && netProfit > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              ⚠️ Note: Withdrawing ₹{amountNum.toLocaleString("en-IN")} which is higher than current net profit of ₹{Math.round(netProfit).toLocaleString("en-IN")}.
            </p>
          )}
        </div>

        <DialogFooter>
          <GhostBtn onClick={close}>Cancel</GhostBtn>
          <PrimaryBtn
            disabled={!canSubmit}
            onClick={() => {
              try {
                const txn = withdrawProfit({
                  amount: amountNum,
                  date,
                  method,
                  cashAmount: method === "Cash & UPI" ? cashNum : undefined,
                  bankAmount: method === "Cash & UPI" ? upiNum : undefined,
                  notes: notes.trim(),
                });
                toast.success(`Withdrew ₹${txn.amount.toLocaleString("en-IN")}`);
                close();
              } catch (err) {
                toast.error("Withdrawal failed", {
                  description: err instanceof Error ? err.message : String(err),
                });
              }
            }}
          >
            Withdraw
          </PrimaryBtn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DepositProfitDialog() {
  const { open, close } = useUi();
  const isOpen = open === "depositProfit";

  const profitTransactions = useStore((s) => s.profitTransactions) || [];
  const depositTakenMoney = useStore((s) => s.depositTakenMoney);

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getTodayYmd());
  const [method, setMethod] = useState<"Cash" | "UPI" | "Cash & UPI">("Cash");
  const [cashAmount, setCashAmount] = useState("");
  const [upiAmount, setUpiAmount] = useState("");
  const [notes, setNotes] = useState("Deposit");

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDate(getTodayYmd());
      setMethod("Cash");
      setCashAmount("");
      setUpiAmount("");
      setNotes("Deposit");
    }
  }, [isOpen]);

  const totalWithdrawn = profitTransactions.filter((t) => t.type === "Withdrawal").reduce((s, t) => s + t.amount, 0);
  const totalRedeposited = profitTransactions.filter((t) => t.type === "Redeposit").reduce((s, t) => s + t.amount, 0);
  const currentTakenBalance = Math.max(0, totalWithdrawn - totalRedeposited);

  const amountNum = Number(amount) || 0;
  const cashNum = Number(cashAmount) || 0;
  const upiNum = Number(upiAmount) || 0;
  const isSplitValid = method !== "Cash & UPI" || (cashNum + upiNum === amountNum && amountNum > 0);
  const canSubmit = amountNum > 0 && isSplitValid;

  const handleAmountChange = (val: string) => {
    setAmount(val);
    const num = Number(val) || 0;
    setCashAmount(String(num));
    setUpiAmount("0");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && close()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Deposit</DialogTitle>
          <DialogDescription>
            Deposit back previously taken money into the business fund.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
            <span className="text-muted-foreground block font-medium">Outstanding Taken Money to Redeposit</span>
            <span className="text-base font-bold text-amber-600 dark:text-amber-400">
              ₹{Math.round(currentTakenBalance).toLocaleString("en-IN")}
            </span>
          </div>

          <Field
            label="Date"
            value={date}
            onChange={setDate}
            type="date"
          />

          <Field
            label="Deposit Amount (₹)"
            value={amount}
            onChange={handleAmountChange}
            type="number"
            inputMode="numeric"
            placeholder="e.g. 10000"
            highlight
          />

          <Select
            label="Payment Mode"
            value={method}
            onChange={(v) => {
              const m = v as "Cash" | "UPI" | "Cash & UPI";
              setMethod(m);
              if (m === "Cash & UPI") {
                setCashAmount(String(amountNum));
                setUpiAmount("0");
              }
            }}
            options={["Cash", "UPI", "Cash & UPI"]}
          />

          {method === "Cash & UPI" && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border bg-muted/20">
              <Field
                label="Cash Amount (₹)"
                value={cashAmount}
                onChange={(v) => {
                  setCashAmount(v);
                  const c = Number(v) || 0;
                  setUpiAmount(String(Math.max(0, amountNum - c)));
                }}
                type="number"
                inputMode="numeric"
                placeholder="0"
              />
              <Field
                label="UPI Amount (₹)"
                value={upiAmount}
                onChange={(v) => {
                  setUpiAmount(v);
                  const u = Number(v) || 0;
                  setCashAmount(String(Math.max(0, amountNum - u)));
                }}
                type="number"
                inputMode="numeric"
                placeholder="0"
              />
            </div>
          )}

          <Field
            label="Reason / Remarks"
            value={notes}
            onChange={setNotes}
            placeholder="e.g. Redepositing taken profit"
          />
        </div>

        <DialogFooter>
          <GhostBtn onClick={close}>Cancel</GhostBtn>
          <PrimaryBtn
            disabled={!canSubmit}
            onClick={() => {
              try {
                const txn = depositTakenMoney({
                  amount: amountNum,
                  date,
                  method,
                  cashAmount: method === "Cash & UPI" ? cashNum : undefined,
                  bankAmount: method === "Cash & UPI" ? upiNum : undefined,
                  notes: notes.trim(),
                });
                toast.success(`Deposited ₹${txn.amount.toLocaleString("en-IN")} back into business fund`);
                close();
              } catch (err) {
                toast.error("Deposit failed", {
                  description: err instanceof Error ? err.message : String(err),
                });
              }
            }}
          >
            Deposit
          </PrimaryBtn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AppDialogs() {
  return (
    <>
      <CustomerDialog />
      <LoanDialog />
      <CollectDialog />
      <ExpenseDialog />
      <InvestmentDialog />
      <WithdrawProfitDialog />
      <DepositProfitDialog />
    </>
  );
}
