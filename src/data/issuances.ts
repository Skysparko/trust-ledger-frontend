export type Issuance = {
  id: string;
  title: string;
  type: "Wind" | "Solar";
  location: string;
  rate: number; // percentage
  termMonths: number;
  minInvestment: number; // euros
};

export const issuances: Issuance[] = [
  {
    id: "iss-1",
    title: "Wind Park North",
    type: "Wind",
    location: "Groningen",
    rate: 7.2,
    termMonths: 36,
    minInvestment: 250,
  },
  {
    id: "iss-2",
    title: "Solar Field South",
    type: "Solar",
    location: "Limburg",
    rate: 6.5,
    termMonths: 24,
    minInvestment: 100,
  },
  {
    id: "iss-3",
    title: "Wind Park West",
    type: "Wind",
    location: "Zeeland",
    rate: 7.8,
    termMonths: 48,
    minInvestment: 500,
  },
];


