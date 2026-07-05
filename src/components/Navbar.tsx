/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Bell, 
  User as UserIcon, 
  Sparkles, 
  ChevronDown, 
  Check, 
  LogOut,
  Sliders,
  PenTool,
  Bookmark,
  TrendingUp,
  X,
  Mail
} from "lucide-react";
import { api, getActiveUser, setActiveUser, logoutUser } from "../lib/api.js";
import { User, Notification, Category } from "../types.js";
import AuthModal from "./AuthModal.js";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  triggerBanner?: (type: "success" | "error", message: string) => void;
}

export default function Navbar({ 
  currentView, 
  onNavigate, 
  searchQuery, 
  setSearchQuery, 
  activeCategory, 
  setActiveCategory,
  triggerBanner
}: NavbarProps) {
  const [currentUser, setCurrentUser] = useState<User>(getActiveUser());
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [allWriters, setAllWriters] = useState<User[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const fetchNavbarDataId = useRef(0);

  // Simulation Users
  const simUsers: User[] = [
    {
      id: "guest",
      name: "Guest Reader",
      email: "guest@reader.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      role: "Reader",
      bio: "An active reader of design, modern technology, and global affairs.",
      createdAt: "2026-06-01T12:00:00Z",
      followersCount: 0,
      followingCount: 5
    },
    {
      id: "user-writer-1",
      name: "Sarah Jenkins",
      email: "sarah@moxn.com",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      role: "Writer",
      bio: "Senior Tech Correspondent. Ex-Wired. Covering the intersection of AI, hardware design, and digital human rights.",
      createdAt: "2026-02-15T09:00:00Z",
      followersCount: 940,
      followingCount: 120
    },
    {
      id: "user-writer-2",
      name: "David Chen",
      email: "david@moxn.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      role: "Writer",
      bio: "AI Architect & Computational Essayist. Documenting the cognitive boundaries of machine learning and large scale systems.",
      createdAt: "2026-02-20T10:30:00Z",
      followersCount: 780,
      followingCount: 95
    },
    {
      id: "user-editor",
      name: "Arthur Vance",
      email: "editor@moxn.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      role: "Editor",
      bio: "Editor-in-Chief at MOXN. 15+ years in digital journalism. Passionate about ethics, clarity, and bold reporting.",
      createdAt: "2026-01-10T12:00:00Z",
      followersCount: 1250,
      followingCount: 340
    }
  ];

  const fetchNavbarData = async () => {
    const callId = ++fetchNavbarDataId.current;
    try {
      const [cats, notifs, writers] = await Promise.all([
        api.getCategories(),
        currentUser.role !== "Reader" ? api.getNotifications() : Promise.resolve([]),
        api.getWriters()
      ]);
      if (callId !== fetchNavbarDataId.current) return;
      setCategories(cats);
      setNotifications(notifs);
      setAllWriters(writers);
    } catch (err) {
      console.error("Navbar data load failed", err);
    }
  };

  useEffect(() => {
    fetchNavbarData();

    const handleAuthChange = () => {
      const newUser = getActiveUser();
      setCurrentUser(newUser);
    };

    window.addEventListener("moxn_auth_changed", handleAuthChange);
    return () => {
      window.removeEventListener("moxn_auth_changed", handleAuthChange);
    };
  }, [currentUser.id]);

  const switchSimUser = (user: User) => {
    setActiveUser(user);
    setCurrentUser(user);
    setShowRoleMenu(false);
    onNavigate("home");
  };

  const handleMarkRead = async (id: string, link: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setShowNotifications(false);
      // parse navigation link
      if (link.startsWith("/article/")) {
        const slug = link.replace("/article/", "");
        onNavigate("article", { slug });
      } else if (link.startsWith("/dashboard")) {
        const urlParams = new URLSearchParams(link.split("?")[1]);
        const tab = urlParams.get("tab") || "analytics";
        onNavigate("dashboard", { tab });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-8">
            <button 
              id="moxn-logo"
              onClick={() => {
                setActiveCategory(null);
                setSearchQuery("");
                onNavigate("home");
              }}
              className="flex items-center space-x-2 text-left group"
            >
              <div className="flex items-center justify-center w-9 h-9 bg-[#1E3A8A] rounded-lg shadow-md group-hover:bg-[#2563EB] transition-colors duration-200">
                <span className="font-mono text-xl font-bold text-white tracking-widest">M</span>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-[#1E3A8A] font-sans group-hover:text-[#2563EB] transition-colors duration-200">
                MOXN
              </span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
              <button 
                id="nav-home"
                onClick={() => { setActiveCategory(null); onNavigate("home"); }}
                className={`hover:text-[#1E3A8A] py-1 transition-colors ${currentView === "home" && !activeCategory ? "text-[#1E3A8A] border-b-2 border-[#1E3A8A]" : ""}`}
              >
                Home
              </button>
              <button 
                id="nav-latest"
                onClick={() => { setActiveCategory(null); onNavigate("home"); setTimeout(() => document.getElementById("latest-stories-section")?.scrollIntoView({ behavior: "smooth" }), 100); }}
                className="hover:text-[#1E3A8A] transition-colors"
              >
                Latest
              </button>
              <div className="relative group/cats">
                <button 
                  id="nav-categories"
                  className="flex items-center hover:text-[#1E3A8A] transition-colors"
                >
                  Categories <ChevronDown className="w-4 h-4 ml-0.5" />
                </button>
                <div className="absolute top-full left-0 mt-1 hidden group-hover/cats:block w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setActiveCategory(cat.id); onNavigate("home"); }}
                      className={`block w-full text-left px-4 py-2 text-xs hover:bg-gray-50 hover:text-[#1E3A8A] ${activeCategory === cat.id ? "text-[#1E3A8A] bg-blue-50 font-semibold" : "text-gray-600"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                id="nav-writers"
                onClick={() => onNavigate("writers")}
                className={`hover:text-[#1E3A8A] py-1 transition-colors ${currentView === "writers" ? "text-[#1E3A8A] border-b-2 border-[#1E3A8A]" : ""}`}
              >
                Writers
              </button>
              <button 
                id="nav-bookmarks"
                onClick={() => onNavigate("bookmarks")}
                className={`hover:text-[#1E3A8A] py-1 transition-colors ${currentView === "bookmarks" ? "text-[#1E3A8A] border-b-2 border-[#1E3A8A]" : ""}`}
              >
                Bookmarks
              </button>
              <button 
                id="nav-profile"
                onClick={() => onNavigate("profile")}
                className={`hover:text-[#1E3A8A] py-1 transition-colors ${currentView === "profile" ? "text-[#1E3A8A] border-b-2 border-[#1E3A8A]" : ""}`}
              >
                My Profile
              </button>
            </nav>
          </div>

          {/* Actions & Simulation Control */}
          <div className="flex items-center space-x-4">
            
            {/* Search Bar */}
            <div className="relative hidden sm:block w-48 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="navbar-search-input"
                type="text"
                placeholder="Search headlines, tags..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => searchQuery.length > 0 && setShowSearchSuggestions(true)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all duration-150"
              />
              {/* Autocomplete Suggestions */}
              {showSearchSuggestions && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl p-3 z-50 text-xs">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-gray-400 pb-1.5 border-b border-gray-50">
                    <span>Quick Match</span>
                    <button onClick={() => setShowSearchSuggestions(false)}>
                      <X className="w-3 h-3 hover:text-gray-600" />
                    </button>
                  </div>
                  <div className="py-1.5 space-y-2">
                    <div className="font-medium text-gray-800">
                      Searching for: <span className="text-[#2563EB] font-bold">"{searchQuery}"</span>
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" /> Press <span className="mx-1 font-bold font-mono">Enter</span> to run full text search.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Panel Trigger */}
            {currentUser.role !== "Reader" && (
              <div className="relative">
                <button
                  id="notifications-bell-btn"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowRoleMenu(false);
                  }}
                  className="p-1.5 text-gray-500 hover:text-[#1E3A8A] hover:bg-gray-50 rounded-full relative transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-[#EF4444] text-[9px] font-bold text-white text-center leading-4 ring-2 ring-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden transform origin-top-right transition-all duration-200">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
                      <h3 className="text-xs font-bold text-gray-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-[#2563EB] hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400 text-xs">
                          No alerts or notifications yet.
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <button
                            key={notif.id}
                            onClick={() => handleMarkRead(notif.id, notif.link)}
                            className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex flex-col space-y-0.5 ${!notif.read ? "bg-blue-50/30" : ""}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider">{notif.type}</span>
                              <span className="text-[9px] text-gray-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-xs font-semibold text-gray-800">{notif.title}</h4>
                            <p className="text-[11px] text-gray-500 line-clamp-2">{notif.message}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions for Publishers */}
            {currentUser.role === "Writer" && (
              <button
                id="btn-nav-write"
                onClick={() => onNavigate("write")}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1E3A8A] rounded-full shadow-md transition-all duration-150 transform hover:-translate-y-0.5"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Write Story</span>
              </button>
            )}

            {currentUser.role === "Editor" && (
              <button
                id="btn-nav-curate"
                onClick={() => onNavigate("dashboard", { tab: "submissions" })}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-full shadow-md transition-all duration-150 transform hover:-translate-y-0.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Review Desk</span>
              </button>
            )}

            {/* Simulation Account Selector / Profile */}
            {currentUser.id === "guest" ? (
              <button
                id="navbar-sign-in-btn"
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#2563EB] rounded-full shadow-md transition-all duration-150 transform hover:-translate-y-0.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  id="user-profile-switcher-btn"
                  onClick={() => {
                    setShowRoleMenu(!showRoleMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center space-x-2 p-1 border border-gray-200 hover:border-[#1E3A8A] rounded-full bg-gray-50 transition-colors"
                >
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-7 h-7 rounded-full object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden lg:block text-left pr-2">
                    <p className="text-[11px] font-bold text-gray-800 leading-tight">{currentUser.name}</p>
                    <p className="text-[9px] font-medium text-gray-400 capitalize">{currentUser.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden lg:block" />
                </button>

                {/* Dropdown menu */}
                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Identity</p>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">{currentUser.name}</p>
                      <div className="flex items-center mt-1 space-x-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-wider">{currentUser.role} Control</span>
                      </div>
                    </div>

                    <div className="py-1">
                      {currentUser.role !== "Reader" && (
                        <button
                          onClick={() => {
                            setShowRoleMenu(false);
                            onNavigate("dashboard");
                          }}
                          className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                        >
                          <Sliders className="w-4 h-4 mr-2 text-gray-400" />
                          My Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          onNavigate("bookmarks");
                        }}
                        className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <Bookmark className="w-4 h-4 mr-2 text-gray-400" />
                        Bookmarks
                      </button>
                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          onNavigate("profile");
                        }}
                        className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                        My Profile
                      </button>
                    </div>

                    <div className="border-t border-gray-100 mt-2 pt-1.5">
                      <button
                        onClick={() => {
                          logoutUser();
                          setShowRoleMenu(false);
                          onNavigate("home");
                          if (triggerBanner) {
                            triggerBanner("success", "Successfully signed out.");
                          }
                        }}
                        className="flex items-center w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50/50 font-medium"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </header>

    <AuthModal
      isOpen={isAuthOpen}
      onClose={() => setIsAuthOpen(false)}
      onSuccess={(user, message) => {
        setCurrentUser(user);
        if (triggerBanner) {
          triggerBanner("success", message);
        }
      }}
    />
  </>
  );
}
