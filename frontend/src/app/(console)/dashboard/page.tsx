import React from "react";
import Link from "next/link";
import { Layers, Activity, HeartPulse, Globe, Network } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-aws-text">Amazon Route 53 Dashboard</h1>
        <p className="text-xs text-aws-muted mt-1">
          A reliable and cost-effective way to route end users to Internet applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* DNS Management - ACTIVE */}
        <div className="bg-white border border-aws-border rounded p-5 space-y-3 shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 text-aws-text font-bold text-sm">
            <Layers className="w-5 h-5 text-aws-orange" />
            <span>DNS Management</span>
          </div>
          <p className="text-xs text-aws-muted flex-grow">
            Manage your domain names and routing policies with globally distributed DNS servers.
          </p>
          <div>
            <Link
              href="/hostedzones"
              className="inline-block text-xs font-semibold text-aws-blue hover:underline"
            >
              Manage hosted zones &rarr;
            </Link>
          </div>
        </div>

        {/* Traffic Management - MOCKUP */}
        <div className="bg-white border border-aws-border rounded p-5 space-y-3 shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 text-aws-text font-bold text-sm">
            <Activity className="w-5 h-5 text-aws-blue" />
            <span>Traffic Management</span>
          </div>
          <p className="text-xs text-aws-muted flex-grow">
            Configure traffic routing policies, DNS failover, and geographic routing rules.
          </p>
          <div>
            <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Health Checks - MOCKUP */}
        <div className="bg-white border border-aws-border rounded p-5 space-y-3 shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 text-aws-text font-bold text-sm">
            <HeartPulse className="w-5 h-5 text-green-600" />
            <span>Availability Monitoring</span>
          </div>
          <p className="text-xs text-aws-muted flex-grow">
            Monitor the health and performance of your applications and web endpoints.
          </p>
          <div>
            <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Domain Registration - MOCKUP */}
        <div className="bg-white border border-aws-border rounded p-5 space-y-3 shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 text-aws-text font-bold text-sm">
            <Globe className="w-5 h-5 text-purple-600" />
            <span>Domain Registration</span>
          </div>
          <p className="text-xs text-aws-muted flex-grow">
            Search for and register new domains, or manage your existing domain names.
          </p>
          <div>
            <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Route 53 Resolver - MOCKUP */}
        <div className="bg-white border border-aws-border rounded p-5 space-y-3 shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 text-aws-text font-bold text-sm">
            <Network className="w-5 h-5 text-teal-600" />
            <span>Route 53 Resolver</span>
          </div>
          <p className="text-xs text-aws-muted flex-grow">
            Respond recursively to DNS queries from AWS resources and on-premises networks.
          </p>
          <div>
            <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}