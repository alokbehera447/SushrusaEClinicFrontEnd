import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight, Sparkles, Clock, User } from 'lucide-react';

const articles = [
  {
    title: '5 Essential Heart Health Tips',
    description: 'Discover simple lifestyle changes that can significantly improve your cardiovascular health and reduce heart disease risk.',
    image: '/cardiology.png',
    category: 'Cardiology',
    readTime: '5 min read',
    author: 'Dr. Priya Sharma',
    date: 'Dec 15, 2024',
    link: '#',
  },
  {
    title: 'Understanding Migraines: Causes & Treatment',
    description: 'Learn about migraine triggers, symptoms, and effective treatment options from our neurology experts.',
    image: '/neurology.png',
    category: 'Neurology',
    readTime: '7 min read',
    author: 'Dr. Rahul Mehta',
    date: 'Dec 12, 2024',
    link: '#',
  },
  {
    title: 'Complete Guide to Child Nutrition',
    description: 'Essential nutrition guidelines for growing children, including meal planning and healthy eating habits.',
    image: '/pediatrics.png',
    category: 'Pediatrics',
    readTime: '6 min read',
    author: 'Dr. Anjali Verma',
    date: 'Dec 10, 2024',
    link: '#',
  },
  {
    title: 'Digital Eye Strain: Prevention & Care',
    description: 'Protect your vision in the digital age with expert tips on reducing screen time impact on your eyes.',
    image: '/ophthalmology.png',
    category: 'Ophthalmology',
    readTime: '4 min read',
    author: 'Dr. Neha Singh',
    date: 'Dec 8, 2024',
    link: '#',
  },
];

const BlogResources = () => (
  // HEALTH RESOURCES SECTION - COMMENTED OUT
  /*
  <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white via-gray-50/50 to-white relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#E17726]/5 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-full blur-3xl"></div>
    </div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 sm:mb-12 lg:mb-16">
        <div className="inline-flex items-center space-x-3 glass px-6 py-3 rounded-full border border-[#E17726]/20 mb-6">
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-r from-[#E17726] to-[#FF8A56] rounded-full"></div>
            <div className="absolute inset-0 w-3 h-3 bg-[#E17726] rounded-full animate-ping"></div>
          </div>
          <Sparkles className="w-5 h-5 text-[#E17726]" />
          <span className="text-sm font-bold text-[#E17726] tracking-wide">HEALTH RESOURCES</span>
          <BookOpen className="w-5 h-5 text-cyan-600" />
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-midnight leading-tight">
          Stay Informed About
          <span className="block text-[#E17726]">Your Health</span>
        </h2>
        
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mt-4">
          Expert health tips and insights from our certified doctors. 
          <span className="text-[#E17726] font-semibold"> Evidence-based articles</span> to help you make informed health decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
        {articles.map((article, index) => (
          <div key={index} className="group">
            <div className="bg-white rounded-3xl shadow-modern p-6 flex flex-col h-full hover:shadow-xl-colored transition-all duration-500 hover:-translate-y-3 border border-gray-100/50">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#E17726]/10 to-[#E17726]/5 text-[#E17726] text-xs font-semibold mb-3 self-start">
                {article.category}
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-midnight mb-3 group-hover:text-[#E17726] transition-colors duration-300 flex-grow">
                {article.title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
                {article.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {article.author}
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {article.readTime}
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full bg-white/80 backdrop-blur-sm border-2 border-[#E17726]/30 text-[#E17726] hover:bg-gradient-to-r hover:from-[#E17726] hover:to-[#FF8A56] hover:text-white hover:border-[#E17726] px-4 py-2 rounded-xl font-semibold transition-all duration-500 group/btn"
              >
                Read Article
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button 
          variant="outline" 
          className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-[#E17726]/30 text-[#E17726] hover:bg-gradient-to-r hover:from-[#E17726] hover:to-[#FF8A56] hover:text-white hover:border-[#E17726] px-8 sm:px-12 py-4 sm:py-6 rounded-2xl font-bold text-base sm:text-lg transition-all duration-500 hover:shadow-xl-colored hover:scale-105 hover:-translate-y-1"
        >
          <span className="relative z-10 flex items-center">
            <BookOpen className="w-5 h-5 mr-3" />
            View All Health Articles
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#E17726] to-[#FF8A56] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
        </Button>
      </div>
    </div>
  </section>
  */
  null
);

export default BlogResources;