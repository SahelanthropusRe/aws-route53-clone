"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search, Bell, Settings, UserCircle, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TopNav() {
  const [username, setUsername] = useState("Loading...");
  const router = useRouter();
  
  // 1. Create a reference to attach to the search input
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Read the username we saved during login
    const storedUsername = localStorage.getItem("route53_username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      // Redirect to login if no active session
      router.push("/login");
    }
  }, [router]);

  // 2. Add the global keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use e.code === "KeyS" because Alt+S outputs special characters on some systems
      if (e.altKey && e.code === "KeyS") {
        e.preventDefault(); 
        
        // Try to find a functional search bar on the current page first
        const pageSearchInput = document.getElementById("page-search");
        
        if (pageSearchInput) {
          pageSearchInput.focus(); // Focus the real search bar on the page
        } else {
          searchInputRef.current?.focus(); // Fallback to the top nav mockup
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    // Cleanup the event listener when the component unmounts
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("route53_token");
    localStorage.removeItem("route53_username");
    router.push("/login");
  };

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
            ref={searchInputRef} // 3. Attach the ref to the input element
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
        
        {/* Dynamic Username & Dropdown */}
        <div className="relative group flex items-center space-x-1 hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-[#232f3e]">
          <UserCircle className="w-4 h-4 text-aws-orange" />
          <span>{username} @ 1234-5678-9012</span>
          
          {/* Sign Out Dropdown Menu */}
          <div className="absolute right-0 top-full hidden group-hover:block bg-white text-aws-text border border-aws-border shadow-md rounded-sm py-1 min-w-[140px] z-50">
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-aws-blue hover:text-aws-blueHover hover:underline"
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