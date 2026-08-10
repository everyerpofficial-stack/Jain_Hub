import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { L as Lock, b as ShieldCheck, f as Trash, i as Users, o as UserPlus, x as ShieldAlert } from "../_libs/lucide-react.mjs";
import { _ as useStore, i as DialogDescription, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle } from "./mobileStore-B8EWbC21.mjs";
import { a as SectionHeader, n as Badge, r as Card, t as AppShell } from "./ui-kit-iW0nuj1I.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/roles-D9N0UGNP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RolesPage() {
	const staff = useStore((s) => s.staff);
	const addStaff = useStore((s) => s.addStaff);
	const deleteStaff = useStore((s) => s.deleteStaff);
	const currentUser = useStore((s) => s.currentUser);
	const [showAddStaff, setShowAddStaff] = (0, import_react.useState)(false);
	const [staffName, setStaffName] = (0, import_react.useState)("");
	const [staffEmail, setStaffEmail] = (0, import_react.useState)("");
	const [staffRole, setStaffRole] = (0, import_react.useState)("Staff");
	const [staffAccess, setStaffAccess] = (0, import_react.useState)("Both");
	const [staffPassword, setStaffPassword] = (0, import_react.useState)("");
	const totalStaff = staff.length;
	const adminCount = staff.filter((s) => s.role.toLowerCase() === "admin").length;
	const staffCount = staff.filter((s) => s.role.toLowerCase() === "staff").length;
	const handleAddStaffSubmit = (e) => {
		e.preventDefault();
		if (!staffName.trim()) {
			toast.error("Please enter a name");
			return;
		}
		if (!staffEmail.trim() || !staffEmail.includes("@")) {
			toast.error("Please enter a valid email address");
			return;
		}
		if (staff.some((s) => s.email.toLowerCase() === staffEmail.trim().toLowerCase())) {
			toast.error("A staff member with this email already exists");
			return;
		}
		addStaff({
			name: staffName.trim(),
			email: staffEmail.trim().toLowerCase(),
			role: staffRole,
			access: staffAccess,
			password: staffPassword.trim()
		});
		toast.success(`Staff member "${staffName}" added successfully`);
		setStaffName("");
		setStaffEmail("");
		setStaffRole("Staff");
		setStaffAccess("Both");
		setStaffPassword("");
		setShowAddStaff(false);
	};
	const handleDeleteStaffClick = (id, name) => {
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
	const isAdmin = currentUser?.role?.toLowerCase() === "admin";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		breadcrumb: "Roles & Staff",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 border-b border-border pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-[26px] font-semibold tracking-tight",
				children: "Staff Directory"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-1",
				children: "Manage system access, register staff members, and control user accounts."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground font-medium uppercase tracking-wider",
								children: "Total Staff"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-2xl font-bold tracking-tight mt-1",
								children: totalStaff
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground font-medium uppercase tracking-wider",
								children: "Administrators"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-2xl font-bold tracking-tight mt-1",
								children: adminCount
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-10 rounded-lg bg-danger/10 text-danger flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "p-4 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs text-muted-foreground font-medium uppercase tracking-wider",
								children: "Staff Members"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-2xl font-bold tracking-tight mt-1",
								children: staffCount
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-10 rounded-lg bg-info/10 text-info flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5" })
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Staff Directory",
					action: isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setShowAddStaff(true),
						className: "h-8 px-3 rounded-md bg-foreground text-background text-xs font-semibold inline-flex items-center gap-1.5 hover:opacity-90 shadow",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-3.5" }), " Add Staff Member"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5" }), " Admin-only management"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-5 py-2.5",
									children: "Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5",
									children: "Email Address"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5",
									children: "Access Role"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5",
									children: "Access Module"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-left font-medium px-4 py-2.5",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "text-right font-medium px-5 py-2.5",
									children: "Actions"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: staff.map((member) => {
							const isSelf = currentUser?.id === member.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border hover:bg-accent/20 transition-colors",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-5 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "size-8 rounded-full bg-zinc-800 text-zinc-100 flex items-center justify-center text-xs font-semibold shadow-sm border border-zinc-700",
												children: member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-foreground",
												children: member.name
											}), isSelf && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												tone: "success",
												className: "ml-2 font-medium text-[9px] px-1 py-0.5",
												children: "You"
											})] })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 font-mono text-xs text-muted-foreground",
										children: member.email
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: member.role.toLowerCase() === "admin" ? "danger" : "info",
											className: "font-medium text-xs",
											children: member.role
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											tone: member.access === "Both" ? "success" : member.access === "Mobiles" ? "warning" : "info",
											className: "font-medium text-xs",
											children: member.access || "Both"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1.5 text-xs text-success font-medium",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-success" }), " Active"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-5 py-3 text-right",
										children: isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => handleDeleteStaffClick(member.id, member.name),
											disabled: isSelf,
											className: `size-8 rounded-md inline-flex items-center justify-center border transition-all ${isSelf ? "border-zinc-800 text-zinc-600 opacity-30 cursor-not-allowed" : "border-border text-danger bg-surface hover:bg-danger/10 hover:border-danger/30"}`,
											title: isSelf ? "Cannot delete your own account" : `Delete ${member.name}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, { className: "size-3.5" })
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "—"
										})
									})
								]
							}, member.id);
						}) })]
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: isAdmin && showAddStaff,
					onOpenChange: setShowAddStaff,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "max-w-md p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "border-b border-border pb-3 mb-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
								className: "text-base font-bold uppercase tracking-wider text-primary inline-flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4 text-emerald-500" }), " Register Staff Member"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs text-muted-foreground mt-1",
								children: "Add a new user to the Jain Finance staff directory."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleAddStaffSubmit,
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
										children: "Full Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										value: staffName,
										onChange: (e) => setStaffName(e.target.value),
										placeholder: "e.g. Ramesh Shah",
										className: "h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground",
										required: true
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
										children: "Email Address"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "email",
										value: staffEmail,
										onChange: (e) => setStaffEmail(e.target.value),
										placeholder: "e.g. ramesh@jainfinance.com",
										className: "h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground",
										required: true
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
										children: "Access Role"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										value: staffRole,
										onChange: (e) => setStaffRole(e.target.value),
										className: "h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground cursor-pointer",
										children: allAvailableRoles.map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: role,
											children: role
										}, role))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
										children: "Access Module"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: staffAccess,
										onChange: (e) => setStaffAccess(e.target.value),
										className: "h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground cursor-pointer",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Both",
												children: "Both (Finance & Mobiles)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Finance",
												children: "Jain Finance Only"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Mobiles",
												children: "Jain Mobiles Only"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
										children: "Password (Optional)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "password",
										value: staffPassword,
										onChange: (e) => setStaffPassword(e.target.value),
										placeholder: "e.g. Avinash@123",
										className: "h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 flex justify-end gap-2 border-t border-border pt-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setShowAddStaff(false),
										className: "h-9 px-4 rounded-md border border-border text-xs font-semibold hover:bg-accent transition-colors",
										children: "Cancel"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										className: "h-9 px-5 rounded-md bg-foreground text-background text-xs font-bold shadow hover:opacity-90 transition-opacity",
										children: "Add Staff"
									})]
								})
							]
						})]
					})
				})
			]
		})]
	});
}
//#endregion
export { RolesPage as component };
