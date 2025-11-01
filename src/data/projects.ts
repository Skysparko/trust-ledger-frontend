export type Project = {
  id: string;
  title: string;
  type: string;
  location: string;
  status: "In development" | "Live" | "Completed";
};

export const projects: Project[] = [
  {
    id: "prj-1",
    title: "Tech Innovation Hub",
    type: "Technology",
    location: "Amsterdam",
    status: "Live",
  },
  {
    id: "prj-2",
    title: "Healthcare Facilities Expansion",
    type: "Healthcare",
    location: "Rotterdam",
    status: "In development",
  },
  {
    id: "prj-3",
    title: "Manufacturing Automation Program",
    type: "Manufacturing",
    location: "Eindhoven",
    status: "Completed",
  },
];


