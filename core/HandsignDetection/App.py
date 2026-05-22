import keras
import streamlit as st
from streamlit_webrtc import webrtc_streamer, VideoTransformerBase
import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp

# 1. Tải mô hình đã upload
try:
    model = keras.models.load_model('vietnamese_sign_language_model.keras')
    print("Model loaded successfully with Keras 3!")
except Exception as e:
    print(f"Lỗi load model: {e}")

# 2. Danh sách nhãn (Bạn hãy thay đổi danh sách này khớp với các lớp lúc bạn train model)
labels = ['A', 'B', 'C', 'D', 'Đ', 'E', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y']

# 3. Khởi tạo MediaPipe để nhận diện tay
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.7)
mp_draw = mp.solutions.drawing_utils

class SignLanguageTransformer(VideoTransformerBase):
    def transform(self, frame):
        img = frame.to_ndarray(format="bgr24")
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = hands.process(img_rgb)
        
        prediction_text = ""
        
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Vẽ khung xương tay lên màn hình
                mp_draw.draw_landmarks(img, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                
                # Trích xuất tọa độ để cắt vùng bàn tay
                h, w, _ = img.shape
                x_max = 0
                y_max = 0
                x_min = w
                y_min = h
                for lm in hand_landmarks.landmark:
                    x, y = int(lm.x * w), int(lm.y * h)
                    if x > x_max: x_max = x
                    if x < x_min: x_min = x
                    if y > y_max: y_max = y
                    if y < y_min: y_min = y
                
                # Thêm lề (padding) cho vùng cắt
                offset = 20
                try:
                    hand_img = img_rgb[y_min-offset:y_max+offset, x_min-offset:x_max+offset]
                    # Resize về 128x128 theo yêu cầu của model
                    hand_img = cv2.resize(hand_img, (128, 128))
                    hand_img = np.expand_dims(hand_img, axis=0) # (1, 128, 128, 3)
                    
                    # Dự đoán
                    prediction = model.predict(hand_img, verbose=0)
                    class_id = np.argmax(prediction)
                    confidence = prediction[0][class_id]
                    
                    if confidence > 0.8: # Chỉ hiển thị nếu độ tin cậy cao
                        prediction_text = labels[class_id]
                        cv2.putText(img, f"Ket qua: {prediction_text} ({confidence*100:.1f}%)", 
                                    (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                except:
                    pass

        return img

# --- Giao diện Streamlit ---
st.set_page_config(page_title="VISITALK - Translate", layout="wide")
st.title("🤟 VISITALK: Hệ Thống Dịch Ngôn Ngữ Ký Hiệu Tiếng Việt")

col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("Webcam Access")
    webrtc_streamer(key="sign-language", video_transformer_factory=SignLanguageTransformer)

with col2:
    st.subheader("Kết quả dịch")
    st.info("Đưa bàn tay vào khung hình để bắt đầu dịch sang văn bản.")
    # Ở đây bạn có thể thêm logic để lưu các chữ cái đã nhận diện thành từ