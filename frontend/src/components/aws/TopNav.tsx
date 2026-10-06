"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search, Bell, Settings, UserCircle, Globe, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function TopNav() {
  const [username, setUsername] = useState("Loading...");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Reference for global shortcut fallback
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const storedUsername = localStorage.getItem("route53_username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.code === "KeyS") {
        e.preventDefault();

        const pageSearchInput = document.getElementById("page-search");
        if (pageSearchInput) {
          pageSearchInput.focus();
        } else {
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("route53_token");
    localStorage.removeItem("route53_username");
    router.push("/login");
  };

  return (
    <header className="h-10 bg-aws-nav dark:bg-[#182231] text-white flex items-center justify-between px-3 text-xs select-none sticky top-0 z-50 border-b border-transparent dark:border-gray-800 transition-colors">
      {/* Left: AWS Logo & Service Link */}
      <div className="flex items-center space-x-4">
        <Link
  href="/hostedzones"
  className="flex items-center space-x-2.5 tracking-tight text-white hover:text-aws-orange"
>
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
    alt="AWS"
    className="h-6 w-auto invert hue-rotate-180 relative top-[1px]"
  />
  <span className="h-4 w-px bg-gray-500" aria-hidden="true"></span>
  <span className="text-sm font-medium relative -top-px">Route 53</span>
</Link>
      </div>

      {/* Center: AWS Global Search Bar */}
      <div className="flex-1 max-w-lg mx-6">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for services, features, records [Alt+S]"
            className="w-full bg-[#2a3649] dark:bg-[#0f1722] text-gray-200 placeholder-gray-400 pl-8 pr-3 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-aws-orange border border-[#3b4759] dark:border-gray-700 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1.5" />
        </div>
      </div>

      {/* Right: Region, Theme Toggle & Account */}
      <div className="flex items-center space-x-4 text-gray-300">
        {/* Dark Mode Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1 rounded hover:text-white hover:bg-[#232f3e] dark:hover:bg-gray-800 transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 text-gray-300 hover:text-white" />
            )}
          </button>
        )}

        <div className="flex items-center space-x-1 hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-[#232f3e] dark:hover:bg-gray-800 transition-colors">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium">Global</span>
        </div>

        {/* Dynamic Username & Dropdown */}
        <div className="relative group flex items-center space-x-1 hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-[#232f3e] dark:hover:bg-gray-800 transition-colors">
          <UserCircle className="w-4 h-4 text-aws-orange" />
          <span>{username}</span>

          {/* Sign Out Dropdown Menu */}
          <div className="absolute right-0 top-full hidden group-hover:block bg-white dark:bg-gray-900 text-aws-text dark:text-gray-200 border border-aws-border dark:border-gray-700 shadow-md rounded-sm py-1 min-w-[140px] z-50">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-aws-blue hover:text-aws-blueHover hover:underline text-xs"
            >
              Sign out
            </button>
          </div>
        </div>

        <Bell className="w-4 h-4 cursor-pointer hover:text-white" />
        <Settings className="w-4 h-4 cursor-pointer hover:text-white" />
      </div>
    </header>
  );
}