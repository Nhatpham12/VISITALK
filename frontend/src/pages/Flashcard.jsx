import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { lessonService } from "../services/api";
import "../CSS/Flashcard.css";

const CATEGORY_OPTIONS = [
  { value: "alphabet", label: "A-Z", keywords: ["chữ", "dấu"] },
  { value: "numbers", label: "Số tự nhiên", keywords: ["số"] },
  { value: "subjects", label: "Chủ đề", keywords: [] },
];

const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Flashcard = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(category || "alphabet");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);

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
        setCurrentIndex(0);
        setIsFlipped(false);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [activeCategory]);

  const displayLessons = useMemo(() => {
    return shuffled ? shuffleArray(lessons) : lessons;
  }, [lessons, shuffled]);

  const currentLesson = displayLessons[currentIndex];
  const totalCards = displayLessons.length;
  const progress = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, totalCards]);

  const handleFlip = useCallback(() => {
    setIsFlipped((f) => !f);
  }, []);

  const handleShuffle = useCallback(() => {
    setShuffled((s) => !s);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShuffled(false);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === " " && !e.target.closest("input")) {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    },
    [handleFlip, handlePrev, handleNext],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    navigate(`/learning/flashcard/${cat}`, { replace: true });
  };

  return (
    <>
      <Navbar />

      <div className="flashcard-page">
        <h1 className="flashcard-title">ÔN TẬP FLASHCARD</h1>

        <div className="flashcard-category-bar">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.value}
              className={`flashcard-cat-btn ${activeCategory === cat.value ? "flashcard-cat-btn--active" : ""}`}
              onClick={() => handleCategoryChange(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flashcard-status">Đang tải dữ liệu...</div>
        )}
        {error && (
          <div className="flashcard-status flashcard-status--error">
            Lỗi: {error}
          </div>
        )}

        {!loading && !error && totalCards > 0 && (
          <div className="flashcard-main">
            <div className="flashcard-counter">
              {currentIndex + 1} / {totalCards}
            </div>

            <div
              className={`flashcard-card ${isFlipped ? "flashcard-card--flipped" : ""}`}
              onClick={handleFlip}
            >
              <div className="flashcard-card__front">
                {currentLesson?.img_url && (
                  <img
                    src={currentLesson.img_url}
                    alt={currentLesson.meaning}
                    className="flashcard-card__img"
                  />
                )}
                <p className="flashcard-card__hint">Nhấn để lật thẻ</p>
              </div>
              <div className="flashcard-card__back">
                <span className="flashcard-card__meaning">
                  {currentLesson?.meaning}
                </span>
                <p className="flashcard-card__content">
                  {currentLesson?.content}
                </p>
              </div>
            </div>

            <div className="flashcard-progress">
              <div
                className="flashcard-progress__bar"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flashcard-controls">
              <button
                className="flashcard-nav-btn"
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                &#9664;
              </button>
              <button
                className="flashcard-action-btn"
                onClick={handleShuffle}
                title={shuffled ? "Xáo trộn lại" : "Xáo trộn"}
              >
                &#128256;
              </button>
              <button
                className="flashcard-action-btn"
                onClick={handleReset}
                title="Đặt lại"
              >
                &#8634;
              </button>
              <button
                className="flashcard-nav-btn"
                onClick={handleNext}
                disabled={currentIndex === totalCards - 1}
              >
                &#9654;
              </button>
            </div>
          </div>
        )}

        {!loading && !error && totalCards === 0 && (
          <div className="flashcard-status">
            Không có dữ liệu cho danh mục này
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default Flashcard;
