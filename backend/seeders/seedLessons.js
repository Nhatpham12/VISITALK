require("dotenv").config();
const db = require("../common/connect");

const LETTER_CONTENT = {
  A: "Nắm đấm, ngón cái đặt bên cạnh ngón trỏ.",
  B: "Bàn tay mở, các ngón khép sát nhau, ngón cái gập vào lòng bàn tay.",
  C: "Bàn tay hơi mở, các ngón cong nhẹ tạo hình chữ C.",
  D: "Ngón trỏ duỗi thẳng lên, ngón cái đặt trên ngón giữa, các ngón khác nắm lại.",
  E: "Các ngón cong vào lòng bàn tay, ngón cái chạm ngón trỏ.",
  F: "Ngón trỏ và ngón cái chạm nhau tạo vòng tròn, các ngón khác duỗi thẳng.",
  G: "Nắm đấm, ngón trỏ và ngón cái duỗi thẳng song song với nhau.",
  H: "Ngón trỏ và ngón giữa duỗi ngang, các ngón khác nắm lại.",
  I: "Ngón út duỗi thẳng, ngón cái đặt trên ngón áp út, các ngón khác nắm lại.",
  J: "Ngón út duỗi và vẽ chữ J trong không khí.",
  K: "Ngón trỏ và ngón giữa duỗi thẳng, ngón cái đặt giữa hai ngón đó.",
  L: "Ngón trỏ và ngón cái duỗi vuông góc tạo hình chữ L.",
  M: "Ngón cái đặt dưới các ngón trỏ, giữa và áp út.",
  N: "Ngón cái đặt dưới ngón trỏ và ngón giữa.",
  O: "Các ngón tay chạm nhau tạo vòng tròn hình chữ O.",
  P: "Ngón trỏ duỗi, ngón cái chạm ngón giữa, các ngón khác cong lại.",
  Q: "Ngón trỏ và ngón cái duỗi xuống dưới, các ngón khác nắm lại.",
  R: "Ngón trỏ và ngón giữa bắt chéo nhau.",
  S: "Nắm đấm, ngón cái đặt đè lên các ngón khác.",
  T: "Nắm đấm, ngón cái kẹp giữa ngón trỏ và ngón giữa.",
  U: "Ngón trỏ và ngón giữa duỗi thẳng song song và sát nhau.",
  V: "Ngón trỏ và ngón giữa duỗi thẳng tách rời hình chữ V.",
  W: "Ngón trỏ, ngón giữa và ngón áp út duỗi thẳng tách rời.",
  X: "Ngón trỏ cong hình móc câu, các ngón khác nắm lại.",
  Y: "Ngón cái và ngón út duỗi thẳng, các ngón khác nắm lại.",
  Z: "Ngón trỏ vẽ hình chữ Z trong không khí.",
};

const NUMBER_CONTENT = {
  1: "Giơ ngón trỏ lên, các ngón khác nắm lại.",
  2: "Giơ ngón trỏ và ngón giữa lên, các ngón khác nắm lại.",
  3: "Giơ ngón trỏ, ngón giữa và ngón áp út lên, các ngón khác nắm lại.",
  4: "Giơ bốn ngón lên, ngón cái gập vào lòng bàn tay.",
  5: "Xoè cả năm ngón tay, lòng bàn tay hướng về phía trước.",
  6: "Ngón cái chạm đầu ngón út, các ngón khác nắm lại.",
  7: "Ngón cái chạm đầu ngón áp út, các ngón khác nắm lại.",
  8: "Ngón cái và ngón trỏ duỗi thẳng, các ngón khác nắm lại.",
  9: "Ngón trỏ cong hình móc câu, các ngón khác nắm lại.",
  10: "Xoè hai bàn tay, lòng bàn tay hướng ra trước.",
};

const getNumberContent = (n) => {
  if (n <= 10) return NUMBER_CONTENT[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  if (ones === 0) return `Đưa ngón trỏ lên ${tens} lần thể hiện số ${n}.`;
  if (n < 20) return `Ký hiệu số 10 kết hợp với số ${ones} để tạo thành số ${n}.`;
  return `Ký hiệu số ${tens}0 kết hợp với số ${ones} để tạo thành số ${n}.`;
};

const seedLessons = async () => {
  try {
    const [rows] = await db.promise().query(
      "SELECT COUNT(*) AS cnt FROM lessons"
    );
    if (rows[0].cnt > 0) {
      console.log(`Đã có ${rows[0].cnt} bài học trong DB, bỏ qua seed.`);
      process.exit(0);
    }

    const lessons = [];

    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i);
      lessons.push([
        `Chữ ${letter}`,
        null,
        LETTER_CONTENT[letter],
        `Chữ ${letter}`,
      ]);
    }

    for (let i = 1; i <= 50; i++) {
      lessons.push([
        `Số ${i}`,
        null,
        getNumberContent(i),
        `Số ${i}`,
      ]);
    }

    const sql =
      "INSERT INTO lessons (title, img_url, content, meaning) VALUES ?";
    await db.promise().query(sql, [lessons]);
    console.log(`Đã seed ${lessons.length} bài học (26 chữ + 50 số) thành công!`);
  } catch (err) {
    console.error("Seed lessons error:", err);
  }
};

module.exports = seedLessons;
