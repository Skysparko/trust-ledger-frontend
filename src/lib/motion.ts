export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const staggerContainer = (stagger = 0.08) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren: 0.05,
    },
  },
});

export const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};


