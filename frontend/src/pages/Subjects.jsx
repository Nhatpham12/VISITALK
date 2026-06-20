import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LessonToolbar from "../components/LessonToolbar";
import { lessonService, accessService } from "../services/api";
import "../CSS/Subjects.css";

const ITEMS_PER_PAGE = 8;

const SUBJECTS_SORT_OPTIONS = [
  { value: "meaning-asc", label: "A → Z" },
  { value: "meaning-desc", label: "Z → A" },
];

const sortFunctions = {
  "meaning-asc": (a, b) =>
    (a.meaning || a.title).localeCompare(b.meaning || b.title),
  "meaning-desc": (a, b) =>
    (b.meaning || b.title).localeCompare(a.meaning || a.title),
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

const Subjects = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("meaning-asc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    lessonService
      .getAll()
      .then((data) => {
        const subjects = data.filter(
          (l) =>
            !l.title.toLowerCase().includes("chữ") &&
            !l.title.toLowerCase().includes("số") &&
            !l.title.toLowerCase().includes("dấu"),
        );
        setLessons(subjects);
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
      .sort((a, b) =>
        (sortFunctions[sort] || sortFunctions["meaning-asc"])(a, b),
      );
  }, [lessons, search, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

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
          <LessonToolbar
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
            sortOptions={SUBJECTS_SORT_OPTIONS}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />

          <hr className="subjects-divider" />

          {filtered.length === 0 ? (
            <div className="subjects-status">Không tìm thấy bài học nào</div>
          ) : (
            <div className="subjects-container">
              {paginated.map((lesson) => (
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
          )}
        </>
      )}

      <Footer />
    </>
  );
};

export default Subjects;
