"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      if (isRegistering) {
        // Automatically switch to login mode after successful registration
        setIsRegistering(false);
        setError("Registration successful! Please log in.");
      } else {
        // Save the token and username to localStorage
        localStorage.setItem("route53_token", data.token);
        localStorage.setItem("route53_username", data.user.username);
        router.push("/hostedzones");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f3f3]">
      <div className="bg-white p-8 border border-aws-border rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-aws-text mb-6">
          {isRegistering ? "Create AWS Account" : "Sign in to AWS"}
        </h1>

        {error && (
          <div className={`flex items-center p-3 mb-4 rounded border text-xs font-medium ${
            error.includes("successful") ? "bg-[#f2f8f5] border-[#1d8102] text-[#1d8102]" : "bg-[#fdf3f3] border-[#d13212] text-[#d13212]"
          }`}>
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-aws-text mb-1">IAM user name</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-aws-borderDark rounded focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-aws-text mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-aws-borderDark rounded focus:outline-none focus:border-aws-blue focus:ring-1 focus:ring-aws-blue"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-aws-orange hover:bg-aws-orangeHover text-white font-bold py-2 px-4 rounded text-sm transition-colors"
          >
            {loading ? "Please wait..." : isRegistering ? "Register" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 border-t border-aws-border pt-4 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            className="text-aws-blue hover:text-aws-blueHover hover:underline text-xs"
          >
            {isRegistering ? "Already have an account? Sign in" : "Create a new IAM user"}
          </button>
        </div>
      </div>
    </div>
  );
}