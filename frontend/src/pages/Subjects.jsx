import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { lessonService, accessService } from "../services/api";
import "../CSS/Subjects.css";

const Subjects = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    lessonService
      .getAll()
      .then((data) => {
        const subjects = data.filter(
          (l) =>
            !l.title.toLowerCase().includes("chữ") &&
            !l.title.toLowerCase().includes("số"),
        );
        setLessons(subjects);
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

      <div className="subjects-title">
        <h1>TỪ ĐIỂN</h1>
        <h2>Chủ đề thường gặp</h2>
      </div>

      {loading && <div className="subjects-status">Đang tải dữ liệu...</div>}

      {error && (
        <div className="subjects-status subjects-status--error">
          Lỗi: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <hr className="subjects-divider" />

          <div className="subjects-container">
            {lessons.map((lesson) => (
              <div
                className={`subjects-card ${selectedId === lesson.les_id ? "subjects-card--selected" : ""}`}
                key={lesson.les_id}
                onClick={() => {
                  setSelectedId(
                    selectedId === lesson.les_id ? null : lesson.les_id,
                  );
                  if (selectedId !== lesson.les_id)
                    accessService.recordAccess(lesson.les_id);
                }}
              >
                <div className="subjects-card__top">
                  <h3 className="subjects-card__title">
                    {lesson.meaning || lesson.title}
                  </h3>

                  <div className="subjects-card__tags">
                    <span className="tag tag--type">
                      <img src="/Assets/Images/icon-type.png" alt="" />
                      Ngôn ngữ ký hiệu
                    </span>
                    <span className="tag tag--region">
                      <img src="/Assets/Images/icon-region.png" alt="" />
                      Chủ đề
                    </span>
                  </div>

                  {selectedId === lesson.les_id && lesson.img_url && (
                    <div className="subjects-card__img-box">
                      <img
                        src={lesson.img_url}
                        alt={lesson.meaning}
                        className="subjects-card__img"
                      />
                    </div>
                  )}

                  <p className="subjects-card__desc">{lesson.content}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Footer />
    </>
  );
};

export default Subjects;
