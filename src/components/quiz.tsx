import { useState, useEffect } from "react";
import "./quiz.css";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

const Quiz = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20); 

  const fetchQuestions = async () => {
    const res = await fetch(
      "https://opentdb.com/api.php?amount=5&type=multiple&encode=url3986"
    );
    const data = await res.json();

    const processed: Question[] = data.results.map((q: any) => {
      const decode = (s: string) => decodeURIComponent(s);
      const correct = decode(q.correct_answer);
      const incorrect = q.incorrect_answers.map((a: string) => decode(a));
      const all = [...incorrect, correct].sort(() => Math.random() - 0.5);
      return {
        question: decode(q.question),
        options: all,
        correctAnswer: correct,
      };
    });

    setQuestions(processed);
    setAnswers(Array(processed.length).fill(null));
    setCurrent(0);
    setSubmitted(false);
    setTimeLeft(20);
  };


  useEffect(() => {
    if (submitted || questions.length === 0) return;

    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else {
      next(); 
    }
  }, [timeLeft, submitted, questions.length]);

  
  const selectAnswer = (index: number) => {
    if (submitted) return;
    if (answers[current] !== null) return; 

    const newAns = [...answers];
    newAns[current] = index;
    setAnswers(newAns);

   
    setTimeout(() => {
      next();
    }, 500);
  };

  // Next or submit
  const next = () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setTimeLeft(20); 
    } else {
      setSubmitted(true);
    }
  };

  const restart = () => {
    setQuestions([]);
    setAnswers([]);
    setCurrent(0);
    setSubmitted(false);
    setTimeLeft(20);
  };

  
  const score = submitted
    ? answers.reduce((acc: any, ans, i) => {
        if (
          ans !== null &&
          questions[i].options[ans] === questions[i].correctAnswer
        ) {
          return acc + 1;
        }
        return acc;
      }, 0)
    : 0;

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <h1 className="quiz-title">Simple Quiz</h1>

        {questions.length === 0 && (
          <div className="start-box">
            <p>Click below to start!</p>
            <button className="btn" onClick={fetchQuestions}>
              Start Quiz
            </button>
          </div>
        )}

        {!submitted && questions.length > 0 && (
          <div>
            <p className="counter">
              Question {current + 1} of {questions.length}
            </p>
            <p className="timer">⏱ Time Left: {timeLeft}s</p>

            <h3 className="question">{questions[current].question}</h3>

            <div className="options">
              {questions[current].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => selectAnswer(idx)}
                  className={`option-btn ${
                    answers[current] === idx ? "selected" : ""
                  }`}
                  disabled={answers[current] !== null} 
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="next-box">
              <button className="btn" onClick={next}>
                {current === questions.length - 1 ? "Submit" : "Next"}
              </button>
            </div>
          </div>
        )}

        {submitted && (
          <div className="results">
            <h2>
              Your Score: {score} / {questions.length}
            </h2>

            <div className="review">
              {questions.map((q, i) => {
                const userAns =
                  answers[i] !== null
                    ? q.options[answers[i] as number]
                    : "No answer";
                return (
                  <div key={i} className="review-item">
                    <strong>
                      {i + 1}. {q.question}
                    </strong>
                    <p>
                      Your Answer:{" "}
                      <span
                        className={
                          userAns === q.correctAnswer ? "correct" : "incorrect"
                        }
                      >
                        {userAns}
                      </span>
                    </p>
                    <p>
                      Correct Answer:{" "}
                      <span className="correct">{q.correctAnswer}</span>
                    </p>
                  </div>
                );
              })}
            </div>

            <button className="btn" onClick={restart}>
              Restart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;