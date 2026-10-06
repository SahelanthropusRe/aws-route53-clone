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
    <div className="min-h-screen bg-[#f2f3f3] dark:bg-[#0f1722] flex flex-col items-center justify-center py-12 px-4 font-sans text-[#0f1419] transition-colors">
      
      {/* AWS Logo */}
<div className="mb-6">
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
    alt="AWS"
    width={80}
    height={48}
    className="h-12 w-auto dark:invert dark:hue-rotate-180 transition-all"
  />
</div>

      {/* Main Container */}
      <div className="flex flex-col md:flex-row w-full max-w-[900px] bg-white dark:bg-[#182231] rounded-lg shadow-[0_1px_4px_rgba(0,0,0,0.05)] border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
        
        {/* Left Column: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-[28px] font-bold mb-2 text-[#0f1419] dark:text-white transition-colors">
            {isRegistering ? "Create Account" : "Sign In"}
          </h1>
          <p className="text-[13px] text-gray-700 dark:text-gray-400 mb-6 transition-colors">
            Access your AWS clone account.
          </p>

          {/* Error / Success Alert */}
          {error && (
            <div className={`flex items-center p-3 mb-6 rounded border text-xs font-medium ${
              error.includes("successful") 
                ? "bg-[#f2f8f5] border-[#1d8102] text-[#1d8102] dark:bg-green-900/30 dark:border-green-600 dark:text-green-400" 
                : "bg-[#fdf3f3] border-[#d13212] text-[#d13212] dark:bg-red-900/30 dark:border-red-600 dark:text-red-400"
            }`}>
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* IAM Username */}
            <div className="space-y-1">
              <label className="block text-[13px] font-bold text-[#0f1419] dark:text-gray-200 transition-colors">
                IAM user name
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-[#879196] dark:border-gray-600 bg-white dark:bg-[#0f1722] text-[#0f1419] dark:text-gray-200 rounded-[3px] focus:outline-none focus:border-[#0073bb] focus:ring-1 focus:ring-[#0073bb] transition-all text-[13px]"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-[13px] font-bold text-[#0f1419] dark:text-gray-200 transition-colors">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-[#879196] dark:border-gray-600 bg-white dark:bg-[#0f1722] text-[#0f1419] dark:text-gray-200 rounded-[3px] focus:outline-none focus:border-[#0073bb] focus:ring-1 focus:ring-[#0073bb] transition-all text-[13px]"
              />
            </div>

            {/* Solid Pill Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#ff9900] hover:bg-[#ec7211] text-[#0f1419] font-bold py-2 rounded-full text-[13px] transition-colors disabled:opacity-50"
            >
              {loading ? "Please wait..." : isRegistering ? "Register" : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="px-3 text-[12px] font-bold text-gray-500 dark:text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          </div>

          {/* Outline Pill Button */}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            className="w-full border border-[#879196] dark:border-gray-600 text-[#0073bb] dark:text-[#3b99fc] font-bold py-2 rounded-full text-[13px] hover:bg-[#f2f8fd] dark:hover:bg-[#1e2a3a] transition-colors"
          >
            {isRegistering ? "Already have an account? Sign in" : "New to AWS? Sign up"}
          </button>

          {/* Footer Text */}
          <p className="mt-8 text-center text-[11px] text-[#545b64] dark:text-gray-500 leading-relaxed transition-colors">
            By continuing, you agree to AWS Clone <a href="#" className="text-[#0073bb] dark:text-[#3b99fc] hover:underline">Customer Agreement</a> or
            other agreement for AWS services, and the <a href="#" className="text-[#0073bb] dark:text-[#3b99fc] hover:underline">Privacy Notice</a>.
            This site uses essential cookies. See our <a href="#" className="text-[#0073bb] dark:text-[#3b99fc] hover:underline">Cookie Notice</a> for more information.
          </p>
        </div>

        {/* Right Column: Promotional Banner */}
        <div className="hidden md:flex w-full md:w-1/2 bg-[#0a0c10] p-12 flex-col justify-center relative overflow-hidden">
          
          {/* Abstract Wireframe Cubes Background */}
          <div className="absolute bottom-[-10%] right-[-10%] opacity-40">
            <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M200 150L250 120V60L200 90V150Z" stroke="url(#paint0_linear)" strokeWidth="2"/>
              <path d="M200 150L150 120V60L200 90V150Z" stroke="url(#paint1_linear)" strokeWidth="2"/>
              <path d="M200 90L250 60L200 30L150 60L200 90Z" stroke="url(#paint2_linear)" strokeWidth="2"/>
              <defs>
                <linearGradient id="paint0_linear" x1="200" y1="150" x2="250" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ff9900" />
                  <stop offset="1" stopColor="#d13212" />
                </linearGradient>
                <linearGradient id="paint1_linear" x1="200" y1="150" x2="150" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6b1bc2" />
                  <stop offset="1" stopColor="#0073bb" />
                </linearGradient>
                <linearGradient id="paint2_linear" x1="150" y1="60" x2="250" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#d13212" />
                  <stop offset="1" stopColor="#6b1bc2" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Banner Content */}
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Agent Toolkit<br />For AWS
            </h2>
            <p className="text-[15px] text-gray-300">
              Give your AI coding agents the tools, knowledge, and guardrails for AWS services.
            </p>
            <a href="#" className="inline-flex items-center text-white font-bold hover:underline pt-4">
              Learn more <span className="ml-1">&rarr;</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}