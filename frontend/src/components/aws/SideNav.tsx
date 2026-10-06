"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Network, 
  Layers, 
  Activity, 
  Share2, 
  LayoutDashboard,
  ExternalLink 
} from "lucide-react";

export default function SideNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Hosted zones", href: "/hostedzones", icon: Layers },
    { label: "Health checks", href: "/healthchecks", icon: Activity },
    { label: "Traffic policies", href: "/trafficpolicies", icon: Share2 },
    { label: "Resolver", href: "/resolver", icon: Network },
  ];

  return (
    <aside className="w-60 bg-white border-r border-aws-border flex flex-col h-[calc(100vh-2.5rem)] select-none shrink-0">
      <div className="p-3 border-b border-aws-border font-bold text-xs uppercase tracking-wider text-aws-muted">
        DNS Management
      </div>
      <nav className="p-2 space-y-0.5 text-xs flex-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded font-medium transition-colors ${
                isActive
                  ? "bg-aws-border text-aws-orange font-semibold border-l-4 border-aws-orange"
                  : "text-aws-text hover:bg-gray-100 hover:text-black"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-aws-border text-[11px] text-aws-muted flex items-center justify-between">
        <span>Route 53 Documentation</span>
        <ExternalLink className="w-3 h-3" />
      </div>
    </aside>
  );
}