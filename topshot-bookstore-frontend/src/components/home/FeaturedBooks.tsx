
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeaturedBooks } from '@/hooks/useBooks';
import { useCart } from '@/contexts/CartContext';

const FeaturedBooks: React.FC = () => {
  const { data: response, isLoading, error } = useFeaturedBooks();
  const { addToCart } = useCart();

  if (error) return null;

  const books = response?.data || [];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Books
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Handpicked selections from our collection
            </p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link to="/books">
              View All Books
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-64 w-full rounded-t-lg" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.slice(0, 8).map((book: any) => (
              <Card key={book._id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative overflow-hidden">
                  <img
                    src={book.image || '/placeholder.svg'}
                    alt={book.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-amber-600 font-semibold">
                      ${book.price.toFixed(2)}
                    </Badge>
                  </div>
                  {book.featured && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Badge variant="outline" className="text-xs">
                      {book.category}
                    </Badge>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-amber-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        by {book.author}
                      </p>
                    </div>
                    
                    {book.rating.count > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(book.rating.average)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({book.rating.count})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-amber-600">
                          ${book.price.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => addToCart(book)}
                          disabled={book.stock === 0}
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          Add to Cart
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/books/${book._id}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12 sm:hidden">
          <Button asChild>
            <Link to="/books">
              View All Books
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;
