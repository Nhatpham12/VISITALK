import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import "./Navbar.css";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="Navbar">
      <img
        src="/Assets/Images/Arrow.png"
        className="brand"
        alt="Arrow"
        onClick={() => navigate(-1)}
        style={{ cursor: "pointer" }}
      />

      <Link to="/">
        <img src="/Assets/Images/Brand.png" className="brand" alt="Brand" />
      </Link>

      <Link to="/introduce">
        <button className="Introduce">GIỚI THIỆU CHUNG</button>
      </Link>
      {user && (
        <>
          <Link to="/translate">
            <button className="Translate">DỊCH THUẬT</button>
          </Link>
          <Link to="/learning">
            <button className="Learning">TỪ ĐIỂN</button>
          </Link>
        </>
      )}
      {!user && (
        <Link to="/login">
          <button>ĐĂNG NHẬP</button>
        </Link>
      )}
      {user && (
        <>
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
        </>
      )}
    </div>
  );
};

export default Navbar;
