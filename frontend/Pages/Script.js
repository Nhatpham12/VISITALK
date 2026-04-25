(function guardPage() {
  const publicPages = ["Login.html", "Signup.html", "Welcome.html"];
  const currentPage = window.location.pathname.split("/").pop();
  if (!publicPages.includes(currentPage) && !Auth.isLoggedIn()) {
    window.location.href = "../Pages/Login.html";
  }
})();

// ─── Nút Back (Arrow.png) ────────────────────────────────────
document
  .querySelector("a img[src*='Arrow']")
  ?.closest("a")
  ?.addEventListener("click", (e) => {
    e.preventDefault();
    history.back();
  });

document
  .querySelector("a[href*='Personal.html']")
  ?.addEventListener("click", (e) => {
    if (!Auth.isLoggedIn()) {
      e.preventDefault();
      window.location.href = "../Pages/Login.html";
    }
  });

function setVideoQuality(btn) {
  document
    .querySelectorAll(".quality-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  localStorage.setItem("videoQuality", btn.textContent);
}

const brightnessSlider = document.getElementById("brightness-slider");
const volumeSlider = document.getElementById("volume-slider");

if (brightnessSlider) {
  // Khôi phục giá trị đã lưu
  brightnessSlider.value = localStorage.getItem("brightness") || 50;
  applyBrightness(brightnessSlider.value);

  brightnessSlider.addEventListener("input", (e) => {
    localStorage.setItem("brightness", e.target.value);
    applyBrightness(e.target.value);
  });
}

if (volumeSlider) {
  volumeSlider.value = localStorage.getItem("volume") || 50;
  volumeSlider.addEventListener("input", (e) => {
    localStorage.setItem("volume", e.target.value);
  });
}

function applyBrightness(value) {
  document.body.style.filter = `brightness(${0.5 + value / 100})`;
}

// Khôi phục quality button khi load trang
const savedQuality = localStorage.getItem("videoQuality");
if (savedQuality) {
  document.querySelectorAll(".quality-btn").forEach((btn) => {
    if (btn.textContent === savedQuality) btn.classList.add("active");
  });
}
