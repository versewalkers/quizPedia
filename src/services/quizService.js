// API endpoints
const API_URL = 'https://api.quizverse.com/v1';
const temp_URL = 'https://versewalkers-backend.vercel.app';

// Simulated API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get all quizzes
export const getAllQuizzes = async () => {
  await delay(1000); // Simulated delay
  const response = await fetch(`${temp_URL}/titles`);
  return { data: await response.json() };
};

// Get quiz by slug
export const getQuizBySlug = async (slug) => {
  await delay(1000); // Simulated delay
  const response = await fetch(`${temp_URL}/mcq/${slug}`);
  const data = await response.json();
  return { data: data };
};

// Calculate quiz results on frontend
export const calculateQuizResults = async (quiz, userAnswers) => {
  await delay(500); // Small delay for UX
  
  let score = 0;
  const answers = [];
  
  // Process each question
  quiz.mcq.forEach((question, index) => {
    const userAnswer = userAnswers[index];
    const isCorrect = userAnswer === question.ANSWER;
    
    if (isCorrect) {
      score++;
    }
    
    answers.push({
      question: question.QUESTION,
      userAnswer: userAnswer,
      correctAnswer: question.ANSWER,
      isCorrect: isCorrect,
      explanation: question.EXPLANATION
    });
  });
  const settings = JSON.parse(localStorage.getItem(`quiz_settings_${quiz._id}`)) || {};
  const percentage = (score / settings.questionCount) * 100;
  
  return {
    data: {
      score,
      totalQuestions: settings.questionCount,
      percentage,
      answers
    }
  };
};

// Export as an object for easier imports
const quizService = {
  getAllQuizzes,
  getQuizBySlug,
  calculateQuizResults
};

export default quizService;
