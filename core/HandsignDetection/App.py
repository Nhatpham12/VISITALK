
import cv2
import numpy as np
import math
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier

# Khởi tạo Webcam và Detector
cap = cv2.VideoCapture(0)
detector = HandDetector(maxHands=1)

import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
classifier = Classifier(
    os.path.join(BASE_DIR, "Model", "keras_model.h5"),
    os.path.join(BASE_DIR, "Model", "labels.txt")
)

# Khai báo các thông số (giống hệt lúc thu thập dữ liệu)
offset = 20
imgSize = 300

# Danh sách nhãn (Phải đúng thứ tự với file labels.txt)
labels = ["Hello", "Thank you"]  # Thay đổi theo các nhãn bạn đã train

while True:
    success, img = cap.read()
    imgOutput = img.copy()  # Tạo bản sao để vẽ kết quả lên
    hands, img = detector.findHands(img)

    if hands:
        hand = hands[0]
        x, y, w, h = hand["bbox"]

        imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255

        try:
            # Cắt ảnh tay
            imgCrop = img[y - offset: y + h + offset, x - offset: x + w + offset]
            aspectRatio = h / w

            # Căn chỉnh và dán lên nền trắng
            if aspectRatio > 1:
                k = imgSize / h
                wCal = math.ceil(k * w)
                imgResized = cv2.resize(imgCrop, (wCal, imgSize))
                wGap = math.ceil((imgSize - wCal) / 2)
                imgWhite[:, wGap: wCal + wGap] = imgResized
            else:
                k = imgSize / w
                hCal = math.ceil(k * h)
                imgResized = cv2.resize(imgCrop, (imgSize, hCal))
                hGap = math.ceil((imgSize - hCal) / 2)
                imgWhite[hGap: hCal + hGap, :] = imgResized

            # --- ĐƯA ẢNH VÀO MÔ HÌNH AI ---
            # Hàm getPrediction trả về danh sách dự đoán và index của nhãn cao nhất
            prediction, index = classifier.getPrediction(imgWhite, draw=False)

            # Lấy tên nhãn dựa vào index
            detected_word = labels[index]

            # --- HIỂN THỊ KẾT QUẢ ---
            # Vẽ hình chữ nhật nền đen chữ trắng hiển thị kết quả
            cv2.rectangle(imgOutput, (x - offset, y - offset - 50),
                          (x - offset + 200, y - offset - 5 + 50), (0, 0, 0), cv2.FILLED)
            cv2.putText(imgOutput, detected_word, (x, y - 20),
                        cv2.FONT_HERSHEY_COMPLEX, 1.7, (255, 255, 255), 2)

            # Vẽ khung bao quanh tay
            cv2.rectangle(imgOutput, (x - offset, y - offset),
                          (x + w + offset, y + h + offset), (0, 255, 0), 4)

            cv2.imshow('ImageCrop', imgCrop)
            cv2.imshow('ImageWhite', imgWhite)

        except Exception as e:
            # Tránh văng app khi tay ra khỏi màn hình
            pass

    cv2.imshow('VISITALK - Translation', imgOutput)

    key = cv2.waitKey(1)
    if key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()