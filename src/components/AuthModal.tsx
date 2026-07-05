/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Sparkles, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  PenTool,
  Sliders,
  BookOpen
} from "lucide-react";
import { api, setActiveUser } from "../lib/api.js";
import { User, UserRole } from "../types.js";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, message: string) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("Reader");
  const [bio, setBio] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name || !email || !password || !role) {
          throw new Error("Please fill in all required fields.");
        }
        const response = await api.register({ name, email, password, role, bio });
        
        // Save to custom users and user credentials in localStorage
        const customUsers = JSON.parse(localStorage.getItem("moxn_custom_users") || "[]");
        // Ensure no duplicate email
        const filteredUsers = customUsers.filter((u: any) => u.email.toLowerCase() !== email.toLowerCase());
        filteredUsers.push({ id: response.user.id, name, email, password, role, bio });
        localStorage.setItem("moxn_custom_users", JSON.stringify(filteredUsers));
        localStorage.setItem("moxn_user_credentials", JSON.stringify({ id: response.user.id, name, email, password, role, bio }));

        setActiveUser(response.user);
        onSuccess(response.user, `Welcome to MOXN, ${response.user.name}! Your account has been registered.`);
        onClose();
      } else {
        if (!email || !password) {
          throw new Error("Please enter both email and password.");
        }
        
        try {
          const response = await api.login({ email, password });
          
          // Save active user credentials
          localStorage.setItem("moxn_user_credentials", JSON.stringify({
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            password: password,
            role: response.user.role,
            bio: response.user.bio
          }));

          // Also check if they are in customUsers list, if not add them
          const customUsers = JSON.parse(localStorage.getItem("moxn_custom_users") || "[]");
          const exists = customUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
          if (!exists) {
            customUsers.push({
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              password: password,
              role: response.user.role,
              bio: response.user.bio
            });
            localStorage.setItem("moxn_custom_users", JSON.stringify(customUsers));
          }

          setActiveUser(response.user);
          onSuccess(response.user, `Welcome back, ${response.user.name}. Authenticated successfully.`);
          onClose();
        } catch (loginErr: any) {
          // If login failed, check if we have them in local storage!
          const customUsers = JSON.parse(localStorage.getItem("moxn_custom_users") || "[]");
          const localMatch = customUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
          
          if (localMatch) {
            console.log("Found local user match, auto-registering on server for session self-heal.");
            const registerResp = await api.register({
              id: localMatch.id,
              name: localMatch.name,
              email: localMatch.email,
              password: localMatch.password,
              role: localMatch.role,
              bio: localMatch.bio
            });
            
            localStorage.setItem("moxn_user_credentials", JSON.stringify(localMatch));
            setActiveUser(registerResp.user);
            onSuccess(registerResp.user, `Welcome back, ${registerResp.user.name}. Authenticated successfully (session restored).`);
            onClose();
          } else {
            throw loginErr;
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify your entries.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          
          {/* Backdrop blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-950/80 backdrop-blur-xs z-0"
          />

          {/* Scrolling wrapper */}
          <div className="flex min-h-screen items-center justify-center p-4 text-center z-10 relative">
            
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-2xl p-6 space-y-6 text-left my-8"
            >
            
            {/* Close Trigger */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Title block */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-[#1E3A8A] rounded-lg shadow-md mb-2">
                <span className="font-mono text-base font-bold text-white tracking-widest">M</span>
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight font-sans">
                {isSignUp ? "Create a MOXN Profile" : "Access Editorial System"}
              </h2>
              <p className="text-[11px] text-gray-400">
                {isSignUp ? "Join our network of writers, editors, and technical readers." : "Authenticating credentials for role-based systems"}
              </p>
            </div>

            {/* Form submission */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-2 text-xs text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {isSignUp && (
                <>
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Arthur Vance"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2563EB] focus:bg-white focus:ring-1 focus:ring-[#2563EB] transition-all"
                      />
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Desired Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 text-xs text-gray-900 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2563EB] focus:bg-white focus:ring-1 focus:ring-[#2563EB] transition-all font-medium text-gray-700"
                    >
                      <option value="Reader">Reader (Personal Bookmarks & Comments)</option>
                      <option value="Writer">Writer (Write & Submit Dispatches)</option>
                      <option value="Editor">Editor (Full Editorial review control)</option>
                    </select>
                  </div>

                  {/* Bio Field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Short Bio (Optional)</label>
                    <textarea
                      placeholder="Brief professional summary..."
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2563EB] focus:bg-white focus:ring-1 focus:ring-[#2563EB] transition-all resize-none"
                    />
                  </div>
                </>
              )}

              {/* Email address */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="editor@moxn.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2563EB] focus:bg-white focus:ring-1 focus:ring-[#2563EB] transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-xs text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2563EB] focus:bg-white focus:ring-1 focus:ring-[#2563EB] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1E3A8A] hover:bg-[#2563EB] text-white py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 mt-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <span>{isSignUp ? "Register and Sign In" : "Sign In to System"}</span>
                )}
              </button>

            </form>

            {/* Switch tab */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              
              <div className="text-center text-[11px] text-gray-500">
                {isSignUp ? (
                  <span>
                    Already have an account?{" "}
                    <button 
                      onClick={() => { setIsSignUp(false); setError(null); }}
                      className="text-[#2563EB] font-bold hover:underline"
                    >
                      Sign In
                    </button>
                  </span>
                ) : (
                  <span>
                    New to the newsroom?{" "}
                    <button 
                      onClick={() => { setIsSignUp(true); setError(null); }}
                      className="text-[#2563EB] font-bold hover:underline"
                    >
                      Register Profile
                    </button>
                  </span>
                )}
              </div>

            </div>

          </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
