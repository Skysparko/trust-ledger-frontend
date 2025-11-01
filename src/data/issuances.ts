export type Issuance = {
  id: string;
  title: string;
  type: string;
  location: string;
  rate: number; // percentage
  termMonths: number;
  minInvestment: number; // euros
  maxInvestment?: number; // euros
  totalFundingTarget: number; // euros
  currentFunding: number; // euros
  investorsCount: number;
  description: string;
  company: string;
  status: "open" | "closed" | "upcoming";
  startDate: string; // ISO date
  endDate?: string; // ISO date
  riskLevel: "Low" | "Medium" | "High";
  creditRating?: string;
  paymentFrequency: "Monthly" | "Quarterly" | "Annually" | "At Maturity";
  bondStructure: string;
  sector: string;
};

export const issuances: Issuance[] = [
  {
    id: "iss-1",
    title: "Tech Innovation Fund",
    type: "Technology",
    location: "Amsterdam",
    rate: 7.2,
    termMonths: 36,
    minInvestment: 250,
    maxInvestment: 50000,
    totalFundingTarget: 5000000,
    currentFunding: 3850000,
    investorsCount: 342,
    description: "Supporting innovative tech startups in artificial intelligence and software development. This fund focuses on companies with proven business models and strong growth potential, providing stable returns for investors.",
    company: "Tech Ventures Capital BV",
    status: "open",
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    riskLevel: "Low",
    creditRating: "A-",
    paymentFrequency: "Quarterly",
    bondStructure: "Senior Secured Bond",
    sector: "Technology",
  },
  {
    id: "iss-2",
    title: "Healthcare Expansion Bond",
    type: "Healthcare",
    location: "Rotterdam",
    rate: 6.5,
    termMonths: 24,
    minInvestment: 100,
    maxInvestment: 25000,
    totalFundingTarget: 3000000,
    currentFunding: 2100000,
    investorsCount: 485,
    description: "Funding expansion of healthcare facilities and medical technology companies. This bond supports companies developing innovative medical solutions and expanding healthcare infrastructure across the Netherlands.",
    company: "HealthCare Partners NL",
    status: "open",
    startDate: "2024-02-01",
    endDate: "2024-11-30",
    riskLevel: "Medium",
    creditRating: "BBB+",
    paymentFrequency: "Quarterly",
    bondStructure: "Corporate Bond",
    sector: "Healthcare",
  },
  {
    id: "iss-3",
    title: "Manufacturing Growth Fund",
    type: "Manufacturing",
    location: "Eindhoven",
    rate: 7.8,
    termMonths: 48,
    minInvestment: 500,
    maxInvestment: 100000,
    totalFundingTarget: 8000000,
    currentFunding: 6200000,
    investorsCount: 198,
    description: "Supporting manufacturing companies in advanced materials and industrial automation. This fund focuses on companies implementing innovative production technologies and expanding their manufacturing capabilities.",
    company: "Advanced Manufacturing Group",
    status: "open",
    startDate: "2024-03-01",
    endDate: "2025-02-28",
    riskLevel: "Low",
    creditRating: "AA-",
    paymentFrequency: "Quarterly",
    bondStructure: "Green Bond",
    sector: "Manufacturing",
  },
  {
    id: "iss-4",
    title: "Finance Services Expansion",
    type: "Financial Services",
    location: "Utrecht",
    rate: 6.8,
    termMonths: 30,
    minInvestment: 200,
    maxInvestment: 40000,
    totalFundingTarget: 4500000,
    currentFunding: 3200000,
    investorsCount: 267,
    description: "Supporting financial technology companies and fintech startups. This project focuses on companies developing digital banking solutions and expanding financial inclusion through innovative technologies.",
    company: "FinTech Ventures BV",
    status: "open",
    startDate: "2024-04-15",
    endDate: "2025-01-31",
    riskLevel: "Medium",
    creditRating: "A",
    paymentFrequency: "Quarterly",
    bondStructure: "Project Finance Bond",
    sector: "Financial Services",
  },
  {
    id: "iss-5",
    title: "Renewable Energy Portfolio",
    type: "Energy",
    location: "Groningen",
    rate: 7.5,
    termMonths: 42,
    minInvestment: 1000,
    maxInvestment: 75000,
    totalFundingTarget: 10000000,
    currentFunding: 7800000,
    investorsCount: 156,
    description: "Diversified renewable energy portfolio including solar, wind, and hydroelectric projects. This bond supports multiple clean energy initiatives with strong environmental impact and stable returns.",
    company: "Sustainable Energy Systems BV",
    status: "open",
    startDate: "2024-05-01",
    endDate: "2025-06-30",
    riskLevel: "Low",
    creditRating: "AA",
    paymentFrequency: "Quarterly",
    bondStructure: "Infrastructure Bond",
    sector: "Energy",
  },
  {
    id: "iss-6",
    title: "Real Estate Development",
    type: "Real Estate",
    location: "The Hague",
    rate: 7.0,
    termMonths: 36,
    minInvestment: 500,
    maxInvestment: 60000,
    totalFundingTarget: 6000000,
    currentFunding: 5400000,
    investorsCount: 423,
    description: "Commercial real estate development project focusing on sustainable office buildings and mixed-use developments. This bond supports well-located properties with strong rental potential.",
    company: "Commercial Properties Co.",
    status: "open",
    startDate: "2024-06-01",
    endDate: "2025-05-31",
    riskLevel: "Low",
    creditRating: "A+",
    paymentFrequency: "Quarterly",
    bondStructure: "Senior Unsecured Bond",
    sector: "Real Estate",
  },
];


