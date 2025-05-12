import React, { useState, useEffect } from 'react';
import QuizCard from '../components/QuizCard';
import { getAllQuizzes } from '../services/quizService';
import { Search, Filter, BookOpen, Sparkles, TrendingUp, Clock } from 'lucide-react';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [showSearchBar, setShowSearchBar] = useState(false);
  
  // Categories extracted from quizzes
  const [categories, setCategories] = useState(['all']);
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await getAllQuizzes();
        console.log(response);
        if (response && response.data) {
          setQuizzes(response.data);
          setFilteredQuizzes(response.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setError('Failed to load quizzes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  useEffect(() => {
    // Filter quizzes based on search query and category
    let result = quizzes;
    
    if (searchQuery) {
      result = result.filter(quiz => 
        quiz.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (category !== 'all') {
      result = result.filter(quiz => quiz.category === category);
    }
    
    setFilteredQuizzes(result);
  }, [searchQuery, category, quizzes]);

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    if (showSearchBar) {
      setSearchQuery('');
    }
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-red-50 p-8 rounded-xl border border-red-200 shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-3">Oops!</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header with animated gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-10 mb-10 shadow-xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTI1LDMwIEMgNjAsMzAgMzAsNjAgMzAsMTI1IEwgMzAsNDc1IEMgMzAsNTQwIDYwLDU3MCAxMjUsNTcwIEwgNDc1LDU3MCBDIDU0MCw1NzAgNTcwLDU0MCA1NzAsNDc1IEwgNTcwLDEyNSBDIDU3MCw2MCA1NDAsNzAgNDc1LDMwIFoiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] opacity-30"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 p-3 rounded-xl">
                <BookOpen size={36} className="text-blue-100" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold ml-4">VerseWalkers Quizverse</h1>
            </div>
            <p className="text-center text-blue-100 max-w-2xl mx-auto text-lg">
              Test your knowledge with our interactive quizzes across various topics.
              Challenge yourself, learn, and have fun!
            </p>
            
            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Sparkles size={16} className="mr-2 text-yellow-300" />
                <span className="text-sm font-medium">Interactive Learning</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <TrendingUp size={16} className="mr-2 text-green-300" />
                <span className="text-sm font-medium">Track Progress</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock size={16} className="mr-2 text-orange-300" />
                <span className="text-sm font-medium">Timed Challenges</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Improved Search and filter controls */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-auto flex-grow">
                <div className={`flex items-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 ${showSearchBar ? 'w-full' : 'w-full md:w-12'}`}>
                  <button 
                    onClick={toggleSearchBar}
                    className="p-3 text-gray-500 hover:text-blue-600"
                  >
                    <Search size={20} />
                  </button>
                  
                  <input
                    type="text"
                    placeholder="Search quizzes..."
                    className={`w-full px-4 py-2 bg-gray-50 focus:outline-none transition-all duration-300 ${showSearchBar ? 'opacity-100' : 'opacity-0 md:w-0'}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center w-full md:w-auto">
                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 pl-3">
                  <Filter size={18} className="text-gray-500" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-gray-50 rounded-lg px-4 py-2.5 focus:outline-none w-full md:w-auto appearance-none pr-8"
                    style={{ minWidth: '150px' }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz cards with enhanced animation */}
        <div className="mb-10">
          {filteredQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz, index) => (
                <div 
                  key={quiz._id} 
                  className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ 
                    animationName: 'fadeIn',
                    animationDuration: '0.5s',
                    animationFillMode: 'both',
                    animationDelay: `${index * 0.1}s` 
                  }}
                >
                  <QuizCard quiz={quiz} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-700 mt-4">No quizzes found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or filter</p>
              <button 
                onClick={() => {setSearchQuery(''); setCategory('all');}}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-4 border-t border-gray-200">
          <p>© {new Date().getFullYear()} VerseWalkers Quizverse. All rights reserved.</p>
        </div>
      </div>
      
      {/* Global styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default Home;