from collections import Counter

import cv2
from PIL.ImageChops import offset
from cvzone.HandTrackingModule import HandDetector
import numpy as np
import math
import time

cap = cv2.VideoCapture(0)
detector = HandDetector(maxHands = 2)
offset = 20
imgSize = 300
counter =  0

folder = "Data/Thank you"
while True:
    success, img = cap.read()
    hands, img = detector.findHands(img)
    if hands:
        hand = hands[0]
        x,y,w,h = hand["bbox"]

        imgWhite = np.ones((imgSize, imgSize,3),np.uint8)*255

        imgCrop = img[y - offset : y + h + offset, x - offset : x + w + offset]
        imgCropShape = imgCrop.shape

        aspectRatio = h/w

        if aspectRatio > 1:
            k = imgSize/h
            wCal = math.ceil(k*w)
            imgResized = cv2.resize(imgCrop,(wCal,imgSize))
            imgResizedShape = imgResized.shape
            wGap = math.ceil((imgSize - wCal)/2)
            imgWhite[: ,wGap : wCal + wGap] = imgResized

        else:
            k = imgSize/w
            hCal = math.ceil(k * h)
            imgResized = cv2.resize(imgCrop, (imgSize,hCal))
            imgResizedShape = imgResized.shape
            hGap = math.ceil((imgSize - hCal) / 2)
            imgWhite[hGap: hCal + hGap, :] = imgResized

        cv2.imshow('ImageCrop',imgCrop)
        cv2.imshow('ImageWhite',imgWhite)

    cv2.imshow('Image',img)
    key = cv2.waitKey(1)
    if key == ord('s'):
        counter += 1
        cv2.imwrite(f'{folder}/Image_{time.time()}.jpg' , imgWhite)
        print(counter)
    if key == ord('q'):
        break