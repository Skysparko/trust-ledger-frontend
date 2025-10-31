export type Webinar = {
  id: string;
  title: string;
  date: string;
  speaker: string;
};

export const webinars: Webinar[] = [
  {
    id: "web-1",
    title: "Introduction to project finance",
    date: "2025-11-15",
    speaker: "I. Consultant",
  },
  {
    id: "web-2",
    title: "Wind vs Solar: risk and return",
    date: "2025-12-02",
    speaker: "A. Analyst",
  },
];


