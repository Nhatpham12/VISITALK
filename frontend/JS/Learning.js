if (!Auth.isLoggedIn()) window.location.href = "../Pages/Login.html";

let allLessons = [];

async function loadLessons() {
  const result = await LessonsAPI.getAll();
  if (!result?.ok) {
    console.error("Không tải được bài học");
    return;
  }
  allLessons = result.data;
  renderLessons(allLessons);
}

function renderLessons(lessons) {
  // Tìm hoặc tạo container hiển thị bài học
  let container = document.getElementById("lesson-list");
  if (!container) {
    // Nếu chưa có trong HTML thì tạo mới dưới bảng
    container = document.createElement("div");
    container.id = "lesson-list";
    container.style.cssText = "margin-top:20px; padding: 0 20px;";
    document.querySelector(".dictionary-table")?.after(container);
  }

  if (lessons.length === 0) {
    container.innerHTML =
      "<p style='text-align:center'>Chưa có bài học nào</p>";
    return;
  }

  container.innerHTML = `
    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap:16px; margin-top:16px;">
      ${lessons
        .map(
          (l) => `
        <div style="border:1px solid #ddd; border-radius:8px; padding:12px; cursor:pointer; text-align:center;"
             onclick="openLesson('${l.les_id}')">
          ${
            l.img_url
              ? `<img src="${l.img_url}" style="width:100%; height:120px; object-fit:cover; border-radius:6px;">`
              : `<div style="width:100%;height:120px;background:#eee;border-radius:6px;display:flex;align-items:center;justify-content:center;">📷</div>`
          }
          <p style="margin:8px 0 4px; font-weight:bold;">${l.title}</p>
          <p style="color:#666; font-size:13px;">${l.meaning || ""}</p>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function openLesson(id) {
  // Lưu id bài học đang xem, chuyển sang trang chi tiết
  sessionStorage.setItem("current_lesson_id", id);
  // TODO: tạo trang LessonDetail.html nếu cần
  // window.location.href = "../Pages/LessonDetail.html";

  // Tạm thời hiện popup thông tin
  const lesson = allLessons.find((l) => l.les_id === id);
  if (lesson) {
    alert(
      `📖 ${lesson.title}\n\nÝ nghĩa: ${lesson.meaning || "Chưa có"}\n\nNội dung: ${lesson.content || "Chưa có"}`,
    );
  }
}

document.querySelectorAll(".col ul li").forEach((li) => {
  li.style.cursor = "pointer";
  li.addEventListener("click", () => {
    const keyword = li.textContent.trim().toLowerCase();
    const filtered = allLessons.filter(
      (l) =>
        l.title.toLowerCase().includes(keyword) ||
        (l.meaning || "").toLowerCase().includes(keyword) ||
        (l.content || "").toLowerCase().includes(keyword),
    );
    renderLessons(filtered);
  });
});

document.querySelectorAll(".az-grid span").forEach((span) => {
  span.style.cursor = "pointer";
  span.addEventListener("click", () => {
    const letter = span.textContent.trim().toLowerCase();
    const filtered = allLessons.filter((l) =>
      l.title.toLowerCase().startsWith(letter),
    );
    renderLessons(filtered);
  });
});

loadLessons();
