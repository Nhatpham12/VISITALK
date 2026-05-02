import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Termofser.css";
const Termofser = () => {
  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="Intro">
            <h1>ĐIỀU KHOẢN SỬ DỤNG</h1>
          </div>
          <div className="Para">
            <p id="p1">
              Ngôn ngữ ký hiệu hay ngôn ngữ dấu hiệu, thủ ngữ là ngôn ngữ dùng
              những biểu hiện của bàn tay thay cho âm thanh của tiếng nói. Ngôn
              ngữ ký hiệu do người điếc tạo ra nhằm giúp họ có thể giao tiếp với
              nhau trong cộng đồng của mình và tiếp thu tri thức của xã hội.
            </p>
            <p id="p2">
              Cũng như ngôn ngữ nói, ngôn ngữ ký hiệu của từng quốc gia, thậm
              chí là từng khu vực trong một quốc gia rất khác nhau. Điều đó là
              do mỗi quốc gia, khu vực có lịch sử, văn hóa, tập quán khác nhau
              nên ký hiệu để biểu thị sự vật hiện tượng cũng khác nhau. Tuy
              nhiên, ký hiệu tất cả mọi nơi trên thế giới đều có những điểm
              tương đồng nhất định.
            </p>

            <p id="p3">
              Do ngôn ngữ ký hiệu phát triển hơn trong cộng đồng người khiếm
              thính, nên những người thuộc cộng đồng này của hai nước khác nhau
              có thể giao tiếp với nhau tốt hơn hai người bình thường nhưng mà
              không biết ngoại ngữ.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Termofser;
