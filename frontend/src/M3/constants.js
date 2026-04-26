export const USER_ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
  TECHNICIAN: "TECHNICIAN",
};

export const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
export const PRIORITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const CATEGORIES = ["Electrical", "Network", "Hardware", "Plumbing", "Access Control"];
export const RESOURCE_LOCATIONS = [
  "Engineering Faculty - Lab 2",
  "Library - Level 3",
  "Administration Block - Office 12",
  "Hostel B - Common Area",
  "Lecture Hall Complex - Room 204",
];

export const DEMO_PROFILES = {
  USER: {
    id: "user-100",
    name: "Nethmi Perera",
    email: "nethmi.perera@campus.edu",
    phone: "+94 77 123 4567",
    department: "Engineering Student Affairs",
  },
  ADMIN: {
    id: "admin-200",
    name: "Ayesha Fernando",
    email: "ayesha.fernando@campus.edu",
    phone: "+94 71 555 8800",
    department: "Campus Operations Command",
  },
  TECHNICIAN: {
    id: "tech-300",
    name: "Ishan Silva",
    email: "ishan.silva@campus.edu",
    phone: "+94 76 998 2211",
    department: "Field Maintenance Unit",
  },
};
