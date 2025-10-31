"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Project } from "@/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: "easeOut" }}>
      <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-cyan-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
        <CardHeader>
          <div className="relative">
            <h3 className="text-lg font-bold sm:text-xl">{project.title}</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{project.type} • {project.location}</p>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="inline-flex rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-purple-500/30"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {project.status}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


