/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Article, Category, Comment, Notification, User, UserRole } from "../types.js";

// Helper to manage Simulated Active User in localStorage
const DEFAULT_USER: User = {
  id: "guest",
  name: "Guest Reader",
  email: "guest@reader.com",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  role: "Reader",
  bio: "An active reader of design, modern technology, and global affairs.",
  createdAt: "2026-06-01T12:00:00Z",
  followersCount: 0,
  followingCount: 5
};

export function getActiveUser(): User {
  const stored = localStorage.getItem("moxn_active_user");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return DEFAULT_USER;
}

export function setActiveUser(user: User) {
  localStorage.setItem("moxn_active_user", JSON.stringify(user));
  localStorage.setItem("moxn_user_id", user.id);
  localStorage.setItem("moxn_user_role", user.role);

  // Sync profile edits to credentials and custom users list
  const credentials = localStorage.getItem("moxn_user_credentials");
  if (credentials) {
    try {
      const parsed = JSON.parse(credentials);
      if ((parsed.id && parsed.id === user.id) || (parsed.email && user.email && parsed.email.toLowerCase() === user.email.toLowerCase())) {
        parsed.name = user.name;
        parsed.bio = user.bio;
        parsed.avatar = user.avatar;
        parsed.role = user.role;
        localStorage.setItem("moxn_user_credentials", JSON.stringify(parsed));
      }
    } catch (e) {
      // ignore
    }
  }

  const customUsers = localStorage.getItem("moxn_custom_users");
  if (customUsers) {
    try {
      const parsedUsers = JSON.parse(customUsers);
      const index = parsedUsers.findIndex((u: any) => (u.id && u.id === user.id) || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()));
      if (index !== -1) {
        parsedUsers[index].name = user.name;
        parsedUsers[index].bio = user.bio;
        parsedUsers[index].avatar = user.avatar;
        parsedUsers[index].role = user.role;
        localStorage.setItem("moxn_custom_users", JSON.stringify(parsedUsers));
      }
    } catch (e) {
      // ignore
    }
  }

  window.dispatchEvent(new Event("moxn_auth_changed"));
}

export function logoutUser() {
  localStorage.removeItem("moxn_active_user");
  localStorage.removeItem("moxn_user_id");
  localStorage.removeItem("moxn_user_role");
  localStorage.removeItem("moxn_user_credentials");
  window.dispatchEvent(new Event("moxn_auth_changed"));
}

export function getActiveUserRole(): UserRole {
  return getActiveUser().role;
}

// Custom fetch wrapper injecting Simulated RBAC Headers
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const activeUser = getActiveUser();
  
  const headers = {
    "Content-Type": "application/json",
    "x-user-id": activeUser.id,
    "x-user-role": activeUser.role,
    ...(options.headers || {})
  };

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Categories
  getCategories: () => fetchAPI<Category[]>("/api/categories"),

  // Users / Writers
  getWriters: () => fetchAPI<User[]>("/api/users"),
  getProfile: (id: string) => fetchAPI<{ user: User; articles: Article[]; likedArticles: Article[] }>(`/api/users/${id}`),
  updateProfile: (data: { name: string; avatar: string; bio: string }) => fetchAPI<{ user: User }>("/api/users/profile", {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  toggleFollow: (id: string) => fetchAPI<{ followed: boolean; followersCount: number }>(`/api/users/${id}/follow`, { method: "POST" }),

  // Articles
  getArticles: () => fetchAPI<Article[]>("/api/articles"),
  getArticleBySlug: (slug: string) => fetchAPI<Article & { author: User }>(`/api/articles/${slug}`),
  createArticle: (data: Partial<Article>) => fetchAPI<Article>("/api/articles", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  updateArticle: (id: string, data: Partial<Article>) => fetchAPI<Article>(`/api/articles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  submitForReview: (id: string) => fetchAPI<Article>(`/api/articles/${id}/submit`, { method: "POST" }),
  reviewArticle: (id: string, action: "Approve" | "Reject", rejectReason?: string) => fetchAPI<Article>(`/api/articles/${id}/review`, {
    method: "POST",
    body: JSON.stringify({ action, rejectReason })
  }),
  toggleLike: (id: string) => fetchAPI<{ liked: boolean; likeCount: number }>(`/api/articles/${id}/like`, { method: "POST" }),
  toggleBookmark: (id: string) => fetchAPI<{ bookmarked: boolean }>(`/api/articles/${id}/bookmark`, { method: "POST" }),
  toggleFeature: (id: string) => fetchAPI<{ featured: boolean }>(`/api/articles/${id}/feature`, { method: "POST" }),
  
  // Bookmarks & Likes List (Client scopes)
  getBookmarks: () => fetchAPI<Article[]>("/api/bookmarks"),
  getMyLikes: () => fetchAPI<string[]>("/api/my-likes"),

  // Comments
  getComments: (articleId: string) => fetchAPI<Comment[]>(`/api/articles/${articleId}/comments`),
  addComment: (articleId: string, body: string, parentId?: string) => fetchAPI<Comment>(`/api/articles/${articleId}/comments`, {
    method: "POST",
    body: JSON.stringify({ body, parentId })
  }),
  editComment: (commentId: string, body: string) => fetchAPI<Comment>(`/api/comments/${commentId}`, {
    method: "PUT",
    body: JSON.stringify({ body })
  }),
  deleteComment: (commentId: string) => fetchAPI<{ success: boolean }>(`/api/comments/${commentId}`, { method: "DELETE" }),
  likeComment: (commentId: string) => fetchAPI<Comment>(`/api/comments/${commentId}/like`, { method: "POST" }),
  pinComment: (commentId: string) => fetchAPI<Comment>(`/api/comments/${commentId}/pin`, { method: "POST" }),
  moderateComment: (commentId: string, action: "hide" | "ban_user") => fetchAPI<{ success: boolean }>(`/api/comments/${commentId}/moderate`, {
    method: "POST",
    body: JSON.stringify({ action })
  }),

  // Notifications
  getNotifications: () => fetchAPI<Notification[]>("/api/notifications"),
  markNotificationRead: (id: string) => fetchAPI<{ success: boolean }>(`/api/notifications/${id}/read`, { method: "POST" }),
  markAllNotificationsRead: () => fetchAPI<{ success: boolean }>("/api/notifications/read-all", { method: "POST" }),

  // Newsletter Subscription
  subscribeNewsletter: (email: string) => fetchAPI<{ success: boolean; message: string }>("/api/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({ email })
  }),

  // AI Assistant Handlers (Gemini Powered)
  generateAISeo: (title: string, body: string) => fetchAPI<{ seoTitle: string; seoDescription: string; warning?: string }>("/api/ai/seo", {
    method: "POST",
    body: JSON.stringify({ title, body })
  }),
  generateAIReview: (title: string, subtitle: string, body: string, categoryId: string) => fetchAPI<{ score: number; grammarCheck: string; feedback: string; titleSuggestions: string[]; warning?: string }>("/api/ai/review", {
    method: "POST",
    body: JSON.stringify({ title, subtitle, body, categoryId })
  }),
  getAISuggestions: (title: string, body: string) => fetchAPI<{ categoryId: string; tags: string[]; warning?: string }>("/api/ai/suggest", {
    method: "POST",
    body: JSON.stringify({ title, body })
  }),

  // Analytics
  getAnalytics: () => fetchAPI<any>("/api/analytics"),

  // Authentication API client methods
  login: (data: any) => fetchAPI<{ user: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  register: (data: any) => fetchAPI<{ user: User }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data)
  })
};
