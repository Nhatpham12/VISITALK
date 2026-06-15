import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Learning.css";
import { Link } from "react-router-dom";

const Learning = () => {
  return (
    <>
      <Navbar />

      <h1 className="learning-title">TỪ ĐIỂN</h1>
      <div className="dictionary-table">
        <div className="table-header">
          <div className="col">Chủ đề</div>
          <div className="col">
            <Link to="/learning/alphabet">A-Z</Link>
          </div>
          <div className="col">
            <Link to="/learning/numbers">Số tự nhiên</Link>
          </div>
        </div>

        <div className="table-body">
          <div className="col sbj-col">
            <div className="sbj-grid">
              <Link to="/learning/subjects"><span>Xin chào</span></Link>
              <Link to="/learning/subjects"><span>Tạm biệt</span></Link>
              <Link to="/learning/subjects"><span>Cảm ơn</span></Link>
              <Link to="/learning/subjects"><span>Xin lỗi</span></Link>
              <Link to="/learning/subjects"><span>Khỏe không?</span></Link>
              <Link to="/learning/subjects"><span>Cha / Bố</span></Link>
              <Link to="/learning/subjects"><span>Mẹ</span></Link>
              <Link to="/learning/subjects"><span>Ông</span></Link>
              <Link to="/learning/subjects"><span>Bà</span></Link>
              <Link to="/learning/subjects"><span>Anh em / Chị em</span></Link>
              <Link to="/learning/subjects"><span>Xe máy</span></Link>
              <Link to="/learning/subjects"><span>Ô tô</span></Link>
              <Link to="/learning/subjects"><span>Xe đạp</span></Link>
              <Link to="/learning/subjects"><span>Đi bộ</span></Link>
              <Link to="/learning/subjects"><span>Dừng lại</span></Link>
            </div>
          </div>
          <div className="col az-col">
            <div className="az-grid">
              <Link to="/learning/alphabet"><span>A</span></Link>
              <Link to="/learning/alphabet"><span>B</span></Link>
              <Link to="/learning/alphabet"><span>C</span></Link>
              <Link to="/learning/alphabet"><span>D</span></Link>
              <Link to="/learning/alphabet"><span>E</span></Link>
              <Link to="/learning/alphabet"><span>F</span></Link>
              <Link to="/learning/alphabet"><span>G</span></Link>
              <Link to="/learning/alphabet"><span>H</span></Link>
              <Link to="/learning/alphabet"><span>I</span></Link>
              <Link to="/learning/alphabet"><span>J</span></Link>
              <Link to="/learning/alphabet"><span>K</span></Link>
              <Link to="/learning/alphabet"><span>L</span></Link>
              <Link to="/learning/alphabet"><span>M</span></Link>
              <Link to="/learning/alphabet"><span>N</span></Link>
              <Link to="/learning/alphabet"><span>O</span></Link>
              <Link to="/learning/alphabet"><span>P</span></Link>
              <Link to="/learning/alphabet"><span>Q</span></Link>
              <Link to="/learning/alphabet"><span>R</span></Link>
              <Link to="/learning/alphabet"><span>S</span></Link>
              <Link to="/learning/alphabet"><span>T</span></Link>
              <Link to="/learning/alphabet"><span>U</span></Link>
              <Link to="/learning/alphabet"><span>V</span></Link>
              <Link to="/learning/alphabet"><span>W</span></Link>
              <Link to="/learning/alphabet"><span>X</span></Link>
              <Link to="/learning/alphabet"><span>Y</span></Link>
              <Link to="/learning/alphabet"><span>Z</span></Link>
            </div>
          </div>
          <div className="col num-col">
            <ul>
              <Link to="/learning/numbers"><li>1-10</li></Link>
              <Link to="/learning/numbers"><li>11-20</li></Link>
              <Link to="/learning/numbers"><li>21-30</li></Link>
              <Link to="/learning/numbers"><li>31-40</li></Link>
              <Link to="/learning/numbers"><li>41-50</li></Link>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Learning;
