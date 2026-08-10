// Shared mock data for the ERP
export const customers = [
  { id: "JF-1042", name: "Suresh Patil", mobile: "+91 98765 12340", village: "Shirwal", aadhaar: "XXXX-XXXX-4421", status: "Active", loan: "₹1,20,000", emi: "₹4,250", due: "21 Jun 2026" },
  { id: "JF-1041", name: "Lakshmi Bai",  mobile: "+91 98220 99812", village: "Wai",     aadhaar: "XXXX-XXXX-1190", status: "Overdue", loan: "₹65,000",   emi: "₹2,400", due: "18 Jun 2026" },
  { id: "JF-1040", name: "Ganesh Kale",  mobile: "+91 90222 30041", village: "Panchgani",aadhaar: "XXXX-XXXX-7732", status: "Active", loan: "₹2,40,000", emi: "₹8,100", due: "22 Jun 2026" },
  { id: "JF-1039", name: "Anita More",   mobile: "+91 91230 11234", village: "Mahabaleshwar", aadhaar: "XXXX-XXXX-2210", status: "Closed", loan: "₹50,000", emi: "—", due: "—" },
  { id: "JF-1038", name: "Vinod Shinde", mobile: "+91 99000 12321", village: "Satara",  aadhaar: "XXXX-XXXX-9981", status: "Active", loan: "₹1,80,000", emi: "₹6,200", due: "23 Jun 2026" },
  { id: "JF-1037", name: "Pooja Jadhav", mobile: "+91 98345 76512", village: "Karad",   aadhaar: "XXXX-XXXX-4413", status: "Defaulted", loan: "₹95,000", emi: "₹3,150", due: "10 May 2026" },
  { id: "JF-1036", name: "Mahesh Pawar", mobile: "+91 97123 88110", village: "Shirwal", aadhaar: "XXXX-XXXX-1182", status: "Active", loan: "₹75,000", emi: "₹2,700", due: "24 Jun 2026" },
];

export const recentTxns = [
  { id: "TXN-9821", name: "Suresh Patil",  village: "Shirwal",     status: "Collected", amount: "₹4,250", method: "Cash",  date: "18 Jun 2026" },
  { id: "TXN-9820", name: "Ganesh Kale",   village: "Panchgani",   status: "Collected", amount: "₹8,100", method: "UPI",   date: "18 Jun 2026" },
  { id: "TXN-9819", name: "Lakshmi Bai",   village: "Wai",         status: "Pending",   amount: "₹2,400", method: "—",     date: "18 Jun 2026" },
  { id: "TXN-9818", name: "Vinod Shinde",  village: "Satara",      status: "Collected", amount: "₹6,200", method: "UPI",   date: "17 Jun 2026" },
  { id: "TXN-9817", name: "Pooja Jadhav",  village: "Karad",       status: "Missed",    amount: "₹3,150", method: "—",     date: "17 Jun 2026" },
];

export const upcoming = [
  { name: "Mahesh Pawar", village: "Shirwal",     amount: "₹2,700", due: "Tomorrow" },
  { name: "Ganesh Kale",  village: "Panchgani",   amount: "₹8,100", due: "in 2 days" },
  { name: "Vinod Shinde", village: "Satara",      amount: "₹6,200", due: "in 3 days" },
  { name: "Suresh Patil", village: "Shirwal",     amount: "₹4,250", due: "in 4 days" },
];

export const villagePerf = [
  { name: "Shirwal",       collected: 92 },
  { name: "Panchgani",     collected: 88 },
  { name: "Wai",           collected: 71 },
  { name: "Satara",        collected: 83 },
  { name: "Karad",         collected: 64 },
  { name: "Mahabaleshwar", collected: 79 },
];

export const collectionTrend = [
  { d: "Mon", v: 42 }, { d: "Tue", v: 51 }, { d: "Wed", v: 38 },
  { d: "Thu", v: 64 }, { d: "Fri", v: 58 }, { d: "Sat", v: 72 }, { d: "Sun", v: 49 },
];

export const revenueTrend = [
  { m: "Jan", revenue: 320, expense: 180 },
  { m: "Feb", revenue: 360, expense: 195 },
  { m: "Mar", revenue: 410, expense: 210 },
  { m: "Apr", revenue: 395, expense: 220 },
  { m: "May", revenue: 470, expense: 235 },
  { m: "Jun", revenue: 512, expense: 248 },
];

export const expenses = [
  { id: "EX-301", date: "18 Jun 2026", cat: "Office Expense", desc: "Stationery & printing", amount: "₹3,240" },
  { id: "EX-300", date: "17 Jun 2026", cat: "Salary",         desc: "Collector – June payout", amount: "₹42,000" },
  { id: "EX-299", date: "16 Jun 2026", cat: "Travel",         desc: "Field visit – Wai",     amount: "₹1,180" },
  { id: "EX-298", date: "15 Jun 2026", cat: "Utilities",      desc: "Electricity bill",      amount: "₹4,720" },
  { id: "EX-297", date: "14 Jun 2026", cat: "Maintenance",    desc: "AC servicing",          amount: "₹2,500" },
];

export const investments = [
  { id: "INV-21", investor: "Mahavir Jain",    amount: "₹10,00,000", roi: "13.5%", maturity: "30 Sep 2026", status: "Active" },
  { id: "INV-20", investor: "Sunita Mehta",     amount: "₹5,00,000",  roi: "12.0%", maturity: "12 Aug 2026", status: "Active" },
  { id: "INV-19", investor: "Hitesh Doshi",     amount: "₹7,50,000",  roi: "13.0%", maturity: "01 Dec 2026", status: "Active" },
  { id: "INV-18", investor: "Anand Shah",       amount: "₹3,00,000",  roi: "11.5%", maturity: "20 Jul 2026", status: "Maturing" },
];

export const notifications = [
  { type: "EMI Due",    text: "12 customers have EMI due tomorrow",          time: "10 min ago", tone: "warning" as const },
  { type: "Payment",    text: "₹8,100 received from Ganesh Kale",            time: "1 hr ago",   tone: "success" as const },
  { type: "Loan Closed",text: "Anita More closed loan JF-1039",              time: "3 hrs ago",  tone: "info" as const },
  { type: "New Customer", text: "Mahesh Pawar added in Shirwal",             time: "Yesterday",  tone: "info" as const },
  { type: "Overdue",    text: "Pooja Jadhav missed 2 consecutive payments",  time: "Yesterday",  tone: "danger" as const },
];

export const auditLogs = [
  { ts: "18 Jun 2026 · 10:42", user: "Rajesh Jain",  action: "Logged in",            target: "Console" },
  { ts: "18 Jun 2026 · 10:48", user: "Rajesh Jain",  action: "Created customer",     target: "JF-1042 Suresh Patil" },
  { ts: "18 Jun 2026 · 11:14", user: "Priya Shah",   action: "Recorded payment",     target: "TXN-9821 · ₹4,250" },
  { ts: "18 Jun 2026 · 12:02", user: "Rajesh Jain",  action: "Updated loan",         target: "JF-1040 EMI changed" },
  { ts: "17 Jun 2026 · 18:31", user: "System",       action: "Sent WhatsApp reminder", target: "12 customers" },
];

export const roles = [
  { name: "Administrator", users: 2, perms: "All access",                       color: "danger" as const },
  { name: "Manager",       users: 4, perms: "View, add, edit, export",         color: "info" as const },
  { name: "Collector",     users: 11, perms: "View customers, record payments", color: "success" as const },
  { name: "Accountant",    users: 2, perms: "View finance, expenses, reports",  color: "warning" as const },
];
