import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Settings, Clock, Shuffle, ArrowLeft, Eye, EyeOff, ArrowRight, BookOpen } from 'lucide-react';
import { getQuizBySlug } from '../services/quizService';

const QuizSettings = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    timeLimit: 30,
    showTimer: true,
    randomizeQuestions: false
  });
  const [animateSettings, setAnimateSettings] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await getQuizBySlug(slug);
        setQuiz(response.data);
        
        // Try to get existing settings
        const savedSettings = JSON.parse(localStorage.getItem(`quiz_settings_${slug}`) || '{}');
        if (Object.keys(savedSettings).length > 0) {
          setSettings({
            timeLimit: savedSettings.timeLimit || 30,
            showTimer: savedSettings.showTimer !== undefined ? savedSettings.showTimer : true,
            randomizeQuestions: savedSettings.randomizeQuestions || false
          });
        }
        
        // Animate the settings after loading
        setTimeout(() => {
          setAnimateSettings(true);
        }, 100);
      } catch (err) {
        setError('Failed to load quiz');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [slug]);

  const handleStartQuiz = () => {
    // Save settings to localStorage
    localStorage.setItem(`quiz_settings_${slug}`, JSON.stringify(settings));
    navigate(`/start/${slug}`);
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSettings(prev => ({
      ...prev,
      timeLimit: value
    }));
  };

  const handleQuestionCountChange = (e) => {
    const value = parseInt(e.target.value);
    setSettings(prev => ({
      ...prev,
      questionCount: value
    }));
  };

  const toggleShowTimer = () => {
    setSettings(prev => ({
      ...prev,
      showTimer: !prev.showTimer
    }));
  };

  const toggleRandomizeQuestions = () => {
    setSettings(prev => ({
      ...prev,
      randomizeQuestions: !prev.randomizeQuestions
    }));
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Quiz Settings - MCQPedia</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="fixed inset-0 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">Loading quiz settings...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Error - MCQPedia</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto bg-red-50 p-6 rounded-lg border border-red-200">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Oops!</h2>
            <p className="text-gray-700">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center mt-8">Quiz not found</div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${quiz.name} - Quiz Settings | MCQPedia`}</title>
        <meta name="description" content={`Configure your quiz settings for ${quiz.name}. Set time limits, randomize questions, and customize your quiz experience.`} />
        <meta name="keywords" content={`${quiz.name}, quiz settings, quiz configuration, ${quiz.difficulty} quiz, online quiz`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://mcqpedia.com/settings/${quiz._id}`} />
        <meta property="og:title" content={`${quiz.name} - Quiz Settings | MCQPedia`} />
        <meta property="og:description" content={`${quiz.keywords.join(', ')}`} />
        <meta property="og:image" content="https://mcqpedia.com/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`https://mcqpedia.com/settings/${quiz._id}`} />
        <meta property="twitter:title" content={`${quiz.name} - Quiz Settings | MCQPedia`} />
        <meta property="twitter:description" content={`${quiz.keywords.join(', ')}`} />
        <meta property="twitter:image" content="https://mcqpedia.com/og-image.jpg" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="container mx-auto py-8 max-w-3xl">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center">
                <BookOpen size={24} className="mr-2" />
                <h1 className="text-2xl font-bold">{quiz.name}</h1>
              </div>
              <div className="mt-2 flex items-center">
                <Settings size={16} className="mr-2" />
                <p className="text-sm text-blue-100">Configure your quiz experience</p>
              </div>
            </div>
            
            {/* Settings content */}
            <div className="p-6">
              <div className={`mb-8 transition-all duration-500 transform ${animateSettings ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <h2 className="text-xl font-semibold mb-6 text-gray-800">Quiz Settings</h2>
                
                {/* Time Limit Setting */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Clock size={18} className="mr-2 text-blue-600" />
                      Time Limit <span className="text-xs text-gray-500 ml-1">(seconds per question)</span>
                    </label>
                    <span className="text-lg font-bold text-blue-600">{settings.timeLimit}s</span>
                  </div>
                  
                  
                  <div className="relative">
                    <input 
                      type="range" 
                      min="10" 
                      max="120" 
                      step="5"
                      value={settings.timeLimit} 
                      onChange={handleSliderChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10s</span>
                      <span>30s</span>
                      <span>60s</span>
                      <span>90s</span>
                      <span>120s</span>
                    </div>
                  </div>
                </div>


                  {/* Time Limit Setting */}
                  <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Clock size={18} className="mr-2 text-blue-600" />
                      Questions<span className="text-xs text-gray-500 ml-1">(Number of Questions)</span>
                    </label>
                    <span className="text-lg font-bold text-blue-600">{settings.questionCount || quiz.questionCount}</span>
                  </div>
                  
                  
                  <div className="relative">
                    <input 
                      type="range" 
                      min="1" 
                      max={quiz.questionCount} 
                      step="1"
                      value={settings.questionCount || quiz.questionCount} 
                      defaultValue={quiz.questionCount}
                      onChange={handleQuestionCountChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>5</span>
                      
                      <span>{quiz.questionCount}</span>
                    </div>
                  </div>
                </div>
                
                {/* Toggle Settings */}
                <div className="space-y-4">
                  {/* Show Timer Toggle - Fixed to be clickable across the entire component */}
                  <div 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={toggleShowTimer}
                  >
                    <div className="flex items-center">
                      {settings.showTimer ? (
                        <Eye size={18} className="mr-2 text-blue-600" />
                      ) : (
                        <EyeOff size={18} className="mr-2 text-gray-500" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        Show Timer
                      </span>
                    </div>
                    <div className="relative">
                      <div className={`w-11 h-6 rounded-full transition-colors ${settings.showTimer ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-transform ${settings.showTimer ? 'left-6' : 'left-1'}`}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Randomize Questions Toggle - Fixed to be clickable across the entire component */}
                  <div 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={toggleRandomizeQuestions}
                  >
                    <div className="flex items-center">
                      <Shuffle size={18} className={`mr-2 ${settings.randomizeQuestions ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span className="text-sm font-medium text-gray-700">
                        Randomize Questions
                      </span>
                    </div>
                    <div className="relative">
                      <div className={`w-11 h-6 rounded-full transition-colors ${settings.randomizeQuestions ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-transform ${settings.randomizeQuestions ? 'left-6' : 'left-1'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quiz Stats - Fixed text contrast issues for better visibility */}
              <div className={`mb-8 transition-all duration-500 delay-100 transform ${animateSettings ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <h3 className="text-md font-medium text-gray-700 mb-3">Quiz Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <p className="text-xs font-medium text-blue-700 mb-1">Questions</p>
                    <p className="text-lg font-bold text-blue-800">{settings.questionCount || quiz.questionCount}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <p className="text-xs font-medium text-purple-700 mb-1">Estimated Time</p>
                    <p className="text-lg font-bold text-purple-800">{Math.ceil((settings.questionCount ? settings.questionCount * settings.timeLimit : quiz.questionCount * settings.timeLimit) / 60)} min</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="text-xs font-medium text-green-700 mb-1">Attempts</p>
                    <p className="text-lg font-bold text-green-800">{settings.attempts || 0}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer with buttons - Fixed Back button contrast */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center px-4 py-2 bg-gray-200 border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-300 transition-colors"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back
                </button>
                <button
                  onClick={handleStartQuiz}
                  className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors"
                >
                  Start Quiz
                  <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizSettings;