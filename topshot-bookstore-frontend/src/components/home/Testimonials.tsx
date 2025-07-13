
import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Book Enthusiast',
    content: 'Topshot Bookstore has become my go-to place for finding amazing reads. Their collection is incredible and the delivery is always fast!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616c6b46fb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Michael Chen',
    role: 'Academic Researcher',
    content: 'As a researcher, I need access to a wide variety of books. Topshot Bookstore never disappoints with their extensive collection and competitive prices.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Teacher',
    content: 'I love how easy it is to find books for my classroom. The search feature is fantastic and the customer service is exceptional.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Readers Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found their perfect reads with us
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Quote className="h-8 w-8 text-amber-600 opacity-50" />
                    <div className="flex">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
