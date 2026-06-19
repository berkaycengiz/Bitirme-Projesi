import { create } from 'zustand';
import api from '../services/api';

export interface Product {
  productID: number;
  productName: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryName: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  note: string;
}

interface CartState {
  cartItems: CartItem[];
  tableNumber: number | null;
  setTableNumber: (tableNumber: number | null) => void;
  addToCart: (product: Product, note?: string) => void;
  removeFromCart: (productID: number) => void;
  updateCartItemNote: (productID: number, note: string) => void;
  clearCart: () => void;
  submitOrder: () => Promise<{ success: boolean; message: string }>;
}

export const useCartStore = create<CartState>((set, get) => {
  // Parse table number from URL search parameters on load
  const params = new URLSearchParams(window.location.search);
  const tableParam = params.get('table');
  const initialTable = tableParam ? parseInt(tableParam, 10) : null;

  return {
    cartItems: [],
    tableNumber: initialTable,

    setTableNumber: (tableNumber) => set({ tableNumber }),

    addToCart: (product, note = '') => {
      set((state) => {
        const existingIndex = state.cartItems.findIndex(
          (item) => item.product.productID === product.productID
        );

        if (existingIndex > -1) {
          const updated = [...state.cartItems];
          updated[existingIndex].quantity += 1;
          // Append note if it's different/new
          if (note && !updated[existingIndex].note.includes(note)) {
            updated[existingIndex].note = updated[existingIndex].note
              ? `${updated[existingIndex].note}, ${note}`
              : note;
          }
          return { cartItems: updated };
        } else {
          return { cartItems: [...state.cartItems, { product, quantity: 1, note }] };
        }
      });
    },

    removeFromCart: (productID) => {
      set((state) => {
        const existingIndex = state.cartItems.findIndex(
          (item) => item.product.productID === productID
        );

        if (existingIndex > -1) {
          const updated = [...state.cartItems];
          if (updated[existingIndex].quantity > 1) {
            updated[existingIndex].quantity -= 1;
            return { cartItems: updated };
          } else {
            return { cartItems: state.cartItems.filter((item) => item.product.productID !== productID) };
          }
        }
        return {};
      });
    },

    updateCartItemNote: (productID, note) => {
      set((state) => ({
        cartItems: state.cartItems.map((item) =>
          item.product.productID === productID ? { ...item, note } : item
        ),
      }));
    },

    clearCart: () => set({ cartItems: [] }),

    submitOrder: async () => {
      const { cartItems, tableNumber, clearCart } = get();
      if (cartItems.length === 0) {
        return { success: false, message: 'Sepetiniz boş.' };
      }

      const orderPayload = {
        tableNumber: tableNumber,
        items: cartItems.map((item) => ({
          productId: item.product.productID,
          quantity: item.quantity,
          note: item.note || null,
        })),
      };

      try {
        const response = await api.post('/api/order', orderPayload);
        const data = response.data;
        if (data.isSuccess) {
          clearCart();
          return { success: true, message: data.message || 'Siparişiniz başarıyla mutfağa iletildi!' };
        }
        return { success: false, message: data.message || 'Sipariş gönderilirken bir sorun oluştu.' };
      } catch (error: any) {
        console.error('Order submit error:', error);
        const errorMsg = error.response?.data?.message || 'Sipariş gönderilemedi, lütfen tekrar deneyin.';
        return { success: false, message: errorMsg };
      }
    },
  };
});
