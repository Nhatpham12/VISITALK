import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Learning.css";
import { Link } from "react-router-dom";
import { lessonService } from "../services/api";

const Learning = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    lessonService
      .getAll()
      .then((data) => {
        setLessons(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const subjects = lessons.filter(
    (l) =>
      !l.title.toLowerCase().includes("chữ") &&
      !l.title.toLowerCase().includes("số") &&
      !l.title.toLowerCase().includes("dấu"),
  );

  const alphabet = lessons
    .filter(
      (l) =>
        l.title.toLowerCase().includes("chữ") ||
        l.title.toLowerCase().includes("dấu"),
    )
    .sort((a, b) => a.meaning.localeCompare(b.meaning));

  const numbers = lessons
    .filter((l) => l.title.toLowerCase().includes("số"))
    .sort((a, b) => {
      const numA = parseInt(a.meaning.replace(/\D/g, ""), 10);
      const numB = parseInt(b.meaning.replace(/\D/g, ""), 10);
      return numA - numB;
    });

  return (
    <>
      <Navbar />

      <h1 className="learning-title">TỪ ĐIỂN</h1>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#374c72" }}>
          Đang tải dữ liệu...
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: "40px", color: "#c0392b" }}>
          Lỗi: {error}
        </div>
      )}

      {!loading && !error && (
        <>
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
              <div className="col sbj-col">
                <div className="sbj-grid">
                  {subjects.map((s) => (
                    <Link to="/learning/subjects" key={s.les_id}>
                      <span>{s.meaning || s.title}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="col az-col">
                <div className="az-grid">
                  {alphabet.map((a) => (
                    <Link to="/learning/alphabet" key={a.les_id}>
                      <span>{a.meaning.replace("Chữ ", "")}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="col num-col">
                <div className="num-grid">
                  {numbers.map((n) => (
                    <Link to="/learning/numbers" key={n.les_id}>
                      <span>{n.meaning}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="review-section">
            <h2 className="review-title">ÔN TẬP & THI</h2>
            <div className="review-cards">
              <Link to="/learning/flashcard" className="review-card">
                <div className="review-card__icon">&#128179;</div>
                <h3 className="review-card__title">Flashcard</h3>
                <p className="review-card__desc">
                  Ôn tập từ vựng với thẻ ghi nhớ. Lật thẻ để xem đáp án.
                </p>
              </Link>
              <Link to="/learning/quiz" className="review-card">
                <div className="review-card__icon">&#9997;</div>
                <h3 className="review-card__title">Trắc nghiệm</h3>
                <p className="review-card__desc">
                  Kiểm tra kiến thức với bài thi chọn hình hoặc nhập chữ.
                </p>
              </Link>
            </div>
          </div>
        </>
      )}

      <Footer />
    </>
  );
};

export default Learning;
