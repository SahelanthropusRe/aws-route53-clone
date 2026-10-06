import React from "react";
import TopNav from "@/components/aws/TopNav";
import SideNav from "@/components/aws/SideNav";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-aws-bg dark:bg-[#0f1722] text-aws-text dark:text-gray-200 transition-colors">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <SideNav />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}