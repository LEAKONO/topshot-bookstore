
import React from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface CartDrawerProps {
  children: React.ReactNode;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ children }) => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const total = subtotal + tax + shipping;

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="h-5 w-5 text-amber-600" />
            Shopping Cart
            {getTotalItems() > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Add some books to get started on your reading journey!
                  </p>
                  <Button asChild className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                    <Link to="/books">Browse Books</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-6">
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.book._id} className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex-shrink-0">
                        <img
                          src={item.book.image || '/placeholder.svg'}
                          alt={item.book.title}
                          className="w-16 h-20 object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">
                              {item.book.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              by {item.book.author}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.book._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 h-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.book._id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.book._id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-amber-600">
                              {formatPrice(item.book.price * item.quantity)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatPrice(item.book.price)} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <div className="border-t pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  {subtotal < 50 && (
                    <p className="text-xs text-amber-600">
                      Add {formatPrice(50 - subtotal)} more for free shipping!
                    </p>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-amber-600">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button asChild className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
                    <Link to="/checkout">Proceed to Checkout</Link>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" asChild className="flex-1">
                      <Link to="/books">Continue Shopping</Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
