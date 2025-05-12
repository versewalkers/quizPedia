import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import QuizCard from '../components/QuizCard';
import { Home, RefreshCw, Award, ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateQuizResults, getQuizBySlug } from '../services/quizService';

const QuizResult = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [animateScore, setAnimateScore] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [settings, setSettings] = useState({});
  
  const scoreRef = useRef(null);
  
  useEffect(() => {
    const fetchResult = async () => {
      try {
        // Get answers from localStorage
        const answers = JSON.parse(localStorage.getItem(`quiz_answers_${slug}`) || '[]');
        
        if (!answers || answers.length === 0) {
          throw new Error('No answers found');
        }
        
        // Get quiz data first
        const quizResponse = await getQuizBySlug(slug);
        console.log(quizResponse , "quizResponse")
        const quizData = quizResponse.data;
        setQuiz(quizData);
        
        // Calculate results
        const response = await calculateQuizResults(quizData, answers);
        setResult(response.data);
        
        // Trigger animations
        setTimeout(() => {
          setAnimateScore(true);
          if (response.data.percentage >= 70) {
            triggerConfetti();
          }
        }, 500);
        
        setTimeout(() => {
          setShowDetails(true);
        }, 1500);
        
      } catch (err) {
        setError('Failed to load quiz results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
    const settings = JSON.parse(localStorage.getItem(`quiz_settings_${slug}`) || '{}');
    setSettings(settings);
  }, [slug]);

  const triggerConfetti = () => {
    if (typeof confetti !== 'function') return;
    
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Since they fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleRetakeQuiz = () => {
    navigate(`/settings/${quiz._id}`);
  };

  const handleGoHome = () => {
    navigate('/');
  };
  
  const toggleQuestionDetails = (index) => {
    if (activeQuestion === index) {
      setActiveQuestion(null);
    } else {
      setActiveQuestion(index);
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Results - MCQPedia</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="fixed inset-0 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">Loading results...</p>
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
            <h2 className="text-2xl font-bold text-red-600 mb-2">{error}</h2>
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

  if (!result || !quiz) {
    return (
      <>
        <Helmet>
          <title>No Results Found - MCQPedia</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto bg-red-50 p-6 rounded-lg border border-red-200">
            <h2 className="text-2xl font-bold text-red-600 mb-2">No Results Found</h2>
            <p className="text-gray-700">We couldn't find any quiz results. Please try taking the quiz again.</p>
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

  const order = JSON.parse(localStorage.getItem(`quiz_order_${slug}`)) || [];
  const questions = order.map(index => quiz.mcq[index]);
  const score = result.score;
  const totalQuestions = questions.length;
  const percentage = result.percentage;

  const getPerformanceDetails = () => {
    if (percentage >= 80) {
      return {
        emoji: "🏆",
        title: "Excellent!",
        message: "You're a master of this topic!",
        color: "text-green-600",
        icon: <Award size={28} className="text-yellow-500" />
      };
    }
    if (percentage >= 60) {
      return {
        emoji: "🔥",
        title: "Good Job!",
        message: "You have a solid understanding of the topic.",
        color: "text-blue-600",
        icon: <CheckCircle size={28} className="text-blue-500" />
      };
    }
    if (percentage >= 40) {
      return {
        emoji: "🤔",
        title: "Not Bad",
        message: "You're on the right track, but have room to improve.",
        color: "text-orange-600",
        icon: <AlertCircle size={28} className="text-orange-500" />
      };
    }
    return {
      emoji: "📚",
      title: "Keep Learning",
      message: "Review the material and try again to improve your score.",
      color: "text-red-600",
      icon: <RefreshCw size={28} className="text-red-500" />
    };
  };
  
  const performanceDetails = getPerformanceDetails();

  // Get a random quiz for suggestion
  const suggestedQuiz = quiz;
  
  // Get the circular progress value
  const circumference = 2 * Math.PI * 40; // 40 is the radius
  const progressValue = (percentage / 100) * circumference;

  return (
    <>
      <Helmet>
        <title>{`${quiz.name} - Quiz Results (${percentage}%) | MCQPedia`}</title>
        <meta name="description" content={`You scored ${score} out of ${totalQuestions} (${percentage}%) in the ${quiz.name} quiz. ${performanceDetails.message}`} />
        <meta name="robots" content="noindex" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://mcqpedia.com/result/${slug}`} />
        <meta property="og:title" content={`${quiz.name} - Quiz Results (${percentage}%) | MCQPedia`} />
        <meta property="og:description" content={`You scored ${score} out of ${totalQuestions} (${percentage}%) in the ${quiz.name} quiz. ${performanceDetails.message}`} />
        <meta property="og:image" content="https://mcqpedia.com/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`https://mcqpedia.com/result/${slug}`} />
        <meta property="twitter:title" content={`${quiz.name} - Quiz Results (${percentage}%) | MCQPedia`} />
        <meta property="twitter:description" content={`You scored ${score} out of ${totalQuestions} (${percentage}%) in the ${quiz.name} quiz. ${performanceDetails.message}`} />
        <meta property="twitter:image" content="https://mcqpedia.com/og-image.jpg" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Results Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <h1 className="text-3xl font-bold text-center">Quiz Results</h1>
            </div>
            
            {/* Score Display */}
            <div className="py-8 px-6 flex flex-col items-center">
              <div className="relative mb-6">
                <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="40" 
                    fill="none" 
                    stroke="#e5e7eb" 
                    strokeWidth="8"
                  />
                  <circle 
                    ref={scoreRef}
                    cx="50" cy="50" r="40" 
                    fill="none" 
                    stroke={percentage >= settings.questionCount * 0.6 ? "#3b82f6" : percentage >= settings.questionCount * 0.4 ? "#f97316" : "#ef4444"} 
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={animateScore ? circumference - progressValue : circumference}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-gray-800">{score}</span>
                  <span className="text-sm text-gray-500">of {settings.questionCount || quiz.questionCount}</span>
                </div>
              </div>

              <div className={`text-center mb-6 transition-all duration-500 transform ${animateScore ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex items-center justify-center mb-2">
                  <span className="text-4xl mr-2">{performanceDetails.emoji}</span>
                  {performanceDetails.icon}
                </div>
                <h2 className={`text-2xl font-bold ${performanceDetails.color} mb-1`}>
                  {performanceDetails.title}
                </h2>
                <p className="text-gray-600">{performanceDetails.message}</p>
                <p className="text-lg font-semibold mt-2">
                  Score: {percentage.toFixed(0)}%
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button
                  onClick={handleRetakeQuiz}
                  className="flex-1 flex items-center justify-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw size={18} className="mr-2" />
                  Retake Quiz
                </button>
                <button
                  onClick={handleGoHome}
                  className="flex-1 flex items-center justify-center bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Home size={18} className="mr-2" />
                  Home
                </button>
              </div>
            </div>
          </div>

          {/* Question Details */}
          <div className={`bg-white rounded-xl shadow-lg overflow-hidden mb-8 transition-all duration-500 transform ${showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Question Details</h2>
              <p className="text-gray-600">Review your answers and see explanations.</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {questions.map((question, index) => (
                <div key={index} className="p-6">
                  <div 
                    className="flex justify-between items-start cursor-pointer" 
                    onClick={() => toggleQuestionDetails(index)}
                  >
                    <div className="flex items-start">
                      {/* Question status icon */}
                      <div className="mr-4 mt-1">
                        {console.log(result.answers[index].isCorrect , "result.answers[index].isCorrect")}
                        {result.answers[index].isCorrect ? (
                          <CheckCircle size={24} className="text-green-500" /> 
                        ) : (
                          <XCircle size={24} className="text-red-500" />
                        )}
                      </div>
                      
                      {/* Question text */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">
                          Question {index + 1}
                        </h3>
                        <p className="text-gray-700 mt-1">{question.QUESTION}</p>
                      </div>
                    </div>
                    
                    {/* Expand/collapse indicator */}
                    <div className={`transition-transform ${activeQuestion === index ? 'rotate-90' : ''}`}>
                      <ArrowRight size={20} className="text-gray-500" />
                    </div>
                  </div>
                  
                  {/* Expanded details */}
                  {activeQuestion === index && (
                    <div className="mt-4 pl-10">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-1">Your answer:</p>
                          <p className={`font-medium ${result.answers[index].isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {result.answers[index].userAnswer}
                          </p>
                        </div>
                        
                        {!result.answers[index].isCorrect && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-1">Correct answer:</p>
                            <p className="font-medium text-green-600">
                              {result.answers[index].correctAnswer}
                            </p>
                          </div>
                        )}
                        
                        {result.answers[index].explanation && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Explanation:</p>
                            <p className="text-gray-700">{result.answers[index].explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Suggested Next Quiz */}
          <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 transform ${showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Continue Learning</h2>
              <p className="text-gray-600">Suggested quiz based on your interests.</p>
            </div>
            
            <div className="p-6">
              <QuizCard 
                quiz={suggestedQuiz} 
                onClick={() => navigate(`/settings/${suggestedQuiz.slug}`)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizResult;