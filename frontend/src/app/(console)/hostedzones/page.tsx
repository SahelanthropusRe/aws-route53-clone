"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Search, RefreshCw } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface HostedZone {
  id: string;
  name: string;
  description: string;
  type: string;
  record_count: number;
  created_at: string;
}

export default function HostedZonesPage() {
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [search, setSearch] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadZones = async () => {
    try {
      setLoading(true);
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await fetchApi<HostedZone[]>(`/hostedzones${query}`);
      setZones(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, [search]);

  const handleDelete = async () => {
    if (!selectedZoneId) return;
    if (!confirm(`Are you sure you want to delete this hosted zone?`)) return;

    try {
      await fetchApi(`/hostedzones/${selectedZoneId}`, { method: "DELETE" });
      setSelectedZoneId(null);
      loadZones();
    } catch (err: any) {
      alert(err.message || "Failed to delete hosted zone");
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-aws-text">Hosted zones</h1>
          <p className="text-xs text-aws-muted mt-0.5">
            A hosted zone contains records that define how you want to route traffic on the internet for a domain.
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-aws-border rounded shadow-sm">
        {/* Action Controls Bar */}
        <div className="p-3 border-b border-aws-border flex items-center justify-between gap-4">
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Filter by hosted zone name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-aws-borderDark rounded focus:outline-none focus:border-aws-orange"
            />
            <Search className="w-3.5 h-3.5 text-aws-muted absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={loadZones}
              className="p-1.5 border border-aws-borderDark rounded hover:bg-gray-50 text-aws-muted"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={!selectedZoneId}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded font-medium border ${
                selectedZoneId
                  ? "border-red-400 text-red-600 hover:bg-red-50"
                  : "border-aws-border text-gray-400 cursor-not-allowed"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <Link
              href="/hostedzones/create"
              className="flex items-center space-x-1 bg-aws-orange hover:bg-aws-orangeHover text-white px-3 py-1.5 rounded font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create hosted zone</span>
            </Link>
          </div>
        </div>

        {/* AWS Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafafa] border-b border-aws-border text-aws-muted font-bold">
              <tr>
                <th className="w-10 px-3 py-2.5"></th>
                <th className="px-3 py-2.5">Hosted zone name</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Description</th>
                <th className="px-3 py-2.5">Record count</th>
                <th className="px-3 py-2.5">Hosted zone ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aws-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-aws-muted">
                    Loading hosted zones...
                  </td>
                </tr>
              ) : zones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-aws-muted">
                    No hosted zones found. Click <strong>Create hosted zone</strong> to get started.
                  </td>
                </tr>
              ) : (
                zones.map((zone) => (
                  <tr
                    key={zone.id}
                    className={`hover:bg-blue-50/40 cursor-pointer ${
                      selectedZoneId === zone.id ? "bg-amber-50/60" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="radio"
                        checked={selectedZoneId === zone.id}
                        onChange={() => setSelectedZoneId(zone.id)}
                        className="text-aws-orange focus:ring-aws-orange"
                      />
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-aws-blue hover:underline">
                      <Link href={`/hostedzones/${zone.id}`}>{zone.name}</Link>
                    </td>
                    <td className="px-3 py-2.5 text-aws-text">{zone.type}</td>
                    <td className="px-3 py-2.5 text-aws-muted">{zone.description || "-"}</td>
                    <td className="px-3 py-2.5">{zone.record_count}</td>
                    <td className="px-3 py-2.5 font-mono text-gray-500 text-[11px]">{zone.id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}