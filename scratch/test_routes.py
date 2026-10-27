#!/usr/bin/env python3
import sys

# Test defining 25 bidirectional route pairs (50 routes)
route_pairs = [
    # (name, type, [station_ids], [distances_km])
    ("Mumbai Central - New Delhi Rajdhani Express", "RAJDHANI",
     [2, 3, 4, 5, 6, 1], [0, 263, 392, 653, 919, 1386]),
    ("Howrah - New Delhi Rajdhani Express", "RAJDHANI",
     [7, 8, 9, 10, 11, 12, 13, 1], [0, 200, 259, 458, 663, 816, 1010, 1451]),
    ("New Delhi - Rani Kamlapati Shatabdi Express", "SHATABDI",
     [1, 14, 15, 16, 17, 18], [0, 195, 313, 411, 703, 709]),
    ("Telangana Express", "SUPERFAST",
     [23, 24, 22, 21, 20, 19, 17, 16, 15, 14, 1], [0, 9, 141, 376, 584, 882, 974, 1266, 1364, 1482, 1677]),
    ("Mumbai CSMT - Pune Intercity Express", "SUPERFAST",
     [25, 26, 27, 28, 29], [0, 34, 54, 128, 192]),
    ("Howrah - Chennai Mail", "MAIL_EXPRESS",
     [7, 30, 31, 32, 33, 34, 35], [0, 115, 409, 437, 881, 1230, 1661]),
    ("New Delhi - Lucknow Shatabdi Express", "SHATABDI",
     [1, 13, 39], [0, 440, 512]),
    ("New Delhi - Varanasi Vande Bharat Express", "VANDE_BHARAT",
     [1, 13, 12, 40], [0, 440, 635, 759]),
    ("Mumbai Central - Ahmedabad Vande Bharat Express", "VANDE_BHARAT",
     [2, 3, 4, 37], [0, 263, 392, 492]),
    ("New Delhi - Jaipur Vande Bharat Express", "VANDE_BHARAT",
     [1, 38], [0, 304]),
    ("Howrah - Patna Vande Bharat Express", "VANDE_BHARAT",
     [7, 8, 10, 11], [0, 200, 458, 663]),
    ("Chennai - Bengaluru Shatabdi Express", "SHATABDI",
     [35, 36], [0, 358]),
    ("Secunderabad - Visakhapatnam Vande Bharat Express", "VANDE_BHARAT",
     [24, 22, 34, 33], [0, 132, 349, 699]),
    ("Mumbai CSMT - Nagpur Duronto Express", "DURONTO",
     [25, 27, 20], [0, 54, 837]),
    ("Karnataka Express", "SUPERFAST",
     [1, 14, 15, 16, 17, 19, 20, 21, 22, 24, 36], [0, 195, 313, 411, 703, 795, 1093, 1301, 1537, 1673, 2406]),
    ("Gitanjali Express", "SUPERFAST",
     [7, 30, 20, 27, 25], [0, 115, 1029, 1914, 1968]),
    ("Tamil Nadu Express", "SUPERFAST",
     [1, 14, 15, 16, 17, 19, 20, 21, 34, 35], [0, 195, 313, 411, 703, 795, 1093, 1301, 1756, 2182]),
    ("Ahmedabad - New Delhi Rajdhani Express", "RAJDHANI",
     [37, 38, 1], [0, 625, 929]),
    ("Pushpak Express", "SUPERFAST",
     [39, 13, 16, 17, 19, 27, 25], [0, 72, 292, 584, 676, 1373, 1427]),
    ("Howrah - Bhubaneswar Jan Shatabdi Express", "SHATABDI",
     [7, 30, 31, 32], [0, 115, 409, 437]),
    ("Pune - Secunderabad Shatabdi Express", "SHATABDI",
     [29, 24], [0, 597]),
    ("Mahanagari Express", "SUPERFAST",
     [40, 12, 16, 17, 19, 27, 25], [0, 124, 396, 688, 780, 1477, 1531]),
    ("Rani Kamlapati - New Delhi Vande Bharat Express", "VANDE_BHARAT",
     [18, 17, 16, 15, 14, 1], [0, 6, 298, 396, 514, 709]),
    ("Bengaluru - Hyderabad Kacheguda Express", "SUPERFAST",
     [36, 24, 23], [0, 610, 619]),
    ("Pinakini Express", "SUPERFAST",
     [35, 34], [0, 431])
]

print(f"Total route pairs defined: {len(route_pairs)}")
for i, rp in enumerate(route_pairs, 1):
    assert len(rp[2]) == len(rp[3]), f"Route {i} length mismatch"
    assert rp[3][0] == 0, f"Route {i} origin distance not 0"
    for j in range(1, len(rp[3])):
        assert rp[3][j] > rp[3][j-1], f"Route {i} stop {j} distance not increasing"

print("All 25 route pairs validated!")
