import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="Navbar">
      <Link to="/">
        <img
          src="/Assets/Images/Arrow.png"
          className="brand"
          alt="Arrow"
          onClick={navigate(-1)}
        />
      </Link>
      <Link to="/">
        <img src="/Assets/Images/Brand.png" className="brand" alt="Brand" />
      </Link>

      <Link to="/introduce">
        <button className="Introduce">GIỚI THIỆU CHUNG</button>
      </Link>
      <Link to="/translate">
        <button className="Translate">DỊCH THUẬT</button>
      </Link>
      <Link to="/learning">
        <button className="Learning">TỪ ĐIỂN</button>
      </Link>
      <Link to="/asking">
        <button className="Asking">GIẢI ĐÁP</button>
      </Link>

      <Link to="/personal">
        <img
          src="/Assets/Images/Personal.png"
          className="Personal"
          alt="Personal"
        />
      </Link>
      <Link to="/setting">
        <img
          src="/Assets/Images/Setting.png"
          className="setting"
          alt="Setting"
        />
      </Link>
    </div>
  );
};

export default Navbar;
