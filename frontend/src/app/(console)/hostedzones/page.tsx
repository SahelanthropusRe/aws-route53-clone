"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchApi } from "@/lib/api";
import Alert from "@/components/aws/Alert";
import Modal from "@/components/aws/Modal";

interface HostedZone {
  id: string;
  name: string;
  description: string;
  type: string;
  record_count: number;
}

export default function HostedZonesPage() {
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [search, setSearch] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // UI Upgrade States
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadZones = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<HostedZone[]>(`/hostedzones${search ? `?search=${search}` : ""}`);
      setZones(data);
      setCurrentPage(1); // Reset to page 1 when data changes
    } catch (err: any) {
      console.error("Failed to load zones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, [search]);

  // Modal Delete Logic
  const handleDeleteConfirm = async () => {
    if (!selectedZoneId) return;
    setIsModalOpen(false);

    try {
      await fetchApi(`/hostedzones/${selectedZoneId}`, {
        method: "DELETE",
      });
      setAlert({ type: "success", message: "Hosted zone successfully deleted." });
      setSelectedZoneId(null);
      loadZones();
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Failed to delete hosted zone." });
    }
  };

  // Pagination Math
  const totalPages = Math.ceil(zones.length / itemsPerPage);
  const paginatedZones = zones.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4 max-w-7xl mx-auto relative">
      
      {/* Alert & Modal Components */}
      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: null, message: "" })} />
      <Modal 
        isOpen={isModalOpen} 
        title="Delete hosted zone" 
        message="Are you sure you want to delete this hosted zone? All associated DNS records will be permanently deleted. This action cannot be undone."
        onConfirm={handleDeleteConfirm} 
        onCancel={() => setIsModalOpen(false)} 
      />

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-aws-text">Hosted zones</h1>
        <p className="text-xs text-aws-muted mt-1">
          A hosted zone contains records that define how you want to route traffic on the internet for a domain.
        </p>
      </div>

      <div className="bg-white border border-aws-border rounded shadow-sm">
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
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!selectedZoneId}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded font-bold border ${
                selectedZoneId
                  ? "border-aws-borderDark text-aws-text hover:bg-gray-50"
                  : "border-transparent text-gray-400 bg-gray-100 cursor-not-allowed"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <Link
              href="/hostedzones/create"
              className="flex items-center space-x-1 bg-aws-orange hover:bg-aws-orangeHover text-white px-3 py-1.5 rounded font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create hosted zone</span>
            </Link>
          </div>
        </div>

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
                  <td colSpan={6} className="px-3 py-6 text-center text-aws-muted">
                    No hosted zones found. Click <span className="font-bold">Create hosted zone</span> to get started.
                  </td>
                </tr>
              ) : (
                paginatedZones.map((z) => (
                  <tr
                    key={z.id}
                    className={`hover:bg-blue-50/40 ${
                      selectedZoneId === z.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="radio"
                        checked={selectedZoneId === z.id}
                        onChange={() => setSelectedZoneId(z.id)}
                        className="text-aws-blue focus:ring-aws-blue cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/hostedzones/${z.id}`}
                        className="text-aws-blue hover:text-aws-blueHover hover:underline font-medium"
                      >
                        {z.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">{z.type}</td>
                    <td className="px-3 py-2.5 text-aws-muted">{z.description || "-"}</td>
                    <td className="px-3 py-2.5">{z.record_count}</td>
                    <td className="px-3 py-2.5 text-aws-muted font-mono text-[11px]">{z.id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {zones.length > 0 && (
          <div className="p-3 border-t border-aws-border flex items-center justify-between text-xs text-aws-muted">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, zones.length)} of {zones.length} records
            </span>
            <div className="flex items-center space-x-3">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)} 
                className="p-1 border border-aws-borderDark rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-aws-text font-bold">{currentPage}</span>
              <button 
                disabled={currentPage === totalPages || totalPages === 0} 
                onClick={() => setCurrentPage(p => p + 1)} 
                className="p-1 border border-aws-borderDark rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}