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


