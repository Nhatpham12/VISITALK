import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../CSS/Securitypolicy.css";

const SecurityPolicy = () => {
  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="Intro">
            <h1>CHÍNH SÁCH BẢO MẬT</h1>
          </div>
          <div className="Para">
            <p id="p1">
              Chúng tôi cam kết bảo vệ quyền riêng tư của người dùng trong suốt
              quá trình sử dụng nền tảng dịch và học ngôn ngữ ký hiệu. Khi đăng
              ký tài khoản, chúng tôi thu thập một số thông tin cơ bản như họ
              tên, địa chỉ email và mật khẩu nhằm phục vụ việc xác thực và cá
              nhân hóa trải nghiệm học tập. Ngoài ra, trong quá trình sử dụng
              tính năng dịch ngôn ngữ ký hiệu qua camera, hình ảnh và video được
              xử lý trực tiếp trên thiết bị hoặc máy chủ bảo mật và sẽ không
              được lưu trữ lâu dài nếu người dùng không có yêu cầu. Mọi dữ liệu
              thu thập chỉ được sử dụng để cải thiện chất lượng dịch vụ, cá nhân
              hóa lộ trình học tập và đảm bảo hoạt động ổn định của hệ thống.
            </p>
            <p id="p2">
              Toàn bộ dữ liệu người dùngđược mã hóa bằng công nghệ SSL/TLS trong
              quá trình truyền tải và được lưu trữ trên hệ thống máy chủ đạt
              tiêu chuẩn bảo mật quốc tế. Chúng tôi không chia sẻ, bán hoặc tiết
              lộ thông tin cá nhân của người dùng cho bên thứ ba vì mục đích
              thương mại dưới bất kỳ hình thức nào, ngoại trừ các trường hợp
              được pháp luật yêu cầu. Người dùng có toàn quyền truy cập, chỉnh
              sửa hoặc yêu cầu xóa dữ liệu cá nhân của mình bất kỳ lúc nào thông
              qua phần cài đặt tài khoản hoặc bằng cách liên hệ trực tiếp với bộ
              phận hỗ trợ. Chúng tôi cũng áp dụng các biện pháp kỹ thuật và quản
              lý chặt chẽ để ngăn chặn truy cập trái phép, rò rỉ hoặc mất mát dữ
              liệu.
            </p>

            <p id="p3">
              Nền tảng sử dụng cookie và các công nghệ theo dõi tương tự nhằm
              ghi nhớ tùy chọn cá nhân, duy trì phiên đăng nhập và phân tích
              hành vi sử dụng để cải thiện giao diện cũng như nội dung học tập.
              Dữ liệu về tiến trình học tập — bao gồm các bài học đã hoàn thành,
              điểm số và lịch sử luyện tập — được lưu trữ nhằm hỗ trợ người dùng
              theo dõi sự phát triển của bản thân theo thời gian. Người dùng có
              thể tùy chỉnh mức độ cho phép cookie thông qua cài đặt trình duyệt
              hoặc bảng điều khiển trên nền tảng. Chúng tôi cam kết cập nhật
              chính sách bảo mật này định kỳ và thông báo kịp thời đến người
              dùng khi có bất kỳ thay đổi quan trọng nào liên quan đến cách thức
              xử lý thông tin cá nhân.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SecurityPolicy;
