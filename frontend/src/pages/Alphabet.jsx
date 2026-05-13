import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Alphabet.css";

const ALPHABET_ENTRIES = [
  { id: 1, letter: "Aa" },
  { id: 2, letter: "Bb" },
  { id: 3, letter: "Cc" },
  { id: 4, letter: "Dd" },
  { id: 5, letter: "Ee" },
  { id: 6, letter: "Ff" },
  { id: 7, letter: "Gg" },
  { id: 8, letter: "Hh" },
  { id: 9, letter: "Ii" },
  { id: 10, letter: "Jj" },
  { id: 11, letter: "Kk" },
  { id: 12, letter: "Ll" },
  { id: 13, letter: "Mm" },
  { id: 14, letter: "Nn" },
  { id: 15, letter: "Oo" },
  { id: 16, letter: "Pp" },
  { id: 17, letter: "Qq" },
  { id: 18, letter: "Rr" },
  { id: 19, letter: "Ss" },
  { id: 20, letter: "Tt" },
  { id: 21, letter: "Uu" },
  { id: 22, letter: "Vv" },
  { id: 23, letter: "Ww" },
  { id: 24, letter: "Xx" },
  { id: 25, letter: "Yy" },
  { id: 26, letter: "Zz" },
];

const Alphabet = () => {
  return (
    <>
      <Navbar />

      <div className="alphabet-title">
        <h1>TỪ ĐIỂN</h1>
        <h2>A-Z</h2>
      </div>

      <div className="alphabet-container">
        {ALPHABET_ENTRIES.map((entry) => (
          <div className="alphabet-card" key={entry.id}>
            <div className="alphabet-card__tags">
              <span className="tag tag--type">
                <img src="/Assets/Images/icon-type.png" alt="" />
                Loại từ
              </span>
              <span className="tag tag--region">
                <img src="/Assets/Images/icon-region.png" alt="" />
                Phạm vi sử dụng
              </span>
            </div>

            <div className="alphabet-card__letter-box">
              <span className="alphabet-card__letter">{entry.letter}</span>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </>
  );
};

export default Alphabet;
