"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

export default function CreateHostedZonePage() {
  const router = useRouter();
  const [domainName, setDomainName] = useState("");
  const [description, setDescription] = useState("");
  const [zoneType, setZoneType] = useState("Public hosted zone");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainName) return;

    try {
      setSubmitting(true);
      await fetchApi("/api/hostedzones", {
        method: "POST",
        body: JSON.stringify({
          name: domainName,
          description,
          type: zoneType,
        }),
      });
      router.push("/hostedzones");
    } catch (err: any) {
      alert(err.message || "Failed to create hosted zone");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="text-xs text-aws-muted">
        <Link href="/hostedzones" className="hover:underline">Hosted zones</Link> &gt; Create hosted zone
      </div>
      <h1 className="text-xl font-bold text-aws-text">Create hosted zone</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-aws-border rounded p-6 space-y-6 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-aws-text mb-1">
            Domain name <span className="text-red-500">*</span>
          </label>
          <p className="text-[11px] text-aws-muted mb-2">
            Enter the domain name (e.g., example.com).
          </p>
          <input
            type="text"
            required
            placeholder="example.com"
            value={domainName}
            onChange={(e) => setDomainName(e.target.value)}
            className="w-full max-w-md text-xs px-3 py-2 border border-aws-borderDark rounded focus:outline-none focus:border-aws-orange"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-aws-text mb-1">
            Description
          </label>
          <input
            type="text"
            placeholder="Optional zone description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full max-w-md text-xs px-3 py-2 border border-aws-borderDark rounded focus:outline-none focus:border-aws-orange"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-aws-text mb-2">
            Type
          </label>
          <div className="space-y-3">
            <label className="flex items-start space-x-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="type"
                value="Public hosted zone"
                checked={zoneType === "Public hosted zone"}
                onChange={(e) => setZoneType(e.target.value)}
                className="mt-0.5 text-aws-orange focus:ring-aws-orange"
              />
              <div>
                <span className="font-semibold text-aws-text">Public hosted zone</span>
                <p className="text-aws-muted text-[11px]">Routes traffic on the internet.</p>
              </div>
            </label>

            <label className="flex items-start space-x-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="type"
                value="Private hosted zone"
                checked={zoneType === "Private hosted zone"}
                onChange={(e) => setZoneType(e.target.value)}
                className="mt-0.5 text-aws-orange focus:ring-aws-orange"
              />
              <div>
                <span className="font-semibold text-aws-text">Private hosted zone</span>
                <p className="text-aws-muted text-[11px]">Routes traffic within an Amazon VPC.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-aws-border flex items-center justify-end space-x-3 text-xs">
          <Link
            href="/hostedzones"
            className="px-4 py-2 border border-aws-borderDark rounded font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-aws-orange hover:bg-aws-orangeHover text-white px-5 py-2 rounded font-bold shadow-sm disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create hosted zone"}
          </button>
        </div>
      </form>
    </div>
  );
}