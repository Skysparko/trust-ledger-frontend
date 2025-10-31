"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AmbientVariant = "blue" | "teal";

export function Ambient({ variant = "blue", className }: { variant?: AmbientVariant; className?: string }) {
  const conf =
    variant === "teal"
      ? {
          blobA: "from-teal-400/12 via-emerald-400/12",
          blobB: "from-cyan-400/12 via-teal-400/12",
        }
      : {
          blobA: "from-blue-400/12 via-cyan-400/12",
          blobB: "from-cyan-400/12 via-blue-400/12",
        };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn("pointer-events-none absolute inset-0", className)}
      aria-hidden
    >
      <motion.div
        className={cn(
          "absolute top-0 left-0 h-[30rem] w-[30rem] rounded-full bg-gradient-to-br to-transparent blur-3xl",
          conf.blobA
        )}
        animate={{ x: [0, 26, -16, 0], y: [0, -18, 14, 0], scale: [1, 1.12, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={cn(
          "absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-gradient-to-br to-transparent blur-3xl",
          conf.blobB
        )}
        animate={{ x: [0, -22, 18, 0], y: [0, 22, -16, 0], scale: [1, 1.1, 0.96, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}


