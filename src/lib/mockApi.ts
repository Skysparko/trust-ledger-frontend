export type SignupPayload = {
  type: "individual" | "business";
  name: string;
  email: string;
  password: string;
};

export async function mockDelay(min = 250, max = 700) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((res) => setTimeout(res, ms));
}

export async function login(email: string, _password: string) {
  await mockDelay();
  return {
    id: "u_" + Math.random().toString(36).slice(2, 8),
    type: "individual" as const,
    email,
    name: email.split("@")[0],
  };
}

export async function signup(payload: SignupPayload) {
  await mockDelay();
  return {
    id: "u_" + Math.random().toString(36).slice(2, 8),
    type: payload.type,
    email: payload.email,
    name: payload.name,
  } as const;
}

export type MockInvestment = {
  issuance: string;
  date: string;
  amount: number;
  status: "pending" | "confirmed";
  bonds?: number;
  documentUrl?: string;
};

export async function getInvestments(): Promise<MockInvestment[]> {
  await mockDelay();
  return [
    {
      issuance: "Windpark Noordoostpolder",
      date: new Date().toISOString(),
      amount: 2500,
      bonds: 25,
      status: "confirmed",
      documentUrl: "/docs/sample.pdf",
    },
    {
      issuance: "Zonnepark Zeeland",
      date: new Date(Date.now() - 86400000 * 7).toISOString(),
      amount: 1000,
      bonds: 10,
      status: "pending",
    },
  ];
}

// Admin authentication
export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
};

export async function adminLogin(email: string, password: string): Promise<AdminUser> {
  await mockDelay();
  // Mock admin credentials
  if (email === "admin@example.com" && password === "admin123") {
    return {
      id: "admin_1",
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
    };
  }
  throw new Error("Invalid credentials");
}

// Admin data types
export type AdminStats = {
  totalUsers: number;
  totalInvestments: number;
  amountRaised: number;
  activeIssuances: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  await mockDelay();
  return {
    totalUsers: 1250,
    totalInvestments: 3420,
    amountRaised: 28500000,
    activeIssuances: 6,
  };
}

export type AdminUserRecord = {
  id: string;
  email: string;
  name: string;
  type: "individual" | "business";
  kycStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
};

export async function getAdminUsers(): Promise<AdminUserRecord[]> {
  await mockDelay();
  return Array.from({ length: 50 }, (_, i) => ({
    id: `user_${i + 1}`,
    email: `user${i + 1}@example.com`,
    name: `User ${i + 1}`,
    type: i % 3 === 0 ? "business" : "individual",
    kycStatus: i % 4 === 0 ? "pending" : i % 4 === 1 ? "rejected" : "approved",
    isActive: i % 5 !== 0,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: i % 3 === 0 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  }));
}

export type AdminTransaction = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  issuanceId: string;
  issuanceTitle: string;
  amount: number;
  status: "pending" | "confirmed" | "failed" | "refunded";
  paymentMethod: "bank_transfer" | "credit_card" | "sepa";
  date: string;
  bonds?: number;
};

export async function getAdminTransactions(): Promise<AdminTransaction[]> {
  await mockDelay();
  return Array.from({ length: 100 }, (_, i) => ({
    id: `txn_${i + 1}`,
    userId: `user_${Math.floor(Math.random() * 50) + 1}`,
    userName: `User ${Math.floor(Math.random() * 50) + 1}`,
    userEmail: `user${Math.floor(Math.random() * 50) + 1}@example.com`,
    issuanceId: `iss-${(i % 6) + 1}`,
    issuanceTitle: `Issuance ${(i % 6) + 1}`,
    amount: Math.floor(Math.random() * 10000) + 500,
    status: ["pending", "confirmed", "confirmed", "confirmed", "failed"][i % 5] as any,
    paymentMethod: ["bank_transfer", "credit_card", "sepa"][i % 3] as any,
    date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    bonds: Math.floor(Math.random() * 50) + 10,
  }));
}

export type AdminDocument = {
  id: string;
  name: string;
  type: "pdf" | "doc" | "xls" | "other";
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  category: "legal" | "financial" | "project" | "other";
};

export async function getAdminDocuments(): Promise<AdminDocument[]> {
  await mockDelay();
  return Array.from({ length: 20 }, (_, i) => ({
    id: `doc_${i + 1}`,
    name: `Document ${i + 1}.pdf`,
    type: ["pdf", "doc", "xls", "other"][i % 4] as any,
    size: Math.floor(Math.random() * 5000000) + 100000,
    uploadedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: `admin_${(i % 3) + 1}`,
    category: ["legal", "financial", "project", "other"][i % 4] as any,
  }));
}


