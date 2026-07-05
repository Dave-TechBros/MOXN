/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, ArrowRight, CheckCircle2, ShieldCheck, Heart } from "lucide-react";
import { api } from "../lib/api.js";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    try {
      await api.subscribeNewsletter(email);
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to subscribe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#0F172A] text-gray-300 mt-20 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="flex items-center space-x-2 text-left">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg shadow-lg">
                <span className="font-mono text-base font-bold text-white tracking-widest">M</span>
              </div>
              <span className="text-xl font-black tracking-tight text-white font-sans">
                MOXN
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              MOXN is an independent digital news publication and collaborative gist forum. We combine modern analytical journalism with open community reporting and high-standard editorial verification.
            </p>
            <div className="flex items-center space-x-2.5 pt-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>COMMUNITY GUIDELINES COMPLIANT</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-3">Publication</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Technology</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Science & Space</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Macro Economics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Culture Dispatches</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-3">Legal & Safe</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Charter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Editorial Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Vulnerability Report</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Join the Team</a></li>
              </ul>
            </div>
          </div>

          {/* Premium Newsletter Signup */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">MOXN Dispatches</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Join our newsletter list to receive weekly editorial dispatches, curated reviews, and deep-dive technical breakdowns.
              </p>
            </div>

            {success ? (
              <div className="bg-green-950/40 border border-green-800 p-3.5 rounded-xl flex items-start space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white">Subscription Confirmed</h5>
                  <p className="text-[11px] text-green-300 mt-0.5">You are now subscribed to MOXN dispatches.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-24 py-2 text-xs bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="absolute inset-y-1 right-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-colors"
                  >
                    <span>{loading ? "Adding..." : "Subscribe"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                {error && <p className="text-[10px] text-red-400 font-semibold">{error}</p>}
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500">
          <p>© 2026 MOXN. All rights reserved. Registered Digital Publication.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Crafted for modern journalism and high-fidelity reviews
          </p>
        </div>
      </div>
    </footer>
  );
}
