import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Clock, ArrowRight, AlertTriangle, Home } from 'lucide-react';
import { getQuizBySlug } from '../services/quizService';

const QuizPlay = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [settings , setSettings] = useState({});
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalTime, setTotalTime] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [questionOrder, setQuestionOrder] = useState([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [timeWarning, setTimeWarning] = useState(false);
  const [isQuestionAnimating, setIsQuestionAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const timeBarRef = useRef(null);
  const questionContainerRef = useRef(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await getQuizBySlug(slug);
        console.log(response.data);
        setQuiz(response.data);
        
        // Get settings from localStorage
        const settings = JSON.parse(localStorage.getItem(`quiz_settings_${slug}`) || '{}');
        setSettings(settings);
        const timeLimit = settings.timeLimit || 30;
        setTimeLeft(timeLimit);
        setTotalTime(timeLimit);
        
        // Initialize answers array
        const answerArray = new Array(settings.questionCount || response.data.questionCount).fill(null);
        setAnswers(answerArray);
        
        // Create question order based on settings
        let order = [...Array(settings.questionCount || response.data.questionCount).keys()];
        if (settings.randomizeQuestions) {
          // Shuffle the array
          order = order.sort(() => Math.random() - 0.5);
        }
        setQuestionOrder(order);
        localStorage.setItem(`quiz_order_${slug}` , JSON.stringify(order));

        
      } catch (err) {
        setError('Failed to load quiz');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
    
    // Set up event listener for page reload/navigation
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [slug]);

  useEffect(() => {
    if (!quiz) return;
    
    // Update progress
    const newProgress = ((currentQuestionIndex + 1) / (settings.questionCount || quiz.questionCount)) * 100;
    setProgress(newProgress);
    
    // Reset selected answer when changing questions
    setSelectedAnswer(answers[questionOrder[currentQuestionIndex]]);
    
    // Reset animation states
    if (questionContainerRef.current) {
      questionContainerRef.current.classList.remove('animate-slide-out');
      questionContainerRef.current.classList.add('animate-slide-in');
      setTimeout(() => {
        questionContainerRef.current.classList.remove('animate-slide-in');
        setIsQuestionAnimating(false);
      }, 300);
    }
    
    // Start timer animation if timeBar exists
    if (timeBarRef.current) {
      timeBarRef.current.style.width = '100%';
      setTimeout(() => {
        timeBarRef.current.style.width = '0%';
      }, 50);
    }
  }, [currentQuestionIndex, quiz, answers, questionOrder]);

  useEffect(() => {
    if (!quiz) return;
    
    const settings = JSON.parse(localStorage.getItem(`quiz_settings_${slug}`) || '{}');
    if (!settings.showTimer) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // Set warning when less than 25% time left
        if (prev <= Math.ceil(totalTime * 0.25) && prev > 0) {
          setTimeWarning(true);
        }
        
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, quiz, totalTime]);

  const handleTimeUp = () => {
    // Auto-select next question when time is up
    setTimeout(() => {
      handleNextQuestion();
    }, 1000);
  };

  const handleAnswerSelect = (option) => {
    if (showNextButton) return; // Prevent changing answer after next button appears
    
    setSelectedAnswer(option);
    const newAnswers = [...answers];
    newAnswers[questionOrder[currentQuestionIndex]] = option;
    setAnswers(newAnswers);
    
    // Show next button after selecting an answer
    setShowNextButton(true);
  };

  const handleNextQuestion = () => {
    if (isQuestionAnimating) return;
    
    setIsQuestionAnimating(true);
    setShowNextButton(false);
    setTimeWarning(false);
    
    // Reset the timer animation
    if (timeBarRef.current) {
      timeBarRef.current.style.transition = 'none';
      timeBarRef.current.style.width = '100%';
      // Force a reflow
      void timeBarRef.current.offsetWidth;
      timeBarRef.current.style.transition = `width ${totalTime}s linear`;
    }
    
    // Animate out current question
    if (questionContainerRef.current) {
      questionContainerRef.current.classList.add('animate-slide-out');
    }
    
    setTimeout(() => {
      if (currentQuestionIndex < (settings.questionCount || quiz.questionCount) - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        // Reset time
        setTimeLeft(totalTime);
      } else {
        // Save answers to localStorage
        localStorage.setItem(`quiz_answers_${slug}`, JSON.stringify(answers));
        navigate(`/result/${slug}`);
      }
    }, 300);
  };

  const toggleExitConfirm = () => {
    setShowExitConfirm(!showExitConfirm);
  };

  const handleExit = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading Quiz - MCQPedia</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="fixed inset-0 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">Loading quiz...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !quiz) {
    return (
      <>
        <Helmet>
          <title>Error - MCQPedia</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto bg-red-50 p-6 rounded-lg border border-red-200">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Oops!</h2>
            <p className="text-gray-700">{error || 'Quiz not found'}</p>
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

  const currentQuestion = quiz.mcq[questionOrder[currentQuestionIndex]];
  
  return (
    <>
      <Helmet>
        <title>{`${quiz.name} - Question ${currentQuestionIndex + 1} of ${settings.questionCount || quiz.questionCount} | MCQPedia`}</title>
        <meta name="description" content={`Take the ${quiz.name} quiz. Question ${currentQuestionIndex + 1} of ${settings.questionCount || quiz.questionCount}: ${currentQuestion.QUESTION}`} />
        <meta name="robots" content="noindex" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://mcqpedia.com/play/${slug}`} />
        <meta property="og:title" content={`${quiz.name} - Question ${currentQuestionIndex + 1} of ${quiz.questionCount} | MCQPedia`} />
        <meta property="og:description" content={`Take the ${quiz.name} quiz. Question ${currentQuestionIndex + 1} of ${quiz.questionCount}: ${currentQuestion.QUESTION}`} />
        <meta property="og:image" content="https://mcqpedia.com/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`https://mcqpedia.com/play/${slug}`} />
        <meta property="twitter:title" content={`${quiz.name} - Question ${currentQuestionIndex + 1} of ${quiz.questionCount} | MCQPedia`} />
        <meta property="twitter:description" content={`Take the ${quiz.name} quiz. Question ${currentQuestionIndex + 1} of ${quiz.questionCount}: ${currentQuestion.QUESTION}`} />
        <meta property="twitter:image" content="https://mcqpedia.com/og-image.jpg" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Exit Confirmation Modal */}
          {showExitConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
                <div className="flex items-center justify-center text-red-500 mb-4">
                  <AlertTriangle size={28} />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Exit Quiz?</h3>
                <p className="text-gray-600 text-center mb-6">
                  Your progress will be lost. Are you sure you want to exit?
                </p>
                <div className="flex justify-between gap-4">
                  <button
                    onClick={toggleExitConfirm}
                    className="flex-1 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExit}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Exit
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header with progress bar */}
            <div className="bg-blue-600 h-2" style={{ width: `${progress}%` }}></div>
            
            <div className="p-6">
              {/* Quiz info bar */}
              <div className="flex justify-between items-center mb-6">
                <div className="font-medium text-gray-600">
                  Question {currentQuestionIndex + 1} <span className="text-gray-400">of {settings.questionCount || quiz.questionCount}</span>
                </div>
                
                <div className={`flex items-center ${timeWarning ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                  <Clock size={18} className="mr-1" />
                  <span className="font-bold">{timeLeft}s</span>
                </div>
              </div>
              
              {/* Time bar */}
              <div className="w-full h-1 bg-gray-200 rounded-full mb-6 overflow-hidden">
                <div 
                  ref={timeBarRef}
                  className={`h-full ${timeWarning ? 'bg-red-500' : 'bg-blue-600'} transition-all ease-linear`}
                  style={{ width: '100%', transitionProperty: 'width', transitionDuration: `${totalTime}s` }}
                ></div>
              </div>
              
              {/* Question */}
              <div 
                ref={questionContainerRef}
                className="transition-all duration-300 transform"
              >
                <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900">
                  {currentQuestion.QUESTION}
                </h2>
                
                {/* Options */}
                <div className="space-y-4 mb-8">
                  {Object.entries(currentQuestion.OPTIONS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => handleAnswerSelect(key)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedAnswer === key
                          ? 'border-blue-500 bg-white shadow-md'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          selectedAnswer === key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {key}
                        </div>
                        <span className="text-black font-medium text-base sm:text-lg">{value}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Footer with navigation */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <button
                  onClick={toggleExitConfirm}
                  className="flex items-center text-gray-600 hover:text-gray-800 font-medium"
                >
                  <Home size={20} className="mr-2" />
                  Exit Quiz
                </button>
                
                {showNextButton ? (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md"
                  >
                    <span className="mr-2">{currentQuestionIndex < (settings.questionCount || quiz.questionCount) - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                    <ArrowRight size={20} />
                  </button>
                ) : (
                  <div className="px-6 py-3 text-gray-600 italic">
                    Select an answer to continue
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizPlay;