import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import {
  LogoIcon,
  HeartIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ArrowRightIcon,
  TagIcon,
} from '../common/Icons';
import LanguageSwitcher from '../common/LanguageSwitcher';

interface BlogPageProps {
  onNavigate: (
    page: 'signin' | 'signup' | 'landing' | 'about' | 'contact' | 'terms' | 'privacy'
  ) => void;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
}

const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  const { t } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'tips', name: 'Tips & Tricks' },
    { id: 'trends', name: 'Hair Trends' },
    { id: 'business', name: 'Business' },
    { id: 'technology', name: 'Technology' },
    { id: 'tutorials', name: 'Tutorials' },
  ];

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: '10 Essential Tips for Growing Your Hair Salon Business',
      excerpt:
        "Discover proven strategies to attract new clients, increase retention, and boost your salon's revenue in 2024.",
      content: 'Full article content would go here...',
      author: 'Sarah Johnson',
      date: '2024-01-15',
      readTime: '5 min read',
      category: 'business',
      tags: ['business growth', 'client retention', 'marketing'],
      image: '/api/placeholder/400/250',
    },
    {
      id: '2',
      title: 'The Latest Hair Color Trends for Spring 2024',
      excerpt:
        'From vibrant balayage to subtle highlights, explore the hottest hair color trends that your clients will love.',
      content: 'Full article content would go here...',
      author: 'Maria Rodriguez',
      date: '2024-01-12',
      readTime: '7 min read',
      category: 'trends',
      tags: ['hair color', 'trends', 'spring 2024'],
      image: '/api/placeholder/400/250',
    },
    {
      id: '3',
      title: 'How AI is Revolutionizing the Beauty Industry',
      excerpt:
        'Learn how artificial intelligence tools like Kimba are transforming how beauty professionals work and serve clients.',
      content: 'Full article content would go here...',
      author: 'Tech Team',
      date: '2024-01-10',
      readTime: '6 min read',
      category: 'technology',
      tags: ['AI', 'technology', 'innovation'],
      image: '/api/placeholder/400/250',
    },
    {
      id: '4',
      title: 'Mastering the Perfect Blowout: A Step-by-Step Guide',
      excerpt:
        'Professional techniques and insider secrets for creating salon-quality blowouts that last.',
      content: 'Full article content would go here...',
      author: 'Jennifer Lee',
      date: '2024-01-08',
      readTime: '4 min read',
      category: 'tutorials',
      tags: ['blowout', 'styling', 'techniques'],
      image: '/api/placeholder/400/250',
    },
    {
      id: '5',
      title: 'Building Client Relationships That Last',
      excerpt:
        'Proven strategies for creating meaningful connections with your clients that keep them coming back.',
      content: 'Full article content would go here...',
      author: 'Amanda Chen',
      date: '2024-01-05',
      readTime: '5 min read',
      category: 'tips',
      tags: ['client relationships', 'customer service', 'retention'],
      image: '/api/placeholder/400/250',
    },
    {
      id: '6',
      title: 'Social Media Marketing for Hair Salons',
      excerpt:
        'Effective strategies to showcase your work and attract new clients through social media platforms.',
      content: 'Full article content would go here...',
      author: 'Marketing Team',
      date: '2024-01-03',
      readTime: '8 min read',
      category: 'business',
      tags: ['social media', 'marketing', 'Instagram'],
      image: '/api/placeholder/400/250',
    },
  ];

  const filteredPosts =
    selectedCategory === 'all'
      ? blogPosts
      : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts[0];

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => onNavigate('landing')}
            >
              <LogoIcon className="w-10 h-10 text-accent" />
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Kimba
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => onNavigate('landing')}
                className="hover:text-accent transition-colors font-semibold"
              >
                {t('nav.home')}
              </button>
              <button
                onClick={() => onNavigate('about')}
                className="hover:text-accent transition-colors font-semibold"
              >
                {t('nav.about')}
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="hover:text-accent transition-colors font-semibold"
              >
                {t('nav.contact')}
              </button>
              <span className="text-accent font-semibold">{t('nav.blog')}</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button
                onClick={() => onNavigate('signin')}
                className="hover:text-accent transition-colors font-semibold"
              >
                {t('auth.signin')}
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="px-5 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white transition-all shadow-md"
              >
                {t('auth.getStarted')}
              </button>
            </div>
          </nav>
        </header>

        <main className="flex-grow">
          <div className="container mx-auto px-6 py-12">
            <button
              onClick={() => setSelectedPost(null)}
              className="flex items-center gap-2 text-accent hover:underline mb-8"
            >
              ← Back to Blog
            </button>

            <article className="max-w-4xl mx-auto">
              <header className="mb-8">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full">
                    {selectedPost.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(selectedPost.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {selectedPost.readTime}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                  {selectedPost.title}
                </h1>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <UserIcon className="w-5 h-5" />
                  <span>By {selectedPost.author}</span>
                </div>
              </header>

              <div className="mb-8">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full h-80 object-cover rounded-lg"
                />
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 font-medium">
                  {selectedPost.excerpt}
                </p>

                <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                    nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                    Key Takeaways
                  </h2>

                  <ul className="list-disc list-inside space-y-2">
                    <li>Understanding your target audience is crucial for business growth</li>
                    <li>Consistent branding across all touchpoints builds trust</li>
                    <li>Technology can streamline operations and improve client experience</li>
                    <li>Regular training keeps your skills current with industry trends</li>
                  </ul>

                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                    fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt mollit anim id est laborum.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                    Conclusion
                  </h2>

                  <p>
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                    doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
                    veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                  </p>
                </div>
              </div>

              <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedPost.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedPost.author}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Beauty Industry Expert
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPost(null)}
                    className="px-6 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-all"
                  >
                    Read More Articles
                  </button>
                </div>
              </footer>
            </article>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate('landing')}
          >
            <LogoIcon className="w-10 h-10 text-accent" />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Kimba
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => onNavigate('landing')}
              className="hover:text-accent transition-colors font-semibold"
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-accent transition-colors font-semibold"
            >
              {t('nav.about')}
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-accent transition-colors font-semibold"
            >
              {t('nav.contact')}
            </button>
            <span className="text-accent font-semibold">{t('nav.blog')}</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => onNavigate('signin')}
              className="hover:text-accent transition-colors font-semibold"
            >
              {t('auth.signin')}
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="px-5 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white transition-all shadow-md"
            >
              {t('auth.getStarted')}
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-6 text-center bg-gradient-to-br from-white via-accent-50/30 to-accent-100/20 dark:from-gray-900 dark:via-accent-950/30 dark:to-accent-900/20">
          <div className="container mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Beauty Industry Blog
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Expert insights, trends, and tips for beauty professionals. Stay ahead of the curve
              with our latest articles.
            </p>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
              Featured Article
            </h3>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-80 object-cover rounded-lg"
                />
              </div>
              <div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full">
                    {featuredPost.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(featuredPost.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {featuredPost.readTime}
                  </span>
                </div>
                <h4 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                  {featuredPost.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <UserIcon className="w-4 h-4" />
                    <span>By {featuredPost.author}</span>
                  </div>
                  <button
                    onClick={() => setSelectedPost(featuredPost)}
                    className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:opacity-90 transition-all"
                  >
                    Read More <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 px-6 bg-gray-100 dark:bg-gray-800/50">
          <div className="container mx-auto">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedCategory === category.id
                      ? 'bg-accent text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-accent/10'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.slice(1).map(post => (
                <article
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <UserIcon className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="text-accent hover:underline font-semibold"
                      >
                        Read More
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-20 px-6 bg-accent text-white">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4">Stay Updated</h3>
            <p className="max-w-xl mx-auto text-accent-100 mb-8">
              Subscribe to our newsletter and never miss the latest beauty industry insights and
              tips.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-6 py-3 bg-white text-accent rounded-lg font-semibold hover:bg-gray-100 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-gray-100 dark:bg-gray-800/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <LogoIcon className="w-8 h-8 text-accent" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Kimba</h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                AI-powered CRM platform for beauty professionals.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Product</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-accent">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-accent">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-accent">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Company</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => onNavigate('about')}
                    className="text-gray-600 dark:text-gray-400 hover:text-accent"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="text-gray-600 dark:text-gray-400 hover:text-accent"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <span className="text-accent font-semibold">Blog</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => onNavigate('privacy')}
                    className="text-gray-600 dark:text-gray-400 hover:text-accent"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('terms')}
                    className="text-gray-600 dark:text-gray-400 hover:text-accent"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Kimba. All rights reserved.
            </p>
            <p className="text-sm mt-2 md:mt-0 flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              Made with <HeartIcon className="w-4 h-4 text-red-500" /> for beauty professionals
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;
