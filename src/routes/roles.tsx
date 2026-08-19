import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert, ShieldCheck, Users, Trash, UserPlus, Lock, RefreshCw, Edit } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader } from "@/components/ui-kit";
import { useStore, type Staff } from "@/lib/store";
import { triggerManualSync } from "@/lib/useRealtimeSync";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Roles & Staff · Jain Finance ERP" },
      { name: "description", content: "Manage staff directory, roles, permissions and access control across the ERP." },
    ],
  }),
  component: RolesPage,
});

function RolesPage() {
  const staff = useStore((s) => s.staff);
  const addStaff = useStore((s) => s.addStaff);
  const updateStaff = useStore((s) => s.updateStaff);
  const deleteStaff = useStore((s) => s.deleteStaff);
  const currentUser = useStore((s) => s.currentUser);

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  const [isSyncing, setIsSyncing] = useState(false);

  // Add Staff form state
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState("Staff");
  const [staffAccess, setStaffAccess] = useState<"Finance" | "Mobiles" | "Both">("Both");
  const [staffPassword, setStaffPassword] = useState("");

  // Edit Staff form state
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("Staff");
  const [editAccess, setEditAccess] = useState<"Finance" | "Mobiles" | "Both">("Both");
  const [editPassword, setEditPassword] = useState("");
  const [editStatus, setEditStatus] = useState<"Active" | "Inactive">("Active");

  // Route-level guard: non-admins cannot access this page even by direct URL
  if (!isAdmin) {
    return (
      <AppShell breadcrumb="Roles & Staff">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="size-16 rounded-full bg-danger/10 text-danger flex items-center justify-center">
            <Lock className="size-7" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Staff management is restricted to Administrators only. Contact your admin for access.
          </p>
        </div>
      </AppShell>
    );
  }

  // Dynamic user counters
  const totalStaff = staff.length;
  const adminCount = staff.filter((s) => String(s.role || "").toLowerCase() === "admin").length;
  const staffCount = staff.filter((s) => String(s.role || "").toLowerCase() === "staff").length;

  const handleManualRefresh = async () => {
    setIsSyncing(true);
    toast.info("Syncing staff directory with Google Sheets...");
    try {
      const ok = await triggerManualSync(true);
      if (ok) {
        toast.success("Staff directory up to date");
      } else {
        toast.error("Could not sync with Google Sheets. Using local directory.");
      }
    } catch {
      toast.error("Failed to refresh staff directory");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (!staffEmail.trim() || !staffEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    // Check duplicate email
    if (staff.some((s) => s.email.toLowerCase() === staffEmail.trim().toLowerCase())) {
      toast.error("A staff member with this email already exists");
      return;
    }

    try {
      await addStaff({
        name: staffName.trim(),
        email: staffEmail.trim().toLowerCase(),
        role: staffRole,
        access: staffAccess,
        password: staffPassword.trim(),
      });
      toast.success(`Staff member "${staffName}" added & synced successfully`);
      setStaffName("");
      setStaffEmail("");
      setStaffRole("Staff");
      setStaffAccess("Both");
      setStaffPassword("");
      setShowAddStaff(false);
    } catch (err) {
      toast.error("Failed to add staff member");
    }
  };

  const handleEditStaffClick = (member: Staff) => {
    setEditingStaff(member);
    setEditName(member.name);
    setEditEmail(member.email);
    setEditRole(member.role);
    setEditAccess(member.access || "Both");
    // Never pre-fill an existing password — it's hashed (or, for a
    // not-yet-migrated legacy account, still plaintext but shouldn't be
    // echoed back either way). Left blank, submitting keeps it unchanged.
    setEditPassword("");
    setEditStatus(member.status || "Active");
  };

  const handleEditStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    if (!editName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (!editEmail.trim() || !editEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check duplicate email against other staff members
    if (staff.some((s) => s.id !== editingStaff.id && s.email.toLowerCase() === editEmail.trim().toLowerCase())) {
      toast.error("Another staff member with this email already exists");
      return;
    }

    try {
      await updateStaff(editingStaff.id, {
        name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        role: editRole,
        access: editAccess,
        password: editPassword.trim(),
        status: editStatus,
      });
      toast.success(`Staff member "${editName}" updated & synced`);
      setEditingStaff(null);
    } catch (err) {
      toast.error("Failed to update staff member");
    }
  };

  const handleDeleteStaffClick = (id: string, name: string) => {
    if (currentUser && currentUser.id === id) {
      toast.error("Action Blocked", { description: "You cannot delete your own logged-in account." });
      return;
    }
    if (confirm(`Are you sure you want to delete staff member "${name}"?`)) {
      deleteStaff(id);
      toast.success(`Staff member "${name}" removed`);
    }
  };

  const allAvailableRoles = ["Admin", "Staff"];

  return (
    <AppShell breadcrumb="Roles & Staff">
      {/* Header */}
      <div className="mb-6 border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Staff Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage system access, register staff members, and control user accounts across devices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isSyncing}
            className="h-9 px-3.5 rounded-md border border-border text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-accent transition-colors shadow-sm disabled:opacity-50"
            title="Refresh staff directory from Google Sheets"
          >
            <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Directory"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Staff Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Staff</div>
              <div className="text-2xl font-bold tracking-tight mt-1">{totalStaff}</div>
            </div>
            <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Users className="size-5" />
            </div>
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Administrators</div>
              <div className="text-2xl font-bold tracking-tight mt-1">{adminCount}</div>
            </div>
            <div className="size-10 rounded-lg bg-danger/10 text-danger flex items-center justify-center">
              <ShieldAlert className="size-5" />
            </div>
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Staff Members</div>
              <div className="text-2xl font-bold tracking-tight mt-1">{staffCount}</div>
            </div>
            <div className="size-10 rounded-lg bg-info/10 text-info flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
          </Card>
        </div>

        {/* Staff Table Section */}
        <Card>
          <SectionHeader
            title="Staff Directory"
            action={
              isAdmin ? (
                <button
                  onClick={() => setShowAddStaff(true)}
                  className="h-8 px-3 rounded-md bg-foreground text-background text-xs font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow"
                >
                  <UserPlus className="size-3.5" /> Add Staff Member
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3.5" /> Admin-only management
                </span>
              )
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10">
                  <th className="text-left font-medium px-5 py-2.5">Name</th>
                  <th className="text-left font-medium px-4 py-2.5">Email Address</th>
                  <th className="text-left font-medium px-4 py-2.5">Access Role</th>
                  <th className="text-left font-medium px-4 py-2.5">Access Module</th>
                  <th className="text-left font-medium px-4 py-2.5">Status</th>
                  <th className="text-right font-medium px-5 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => {
                  const isSelf = currentUser?.id === member.id;
                  // The seed account (ST-001) is the built-in system admin —
                  // fixed and not editable/deletable from this UI, so there's
                  // always a guaranteed way back in even if every other
                  // staff record is misconfigured or removed.
                  const isFixedAdmin = member.id === "ST-001";
                  const initials = String(member.name || "").split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
                  return (
                    <tr key={member.id} className="border-t border-border hover:bg-accent/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-zinc-800 text-zinc-100 flex items-center justify-center text-xs font-semibold shadow-sm border border-zinc-700">
                            {initials}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">{member.name}</span>
                            {isSelf && <Badge tone="success" className="ml-2 font-medium text-[9px] px-1 py-0.5">You</Badge>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{member.email}</td>
                      <td className="px-4 py-3">
                        <Badge tone={member.role.toLowerCase() === "admin" ? "danger" : "info"} className="font-medium text-xs">
                          {member.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={member.access === "Both" ? "success" : member.access === "Mobiles" ? "warning" : "info"} className="font-medium text-xs">
                          {member.access || "Both"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${member.status === "Inactive" ? "text-muted-foreground" : "text-success"}`}>
                          <span className={`size-1.5 rounded-full ${member.status === "Inactive" ? "bg-muted-foreground" : "bg-success"}`} /> {member.status || "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isFixedAdmin ? (
                          <div className="inline-flex items-center gap-1.5 justify-end text-muted-foreground" title="Built-in system account — protected, not editable from this screen">
                            <Lock className="size-3.5" />
                            <span className="text-xs font-medium">Protected</span>
                          </div>
                        ) : isAdmin ? (
                          <div className="inline-flex items-center gap-1 justify-end">
                            <button
                              onClick={() => handleEditStaffClick(member)}
                              className="size-8 rounded-md inline-flex items-center justify-center border border-border text-foreground bg-surface hover:bg-accent transition-all"
                              title={`Edit ${member.name}`}
                            >
                              <Edit className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStaffClick(member.id, member.name)}
                              disabled={isSelf}
                              className={`size-8 rounded-md inline-flex items-center justify-center border transition-all ${
                                isSelf
                                  ? "border-zinc-800 text-zinc-600 opacity-30 cursor-not-allowed"
                                  : "border-border text-danger bg-surface hover:bg-danger/10 hover:border-danger/30"
                              }`}
                              title={isSelf ? "Cannot delete your own account" : `Delete ${member.name}`}
                            >
                              <Trash className="size-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add Staff Dialog — only shown for admins */}
        <Dialog open={isAdmin && showAddStaff} onOpenChange={setShowAddStaff}>
          <DialogContent className="max-w-md p-6">
            <DialogHeader className="border-b border-border pb-3 mb-4">
              <DialogTitle className="text-base font-bold uppercase tracking-wider text-primary inline-flex items-center gap-1.5">
                <UserPlus className="size-4 text-emerald-500" /> Register Staff Member
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Add a new user to the Jain Finance staff directory.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStaffSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Ramesh Shah"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="e.g. ramesh@jainfinance.com"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Access Role</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground cursor-pointer"
                >
                  {allAvailableRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Access Module</label>
                <select
                  value={staffAccess}
                  onChange={(e) => setStaffAccess(e.target.value as "Finance" | "Mobiles" | "Both")}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground cursor-pointer"
                >
                  <option value="Both">Both (Finance & Mobiles)</option>
                  <option value="Finance">Jain Finance Only</option>
                  <option value="Mobiles">Jain Mobiles Only</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password (Optional)</label>
                <input
                  type="password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="Leave blank for OTP-only sign in"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground"
                />
              </div>
              <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddStaff(false)}
                  className="h-9 px-4 rounded-md border border-border text-xs font-semibold hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-md bg-foreground text-background text-xs font-bold shadow hover:opacity-90 transition-opacity"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Staff Dialog */}
        <Dialog open={Boolean(editingStaff)} onOpenChange={(open) => !open && setEditingStaff(null)}>
          <DialogContent className="max-w-md p-6">
            <DialogHeader className="border-b border-border pb-3 mb-4">
              <DialogTitle className="text-base font-bold uppercase tracking-wider text-primary inline-flex items-center gap-1.5">
                <Edit className="size-4 text-blue-500" /> Edit Staff Member
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Update account details, role permissions, or password for {editingStaff?.name}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditStaffSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Access Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground cursor-pointer"
                >
                  {allAvailableRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Access Module</label>
                <select
                  value={editAccess}
                  onChange={(e) => setEditAccess(e.target.value as "Finance" | "Mobiles" | "Both")}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground cursor-pointer"
                >
                  <option value="Both">Both (Finance & Mobiles)</option>
                  <option value="Finance">Jain Finance Only</option>
                  <option value="Mobiles">Jain Mobiles Only</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as "Active" | "Inactive")}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Set new password or leave as is"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground"
                />
              </div>
              <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="h-9 px-4 rounded-md border border-border text-xs font-semibold hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-md bg-foreground text-background text-xs font-bold shadow hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
