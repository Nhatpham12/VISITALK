import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Numbers.css";

const NUMBER_ENTRIES = [
  {
    id: 1,
    title: "Số Một",
    type: "Danh từ",
    region: "Toàn quốc",
    display: "01",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
  },
  {
    id: 2,
    title: "Số Hai",
    type: "Danh từ",
    region: "Toàn quốc",
    display: "02",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
  },
  {
    id: 3,
    title: "Số Ba",
    type: "Danh từ",
    region: "Toàn quốc",
    display: "03",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
  },
  {
    id: 4,
    title: "Số Bốn",
    type: "Danh từ",
    region: "Toàn quốc",
    display: "04",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
  },
  {
    id: 5,
    title: "Số Năm",
    type: "Danh từ",
    region: "Toàn quốc",
    display: "05",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
  },
  {
    id: 6,
    title: "Số Sáu",
    type: "Danh từ",
    region: "Toàn quốc",
    display: "06",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
  },
  {
    id: 7,
    title: "Số Bảy",
    type: "Danh từ",
    region: "Toàn quốc",
    display: "07",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
  },
  {
    id: 8,
    title: "Số Tám",
    type: "Danh từ",
    region: "Toàn quốc",
    display: "08",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
  },
  {
    id: 9,
    title: "Số Chín",
    type: "Danh từ",
    region: "Toàn quốc",
    display: "09",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
  },
  {
    id: 10,
    title: "Số Mười",
    type: "Danh từ",
    region: "Toàn quốc",
    display: "10",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
  },
  {
    id: 11,
    title: "Số Mười Một",
    type: "Danh từ",
    region: "Toàn quốc",
    display: "11",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
  },
  {
    id: 12,
    title: "Số Mười Hai",
    type: "Danh từ",
    region: "Toàn quốc",
    display: "12",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
  },
  {
    id: 13,
    title: "Số Mười Ba",
    type: "Danh từ",
    region: "Toàn quốc",
    display: "13",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
  },
  {
    id: 14,
    title: "Số Mười Bốn",
    type: "Danh từ",
    region: "Toàn quốc",
    display: "14",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
  },
  {
    id: 15,
    title: "Số Mười Lăm",
    type: "Danh từ",
    region: "Toàn quốc",
    display: "15",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
  },
];

const ITEMS_PER_PAGE = 9;
const TOTAL_PAGES = Math.ceil(NUMBER_ENTRIES.length / ITEMS_PER_PAGE);

const Numbers = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEntries = NUMBER_ENTRIES.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

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

      <hr className="numbers-divider" />

      <div className="numbers-container">
        {currentEntries.map((entry) => (
          <div className="numbers-card" key={entry.id}>
            <div className="numbers-card__top">
              <h3 className="numbers-card__title">{entry.title}</h3>

              <div className="numbers-card__tags">
                <span className="tag tag--type">
                  <img src="/Assets/Images/icon-type.png" alt="" />
                  {entry.type}
                </span>
                <span className="tag tag--region">
                  <img src="/Assets/Images/icon-region.png" alt="" />
                  {entry.region}
                </span>
              </div>

              <p className="numbers-card__desc">{entry.description}</p>
            </div>

            <div className="numbers-card__number">{entry.display}</div>
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
          {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`pagination-page ${currentPage === page ? "active" : ""}`}
              onClick={() => goTo(page)}
            >
              {page}
            </button>
          ))}
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

      <Footer />
    </>
  );
};

export default Numbers;
