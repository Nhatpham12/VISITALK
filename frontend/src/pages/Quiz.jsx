import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { lessonService } from "../services/api";
import "../CSS/Quiz.css";

const CATEGORY_OPTIONS = [
  { value: "alphabet", label: "A-Z", keywords: ["chữ", "dấu"] },
  { value: "numbers", label: "Số tự nhiên", keywords: ["số"] },
  { value: "subjects", label: "Chủ đề", keywords: [] },
];

const QUESTIONS_PER_QUIZ = 10;
const TIMER_SECONDS = 30 * 60;

const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateQuestions = (lessons) => {
  const shuffled = shuffleArray(lessons);
  const selected = shuffled.slice(0, Math.min(QUESTIONS_PER_QUIZ, shuffled.length));

  return selected.map((correct) => {
    const others = lessons.filter((l) => l.les_id !== correct.les_id);
    const wrongOptions = shuffleArray(others).slice(0, 3);
    const options = shuffleArray([correct, ...wrongOptions]);
    return {
      question: correct.meaning,
      correctId: correct.les_id,
      options: options.map((o) => ({ id: o.les_id, img: o.img_url, label: o.meaning })),
    };
  });
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const Quiz = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(category || "alphabet");
  const [quizState, setQuizState] = useState("select");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef(null);

  useEffect(() => {
    if (category && CATEGORY_OPTIONS.some((c) => c.value === category)) {
      setActiveCategory(category);
    }
  }, [category]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    lessonService
      .getAll()
      .then((data) => {
        let filtered;
        if (activeCategory === "subjects") {
          filtered = data.filter(
            (l) =>
              !l.title.toLowerCase().includes("chữ") &&
              !l.title.toLowerCase().includes("số") &&
              !l.title.toLowerCase().includes("dấu"),
          );
        } else {
          const cat = CATEGORY_OPTIONS.find((c) => c.value === activeCategory);
          filtered = data.filter((l) =>
            cat.keywords.some((kw) => l.title.toLowerCase().includes(kw)),
          );
        }
        setLessons(filtered);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [activeCategory]);

  useEffect(() => {
    if (quizState === "playing" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [quizState, timeLeft]);

  useEffect(() => {
    if (quizState === "playing" && timeLeft === 0) {
      clearInterval(timerRef.current);
      setQuizState("result");
    }
  }, [timeLeft, quizState]);

  const startQuiz = useCallback(() => {
    if (lessons.length < 4) return;
    const qs = generateQuestions(lessons);
    setQuestions(qs);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setTimeLeft(TIMER_SECONDS);
    setQuizState("playing");
  }, [lessons]);

  const handleSelectAnswer = useCallback(
    (optionId) => {
      if (selectedAnswer !== null) return;
      setSelectedAnswer(optionId);
      const isCorrect = optionId === questions[currentQ].correctId;
      setAnswers((prev) => [...prev, { questionIndex: currentQ, selected: optionId, correct: isCorrect }]);
    },
    [selectedAnswer, currentQ, questions],
  );

  const handleNext = useCallback(() => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
    } else {
      clearInterval(timerRef.current);
      setQuizState("result");
    }
  }, [currentQ, questions.length]);

  const handleKeyDown = useCallback(
    (e) => {
      if (quizState !== "playing") return;
      if (e.key === "Enter" && selectedAnswer !== null) {
        handleNext();
      }
    },
    [quizState, selectedAnswer, handleNext],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const correctCount = answers.filter((a) => a.correct).length;
  const getScoreLabel = (correct, total) => {
    if (total === 0) return "";
    const pct = (correct / total) * 100;
    if (pct >= 90) return "Xuất sắc!";
    if (pct >= 70) return "Tốt!";
    if (pct >= 50) return "Trung bình";
    return "Cần cải thiện";
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setQuizState("select");
    clearInterval(timerRef.current);
    navigate(`/learning/quiz/${cat}`, { replace: true });
  };

  const handleRetry = () => {
    setQuizState("select");
    setSelectedAnswer(null);
    setAnswers([]);
    clearInterval(timerRef.current);
  };

  return (
    <>
      <Navbar />

      <div className="quiz-page">
        <h1 className="quiz-title">TRẮC NGHIỆM</h1>

        <div className="quiz-category-bar">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.value}
              className={`quiz-cat-btn ${activeCategory === cat.value ? "quiz-cat-btn--active" : ""}`}
              onClick={() => handleCategoryChange(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading && <div className="quiz-status">Đang tải dữ liệu...</div>}
        {error && (
          <div className="quiz-status quiz-status--error">Lỗi: {error}</div>
        )}

        {!loading && !error && quizState === "select" && (
          <div className="quiz-select">
            <p className="quiz-select__info">
              {lessons.length} từ vựng sẵn sàng
            </p>
            {lessons.length < 4 ? (
              <p className="quiz-select__warning">
                Cần ít nhất 4 từ vựng để bắt đầu trắc nghiệm
              </p>
            ) : (
              <button className="quiz-start-btn" onClick={startQuiz}>
                Bắt đầu thi
              </button>
            )}
          </div>
        )}

        {!loading && !error && quizState === "playing" && questions.length > 0 && (
          <div className="quiz-main">
            <div className="quiz-header">
              <span className="quiz-progress-text">
                Câu {currentQ + 1}/{questions.length}
              </span>
              <span className={`quiz-timer ${timeLeft <= 60 ? "quiz-timer--warning" : ""}`}>
                {formatTime(timeLeft)}
              </span>
              <span className="quiz-score-live">
                Đúng: {correctCount}
              </span>
            </div>

            <div className="quiz-progress-bar">
              <div
                className="quiz-progress-bar__fill"
                style={{
                  width: `${((currentQ + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            <div className="quiz-question-box">
              <p className="quiz-question-text">
                {questions[currentQ].question}
              </p>
              <div className="quiz-image-options">
                {questions[currentQ].options.map((opt) => {
                  let optClass = "quiz-image-option";
                  if (selectedAnswer !== null) {
                    if (opt.id === questions[currentQ].correctId) {
                      optClass += " quiz-image-option--correct";
                    } else if (
                      opt.id === selectedAnswer &&
                      opt.id !== questions[currentQ].correctId
                    ) {
                      optClass += " quiz-image-option--wrong";
                    }
                  }
                  return (
                    <button
                      key={opt.id}
                      className={optClass}
                      onClick={() => handleSelectAnswer(opt.id)}
                      disabled={selectedAnswer !== null}
                    >
                      <img src={opt.img} alt={opt.label} />
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedAnswer !== null && (
              <button className="quiz-next-btn" onClick={handleNext}>
                {currentQ < questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
              </button>
            )}
          </div>
        )}

        {quizState === "result" && (
          <div className="quiz-result">
            <h2 className="quiz-result__title">Kết quả</h2>
            <div className="quiz-result__score">
              <span className="quiz-result__number">{correctCount}</span>
              <span className="quiz-result__separator">/</span>
              <span className="quiz-result__total">{questions.length}</span>
            </div>
            <p className="quiz-result__label">
              {getScoreLabel(correctCount, questions.length)}
            </p>
            {timeLeft === 0 && (
              <p className="quiz-result__time-up">Hết thời gian!</p>
            )}
            <div className="quiz-result__actions">
              <button className="quiz-result__btn quiz-result__btn--retry" onClick={handleRetry}>
                Làm lại
              </button>
              <button
                className="quiz-result__btn quiz-result__btn--back"
                onClick={() => navigate("/learning")}
              >
                Quay về Learning
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default Quiz;
