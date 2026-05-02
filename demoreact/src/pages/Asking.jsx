import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Asking.css";

const Asking = () => {
  return (
    <>
      <Navbar />
      <div className="main-content-asking">
        <div className="Title">
          <h1>GIẢI ĐÁP</h1>
        </div>
        <div className="q1">
          <h3>Mình có thể học NNKH trên website này được không ?</h3>
        </div>

        <div className="p1">
          Được. Nhưng học NNKH trên website này chỉ dừng lại ở việc bạn tìm hiểu
          về "từ vựng" trong NNKH Việt Nam (một số vùng miền của Việt Nam). Để
          học NNKH hiệu quả hơn, bạn nên tìm đến những trung tâm, tổ chức, cá
          nhân có uy tín và website này sẽ một trong số những nguồn tài liệu
          tham khảo tốt cho bạn.
        </div>

        <div className="q2">
          <h3>
            NNKH của Việt Nam có khác với NNKH được sử dụng trên thế giới không
            ?
          </h3>
        </div>

        <div className="p2">
          Giống như ngôn ngữ nói, mỗi quốc gia sử dụng một ngôn ngữ nói cho
          riêng mình. NNKH mà người Điếc ở mỗi quốc gia sử dụng đều khác nhau.
          NNKH của Việt Nam là một ngôn ngữ độc lập, có những đặc thù riêng.
          Muốn giao tiếp được với người Điếc ở quốc gia nào thì bạn phải học
          NNKH của quốc gia đó. Hoặc là, bạn có thể tìm hiểu thêm về hệ thống
          NNKH Quốc tế (Internationl Sign Language - ISL) để có thể giao tiếp
          tốt hơn với người Điếc trên thế giới.
        </div>
        <div className="q3">
          <h3>
            NNKH của Việt Nam có khác với NNKH được sử dụng trên thế giới không
            ?
          </h3>
        </div>
        <div className="p3">
          Giống như ngôn ngữ nói, mỗi quốc gia sử dụng một ngôn ngữ nói cho
          riêng mình. NNKH mà người Điếc ở mỗi quốc gia sử dụng đều khác nhau.
          NNKH của Việt Nam là một ngôn ngữ độc lập, có những đặc thù riêng.
          Muốn giao tiếp được với người Điếc ở quốc gia nào thì bạn phải học
          NNKH của quốc gia đó. Hoặc là, bạn có thể tìm hiểu thêm về hệ thống
          NNKH Quốc tế (Internationl Sign Language - ISL) để có thể giao tiếp
          tốt hơn với người Điếc trên thế giới.
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Asking;
