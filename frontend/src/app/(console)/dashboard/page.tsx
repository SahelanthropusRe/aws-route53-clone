import React from "react";
import Link from "next/link";
import { Layers, Activity } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-aws-text">Amazon Route 53 Dashboard</h1>
        <p className="text-xs text-aws-muted mt-1">
          A reliable and cost-effective way to route end users to Internet applications.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white border border-aws-border rounded p-5 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-aws-text font-bold text-sm">
            <Layers className="w-5 h-5 text-aws-orange" />
            <span>DNS Management</span>
          </div>
          <p className="text-xs text-aws-muted">
            Manage your domain names and routing policies with globally distributed DNS servers.
          </p>
          <Link
            href="/hostedzones"
            className="inline-block text-xs font-semibold text-aws-blue hover:underline"
          >
            Manage hosted zones &rarr;
          </Link>
        </div>

        <div className="bg-white border border-aws-border rounded p-5 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-aws-text font-bold text-sm">
            <Activity className="w-5 h-5 text-aws-blue" />
            <span>Traffic Management</span>
          </div>
          <p className="text-xs text-aws-muted">
            Configure traffic routing policies, DNS failover, and geographic routing rules.
          </p>
          <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}