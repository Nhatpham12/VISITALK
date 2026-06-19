import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { lessonService, accessService } from "../services/api";
import "../CSS/Numbers.css";

const Numbers = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    lessonService
      .getAll()
      .then((data) => {
        const numberLessons = data
          .filter((l) => l.title.toLowerCase().includes("số"))
          .sort((a, b) => {
            const numA = parseInt(a.meaning.replace(/\D/g, ""), 10);
            const numB = parseInt(b.meaning.replace(/\D/g, ""), 10);
            return numA - numB;
          });
        setLessons(numberLessons);
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

      <div className="numbers-title">
        <h1>TỪ ĐIỂN</h1>
        <h2>Số tự nhiên</h2>
      </div>

      {loading && <div className="numbers-status">Đang tải dữ liệu...</div>}

      {error && (
        <div className="numbers-status numbers-status--error">Lỗi: {error}</div>
      )}

      {!loading && !error && (
        <div className="numbers-container">
          {lessons.map((lesson) => (
            <div
              className={`numbers-card ${selectedId === lesson.les_id ? "numbers-card--selected" : ""}`}
              key={lesson.les_id}
              onClick={() => {
                setSelectedId(
                  selectedId === lesson.les_id ? null : lesson.les_id,
                );
                if (selectedId !== lesson.les_id)
                  accessService.recordAccess(lesson.les_id);
              }}
            >
              <div className="numbers-card__top">
                <h3 className="numbers-card__title">{lesson.meaning}</h3>

                <div className="numbers-card__tags">
                  <span className="tag tag--type">
                    <img src="/Assets/Images/icon-type.png" alt="" />
                    Ngôn ngữ ký hiệu
                  </span>
                  <span className="tag tag--region">
                    <img src="/Assets/Images/icon-region.png" alt="" />
                    Số tự nhiên
                  </span>
                </div>

                {selectedId === lesson.les_id && lesson.img_url && (
                  <div className="numbers-card__img-box">
                    <img
                      src={lesson.img_url}
                      alt={lesson.meaning}
                      className="numbers-card__img"
                    />
                  </div>
                )}

                <p className="numbers-card__desc">{lesson.content}</p>
              </div>

              <div className="numbers-card__number">
                {lesson.meaning.replace("Số ", "")}
              </div>
            </div>
          ))}
        </div>
      )}

      <Footer />
    </>
  );
};

export default Numbers;
