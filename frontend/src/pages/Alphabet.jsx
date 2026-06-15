import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { lessonService, accessService } from "../services/api";
import "../CSS/Alphabet.css";

const Alphabet = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    lessonService
      .getAll()
      .then((data) => {
        const alphabetLessons = data
          .filter((lesson) => lesson.title.toLowerCase().includes("chữ"))
          .sort((a, b) => a.meaning.localeCompare(b.meaning));
        setLessons(alphabetLessons);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />

      <div className="alphabet-title">
        <h1>TỪ ĐIỂN</h1>
        <h2>A-Z</h2>
      </div>

      {loading && <div className="alphabet-status">Đang tải dữ liệu...</div>}

      {error && (
        <div className="alphabet-status alphabet-status--error">
          Lỗi: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="alphabet-container">
          {lessons.map((lesson) => (
            <div
              className={`alphabet-card ${selectedId === lesson.les_id ? "alphabet-card--selected" : ""}`}
              key={lesson.les_id}
              onClick={() => {
                setSelectedId(
                  selectedId === lesson.les_id ? null : lesson.les_id,
                );
                if (selectedId !== lesson.les_id)
                  accessService.recordAccess(lesson.les_id);
              }}
            >
              <div className="alphabet-card__tags">
                <span className="tag tag--type">
                  <img src="/Assets/Images/icon-type.png" alt="" />
                  Ngôn ngữ ký hiệu
                </span>
                <span className="tag tag--region">
                  <img src="/Assets/Images/icon-region.png" alt="" />
                  Bảng chữ cái
                </span>
              </div>

              {selectedId === lesson.les_id && lesson.img_url && (
                <div className="alphabet-card__img-box">
                  <img
                    src={lesson.img_url}
                    alt={lesson.meaning}
                    className="alphabet-card__img"
                  />
                </div>
              )}

              <div className="alphabet-card__letter-box">
                <span className="alphabet-card__letter">
                  {lesson.meaning.replace("Chữ ", "")}
                  {lesson.meaning.replace("Chữ ", "").toLowerCase()}
                </span>
              </div>

              <div className="alphabet-card__content">
                <p>{lesson.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Footer />
    </>
  );
};

export default Alphabet;
