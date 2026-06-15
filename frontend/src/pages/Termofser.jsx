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
              Khi sử dụng nền tảng học và dịch ngôn ngữ ký hiệu, người dùng cam
              kết cung cấp thông tin đăng ký chính xác, trung thực và chịu hoàn
              toàn trách nhiệm về mọi hoạt động diễn ra dưới tài khoản của mình.
              Người dùng được phép sử dụng các tài nguyên học tập — bao gồm
              video bài giảng, bộ từ điển ngôn ngữ ký hiệu và công cụ dịch — cho
              mục đích cá nhân, phi thương mại. Nghiêm cấm mọi hành vi sao chép,
              phân phối lại, chỉnh sửa hoặc khai thác nội dung của nền tảng vì
              mục đích thương mại mà không có sự cho phép bằng văn bản từ phía
              chúng tôi. Ngoài ra, người dùng không được thực hiện các hành vi
              gây ảnh hưởng tiêu cực đến hệ thống như tấn công mạng, phát tán mã
              độc hoặc cố tình làm gián đoạn hoạt động của dịch vụ.
            </p>
            <p id="p2">
              Nền tảng cung cấp công cụ dịch ngôn ngữ ký hiệu dựa trên trí tuệ
              nhân tạo và cơ sở dữ liệu liên tục được cập nhật; tuy nhiên, chúng
              tôi không đảm bảo tính chính xác tuyệt đối của mọi kết quả dịch
              thuật trong mọi ngữ cảnh và phương ngữ ký hiệu khác nhau. Người
              dùng nên xem các kết quả dịch như một công cụ hỗ trợ tham khảo,
              đặc biệt trong các tình huống quan trọng như y tế, pháp lý hay
              giáo dục, thay vì coi đó là bản dịch chính thức duy nhất. Chúng
              tôi không chịu trách nhiệm đối với bất kỳ tổn thất hay thiệt hại
              nào phát sinh từ việc người dùng hoàn toàn phụ thuộc vào kết quả
              dịch thuật tự động mà không có sự kiểm chứng từ chuyên gia ngôn
              ngữ ký hiệu. Dịch vụ cũng có thể tạm thời gián đoạn do bảo trì hệ
              thống hoặc các sự cố kỹ thuật ngoài tầm kiểm soát, và chúng tôi sẽ
              nỗ lực thông báo trước đến người dùng trong những trường hợp như
              vậy.
            </p>

            <p id="p3">
              Chúng tôi có quyền cập nhật, sửa đổi hoặc bổ sung các điều khoản
              sử dụng này vào bất kỳ thời điểm nào nhằm phản ánh những thay đổi
              về mặt pháp lý, công nghệ hoặc định hướng phát triển của nền tảng.
              Mọi thay đổi quan trọng sẽ được thông báo đến người dùng qua email
              đã đăng ký hoặc thông qua thông báo nổi bật trên giao diện trang
              web ít nhất 15 ngày trước khi có hiệu lực. Việc người dùng tiếp
              tục sử dụng dịch vụ sau thời điểm thay đổi có hiệu lực đồng nghĩa
              với việc chấp thuận các điều khoản mới. Trong trường hợp người
              dùng vi phạm các điều khoản sử dụng, chúng tôi có quyền tạm khóa
              hoặc chấm dứt tài khoản mà không cần thông báo trước, đồng thời
              người dùng có thể tự nguyện xóa tài khoản bất kỳ lúc nào nếu không
              còn có nhu cầu sử dụng dịch vụ.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Termofser;
