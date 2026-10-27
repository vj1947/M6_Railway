#!/usr/bin/env python3
import random
import math
from datetime import datetime, timedelta

print("Testing route & train generation...")
# 40 stations
stations = [
    (1,'NDLS','New Delhi','New Delhi','Delhi','NR'),
    (2,'BCT','Mumbai Central','Mumbai','Maharashtra','WR'),
    (3,'ST','Surat','Surat','Gujarat','WR'),
    (4,'BRC','Vadodara Junction','Vadodara','Gujarat','WR'),
    (5,'RTM','Ratlam Junction','Ratlam','Madhya Pradesh','WR'),
    (6,'KOTA','Kota Junction','Kota','Rajasthan','WCR'),
    (7,'HWH','Howrah Junction','Howrah','West Bengal','ER'),
    (8,'ASN','Asansol Junction','Asansol','West Bengal','ER'),
    (9,'DHN','Dhanbad Junction','Dhanbad','Jharkhand','ECR'),
    (10,'GAYA','Gaya Junction','Gaya','Bihar','ECR'),
    (11,'DDU','Pt. Deen Dayal Upadhyaya Junction','Pt. DDU Nagar','Uttar Pradesh','ECR'),
    (12,'PRYJ','Prayagraj Junction','Prayagraj','Uttar Pradesh','NCR'),
    (13,'CNB','Kanpur Central','Kanpur','Uttar Pradesh','NCR'),
    (14,'AGC','Agra Cantt','Agra','Uttar Pradesh','NCR'),
    (15,'GWL','Gwalior Junction','Gwalior','Madhya Pradesh','NCR'),
    (16,'VGLJ','Virangana Lakshmibai Jhansi Junction','Jhansi','Uttar Pradesh','NCR'),
    (17,'BPL','Bhopal Junction','Bhopal','Madhya Pradesh','WCR'),
    (18,'RKMP','Rani Kamlapati','Bhopal','Madhya Pradesh','WCR'),
    (19,'ET','Itarsi Junction','Itarsi','Madhya Pradesh','WCR'),
    (20,'NGP','Nagpur Junction','Nagpur','Maharashtra','CR'),
    (21,'BPQ','Balharshah Junction','Balharshah','Maharashtra','CR'),
    (22,'KZJ','Kazipet Junction','Hanamkonda','Telangana','SCR'),
    (23,'HYB','Hyderabad Deccan','Hyderabad','Telangana','SCR'),
    (24,'SC','Secunderabad Junction','Secunderabad','Telangana','SCR'),
    (25,'CSMT','Chhatrapati Shivaji Maharaj Terminus','Mumbai','Maharashtra','CR'),
    (26,'TNA','Thane','Thane','Maharashtra','CR'),
    (27,'KYN','Kalyan Junction','Kalyan','Maharashtra','CR'),
    (28,'LNL','Lonavala','Lonavala','Maharashtra','CR'),
    (29,'PUNE','Pune Junction','Pune','Maharashtra','CR'),
    (30,'KGP','Kharagpur Junction','Kharagpur','West Bengal','SER'),
    (31,'CTC','Cuttack Junction','Cuttack','Odisha','ECoR'),
    (32,'BBS','Bhubaneswar','Bhubaneswar','Odisha','ECoR'),
    (33,'VSKP','Visakhapatnam Junction','Visakhapatnam','Andhra Pradesh','ECoR'),
    (34,'BZA','Vijayawada Junction','Vijayawada','Andhra Pradesh','SCR'),
    (35,'MAS','MGR Chennai Central','Chennai','Tamil Nadu','SR'),
    (36,'SBC','KSR Bengaluru City Junction','Bengaluru','Karnataka','SWR'),
    (37,'ADI','Ahmedabad Junction','Ahmedabad','Gujarat','WR'),
    (38,'JP','Jaipur Junction','Jaipur','Rajasthan','NWR'),
    (39,'LKO','Lucknow Charbagh','Lucknow','Uttar Pradesh','NR'),
    (40,'BSB','Varanasi Junction','Varanasi','Uttar Pradesh','NR')
]

print(f"Loaded {len(stations)} stations successfully.")
