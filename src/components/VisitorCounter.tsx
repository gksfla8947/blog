"use client";

import { useEffect, useState } from "react";

export default function VisitorCounter() {
  const [today, setToday] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastVisit = localStorage.getItem("lastVisitDate");
    const method = lastVisit === today ? "GET" : "POST";

    fetch("/api/visitors", { method })
      .then((res) => res.json())
      .then((data) => {
        setToday(data.today);
        setTotal(data.total);
        if (lastVisit !== today) localStorage.setItem("lastVisitDate", today);
      })
      .catch(() => {
        setToday(0);
        setTotal(0);
      });
  }, []);

  return (
    <div className="sidebar-card">
      <h4 className="sidebar-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        Visitors
      </h4>
      <div className="flex gap-4">
        <div className="flex-1 text-center py-2.5 rounded-lg bg-[var(--accent-glow)] border border-[var(--card-border)]">
          <div className="text-lg font-bold text-[var(--accent)]">
            {today !== null ? today.toLocaleString() : "-"}
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-0.5 uppercase tracking-wider">Today</div>
        </div>
        <div className="flex-1 text-center py-2.5 rounded-lg bg-[var(--accent-glow)] border border-[var(--card-border)]">
          <div className="text-lg font-bold text-[var(--secondary)]">
            {total !== null ? total.toLocaleString() : "-"}
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-0.5 uppercase tracking-wider">Total</div>
        </div>
      </div>
    </div>
  );
}
