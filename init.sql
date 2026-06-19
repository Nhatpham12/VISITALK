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
('Ký hiệu chữ A', '/Assets/Alphabets/A.png', 'Nắm tay lại, ngón cái đặt dọc bên cạnh ngón trỏ.', 'Chữ A'),
('Ký hiệu chữ B', '/Assets/Alphabets/B.png', 'Mở thẳng bàn tay, bốn ngón khép lại, ngón cái gập vào trong lòng bàn tay.', 'Chữ B'),
('Ký hiệu chữ C', '/Assets/Alphabets/C.png', 'Khum bàn tay lại thành hình chữ C.', 'Chữ C'),
('Ký hiệu chữ D', '/Assets/Alphabets/D.png', 'Dựng đứng ngón trỏ, các ngón còn lại khum lại chạm vào ngón cái tạo thành vòng tròn.', 'Chữ D'),
('Ký hiệu chữ Đ', '/Assets/Alphabets/D2.png', 'Dựng đứng ngón trỏ, các ngón còn lại khum lại chạm vào ngón cái tạo thành vòng tròn, sau đó gập nhẹ đốt đầu tiên của ngón trỏ xuống hai lần.', 'Chữ Đ'),
('Ký hiệu chữ E', '/Assets/Alphabets/E.png', 'Thu các ngón tay lại, gập nửa các ngón sao cho đầu ngón tay chạm nhẹ vào phần trên lòng bàn tay.', 'Chữ E'),
('Ký hiệu chữ G', '/Assets/Alphabets/G.png', 'Duỗi ngón cái và ngón trỏ ra song song nhau, hướng ngang, các ngón khác nắm lại.', 'Chữ G'),
('Ký hiệu chữ H', '/Assets/Alphabets/H.png', 'Duỗi thẳng ngón trỏ và ngón giữa ra song song nhau hướng sang ngang, các ngón khác nắm lại.', 'Chữ H'),
('Ký hiệu chữ I', '/Assets/Alphabets/I.png', 'Nắm tay lại và chỉ dựng đứng duy nhất ngón út.', 'Chữ I'),
('Ký hiệu chữ K', '/Assets/Alphabets/K.png', 'Dựng đứng ngón trỏ và ngón giữa, đặt ngón cái vào giữa hai ngón đó.', 'Chữ K'),
('Ký hiệu chữ L', '/Assets/Alphabets/L.png', 'Xòe ngón cái và ngón trỏ tạo thành góc vuông hình chữ L, các ngón khác nắm lại.', 'Chữ L'),
('Ký hiệu chữ M', '/Assets/Alphabets/M.png', 'Nắm tay lại, đặt ngón tay cái luồn dưới ba ngón (trỏ, giữa, áp út).', 'Chữ M'),
('Ký hiệu chữ N', '/Assets/Alphabets/N.png', 'Nắm tay lại, đặt ngón tay cái luồn dưới hai ngón (trỏ và giữa).', 'Chữ N'),
('Ký hiệu chữ O', '/Assets/Alphabets/O.png', 'Khum tất cả các ngón tay lại chạm đầu vào nhau tạo thành hình chữ O.', 'Chữ O'),
('Ký hiệu chữ P', '/Assets/Alphabets/P.png', 'Tạo hình giống chữ K nhưng hướng hai ngón tay chúc xuống đất.', 'Chữ P'),
('Ký hiệu chữ Q', '/Assets/Alphabets/Q.png', 'Hướng ngón trỏ và ngón cái xuống đất tạo thành hình cái kẹp.', 'Chữ Q'),
('Ký hiệu chữ R', '/Assets/Alphabets/R.png', 'Dựng đứng và bắt chéo ngón trỏ với ngón giữa vào nhau.', 'Chữ R'),
('Ký hiệu chữ S', '/Assets/Alphabets/S.png', 'Nắm chặt bàn tay lại thành nắm đấm, ngón cái đặt chắn ngang trước các ngón khác.', 'Chữ S'),
('Ký hiệu chữ T', '/Assets/Alphabets/T.png', 'Nắm tay lại, đặt ngón cái luồn vào bên dưới ngón trỏ.', 'Chữ T'),
('Ký hiệu chữ U', '/Assets/Alphabets/U.png', 'Dựng đứng ngón trỏ và ngón giữa khép sát vào nhau, các ngón khác nắm lại.', 'Chữ U'),
('Ký hiệu chữ V', '/Assets/Alphabets/V.png', 'Dựng đứng ngón trỏ và ngón giữa xòe ra hình chữ V.', 'Chữ V'),
('Ký hiệu chữ X', '/Assets/Alphabets/X.png', 'Nắm tay lại, dựng ngón trỏ lên và gập cong ngón trỏ lại như một cái móc.', 'Chữ X'),
('Ký hiệu chữ Y', '/Assets/Alphabets/Y.png', 'Xòe ngón cái và ngón út ra, ba ngón giữa nắm lại.', 'Chữ Y'),
('Ký hiệu dấu huyền', '/Assets/Alphabets/Huyen.png', 'Dựng đứng ngón trỏ hướng lên trên, sau đó di chuyển tay vẽ một đường chéo ngắn từ trên bên trái xuôi xuống bên phải trên không trung.', 'Dấu huyền'),
('Ký hiệu dấu nặng', '/Assets/Alphabets/Nang.png', 'Dựng đứng ngón trỏ hướng lên trên, sau đó di chuyển tay chấm một điểm nhẹ hướng xuống dưới trên không trung.', 'Dấu nặng'),
('Ký hiệu dấu ngã', '/Assets/Alphabets/Nga.png', 'Dựng đứng ngón trỏ hướng lên trên, sau đó di chuyển tay vẽ một đường lượn sóng ngang nhỏ trên không trung.', 'Dấu ngã'),
('Ký hiệu dấu sắc', '/Assets/Alphabets/Sac.png', 'Dựng đứng ngón trỏ hướng lên trên, sau đó di chuyển tay vẽ một đường chéo ngắn từ dưới bên trái vuốt chếch lên bên phải trên không trung.', 'Dấu sắc'),
('Ký hiệu dấu râu (Dấu móc)', '/Assets/Alphabets/Smile.png', 'Dựng đứng ngón trỏ hướng lên trên, sau đó gập cong nhẹ đầu ngón trỏ lại vẽ một dấu móc nhỏ trên không trung.', 'Dấu râu (móc)'),
('Ký hiệu dấu nón (Dấu mũ)', '/Assets/Alphabets/Hat.png', 'Ngón trỏ và ngón giữa duỗi thẳng tạo thành hình chữ V ngược, sau đó di chuyển bàn tay vẽ một hình chữ V ngược nhỏ trên không trung.', 'Dấu nón (mũ)'),
('Ký hiệu dấu hỏi', '/Assets/Alphabets/Ask.png', 'Dựng đứng ngón trỏ hướng lên trên, sau đó di chuyển ngón trỏ vẽ một hình dấu hỏi nhỏ trên không trung.', 'Dấu hỏi');

-- 2. CHÈN BẢNG CHỮ SỐ 
INSERT INTO lessons (title, img_url, content, meaning) VALUES
('Ký hiệu số 0', '/Assets/Numbers/0.png', 'Khum các ngón tay tạo thành một vòng tròn khép kín.', 'Số 0'),
('Ký hiệu số 1', '/Assets/Numbers/1.png', 'Dựng đứng ngón tay trỏ hướng lên trên, lòng bàn tay hướng về phía trước.', 'Số 1'),
('Ký hiệu số 2', '/Assets/Numbers/2.png', 'Dựng đứng ngón trỏ và ngón giữa tạo thành hình chữ V.', 'Số 2'),
('Ký hiệu số 3', '/Assets/Numbers/3.png', 'Dựng đứng ngón cái, ngón trỏ và ngón giữa.', 'Số 3'),
('Ký hiệu số 4', '/Assets/Numbers/4.png', 'Dựng đứng bốn ngón tay (trỏ, giữa, áp út, út), ngón cái gập vào lòng bàn tay.', 'Số 4'),
('Ký hiệu số 5', '/Assets/Numbers/5.png', 'Mở rộng cả 5 ngón tay hướng lên trên.', 'Số 5'),
('Ký hiệu số 6', '/Assets/Numbers/6.png', 'Nắm tay lại, chỉ xòe ngón út thẳng lên.', 'Số 6'),
('Ký hiệu số 7', '/Assets/Numbers/7.png', 'Nắm tay lại, chỉ xòe ngón áp út thẳng lên.', 'Số 7'),
('Ký hiệu số 8', '/Assets/Numbers/8.png', 'Nắm tay lại, chỉ xòe ngón giữa thẳng lên.', 'Số 8'),
('Ký hiệu số 9', '/Assets/Numbers/9.png', 'Nắm tay lại, chỉ xòe ngón trỏ thẳng lên.', 'Số 9'),
('Ký hiệu số 10', '/Assets/Numbers/10.png', 'Nắm bàn tay lại thành nắm đấm, giơ ngón cái thẳng đứng lên trên, lắc nhẹ cổ tay sang hai bên.', 'Số 10'),
('Ký hiệu số 11', '/Assets/Numbers/11.png', 'Thực hiện ký hiệu số 10, sau đó dựng đứng ngón trỏ hướng lên trên (10 + 1).', 'Số 11'),
('Ký hiệu số 12', '/Assets/Numbers/12.png', 'Thực hiện ký hiệu số 10, sau đó dựng ngón trỏ và ngón giữa tạo hình chữ V (10 + 2).', 'Số 12'),
('Ký hiệu số 40', '/Assets/Numbers/40.png', 'Dựng đứng bốn ngón (trỏ, giữa, áp út, út), ngón cái gập vào lòng bàn tay, gập nhanh bốn ngón xuống rồi duỗi thẳng lại.', 'Số 40'),
('Ký hiệu số 80', '/Assets/Numbers/80.png', 'Tay phải đưa ngón cái, ngón trỏ và ngón giữa dựng thẳng tạo thành số 3 (hoặc số 8 theo hệ đếm ký hiệu cũ), sau đó khum các ngón tay lại tạo thành một vòng tròn khép kín tạo thành số 0.', 'Số 80'),
('Ký hiệu số 90', '/Assets/Numbers/90.png', 'Tay phải gập cong ngón trỏ tạo thành số 4 gập (hoặc ký hiệu số 9), sau đó khum các ngón tay lại tạo thành một vòng tròn khép kín tạo thành số 0.', 'Số 90'),
('Ký hiệu số 100', '/Assets/Numbers/100.png', 'Dựng đứng ngón trỏ hướng lên trên tạo thành số 1, sau đó làm liên tiếp hai lần động tác khum các ngón tay tạo thành vòng tròn khép kín tạo thành hai số 0.', 'Số 100'),
('Ký hiệu số 1000', '/Assets/Numbers/1000.png', 'Dựng đứng ngón trỏ tạo thành số 1, sau đó di chuyển bàn tay theo một đường vòng cung hướng từ trái sang phải tạo thành ký hiệu hàng nghìn.', 'Số 1.000'),
('Ký hiệu số 5000', '/Assets/Numbers/5000.png', 'Xòe thẳng năm ngón tay hướng lên trên tạo thành số 5, sau đó di chuyển bàn tay theo một đường vòng cung hướng từ trái sang phải tạo thành ký hiệu hàng nghìn.', 'Số 5.000'),
('Ký hiệu số 10000', '/Assets/Numbers/10thous.png', 'Dựng đứng ngón trỏ tạo thành số 1, tiếp tục khum tay tạo thành số 0, sau đó úp bàn tay xuống và dùng ngón trỏ vạch một đường thẳng hướng xuống dưới để ký hiệu hàng nghìn.', 'Số 10.000'),
('Ký hiệu số 1 triệu', '/Assets/Numbers/1mil.png', 'Dựng đứng ngón trỏ hướng lên trên tạo thành số 1, sau đó đưa hai ngón trỏ và ngón giữa sát nhau rồi vạch một đường lượn sóng móc chéo lên ký hiệu hàng triệu.', 'Số 1.000.000'),
('Ký hiệu số 1 tỉ', '/Assets/Numbers/1bil.png', 'Dựng đứng ngón trỏ hướng lên trên tạo thành số 1, sau đó đưa hai ngón trỏ và ngón giữa sát nhau rồi vạch một dấu móc hỏi hướng xuống ký hiệu hàng tỉ.', 'Số 1.000.000.000');
-- 3. CHỦ ĐỀ: TỪ THÔNG DỤNG
INSERT INTO lessons (title, img_url, content, meaning) VALUES
('Ký hiệu từ Ảnh hưởng', '/Assets/Words/anh_huong.png', 'Hai tay khum, khép, ngón cái choãi, lòng bàn tay hướng vào trong, đặt so le nhau trước ngực. Di chuyển hai tay ra, vào ngược chiều nhau.', 'Ảnh hưởng'),
('Ký hiệu từ Áo', '/Assets/Words/ao.png', 'Ngón trỏ và ngón cái tay phải chụm lại, các ngón khác duỗi, lòng bàn tay hướng xuống dưới, ngón cái và ngón trỏ nắm vào vai áo phải.', 'Áo'),
('Ký hiệu từ Áo khoác', '/Assets/Words/ao_khoac.png', 'Hai tay khum, lòng bàn tay hướng xuống dưới, đặt trên hai vai. Di chuyển đồng thời hai tay theo đường vòng cung về trước ngực. Hai tay chụm, lòng bàn tay hướng vào trong, đặt so le trước bụng. Di chuyển tay phải lên trên.', 'Áo khoác'),
('Ký hiệu từ Ba lô', '/Assets/Words/ba_lo.png', 'Hai tay nắm, ngón cái choãi, lòng bàn tay hướng vào nhau, đặt song song trước ngực. Di chuyển đồng thời hai tay xuống dưới.', 'Ba lô'),
('Ký hiệu từ Bác sĩ', '/Assets/Words/bac_si.png', 'Tay phải để hình dạng chữ "d", lòng bàn tay hướng sang trái, đặt vào giữa trán. Di chuyển tay phải đặt ngang trán, lòng bàn tay hướng xuống dưới.', 'Bác sĩ'),
('Ký hiệu từ Bàn', '/Assets/Words/ban.png', 'Hai tay duỗi khép, lòng bàn tay hướng xuống dưới, các ngón tay hướng ra ngoài, đặt song song ngang bụng. Di chuyển đồng thời hai tay sang hai bên.', 'Bàn'),
('Ký hiệu từ Bàn tay', '/Assets/Words/ban_tay.png', 'Tay trái duỗi khép, lòng bàn tay hướng xuống dưới, các ngón tay hướng chếch sang phải, đặt trước ngực. Tay phải duỗi khép, lòng bàn tay hướng xuống dưới, các ngón tay hướng chếch sang trái, đặt trên mu bàn tay trái. Di chuyển tay phải xuống mu bàn tay trái (2 lần).', 'Bàn tay'),
('Ký hiệu từ Bạn', '/Assets/Words/ban.png', 'Hai tay khum, lòng bàn tay hướng vào nhau, tay trái đặt trên tay phải, để trước ngực.', 'Bạn'),
('Ký hiệu từ Bạn thân', '/Assets/Words/ban_than.png', 'Hai tay nắm, ngón cái choãi, lòng bàn tay hướng vào nhau, đặt sát nhau trước ngực. Di chuyển đồng thời hai tay từ trong ra ngoài (3 lần).', 'Bạn thân'),
('Ký hiệu từ Bầu trời', '/Assets/Words/bau_troi.png', 'Tay phải nắm, ngón trỏ duỗi hướng lên trên, lòng bàn tay hướng ra ngoài, đặt ngang mặt bên phải. Di chuyển tay lên trên và đưa mắt nhìn lên trên.', 'Bầu trời'),
('Ký hiệu từ Bệnh', '/Assets/Words/benh.png', 'Tay trái nắm, lòng bàn tay hướng lên trên, đặt trước bụng. Tay phải để hình dạng chữ "n", lòng bàn tay hướng xuống dưới, ngón tay hướng ra ngoài, đặt trên cổ tay trái (2 lần).', 'Bệnh'),
('Ký hiệu từ Bệnh viện', '/Assets/Words/benh_vien.png', 'Hai tay để hình dạng chữ "u", lòng bàn tay hướng ra ngoài, ngón giữa và ngón trỏ hai tay đặt chéo nhau sát trán.', 'Bệnh viện'),
('Ký hiệu từ Bố', '/Assets/Words/bo.png', 'Tay phải để hình dạng chữ "b", lòng bàn tay hướng vào trong, đặt đầu các ngón tay chạm cằm.', 'Bố'),
('Ký hiệu từ Buồn', '/Assets/Words/buon.png', 'Tay phải nắm, lòng bàn tay hướng vào trong, đặt sát ngực. Di chuyển tay theo hình vòng tròn thuận chiều kim đồng hồ, nét mặt buồn.', 'Buồn'),
('Ký hiệu từ Bút', '/Assets/Words/but.png', 'Ngón cái và ngón trỏ tay phải chạm vào nhau, các ngón khác nắm lại, lòng bàn tay hướng xuống dưới, đặt trước ngực. Di chuyển tay sang phải theo đường lượn sóng.', 'Bút'),
('Ký hiệu từ Ca sĩ', '/Assets/Words/ca_si.png', 'Tay phải nắm, lòng bàn tay hướng sang trái, đặt tay ngang cằm bên phải. Di chuyển tay sang hai bên 2 lần, đầu nghiêng theo tay.', 'Ca sĩ'),
('Ký hiệu từ Cá sấu', '/Assets/Words/ca_sau.png', 'Hai tay khum, lòng bàn tay hướng vào nhau, tay phải để trên tay trái, đặt trước ngực. Di chuyển các ngón tay chạm nhau (2 lần).', 'Cá sấu'),
('Ký hiệu từ Cái gối', '/Assets/Words/cai_goi.png', 'Tay phải khum, lòng bàn tay hướng ra ngoài, đặt sau gáy. Di chuyển tay vào sát đầu, đầu hơi nghiêng về phía sau bên phải (2 lần).', 'Cái gối'),
('Ký hiệu từ Chào', '/Assets/Words/chao.png', 'Tay phải duỗi, khép, lòng bàn tay hướng ra ngoài, các ngón tay hướng lên trên, đặt ngang mặt bên phải. Di chuyển tay sang hai bên (2 lần).', 'Chào'),
('Ký hiệu từ Chạy', '/Assets/Words/chay.png', 'Hai tay nắm, tay phải để trước tay trái, lòng bàn tay hướng vào nhau, đặt so le nhau trước ngực. Di chuyển hai tay lên xuống ngược chiều nhau (2 lần).', 'Chạy');