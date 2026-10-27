#!/usr/bin/env python3
import time
import random
import math

print("Testing pipeline speed with 1,000 bookings...")
t0 = time.time()
# Simulate data generation logic
total_bookings = 1000
bookings = []
for i in range(1, total_bookings + 1):
    num_passengers = random.choices([1, 2, 3, 4], weights=[45, 35, 12, 8])[0]
    pnr = f"{random.randint(1000000000, 9999999999)}"
    bookings.append((i, pnr, num_passengers))

t1 = time.time()
print(f"Generated {len(bookings)} bookings in {t1 - t0:.4f}s")
