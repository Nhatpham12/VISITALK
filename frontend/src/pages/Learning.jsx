import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { lessonService } from "../services/api";
import "../CSS/Learning.css";
import { Link } from "react-router-dom";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const NUMBER_RANGES = [
  { label: "1-10", start: 1, end: 10 },
  { label: "11-20", start: 11, end: 20 },
  { label: "21-30", start: 21, end: 30 },
  { label: "31-40", start: 31, end: 40 },
  { label: "41-50", start: 41, end: 50 },
];

const Learning = () => {
  const [lessons, setLessons] = useState({});
  const [numberLessons, setNumberLessons] = useState({});
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);

  useEffect(() => {
    lessonService.getAll().then((data) => {
      const letterMap = {};
      const numberMap = {};

      data.forEach((l) => {
        const title = (l.title || "").toLowerCase();
        if (title.includes("chữ")) {
          const letter = (l.meaning || "").replace("Chữ ", "").toUpperCase();
          if (letter) letterMap[letter] = l;
        }
        if (title.includes("số")) {
          const num = parseInt((l.meaning || "").replace("Số ", ""), 10);
          if (!isNaN(num)) numberMap[num] = l;
        }
      });

      setLessons(letterMap);
      setNumberLessons(numberMap);
    }).catch(() => {});
  }, []);

  const handleLetterClick = (letter) => {
    setSelectedRange(null);
    setSelectedLesson(lessons[letter] || null);
  };

  const handleRangeClick = (range) => {
    setSelectedLesson(null);
    setSelectedRange(range);
  };

  const handleCloseModal = () => {
    setSelectedLesson(null);
    setSelectedRange(null);
  };

  return (
    <>
      <Navbar />

      <h1 className="learning-title">TỪ ĐIỂN</h1>
      <div className="dictionary-table">
        <div className="table-header">
          <div className="col">Chủ đề</div>
          <div className="col">
            <Link to="/learning/alphabet">A-Z</Link>
          </div>
          <div className="col">
            <Link to="/learning/numbers">Số tự nhiên</Link>
          </div>
        </div>

        <div className="table-body">
          <div className="col">
            <ul>
              <Link to="/learning/greeting">
                <li>Chào hỏi</li>
              </Link>
              <li>Giao thông</li>
            </ul>
          </div>
          <div className="col az-col">
            <div className="az-grid">
              {LETTERS.map((letter) => (
                <span
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
          <div className="col num-col">
            <ul>
              {NUMBER_RANGES.map((range) => (
                <li key={range.label} onClick={() => handleRangeClick(range)}>
                  {range.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {selectedLesson && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              &times;
            </button>

            {selectedLesson.img_url && (
              <div className="modal-image-box">
                <img
                  src={selectedLesson.img_url}
                  alt={selectedLesson.meaning}
                  className="modal-image"
                />
              </div>
            )}

            <div className="modal-letter">
              {selectedLesson.meaning.replace("Chữ ", "").toUpperCase()}
            </div>

            {selectedLesson.content && (
              <p className="modal-description">{selectedLesson.content}</p>
            )}
          </div>
        </div>
      )}

      {selectedRange && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content modal-content--wide"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={handleCloseModal}>
              &times;
            </button>
            <h2 className="modal-range-title">{selectedRange.label}</h2>
            <div className="number-grid">
              {Array.from(
                { length: selectedRange.end - selectedRange.start + 1 },
                (_, i) => {
                  const num = selectedRange.start + i;
                  const lesson = numberLessons[num];
                  return (
                    <div key={num} className="number-card">
                      <span className="number-card__digit">{num}</span>
                      {lesson?.img_url && (
                        <img
                          src={lesson.img_url}
                          alt={String(num)}
                          className="number-card__img"
                        />
                      )}
                      {lesson?.content && (
                        <p className="number-card__desc">{lesson.content}</p>
                      )}
                      {!lesson && (
                        <p className="number-card__empty">Chưa có dữ liệu</p>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Learning;
