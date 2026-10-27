#!/usr/bin/env python3
"""
Pravas Rail - Bulk Sample Data Generator (seed_bulk_data.py)
Generates ~50,000 bookings, 5,000 passengers, and 50 trains of realistic
sample data for the railway_db MySQL 8 schema.

Usage:
    python3 admin-reports/sql/seed_bulk_data.py [--output admin-reports/sql/seed_bulk_data.sql]
"""

import sys
import os
import argparse
import random
import math
from datetime import datetime, timedelta

def parse_args():
    parser = argparse.ArgumentParser(description="Generate bulk sample data for Pravas Rail")
    parser.add_argument("--output", default="admin-reports/sql/seed_bulk_data.sql",
                        help="Path to output SQL file (default: admin-reports/sql/seed_bulk_data.sql)")
    parser.add_argument("--bookings", type=int, default=50000, help="Number of bookings to generate (default: 50000)")
    parser.add_argument("--passengers", type=int, default=5000, help="Number of passenger users to generate (default: 5000)")
    parser.add_argument("--trains", type=int, default=50, help="Number of trains to generate (default: 50)")
    parser.add_argument("--days", type=int, default=92, help="Days of train runs (default: 92)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility (default: 42)")
    return parser.parse_args()

def sql_str(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "1" if val else "0"
    if isinstance(val, (int, float)):
        return str(val)
    escaped = str(val).replace("\\", "\\\\").replace("'", "''")
    return f"'{escaped}'"

def write_batch(out, table, columns, rows, batch_size=500):
    col_list = ",".join(columns)
    for i in range(0, len(rows), batch_size):
        chunk = rows[i:i + batch_size]
        values = []
        for row in chunk:
            vals = ",".join(sql_str(v) for v in row)
            values.append(f"({vals})")
        stmt = f"INSERT INTO {table} ({col_list}) VALUES\n" + ",\n".join(values) + ";\n"
        out.write(stmt)

def main():
    args = parse_args()
    random.seed(args.seed)

    output_path = args.output
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    out = open(output_path, "w", encoding="utf-8", buffering=1024*1024)

    print(f"Generating realistic bulk sample dataset for Pravas Rail:")
    print(f"  Target bookings  : {args.bookings:,}")
    print(f"  Target passengers: {args.passengers:,}")
    print(f"  Target trains    : {args.trains}")
    print(f"  Target file      : {output_path}")

    # Header
    out.write("-- =====================================================================\n")
    out.write("--  PRAVAS RAIL - BULK DATA SEED SCRIPT (seed_bulk_data.sql)\n")
    out.write(f"--  Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    out.write(f"--  Contains: ~{args.bookings:,} bookings, {args.passengers:,} passengers, {args.trains} trains\n")
    out.write("--  Load order: Run after db/01_schema.sql\n")
    out.write("-- =====================================================================\n")
    out.write("USE railway_db;\n\n")
    out.write("SET FOREIGN_KEY_CHECKS = 0;\n")
    out.write("SET UNIQUE_CHECKS = 0;\n")
    out.write("SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n")
    out.write("START TRANSACTION;\n\n")

    # 1. Stations (40 stations)
    print("Writing stations (40)...")
    stations = [
        (1,'NDLS','New Delhi','New Delhi','Delhi','NR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (2,'BCT','Mumbai Central','Mumbai','Maharashtra','WR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (3,'ST','Surat','Surat','Gujarat','WR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (4,'BRC','Vadodara Junction','Vadodara','Gujarat','WR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (5,'RTM','Ratlam Junction','Ratlam','Madhya Pradesh','WR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (6,'KOTA','Kota Junction','Kota','Rajasthan','WCR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (7,'HWH','Howrah Junction','Howrah','West Bengal','ER',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (8,'ASN','Asansol Junction','Asansol','West Bengal','ER',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (9,'DHN','Dhanbad Junction','Dhanbad','Jharkhand','ECR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (10,'GAYA','Gaya Junction','Gaya','Bihar','ECR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (11,'DDU','Pt. Deen Dayal Upadhyaya Junction','Pt. DDU Nagar','Uttar Pradesh','ECR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (12,'PRYJ','Prayagraj Junction','Prayagraj','Uttar Pradesh','NCR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (13,'CNB','Kanpur Central','Kanpur','Uttar Pradesh','NCR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (14,'AGC','Agra Cantt','Agra','Uttar Pradesh','NCR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (15,'GWL','Gwalior Junction','Gwalior','Madhya Pradesh','NCR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (16,'VGLJ','Virangana Lakshmibai Jhansi Junction','Jhansi','Uttar Pradesh','NCR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (17,'BPL','Bhopal Junction','Bhopal','Madhya Pradesh','WCR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (18,'RKMP','Rani Kamlapati','Bhopal','Madhya Pradesh','WCR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (19,'ET','Itarsi Junction','Itarsi','Madhya Pradesh','WCR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (20,'NGP','Nagpur Junction','Nagpur','Maharashtra','CR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (21,'BPQ','Balharshah Junction','Balharshah','Maharashtra','CR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (22,'KZJ','Kazipet Junction','Hanamkonda','Telangana','SCR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (23,'HYB','Hyderabad Deccan','Hyderabad','Telangana','SCR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (24,'SC','Secunderabad Junction','Secunderabad','Telangana','SCR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (25,'CSMT','Chhatrapati Shivaji Maharaj Terminus','Mumbai','Maharashtra','CR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (26,'TNA','Thane','Thane','Maharashtra','CR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (27,'KYN','Kalyan Junction','Kalyan','Maharashtra','CR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (28,'LNL','Lonavala','Lonavala','Maharashtra','CR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (29,'PUNE','Pune Junction','Pune','Maharashtra','CR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (30,'KGP','Kharagpur Junction','Kharagpur','West Bengal','SER',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (31,'CTC','Cuttack Junction','Cuttack','Odisha','ECoR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (32,'BBS','Bhubaneswar','Bhubaneswar','Odisha','ECoR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (33,'VSKP','Visakhapatnam Junction','Visakhapatnam','Andhra Pradesh','ECoR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (34,'BZA','Vijayawada Junction','Vijayawada','Andhra Pradesh','SCR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (35,'MAS','MGR Chennai Central','Chennai','Tamil Nadu','SR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (36,'SBC','KSR Bengaluru City Junction','Bengaluru','Karnataka','SWR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (37,'ADI','Ahmedabad Junction','Ahmedabad','Gujarat','WR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (38,'JP','Jaipur Junction','Jaipur','Rajasthan','NWR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (39,'LKO','Lucknow Charbagh','Lucknow','Uttar Pradesh','NR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00'),
        (40,'BSB','Varanasi Junction','Varanasi','Uttar Pradesh','NR',1,'2026-08-01 10:00:00','2026-08-01 10:00:00')
    ]
    write_batch(out, "stations",
                ["station_id","station_code","station_name","city","state","zone","is_active","created_at","updated_at"],
                stations)

    # 2. Coach Classes (6 classes)
    print("Writing coach classes (6)...")
    coach_classes = [
        (1,'1A','First AC',1,1,1),
        (2,'2A','AC 2 Tier',1,1,3),
        (3,'3A','AC 3 Tier',1,1,4),
        (4,'SL','Sleeper',0,1,6),
        (5,'CC','AC Chair Car',1,0,5),
        (6,'EC','Executive Chair Car',1,0,2)
    ]
    write_batch(out, "coach_classes",
                ["class_id","class_code","class_name","is_ac","has_berths","display_order"],
                coach_classes)

    # 3. Fare Rules
    print("Writing fare rules (6)...")
    fare_rules = {
        1: {'per_km_rate': 2.55, 'min_distance_km': 300, 'reservation_charge': 60, 'superfast_charge': 75, 'gst_percent': 5.0, 'min_cancellation_charge': 240},
        2: {'per_km_rate': 1.50, 'min_distance_km': 300, 'reservation_charge': 50, 'superfast_charge': 45, 'gst_percent': 5.0, 'min_cancellation_charge': 200},
        3: {'per_km_rate': 1.05, 'min_distance_km': 300, 'reservation_charge': 40, 'superfast_charge': 45, 'gst_percent': 5.0, 'min_cancellation_charge': 180},
        4: {'per_km_rate': 0.42, 'min_distance_km': 200, 'reservation_charge': 20, 'superfast_charge': 30, 'gst_percent': 0.0, 'min_cancellation_charge': 120},
        5: {'per_km_rate': 1.20, 'min_distance_km': 250, 'reservation_charge': 40, 'superfast_charge': 45, 'gst_percent': 5.0, 'min_cancellation_charge': 180},
        6: {'per_km_rate': 2.40, 'min_distance_km': 250, 'reservation_charge': 60, 'superfast_charge': 75, 'gst_percent': 5.0, 'min_cancellation_charge': 240}
    }
    fare_rules_rows = [
        (k, v['per_km_rate'], v['min_distance_km'], v['reservation_charge'], v['superfast_charge'], v['gst_percent'], v['min_cancellation_charge'], '2026-08-01 10:00:00')
        for k, v in fare_rules.items()
    ]
    write_batch(out, "fare_rules",
                ["class_id","per_km_rate","min_distance_km","reservation_charge","superfast_charge","gst_percent","min_cancellation_charge","updated_at"],
                fare_rules_rows)

    # 4. Routes & 50 Trains
    print("Defining 25 route pairs and 50 trains...")
    route_pairs_def = [
        ("Mumbai Central - New Delhi Rajdhani Express", "RAJDHANI", "12951", "12952",
         [2, 3, 4, 5, 6, 1], [0, 263, 392, 653, 919, 1386]),
        ("Howrah - New Delhi Rajdhani Express", "RAJDHANI", "12301", "12302",
         [7, 8, 9, 10, 11, 12, 13, 1], [0, 200, 259, 458, 663, 816, 1010, 1451]),
        ("New Delhi - Rani Kamlapati Shatabdi Express", "SHATABDI", "12002", "12001",
         [1, 14, 15, 16, 17, 18], [0, 195, 313, 411, 703, 709]),
        ("Telangana Express", "SUPERFAST", "12723", "12724",
         [23, 24, 22, 21, 20, 19, 17, 16, 15, 14, 1], [0, 9, 141, 376, 584, 882, 974, 1266, 1364, 1482, 1677]),
        ("Mumbai CSMT - Pune Intercity Express", "SUPERFAST", "12127", "12128",
         [25, 26, 27, 28, 29], [0, 34, 54, 128, 192]),
        ("Howrah - Chennai Mail", "MAIL_EXPRESS", "12839", "12840",
         [7, 30, 31, 32, 33, 34, 35], [0, 115, 409, 437, 881, 1230, 1661]),
        ("New Delhi - Lucknow Shatabdi Express", "SHATABDI", "12003", "12004",
         [1, 13, 39], [0, 440, 512]),
        ("New Delhi - Varanasi Vande Bharat Express", "VANDE_BHARAT", "22435", "22436",
         [1, 13, 12, 40], [0, 440, 635, 759]),
        ("Mumbai Central - Ahmedabad Vande Bharat Express", "VANDE_BHARAT", "20901", "20902",
         [2, 3, 4, 37], [0, 263, 392, 492]),
        ("New Delhi - Jaipur Vande Bharat Express", "VANDE_BHARAT", "20977", "20978",
         [1, 38], [0, 304]),
        ("Howrah - Patna Vande Bharat Express", "VANDE_BHARAT", "22347", "22348",
         [7, 8, 10, 11], [0, 200, 458, 663]),
        ("Chennai - Bengaluru Shatabdi Express", "SHATABDI", "12027", "12028",
         [35, 36], [0, 358]),
        ("Secunderabad - Visakhapatnam Vande Bharat Express", "VANDE_BHARAT", "20833", "20834",
         [24, 22, 34, 33], [0, 132, 349, 699]),
        ("Mumbai CSMT - Nagpur Duronto Express", "DURONTO", "12289", "12290",
         [25, 27, 20], [0, 54, 837]),
        ("Karnataka Express", "SUPERFAST", "12627", "12628",
         [1, 14, 15, 16, 17, 19, 20, 21, 22, 24, 36], [0, 195, 313, 411, 703, 795, 1093, 1301, 1537, 1673, 2406]),
        ("Gitanjali Express", "SUPERFAST", "12859", "12860",
         [7, 30, 20, 27, 25], [0, 115, 1029, 1914, 1968]),
        ("Tamil Nadu Express", "SUPERFAST", "12621", "12622",
         [1, 14, 15, 16, 17, 19, 20, 21, 34, 35], [0, 195, 313, 411, 703, 795, 1093, 1301, 1756, 2182]),
        ("Ahmedabad - New Delhi Rajdhani Express", "RAJDHANI", "12957", "12958",
         [37, 38, 1], [0, 625, 929]),
        ("Pushpak Express", "SUPERFAST", "12533", "12534",
         [39, 13, 16, 17, 19, 27, 25], [0, 72, 292, 584, 676, 1373, 1427]),
        ("Howrah - Bhubaneswar Jan Shatabdi Express", "SHATABDI", "12073", "12074",
         [7, 30, 31, 32], [0, 115, 409, 437]),
        ("Pune - Secunderabad Shatabdi Express", "SHATABDI", "12025", "12026",
         [29, 24], [0, 597]),
        ("Mahanagari Express", "SUPERFAST", "22177", "22178",
         [40, 12, 16, 17, 19, 27, 25], [0, 124, 396, 688, 780, 1477, 1531]),
        ("Rani Kamlapati - New Delhi Vande Bharat Express", "VANDE_BHARAT", "20171", "20172",
         [18, 17, 16, 15, 14, 1], [0, 6, 298, 396, 514, 709]),
        ("Bengaluru - Hyderabad Kacheguda Express", "SUPERFAST", "12785", "12786",
         [36, 24, 23], [0, 610, 619]),
        ("Pinakini Express", "SUPERFAST", "12711", "12712",
         [35, 34], [0, 431])
    ]

    routes_rows = []
    route_stations_rows = []
    trains_rows = []
    train_schedules_rows = []
    route_info = {} # route_id -> list of (stop_seq, station_id, distance_km)

    train_id_counter = 1
    route_id_counter = 1

    for pair_idx, (name, ttype, num1, num2, stn_fwd, dist_fwd) in enumerate(route_pairs_def, 1):
        # Forward route
        r_fwd_id = route_id_counter
        route_id_counter += 1
        t_fwd_id = train_id_counter
        train_id_counter += 1

        orig_fwd = stn_fwd[0]
        dest_fwd = stn_fwd[-1]
        rcode_fwd = f"R{r_fwd_id:03d}-{num1}"
        rname_fwd = f"{name} (Down)"
        routes_rows.append((r_fwd_id, rcode_fwd, rname_fwd, orig_fwd, dest_fwd, '2026-08-01 10:00:00', '2026-08-01 10:00:00'))

        fwd_stops = []
        for s_idx, (s_id, dist) in enumerate(zip(stn_fwd, dist_fwd), 1):
            route_stations_rows.append((r_fwd_id, s_idx, s_id, dist))
            fwd_stops.append((s_idx, s_id, dist))
        route_info[r_fwd_id] = fwd_stops

        trains_rows.append((t_fwd_id, num1, name, ttype, r_fwd_id, 1, 1, 1, 1, 1, 1, 1, 1, '2026-08-01 10:00:00', '2026-08-01 10:00:00'))

        total_dist_fwd = dist_fwd[-1]
        for s_idx, s_id, dist in fwd_stops:
            if s_idx == 1:
                arr = None
                dep = '06:00:00'
                day_off = 0
            elif s_idx == len(fwd_stops):
                hrs = int((dist / 75.0) + 6)
                arr = f"{hrs%24:02d}:30:00"
                dep = None
                day_off = min(3, hrs // 24)
            else:
                hrs = int((dist / 75.0) + 6)
                arr = f"{hrs%24:02d}:15:00"
                dep = f"{hrs%24:02d}:25:00"
                day_off = min(3, hrs // 24)
            train_schedules_rows.append((t_fwd_id, r_fwd_id, s_idx, arr, dep, day_off))

        # Reverse route
        r_rev_id = route_id_counter
        route_id_counter += 1
        t_rev_id = train_id_counter
        train_id_counter += 1

        stn_rev = list(reversed(stn_fwd))
        dist_rev = [0] + [total_dist_fwd - d for d in reversed(dist_fwd[:-1])]

        orig_rev = stn_rev[0]
        dest_rev = stn_rev[-1]
        rcode_rev = f"R{r_rev_id:03d}-{num2}"
        rname_rev = f"{name} (Up)"
        routes_rows.append((r_rev_id, rcode_rev, rname_rev, orig_rev, dest_rev, '2026-08-01 10:00:00', '2026-08-01 10:00:00'))

        rev_stops = []
        for s_idx, (s_id, dist) in enumerate(zip(stn_rev, dist_rev), 1):
            route_stations_rows.append((r_rev_id, s_idx, s_id, dist))
            rev_stops.append((s_idx, s_id, dist))
        route_info[r_rev_id] = rev_stops

        trains_rows.append((t_rev_id, num2, name, ttype, r_rev_id, 1, 1, 1, 1, 1, 1, 1, 1, '2026-08-01 10:00:00', '2026-08-01 10:00:00'))

        for s_idx, s_id, dist in rev_stops:
            if s_idx == 1:
                arr = None
                dep = '14:00:00'
                day_off = 0
            elif s_idx == len(rev_stops):
                hrs = int((dist / 75.0) + 14)
                arr = f"{hrs%24:02d}:30:00"
                dep = None
                day_off = min(3, hrs // 24)
            else:
                hrs = int((dist / 75.0) + 14)
                arr = f"{hrs%24:02d}:15:00"
                dep = f"{hrs%24:02d}:25:00"
                day_off = min(3, hrs // 24)
            train_schedules_rows.append((t_rev_id, r_rev_id, s_idx, arr, dep, day_off))

    print(f"Writing routes ({len(routes_rows)})...")
    write_batch(out, "routes", ["route_id","route_code","route_name","origin_station_id","destination_station_id","created_at","updated_at"], routes_rows)

    print(f"Writing route_stations ({len(route_stations_rows)})...")
    write_batch(out, "route_stations", ["route_id","stop_seq","station_id","distance_km"], route_stations_rows)

    print(f"Writing trains ({len(trains_rows)})...")
    write_batch(out, "trains", ["train_id","train_number","train_name","train_type","route_id","runs_mon","runs_tue","runs_wed","runs_thu","runs_fri","runs_sat","runs_sun","is_active","created_at","updated_at"], trains_rows)

    print(f"Writing train_schedules ({len(train_schedules_rows)})...")
    write_batch(out, "train_schedules", ["train_id","route_id","stop_seq","arrival_time","departure_time","day_offset"], train_schedules_rows)

    # 5. Coaches & Seats
    print("Generating coaches and physical seats...")
    coaches_rows = []
    seats_rows = []
    coach_id_counter = 1
    seat_id_counter = 1

    train_classes_map = {}
    train_class_seats = {}

    for t_row in trains_rows:
        tid = t_row[0]
        ttype = t_row[3]
        t_classes = set()

        if ttype == 'RAJDHANI':
            c_specs = [(1, 'H1', 24, ['LB','UB'])] + \
                      [(2, f'A{i}', 48, ['LB','UB','SL','SU']) for i in range(1, 4)] + \
                      [(3, f'B{i}', 64, ['LB','MB','UB','SL','SU']) for i in range(1, 9)]
        elif ttype in ('SHATABDI', 'VANDE_BHARAT'):
            c_specs = [(6, f'E{i}', 56, ['AS','WS']) for i in range(1, 3)] + \
                      [(5, f'C{i}', 78, ['AS','MS','WS']) for i in range(1, 11)]
        elif ttype == 'DURONTO':
            c_specs = [(1, 'H1', 24, ['LB','UB'])] + \
                      [(2, f'A{i}', 48, ['LB','UB','SL','SU']) for i in range(1, 3)] + \
                      [(3, f'B{i}', 64, ['LB','MB','UB','SL','SU']) for i in range(1, 7)] + \
                      [(4, f'S{i}', 72, ['LB','MB','UB','SL','SU']) for i in range(1, 5)]
        elif ttype == 'SUPERFAST':
            c_specs = [(2, f'A{i}', 48, ['LB','UB','SL','SU']) for i in range(1, 3)] + \
                      [(3, f'B{i}', 64, ['LB','MB','UB','SL','SU']) for i in range(1, 7)] + \
                      [(4, f'S{i}', 72, ['LB','MB','UB','SL','SU']) for i in range(1, 9)]
        else: # MAIL_EXPRESS
            c_specs = [(2, 'A1', 48, ['LB','UB','SL','SU'])] + \
                      [(3, f'B{i}', 64, ['LB','MB','UB','SL','SU']) for i in range(1, 5)] + \
                      [(4, f'S{i}', 72, ['LB','MB','UB','SL','SU']) for i in range(1, 10)]

        for pos, (cid, label, seat_count, berths) in enumerate(c_specs, 1):
            cur_cid = coach_id_counter
            coach_id_counter += 1
            t_classes.add(cid)
            coaches_rows.append((cur_cid, tid, cid, label, pos))

            if (tid, cid) not in train_class_seats:
                train_class_seats[(tid, cid)] = []

            for s_num in range(1, seat_count + 1):
                cur_sid = seat_id_counter
                seat_id_counter += 1
                b_type = berths[(s_num - 1) % len(berths)]
                seats_rows.append((cur_sid, cur_cid, s_num, b_type))
                train_class_seats[(tid, cid)].append(cur_sid)

        train_classes_map[tid] = sorted(list(t_classes))

    print(f"Writing coaches ({len(coaches_rows)})...")
    write_batch(out, "coaches", ["coach_id","train_id","class_id","coach_label","coach_position"], coaches_rows)

    print(f"Writing seats ({len(seats_rows)})...")
    write_batch(out, "seats", ["seat_id","coach_id","seat_number","berth_type"], seats_rows)

    # 6. Train Runs
    print("Generating train runs...")
    train_runs_rows = []
    run_id_counter = 1
    base_date = datetime(2026, 8, 1)

    for tid in range(1, args.trains + 1):
        for d_offset in range(args.days):
            cur_date = base_date + timedelta(days=d_offset)
            date_str = cur_date.strftime("%Y-%m-%d")

            if cur_date < datetime(2026, 10, 9):
                status = 'CANCELLED' if (tid == 5 and d_offset % 20 == 0) else 'COMPLETED'
            elif cur_date == datetime(2026, 10, 9):
                status = 'CHART_PREPARED'
            else:
                status = 'CANCELLED' if (tid == 12 and d_offset % 25 == 0) else 'SCHEDULED'

            cur_run_id = run_id_counter
            run_id_counter += 1
            train_runs_rows.append((cur_run_id, tid, date_str, status, '2026-08-01 10:00:00', '2026-08-01 10:00:00'))

    print(f"Writing train_runs ({len(train_runs_rows)})...")
    write_batch(out, "train_runs", ["run_id","train_id","journey_date","status","created_at","updated_at"], train_runs_rows)

    # 7. Users & Profiles (Admins, Staff, 5,000 Passengers)
    print("Generating users and passenger profiles...")
    users_rows = []
    passenger_profiles_rows = []
    staff_profiles_rows = []

    pwd_hash = "$2b$10$ZWokExAMphc2HT8H7ud6.ev4.09BWa6lEWWz91UfKc2mv03nyrgzG"

    users_rows.append((1, 'Kartik Gaikwad', 'admin.kartik@example.com', '7881399869', pwd_hash, 'ADMIN', 1, '2026-10-09 09:12:00', '2026-03-01 10:00:00', '2026-03-01 10:00:00'))
    users_rows.append((2, 'Railway Admin', 'admin@example.com', '6309114170', pwd_hash, 'ADMIN', 1, '2026-10-08 19:56:42', '2026-03-01 10:00:00', '2026-03-01 10:00:00'))

    staff_names = ['Asha Shinde', 'Sunita Bose', 'Kavya Mukherjee', 'Vikram Patel', 'Geeta Tiwari', 'Revathi Singh', 'Fatima Joshi', 'Murali Chatterjee']
    for s_idx, sname in enumerate(staff_names, 3):
        phone = f"7556815{s_idx:03d}"
        email = f"{sname.lower().replace(' ', '.')}@example.com"
        users_rows.append((s_idx, sname, email, phone, pwd_hash, 'STAFF', 1, '2026-10-08 12:00:00', '2026-03-02 11:00:00', '2026-03-02 11:00:00'))
        staff_profiles_rows.append((s_idx, f"EMP{s_idx:04d}", "Station Superintendent", (s_idx % 40) + 1, '2024-01-15', '2026-03-02 11:00:00'))

    first_names = [
        'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Muhammad', 'Sai', 'Arnav', 'Aayan',
        'Krishna', 'Ishan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Aryan', 'Dhruv', 'Kabir', 'Ritvik',
        'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Pari', 'Kiara', 'Myra', 'Riya', 'Anaya', 'Ira',
        'Fatima', 'Prisha', 'Sara', 'Yashvi', 'Aanya', 'Farhan', 'Sneha', 'Rohan', 'Pooja', 'Amit',
        'Priya', 'Deepa', 'Suresh', 'Ramesh', 'Rajesh', 'Sunita', 'Geeta', 'Vikram', 'Kavya', 'Murali'
    ]
    last_names = [
        'Sharma', 'Verma', 'Gupta', 'Patel', 'Mehta', 'Shah', 'Singh', 'Kumar', 'Rao', 'Reddy',
        'Nair', 'Iyer', 'Chatterjee', 'Banerjee', 'Mukherjee', 'Das', 'Ghosh', 'Joshi', 'Kulkarni', 'Patil',
        'Deshmukh', 'Gaikwad', 'Shinde', 'Yadav', 'Chauhan', 'Mishra', 'Pandey', 'Tiwari', 'Agarwal', 'Jain'
    ]
    cities_states = [
        ('New Delhi', 'Delhi', '110001'), ('Mumbai', 'Maharashtra', '400001'),
        ('Kolkata', 'West Bengal', '700001'), ('Chennai', 'Tamil Nadu', '600001'),
        ('Bengaluru', 'Karnataka', '560001'), ('Hyderabad', 'Telangana', '500001'),
        ('Ahmedabad', 'Gujarat', '380001'), ('Pune', 'Maharashtra', '411001'),
        ('Jaipur', 'Rajasthan', '302001'), ('Lucknow', 'Uttar Pradesh', '226001')
    ]
    id_types = ['AADHAAR', 'PAN', 'PASSPORT', 'VOTER_ID', 'DRIVING_LICENCE']

    for p_idx in range(1, args.passengers + 1):
        uid = 10 + p_idx
        fn = first_names[(p_idx - 1) % len(first_names)]
        ln = last_names[((p_idx - 1) // len(first_names)) % len(last_names)]
        full_name = f"{fn} {ln}"
        email = f"{fn.lower()}.{ln.lower()}{p_idx}@example.com"
        phone = f"{6000000000 + p_idx}"

        users_rows.append((uid, full_name, email, phone, pwd_hash, 'PASSENGER', 1, None, '2026-06-01 10:00:00', '2026-06-01 10:00:00'))

        r_age = random.random()
        if r_age < 0.15:
            birth_year = random.randint(2009, 2024)
        elif r_age < 0.85:
            birth_year = random.randint(1967, 2008)
        else:
            birth_year = random.randint(1945, 1966)
        dob = f"{birth_year}-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
        gender = 'F' if (p_idx % 2 == 0) else 'M'
        city, state, pin_prefix = cities_states[p_idx % len(cities_states)]
        pincode = f"{pin_prefix[:4]}{(p_idx % 80) + 10:02d}"
        id_type = id_types[p_idx % len(id_types)]
        id_num = f"XXXX-XXXX-{(p_idx % 9000) + 1000}"

        passenger_profiles_rows.append((uid, dob, gender, id_type, id_num, f"{p_idx}, Railway Colony", city, state, pincode, '2026-06-01 10:00:00'))

    print(f"Writing users ({len(users_rows)})...")
    write_batch(out, "users", ["user_id","full_name","email","phone","password_hash","role","is_active","last_login_at","created_at","updated_at"], users_rows)

    print(f"Writing staff_profiles ({len(staff_profiles_rows)})...")
    write_batch(out, "staff_profiles", ["user_id","employee_code","designation","station_id","joined_on","updated_at"], staff_profiles_rows)

    print(f"Writing passenger_profiles ({len(passenger_profiles_rows)})...")
    write_batch(out, "passenger_profiles", ["user_id","date_of_birth","gender","id_proof_type","id_proof_number","address","city","state","pincode","updated_at"], passenger_profiles_rows)

    # 8. Bookings, Passengers, WL, Payments, Cancellations, Refunds
    print(f"Generating {args.bookings:,} bookings & passengers...")
    bookings_rows = []
    bp_rows = []
    wl_rows = []
    payments_rows = []
    cancellations_rows = []
    refunds_rows = []

    bp_id_counter = 1
    wl_id_counter = 1
    payment_id_counter = 1
    cancellation_id_counter = 1
    refund_id_counter = 1

    occupied_seats = {}
    wl_counters = {}

    train_types = {t[0]: t[3] for t in trains_rows}
    train_routes = {t[0]: t[4] for t in trains_rows}

    active_runs = [r for r in train_runs_rows if r[3] != 'CANCELLED']

    for b_idx in range(1, args.bookings + 1):
        b_run = active_runs[b_idx % len(active_runs)]
        run_id = b_run[0]
        train_id = b_run[1]
        j_date_str = b_run[2]
        route_id = train_routes[train_id]
        stops = route_info[route_id]
        ttype = train_types[train_id]

        num_stops = len(stops)
        f_idx = random.randint(0, num_stops - 2)
        t_idx = random.randint(f_idx + 1, num_stops - 1)
        from_stop = stops[f_idx]
        to_stop = stops[t_idx]

        from_seq = from_stop[0]
        from_stn = from_stop[1]
        to_seq = to_stop[0]
        to_stn = to_stop[1]

        distance = to_stop[2] - from_stop[2]
        avail_classes = train_classes_map[train_id]
        class_id = random.choice(avail_classes)
        c_rule = fare_rules[class_id]

        chargeable_dist = max(distance, c_rule['min_distance_km'])
        base_fare = chargeable_dist * c_rule['per_km_rate']
        sf_charge = c_rule['superfast_charge'] if ttype != 'MAIL_EXPRESS' else 0
        subtotal = base_fare + c_rule['reservation_charge'] + sf_charge
        single_fare = math.ceil(round(subtotal * (1 + c_rule['gst_percent'] / 100.0), 2) / 5.0) * 5.0

        r_status = random.random()
        if r_status < 0.85:
            b_status = 'BOOKED'
        elif r_status < 0.92:
            b_status = 'CANCELLED'
        elif r_status < 0.95:
            b_status = 'PARTIALLY_CANCELLED'
        elif r_status < 0.98:
            b_status = 'PENDING_PAYMENT'
        else:
            b_status = 'PAYMENT_FAILED'

        pnr = f"{random.randint(1000000000, 9999999999)}"
        passenger_uid = 10 + ((b_idx * 17) % args.passengers) + 1

        j_date = datetime.strptime(j_date_str, "%Y-%m-%d")
        booked_date = j_date - timedelta(days=random.randint(2, 45), hours=random.randint(1, 12))
        booked_str = booked_date.strftime("%Y-%m-%d %H:%M:%S")

        bookings_rows.append((b_idx, pnr, passenger_uid, run_id, class_id, from_stn, to_stn, from_seq, to_seq, b_status, booked_str, booked_str))

        if b_status == 'PARTIALLY_CANCELLED':
            num_travellers = random.choices([2, 3, 4], weights=[60, 25, 15])[0]
        else:
            num_travellers = random.choices([1, 2, 3, 4], weights=[50, 32, 12, 6])[0]

        booking_total = single_fare * num_travellers
        class_seats = train_class_seats.get((train_id, class_id), [])

        # Simulate busy train runs having waiting lists (~4% of active bookings or 1A on peak days)
        force_wl = (b_idx % 25 == 0)

        for t_i in range(num_travellers):
            cur_bp_id = bp_id_counter
            bp_id_counter += 1

            p_name = f"{first_names[(cur_bp_id * 3) % len(first_names)]} {last_names[(cur_bp_id * 7) % len(last_names)]}"
            p_age = random.randint(5, 75)
            p_gender = 'F' if (cur_bp_id % 2 == 0) else 'M'
            p_pref = 'LB' if p_age > 60 else random.choice(['LB','MB','UB','SL','SU','WS','AS','NONE'])

            if b_status == 'PAYMENT_FAILED':
                bp_status = 'CAN'
                assigned_seat = None
            elif b_status == 'CANCELLED':
                bp_status = 'CAN'
                assigned_seat = class_seats[(cur_bp_id) % len(class_seats)] if class_seats else None
            elif b_status == 'PARTIALLY_CANCELLED' and t_i == 0:
                bp_status = 'CAN'
                assigned_seat = class_seats[(cur_bp_id) % len(class_seats)] if class_seats else None
            elif force_wl:
                bp_status = 'WL'
                assigned_seat = None
            else:
                assigned_seat = None
                for candidate_sid in class_seats:
                    intervals = occupied_seats.get((run_id, candidate_sid), [])
                    overlap = False
                    for (f, t) in intervals:
                        if f < to_seq and from_seq < t:
                            overlap = True
                            break
                    if not overlap:
                        assigned_seat = candidate_sid
                        if (run_id, candidate_sid) not in occupied_seats:
                            occupied_seats[(run_id, candidate_sid)] = []
                        occupied_seats[(run_id, candidate_sid)].append((from_seq, to_seq))
                        break

                if assigned_seat is not None:
                    bp_status = 'CNF'
                else:
                    bp_status = 'WL'

            bp_rows.append((cur_bp_id, b_idx, p_name, p_age, p_gender, p_pref, assigned_seat, bp_status, single_fare, booked_str, booked_str))

            if bp_status == 'WL':
                wl_num = wl_counters.get((run_id, class_id), 0) + 1
                wl_counters[(run_id, class_id)] = wl_num
                cur_wl_id = wl_id_counter
                wl_id_counter += 1
                wl_rows.append((cur_wl_id, cur_bp_id, run_id, class_id, wl_num, 'WAITING', booked_str, None))

            if bp_status == 'CAN' and b_status != 'PAYMENT_FAILED':
                cur_can_id = cancellation_id_counter
                cancellation_id_counter += 1

                charge = min(single_fare, c_rule['min_cancellation_charge'])
                refund_amt = single_fare - charge
                can_time = (booked_date + timedelta(hours=random.randint(1, 24))).strftime("%Y-%m-%d %H:%M:%S")

                cancellations_rows.append((cur_can_id, cur_bp_id, passenger_uid, 'Change of plans', charge, refund_amt, can_time))

                if refund_amt > 0:
                    cur_ref_id = refund_id_counter
                    refund_id_counter += 1
                    ref_status = 'PROCESSED' if j_date < datetime(2026, 10, 9) else 'PENDING'
                    proc_time = (datetime.strptime(can_time, "%Y-%m-%d %H:%M:%S") + timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S") if ref_status == 'PROCESSED' else None
                    refunds_rows.append((cur_ref_id, payment_id_counter, cur_can_id, refund_amt, ref_status, can_time, proc_time))

        cur_pay_id = payment_id_counter
        payment_id_counter += 1

        if b_status in ('BOOKED', 'CANCELLED', 'PARTIALLY_CANCELLED'):
            pay_status = 'SUCCESS'
            paid_str = (booked_date + timedelta(minutes=2)).strftime("%Y-%m-%d %H:%M:%S")
        elif b_status == 'PAYMENT_FAILED':
            pay_status = 'FAILED'
            paid_str = None
        else: # PENDING_PAYMENT
            pay_status = 'INITIATED'
            paid_str = None

        method = random.choice(['UPI', 'CARD', 'NET_BANKING', 'WALLET'])
        txn_ref = f"TXN{b_idx:08d}"
        payments_rows.append((cur_pay_id, b_idx, booking_total, method, pay_status, txn_ref, booked_str, paid_str))

        if b_idx % 10000 == 0:
            print(f"  Processed {b_idx:,} / {args.bookings:,} bookings...")

    print(f"Writing bookings ({len(bookings_rows):,})...")
    write_batch(out, "bookings", ["booking_id","pnr","user_id","run_id","class_id","from_station_id","to_station_id","from_seq","to_seq","status","booked_at","updated_at"], bookings_rows)

    print(f"Writing booking_passengers ({len(bp_rows):,})...")
    write_batch(out, "booking_passengers", ["bp_id","booking_id","passenger_name","age","gender","berth_preference","seat_id","status","fare","created_at","updated_at"], bp_rows)

    print(f"Writing waiting_list ({len(wl_rows):,})...")
    write_batch(out, "waiting_list", ["wl_id","bp_id","run_id","class_id","wl_number","status","created_at","resolved_at"], wl_rows)

    print(f"Writing payments ({len(payments_rows):,})...")
    write_batch(out, "payments", ["payment_id","booking_id","amount","method","status","txn_ref","created_at","paid_at"], payments_rows)

    print(f"Writing cancellations ({len(cancellations_rows):,})...")
    write_batch(out, "cancellations", ["cancellation_id","bp_id","cancelled_by","reason","cancellation_charge","refund_amount","cancelled_at"], cancellations_rows)

    print(f"Writing refunds ({len(refunds_rows):,})...")
    write_batch(out, "refunds", ["refund_id","payment_id","cancellation_id","amount","status","created_at","processed_at"], refunds_rows)

    # Footer
    out.write("\nCOMMIT;\n")
    out.write("SET FOREIGN_KEY_CHECKS = 1;\n")
    out.write("SET UNIQUE_CHECKS = 1;\n")
    out.close()

    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Successfully generated {output_path} ({file_size_mb:.2f} MB)")
    print("Done!")

if __name__ == "__main__":
    main()
