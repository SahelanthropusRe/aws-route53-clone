"use client";

import React from "react";
import { Search, Bell, Settings, UserCircle, Globe } from "lucide-react";
import Link from "next/link";

export default function TopNav() {
  return (
    <header className="h-10 bg-aws-nav text-white flex items-center justify-between px-3 text-xs select-none sticky top-0 z-50">
      {/* Left: AWS Logo & Service Link */}
      <div className="flex items-center space-x-4">
        <Link href="/hostedzones" className="flex items-center space-x-1.5 font-bold tracking-tight text-white hover:text-aws-orange">
          <span className="bg-aws-orange text-white px-1.5 py-0.5 rounded font-black text-[11px]">AWS</span>
          <span className="text-sm font-semibold">Route 53</span>
        </Link>
      </div>

      {/* Center: AWS Global Search Bar */}
      <div className="flex-1 max-w-lg mx-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for services, features, records [Alt+S]"
            className="w-full bg-[#2a3649] text-gray-200 placeholder-gray-400 pl-8 pr-3 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-aws-orange border border-[#3b4759]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1.5" />
        </div>
      </div>

      {/* Right: Region & Account */}
      <div className="flex items-center space-x-4 text-gray-300">
        <div className="flex items-center space-x-1 hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-[#232f3e]">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium">Global</span>
        </div>
        <div className="flex items-center space-x-1 hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-[#232f3e]">
          <UserCircle className="w-4 h-4 text-aws-orange" />
          <span>admin @ 1234-5678-9012</span>
        </div>
        <Bell className="w-4 h-4 cursor-pointer hover:text-white" />
        <Settings className="w-4 h-4 cursor-pointer hover:text-white" />
      </div>
    </header>
  );
}