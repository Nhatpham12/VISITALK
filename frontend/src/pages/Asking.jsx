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
          <h3>
            Người mới bắt đầu có thể học được không, hay cần có nền tảng trước ?
          </h3>
        </div>

        <div className="p1">
          Hoàn toàn không cần kinh nghiệm trước đó. Nền tảng được thiết kế theo
          lộ trình từ cơ bản đến nâng cao, bắt đầu từ bảng chữ cái ký hiệu, các
          từ đơn thông dụng trong cuộc sống hằng ngày, rồi dần tiến đến các cụm
          câu và hội thoại phức tạp hơn. Mỗi bài học đều có video minh họa chậm
          từng bước, phần thực hành tương tác với webcam và phản hồi tức thì để
          bạn tự điều chỉnh. Dù bạn là người nghe muốn giao tiếp với cộng đồng
          người Điếc, hay người Điếc muốn luyện tập thêm, nền tảng đều có lộ
          trình phù hợp riêng cho từng đối tượng.
        </div>

        <div className="q2">
          <h3>Hệ thống nhận diện ngôn ngữ ký hiệu hoạt động như thế nào ?</h3>
        </div>

        <div className="p2">
          Nền tảng của chúng tôi sử dụng mô hình học máy được huấn luyện trên
          hàng triệu mẫu cử chỉ để phân tích chuyển động của bàn tay, ngón tay
          và biểu cảm khuôn mặt theo thời gian thực. Khi bạn thực hiện một ký
          hiệu trước webcam, hệ thống sẽ so sánh với cơ sở dữ liệu và phản hồi
          ngay lập tức về độ chính xác, đồng thời gợi ý điều chỉnh nếu cần. Hiện
          tại nền tảng hỗ trợ Ngôn ngữ Ký hiệu Việt Nam (NNKH VN) và đang mở
          rộng thêm ASL (Mỹ), BSL (Anh). Độ chính xác nhận diện đạt trên 90%
          trong điều kiện ánh sáng tiêu chuẩn và tiếp tục được cải thiện theo
          từng bản cập nhật.
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
