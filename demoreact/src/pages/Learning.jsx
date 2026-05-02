import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Learning.css";

const Learning = () => {
  return (
    <>
      <Navbar />

      <h1 className="title">TỪ ĐIỂN</h1>
      <div className="dictionary-table">
        <div className="table-header">
          <div className="col">Chủ đề</div>
          <div className="col">Câu</div>
          <div className="col">Từ</div>
          <div className="col">Bài hát</div>
          <div className="col">A-Z</div>
        </div>

        <div className="table-body">
          <div className="col">
            <ul>
              <li>Chào hỏi</li>
              <li>Giao thông</li>
            </ul>
          </div>
          <div className="col">
            <ul>
              <li>Câu đơn</li>
              <li>Câu phức</li>
            </ul>
          </div>
          <div className="col">
            <ul>
              <li>Danh từ</li>
              <li>Động từ</li>
            </ul>
          </div>
          <div className="col">
            <ul>
              <li>Bài hát tiếng Việt</li>
            </ul>
          </div>

          <div className="col az-col">
            <div className="az-grid">
              <span>A</span>
              <span>B</span>
              <span>C</span>
              <span>D</span>
              <span>E</span>
              <span>F</span>
              <span>G</span>
              <span>H</span>
              <span>I</span>
              <span>J</span>
              <span>K</span>
              <span>L</span>
              <span>M</span>
              <span>N</span>
              <span>O</span>
              <span>P</span>
              <span>Q</span>
              <span>R</span>
              <span>S</span>
              <span>T</span>
              <span>U</span>
              <span>V</span>
              <span>W</span>
              <span>X</span>
              <span>Y</span>
              <span>Z</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Learning;
