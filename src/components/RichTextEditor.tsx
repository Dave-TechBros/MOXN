/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Eye, 
  FileText, 
  HelpCircle, 
  Check, 
  AlertCircle, 
  Save, 
  Globe, 
  ChevronRight,
  TrendingUp,
  Tag,
  ArrowLeft
} from "lucide-react";
import { api } from "../lib/api.js";
import { Article, Category } from "../types.js";

interface RichTextEditorProps {
  articleId?: string;
  article?: Article | null;
  categories: Category[];
  onSaveSuccess: () => void;
  onNavigate?: (view: string, params?: any) => void;
}

export default function RichTextEditor({ articleId, article, categories, onSaveSuccess, onNavigate }: RichTextEditorProps) {
  const [title, setTitle] = useState(article?.title || "");
  const [subtitle, setSubtitle] = useState(article?.subtitle || "");
  const [body, setBody] = useState(article?.body || "");
  const [coverImage, setCoverImage] = useState(article?.coverImage || "");
  const [categoryId, setCategoryId] = useState(article?.categoryId || "tech");
  const [tagsInput, setTagsInput] = useState(article?.tags.join(", ") || "");
  const [seoTitle, setSeoTitle] = useState(article?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(article?.seoDescription || "");
  
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  
  // AI Helper states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<any | null>(null);
  const [aiSeo, setAiSeo] = useState<any | null>(null);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setSubtitle(article.subtitle);
      setBody(article.body);
      setCoverImage(article.coverImage);
      setCategoryId(article.categoryId);
      setTagsInput(article.tags.join(", "));
      setSeoTitle(article.seoTitle || "");
      setSeoDescription(article.seoDescription || "");
    } else {
      setTitle("");
      setSubtitle("");
      setBody("");
      setCoverImage("https://picsum.photos/seed/moxn_tech/1200/600");
      setCategoryId("tech");
      setTagsInput("");
      setSeoTitle("");
      setSeoDescription("");
    }
    setAiReport(null);
    setAiSuggestion(null);
    setAiSeo(null);
  }, [article, articleId]);

  // Simulated Autosave behavior
  useEffect(() => {
    if (!title || !body) return;
    const timer = setTimeout(() => {
      handleSave(true);
    }, 5000); // Trigger silent autosave after 5 seconds of inactivity
    return () => clearTimeout(timer);
  }, [title, subtitle, body, coverImage, categoryId, tagsInput, seoTitle, seoDescription]);

  const handleSave = async (isAutosave = false) => {
    if (!title) return;
    if (!isAutosave) {
      setSaving(true);
      setSaveStatus("saving");
    }

    const parsedTags = tagsInput
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      title,
      subtitle,
      body,
      coverImage,
      categoryId,
      tags: parsedTags,
      seoTitle,
      seoDescription
    };

    try {
      if (article?.id) {
        await api.updateArticle(article.id, payload);
      } else {
        const created = await api.createArticle(payload);
        // If creating a brand new post, notify parent to refresh lists
        onSaveSuccess();
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    } finally {
      if (!isAutosave) setSaving(false);
    }
  };

  const handleAISuggestions = async () => {
    if (!title) return;
    setAiLoading(true);
    try {
      const resp = await api.getAISuggestions(title, body);
      setAiSuggestion(resp);
      if (resp.categoryId) setCategoryId(resp.categoryId);
      if (resp.tags) setTagsInput(resp.tags.join(", "));
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAISeo = async () => {
    if (!title) return;
    setAiLoading(true);
    try {
      const resp = await api.generateAISeo(title, body);
      setAiSeo(resp);
      if (resp.seoTitle) setSeoTitle(resp.seoTitle);
      if (resp.seoDescription) setSeoDescription(resp.seoDescription);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIReview = async () => {
    if (!title || !body) return;
    setAiLoading(true);
    try {
      const resp = await api.generateAIReview(title, subtitle, body, categoryId);
      setAiReport(resp);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!article?.id) return;
    if (!confirm("Are you sure you want to lock this article and submit it to editors for review?")) return;
    try {
      await api.submitForReview(article.id);
      onSaveSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {onNavigate && (
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onNavigate("dashboard")}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-[#1E3A8A] transition-colors bg-gray-50 hover:bg-gray-100 rounded-full px-3.5 py-1.5 border border-gray-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Reporter Dashboard</span>
          </button>
          <span className="text-gray-300">|</span>
          <button 
            onClick={() => onNavigate("home")}
            className="text-xs text-gray-400 hover:text-[#1E3A8A] transition-colors font-bold"
          >
            Editorial Feed
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      
      {/* Editor Main Desk (8 cols) */}
      <div className="xl:col-span-8 flex flex-col space-y-5">
        
        {/* Desk Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-blue-50 text-[#1E3A8A] rounded-lg">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xs font-bold text-gray-800">
                {article?.id ? `Edit Story Desk` : "Create New Story"}
              </h2>
              <p className="text-[10px] text-gray-400">
                {saveStatus === "saved" && "● Autosaved & synced to database"}
                {saveStatus === "saving" && "○ Syncing changes..."}
                {saveStatus === "idle" && "Draft locally isolated"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-1 px-3 py-1.5 border border-gray-200 hover:border-[#1E3A8A] rounded-full text-[11px] font-bold text-gray-600 transition-colors bg-gray-50/50"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{previewMode ? "Visual Editor" : "Live Preview"}</span>
            </button>

            <button
              onClick={() => handleSave(false)}
              disabled={saving || !title}
              className="flex items-center space-x-1 px-4 py-1.5 bg-[#1E3A8A] hover:bg-[#2563EB] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full text-[11px] font-bold transition-all shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Draft"}</span>
            </button>

            {article?.id && article.status === "Draft" && (
              <button
                onClick={handleSubmitReview}
                className="flex items-center space-x-1 px-4 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-full text-[11px] font-bold transition-all shadow-md"
              >
                <span>Submit Review</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Visual / Preview Container */}
        {previewMode ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-none">
            {coverImage && (
              <img 
                src={coverImage} 
                alt="Cover Preview" 
                className="w-full h-64 object-cover rounded-2xl shadow-inner" 
                referrerPolicy="no-referrer"
              />
            )}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#1E3A8A] uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">
                {categories.find(c => c.id === categoryId)?.name || categoryId}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-sans tracking-tight">{title || "Untitled Story"}</h1>
              <p className="text-sm text-gray-500 font-medium leading-relaxed italic">{subtitle || "Provide a subtitle to clarify the dispatch."}</p>
            </div>

            <div className="prose prose-sm max-w-none text-xs text-gray-700 leading-relaxed space-y-4 pt-4 border-t border-gray-50 font-sans">
              {body ? (
                body.split("\n\n").map((para, i) => {
                  if (para.startsWith("### ")) {
                    return <h3 key={i} className="text-sm font-extrabold text-[#1E3A8A] pt-3">{para.replace("### ", "")}</h3>;
                  }
                  if (para.startsWith("#### ")) {
                    return <h4 key={i} className="text-xs font-bold text-gray-800 pt-2">{para.replace("#### ", "")}</h4>;
                  }
                  if (para.startsWith("* ")) {
                    return (
                      <ul key={i} className="list-disc pl-5 space-y-1">
                        {para.split("\n").map((li, j) => (
                          <li key={j}>{li.replace("* ", "")}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={i}>{para}</p>;
                })
              ) : (
                <p className="text-gray-400 italic">No text compiled in main body yet...</p>
              )}
            </div>

            {tagsInput && (
              <div className="flex flex-wrap gap-1.5 pt-6 border-t border-gray-50">
                {tagsInput.split(",").map((t, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    #{t.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Markdown Inputs block */
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Article Headline</label>
              <input
                type="text"
                placeholder="The Next Frontier of Computational Quantum Mechanics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-base sm:text-lg font-bold text-gray-800 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Subtitle / Abstract</label>
              <input
                type="text"
                placeholder="How localized cryogenic cavities and thermal noise cancellation clear structural limits."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full text-xs font-medium text-gray-600 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Category Section</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all font-bold text-gray-700"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tags (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="Quantum, Science, Technology, Computing"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Hero Image Cover URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/photo-..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all text-gray-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Main Editorial dispatch (Markdown Supported)</label>
                <span className="text-[10px] text-gray-400 flex items-center">
                  <HelpCircle className="w-3.5 h-3.5 mr-1" /> Use ### for headings
                </span>
              </div>
              <textarea
                placeholder="### First Section Heading&#10;&#10;Type your editorial contents here. You can separate paragraphs with double line-breaks. For lists use '* Bullet point' items."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full text-xs p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all text-gray-800 font-sans leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* SEO Metadata Form block */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-800 flex items-center">
              <Globe className="w-4 h-4 mr-1.5 text-blue-600" /> SEO Optimization (Meta Tags)
            </h4>
            <button
              onClick={handleAISeo}
              disabled={aiLoading || !title}
              className="text-[10px] font-bold text-[#2563EB] hover:text-[#1E3A8A] flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3 text-[#2563EB] animate-pulse" />
              <span>Generate SEO Meta using AI</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">SEO Meta Title</label>
              <input
                type="text"
                placeholder="Meta title used by search index crawlers (Postfixed with MOXN)"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2563EB] text-gray-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">SEO Meta Description</label>
              <textarea
                placeholder="A high impact summary text showing up on google index hits."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2563EB] text-gray-700"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Side-Bar AI Editorial Co-Pilot panel (4 cols) */}
      <div className="xl:col-span-4 flex flex-col space-y-5">
        
        {/* Editorial Desk Guidelines */}
        <div className="bg-[#0F172A] text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-3 flex items-center">
            <Sparkles className="w-4 h-4 mr-1.5 text-blue-400" /> AI Newsroom Assistant
          </h3>
          <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
            Leverage Google Gemini model capabilities directly on the editorial desk. Analyze draft scores, request categorization matching, and prepare SEO tags instantly.
          </p>

          <div className="space-y-2.5 border-t border-gray-800 pt-4 text-[11px]">
            <button
              onClick={handleAISuggestions}
              disabled={aiLoading || !title}
              className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl flex items-center justify-between transition-colors disabled:opacity-40"
            >
              <span>Auto Categorize & Tag draft</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleAIReview}
              disabled={aiLoading || !title || !body}
              className="w-full py-2 px-3 bg-[#2563EB] hover:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-between transition-colors disabled:opacity-40 shadow-md"
            >
              <span>Run Editorial Critique Audit</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* AI Action Results Feed */}
        {aiLoading && (
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm text-center py-10">
            <Sparkles className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-700 mt-2">Consulting Gemini Model...</p>
            <p className="text-[10px] text-gray-400 mt-1">Analyzing latent space semantics.</p>
          </div>
        )}

        {/* AI Category / Tag Suggestion report */}
        {aiSuggestion && !aiLoading && (
          <div className="bg-white border border-blue-100 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <h4 className="text-xs font-bold text-[#1E3A8A]">AI Auto-Categorize Report</h4>
              <Check className="w-4 h-4 text-green-500" />
            </div>
            {aiSuggestion.warning && (
              <p className="text-[9px] bg-amber-50 text-amber-700 p-1.5 rounded-lg border border-amber-200 font-semibold">{aiSuggestion.warning}</p>
            )}
            <div className="text-[11px] space-y-2 text-gray-600">
              <p>Matched Category: <span className="font-bold text-gray-800 capitalize">{aiSuggestion.categoryId}</span></p>
              <div>
                <p className="mb-1">Recommended Tags:</p>
                <div className="flex flex-wrap gap-1">
                  {aiSuggestion.tags?.map((t: string, idx: number) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[9px]">#{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Critique Review Agent Audit */}
        {aiReport && !aiLoading && (
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <h4 className="text-xs font-extrabold text-gray-800">Editorial Critique</h4>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${aiReport.score >= 80 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                Score: {aiReport.score}/100
              </span>
            </div>

            {aiReport.warning && (
              <p className="text-[9px] bg-amber-50 text-amber-700 p-1.5 rounded-lg border border-amber-200 font-semibold">{aiReport.warning}</p>
            )}

            <div className="space-y-3.5 text-xs">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Grammar & Style Profile</p>
                <p className="text-gray-600 leading-relaxed mt-0.5 text-[11px]">{aiReport.grammarCheck}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Structural Critique</p>
                <p className="text-gray-600 leading-relaxed mt-0.5 text-[11px]">{aiReport.feedback}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Headline Variations</p>
                <ul className="space-y-1.5 pl-1 text-[11px]">
                  {aiReport.titleSuggestions?.map((title: string, idx: number) => (
                    <li key={idx} className="text-gray-700 font-medium flex items-start">
                      <span className="text-blue-500 mr-1.5 font-bold">↳</span>
                      <button 
                        onClick={() => setTitle(title)}
                        className="hover:text-blue-600 text-left hover:underline"
                      >
                        {title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Cheat Sheet Markdown tips */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-5 text-xs text-gray-600">
          <h4 className="font-bold text-gray-800 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-1 text-gray-400" /> Writing Reference Sheet
          </h4>
          <ul className="space-y-2 text-[11px] leading-relaxed">
            <li><code className="bg-white px-1 border rounded text-red-600 font-mono">### Headline</code>: Renders a section header.</li>
            <li><code className="bg-white px-1 border rounded text-red-600 font-mono">#### Subheader</code>: Renders a sub-section.</li>
            <li><code className="bg-white px-1 border rounded text-red-600 font-mono">* Item text</code>: Compiles lists.</li>
            <li>Double-press <kbd className="bg-white px-1 border rounded shadow-xs">Enter</kbd> to structure new paragraphs cleanly.</li>
          </ul>
        </div>

      </div>

    </div>
  </div>
  );
}
