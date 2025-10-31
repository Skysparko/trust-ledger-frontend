"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setEmail("");
  }

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <div className="text-lg font-semibold">TrustLedger</div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Sustainable investing made accessible to everyone.
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">Company</div>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/projecten">Projects</Link>
            </li>
            <li>
              <Link href="/uitgiften">Issuances</Link>
            </li>
            <li>
              <Link href="/kennis">Knowledge</Link>
            </li>
            <li>
              <Link href="/webinars">Webinars</Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">Legal</div>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/legal/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/legal/cookie">Cookie</Link>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <div className="text-sm font-semibold">Newsletter</div>
          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="shadow-sm transition-transform hover:-translate-y-0.5">Subscribe</Button>
          </form>
          {submitted && (
            <p className="text-xs text-green-600">Thanks for subscribing!</p>
          )}
        </div>
      </div>
      <div className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-500 dark:border-zinc-800">
        © {new Date().getFullYear()} TrustLedger BV. All rights reserved.
      </div>
    </footer>
  );
}


