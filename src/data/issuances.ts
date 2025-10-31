export type Issuance = {
  id: string;
  title: string;
  type: "Wind" | "Solar";
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
    title: "Wind Park North",
    type: "Wind",
    location: "Groningen",
    rate: 7.2,
    termMonths: 36,
    minInvestment: 250,
    maxInvestment: 50000,
    totalFundingTarget: 5000000,
    currentFunding: 3850000,
    investorsCount: 342,
    description: "A state-of-the-art wind energy facility located in the northern region of the Netherlands. This project will generate clean renewable energy for over 15,000 households while providing stable returns for investors.",
    company: "Renewable Energy Solutions BV",
    status: "open",
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    riskLevel: "Low",
    creditRating: "A-",
    paymentFrequency: "Quarterly",
    bondStructure: "Senior Secured Bond",
    sector: "Renewable Energy",
  },
  {
    id: "iss-2",
    title: "Solar Field South",
    type: "Solar",
    location: "Limburg",
    rate: 6.5,
    termMonths: 24,
    minInvestment: 100,
    maxInvestment: 25000,
    totalFundingTarget: 3000000,
    currentFunding: 2100000,
    investorsCount: 485,
    description: "Large-scale solar photovoltaic installation covering 25 hectares in southern Netherlands. This innovative project utilizes advanced tracking technology to maximize energy output throughout the day.",
    company: "Solar Power Innovations NL",
    status: "open",
    startDate: "2024-02-01",
    endDate: "2024-11-30",
    riskLevel: "Medium",
    creditRating: "BBB+",
    paymentFrequency: "Quarterly",
    bondStructure: "Corporate Bond",
    sector: "Renewable Energy",
  },
  {
    id: "iss-3",
    title: "Wind Park West",
    type: "Wind",
    location: "Zeeland",
    rate: 7.8,
    termMonths: 48,
    minInvestment: 500,
    maxInvestment: 100000,
    totalFundingTarget: 8000000,
    currentFunding: 6200000,
    investorsCount: 198,
    description: "Premium offshore wind energy project in the Zeeland region. This project features cutting-edge turbine technology and strategic location for optimal wind conditions, ensuring high energy generation capacity.",
    company: "Zeeland Wind Energy Group",
    status: "open",
    startDate: "2024-03-01",
    endDate: "2025-02-28",
    riskLevel: "Low",
    creditRating: "AA-",
    paymentFrequency: "Quarterly",
    bondStructure: "Green Bond",
    sector: "Renewable Energy",
  },
  {
    id: "iss-4",
    title: "Solar Array East",
    type: "Solar",
    location: "Flevoland",
    rate: 6.8,
    termMonths: 30,
    minInvestment: 200,
    maxInvestment: 40000,
    totalFundingTarget: 4500000,
    currentFunding: 3200000,
    investorsCount: 267,
    description: "Innovative solar array project featuring bifacial panels that capture sunlight from both sides. Located on reclaimed land, this project combines environmental restoration with renewable energy generation.",
    company: "Flevo Solar Ventures",
    status: "open",
    startDate: "2024-04-15",
    endDate: "2025-01-31",
    riskLevel: "Medium",
    creditRating: "A",
    paymentFrequency: "Quarterly",
    bondStructure: "Project Finance Bond",
    sector: "Renewable Energy",
  },
  {
    id: "iss-5",
    title: "Hybrid Energy Park",
    type: "Solar",
    location: "Noord-Holland",
    rate: 7.5,
    termMonths: 42,
    minInvestment: 1000,
    maxInvestment: 75000,
    totalFundingTarget: 10000000,
    currentFunding: 7800000,
    investorsCount: 156,
    description: "Groundbreaking hybrid energy facility combining solar and wind technologies on a single site. This project maximizes energy production by utilizing both technologies' complementary generation patterns.",
    company: "Hybrid Energy Systems BV",
    status: "open",
    startDate: "2024-05-01",
    endDate: "2025-06-30",
    riskLevel: "Low",
    creditRating: "AA",
    paymentFrequency: "Quarterly",
    bondStructure: "Infrastructure Bond",
    sector: "Renewable Energy",
  },
  {
    id: "iss-6",
    title: "Wind Farm Central",
    type: "Wind",
    location: "Utrecht",
    rate: 7.0,
    termMonths: 36,
    minInvestment: 500,
    maxInvestment: 60000,
    totalFundingTarget: 6000000,
    currentFunding: 5400000,
    investorsCount: 423,
    description: "Urban wind farm project strategically located to power nearby industrial zones. Features advanced noise reduction technology and community engagement programs.",
    company: "Central Wind Power Co.",
    status: "open",
    startDate: "2024-06-01",
    endDate: "2025-05-31",
    riskLevel: "Low",
    creditRating: "A+",
    paymentFrequency: "Quarterly",
    bondStructure: "Senior Unsecured Bond",
    sector: "Renewable Energy",
  },
];


