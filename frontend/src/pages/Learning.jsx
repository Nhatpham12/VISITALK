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
          <div className="col">
            <ul>
              <Link to="/learning/greeting">
                <li>Chào hỏi</li>
              </Link>
              <li>Giao thông</li>
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
          <div className="col num-col">
            <ul>
              <li>1-10</li>
              <li>11-20</li>
              <li>21-30</li>
              <li>31-40</li>
              <li>41-50</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Learning;
