import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LessonToolbar from "../components/LessonToolbar";
import { lessonService, accessService } from "../services/api";
import "../CSS/Alphabet.css";

const ITEMS_PER_PAGE = 8;

const ALPHABET_SORT_OPTIONS = [
  { value: "meaning-asc", label: "A → Z" },
  { value: "meaning-desc", label: "Z → A" },
];

const ALPHABET_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "letters", label: "Chữ cái" },
  { value: "diacritics", label: "Dấu thanh" },
];

const sortFunctions = {
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

const isDiacritic = (lesson) => lesson.title.toLowerCase().includes("dấu");

const Alphabet = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("meaning-asc");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    lessonService
      .getAll()
      .then((data) => {
        const alphabetLessons = data.filter(
          (l) =>
            l.title.toLowerCase().includes("chữ") ||
            l.title.toLowerCase().includes("dấu"),
        );
        setLessons(alphabetLessons);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return lessons
      .filter((l) => {
        if (filter === "letters") return !isDiacritic(l);
        if (filter === "diacritics") return isDiacritic(l);
        return true;
      })
      .filter((l) => matchesSearch(l, search))
      .sort((a, b) => (sortFunctions[sort] || sortFunctions["meaning-asc"])(a, b));
  }, [lessons, search, sort, filter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

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
        <>
          <LessonToolbar
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
            sortOptions={ALPHABET_SORT_OPTIONS}
            filter={filter}
            onFilterChange={setFilter}
            filterOptions={ALPHABET_FILTER_OPTIONS}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />

          {filtered.length === 0 ? (
            <div className="alphabet-status">Không tìm thấy bài học nào</div>
          ) : (
            <div className="alphabet-container">
              {paginated.map((lesson) => {
                const isDau = isDiacritic(lesson);
                return (
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
                        {isDau ? "Dấu thanh" : "Bảng chữ cái"}
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
                      {isDau ? (
                        <span className="alphabet-card__letter alphabet-card__letter--dau">
                          {lesson.meaning}
                        </span>
                      ) : (
                        <span className="alphabet-card__letter">
                          {lesson.meaning.replace("Chữ ", "")}
                          {lesson.meaning.replace("Chữ ", "").toLowerCase()}
                        </span>
                      )}
                    </div>

                    <div className="alphabet-card__content">
                      <p>{lesson.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <Footer />
    </>
  );
};

export default Alphabet;
