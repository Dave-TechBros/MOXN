/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Reader' | 'Writer' | 'Editor';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  bio: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  password?: string;
}

export type ArticleStatus = 'Draft' | 'In Review' | 'Published' | 'Rejected';

export interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  body: string;
  coverImage: string;
  status: ArticleStatus;
  featured: boolean;
  authorId: string;
  categoryId: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  readCount: number;
  likeCount: number;
  rejectReason?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Comment {
  id: string;
  body: string;
  articleId: string;
  authorId: string;
  parentId?: string; // For threaded replies
  status: 'Active' | 'Hidden';
  createdAt: string;
  likeCount: number;
  pinned: boolean;
  liked?: boolean;
}

export interface Bookmark {
  userId: string;
  articleId: string;
  createdAt: string;
}

export interface Like {
  userId: string;
  articleId: string;
  createdAt: string;
}

export interface CommentLike {
  userId: string;
  commentId: string;
  createdAt: string;
}

export interface Follower {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export type NotificationType = 
  | 'Approved' 
  | 'Rejected' 
  | 'Comment' 
  | 'Reply' 
  | 'Follow' 
  | 'Featured' 
  | 'System';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export interface NewsletterSubscriber {
  email: string;
  createdAt: string;
}

// Full State Structure for JSON Database
export interface ServerDatabase {
  users: User[];
  articles: Article[];
  categories: Category[];
  comments: Comment[];
  bookmarks: Bookmark[];
  likes: Like[];
  commentLikes?: CommentLike[];
  followers: Follower[];
  notifications: Notification[];
  subscribers: NewsletterSubscriber[];
}
