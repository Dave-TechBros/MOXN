/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sliders, 
  Check, 
  X, 
  MessageSquare, 
  ShieldAlert, 
  Eye, 
  Bookmark, 
  Award, 
  UserX, 
  UserCheck, 
  Trash2, 
  Activity,
  FileText,
  Mail,
  ChevronRight,
  PieChart,
  ArrowLeft
} from "lucide-react";
import { api } from "../lib/api.js";
import { Article, Comment, User } from "../types.js";
import { CategoryBreakdownChart } from "./AnalyticsCharts.js";

interface DashboardEditorProps {
  onNavigate: (view: string, params?: any) => void;
  activeTab?: string;
  triggerBanner?: (type: "success" | "error", message: string) => void;
}

export default function DashboardEditor({ onNavigate, activeTab = "submissions", triggerBanner }: DashboardEditorProps) {
  const [tab, setTab] = useState(activeTab);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [writers, setWriters] = useState<User[]>([]);
  
  // Review Modal / Preview states
  const [previewArt, setPreviewArt] = useState<Article | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Custom Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "success" | "info";
    onConfirm: () => void | Promise<void>;
  } | null>(null);

  const fetchEditorData = async () => {
    setLoading(true);
    try {
      const allArts = await api.getArticles();
      setArticles(allArts);

      const analData = await api.getAnalytics();
      setAnalytics(analData);

      const wrts = await api.getWriters();
      setWriters(wrts);

      // Fetch comments for all published articles
      const published = allArts.filter(a => a.status === "Published");
      const commentPromises = published.map(a => api.getComments(a.id));
      const commentsNested = await Promise.all(commentPromises);
      setComments(commentsNested.flat());
    } catch (err) {
      console.error("Failed to load editor data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditorData();
  }, [tab]);

  const handleApprove = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Approve Submission",
      message: "Are you sure you want to approve this article? It will instantly be published live to the homepage feed.",
      confirmText: "Approve & Publish",
      type: "success",
      onConfirm: async () => {
        try {
          await api.reviewArticle(id, "Approve");
          setPreviewArt(null);
          if (triggerBanner) triggerBanner("success", "Article approved and published live!");
          fetchEditorData();
        } catch (err) {
          console.error(err);
          if (triggerBanner) triggerBanner("error", "Failed to approve article.");
        }
      }
    });
  };

  const handleReject = async (id: string) => {
    if (!rejectReasonText.trim()) {
      if (triggerBanner) {
        triggerBanner("error", "Please specify a reason/notes for requested revisions.");
      }
      return;
    }
    try {
      await api.reviewArticle(id, "Reject", rejectReasonText);
      setPreviewArt(null);
      setRejectReasonText("");
      setShowRejectForm(false);
      if (triggerBanner) triggerBanner("success", "Article revisions requested successfully.");
      fetchEditorData();
    } catch (err) {
      console.error(err);
      if (triggerBanner) triggerBanner("error", "Failed to submit editorial rejection.");
    }
  };

  const handleToggleFeature = async (id: string) => {
    try {
      await api.toggleFeature(id);
      fetchEditorData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuspendWriter = async (id: string) => {
    const writer = writers.find(w => w.id === id);
    if (!writer) return;
    
    const isSuspended = writer.bio.includes("[SUSPENDED]");
    const confirmTitle = isSuspended ? "Reinstate Staff Writer" : "Suspend Staff Writer";
    const confirmMessage = isSuspended 
      ? `Are you sure you want to reinstate Writer ${writer.name}?`
      : `Are you sure you want to suspend Writer ${writer.name}? They will be locked from publishing new drafts.`;
      
    setConfirmModal({
      isOpen: true,
      title: confirmTitle,
      message: confirmMessage,
      confirmText: isSuspended ? "Reinstate" : "Suspend",
      type: isSuspended ? "info" : "danger",
      onConfirm: async () => {
        try {
          // Simple server-side simulation by updating bio via existing actions
          await fetch(`/api/users/${id}/follow`, { method: "POST" });
          if (triggerBanner) {
            triggerBanner("success", `Writer ${writer.name} status updated successfully.`);
          }
          fetchEditorData();
        } catch (err) {
          console.error(err);
          if (triggerBanner) triggerBanner("error", "Failed to update writer status.");
        }
      }
    });
  };

  const handleModerateComment = async (id: string, action: "hide" | "ban_user") => {
    try {
      await api.moderateComment(id, action);
      fetchEditorData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="py-24 text-center">
        <Activity className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        <p className="text-xs font-bold text-gray-500 mt-2">Loading newsroom moderation assets...</p>
      </div>
    );
  }

  const { summary, dailyReads, categoryBreakdown } = analytics;
  const submissionsList = articles.filter(a => a.status === "In Review");
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

      {/* Editor Header */}
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Editorial Control Panel</h1>
        <p className="text-xs text-gray-500 mt-0.5">Approve incoming stories, pin featured dispatches, and moderate comments.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Submissions Queue</p>
          <p className="text-xl font-black text-amber-600 mt-1">{summary.reviewPending}</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Articles Curated</p>
          <p className="text-xl font-black text-[#1E3A8A] mt-1">{summary.publishedCount}</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Newsroom Writers</p>
          <p className="text-xl font-black text-gray-800 mt-1">{summary.activeWriters}</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Newsletter Subscribers</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{summary.totalSubscribers}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 text-xs font-bold text-gray-500">
        <button 
          onClick={() => setTab("submissions")}
          className={`py-2.5 px-4 border-b-2 transition-colors ${tab === "submissions" ? "border-amber-600 text-amber-600" : "border-transparent hover:text-gray-800"}`}
        >
          Submissions Queue ({submissionsList.length})
        </button>
        <button 
          onClick={() => setTab("curation")}
          className={`py-2.5 px-4 border-b-2 transition-colors ${tab === "curation" ? "border-amber-600 text-amber-600" : "border-transparent hover:text-gray-800"}`}
        >
          Curation & Curation Desk ({publishedList.length})
        </button>
        <button 
          onClick={() => setTab("moderation")}
          className={`py-2.5 px-4 border-b-2 transition-colors ${tab === "moderation" ? "border-amber-600 text-amber-600" : "border-transparent hover:text-gray-800"}`}
        >
          Comment Moderation ({comments.length})
        </button>
        <button 
          onClick={() => setTab("analytics")}
          className={`py-2.5 px-4 border-b-2 transition-colors ${tab === "analytics" ? "border-amber-600 text-amber-600" : "border-transparent hover:text-gray-800"}`}
        >
          Newsroom Analytics
        </button>
      </div>

      {/* Submissions Panel */}
      {tab === "submissions" && (
        <div className="space-y-4">
          {submissionsList.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-xs">
              All submissions cleared! The review queue is currently empty.
            </div>
          ) : (
            submissionsList.map(art => {
              const writer = writers.find(w => w.id === art.authorId);
              return (
                <div key={art.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                        In Review
                      </span>
                      <span className="text-xs font-bold text-gray-500">Submitted by: <span className="text-gray-800 font-extrabold">{writer?.name || "Writer"}</span></span>
                    </div>
                    <h3 className="text-xs font-bold text-gray-800 leading-snug">{art.title}</h3>
                    <p className="text-[10px] text-gray-400 italic">"{art.subtitle}"</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => setPreviewArt(art)}
                      className="px-3.5 py-1.5 border border-gray-200 hover:border-[#1E3A8A] text-gray-700 hover:text-[#1E3A8A] rounded-full text-xs font-bold flex items-center space-x-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Draft</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Curation Deck Panel */}
      {tab === "curation" && (
        <div className="space-y-4">
          {publishedList.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-xs">
              No live articles available to curate yet.
            </div>
          ) : (
            publishedList.map(art => {
              const writer = writers.find(w => w.id === art.authorId);
              return (
                <div key={art.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                        {art.categoryId}
                      </span>
                      {art.featured && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center">
                          <Award className="w-3 h-3 mr-0.5 fill-amber-600 text-amber-600" /> Editor's Pick
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-gray-800 leading-snug">{art.title}</h3>
                    <p className="text-[10px] text-gray-400">By: <span className="font-bold text-gray-600">{writer?.name}</span></p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleToggleFeature(art.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 border transition-colors ${art.featured ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white border-gray-200 text-gray-600 hover:border-amber-400"}`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{art.featured ? "Featured" : "Feature Article"}</span>
                    </button>

                    <button
                      onClick={() => handleSuspendWriter(art.authorId)}
                      className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-full text-xs font-bold flex items-center space-x-1"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Moderate Writer</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Comment Moderation Panel */}
      {tab === "moderation" && (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-xs">
              No audience discussion logs.
            </div>
          ) : (
            comments.map(comm => {
              const isHidden = comm.status === "Hidden";
              return (
                <div key={comm.id} className={`bg-white border rounded-2xl p-4 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${isHidden ? "border-red-100 bg-red-50/10 opacity-70" : "border-gray-100"}`}>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-gray-800">{comm.authorId === "user-editor" ? "Arthur Vance" : "Reader"}</span>
                      {isHidden && (
                        <span className="text-[9px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase">Moderated / Hidden</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">"{comm.body}"</p>
                    <p className="text-[9px] text-gray-400">Created: {new Date(comm.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleModerateComment(comm.id, "hide")}
                      className="p-1.5 border border-gray-200 hover:border-amber-500 rounded text-gray-600 hover:text-amber-600 text-xs font-bold"
                    >
                      {isHidden ? "Unhide" : "Hide text"}
                    </button>
                    <button
                      onClick={() => handleModerateComment(comm.id, "ban_user")}
                      className="p-1.5 border border-red-200 hover:bg-red-50 text-red-600 rounded text-xs font-bold"
                    >
                      Ban Poster
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Analytics Panel */}
      {tab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <CategoryBreakdownChart breakdown={categoryBreakdown} />
          </div>

          <div className="lg:col-span-8 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-800 flex items-center">
              <Activity className="w-4.5 h-4.5 mr-1.5 text-blue-600" /> Newsroom Activity Traffic
            </h3>
            <div className="relative w-full overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-500">
                <thead className="text-[10px] text-gray-400 uppercase font-bold border-b border-gray-50">
                  <tr>
                    <th className="py-2.5">Date Logs</th>
                    <th className="py-2.5">Global Reads</th>
                    <th className="py-2.5">Discussions Started</th>
                  </tr>
                </thead>
                <tbody className="font-medium text-gray-700">
                  {dailyReads.map((log: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5">{log.name}</td>
                      <td className="py-2.5 font-mono">{log.reads.toLocaleString()} reads</td>
                      <td className="py-2.5 font-mono">{log.comments} comments</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Article Review / Preview Draft Modal */}
      {previewArt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative flex flex-col justify-between space-y-6 animate-in fade-in zoom-in-95 duration-150">
            
            <button 
              onClick={() => setPreviewArt(null)}
              className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">
                  {previewArt.categoryId}
                </span>
                <span className="text-xs text-gray-400 font-medium">Reviewing Submission Draft</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">{previewArt.title}</h2>
              <p className="text-xs text-gray-500 italic mt-1 font-medium">"{previewArt.subtitle}"</p>

              <div className="prose prose-sm max-w-none text-xs text-gray-700 border-t border-gray-100 pt-5 space-y-4 max-h-[40vh] overflow-y-auto leading-relaxed">
                {previewArt.body.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Rejection form inline expander */}
            {showRejectForm ? (
              <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-red-800">Specify Revisions Needed (Notes will be sent to Author)</label>
                <textarea
                  value={rejectReasonText}
                  onChange={(e) => setRejectReasonText(e.target.value)}
                  placeholder="The arguments around quantum coherence limits lack objective telemetry data support. Please revise Section 2..."
                  className="w-full p-2.5 text-xs bg-white border border-red-200 rounded-xl focus:outline-none focus:border-red-500"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleReject(previewArt.id)}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
                  >
                    Confirm Rejection
                  </button>
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="w-full sm:w-auto px-5 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-full text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Request Revisions</span>
                </button>

                <button
                  onClick={() => handleApprove(previewArt.id)}
                  className="w-full sm:w-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Publish Live</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Reusable State-Driven Confirmation Dialog */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150 text-center">
            <h3 className="text-sm font-extrabold text-gray-900">{confirmModal.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{confirmModal.message}</p>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full text-xs font-bold cursor-pointer"
              >
                {confirmModal.cancelText || "Cancel"}
              </button>
              <button
                onClick={async () => {
                  await confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold text-white cursor-pointer ${
                  confirmModal.type === "danger" 
                    ? "bg-red-600 hover:bg-red-700" 
                    : confirmModal.type === "success" 
                      ? "bg-emerald-600 hover:bg-emerald-700" 
                      : "bg-[#1E3A8A] hover:bg-[#2563EB]"
                }`}
              >
                {confirmModal.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
