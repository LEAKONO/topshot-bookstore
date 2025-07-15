import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, Package, Truck } from 'lucide-react';
import { Book } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.getBook(id!);
        
        if (!response?.success || !response.data) {
          throw new Error(response?.message || 'Failed to load book data');
        }

        // Convert price from cents to dollars if needed
        const bookData = {
          ...response.data,
          price: response.data.price ? response.data.price / 100 : 0
        };

        setBook(bookData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load book details');
        toast.error('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookData();
    } else {
      setError('No book ID provided');
      setLoading(false);
    }
  }, [id]);

  const handleAddToCart = () => {
    if (book) {
      addToCart({ ...book, quantity });
      toast.success(`${book.title} added to cart`);
    }
  };

  const handleShare = async () => {
    if (navigator.share && book) {
      try {
        await navigator.share({
          title: book.title,
          text: `Check out "${book.title}" by ${book.author}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else if (book) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-24 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-300 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Book</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate(-1)} variant="outline">
                Go Back
              </Button>
              <Button asChild>
                <Link to="/books">Browse All Books</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h1>
            <p className="text-gray-600 mb-6">The book you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/books">Browse All Books</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ratingAverage = book.rating?.average || 0;
  const ratingCount = book.rating?.count || 0;

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/books" className="hover:text-amber-600 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Books
          </Link>
        </div>

        {/* Book Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Book Image */}
          <div>
            <div className="relative group">
              {book.image?.url || book.imageUrl ? (
                <img
                  src={book.image?.url || book.imageUrl}
                  alt={book.title}
                  className="w-full h-96 lg:h-[500px] object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-96 lg:h-[500px] bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
              <button
                onClick={handleShare}
                className="absolute top-4 right-4 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Book Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {book.category}
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {book.title}
              </h1>
              <p className="text-xl text-gray-600 mb-4">by {book.author || 'Unknown Author'}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(ratingAverage) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  ({ratingAverage.toFixed(1)} rating, {ratingCount} reviews)
                </span>
              </div>

              <p className="text-3xl font-bold text-amber-600 mb-6">
                ${book.price.toFixed(2)}
              </p>
            </div>

            <Separator />

            {/* Stock and Quantity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                <span className="text-sm">
                  {book.stock > 0 ? (
                    <span className="text-green-600">In Stock ({book.stock} available)</span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </span>
              </div>

              {book.stock > 0 && (
                <div className="flex items-center gap-4">
                  <label htmlFor="quantity" className="text-sm font-medium">
                    Quantity:
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-1"
                  >
                    {Array.from({ length: Math.min(book.stock, 10) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={book.stock === 0}
                className="w-full bg-amber-600 hover:bg-amber-700"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              
              <Button variant="outline" className="w-full" size="lg">
                <Heart className="h-5 w-5 mr-2" />
                Add to Wishlist
              </Button>
            </div>

            {/* Shipping Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-sm text-gray-500">On orders over $25</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Book Description */}
        <Card>
          <CardHeader>
            <CardTitle>About This Book</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">
              {book.description || 'No description available.'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <h4 className="font-semibold mb-2">Book Details</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Category:</dt>
                    <dd className="capitalize">{book.category || 'Unknown'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Language:</dt>
                    <dd className="capitalize">{book.language || 'English'}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Additional Info</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Status:</dt>
                    <dd>{book.isAvailable ? 'Available' : 'Not Available'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Stock:</dt>
                    <dd>{book.stockStatus || (book.stock > 0 ? 'In Stock' : 'Out of Stock')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Published:</dt>
                    <dd>{book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'Unknown'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default BookDetail;