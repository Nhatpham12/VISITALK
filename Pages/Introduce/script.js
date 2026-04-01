// navigation.js
document.addEventListener("DOMContentLoaded", function () {
  const arrowBtn = document.querySelector('img[src*="Arrow"]');

  if (arrowBtn) {
    arrowBtn.style.cursor = "pointer";

    arrowBtn.addEventListener("click", function () {
      // Nếu có trang trước thì quay lại, không thì về Home
      if (document.referrer !== "") {
        history.back();
      } else {
        window.location.href = "../Home/index.html";
      }
    });
  }
});
