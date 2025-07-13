
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const categories = [
  {
    name: 'Fiction',
    description: 'Dive into imaginary worlds and compelling stories',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    color: 'from-blue-500 to-purple-600'
  },
  {
    name: 'Non-Fiction',
    description: 'Explore real stories and factual knowledge',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    color: 'from-green-500 to-teal-600'
  },
  {
    name: 'Mystery',
    description: 'Unravel puzzles and solve thrilling mysteries',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    color: 'from-gray-700 to-gray-900'
  },
  {
    name: 'Romance',
    description: 'Fall in love with heartwarming stories',
    image: 'https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    color: 'from-pink-500 to-rose-600'
  },
  {
    name: 'Sci-Fi',
    description: 'Journey to the future and beyond',
    image: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    name: 'Biography',
    description: 'Learn from the lives of remarkable people',
    image: 'https://images.unsplash.com/photo-1472173148041-00294f0814a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    color: 'from-amber-500 to-orange-600'
  }
];

const CategoryGrid: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find exactly what you're looking for in our carefully organized collection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.name} className="group cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden border-0">
              <Link to={`/books?category=${category.name}`}>
                <div className="relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60 group-hover:opacity-70 transition-opacity`}></div>
                  <div className="absolute inset-0 flex items-end p-6">
                    <div className="text-white">
                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      <p className="text-white/90 text-sm">{category.description}</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-white font-medium">
                      Explore {category.name}
                    </span>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link to="/books">
              View All Categories
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
