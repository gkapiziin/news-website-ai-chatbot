import api, { User } from './api';
import { Category } from './categoryService';

export interface Article {
  id: number;
  title: string;
  preview: string;
  body: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  author: User;
  category: Category;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  comments: Comment[];
}

export interface ArticleListItem {
  id: number;
  title: string;
  preview: string;
  body: string;
  imageUrl: string;
  createdAt: string;
  isPublished: boolean;
  authorName: string;
  categoryName: string;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
}

export interface CreateArticleRequest {
  title: string;
  preview: string;
  body: string;
  imageUrl: string;
  categoryId: number;
  isPublished: boolean;
}

export interface UpdateArticleRequest {
  title?: string;
  preview?: string;
  body?: string;
  imageUrl?: string;
  categoryId?: number;
  isPublished?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface CreateCommentRequest {
  content: string;
  articleId: number;
}

export interface LikeRequest {
  articleId: number;
  isLike: boolean;
}

export const articleService = {
  getArticles: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: number;
  } = {}): Promise<ArticleListItem[]> => {
    const response = await api.get('/articles', { params });
    return response.data;
  },

  getAllArticlesForAdmin: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: number;
  } = {}): Promise<ArticleListItem[]> => {
    const response = await api.get('/articles/admin', { params });
    return response.data;
  },

  getTrendingArticles: async (params: {
    page?: number;
    pageSize?: number;
  } = {}): Promise<ArticleListItem[]> => {
    const response = await api.get('/articles/trending', { params });
    return response.data;
  },

  getArticle: async (id: number): Promise<Article> => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  },

  createArticle: async (data: CreateArticleRequest): Promise<Article> => {
    const response = await api.post('/articles', data);
    return response.data;
  },

  updateArticle: async (id: number, data: UpdateArticleRequest): Promise<void> => {
    await api.put(`/articles/${id}`, data);
  },

  deleteArticle: async (id: number): Promise<void> => {
    await api.delete(`/articles/${id}`);
  },

  likeArticle: async (data: LikeRequest): Promise<void> => {
    await api.post(`/articles/${data.articleId}/like`, data);
  }
};

export const commentService = {
  getArticleComments: async (articleId: number): Promise<Comment[]> => {
    const response = await api.get(`/comments/article/${articleId}`);
    return response.data;
  },

  createComment: async (data: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post('/comments', data);
    return response.data;
  },

  updateComment: async (id: number, data: { content: string; articleId: number }): Promise<void> => {
    await api.put(`/comments/${id}`, data);
  },

  deleteComment: async (id: number): Promise<void> => {
    await api.delete(`/comments/${id}`);
  }
};
