import api from './api';

export interface UserStats {
  totalArticles: number;
  totalComments: number;
  totalLikes: number;
  articlesPublished: number;
  articlesViewed: number;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserProfile {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  createdAt: string;
}

export const userService = {
  // Get user profile
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get<UserProfile>('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Get user statistics
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const response = await api.get<UserStats>(`/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Return mock stats if API is not available
      return {
        totalArticles: 0,
        totalComments: 0,
        totalLikes: 0,
        articlesPublished: 0,
        articlesViewed: 0,
      };
    }
  },

  // Update user profile
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const response = await api.put<UserProfile>('/auth/profile', data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Update password
  async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    try {
      await api.put('/auth/change-password', data);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },

  // Delete user account
  async deleteAccount(): Promise<void> {
    try {
      await api.delete('/auth/account');
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  // Get user's articles
  async getUserArticles(userId: string, page: number = 1, limit: number = 10) {
    try {
      const response = await api.get(`/users/${userId}/articles?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user articles:', error);
      throw error;
    }
  },

  // Get user's comments
  async getUserComments(userId: string, page: number = 1, limit: number = 10) {
    try {
      const response = await api.get(`/users/${userId}/comments?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user comments:', error);
      throw error;
    }
  },

  // Get user's liked articles
  async getUserLikedArticles(userId: string, page: number = 1, limit: number = 10) {
    try {
      const response = await api.get(`/users/${userId}/liked-articles?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching liked articles:', error);
      throw error;
    }
  },
};

export default userService;
