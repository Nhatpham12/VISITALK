SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE visitalk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE visitalk_db;

CREATE TABLE users (
    id                CHAR(36)      PRIMARY KEY NOT NULL DEFAULT (UUID()),
    username          VARCHAR(50)   UNIQUE NOT NULL,
    full_name         VARCHAR(100)  NOT NULL,
    password_hash     VARCHAR(255)  NOT NULL,
    email             VARCHAR(100)  UNIQUE NULL,
    dob               DATE          NULL,
    gender            ENUM('male','female','other') NULL,
    avatar_url        VARCHAR(255)  NULL,
    u_role            ENUM('user','admin') DEFAULT 'user',
    u_status          ENUM('active','inactive') DEFAULT 'active',
    last_login        DATETIME      NULL,
    last_seen         DATETIME      NULL,
    total_online_time INT           DEFAULT 0,
    created_at        DATETIME      DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_email
        CHECK (email IS NULL OR email REGEXP '^[^@]+@[^@]+\\.[^@]+$'),
    CONSTRAINT chk_username
        CHECK (username REGEXP '^[a-zA-Z0-9_ ]+$'),
    CONSTRAINT chk_password
        CHECK (LENGTH(password_hash) >= 8),
    CONSTRAINT chk_online_time
        CHECK (total_online_time >= 0)
);

CREATE TABLE lessons (
    les_id   CHAR(36)      PRIMARY KEY NOT NULL DEFAULT (UUID()),
    title    VARCHAR(100)  NOT NULL,
    img_url  VARCHAR(255)  NULL,
    content  TEXT          NULL,
    meaning  VARCHAR(255)  NULL,

    CONSTRAINT chk_title CHECK (TRIM(title) != '')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE access_to (
    users_id    CHAR(36)  NOT NULL,
    les_id      CHAR(36)  NOT NULL,
    accessed_at DATETIME  DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (users_id, les_id),
    FOREIGN KEY (users_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (les_id) REFERENCES lessons(les_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE users_sessions (
    sessions_id CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    users_id    CHAR(36)     NOT NULL,
    login_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    logout_at   DATETIME     NULL,
    duration    INT          DEFAULT 0,
    ip_address  VARCHAR(45)  NULL,
    device      VARCHAR(100) NULL,

    FOREIGN KEY (users_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT chk_logout_after_login
        CHECK (logout_at IS NULL OR logout_at >= login_at),
    CONSTRAINT chk_duration
        CHECK (duration >= 0)
);
INSERT INTO lessons (title, img_url, content, meaning) VALUES
('Ký hiệu chữ A', '/Alphabets/A.jpg', 'Nắm tay lại, ngón cái đặt dọc bên cạnh ngón trỏ.', 'Chữ A'),
('Ký hiệu chữ B', '/Alphabets/B.jpg', 'Mở thẳng bàn tay, bốn ngón khép lại, ngón cái gập vào trong lòng bàn tay.', 'Chữ B'),
('Ký hiệu chữ C', '/Alphabets/C.jpg', 'Khum bàn tay lại thành hình chữ C.', 'Chữ C'),
('Ký hiệu chữ D', '/Alphabets/D.jpg', 'Dựng đứng ngón trỏ, các ngón còn lại khum lại chạm vào ngón cái tạo thành vòng tròn.', 'Chữ D'),
('Ký hiệu chữ E', '/Alphabets/E.jpg', 'Thu các ngón tay lại, gập nửa các ngón sao cho đầu ngón tay chạm nhẹ vào phần trên lòng bàn tay.', 'Chữ E'),
('Ký hiệu chữ F', '/Alphabets/F.jpg', 'Chạm đầu ngón cái và ngón trỏ vào nhau tạo thành vòng tròn, ba ngón còn lại xòe thẳng.', 'Chữ F'),
('Ký hiệu chữ G', '/Alphabets/G.jpg', 'Duỗi ngón cái và ngón trỏ ra song song nhau, hướng ngang, các ngón khác nắm lại.', 'Chữ G'),
('Ký hiệu chữ H', '/Alphabets/H.jpg', 'Duỗi thẳng ngón trỏ và ngón giữa ra song song nhau hướng sang ngang, các ngón khác nắm lại.', 'Chữ H'),
('Ký hiệu chữ I', '/Alphabets/I.jpg', 'Nắm tay lại và chỉ dựng đứng duy nhất ngón út.', 'Chữ I'),
('Ký hiệu chữ J', '/Alphabets/J.jpg', 'Dựng đứng ngón út (như chữ I) rồi vẽ một đường cong hình móc câu trong không khí.', 'Chữ J'),
('Ký hiệu chữ K', '/Alphabets/K.jpg', 'Dựng đứng ngón trỏ và ngón giữa, đặt ngón cái vào giữa hai ngón đó.', 'Chữ K'),
('Ký hiệu chữ L', '/Alphabets/L.jpg', 'Xòe ngón cái và ngón trỏ tạo thành góc vuông hình chữ L, các ngón khác nắm lại.', 'Chữ L'),
('Ký hiệu chữ M', '/Alphabets/M.jpg', 'Nắm tay lại, đặt ngón tay cái luồn dưới ba ngón (trỏ, giữa, áp út).', 'Chữ M'),
('Ký hiệu chữ N', '/Alphabets/N.jpg', 'Nắm tay lại, đặt ngón tay cái luồn dưới hai ngón (trỏ và giữa).', 'Chữ N'),
('Ký hiệu chữ O', '/Alphabets/O.jpg', 'Khum tất cả các ngón tay lại chạm đầu vào nhau tạo thành hình chữ O.', 'Chữ O'),
('Ký hiệu chữ P', '/Alphabets/P.jpg', 'Tạo hình giống chữ K nhưng hướng hai ngón tay chúc xuống đất.', 'Chữ P'),
('Ký hiệu chữ Q', '/Alphabets/Q.jpg', 'Hướng ngón trỏ và ngón cái xuống đất tạo thành hình cái kẹp.', 'Chữ Q'),
('Ký hiệu chữ R', '/Alphabets/R.jpg', 'Dựng đứng và bắt chéo ngón trỏ với ngón giữa vào nhau.', 'Chữ R'),
('Ký hiệu chữ S', '/Alphabets/S.jpg', 'Nắm chặt bàn tay lại thành nắm đấm, ngón cái đặt chắn ngang trước các ngón khác.', 'Chữ S'),
('Ký hiệu chữ T', '/Alphabets/T.jpg', 'Nắm tay lại, đặt ngón cái luồn vào bên dưới ngón trỏ.', 'Chữ T'),
('Ký hiệu chữ U', '/Alphabets/U.jpg', 'Dựng đứng ngón trỏ và ngón giữa khép sát vào nhau, các ngón khác nắm lại.', 'Chữ U'),
('Ký hiệu chữ V', '/Alphabets/V.jpg', 'Dựng đứng ngón trỏ và ngón giữa xòe ra hình chữ V.', 'Chữ V'),
('Ký hiệu chữ W', '/Alphabets/W.jpg', 'Dựng đứng ba ngón: trỏ, giữa, áp út xòe ra, ngón cái giữ lấy ngón út.', 'Chữ W'),
('Ký hiệu chữ X', '/Alphabets/X.jpg', 'Nắm tay lại, dựng ngón trỏ lên và gập cong ngón trỏ lại như một cái móc.', 'Chữ X'),
('Ký hiệu chữ Y', '/Alphabets/Y.jpg', 'Xòe ngón cái và ngón út ra, ba ngón giữa nắm lại.', 'Chữ Y'),
('Ký hiệu chữ Z', '/Alphabets/Z.jpg', 'Dùng ngón trỏ vẽ hình chữ Z trong không khí.', 'Chữ Z');

-- 2. CHÈN BẢNG CHỮ SỐ (0 - 9)
INSERT INTO lessons (title, img_url, content, meaning) VALUES
('Ký hiệu số 0', 'https://example.com/assets/numbers/0.jpg', 'Khum các ngón tay tạo thành một vòng tròn khép kín.', 'Số 0'),
('Ký hiệu số 1', 'https://example.com/assets/numbers/1.jpg', 'Dựng đứng ngón tay trỏ hướng lên trên, lòng bàn tay hướng về phía trước.', 'Số 1'),
('Ký hiệu số 2', 'https://example.com/assets/numbers/2.jpg', 'Dựng đứng ngón trỏ và ngón giữa tạo thành hình chữ V.', 'Số 2'),
('Ký hiệu số 3', 'https://example.com/assets/numbers/3.jpg', 'Dựng đứng ngón cái, ngón trỏ và ngón giữa.', 'Số 3'),
('Ký hiệu số 4', 'https://example.com/assets/numbers/4.jpg', 'Dựng đứng bốn ngón tay (trỏ, giữa, áp út, út), ngón cái gập vào lòng bàn tay.', 'Số 4'),
('Ký hiệu số 5', 'https://example.com/assets/numbers/5.jpg', 'Mở rộng cả 5 ngón tay hướng lên trên.', 'Số 5'),
('Ký hiệu số 6', 'https://example.com/assets/numbers/6.jpg', 'Nắm tay lại, chỉ xòe ngón út thẳng lên.', 'Số 6'),
('Ký hiệu số 7', 'https://example.com/assets/numbers/7.jpg', 'Nắm tay lại, chỉ xòe ngón áp út thẳng lên.', 'Số 7'),
('Ký hiệu số 8', 'https://example.com/assets/numbers/8.jpg', 'Nắm tay lại, chỉ xòe ngón giữa thẳng lên.', 'Số 8'),
('Ký hiệu số 9', 'https://example.com/assets/numbers/9.jpg', 'Nắm tay lại, chỉ xòe ngón trỏ thẳng lên.', 'Số 9'),
('Ký hiệu số 10', 'https://example.com/assets/numbers/10.jpg', 'Nắm bàn tay lại thành nắm đấm, giơ ngón cái thẳng đứng lên trên, lắc nhẹ cổ tay sang hai bên.', 'Số 10'),
('Ký hiệu số 11', 'https://example.com/assets/numbers/11.jpg', 'Thực hiện ký hiệu số 10, sau đó dựng đứng ngón trỏ hướng lên trên (10 + 1).', 'Số 11'),
('Ký hiệu số 12', 'https://example.com/assets/numbers/12.jpg', 'Thực hiện ký hiệu số 10, sau đó dựng ngón trỏ và ngón giữa tạo hình chữ V (10 + 2).', 'Số 12'),
('Ký hiệu số 13', 'https://example.com/assets/numbers/13.jpg', 'Thực hiện ký hiệu số 10, sau đó dựng ngón cái, ngón trỏ và ngón giữa (10 + 3).', 'Số 13'),
('Ký hiệu số 14', 'https://example.com/assets/numbers/14.jpg', 'Thực hiện ký hiệu số 10, sau đó dựng bốn ngón (trỏ, giữa, áp út, út), ngón cái gập vào lòng bàn tay (10 + 4).', 'Số 14'),
('Ký hiệu số 15', 'https://example.com/assets/numbers/15.jpg', 'Thực hiện ký hiệu số 10, sau đó mở rộng cả 5 ngón tay hướng lên trên (10 + 5).', 'Số 15'),
('Ký hiệu số 16', 'https://example.com/assets/numbers/16.jpg', 'Thực hiện ký hiệu số 10, sau đó nắm tay lại và chỉ xòe ngón út thẳng lên (10 + 6).', 'Số 16'),
('Ký hiệu số 17', 'https://example.com/assets/numbers/17.jpg', 'Thực hiện ký hiệu số 10, sau đó nắm tay lại và chỉ xòe ngón áp út thẳng lên (10 + 7).', 'Số 17'),
('Ký hiệu số 18', 'https://example.com/assets/numbers/18.jpg', 'Thực hiện ký hiệu số 10, sau đó nắm tay lại và chỉ xòe ngón giữa thẳng lên (10 + 8).', 'Số 18'),
('Ký hiệu số 19', 'https://example.com/assets/numbers/19.jpg', 'Thực hiện ký hiệu số 10, sau đó nắm tay lại và chỉ xòe ngón trỏ thẳng lên (10 + 9).', 'Số 19'),
('Ký hiệu số 20', 'https://example.com/assets/numbers/20.jpg', 'Dựng đứng ngón trỏ và ngón giữa (hình chữ V), lòng bàn tay hướng vào trong, gập nhanh hai ngón xuống rồi duỗi thẳng lại.', 'Số 20'),
('Ký hiệu số 21', 'https://example.com/assets/numbers/21.jpg', 'Thực hiện ký hiệu số 20, sau đó dựng đứng ngón trỏ hướng lên trên (20 + 1).', 'Số 21'),
('Ký hiệu số 22', 'https://example.com/assets/numbers/22.jpg', 'Thực hiện ký hiệu số 20, sau đó dựng ngón trỏ và ngón giữa tạo hình chữ V (20 + 2).', 'Số 22'),
('Ký hiệu số 23', 'https://example.com/assets/numbers/23.jpg', 'Thực hiện ký hiệu số 20, sau đó dựng ngón cái, ngón trỏ và ngón giữa (20 + 3).', 'Số 23'),
('Ký hiệu số 24', 'https://example.com/assets/numbers/24.jpg', 'Thực hiện ký hiệu số 20, sau đó dựng bốn ngón (trỏ, giữa, áp út, út), ngón cái gập vào lòng bàn tay (20 + 4).', 'Số 24'),
('Ký hiệu số 25', 'https://example.com/assets/numbers/25.jpg', 'Thực hiện ký hiệu số 20, sau đó mở rộng cả 5 ngón tay hướng lên trên (20 + 5).', 'Số 25'),
('Ký hiệu số 26', 'https://example.com/assets/numbers/26.jpg', 'Thực hiện ký hiệu số 20, sau đó nắm tay lại và chỉ xòe ngón út thẳng lên (20 + 6).', 'Số 26'),
('Ký hiệu số 27', 'https://example.com/assets/numbers/27.jpg', 'Thực hiện ký hiệu số 20, sau đó nắm tay lại và chỉ xòe ngón áp út thẳng lên (20 + 7).', 'Số 27'),
('Ký hiệu số 28', 'https://example.com/assets/numbers/28.jpg', 'Thực hiện ký hiệu số 20, sau đó nắm tay lại và chỉ xòe ngón giữa thẳng lên (20 + 8).', 'Số 28'),
('Ký hiệu số 29', 'https://example.com/assets/numbers/29.jpg', 'Thực hiện ký hiệu số 20, sau đó nắm tay lại và chỉ xòe ngón trỏ thẳng lên (20 + 9).', 'Số 29'),
('Ký hiệu số 30', 'https://example.com/assets/numbers/30.jpg', 'Dựng đứng ngón cái, ngón trỏ và ngón giữa, lòng bàn tay hướng vào trong, gập nhanh ba ngón xuống rồi duỗi thẳng lại.', 'Số 30'),
('Ký hiệu số 31', 'https://example.com/assets/numbers/31.jpg', 'Thực hiện ký hiệu số 30, sau đó dựng đứng ngón trỏ hướng lên trên (30 + 1).', 'Số 31'),
('Ký hiệu số 32', 'https://example.com/assets/numbers/32.jpg', 'Thực hiện ký hiệu số 30, sau đó dựng ngón trỏ và ngón giữa tạo hình chữ V (30 + 2).', 'Số 32'),
('Ký hiệu số 33', 'https://example.com/assets/numbers/33.jpg', 'Thực hiện ký hiệu số 30, sau đó dựng ngón cái, ngón trỏ và ngón giữa (30 + 3).', 'Số 33'),
('Ký hiệu số 34', 'https://example.com/assets/numbers/34.jpg', 'Thực hiện ký hiệu số 30, sau đó dựng bốn ngón (trỏ, giữa, áp út, út), ngón cái gập vào lòng bàn tay (30 + 4).', 'Số 34'),
('Ký hiệu số 35', 'https://example.com/assets/numbers/35.jpg', 'Thực hiện ký hiệu số 30, sau đó mở rộng cả 5 ngón tay hướng lên trên (30 + 5).', 'Số 35'),
('Ký hiệu số 36', 'https://example.com/assets/numbers/36.jpg', 'Thực hiện ký hiệu số 30, sau đó nắm tay lại và chỉ xòe ngón út thẳng lên (30 + 6).', 'Số 36'),
('Ký hiệu số 37', 'https://example.com/assets/numbers/37.jpg', 'Thực hiện ký hiệu số 30, sau đó nắm tay lại và chỉ xòe ngón áp út thẳng lên (30 + 7).', 'Số 37'),
('Ký hiệu số 38', 'https://example.com/assets/numbers/38.jpg', 'Thực hiện ký hiệu số 30, sau đó nắm tay lại và chỉ xòe ngón giữa thẳng lên (30 + 8).', 'Số 38'),
('Ký hiệu số 39', 'https://example.com/assets/numbers/39.jpg', 'Thực hiện ký hiệu số 30, sau đó nắm tay lại và chỉ xòe ngón trỏ thẳng lên (30 + 9).', 'Số 39'),
('Ký hiệu số 40', 'https://example.com/assets/numbers/40.jpg', 'Dựng đứng bốn ngón (trỏ, giữa, áp út, út), ngón cái gập vào lòng bàn tay, gập nhanh bốn ngón xuống rồi duỗi thẳng lại.', 'Số 40'),
('Ký hiệu số 41', 'https://example.com/assets/numbers/41.jpg', 'Thực hiện ký hiệu số 40, sau đó dựng đứng ngón trỏ hướng lên trên (40 + 1).', 'Số 41'),
('Ký hiệu số 42', 'https://example.com/assets/numbers/42.jpg', 'Thực hiện ký hiệu số 40, sau đó dựng ngón trỏ và ngón giữa tạo hình chữ V (40 + 2).', 'Số 42'),
('Ký hiệu số 43', 'https://example.com/assets/numbers/43.jpg', 'Thực hiện ký hiệu số 40, sau đó dựng ngón cái, ngón trỏ và ngón giữa (40 + 3).', 'Số 43'),
('Ký hiệu số 44', 'https://example.com/assets/numbers/44.jpg', 'Thực hiện ký hiệu số 40, sau đó dựng bốn ngón (trỏ, giữa, áp út, út), ngón cái gập vào lòng bàn tay (40 + 4).', 'Số 44'),
('Ký hiệu số 45', 'https://example.com/assets/numbers/45.jpg', 'Thực hiện ký hiệu số 40, sau đó mở rộng cả 5 ngón tay hướng lên trên (40 + 5).', 'Số 45'),
('Ký hiệu số 46', 'https://example.com/assets/numbers/46.jpg', 'Thực hiện ký hiệu số 40, sau đó nắm tay lại và chỉ xòe ngón út thẳng lên (40 + 6).', 'Số 46'),
('Ký hiệu số 47', 'https://example.com/assets/numbers/47.jpg', 'Thực hiện ký hiệu số 40, sau đó nắm tay lại và chỉ xòe ngón áp út thẳng lên (40 + 7).', 'Số 47'),
('Ký hiệu số 48', 'https://example.com/assets/numbers/48.jpg', 'Thực hiện ký hiệu số 40, sau đó nắm tay lại và chỉ xòe ngón giữa thẳng lên (40 + 8).', 'Số 48'),
('Ký hiệu số 49', 'https://example.com/assets/numbers/49.jpg', 'Thực hiện ký hiệu số 40, sau đó nắm tay lại và chỉ xòe ngón trỏ thẳng lên (40 + 9).', 'Số 49'),
('Ký hiệu số 50', 'https://example.com/assets/numbers/50.jpg', 'Mở rộng cả 5 ngón tay hướng lên trên, lòng bàn tay hướng ra ngoài, gập nhanh các ngón xuống rồi duỗi thẳng lại.', 'Số 50');

-- 3. CHỦ ĐỀ: CHÀO HỎI CƠ BẢN
INSERT INTO lessons (title, img_url, content, meaning) VALUES
('Ký hiệu từ Xin chào', 'https://example.com/assets/greetings/xin_chao.png', 'Đưa bàn tay phải lên ngang thái dương, các ngón tay khép hờ, hướng lòng bàn tay ra ngoài rồi hơi cúi đầu nhẹ.', 'Xin chào'),
('Ký hiệu từ Tạm biệt', 'https://example.com/assets/greetings/tam_biet.png', 'Giơ bàn tay lên ngang tầm mắt, lòng bàn tay hướng về phía trước và gập mở các ngón tay liên tục (vẫy tay).', 'Tạm biệt'),
('Ký hiệu từ Cảm ơn', 'https://example.com/assets/greetings/cam_on.png', 'Đặt lòng bàn tay phải lên ngực trái, sau đó đưa tay ra phía trước hướng về người đối diện đồng thời hơi cúi đầu.', 'Cảm ơn'),
('Ký hiệu từ Xin lỗi', 'https://example.com/assets/greetings/xin_loi.png', 'Cúp bàn tay phải lại, đặt các đầu ngón tay chạm nhẹ vào ngực và xoay nhẹ bàn tay theo vòng tròn.', 'Xin lỗi'),
('Ký hiệu từ Khỏe không', 'https://example.com/assets/greetings/khoe_khong.png', 'Nắm hờ hai bàn tay giơ ngang ngực, lòng bàn tay hướng vào trong, rồi đẩy mạnh hai tay xuống dưới đồng thời mở thẳng các ngón tay.', 'Khỏe không?'),
('Ký hiệu từ Cha (Bố)', 'https://example.com/assets/family/cha.png', 'Dựng đứng ngón tay trỏ phải, đặt đầu ngón trỏ chạm vào bờ môi trên hoặc ria mép hai lần.', 'Cha / Bố'),
('Ký hiệu từ Mẹ', 'https://example.com/assets/family/me.png', 'Dựng đứng ngón tay trỏ phải, đặt đầu ngón trỏ chạm nhẹ vào má bên phải hai lần.', 'Mẹ'),
('Ký hiệu từ Ông', 'https://example.com/assets/family/ong.png', 'Khép hờ bàn tay phải đặt dưới cằm, rồi vuốt nhẹ xuống phía dưới như tư thế đang vuốt chòm râu dài.', 'Ông'),
('Ký hiệu từ Bà', 'https://example.com/assets/family/ba.png', 'Nắm bàn tay phải lại, chỉ đưa ngón tay cái ra và đặt đầu ngón cái ấn nhẹ vào má bên phải.', 'Bà'),
('Ký hiệu từ Anh em', 'https://example.com/assets/family/anh_em.png', 'Dựng đứng hai ngón tay trỏ của cả hai bàn tay, đặt chúng song song nhau rồi di chuyển lên xuống so le.', 'Anh em / Chị em'),
('Ký hiệu từ Xe máy', 'https://example.com/assets/transport/xe_may.png', 'Hai tay nắm hờ đặt trước ngực như đang nắm tay lái xe máy, thực hiện động tác xoay cổ tay phải hai lần (như vặn ga).', 'Xe máy'),
('Ký hiệu từ Ô tô', 'https://example.com/assets/transport/o_to.png', 'Hai tay nắm hờ tạo dáng như đang cầm vô lăng ô tô lớn, di chuyển luân phiên hai tay vòng tròn như đang lái xe.', 'Ô tô'),
('Ký hiệu từ Xe đạp', 'https://example.com/assets/transport/xe_dap.png', 'Hai bàn tay nắm hờ giơ trước ngực, chuyển động xoay tròn so le nhau theo trục dọc (mô phỏng động tác đạp bàn đạp).', 'Xe đạp'),
('Ký hiệu từ Đi bộ', 'https://example.com/assets/transport/di_bo.png', 'Chúc ngón trỏ và ngón giữa của bàn tay phải xuống dưới, di chuyển hai ngón tay bước đi so le tiến về phía trước.', 'Đi bộ'),
('Ký hiệu từ Dừng lại', 'https://example.com/assets/transport/dung_lai.png', 'Mở thẳng bàn tay phải, các ngón tay khép sát, giơ lên trước ngực với lòng bàn tay hướng thẳng về phía trước.', 'Dừng lại');