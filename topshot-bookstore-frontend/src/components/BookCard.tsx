import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { Book } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BookCardProps {
  book: Book;
  variant?: 'default' | 'compact';
}

const BookCard: React.FC<BookCardProps> = ({ book, variant = 'default' }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  /**
   * Gets the image URL from the book object, handling different API response structures
   */
  const getImageUrl = (): string => {
    // Handle case where image is an object with url property
    if (book.image && typeof book.image === 'object' && 'url' in book.image) {
      return book.image.url;
    }
    // Handle case where imageUrl exists as direct property
    if (book.imageUrl) return book.imageUrl;
    // Handle case where image is a direct string URL
    if (typeof book.image === 'string') return book.image;
    // Fallback to placeholder
    return '/placeholder.svg';
  };

  /**
   * Handles image loading errors by falling back to placeholder
   */
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder.svg';
    target.classList.add('opacity-50');
  };

  if (variant === 'compact') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
        <Link to={`/books/${book._id}`} className="flex gap-4 p-4">
          <img
            src={getImageUrl()}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            onError={handleImageError}
            className="w-16 h-20 object-cover rounded-md flex-shrink-0 bg-gray-100 dark:bg-gray-700"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm group-hover:text-amber-600 transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              by {book.author}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-amber-600">
                {formatPrice(book.price)}
              </span>
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={book.stock === 0}
                className="h-7 px-2 text-xs bg-amber-600 hover:bg-amber-700"
                aria-label={`Add ${book.title} to cart`}
              >
                <ShoppingCart className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white dark:bg-gray-800">
      <Link to={`/books/${book._id}`} aria-label={`View details of ${book.title}`}>
        <div className="relative overflow-hidden">
          <img
            src={getImageUrl()}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            onError={handleImageError}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-100 dark:bg-gray-700"
          />
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <Badge variant="secondary" className="bg-white/95 text-amber-600 font-bold shadow-sm">
              {formatPrice(book.price)}
            </Badge>
            {book.featured && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Featured
              </Badge>
            )}
          </div>

          {/* Hover Actions */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              size="sm" 
              variant="secondary" 
              className="bg-white/90 hover:bg-white shadow-sm"
              aria-label="Add to wishlist"
            >
              <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
            </Button>
          </div>

          {/* Quick View */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <Button 
              size="sm" 
              variant="secondary" 
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-white/90 hover:bg-white"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4 mr-2" />
              Quick View
            </Button>
          </div>

          {/* Stock indicator */}
          {book.stock <= 5 && book.stock > 0 && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="destructive" className="text-xs">
                Only {book.stock} left!
              </Badge>
            </div>
          )}
          {book.stock === 0 && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="destructive" className="text-xs">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs font-medium">
                {book.category}
              </Badge>
              {book.rating?.count > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(book.rating.average)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({book.rating.count})
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-amber-600 transition-colors leading-tight">
                {book.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                by {book.author}
              </p>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {book.description}
            </p>
          </div>
        </CardContent>
      </Link>
      
      <CardFooter className="p-6 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-amber-600">
              {formatPrice(book.price)}
            </span>
            <span className="text-xs text-gray-500">
              {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={book.stock === 0}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
            aria-label={`Add ${book.title} to cart`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BookCard;