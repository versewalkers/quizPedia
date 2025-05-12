import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Award, BookOpen, ArrowRight, Users } from 'lucide-react';

const QuizCard = ({ quiz }) => {
  const navigate = useNavigate();
  
  // Get a color based on the quiz category or name
  const getCardColor = () => {
    const colors = [
      'from-blue-500 to-blue-700',
      'from-purple-500 to-purple-700',
      'from-green-500 to-green-700',
      'from-orange-500 to-orange-700',
      'from-red-500 to-red-700',
      'from-teal-500 to-teal-700',
    ];
    
    // Hash the quiz name to get a consistent color
    // const hash = quiz.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = Math.floor(Math.random() * colors.length);
    return colors[random];
  };
  
  // Generate a quiz badge based on difficulty
  const getQuizBadge = () => {
    const difficulty = quiz.difficulty || 'medium';
    
    const badges = {
      easy: { text: 'Easy', color: 'bg-green-100 text-green-800' },
      medium: { text: 'Medium', color: 'bg-blue-100 text-blue-800' },
      hard: { text: 'Hard', color: 'bg-red-100 text-red-800' },
    };
    
    return badges[difficulty.toLowerCase()] || badges.medium;
  };
  
  const badge = getQuizBadge();
  const questionCount = quiz.questionCount ? quiz.questionCount : 0;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Top colorful section */}
      <div className={`bg-gradient-to-br ${getCardColor()} p-6 h-32 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -ml-20 -mt-20 opacity-10"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mb-20 opacity-10"></div>
        </div>
        
        <div className="relative z-10">
          <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${badge.color}`}>
            {badge.text}
          </span>
          <h3 className="text-xl font-bold text-white mt-2 line-clamp-2">{quiz.name}</h3>
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-6">
        {console.log(quiz , "quiz")}
        <p className="text-gray-600 mb-4 line-clamp-2 h-12">
          {`${quiz.keywords.join(', ')}`}
        </p>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-gray-500 text-sm">
            <Clock size={16} className="mr-1" />
            <span>{questionCount * 30}s</span>
          </div>
          
          <div className="flex items-center text-gray-500 text-sm">
            <BookOpen size={16} className="mr-1" />
            <span>{questionCount} Questions</span>
          </div>
          
          <div className="flex items-center text-gray-500 text-sm">
            <Users size={16} className="mr-1" />
            <span>{(quiz.attempts || Math.floor(Math.random() * 1000))}</span>
          </div>
        </div>
        
        <button
          onClick={() => navigate(`/settings/${quiz._id}`)}
          className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg transition-colors group"
        >
          <span>Start Quiz</span>
          <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default QuizCard;