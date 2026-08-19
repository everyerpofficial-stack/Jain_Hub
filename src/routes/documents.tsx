import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Eye, Download, ShieldCheck, Printer, FolderOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader } from "@/components/ui-kit";
import { useStore, type AppDocument, parseAppDate, isDateInRange } from "@/lib/store";
import { FilterBar, useDateFilter } from "@/components/FilterBar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents · Jain Finance ERP" },
      { name: "description", content: "Securely store and manage KYC and loan documents for every customer." },
    ],
  }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const documents = useStore((s) => s.documents);
  const deleteDocument = useStore((s) => s.deleteDocument);
  const currentUser = useStore((s) => s.currentUser);
  const [previewDoc, setPreviewDoc] = useState<AppDocument | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<{ customerId: string; customerName: string; documents: AppDocument[] } | null>(null);

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

  const filteredDocs = documents.filter((d) => {
    const dDate = parseAppDate(d.date);
    return isDateInRange(dDate, startDate, endDate);
  });

  const aadhaarCount = filteredDocs.filter((d) => d.type === "Aadhaar Card").length;
  const photoCount = filteredDocs.filter((d) => d.type === "Customer Photo").length;
  const invoiceCount = filteredDocs.filter((d) => d.type === "Invoice").length;
  const agreementCount = filteredDocs.filter((d) => d.type === "Loan Agreement").length;
  const panCount = filteredDocs.filter((d) => d.type === "PAN Card").length;

  const handlePrint = () => {
    const iframe = document.getElementById("invoice-iframe") as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } else {
      window.print();
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

  // Group documents by customer
  const groupedFolders = (() => {
    const map: Record<string, { customerId: string; customerName: string; documents: AppDocument[] }> = {};
    filteredDocs.forEach((d) => {
      const key = d.customerId || d.customerName;
      if (!map[key]) {
        map[key] = { customerId: d.customerId, customerName: d.customerName, documents: [] };
      }
      map[key].documents.push(d);
    });
    return Object.values(map);
  })();

  return (
    <AppShell breadcrumb="Documents">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Document Vault</h1>
          <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-success" /> {filteredDocs.length} documents · Stored in your organization's database
          </p>
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Aadhaar", count: aadhaarCount, tone: "info" as const },
          { label: "Photos", count: photoCount, tone: "info" as const },
          { label: "Invoices", count: invoiceCount, tone: "success" as const },
          { label: "Agreements", count: agreementCount, tone: "success" as const },
          { label: "PAN", count: panCount, tone: "warning" as const },
        ].map((c) => (
          <Card key={c.label} className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="size-3.5" /> {c.label}
            </div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-2xl font-semibold tracking-tight">{c.count}</div>
              <Badge tone={c.tone}>files</Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <SectionHeader title="All Customer Folders" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left font-medium px-5 py-2.5">Customer Name</th>
                <th className="text-left font-medium px-4 py-2.5">Customer ID</th>
                <th className="text-left font-medium px-4 py-2.5">KYC Documents Available</th>
                <th className="text-center font-medium px-4 py-2.5">Total Files</th>
                <th className="text-left font-medium px-4 py-2.5">Last Updated</th>
                <th className="text-right font-medium px-5 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedFolders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    No documents found. New invoices and uploaded KYC files appear here automatically when customer accounts are created.
                  </td>
                </tr>
              ) : (
                groupedFolders.map((folder) => {
                  const docTypes = Array.from(new Set(folder.documents.map((d) => d.type)));
                  const latestDate = folder.documents.reduce((latest, d) => {
                    return d.date > latest ? d.date : latest;
                  }, "");
                  return (
                    <tr
                      key={folder.customerId}
                      className="border-t border-border hover:bg-accent/40 cursor-pointer"
                      onClick={() => setSelectedFolder(folder)}
                    >
                      <td className="px-5 py-3 font-semibold text-foreground">{folder.customerName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{folder.customerId}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {docTypes.map((t) => (
                            <Badge key={t} tone={t === "Invoice" ? "success" : t === "Customer Photo" || t === "Aadhaar Card" ? "info" : "warning"}>
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-foreground">{folder.documents.length} files</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{latestDate}</td>
                      <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedFolder(folder)}
                          className="h-8 px-3 rounded-md bg-accent text-foreground text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-accent/80 transition-colors"
                        >
                          <FolderOpen className="size-3.5" /> View Folder
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Customer Documents Folder dialog (Slide) */}
      <Dialog open={!!selectedFolder} onOpenChange={(open) => !open && setSelectedFolder(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6">
          {selectedFolder && (
            <>
              <DialogHeader className="border-b border-border pb-4 mb-4">
                <DialogTitle className="text-base font-bold uppercase tracking-wider text-primary">
                  Documents Folder: {selectedFolder.customerName}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  Customer ID: {selectedFolder.customerId} · Total {selectedFolder.documents.length} files stored
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {selectedFolder.documents.map((d) => (
                  <Card key={d.id} className="p-4 flex flex-col justify-between border border-border bg-surface hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{d.type}</span>
                        <Badge tone={d.status === "Verified" ? "success" : d.status === "Signed" ? "info" : "warning"}>
                          {d.status}
                        </Badge>
                      </div>
                      <div className="text-sm font-bold text-foreground mt-2 truncate" title={d.fileName}>{d.fileName}</div>
                      <div className="text-xs text-muted-foreground mt-1">{d.fileSize} · Uploaded {d.date}</div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-t-border/50">
                      <button
                        onClick={() => setPreviewDoc(d)}
                        className="flex-1 h-8 rounded-md bg-accent text-foreground text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-accent/80"
                      >
                        <Eye className="size-3.5" /> Preview
                      </button>
                      {d.fileUrl && (
                        <a
                          href={d.fileUrl}
                          download={d.fileName}
                          className="flex-1 h-8 rounded-md border border-border text-foreground text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-accent text-center text-decoration-none"
                        >
                          <Download className="size-3.5" /> Download
                        </a>
                      )}
                      {currentUser?.role?.toLowerCase() === "admin" && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete document ${d.fileName}?`)) {
                              deleteDocument(d.id);
                              toast.success(`Deleted document ${d.fileName}`);
                              
                              const updatedDocs = selectedFolder.documents.filter(doc => doc.id !== d.id);
                              if (updatedDocs.length === 0) {
                                setSelectedFolder(null);
                              } else {
                                setSelectedFolder({
                                  ...selectedFolder,
                                  documents: updatedDocs
                                });
                              }
                            }
                          }}
                          className="size-8 rounded-md border border-border inline-flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-muted-foreground shrink-0"
                          title="Delete Document"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-6">
          {previewDoc && (
            <>
              <DialogHeader className="border-b border-border pb-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-base font-bold uppercase tracking-wider text-primary">
                      Document Preview
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {previewDoc.customerName} · {previewDoc.type} ({previewDoc.fileSize})
                    </p>
                  </div>
                  {previewDoc.type === "Invoice" && (
                    <button
                      onClick={handlePrint}
                      className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-semibold inline-flex items-center gap-1.5 hover:opacity-90 mr-6"
                    >
                      <Printer className="size-3.5" /> Print Invoice
                    </button>
                  )}
                </div>
              </DialogHeader>

              <div className="rounded-lg border border-border overflow-hidden bg-white dark:bg-zinc-950 p-2 flex items-center justify-center min-h-[300px]">
                {previewDoc.type === "Invoice" && previewDoc.fileUrl ? (
                  <iframe
                    id="invoice-iframe"
                    title="Invoice Preview"
                    srcDoc={getSrcDoc(previewDoc.fileUrl)}
                    className="w-full h-[60vh] border-0 bg-white"
                  />
                ) : previewDoc.fileUrl && previewDoc.fileUrl.startsWith("data:image/") ? (
                  <img
                    src={previewDoc.fileUrl}
                    alt={previewDoc.type}
                    className="max-h-[60vh] object-contain max-w-full rounded"
                  />
                ) : (
                  <div className="text-center py-12 text-sm text-muted-foreground flex flex-col items-center gap-3">
                    <FileText className="size-12 text-muted-foreground/60" />
                    <div>
                      <p className="font-semibold text-foreground">{previewDoc.fileName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{previewDoc.type} vault record</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
