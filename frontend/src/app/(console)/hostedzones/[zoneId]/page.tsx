"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Search, ArrowLeft, RefreshCw } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface RecordItem {
  id: string;
  name: string;
  type: string;
  ttl: number;
  routing_policy: string;
  values: string;
}

interface HostedZone {
  id: string;
  name: string;
  description: string;
  type: string;
  record_count: number;
}

export default function ZoneDetailPage() {
  const params = useParams();
  const zoneId = params.zoneId as string;
  const router = useRouter();

  const [zone, setZone] = useState<HostedZone | null>(null);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [zoneData, recordsData] = await Promise.all([
        fetchApi<HostedZone>(`/hostedzones/${zoneId}`),
        fetchApi<RecordItem[]>(`/hostedzones/${zoneId}/records${search ? `?search=${search}` : ""}`),
      ]);
      setZone(zoneData);
      setRecords(recordsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [zoneId, search]);

  const handleDeleteRecord = async () => {
    if (!selectedRecordId) return;
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      await fetchApi(`/hostedzones/${zoneId}/records/${selectedRecordId}`, {
        method: "DELETE",
      });
      setSelectedRecordId(null);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete record");
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center space-x-2 text-xs text-aws-muted">
        <Link href="/hostedzones" className="hover:underline flex items-center space-x-1">
          <ArrowLeft className="w-3 h-3" />
          <span>Hosted zones</span>
        </Link>
        <span>&gt;</span>
        <span className="text-aws-text font-bold">{zone?.name || zoneId}</span>
      </div>

      {/* Zone Summary Card */}
      <div className="bg-white border border-aws-border rounded p-4 shadow-sm text-xs">
        <h1 className="text-lg font-bold text-aws-text mb-3">{zone?.name}</h1>
        <div className="grid grid-cols-4 gap-4 text-aws-muted">
          <div>
            <span className="block font-semibold text-aws-text">Hosted zone ID</span>
            <span className="font-mono text-[11px]">{zone?.id}</span>
          </div>
          <div>
            <span className="block font-semibold text-aws-text">Type</span>
            <span>{zone?.type}</span>
          </div>
          <div>
            <span className="block font-semibold text-aws-text">Record count</span>
            <span>{zone?.record_count}</span>
          </div>
          <div>
            <span className="block font-semibold text-aws-text">Description</span>
            <span>{zone?.description || "-"}</span>
          </div>
        </div>
      </div>

      {/* Records Table Card */}
      <div className="bg-white border border-aws-border rounded shadow-sm">
        <div className="p-3 border-b border-aws-border flex items-center justify-between gap-4">
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Search by record name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-aws-borderDark rounded focus:outline-none focus:border-aws-orange"
            />
            <Search className="w-3.5 h-3.5 text-aws-muted absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={loadData}
              className="p-1.5 border border-aws-borderDark rounded hover:bg-gray-50 text-aws-muted"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteRecord}
              disabled={!selectedRecordId}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded font-medium border ${
                selectedRecordId
                  ? "border-red-400 text-red-600 hover:bg-red-50"
                  : "border-aws-border text-gray-400 cursor-not-allowed"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete record</span>
            </button>
            <Link
              href={`/hostedzones/${zoneId}/records/create`}
              className="flex items-center space-x-1 bg-aws-orange hover:bg-aws-orangeHover text-white px-3 py-1.5 rounded font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create record</span>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafafa] border-b border-aws-border text-aws-muted font-bold">
              <tr>
                <th className="w-10 px-3 py-2.5"></th>
                <th className="px-3 py-2.5">Record name</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Routing policy</th>
                <th className="px-3 py-2.5">TTL (seconds)</th>
                <th className="px-3 py-2.5">Value/Route traffic to</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aws-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-aws-muted">
                    Loading records...
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr
                    key={rec.id}
                    className={`hover:bg-blue-50/40 cursor-pointer ${
                      selectedRecordId === rec.id ? "bg-amber-50/60" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="radio"
                        checked={selectedRecordId === rec.id}
                        onChange={() => setSelectedRecordId(rec.id)}
                        className="text-aws-orange focus:ring-aws-orange"
                      />
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-aws-text">{rec.name}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] font-bold text-gray-700">{rec.type}</td>
                    <td className="px-3 py-2.5 text-aws-muted">{rec.routing_policy}</td>
                    <td className="px-3 py-2.5">{rec.ttl}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-gray-800 whitespace-pre-line">
                      {rec.values}
                    </td>
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