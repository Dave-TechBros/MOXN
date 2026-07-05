/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  FileEdit, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Heart, 
  Eye, 
  Plus, 
  FileText,
  UserCheck,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Activity,
  ArrowLeft
} from "lucide-react";
import { api } from "../lib/api.js";
import { Article, User } from "../types.js";
import { WriterViewsChart } from "./AnalyticsCharts.js";

interface DashboardWriterProps {
  onNavigate: (view: string, params?: any) => void;
  activeTab?: string;
}

export default function DashboardWriter({ onNavigate, activeTab = "analytics" }: DashboardWriterProps) {
  const [tab, setTab] = useState(activeTab);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);

  const fetchWriterData = async () => {
    setLoading(true);
    try {
      const statsData = await api.getAnalytics();
      setStats(statsData);
      
      const allArts = await api.getArticles();
      setArticles(allArts);
    } catch (err) {
      console.error("Failed to load writer dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWriterData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-24 text-center">
        <Activity className="w-8 h-8 text-[#1E3A8A] animate-spin mx-auto" />
        <p className="text-xs font-bold text-gray-500 mt-2">Compiling private writer telemetry...</p>
      </div>
    );
  }

  const { summary, dailyViews, articlesList } = stats;

  const draftsList = articles.filter(a => a.status === "Draft" || a.status === "In Review" || a.status === "Rejected");
  const publishedList = articles.filter(a => a.status === "Published");

  return (
    <div className="space-y-6">
      
      {/* Back navigation button */}
      <div>
        <button 
          onClick={() => onNavigate("home")}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-[#1E3A8A] transition-colors bg-gray-50 hover:bg-gray-100 rounded-full px-3.5 py-1.5 border border-gray-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Editorial Feed</span>
        </button>
      </div>

      {/* Dashboard Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 font-sans tracking-tight">Reporter Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Author writing desk, publication status, and article telemetry logs.</p>
        </div>
        <button
          onClick={() => onNavigate("write")}
          className="flex items-center space-x-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-full shadow-lg transition-transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Dispatch</span>
        </button>
      </div>

      {/* Numerical Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dispatches Live</p>
          <p className="text-xl font-black text-gray-800 mt-1">{summary.published}</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Review</p>
          <p className="text-xl font-black text-amber-600 mt-1">{summary.pending}</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Reads</p>
          <p className="text-xl font-black text-gray-800 mt-1">{summary.reads.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Interaction Likes</p>
          <p className="text-xl font-black text-red-500 mt-1">{summary.likes.toLocaleString()}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 text-xs font-bold text-gray-500">
        <button 
          onClick={() => setTab("analytics")}
          className={`py-2.5 px-4 border-b-2 transition-colors ${tab === "analytics" ? "border-[#1E3A8A] text-[#1E3A8A]" : "border-transparent hover:text-gray-800"}`}
        >
          Insights & Telemetry
        </button>
        <button 
          onClick={() => setTab("drafts")}
          className={`py-2.5 px-4 border-b-2 transition-colors ${tab === "drafts" ? "border-[#1E3A8A] text-[#1E3A8A]" : "border-transparent hover:text-gray-800"}`}
        >
          Drafting Queue ({draftsList.length})
        </button>
        <button 
          onClick={() => setTab("published")}
          className={`py-2.5 px-4 border-b-2 transition-colors ${tab === "published" ? "border-[#1E3A8A] text-[#1E3A8A]" : "border-transparent hover:text-gray-800"}`}
        >
          Published Dispatches ({publishedList.length})
        </button>
      </div>

      {/* Tab Panels */}
      {tab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <WriterViewsChart dailyViews={dailyViews} />
          </div>
          
          <div className="lg:col-span-4 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-800 flex items-center">
              <TrendingUp className="w-4.5 h-4.5 mr-1.5 text-green-500" /> Leading Headlines
            </h3>
            <div className="space-y-3">
              {articlesList.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No readership logged yet.</p>
              ) : (
                articlesList.slice(0, 5).map((art: any, i: number) => (
                  <div key={i} className="flex items-start justify-between text-xs py-2 border-b border-gray-50 last:border-0">
                    <p className="font-semibold text-gray-700 line-clamp-1 pr-4">{art.title}</p>
                    <div className="flex items-center space-x-2 shrink-0 text-[11px] font-mono font-bold text-gray-400">
                      <span className="flex items-center"><Eye className="w-3 h-3 mr-0.5" /> {art.reads}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "drafts" && (
        <div className="space-y-4">
          {draftsList.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-xs">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p>Your drafting queue is currently empty.</p>
              <button 
                onClick={() => onNavigate("write")}
                className="mt-3.5 px-4 py-1.5 bg-[#1E3A8A] text-white rounded-full font-bold"
              >
                Create a draft
              </button>
            </div>
          ) : (
            draftsList.map(art => (
              <div key={art.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                      {art.categoryId}
                    </span>
                    
                    {art.status === "Draft" && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        Local Draft
                      </span>
                    )}
                    {art.status === "In Review" && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 animate-pulse">
                        In Review Queue
                      </span>
                    )}
                    {art.status === "Rejected" && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                        Revision Required
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-gray-800 leading-snug">{art.title}</h3>
                  <p className="text-[10px] text-gray-400">Created: {new Date(art.createdAt).toLocaleDateString()}</p>

                  {/* Rejected feedback panel */}
                  {art.status === "Rejected" && art.rejectReason && (
                    <div className="bg-red-50/60 border border-red-100 p-3.5 rounded-xl mt-3 flex items-start space-x-2 text-xs text-red-800 leading-relaxed max-w-2xl">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Managing Editor Notes:</p>
                        <p className="text-[11px] text-red-700 mt-1 font-medium">{art.rejectReason}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onNavigate("write", { id: art.id })}
                    className="p-1.5 hover:bg-gray-100 rounded border border-gray-200 text-gray-600 hover:text-[#1E3A8A] flex items-center space-x-1 text-[11px] font-bold"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Edit Desk</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "published" && (
        <div className="space-y-4">
          {publishedList.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-xs">
              No live dispatches detected on the server database.
            </div>
          ) : (
            publishedList.map(art => (
              <div key={art.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                      Live / Live
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Published: {new Date(art.publishedAt || "").toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-800 leading-snug">{art.title}</h3>
                  <div className="flex items-center space-x-4 pt-1.5 text-[10px] font-bold text-gray-400">
                    <span className="flex items-center"><Eye className="w-3.5 h-3.5 mr-0.5" /> {art.readCount} Reads</span>
                    <span className="flex items-center"><Heart className="w-3.5 h-3.5 mr-0.5" /> {art.likeCount} Likes</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onNavigate("article", { slug: art.slug })}
                    className="px-3.5 py-1.5 bg-gray-50 border border-gray-200 hover:border-[#1E3A8A] text-gray-700 hover:text-[#1E3A8A] rounded-full text-xs font-bold transition-all"
                  >
                    View Dispatch
                  </button>
                  <button
                    onClick={() => onNavigate("write", { id: art.id })}
                    className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xs font-bold transition-all"
                  >
                    Modify
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
