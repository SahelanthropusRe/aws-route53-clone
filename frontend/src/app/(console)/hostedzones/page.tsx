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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // UI Upgrade States
  const [alert, setAlert] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadZones = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<HostedZone[]>(`/api/hostedzones${search ? `?search=${search}` : ""}`);
      setZones(data);
      setCurrentPage(1); // Reset to page 1 when data changes
      setSelectedIds([]); // Clear selection when refreshing or searching
    } catch (err: any) {
      console.error("Failed to load zones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, [search]);

  // Pagination Math (needed before toggle functions)
  const totalPages = Math.ceil(zones.length / itemsPerPage);
  const paginatedZones = zones.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Bulk Select Logic
  const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedZones.map((z) => z.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleOne = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk Delete Logic
  const handleDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    setIsModalOpen(false);
    setIsDeleting(true);

    try {
      // Execute all delete requests concurrently
      await Promise.all(
        selectedIds.map((id) => 
          fetchApi(`/api/hostedzones/${id}`, { method: "DELETE" })
        )
      );
      setAlert({ type: "success", message: `Successfully deleted ${selectedIds.length} hosted zone(s).` });
      setSelectedIds([]);
      loadZones();
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Failed to delete one or more hosted zones." });
    } finally {
      setIsDeleting(false);
    }
  };

  const isAllOnPageSelected = paginatedZones.length > 0 && paginatedZones.every((z) => selectedIds.includes(z.id));

  return (
    <div className="space-y-4 max-w-7xl mx-auto relative">
      
      {/* Alert & Modal Components */}
      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: null, message: "" })} />
      <Modal 
        isOpen={isModalOpen} 
        title={`Delete ${selectedIds.length} hosted zone${selectedIds.length > 1 ? 's' : ''}`} 
        message={`Are you sure you want to delete ${selectedIds.length} hosted zone(s)? All associated DNS records will be permanently deleted. This action cannot be undone.`}
        onConfirm={handleDeleteConfirm} 
        onCancel={() => setIsModalOpen(false)} 
      />

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-aws-text dark:text-white transition-colors">Hosted zones</h1>
        <p className="text-xs text-aws-muted dark:text-gray-400 mt-1 transition-colors">
          A hosted zone contains records that define how you want to route traffic on the internet for a domain.
        </p>
      </div>

      <div className="bg-white dark:bg-[#182231] border border-aws-border dark:border-gray-800 rounded shadow-sm transition-colors">
        <div className="p-3 border-b border-aws-border dark:border-gray-800 flex items-center justify-between gap-4 transition-colors">
          <div className="relative w-80">
            <input
              id="page-search"
              type="text"
              placeholder="Filter by hosted zone name [Alt+S]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-aws-borderDark dark:border-gray-700 bg-white dark:bg-[#0f1722] text-aws-text dark:text-gray-200 rounded focus:outline-none focus:border-aws-orange dark:focus:border-aws-orange transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-aws-muted dark:text-gray-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={loadZones}
              className="p-1.5 border border-aws-borderDark dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-aws-muted dark:text-gray-400 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDeleting ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={selectedIds.length === 0 || isDeleting}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded font-bold border transition-colors ${
                selectedIds.length > 0 && !isDeleting
                  ? "border-aws-borderDark dark:border-gray-700 text-aws-text dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  : "border-transparent text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}</span>
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafafa] dark:bg-[#0f1722] border-b border-aws-border dark:border-gray-800 text-aws-muted dark:text-gray-400 font-bold transition-colors">
              <tr>
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={isAllOnPageSelected}
                    onChange={handleToggleAll}
                    className="text-aws-blue focus:ring-aws-blue rounded-sm cursor-pointer"
                  />
                </th>
                <th className="px-3 py-2.5">Hosted zone name</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Description</th>
                <th className="px-3 py-2.5">Record count</th>
                <th className="px-3 py-2.5">Hosted zone ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aws-border dark:divide-gray-800 transition-colors">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-aws-muted dark:text-gray-400">
                    Loading hosted zones...
                  </td>
                </tr>
              ) : zones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-aws-muted dark:text-gray-400">
                    No hosted zones found. Click <span className="font-bold text-aws-text dark:text-gray-200">Create hosted zone</span> to get started.
                  </td>
                </tr>
              ) : (
                paginatedZones.map((z) => (
                  <tr
                    key={z.id}
                    className={`transition-colors ${
                      selectedIds.includes(z.id) 
                        ? "bg-blue-50 dark:bg-[#232f3e]" 
                        : "hover:bg-blue-50/40 dark:hover:bg-[#232f3e]"
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(z.id)}
                        onChange={() => handleToggleOne(z.id)}
                        className="text-aws-blue focus:ring-aws-blue rounded-sm cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/hostedzones/${z.id}`}
                        className="text-aws-blue dark:text-blue-400 hover:text-aws-blueHover dark:hover:text-blue-300 hover:underline font-medium transition-colors"
                      >
                        {z.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-aws-text dark:text-gray-300">{z.type}</td>
                    <td className="px-3 py-2.5 text-aws-muted dark:text-gray-400">{z.description || "-"}</td>
                    <td className="px-3 py-2.5 text-aws-text dark:text-gray-300">{z.record_count}</td>
                    <td className="px-3 py-2.5 text-aws-muted dark:text-gray-500 font-mono text-[11px]">{z.id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {zones.length > 0 && (
          <div className="p-3 border-t border-aws-border dark:border-gray-800 flex items-center justify-between text-xs text-aws-muted dark:text-gray-400 transition-colors">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, zones.length)} of {zones.length} records
            </span>
            <div className="flex items-center space-x-3">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)} 
                className="p-1 border border-aws-borderDark dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-aws-text dark:text-white font-bold">{currentPage}</span>
              <button 
                disabled={currentPage === totalPages || totalPages === 0} 
                onClick={() => setCurrentPage(p => p + 1)} 
                className="p-1 border border-aws-borderDark dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 transition-colors"
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