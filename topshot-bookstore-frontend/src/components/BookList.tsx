
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import BookCard from './BookCard';
import { useBooks } from '@/hooks/useBooks';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const BookList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';

  const params = {
    ...(category && { category }),
    ...(search && { search }),
    sortBy,
    order,
    ...(priceRange[0] > 0 && { minPrice: priceRange[0] }),
    ...(priceRange[1] < 100 && { maxPrice: priceRange[1] }),
    ...(inStockOnly && { inStock: true }),
  };

  const { data: response, isLoading, error } = useBooks(params);

  const books = response?.data?.books || [];
  const pagination = response?.data?.pagination;

  const categories = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History'];

  const handleSortChange = (value: string) => {
    const [newSortBy, newOrder] = value.split('-');
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', newSortBy);
    newParams.set('order', newOrder);
    setSearchParams(newParams);
  };

  const handleCategoryFilter = (newCategory: string) => {
    const params = new URLSearchParams(searchParams);
    if (newCategory === 'all') {
      params.delete('category');
    } else {
      params.set('category', newCategory);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('category');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('inStock');
    setSearchParams(params);
    setPriceRange([0, 100]);
    setInStockOnly(false);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error loading books
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please try again later or contact support if the problem persists.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {category ? `${category} Books` : 
                 search ? `Search Results for "${search}"` : 'All Books'}
              </h1>
              {!isLoading && pagination && (
                <p className="text-gray-600 dark:text-gray-400">
                  Showing {books.length} of {pagination.total} books
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <Select value={`${sortBy}-${order}`} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="author-asc">Author A-Z</SelectItem>
                  <SelectItem value="author-desc">Author Z-A</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Refine your book search
                    </SheetDescription>
                  </SheetHeader>
                  {/* Mobile filter content would go here */}
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <Button
              variant={!category ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter('all')}
              className={!category ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              All Categories
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryFilter(cat)}
                className={category === cat ? 'bg-amber-600 hover:bg-amber-700' : ''}
              >
                {cat}
              </Button>
            ))}
            {(category || search) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className={`grid ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          } gap-6`}>
            {Array.from({ length: 12 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-9 w-28" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Books Grid/List */}
        {!isLoading && (
          <>
            {books.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <Filter className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    No books found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Try adjusting your search criteria or browse different categories.
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={`grid ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1 max-w-2xl mx-auto'
              } gap-6`}>
                {books.map((book: any) => (
                  <BookCard 
                    key={book._id} 
                    book={book} 
                    variant={viewMode === 'list' ? 'compact' : 'default'}
                  />
                ))}
              </div>
            )}

            {/* Pagination would go here */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-12 flex justify-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Page {pagination.current} of {pagination.pages}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookList;
