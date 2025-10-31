export type Post = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
};

export const posts: Post[] = [
  {
    id: "post-1",
    title: "How does investing in renewable energy work?",
    excerpt: "A practical guide for first-time impact investors.",
    date: "2025-09-12",
    category: "Knowledge",
  },
  {
    id: "post-2",
    title: "Q3 results: stable returns",
    excerpt: "Insights into projects and payouts.",
    date: "2025-10-05",
    category: "News",
  },
];


