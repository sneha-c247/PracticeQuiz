

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

async function fetchQue(category: number): Promise<Question[]> {
  const res = await axios.get(`https://opentdb.com/api.php?amount=10&type=multiple&category=${category}`);
  return res.data.results;
}

const Quiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); 
  const [category, setCategory] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(10);
 
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(prevTimer => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timer]);
  
  useEffect(() => {
    if (timer === 0) {
      handleNextQuestion();
    }
  }, [timer]);

  const { data, isLoading, isError } = useQuery(['post', category], () => fetchQue(category || 0));
  

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = parseInt(e.target.value, 10);
    setCategory(selectedCategory);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    setTimer(10);
  };

  const handleAnswerSelection = (selectedAnswer: string) => {
    const currentQuestion = data?.[currentQuestionIndex];
    if (selectedAnswer === currentQuestion?.correct_answer) {
      setScore(prevScore => prevScore + 1);
    }
    handleNextQuestion(); // Move to the next question after answering
  };

  if (!category) {
    return (
      <div>
        <h2>Select Category:</h2>
        <select value={category || ''} onChange={handleCategoryChange}>
          <option value="">Please Select</option>
          <option value={9}>General Knowledge</option>
          <option value={10}>Entertainment: Books</option>
          {/* Add more category options as needed */}
        </select>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching data</div>;
  }

  if (!data || currentQuestionIndex >= data.length) {
    return (
      <div>
        <h1>Quiz Completed!</h1>
        <h2>Total Score: {score}</h2>
      </div>
    );
  }

  const currentQuestion = data[currentQuestionIndex];

  return (
    <div>
      <div>
        <h2>Question {currentQuestionIndex + 1} of {data.length}</h2>
        <h1>{currentQuestion.question}</h1>
        <h3>Time Remaining: {timer} seconds</h3>
        <ul>
          {currentQuestion.incorrect_answers.map((answer, index) => (
            <button key={index} onClick={() => handleAnswerSelection(answer)}>{answer}</button>
          ))}
          <button onClick={() => handleAnswerSelection(currentQuestion.correct_answer)}>
            {currentQuestion.correct_answer}
          </button>
        </ul>
      </div>
    </div>
  );
};

export default Quiz;
