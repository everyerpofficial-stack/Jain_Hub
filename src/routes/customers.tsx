import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Download, Search, Phone, MessageCircle, Eye, X, Printer, FileText, User, MapPin, Smartphone, Landmark, ShieldCheck, History, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader, StatCard } from "@/components/ui-kit";
import { downloadExcel, useStore, type Customer, type AppDocument, REGIONS, VILLAGES, MOBILE_BRANDS, RAM_ROM_OPTIONS, INTEREST_OPTIONS, EMI_COUNT_OPTIONS, calcEmi, parseAppDate, isDateInRange } from "@/lib/store";
import { useUi } from "@/components/AppDialogs";
import { FilterBar, useDateFilter } from "@/components/FilterBar";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers · Jain Finance ERP" },
      { name: "description", content: "Mobile phone EMI finance customer master list." },
    ],
  }),
  component: CustomersPage,
});

const STATUS_TABS = ["All", "Active", "Overdue", "Defaulted", "Closed"] as const;
type StatusTab = typeof STATUS_TABS[number];

function statusTone(s: string) {
  return s === "Active" ? "success" : s === "Overdue" ? "warning" : s === "Defaulted" ? "danger" : s === "Closed" ? "neutral" : "neutral";
}

// Full detail card shown when a row is clicked
// Full detail card shown when a row is clicked (Read-Only Profile & Payment History)
function CustomerDetailPanel({ c: customer, onClose }: { c: Customer; onClose: () => void }) {
  const allPayments = useStore((s) => s.payments);
  const documents = useStore((s) => s.documents);
  const sendWhatsapp = useStore((s) => s.sendWhatsapp);
  const deleteCustomer = useStore((s) => s.deleteCustomer);
  const deleteDocument = useStore((s) => s.deleteDocument);
  const currentUser = useStore((s) => s.currentUser);
  const { openDialog } = useUi();
  
  const [previewDoc, setPreviewDoc] = useState<AppDocument | null>(null);

  const cPayments = allPayments.filter((p) => p.customerId === customer.id);
  const customerDocs = documents.filter((d) => d.customerId === customer.id);

  const handlePrintInvoice = (doc: AppDocument) => {
    if (!doc.fileUrl) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      try {
        const decoded = decodeURIComponent(doc.fileUrl.replace("data:text/html;charset=utf-8,", ""));
        printWindow.document.write(decoded);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      } catch (err) {
        toast.error("Failed to print invoice");
      }
    }
  };

  const getSrcDoc = (url?: string) => {
    if (!url) return "";
    try {
      return decodeURIComponent(url.replace("data:text/html;charset=utf-8,", ""));
    } catch {
      return "";
    }
  };

  const formatInr = (num?: number) => {
    return "₹" + Math.round(num || 0).toLocaleString("en-IN");
  };

  const paidAmount = (customer.paidEmis || 0) * (customer.perMonthEmi || 0);
  const progressPercent = (customer.noOfEmi || 0) > 0 ? Math.round(((customer.paidEmis || 0) / customer.noOfEmi) * 100) : 0;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 rounded-xl border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border bg-foreground text-background">
          <div>
            <div className="text-xs opacity-60 font-mono tracking-wider uppercase mb-1">
              Customer Profile Folder · {customer.id}
            </div>
            <DialogTitle className="text-2xl font-bold mt-0.5 text-background flex items-center gap-3">
              {customer.firstName} {customer.surname}
              <Badge tone={customer.status === "Active" ? "success" : customer.status === "Overdue" ? "warning" : customer.status === "Defaulted" ? "danger" : "neutral"}>
                {customer.status}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs opacity-75 mt-1 text-background/85">
              Account created on {customer.billDate} · Son/Daughter of {customer.fatherName}
            </DialogDescription>
          </div>
          <button onClick={onClose} className="size-8 rounded-full border border-white/20 grid place-items-center hover:bg-white/10 transition-colors text-background">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 bg-background/50">
          {/* Main 3-column Grid for Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Personal & Guarantor info */}
            <Card className="p-5 flex flex-col justify-between border border-border/60 bg-surface">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-2">
                  <User className="size-4 text-primary" /> Personal & Contact Info
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Customer Name</div>
                    <div className="text-sm font-semibold text-foreground mt-0.5">{customer.firstName} {customer.surname}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Father's Name</div>
                    <div className="text-sm font-semibold text-foreground mt-0.5">{customer.fatherName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Mobile No</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-mono font-semibold text-foreground">{customer.mobile}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => toast.message(`Calling ${customer.name}`, { description: customer.mobile })}
                          className="size-7 rounded-md border border-border grid place-items-center hover:bg-accent text-foreground transition-colors"
                          title="Call Customer"
                        >
                          <Phone className="size-3.5" />
                        </button>
                        <button
                          onClick={() => { sendWhatsapp({ to: customer.mobile, kind: "General" }); toast.success(`WhatsApp chat opened for ${customer.name}`); }}
                          className="size-7 rounded-md border border-border grid place-items-center hover:bg-accent text-foreground transition-colors"
                          title="WhatsApp Message"
                        >
                          <MessageCircle className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Aadhaar Card No</div>
                    <div className="text-sm font-mono font-semibold text-foreground mt-0.5">
                      {customer.aadhaar
                        ? "XXXX-XXXX-" + String(customer.aadhaar).replace(/\D/g, "").slice(-4)
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Address & Location</div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-foreground mt-0.5">
                      <MapPin className="size-3.5 text-muted-foreground" />
                      {customer.village}, {customer.region}
                    </div>
                  </div>
                </div>
              </div>

              {customer.guarantyName && (
                <div className="mt-6 pt-5 border-t border-dashed border-border space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-success" /> Guarantor Details
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Guarantor Name</div>
                    <div className="text-sm font-semibold text-foreground mt-0.5">{customer.guarantyName}</div>
                  </div>
                  {customer.guarantyMobile && (
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">Guarantor Mobile</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-mono font-semibold text-foreground">{customer.guarantyMobile}</span>
                        <button
                          onClick={() => toast.message(`Calling guarantor ${customer.guarantyName}`, { description: customer.guarantyMobile })}
                          className="size-7 rounded-md border border-border grid place-items-center hover:bg-accent text-foreground transition-colors"
                          title="Call Guarantor"
                        >
                          <Phone className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Column 2: Device Details */}
            <Card className="p-5 space-y-4 border border-border/60 bg-surface">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-2">
                <Smartphone className="size-4 text-primary" /> Purchase & Mobile Details
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Mobile Brand & Model</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">{customer.mobileBrand} {customer.mobileModel}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">RAM / ROM Configuration</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">{customer.ramRom}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">IMEI Number 1</div>
                  <div className="text-sm font-mono font-semibold text-foreground mt-0.5 bg-muted/30 px-2 py-1 rounded border border-border/40 inline-block text-xs">{customer.imei1 || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">IMEI Number 2</div>
                  <div className="text-sm font-mono font-semibold text-foreground mt-0.5 bg-muted/30 px-2 py-1 rounded border border-border/40 inline-block text-xs">{customer.imei2 || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Bill Date</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">{customer.billDate}</div>
                </div>
              </div>
            </Card>

            {/* Column 3: Financial Summary */}
            <Card className="p-5 space-y-4 border border-border/60 bg-surface">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-2">
                <Landmark className="size-4 text-primary" /> Finance & EMI Summary
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-border/40">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Selling Price</div>
                    <div className="text-base font-bold text-foreground mt-0.5">{formatInr(customer.price)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Down Payment</div>
                    <div className="text-base font-bold text-danger mt-0.5">{formatInr(customer.deposit)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-1 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Principal Loan:</span>
                    <span className="font-semibold text-foreground text-sm">{formatInr(customer.balanceForEmi)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">File Charge (10%):</span>
                    <span className="font-semibold text-foreground text-sm">{formatInr(customer.fileCharge)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Interest Rate:</span>
                    <span className="font-semibold text-foreground text-sm">{customer.interestRate}% / month</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Total Interest:</span>
                    <span className="font-semibold text-foreground text-sm">{formatInr(customer.totalInterest)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between bg-success/5 p-2 rounded border border-success/10">
                    <div>
                      <div className="text-[10px] text-success font-bold uppercase tracking-wider">Per Month EMI</div>
                      <div className="text-lg font-black text-success">{formatInr(customer.perMonthEmi)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">EMI Start Date</div>
                      <div className="text-xs font-semibold text-foreground">{customer.emiDate}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Instalment Progress:</span>
                    <span className="font-semibold text-foreground">{customer.paidEmis} / {customer.noOfEmi} Paid</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="bg-success h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                  </div>
                  {customer.missedEmis !== undefined && customer.missedEmis > 0 && (
                    <div className="flex justify-between text-xs text-danger font-medium pt-1">
                      <span>Missed Instalments:</span>
                      <span>{customer.missedEmis} Missed</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-border/40">
                  <div>
                    <span className="text-muted-foreground block">Total Collected:</span>
                    <span className="font-bold text-success text-sm">{formatInr(paidAmount)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Outstanding Balance:</span>
                    <span className="font-bold text-warning text-sm">{formatInr(customer.pendingAmount)}</span>
                  </div>
                </div>
                {customer.pendingEmis > 0 && (
                  <button
                    onClick={() => {
                      openDialog("collect", { customerId: customer.id });
                    }}
                    className="w-full mt-4 h-9 rounded-md bg-success text-white text-xs font-bold hover:bg-success/90 transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    Collect EMI Payment
                  </button>
                )}
              </div>
            </Card>
          </div>

          {/* Documents Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-2">
              <FileText className="size-4 text-primary" /> KYC Documents & Invoices ({customerDocs.length})
            </h3>
            {customerDocs.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground bg-surface border border-border/50 rounded-lg">
                No KYC documents uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {customerDocs.map((doc) => (
                  <Card key={doc.id} className="p-4 flex flex-col justify-between border border-border/60 bg-surface hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge tone={doc.type === "Invoice" ? "success" : "info"}>{doc.type}</Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">{doc.fileSize}</span>
                      </div>
                      <div className="text-xs font-bold text-foreground mt-2 truncate" title={doc.fileName}>{doc.fileName}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Uploaded on {doc.date}</div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-t-border/40">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="flex-1 h-7 rounded bg-accent text-foreground text-xs font-semibold inline-flex items-center justify-center gap-1 hover:bg-accent/80 transition-colors"
                      >
                        <Eye className="size-3" /> View
                      </button>
                      {doc.type === "Invoice" && (
                        <button
                          onClick={() => handlePrintInvoice(doc)}
                          className="flex-1 h-7 rounded bg-foreground text-background text-xs font-semibold inline-flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
                        >
                          <Printer className="size-3" /> Print
                        </button>
                      )}
                      {currentUser?.role?.toLowerCase() === "admin" && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete document ${doc.fileName}?`)) {
                              deleteDocument(doc.id);
                              toast.success(`Deleted document ${doc.fileName}`);
                            }
                          }}
                          className="size-7 rounded border border-border inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-muted-foreground shrink-0"
                          title="Delete Document"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Payment History Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-2">
              <History className="size-4 text-primary" /> Instalment Payment History ({cPayments.length})
            </h3>
            {cPayments.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground bg-surface border border-border/50 rounded-lg">
                No instalments collected for this customer yet.
              </div>
            ) : (
              <div className="overflow-hidden border border-border/60 rounded-lg bg-surface">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-muted-foreground uppercase border-b border-border bg-muted/20">
                      <th className="py-2.5 px-4 font-semibold">Transaction ID</th>
                      <th className="py-2.5 px-4 font-semibold">Payment Date</th>
                      <th className="py-2.5 px-4 font-semibold">Collector</th>
                      <th className="py-2.5 px-4 font-semibold">Method</th>
                      <th className="py-2.5 px-4 font-semibold">Remarks</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cPayments.map((p) => (
                      <tr key={p.id} className="border-b border-border hover:bg-accent/35 last:border-0 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-medium text-foreground">{p.id}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">{p.date}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">{p.collector}</td>
                        <td className="py-2.5 px-4">
                          <Badge tone="info">{p.method}</Badge>
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground italic truncate max-w-[150px]" title={p.remarks}>{p.remarks || "—"}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-success">{p.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface flex justify-between gap-2">
          {currentUser?.role?.toLowerCase() === "admin" && (
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${customer.name}? This will also delete all associated loans, payments, and documents.`)) {
                  deleteCustomer(customer.id);
                  toast.success(`Deleted customer ${customer.name}`);
                  onClose();
                }
              }}
              className="h-9 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors"
            >
              Delete Customer
            </button>
          )}
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-md border border-border bg-surface text-sm font-semibold hover:bg-accent transition-colors ml-auto"
          >
            Close Profile
          </button>
        </div>
      </DialogContent>

      {/* Embedded Document Preview Modal */}
      {previewDoc && (
        <Dialog open={true} onOpenChange={(open) => !open && setPreviewDoc(null)}>
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6 z-[70]">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <DialogTitle className="text-base font-bold uppercase tracking-wider text-primary">
                  Document Preview
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {previewDoc.customerName} · {previewDoc.type} ({previewDoc.fileSize})
                </p>
              </div>
              <div className="flex gap-2">
                {previewDoc.type === "Invoice" && (
                  <button
                    onClick={() => handlePrintInvoice(previewDoc)}
                    className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-semibold inline-flex items-center gap-1.5 hover:opacity-90 mr-6"
                  >
                    <Printer className="size-3.5" /> Print
                  </button>
                )}
                <button onClick={() => setPreviewDoc(null)} className="size-8 rounded-full border border-border grid place-items-center hover:bg-accent transition-colors">
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden bg-white dark:bg-zinc-950 p-2 flex items-center justify-center min-h-[300px]">
              {previewDoc.type === "Invoice" && previewDoc.fileUrl ? (
                <iframe
                  title="Invoice Preview"
                  srcDoc={getSrcDoc(previewDoc.fileUrl)}
                  className="w-full h-[60vh] border-0 bg-white"
                />
              ) : (previewDoc.fileUrl?.startsWith("data:image/") || previewDoc.driveUrl) ? (
                // Falls back to the Drive copy so a scan uploaded on the shop's
                // other device still opens here.
                <img
                  src={previewDoc.fileUrl || previewDoc.driveUrl}
                  alt={previewDoc.type}
                  className="max-h-[60vh] object-contain max-w-full rounded"
                />
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground flex flex-col items-center gap-3">
                  <FileText className="size-12 text-muted-foreground/60" />
                  <div>
                    <p className="font-semibold text-foreground">{previewDoc.fileName}</p>
                    <p className="text-xs text-muted-foreground mt-1">{previewDoc.type} vault record</p>
                    {!previewDoc.fileUrl && !previewDoc.driveUrl && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 max-w-xs">
                        Uploaded on another device before files were stored in Drive — only its
                        record syncs. Re-upload it to make it available everywhere.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

function CustomersPage() {
  const customers = useStore((s) => s.customers);
  const { openDialog } = useUi();
  const sendWhatsapp = useStore((s) => s.sendWhatsapp);
  const deleteCustomer = useStore((s) => s.deleteCustomer);
  const currentUser = useStore((s) => s.currentUser);

  const [q, setQ] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("All");
  const [selected, setSelected] = useState<Customer | null>(null);

  const {
    preset: filterPreset,
    setPreset: setFilterPreset,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    startDate,
    endDate,
  } = useDateFilter();

  const filtered = customers.filter((c) => {
    if (statusTab !== "All" && c.status !== statusTab) return false;
    const cDate = parseAppDate(c.billDate);
    if (!isDateInRange(cDate, startDate, endDate)) return false;
    if (q) {
      const n = q.toLowerCase();
      // Mobile and Aadhaar come back from Google Sheets as NUMBERS, and
      // .toLowerCase() on a number throws — searching used to blank the page.
      return [c.name, c.id, c.mobile, c.village, c.mobileBrand, c.mobileModel, c.aadhaar].some(
        (v) => String(v ?? "").toLowerCase().includes(n)
      );
    }
    return true;
  });

  const totalPending = filtered.reduce((s, c) => s + (c.pendingAmount || 0), 0);
  const totalCollected = filtered.reduce((s, c) => s + ((c.paidEmis || 0) * (c.perMonthEmi || 0)), 0);
  const overdue = filtered.filter((c) => c.status === "Overdue" || c.status === "Defaulted").length;

  return (
    <AppShell breadcrumb="Customers">
      {selected && <CustomerDetailPanel c={selected} onClose={() => setSelected(null)} />}

      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Master Customer List</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} customers · ₹{(totalPending || 0).toLocaleString("en-IN")} pending
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              downloadExcel("customers.xlsx", "Customers", filtered.map((c) => ({
                ID: c.id, Name: c.name, Father: c.fatherName, Mobile: c.mobile, Village: c.village,
                Brand: c.mobileBrand, Model: c.mobileModel, Price: c.price,
                "Monthly EMI": c.perMonthEmi, "No of EMI": c.noOfEmi,
                "Paid EMIs": c.paidEmis, "Pending EMIs": c.pendingEmis,
                "Pending Amount": c.pendingAmount, "EMI Date": c.emiDate, Status: c.status,
              })));
              toast.success(`Exported ${filtered.length} customers`);
            }}
            className="h-9 px-3 rounded-md border border-border bg-surface text-sm inline-flex items-center gap-1.5 hover:bg-accent font-semibold transition-colors shadow-sm"
          >
            <Download className="size-3.5" /> Export
          </button>
          <button
            onClick={() => openDialog("customer")}
            className="h-9 px-4 rounded-md bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow transition-opacity"
          >
            <Plus className="size-3.5" /> New Customer
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        preset={filterPreset}
        onChangePreset={setFilterPreset}
        customStart={customStart}
        onChangeStart={setCustomStart}
        customEnd={customEnd}
        onChangeEnd={setCustomEnd}
        startDate={startDate}
        endDate={endDate}
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Customers" value={filtered.length.toString()} sub="In selected period" />
        <StatCard label="Active" value={filtered.filter((c) => c.status === "Active").length.toString()} sub="On track" trend="up" />
        <StatCard label="Overdue / Defaulted" value={overdue.toString()} sub="Need follow-up" trend={overdue > 0 ? "down" : undefined} />
        <StatCard label="Total Collected" value={`₹${Math.round(totalCollected / 1000)}K`} sub="In selected period" trend="up" />
      </div>

      <Card>
        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, ID, mobile, brand, village…"
              className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setStatusTab(t)}
              className={`h-9 px-3 rounded-md border text-sm transition-colors ${
                statusTab === t ? "bg-foreground text-background border-foreground" : "border-border bg-surface hover:bg-accent"
              }`}
            >
              {t}
              {t !== "All" && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  {customers.filter((c) => c.status === t).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <SectionHeader
          title={`${filtered.length} customer${filtered.length !== 1 ? "s" : ""}`}
          action={<span className="text-xs text-muted-foreground">Click any row to view full details</span>}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed min-w-[1400px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left font-medium px-5 py-2.5 w-[80px]">ID</th>
                <th className="text-left font-medium px-4 py-2.5 w-[180px]">Customer Name</th>
                <th className="text-left font-medium px-4 py-2.5 w-[120px]">Mobile No</th>
                <th className="text-left font-medium px-4 py-2.5 w-[110px]">Village</th>
                <th className="text-left font-medium px-4 py-2.5 w-[170px]">Mobile (Brand · Model)</th>
                <th className="text-right font-medium px-4 py-2.5 w-[100px]">Price</th>
                <th className="text-right font-medium px-4 py-2.5 w-[110px]">Monthly EMI</th>
                <th className="text-center font-medium px-4 py-2.5 w-[70px]">EMI</th>
                <th className="text-left font-medium px-4 py-2.5 w-[100px]">EMI Date</th>
                <th className="text-right font-medium px-4 py-2.5 w-[120px]">Pending Amt</th>
                <th className="text-left font-medium px-4 py-2.5 w-[120px]">Status</th>
                <th className="text-right font-medium px-5 py-2.5 w-[220px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={12} className="px-5 py-12 text-center text-muted-foreground">No customers match.</td></tr>
              ) : filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-border hover:bg-accent/40 cursor-pointer"
                  onClick={() => setSelected(c)}
                >
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground w-[80px] truncate">{c.id}</td>
                  <td className="px-4 py-3 w-[180px]">
                    <div className="font-medium truncate">{c.firstName} {c.surname}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.fatherName}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground w-[120px] truncate">{c.mobile}</td>
                  <td className="px-4 py-3 text-muted-foreground w-[110px] truncate">{c.village}</td>
                  <td className="px-4 py-3 w-[170px]">
                    <div className="font-medium truncate">{c.mobileModel}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.mobileBrand} · {c.ramRom}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium w-[100px] truncate">₹{(c.price ?? 0).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right font-semibold w-[110px] truncate">₹{(c.perMonthEmi ?? 0).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-center w-[70px]">
                    <span className="text-xs">{c.paidEmis ?? 0}/{c.noOfEmi ?? 0}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs w-[100px] truncate">{c.emiDate}</td>
                  <td className={`px-4 py-3 text-right font-medium w-[120px] truncate ${(c.pendingEmis ?? 0) > 0 ? "text-warning" : "text-success"}`}>
                    {(c.pendingEmis ?? 0) > 0 ? `₹${(c.pendingAmount ?? 0).toLocaleString("en-IN")}` : "Closed"}
                  </td>
                  <td className="px-4 py-3 w-[120px]">
                    <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                    {c.missedEmis !== undefined && c.missedEmis > 0 && (
                      <div className="text-[10px] text-danger font-semibold mt-0.5 whitespace-nowrap">
                        {c.missedEmis} missed
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right w-[220px]" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex gap-1">
                      {(c.pendingEmis ?? 0) > 0 && (
                        <button
                          title="Collect Payment"
                          onClick={() => openDialog("collect", { customerId: c.id })}
                          className="h-8 px-2.5 rounded-md bg-success/10 text-success border border-success/20 text-xs font-bold hover:bg-success/20 transition-all duration-200 shadow-sm"
                        >
                          Collect
                        </button>
                      )}
                      <button
                        title="View details"
                        onClick={() => setSelected(c)}
                        className="size-8 rounded-md border border-primary/10 bg-primary/5 text-primary grid place-items-center hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm"
                      >
                        <Eye className="size-3.5" />
                      </button>
                      <button
                        title="WhatsApp reminder"
                        onClick={() => { sendWhatsapp({ to: c.mobile, kind: "EMI Reminder" }); toast.success(`Reminder sent to ${c.name}`); }}
                        className="size-8 rounded-md border border-success/10 bg-success/5 text-success grid place-items-center hover:bg-success hover:text-white transition-all duration-200 shadow-sm"
                      >
                        <MessageCircle className="size-3.5" />
                      </button>
                      <button
                        title="Call"
                        onClick={() => toast.message(`Calling ${c.name}`, { description: c.mobile })}
                        className="size-8 rounded-md border border-info/10 bg-info/5 text-info grid place-items-center hover:bg-info hover:text-white transition-all duration-200 shadow-sm"
                      >
                        <Phone className="size-3.5" />
                      </button>
                      {currentUser?.role?.toLowerCase() === "admin" && (
                        <button
                          title="Delete customer"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${c.name}? This will also delete all associated loans, payments, and documents.`)) {
                              deleteCustomer(c.id);
                              toast.success(`Deleted customer ${c.name}`);
                            }
                          }}
                          className="size-8 rounded-md border border-destructive/10 bg-destructive/5 text-destructive grid place-items-center hover:bg-destructive hover:text-white transition-all duration-200 shadow-sm"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div className="px-5 py-3 border-t border-border flex flex-wrap gap-6 text-xs text-muted-foreground bg-muted/20">
          <span>Showing {filtered.length} of {customers.length}</span>
          <span>Total Pending: <strong className="text-warning">₹{filtered.reduce((s, c) => s + (c.pendingAmount || 0), 0).toLocaleString("en-IN")}</strong></span>
          <span>Total EMI Value: <strong>₹{filtered.reduce((s, c) => s + (c.totalEmiAmount || 0), 0).toLocaleString("en-IN")}</strong></span>
        </div>
      </Card>
    </AppShell>
  );
}
