import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../CSS/Greeting.css";

const GREETING_ENTRIES = [
  {
    id: 1,
    title: "Chào mừng",
    type: "Danh từ",
    region: "Toàn quốc",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
    image: null, // thay bằng đường dẫn ảnh sau, vd: "/images/chao-mung.png"
  },
  {
    id: 2,
    title: "Xin chào",
    type: "Động từ",
    region: "Toàn quốc",
    description:
      "Hai tay khoanh trước ngực, đầu hơi cuối, sau đó hai bàn tay ngửa đưa ra trước, rồi di chuyển từ trái sang phải.",
    image: null,
  },
  {
    id: 3,
    title: "Cảm ơn",
    type: "Động từ",
    region: "Toàn quốc",
    description:
      "Hai bàn tay hơi khum, lòng bàn tay phải úp lên mu bàn tay trái, đưa hai tay về phía phải rồi từ từ kéo về đặt trước ngực. Sau đó nhấn tay nhẹ xuống dưới đồng thời cuối đầu xuống.",
    image: null,
  },
];

const Greeting = () => {
  return (
    <>
      <Navbar />
      <div className="greeting-title">
        <h1>TỪ ĐIỂN</h1>
        <h2>Chủ đề: Chào hỏi</h2>
      </div>
      <div className="greeting-container">
        {GREETING_ENTRIES.map((entry) => (
          <div className="greeting-card" key={entry.id}>
            <div className="greeting-card__thumbnail">
              {entry.image && <img src={entry.image} alt={entry.title} />}
            </div>

            <div className="greeting-card__body">
              <h3 className="greeting-card__title">{entry.title}</h3>

              <div className="greeting-card__tags">
                <span className="tag tag--type">
                  <img src="/Assets/Images/icon-type.png" alt="loại từ" />
                  {entry.type}
                </span>
                <span className="tag tag--region">
                  <img src="/Assets/Images/icon-region.png" alt="khu vực" />
                  {entry.region}
                </span>
              </div>

              <p className="greeting-card__desc">{entry.description}</p>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
};

export default Greeting;
