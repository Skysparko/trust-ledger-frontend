"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminIssuancesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to investment opportunities page
    router.replace("/admin/investment-opportunities");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <p className="text-zinc-500 dark:text-zinc-400">Redirecting to Investment Opportunities...</p>
      </div>
    </div>
  );
}
