export type Project = {
  id: string;
  title: string;
  type: "Wind" | "Solar";
  location: string;
  status: "In development" | "Live" | "Completed";
};

export const projects: Project[] = [
  {
    id: "prj-1",
    title: "Solar Park Veluwe",
    type: "Solar",
    location: "Gelderland",
    status: "Live",
  },
  {
    id: "prj-2",
    title: "Wind Cluster Delta",
    type: "Wind",
    location: "Zeeland",
    status: "In development",
  },
  {
    id: "prj-3",
    title: "Solar Rooftop Program",
    type: "Solar",
    location: "Randstad",
    status: "Completed",
  },
];


