import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { lessonService, accessService } from "../services/api";
import "../CSS/Numbers.css";

const ITEMS_PER_PAGE = 9;

const Numbers = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  const TOTAL_PAGES = Math.ceil(lessons.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEntries = lessons.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goTo = (page) => {
    if (page >= 1 && page <= TOTAL_PAGES) setCurrentPage(page);
  };

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
        <>
          <hr className="numbers-divider" />

          <div className="numbers-container">
            {currentEntries.map((lesson) => (
              <div
                className="numbers-card"
                key={lesson.les_id}
                onClick={() => accessService.recordAccess(lesson.les_id)}
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

                  {/* {lesson.img_url && (
                    <div className="numbers-card__img-box">
                      <img
                        src={lesson.img_url}
                        alt={lesson.meaning}
                        className="numbers-card__img"
                      />
                    </div>
                  )} */}

                  <p className="numbers-card__desc">{lesson.content}</p>
                </div>

                <div className="numbers-card__number">
                  {lesson.meaning.replace("Số ", "")}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="numbers-pagination">
            <button
              className="pagination-btn"
              onClick={() => goTo(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ←
            </button>

            <span className="pagination-label">Trước</span>

            <div className="pagination-pages">
              {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`pagination-page ${currentPage === page ? "active" : ""}`}
                    onClick={() => goTo(page)}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <span className="pagination-label">Sau</span>

            <button
              className="pagination-btn"
              onClick={() => goTo(currentPage + 1)}
              disabled={currentPage === TOTAL_PAGES}
            >
              →
            </button>
          </div>
        </>
      )}

      <Footer />
    </>
  );
};

export default Numbers;
