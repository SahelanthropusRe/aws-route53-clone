"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

const RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "PTR", "SRV", "CAA", "NS"];

export default function CreateRecordPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = params.zoneId as string;

  const [zoneName, setZoneName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [recordType, setRecordType] = useState("A");
  const [ttl, setTtl] = useState(300);
  const [routingPolicy, setRoutingPolicy] = useState("Simple");
  const [values, setValues] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApi<any>(`/hostedzones/${zoneId}`).then((zone) => {
      setZoneName(zone.name);
    });
  }, [zoneId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values) return;

    // Build the fully-qualified record name
    const fullName = subdomain ? `${subdomain}.${zoneName}` : zoneName;

    try {
      setSubmitting(true);
      await fetchApi(`/hostedzones/${zoneId}/records`, {
        method: "POST",
        body: JSON.stringify({
          name: fullName,
          type: recordType,
          ttl: Number(ttl),
          routing_policy: routingPolicy,
          values,
        }),
      });
      router.push(`/hostedzones/${zoneId}`);
    } catch (err: any) {
      alert(err.message || "Failed to create record");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="text-xs text-aws-muted dark:text-gray-400 transition-colors">
        <Link href={`/hostedzones/${zoneId}`} className="hover:underline hover:text-aws-text dark:hover:text-white transition-colors">{zoneName || "Zone"}</Link> &gt; Create record
      </div>
      <h1 className="text-xl font-bold text-aws-text dark:text-white transition-colors">Quick create record</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#182231] border border-aws-border dark:border-gray-800 rounded p-6 space-y-6 shadow-sm transition-colors">
        {/* Record Name */}
        <div>
          <label className="block text-xs font-bold text-aws-text dark:text-gray-200 mb-1 transition-colors">
            Record name
          </label>
          <div className="flex items-center max-w-lg">
            <input
              type="text"
              placeholder="subdomain (optional)"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              className="flex-1 text-xs px-3 py-2 border border-aws-borderDark dark:border-gray-700 bg-white dark:bg-[#0f1722] text-aws-text dark:text-gray-200 rounded-l focus:outline-none focus:border-aws-orange transition-colors"
            />
            <span className="bg-gray-100 dark:bg-gray-800/50 border border-l-0 border-aws-borderDark dark:border-gray-700 px-3 py-2 text-xs font-mono text-aws-muted dark:text-gray-400 rounded-r transition-colors">
              .{zoneName || "domain.com"}
            </span>
          </div>
          <p className="text-[11px] text-aws-muted dark:text-gray-400 mt-1 transition-colors">Leave empty to configure the root domain apex.</p>
        </div>

        {/* Record Type & TTL */}
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold text-aws-text dark:text-gray-200 mb-1 transition-colors">Record type</label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-aws-borderDark dark:border-gray-700 rounded focus:outline-none focus:border-aws-orange bg-white dark:bg-[#0f1722] text-aws-text dark:text-gray-200 transition-colors"
            >
              {RECORD_TYPES.map((t) => (
                <option key={t} value={t}>{t} - {getRecordTypeDescription(t)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-aws-text dark:text-gray-200 mb-1 transition-colors">TTL (Seconds)</label>
            <input
              type="number"
              value={ttl}
              onChange={(e) => setTtl(Number(e.target.value))}
              className="w-full text-xs px-3 py-2 border border-aws-borderDark dark:border-gray-700 bg-white dark:bg-[#0f1722] text-aws-text dark:text-gray-200 rounded focus:outline-none focus:border-aws-orange transition-colors"
            />
          </div>
        </div>

        {/* Value/Route Traffic To */}
        <div>
          <label className="block text-xs font-bold text-aws-text dark:text-gray-200 mb-1 transition-colors">
            Value / Route traffic to <span className="text-red-500">*</span>
          </label>
          <p className="text-[11px] text-aws-muted dark:text-gray-400 mb-2 transition-colors">
            Enter one or more IP addresses or values on separate lines.
          </p>
          <textarea
            required
            rows={4}
            placeholder={getPlaceholderForType(recordType)}
            value={values}
            onChange={(e) => setValues(e.target.value)}
            className="w-full font-mono text-xs px-3 py-2 border border-aws-borderDark dark:border-gray-700 bg-white dark:bg-[#0f1722] text-aws-text dark:text-gray-200 rounded focus:outline-none focus:border-aws-orange transition-colors"
          />
        </div>

        {/* Routing Policy */}
        <div>
          <label className="block text-xs font-bold text-aws-text dark:text-gray-200 mb-1 transition-colors">Routing policy</label>
          <select
            value={routingPolicy}
            onChange={(e) => setRoutingPolicy(e.target.value)}
            className="max-w-xs w-full text-xs px-3 py-2 border border-aws-borderDark dark:border-gray-700 rounded focus:outline-none focus:border-aws-orange bg-white dark:bg-[#0f1722] text-aws-text dark:text-gray-200 transition-colors"
          >
            <option value="Simple">Simple routing</option>
            <option value="Weighted">Weighted</option>
            <option value="Latency">Latency</option>
            <option value="Failover">Failover</option>
          </select>
        </div>

        <div className="pt-4 border-t border-aws-border dark:border-gray-800 flex items-center justify-end space-x-3 text-xs transition-colors">
          <Link
            href={`/hostedzones/${zoneId}`}
            className="px-4 py-2 border border-aws-borderDark dark:border-gray-700 text-aws-text dark:text-gray-200 rounded font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-aws-orange hover:bg-aws-orangeHover text-white px-5 py-2 rounded font-bold shadow-sm disabled:opacity-50 transition-colors"
          >
            {submitting ? "Saving..." : "Create records"}
          </button>
        </div>
      </form>
    </div>
  );
}

function getRecordTypeDescription(type: string): string {
  switch (type) {
    case "A": return "Routes traffic to an IPv4  address";
    case "AAAA": return "Routes traffic to an IPv6 address";
    case "CNAME": return "Routes traffic to another domain name";
    case "MX": return "Routes mail to mail servers";
    case "TXT": return "Text record for verification (SPF, DKIM)";
    case "PTR": return "Maps IP to domain name";
    case "SRV": return "Service locator";
    case "CAA": return "Certificate Authority Authorization";
    case "NS": return "Name server delegation";
    default: return "";
  }
}
function getPlaceholderForType(type: string): string {
  switch (type) {
    case "A": return "192.0.2.1\n198.51.100.1";
    case "AAAA": return "2001:0db8:85a3:0:0:8a2e:0370:7334";
    case "CNAME": return "example.com\nwww.example.com";
    case "MX": return "10 mailserver.example.com\n20 mailserver2.example.com";
    case "TXT": return '"Sample text entry"\n"v=spf1 include:_spf.example.com ~all"';
    case "PTR": return "hostname.example.com";
    case "SRV": return "1 10 5269 xmpp-server.example.com.";
    case "CAA": return '0 issue "amazon.com"';
    case "NS": return "ns-1.awsdns-01.com.\nns-2.awsdns-02.net.";
    default: return "Value format";
  }
}