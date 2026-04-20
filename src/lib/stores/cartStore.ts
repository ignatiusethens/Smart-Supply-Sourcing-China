import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Cart, Product } from '@/types';

interface CartState extends Cart {
  // Actions
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Computed
  getTotalDeposit: () => number;
}

// Helper function to calculate cart totals
function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

function calculatePreOrderDeposit(items: CartItem[]): number {
  return items
    .filter(item => item.isPreOrder)
    .reduce((sum, item) => {
      // Use depositAmount if available, otherwise calculate from depositPercentage
      if (item.depositAmount) {
        return sum + item.depositAmount * item.quantity;
      } else if (item.depositPercentage) {
        return sum + (item.unitPrice * item.quantity * item.depositPercentage / 100);
      }
      return sum;
    }, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalAmount: 0,
      totalItems: 0,

      addItem: (product, quantity) => {
        const items = get().items;
        const existingItem = items.find(i => i.productId === product.id);

        let newItems: CartItem[];
        if (existingItem) {
          newItems = items.map(item =>
            item.productId === product.id
              ? { 
                  ...item, 
                  quantity: item.quantity + quantity,
                  subtotal: item.unitPrice * (item.quantity + quantity)
                }
              : item
          );
        } else {
          const newItem: CartItem = {
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: product.price,
            subtotal: product.price * quantity,
            availability: product.availability,
            isPreOrder: product.availability === 'pre-order',
            depositAmount: product.depositAmount,
            depositPercentage: product.depositPercentage
          };
          newItems = [...items, newItem];
        }

        set({
          items: newItems,
          totalAmount: calculateCartTotal(newItems),
          totalItems: newItems.reduce((sum, i) => sum + i.quantity, 0)
        });
      },

      removeItem: (productId) => {
        const newItems = get().items.filter(i => i.productId !== productId);
        set({
          items: newItems,
          totalAmount: calculateCartTotal(newItems),
          totalItems: newItems.reduce((sum, i) => sum + i.quantity, 0)
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const newItems = get().items.map(item =>
          item.productId === productId
            ? { 
                ...item, 
                quantity, 
                subtotal: item.unitPrice * quantity 
              }
            : item
        );

        set({
          items: newItems,
          totalAmount: calculateCartTotal(newItems),
          totalItems: newItems.reduce((sum, i) => sum + i.quantity, 0)
        });
      },

      clearCart: () => {
        set({ items: [], totalAmount: 0, totalItems: 0 });
      },

      getTotalDeposit: () => {
        return calculatePreOrderDeposit(get().items);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        totalAmount: state.totalAmount,
        totalItems: state.totalItems
      })
    }
  )
);