import { useState } from "react";
import "../CSS/LessonToolbar.css";

const LessonToolbar = ({
  search,
  onSearchChange,
  sort,
  onSortChange,
  sortOptions = [],
  filter,
  onFilterChange,
  filterOptions = [],
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 8,
}) => {
  const [inputValue, setInputValue] = useState(search);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    onSearchChange(value);
    onPageChange(1);
  };

  const handleSortChange = (e) => {
    onSortChange(e.target.value);
    onPageChange(1);
  };

  const handleFilterChange = (value) => {
    onFilterChange(value);
    onPageChange(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="lt-toolbar">
      <div className="lt-toolbar__top">
        <div className="lt-search">
          <svg className="lt-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="lt-search__input"
            placeholder="Tìm kiếm..."
            value={inputValue}
            onChange={handleSearchChange}
          />
          {inputValue && (
            <button className="lt-search__clear" onClick={() => { setInputValue(""); onSearchChange(""); onPageChange(1); }}>
              &times;
            </button>
          )}
        </div>

        {sortOptions.length > 0 && (
          <select className="lt-sort" value={sort} onChange={handleSortChange}>
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>

      {filterOptions.length > 0 && (
        <div className="lt-filter">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              className={`lt-filter__btn ${filter === opt.value ? "lt-filter__btn--active" : ""}`}
              onClick={() => handleFilterChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="lt-pagination">
          <button
            className="lt-pagination__btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div className="lt-pagination__pages">
            {getPageNumbers().map((page) => (
              <button
                key={page}
                className={`lt-pagination__page ${page === currentPage ? "lt-pagination__page--active" : ""}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="lt-pagination__btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          <span className="lt-pagination__label">
            {startItem}–{endItem} / {totalItems}
          </span>
        </div>
      )}
    </div>
  );
};

export default LessonToolbar;
