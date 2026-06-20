import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LessonToolbar from "../components/LessonToolbar";
import { lessonService, accessService } from "../services/api";
import "../CSS/Numbers.css";

const ITEMS_PER_PAGE = 8;

const NUMBERS_SORT_OPTIONS = [
  { value: "number-asc", label: "Số tăng dần" },
  { value: "number-desc", label: "Số giảm dần" },
  { value: "meaning-asc", label: "A → Z" },
  { value: "meaning-desc", label: "Z → A" },
];

const getNumberValue = (meaning) => {
  return parseInt(meaning.replace(/\D/g, ""), 10) || 0;
};

const sortFunctions = {
  "number-asc": (a, b) => getNumberValue(a.meaning) - getNumberValue(b.meaning),
  "number-desc": (a, b) => getNumberValue(b.meaning) - getNumberValue(a.meaning),
  "meaning-asc": (a, b) => a.meaning.localeCompare(b.meaning),
  "meaning-desc": (a, b) => b.meaning.localeCompare(a.meaning),
};

const matchesSearch = (lesson, q) => {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    lesson.title.toLowerCase().includes(lower) ||
    (lesson.meaning && lesson.meaning.toLowerCase().includes(lower)) ||
    (lesson.content && lesson.content.toLowerCase().includes(lower))
  );
};

const Numbers = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("number-asc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    lessonService
      .getAll()
      .then((data) => {
        const numberLessons = data.filter((l) =>
          l.title.toLowerCase().includes("số"),
        );
        setLessons(numberLessons);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return lessons
      .filter((l) => matchesSearch(l, search))
      .sort((a, b) => (sortFunctions[sort] || sortFunctions["number-asc"])(a, b));
  }, [lessons, search, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

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
          <LessonToolbar
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
            sortOptions={NUMBERS_SORT_OPTIONS}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />

          {filtered.length === 0 ? (
            <div className="numbers-status">Không tìm thấy bài học nào</div>
          ) : (
            <div className="numbers-container">
              {paginated.map((lesson) => (
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
        </>
      )}

      <Footer />
    </>
  );
};

export default Numbers;
