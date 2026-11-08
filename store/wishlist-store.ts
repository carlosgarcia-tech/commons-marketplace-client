import { create } from 'zustand';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type { Product } from '@/types';

interface WishlistItem {
  _id: string;
  productId: Product;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  checkWishlist: (productId: string) => Promise<boolean>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: { items: WishlistItem[] } }>(API_ENDPOINTS.wishlist.list);
      const wishlistData = response?.data;
      set({ items: wishlistData?.items || wishlistData || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      set({ items: [], isLoading: false });
    }
  },

addToWishlist: async (productId: string) => {
    try {
      await apiClient.post(API_ENDPOINTS.wishlist.add, { productId });
      const { items } = get();
      set({ items: [...items, { _id: productId, productId: { _id: productId } as Product }] });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  },

  removeFromWishlist: async (productId: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.wishlist.remove(productId));
      const { items } = get();
      set({ items: items.filter((item) => item.productId._id !== productId) });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  },

  checkWishlist: async (productId: string) => {
    try {
      const data = await apiClient.get<{ success: boolean; data: { isInWishlist: boolean } }>(API_ENDPOINTS.wishlist.check(productId));
      return data?.data?.isInWishlist ?? false;
    } catch {
      return false;
    }
  },

  clearWishlist: async () => {
    try {
      await apiClient.delete(API_ENDPOINTS.wishlist.clear);
      set({ items: [] });
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  },

  isInWishlist: (productId: string) => {
    const { items } = get();
    return items.some((item) => item.productId._id === productId);
  },
}));