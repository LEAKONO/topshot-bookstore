
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Book, CartItem } from '@/types';
import { toast } from '@/hooks/use-toast';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Book }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.book._id === action.payload._id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.book._id === action.payload._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      
      return {
        ...state,
        items: [...state.items, { book: action.payload, quantity: 1 }],
      };
    }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.book._id !== action.payload),
      };
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.book._id !== action.payload.id),
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.book._id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    
    case 'CLEAR_CART':
      return { ...state, items: [] };
    
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    
    case 'SET_CART_OPEN':
      return { ...state, isOpen: action.payload };
    
    case 'LOAD_CART':
      return { ...state, items: action.payload };
    
    default:
      return state;
  }
};

interface CartContextType extends CartState {
  addToCart: (book: Book) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (book: Book) => {
    if (book.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: "This book is currently out of stock.",
        variant: "destructive",
      });
      return;
    }
    
    dispatch({ type: 'ADD_ITEM', payload: book });
    toast({
      title: "Added to Cart",
      description: `"${book.title}" has been added to your cart.`,
    });
  };

  const removeFromCart = (bookId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: bookId });
    toast({
      title: "Removed from Cart",
      description: "Item has been removed from your cart.",
    });
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: bookId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const setCartOpen = (open: boolean) => {
    dispatch({ type: 'SET_CART_OPEN', payload: open });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.book.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        setCartOpen,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
