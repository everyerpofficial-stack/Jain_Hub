import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert, ShieldCheck, Users, Trash, UserPlus, Lock } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge, Card, SectionHeader } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
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
  const deleteStaff = useStore((s) => s.deleteStaff);
  const currentUser = useStore((s) => s.currentUser);

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

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

  // Add Staff form state
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState("Staff");
  const [staffAccess, setStaffAccess] = useState<"Finance" | "Mobiles" | "Both">("Both");
  const [staffPassword, setStaffPassword] = useState("");

  // Dynamic user counters
  const totalStaff = staff.length;
  const adminCount = staff.filter((s) => s.role.toLowerCase() === "admin").length;
  const staffCount = staff.filter((s) => s.role.toLowerCase() === "staff").length;

  const handleAddStaffSubmit = (e: React.FormEvent) => {
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


    addStaff({
      name: staffName.trim(),
      email: staffEmail.trim().toLowerCase(),
      role: staffRole,
      access: staffAccess,
      password: staffPassword.trim(),
    });

    toast.success(`Staff member "${staffName}" added successfully`);
    setStaffName("");
    setStaffEmail("");
    setStaffRole("Staff");
    setStaffAccess("Both");
    setStaffPassword("");
    setShowAddStaff(false);
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
      <div className="mb-6 border-b border-border pb-4">
        <h1 className="text-[26px] font-semibold tracking-tight">Staff Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage system access, register staff members, and control user accounts.
        </p>
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
                  const initials = member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
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
                        <span className="inline-flex items-center gap-1.5 text-xs text-success font-medium">
                          <span className="size-1.5 rounded-full bg-success" /> Active
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isAdmin ? (
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
                  placeholder="e.g. Avinash@123"
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
      </div>
    </AppShell>
  );
}
