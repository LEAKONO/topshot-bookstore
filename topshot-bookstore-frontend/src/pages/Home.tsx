import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ShoppingBag, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FeaturedBooks from '@/components/home/FeaturedBooks';
import CategoryGrid from '@/components/home/CategoryGrid';
import Testimonials from '@/components/home/Testimonials';
import TypewriterHero from '@/components/home/TypewriterHero';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-32 h-32 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* Typewriter Hero Component */}
              <TypewriterHero />
              
              <div className="space-y-4">
                <Badge variant="secondary" className="text-amber-700 bg-amber-100 border-amber-200 animate-bounce">
                  <Zap className="w-3 h-3 mr-1" />
                  New Collection Available
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Discover Your Next
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600"> 
                    {' '}Great Read
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                  Explore thousands of books across all genres. From bestsellers to hidden gems, 
                  find your perfect book at unbeatable prices.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg">
                  <Link to="/books">
                    Browse Books
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/books?category=Fiction">
                    Popular Fiction
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">10K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Books Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">5K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Happy Readers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">4.9★</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Customer Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
                  alt="Books Collection"
                  className="rounded-2xl shadow-2xl w-full h-96 lg:h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                    <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Free Shipping</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">On orders over $50</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Topshot Bookstore?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We're more than just a bookstore - we're your partner in discovering amazing stories
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <CardContent className="p-8 text-center">
                <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Vast Collection</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Over 10,000 books across all genres and categories. From classics to contemporary bestsellers.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardContent className="p-8 text-center">
                <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fast Delivery</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Quick and reliable shipping. Get your books delivered right to your doorstep within days.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardContent className="p-8 text-center">
                <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Book Community</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Join thousands of book lovers. Share reviews, discover recommendations, and connect.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <FeaturedBooks />

      {/* Categories Section */}
      <CategoryGrid />

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of book lovers who have found their next favorite read with us. 
            Browse our collection and discover something amazing today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="bg-white text-amber-600 hover:bg-gray-100">
              <Link to="/books">Browse All Books</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white hover:text-amber-600">
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
