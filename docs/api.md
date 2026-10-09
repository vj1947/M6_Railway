# API reference

Generated from the running API, so every example below is a real response.
Base URL: `http://localhost:5000/api/v1` (the frontend calls it as `/api/v1`).

## Rules for every endpoint

- Send and receive JSON. Protected endpoints need `Authorization: Bearer <token>` from `POST /auth/login`.
- Every response has the same envelope:

```json
{ "success": true,  "data": { }, "error": null }
{ "success": false, "data": null, "error": { "code": "SEAT_UNAVAILABLE", "message": "No seats left in 3A" } }
```

- Stubs add `"meta": { "stub": true, "owner": "Group 4" }`. When you replace a stub, the `data` shape below **must stay the same**, because other groups' pages already read it. Remove `meta`.
- Dates are `YYYY-MM-DD`, date-times `YYYY-MM-DD HH:MM:SS` in IST, money is a number in rupees.
- Arrays in the examples are cut to 2 items.

| Status | When | Example codes |
| --- | --- | --- |
| 400 | Bad input | `MISSING_FIELDS`, `INVALID_DATE`, `INVALID_PNR`, `SAME_STATION`, `INVALID_DATA` |
| 401 | Not logged in | `NOT_LOGGED_IN`, `SESSION_EXPIRED`, `WRONG_CREDENTIALS` |
| 403 | Wrong role | `WRONG_ROLE`, `ACCOUNT_DISABLED` |
| 404 | Not found | `ROUTE_NOT_FOUND`, `PNR_NOT_FOUND` |
| 409 | Conflict | `DUPLICATE`, `SEAT_UNAVAILABLE`, `CHART_PREPARED`, `IN_USE` |
| 501 | Stored procedure still a stub | `NOT_IMPLEMENTED` |
| 503 | Database down | `DATABASE_UNAVAILABLE` |

Stored procedures raise errors as `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SEAT_UNAVAILABLE: No seats left in 3A';`
and the backend turns `CODE: message` into the right status automatically (see `backend/src/utils/errors.js`).


## Endpoints

| Group | Method | Path | Who | Status |
| --- | --- | --- | --- | --- |
| G1 | `POST` | `/auth/register` | Anyone | stub |
| G1 | `POST` | `/auth/login` | Anyone | working |
| G1 | `POST` | `/auth/logout` | Passenger | working |
| G1 | `GET` | `/users/me` | Passenger | working |
| G1 | `PUT` | `/users/me` | Passenger | stub |
| G1 | `PUT` | `/users/me/password` | Passenger | stub |
| G1 | `GET` | `/admin/users` | Admin | stub |
| G1 | `POST` | `/admin/staff` | Admin | stub |
| G1 | `PATCH` | `/admin/users/12` | Admin | stub |
| G2 | `GET` | `/trains` | Anyone | stub |
| G2 | `POST` | `/trains` | Admin | stub |
| G2 | `GET` | `/trains/1` | Anyone | stub |
| G2 | `PUT` | `/trains/1` | Admin | stub |
| G2 | `GET` | `/coach-classes` | Anyone | stub |
| G2 | `GET` | `/trains/1/coaches` | Anyone | stub |
| G2 | `POST` | `/trains/1/coaches` | Admin | stub |
| G2 | `GET` | `/coaches/7/seats` | Anyone | stub |
| G3 | `GET` | `/stations` | Anyone | working (reference example) |
| G3 | `POST` | `/stations` | Admin | stub |
| G3 | `GET` | `/stations/BPL/board` | Anyone | stub |
| G3 | `GET` | `/routes` | Anyone | stub |
| G3 | `POST` | `/routes` | Admin | stub |
| G3 | `POST` | `/routes/13/stations` | Admin | stub |
| G3 | `GET` | `/trains/1/schedule` | Anyone | stub |
| G3 | `PUT` | `/trains/1/schedule` | Admin | stub |
| G3 | `POST` | `/train-runs/generate` | Admin | stub |
| G3 | `PATCH` | `/train-runs/511/status` | Staff (or admin) | stub |
| G3 | `GET` | `/fare-rules` | Anyone | stub |
| G3 | `PUT` | `/fare-rules/3` | Admin | stub |
| G4 | `GET` | `/search/trains` | Anyone | stub (input checks are real) |
| G4 | `GET` | `/search/availability` | Anyone | stub |
| G4 | `GET` | `/search/fare` | Anyone | stub |
| G4 | `GET` | `/search/calendar` | Anyone | stub |
| G5 | `POST` | `/bookings` | Passenger | stub (input checks are real) |
| G5 | `GET` | `/bookings/my` | Passenger | stub |
| G5 | `GET` | `/bookings/4521876390` | Anyone | stub |
| G5 | `GET` | `/bookings/4521876390/ticket` | Passenger | stub |
| G5 | `GET` | `/runs/511/chart` | Staff (or admin) | stub |
| G5 | `POST` | `/counter/bookings` | Staff (or admin) | stub |
| G6 | `POST` | `/payments` | Passenger | stub |
| G6 | `POST` | `/payments/14730/verify` | Passenger | stub |
| G6 | `GET` | `/payments/my` | Passenger | stub |
| G6 | `POST` | `/bookings/4521876390/cancel` | Passenger | stub |
| G6 | `POST` | `/bookings/4521876390/cancel` | Passenger | stub |
| G6 | `GET` | `/refunds/my` | Passenger | stub |
| G6 | `PATCH` | `/refunds/2490` | Admin | stub |
| G6 | `GET` | `/waitlist/4521876390` | Anyone | stub |
| G7 | `GET` | `/admin/dashboard` | Admin | stub |
| G7 | `GET` | `/admin/reports/revenue` | Admin | stub |
| G7 | `GET` | `/admin/audit-logs` | Admin | stub |
| G7 | `GET` | `/admin/sql-showcase` | Admin | stub |

## Group 1 - User and authentication

### Register a passenger

`POST /auth/register`  
**Who:** Anyone. **Requirements:** FR-G1-01. **Now:** stub.

Request body:

```json
{
  "fullName": "Rohan Patil",
  "email": "rohan.patil@example.com",
  "phone": "9822012345",
  "password": "Secret@123"
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "userId": 211,
    "fullName": "Rohan Patil",
    "email": "rohan.patil@example.com",
    "role": "PASSENGER"
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 1"
  }
}
```

### Log in

`POST /auth/login`  
**Who:** Anyone. **Requirements:** FR-G1-02. **Now:** working.

Request body:

```json
{
  "email": "farhan.gupta@example.com",
  "password": "Password@123"
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "token": "<JWT token>",
    "user": {
      "userId": 11,
      "fullName": "Farhan Gupta",
      "email": "farhan.gupta@example.com",
      "role": "PASSENGER"
    }
  },
  "error": null
}
```

### Log out

`POST /auth/logout`  
**Who:** Passenger. **Requirements:** FR-G1-03. **Now:** working.

Response `200`:

```json
{
  "success": true,
  "data": {
    "loggedOut": true
  },
  "error": null
}
```

### My profile

`GET /users/me`  
**Who:** Passenger. **Requirements:** FR-G1-05, FR-G1-08. **Now:** working.

Response `200`:

```json
{
  "success": true,
  "data": {
    "userId": 11,
    "fullName": "Sahil Gadam",
    "email": "sahil@example.com",
    "phone": "7205997283",
    "role": "PASSENGER",
    "lastLoginAt": "2026-10-09 15:46:16",
    "memberSince": "2026-06-15 08:08:06",
    "passenger": {
      "dateOfBirth": "1977-10-23",
      "gender": "M",
      "idProofType": "PASSPORT",
      "idProofNumber": "XXXX4162",
      "address": "70, Ashok Vihar",
      "city": "Chennai",
      "state": "Tamil Nadu",
      "pincode": "600076"
    },
    "staff": null
  },
  "error": null
}
```

### Update my profile

`PUT /users/me`  
**Who:** Passenger. **Requirements:** FR-G1-05. **Now:** stub.

Request body:

```json
{
  "city": "Pune",
  "pincode": "411005"
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "userId": 11,
    "fullName": "Farhan Gupta",
    "email": "farhan.gupta@example.com",
    "phone": "9876501234",
    "role": "PASSENGER",
    "passenger": {
      "dateOfBirth": "1994-03-12",
      "gender": "M",
      "idProofType": "AADHAAR",
      "idProofNumber": "XXXX-XXXX-4821",
      "address": "42, Shivaji Nagar",
      "city": "Pune",
      "state": "Maharashtra",
      "pincode": "411005"
    },
    "staff": null,
    "city": "Pune",
    "pincode": "411005"
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 1"
  }
}
```

### Change password

`PUT /users/me/password`  
**Who:** Passenger. **Requirements:** FR-G1-06. **Now:** stub.

Request body:

```json
{
  "currentPassword": "Password@123",
  "newPassword": "NewSecret@123"
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "passwordChanged": true
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 1"
  }
}
```

### List users (admin)

`GET /admin/users?role=PASSENGER&q=meera&page=1`  
**Who:** Admin. **Requirements:** FR-G1-09. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "page": 1,
    "pageSize": 20,
    "total": 210,
    "items": [
      {
        "userId": 1,
        "fullName": "Vansh Jaiswal",
        "email": "admin.vansh@example.com",
        "phone": "9000000001",
        "role": "ADMIN",
        "isActive": true
      },
      {
        "userId": 3,
        "fullName": "Asha Shinde",
        "email": "asha.shinde@example.com",
        "phone": "9812345670",
        "role": "STAFF",
        "isActive": true
      },
      "... 2 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 1"
  }
}
```

### Create staff account (admin)

`POST /admin/staff`  
**Who:** Admin. **Requirements:** FR-G1-07. **Now:** stub.

Request body:

```json
{
  "fullName": "Sunita Pawar",
  "email": "sunita.pawar@example.com",
  "phone": "9811122233",
  "employeeCode": "CR10512",
  "designation": "Booking Clerk",
  "stationId": 29
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "userId": 211,
    "role": "STAFF",
    "fullName": "Sunita Pawar",
    "email": "sunita.pawar@example.com",
    "phone": "9811122233",
    "employeeCode": "CR10512",
    "designation": "Booking Clerk",
    "stationId": 29
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 1"
  }
}
```

### Change role or deactivate (admin)

`PATCH /admin/users/12`  
**Who:** Admin. **Requirements:** FR-G1-09. **Now:** stub.

Request body:

```json
{
  "isActive": false
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "userId": 12,
    "isActive": false
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 1"
  }
}
```


## Group 2 - Train, coach and seat

### List trains

`GET /trains?q=rajdhani&page=1`  
**Who:** Anyone. **Requirements:** FR-G2-03. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "page": 1,
    "pageSize": 20,
    "total": 12,
    "items": [
      {
        "trainId": 1,
        "trainNumber": "12951",
        "trainName": "Mumbai Central - New Delhi Rajdhani Express",
        "trainType": "RAJDHANI",
        "from": "BCT",
        "to": "NDLS",
        "runningDays": [
          "MON",
          "TUE",
          "... 5 more"
        ],
        "classes": [
          "1A",
          "2A",
          "... 1 more"
        ],
        "isActive": true
      },
      {
        "trainId": 3,
        "trainNumber": "12301",
        "trainName": "Howrah - New Delhi Rajdhani Express",
        "trainType": "RAJDHANI",
        "from": "HWH",
        "to": "NDLS",
        "runningDays": [
          "MON",
          "TUE",
          "... 5 more"
        ],
        "classes": [
          "1A",
          "2A",
          "... 1 more"
        ],
        "isActive": true
      },
      "... 3 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 2"
  }
}
```

### Add a train (admin)

`POST /trains`  
**Who:** Admin. **Requirements:** FR-G2-01. **Now:** stub.

Request body:

```json
{
  "trainNumber": "22691",
  "trainName": "KSR Bengaluru - Hazrat Nizamuddin Rajdhani",
  "trainType": "RAJDHANI",
  "routeId": 13,
  "runningDays": [
    "MON",
    "WED",
    "FRI"
  ]
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "trainId": 13,
    "trainNumber": "22691",
    "trainName": "KSR Bengaluru - Hazrat Nizamuddin Rajdhani",
    "trainType": "RAJDHANI",
    "routeId": 13,
    "runningDays": [
      "MON",
      "WED",
      "... 1 more"
    ],
    "isActive": true
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 2"
  }
}
```

### Train detail with capacity

`GET /trains/1`  
**Who:** Anyone. **Requirements:** FR-G2-03, FR-G2-08. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "trainId": 1,
    "trainNumber": "12951",
    "trainName": "Mumbai Central - New Delhi Rajdhani Express",
    "trainType": "RAJDHANI",
    "route": {
      "routeId": 1,
      "routeCode": "BCT-NDLS-RAJ",
      "from": "BCT",
      "to": "NDLS",
      "stops": 6,
      "distanceKm": 1384
    },
    "runningDays": [
      "MON",
      "TUE",
      "... 5 more"
    ],
    "isActive": true,
    "capacity": [
      {
        "classCode": "1A",
        "coaches": 1,
        "seats": 24
      },
      {
        "classCode": "2A",
        "coaches": 4,
        "seats": 192
      },
      "... 1 more"
    ],
    "totalSeats": 856,
    "coaches": [
      {
        "coachId": 1,
        "coachLabel": "H1",
        "classCode": "1A",
        "coachPosition": 1,
        "seats": 24
      },
      {
        "coachId": 2,
        "coachLabel": "A1",
        "classCode": "2A",
        "coachPosition": 2,
        "seats": 48
      },
      "... 3 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 2"
  }
}
```

### Edit or deactivate a train (admin)

`PUT /trains/1`  
**Who:** Admin. **Requirements:** FR-G2-02. **Now:** stub.

Request body:

```json
{
  "isActive": false
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "trainId": 1,
    "isActive": false
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 2"
  }
}
```

### Travel classes

`GET /coach-classes`  
**Who:** Anyone. **Requirements:** FR-G2-04. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "classId": 1,
        "classCode": "1A",
        "className": "First AC",
        "isAc": true,
        "hasBerths": true
      },
      {
        "classId": 6,
        "classCode": "EC",
        "className": "Executive Chair Car",
        "isAc": true,
        "hasBerths": false
      },
      "... 4 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 2"
  }
}
```

### Coaches of a train

`GET /trains/1/coaches`  
**Who:** Anyone. **Requirements:** FR-G2-03. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "coachId": 1,
        "coachLabel": "H1",
        "classCode": "1A",
        "coachPosition": 1,
        "seats": 24
      },
      {
        "coachId": 2,
        "coachLabel": "A1",
        "classCode": "2A",
        "coachPosition": 2,
        "seats": 48
      },
      "... 3 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 2"
  }
}
```

### Add a coach (admin, seats are generated)

`POST /trains/1/coaches`  
**Who:** Admin. **Requirements:** FR-G2-05, FR-G2-06. **Now:** stub.

Request body:

```json
{
  "coachLabel": "B11",
  "classId": 3,
  "coachPosition": 16
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "coachId": 153,
    "trainId": 1,
    "coachLabel": "B11",
    "classId": 3,
    "coachPosition": 16,
    "seatsCreated": 64
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 2"
  }
}
```

### Seats of a coach

`GET /coaches/7/seats`  
**Who:** Anyone. **Requirements:** FR-G2-07. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "coachId": 7,
    "coachLabel": "B2",
    "classCode": "3A",
    "seats": [
      {
        "seatId": 400,
        "seatNumber": 1,
        "berthType": "LB"
      },
      {
        "seatId": 401,
        "seatNumber": 2,
        "berthType": "MB"
      },
      "... 62 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 2"
  }
}
```


## Group 3 - Station, route and schedule

### Search stations

`GET /stations?q=pune`  
**Who:** Anyone. **Requirements:** FR-G3-02. **Now:** working (reference example).

Response `200`:

```json
{
  "success": true,
  "data": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "items": [
      {
        "stationId": 29,
        "stationCode": "PUNE",
        "stationName": "Pune Junction",
        "city": "Pune",
        "state": "Maharashtra",
        "zone": "CR",
        "isActive": true
      }
    ]
  },
  "error": null
}
```

### Add a station (admin)

`POST /stations`  
**Who:** Admin. **Requirements:** FR-G3-01. **Now:** stub.

Request body:

```json
{
  "stationCode": "NK",
  "stationName": "Nashik Road",
  "city": "Nashik",
  "state": "Maharashtra",
  "zone": "CR"
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "stationId": 41,
    "stationCode": "NK",
    "stationName": "Nashik Road",
    "city": "Nashik",
    "state": "Maharashtra",
    "zone": "CR",
    "isActive": true
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 3"
  }
}
```

### Station arrivals and departures board

`GET /stations/BPL/board?date=2026-11-20`  
**Who:** Anyone. **Requirements:** FR-G3-11. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "stationCode": "BPL",
    "date": "2026-11-20",
    "items": [
      {
        "trainNumber": "12002",
        "trainName": "New Delhi - Rani Kamlapati Shatabdi Express",
        "from": "NDLS",
        "to": "RKMP",
        "arrival": "14:25",
        "departure": "14:30",
        "status": "SCHEDULED"
      },
      {
        "trainNumber": "12001",
        "trainName": "Rani Kamlapati - New Delhi Shatabdi Express",
        "from": "RKMP",
        "to": "NDLS",
        "arrival": "15:25",
        "departure": "15:30",
        "status": "SCHEDULED"
      },
      "... 1 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 3"
  }
}
```

### List routes

`GET /routes`  
**Who:** Anyone. **Requirements:** FR-G3-03. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "routeId": 1,
        "routeCode": "BCT-NDLS-RAJ",
        "routeName": "Mumbai Central to New Delhi (Rajdhani)",
        "origin": "BCT",
        "destination": "NDLS",
        "stops": 6,
        "distanceKm": 1384
      },
      {
        "routeId": 5,
        "routeCode": "NDLS-RKMP-SHT",
        "routeName": "New Delhi to Rani Kamlapati (Shatabdi)",
        "origin": "NDLS",
        "destination": "RKMP",
        "stops": 6,
        "distanceKm": 708
      },
      "... 1 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 3"
  }
}
```

### Create a route (admin)

`POST /routes`  
**Who:** Admin. **Requirements:** FR-G3-03. **Now:** stub.

Request body:

```json
{
  "routeCode": "SBC-NZM-RAJ",
  "routeName": "KSR Bengaluru to Hazrat Nizamuddin",
  "originStationId": 36,
  "destinationStationId": 1
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "routeId": 13,
    "routeCode": "SBC-NZM-RAJ",
    "routeName": "KSR Bengaluru to Hazrat Nizamuddin",
    "originStationId": 36,
    "destinationStationId": 1
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 3"
  }
}
```

### Add stops to a route (admin)

`POST /routes/13/stations`  
**Who:** Admin. **Requirements:** FR-G3-04. **Now:** stub.

Request body:

```json
{
  "stops": [
    {
      "stopSeq": 1,
      "stationId": 36,
      "distanceKm": 0
    },
    {
      "stopSeq": 2,
      "stationId": 23,
      "distanceKm": 610
    }
  ]
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "routeId": 13,
    "stops": [
      {
        "stopSeq": 1,
        "stationId": 36,
        "distanceKm": 0
      },
      {
        "stopSeq": 2,
        "stationId": 23,
        "distanceKm": 610
      }
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 3"
  }
}
```

### Train timetable

`GET /trains/1/schedule`  
**Who:** Anyone. **Requirements:** FR-G3-06. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "trainId": 1,
    "trainNumber": "12951",
    "trainName": "Mumbai Central - New Delhi Rajdhani Express",
    "stops": [
      {
        "stopSeq": 1,
        "stationCode": "BCT",
        "stationName": "Mumbai Central",
        "arrival": null,
        "departure": "17:00",
        "day": 1,
        "distanceKm": 0
      },
      {
        "stopSeq": 2,
        "stationCode": "ST",
        "stationName": "Surat",
        "arrival": "19:52",
        "departure": "19:55",
        "day": 1,
        "distanceKm": 263
      },
      "... 4 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 3"
  }
}
```

### Set a train timetable (admin)

`PUT /trains/1/schedule`  
**Who:** Admin. **Requirements:** FR-G3-05. **Now:** stub.

Request body:

```json
{
  "stops": [
    {
      "stopSeq": 1,
      "arrival": null,
      "departure": "17:00",
      "dayOffset": 0
    }
  ]
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "trainId": 1,
    "stops": [
      {
        "stopSeq": 1,
        "arrival": null,
        "departure": "17:00",
        "dayOffset": 0
      }
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 3"
  }
}
```

### Generate train runs (admin)

`POST /train-runs/generate`  
**Who:** Admin. **Requirements:** FR-G3-07. **Now:** stub.

Request body:

```json
{
  "trainId": 1,
  "fromDate": "2026-12-09",
  "toDate": "2027-01-08"
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "trainId": 1,
    "created": 31,
    "skippedExisting": 0,
    "skippedNotRunning": 0
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 3"
  }
}
```

### Change run status (staff or admin)

`PATCH /train-runs/511/status`  
**Who:** Staff (or admin). **Requirements:** FR-G3-08, FR-G3-09. **Now:** stub.

Request body:

```json
{
  "status": "CHART_PREPARED"
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "runId": 511,
    "status": "CHART_PREPARED"
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 3"
  }
}
```

### Fare rules

`GET /fare-rules`  
**Who:** Anyone. **Requirements:** FR-G3-10. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "classId": 1,
        "classCode": "1A",
        "perKmRate": 2.55,
        "minDistanceKm": 300,
        "reservationCharge": 60,
        "superfastCharge": 75,
        "gstPercent": 5,
        "minCancellationCharge": 240
      },
      {
        "classId": 6,
        "classCode": "EC",
        "perKmRate": 2.4,
        "minDistanceKm": 250,
        "reservationCharge": 60,
        "superfastCharge": 75,
        "gstPercent": 5,
        "minCancellationCharge": 240
      },
      "... 4 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 3"
  }
}
```

### Edit a fare rule (admin)

`PUT /fare-rules/3`  
**Who:** Admin. **Requirements:** FR-G3-10. **Now:** stub.

Request body:

```json
{
  "perKmRate": 1.1
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "classId": 3,
    "perKmRate": 1.1
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 3"
  }
}
```


## Group 4 - Search and availability

### Search trains

`GET /search/trains?from=NDLS&to=BPL&date=2026-11-20&class=3A`  
**Who:** Anyone. **Requirements:** FR-G4-01..05, 08. **Now:** stub (input checks are real).

Response `200`:

```json
{
  "success": true,
  "data": {
    "from": {
      "stationCode": "NDLS",
      "stationName": "New Delhi"
    },
    "to": {
      "stationCode": "BPL",
      "stationName": "Bhopal Junction"
    },
    "date": "2026-11-20",
    "trains": [
      {
        "runId": 511,
        "trainId": 8,
        "trainNumber": "12724",
        "trainName": "Telangana Express",
        "trainType": "SUPERFAST",
        "from": {
          "stationCode": "NDLS",
          "stationName": "New Delhi",
          "stopSeq": 1,
          "time": "17:30",
          "dayOffset": 0
        },
        "to": {
          "stationCode": "BPL",
          "stationName": "Bhopal Junction",
          "stopSeq": 5,
          "time": "03:35",
          "dayOffset": 1
        },
        "durationMinutes": 605,
        "distanceKm": 702,
        "bookable": true,
        "classes": [
          {
            "classId": 3,
            "classCode": "3A",
            "className": "AC 3 Tier",
            "fare": 865,
            "availability": {
              "status": "AVAILABLE",
              "count": 96
            }
          }
        ],
        "journeyDate": "2026-11-20"
      }
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 4"
  }
}
```

### Seat availability for a stretch

`GET /search/availability?runId=511&classId=3&fromSeq=1&toSeq=5`  
**Who:** Anyone. **Requirements:** FR-G4-06. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "runId": 511,
    "classId": 3,
    "fromSeq": 1,
    "toSeq": 5,
    "availableSeats": 96,
    "waitingCount": 0,
    "status": "AVAILABLE"
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 4"
  }
}
```

### Fare with breakup

`GET /search/fare?trainId=8&classId=3&fromSeq=1&toSeq=5`  
**Who:** Anyone. **Requirements:** FR-G4-07. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "trainId": 8,
    "classCode": "3A",
    "distanceKm": 702,
    "breakup": {
      "base": 737.1,
      "reservation": 40,
      "superfast": 45,
      "gst": 41.11,
      "rounding": 1.79
    },
    "total": 865
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 4"
  }
}
```

### 7-day availability calendar

`GET /search/calendar?trainId=8&classId=3&fromSeq=1&toSeq=5&startDate=2026-11-18`  
**Who:** Anyone. **Requirements:** FR-G4-10. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "trainId": 8,
    "classCode": "3A",
    "days": [
      {
        "date": "2026-11-18",
        "status": "AVAILABLE",
        "count": 212
      },
      {
        "date": "2026-11-19",
        "status": "AVAILABLE",
        "count": 164
      },
      "... 5 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 4"
  }
}
```


## Group 5 - Booking and ticket

### Book tickets (passenger)

`POST /bookings`  
**Who:** Passenger. **Requirements:** FR-G5-01..06. **Now:** stub (input checks are real).

Request body:

```json
{
  "runId": 511,
  "classId": 3,
  "fromSeq": 1,
  "toSeq": 5,
  "passengers": [
    {
      "name": "Kartik Gaikwad",
      "age": 21,
      "gender": "M",
      "berthPreference": "LB"
    },
    {
      "name": "Ananya Gaikwad",
      "age": 19,
      "gender": "F",
      "berthPreference": "NONE"
    }
  ]
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "bookingId": 14080,
    "pnr": "4521876390",
    "status": "PENDING_PAYMENT",
    "runId": 511,
    "trainNumber": "12724",
    "trainName": "Telangana Express",
    "journeyDate": "2026-11-20",
    "from": {
      "stationCode": "NDLS",
      "stationName": "New Delhi",
      "departure": "2026-11-20 17:30"
    },
    "to": {
      "stationCode": "BPL",
      "stationName": "Bhopal Junction",
      "arrival": "2026-11-21 03:35"
    },
    "distanceKm": 702,
    "classCode": "3A",
    "className": "AC 3 Tier",
    "passengers": [
      {
        "bpId": 28600,
        "name": "Kartik Gaikwad",
        "age": 21,
        "gender": "M",
        "status": "CNF",
        "coach": "B2",
        "seatNumber": 21,
        "berthType": "MB",
        "wlNumber": null,
        "fare": 865
      },
      {
        "bpId": 28601,
        "name": "Ananya Gaikwad",
        "age": 19,
        "gender": "F",
        "status": "CNF",
        "coach": "B2",
        "seatNumber": 22,
        "berthType": "UB",
        "wlNumber": null,
        "fare": 865
      }
    ],
    "amount": 1730,
    "payBefore": "2026-10-09 15:47:00"
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 5"
  }
}
```

### My bookings

`GET /bookings/my`  
**Who:** Passenger. **Requirements:** FR-G5-08. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "upcoming": [
      {
        "pnr": "4521876390",
        "status": "BOOKED",
        "trainNumber": "12724",
        "trainName": "Telangana Express",
        "journeyDate": "2026-11-20",
        "from": "NDLS",
        "to": "BPL",
        "departure": "17:30",
        "classCode": "3A",
        "travellers": 2,
        "amount": 1730
      },
      {
        "pnr": "6757495670",
        "status": "BOOKED",
        "trainNumber": "12952",
        "trainName": "New Delhi - Mumbai Central Rajdhani Express",
        "journeyDate": "2026-11-07",
        "from": "NDLS",
        "to": "BCT",
        "departure": "16:55",
        "classCode": "2A",
        "travellers": 4,
        "amount": 9120
      },
      "... 1 more"
    ],
    "past": [
      {
        "pnr": "7739195991",
        "status": "PARTIALLY_CANCELLED",
        "trainNumber": "12001",
        "trainName": "Rani Kamlapati - New Delhi Shatabdi Express",
        "journeyDate": "2026-09-18",
        "from": "RKMP",
        "to": "VGLJ",
        "departure": "15:15",
        "classCode": "CC",
        "travellers": 3,
        "amount": 1395
      },
      {
        "pnr": "5108236205",
        "status": "BOOKED",
        "trainNumber": "12723",
        "trainName": "Telangana Express",
        "journeyDate": "2026-09-04",
        "from": "HYB",
        "to": "NDLS",
        "departure": "06:00",
        "classCode": "3A",
        "travellers": 4,
        "amount": 7840
      }
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 5"
  }
}
```

### PNR status (public)

`GET /bookings/4521876390`  
**Who:** Anyone. **Requirements:** FR-G5-09. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "pnr": "4521876390",
    "status": "BOOKED",
    "runId": 511,
    "trainNumber": "12724",
    "trainName": "Telangana Express",
    "journeyDate": "2026-11-20",
    "from": {
      "stationCode": "NDLS",
      "stationName": "New Delhi",
      "departure": "2026-11-20 17:30"
    },
    "to": {
      "stationCode": "BPL",
      "stationName": "Bhopal Junction",
      "arrival": "2026-11-21 03:35"
    },
    "distanceKm": 702,
    "classCode": "3A",
    "className": "AC 3 Tier",
    "chartPrepared": false,
    "passengers": [
      {
        "serial": 1,
        "bookingStatus": "CNF B2/21 MB",
        "currentStatus": "CNF",
        "coach": "B2",
        "seatNumber": 21,
        "berthType": "MB",
        "wlPosition": null
      },
      {
        "serial": 2,
        "bookingStatus": "WL 7",
        "currentStatus": "WL",
        "coach": null,
        "seatNumber": null,
        "berthType": null,
        "wlPosition": 3
      }
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 5"
  }
}
```

### E-ticket

`GET /bookings/4521876390/ticket`  
**Who:** Passenger. **Requirements:** FR-G5-07. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "pnr": "4521876390",
    "status": "BOOKED",
    "bookedAt": "2026-10-09 15:02:41",
    "runId": 511,
    "trainNumber": "12724",
    "trainName": "Telangana Express",
    "journeyDate": "2026-11-20",
    "from": {
      "stationCode": "NDLS",
      "stationName": "New Delhi",
      "departure": "2026-11-20 17:30"
    },
    "to": {
      "stationCode": "BPL",
      "stationName": "Bhopal Junction",
      "arrival": "2026-11-21 03:35"
    },
    "distanceKm": 702,
    "classCode": "3A",
    "className": "AC 3 Tier",
    "quota": "General",
    "passengers": [
      {
        "serial": 1,
        "name": "Kartik Gaikwad",
        "age": 21,
        "gender": "M",
        "status": "CNF",
        "coach": "B2",
        "seatNumber": 21,
        "berthType": "MB",
        "wlNumber": null,
        "fare": 865
      },
      {
        "serial": 2,
        "name": "Ananya Gaikwad",
        "age": 19,
        "gender": "F",
        "status": "CNF",
        "coach": "B2",
        "seatNumber": 22,
        "berthType": "UB",
        "wlNumber": null,
        "fare": 865
      }
    ],
    "payment": {
      "method": "UPI",
      "txnRef": "TXN2026100948213377",
      "paidAt": "2026-10-09 15:03:12",
      "amount": 1730
    },
    "totalFare": 1730
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 5"
  }
}
```

### Reservation chart (staff)

`GET /runs/511/chart`  
**Who:** Staff (or admin). **Requirements:** FR-G5-10. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "runId": 511,
    "trainNumber": "12724",
    "journeyDate": "2026-11-20",
    "coaches": [
      {
        "coach": "B2",
        "classCode": "3A",
        "passengers": [
          {
            "seatNumber": 17,
            "berthType": "LB",
            "name": "Revathi Nair",
            "age": 64,
            "gender": "F",
            "from": "NDLS",
            "to": "HYB",
            "pnr": "9196548247"
          },
          {
            "seatNumber": 21,
            "berthType": "MB",
            "name": "Kartik Gaikwad",
            "age": 21,
            "gender": "M",
            "from": "NDLS",
            "to": "BPL",
            "pnr": "4521876390"
          },
          "... 1 more"
        ]
      }
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 5"
  }
}
```

### Counter booking (staff)

`POST /counter/bookings`  
**Who:** Staff (or admin). **Requirements:** FR-G5-11. **Now:** stub.

Request body:

```json
{
  "userId": 11,
  "runId": 511,
  "classId": 3,
  "fromSeq": 1,
  "toSeq": 5,
  "passengers": [
    {
      "name": "Farhan Gupta",
      "age": 32,
      "gender": "M"
    }
  ]
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "bookingId": 14080,
    "pnr": "4521876390",
    "status": "PENDING_PAYMENT",
    "runId": 511,
    "trainNumber": "12724",
    "trainName": "Telangana Express",
    "journeyDate": "2026-11-20",
    "from": {
      "stationCode": "NDLS",
      "stationName": "New Delhi",
      "departure": "2026-11-20 17:30"
    },
    "to": {
      "stationCode": "BPL",
      "stationName": "Bhopal Junction",
      "arrival": "2026-11-21 03:35"
    },
    "distanceKm": 702,
    "classCode": "3A",
    "className": "AC 3 Tier",
    "passengers": [
      {
        "bpId": 28600,
        "name": "Farhan Gupta",
        "age": 32,
        "gender": "M",
        "status": "CNF",
        "coach": "B2",
        "seatNumber": 21,
        "berthType": "MB",
        "wlNumber": null,
        "fare": 865
      }
    ],
    "amount": 865,
    "payBefore": "2026-10-09 15:47:00"
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 5"
  }
}
```


## Group 6 - Payment, cancellation and waiting list

### Start a payment

`POST /payments`  
**Who:** Passenger. **Requirements:** FR-G6-01, FR-G6-03. **Now:** stub.

Request body:

```json
{
  "bookingId": 14080,
  "method": "UPI"
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "paymentId": 14730,
    "bookingId": 14080,
    "pnr": "4521876390",
    "amount": 1730,
    "method": "UPI",
    "status": "INITIATED",
    "txnRef": "TXN2026100948213377",
    "payBefore": "2026-10-09 15:47:00"
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 6"
  }
}
```

### Mock gateway answer

`POST /payments/14730/verify`  
**Who:** Passenger. **Requirements:** FR-G6-02. **Now:** stub.

Request body:

```json
{
  "success": true
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "paymentId": 14730,
    "status": "SUCCESS",
    "txnRef": "TXN2026100948213377",
    "paidAt": "2026-10-09 15:03:12",
    "bookingStatus": "BOOKED",
    "pnr": "4521876390"
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 6"
  }
}
```

### My payments

`GET /payments/my`  
**Who:** Passenger. **Requirements:** FR-G6-12. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "paymentId": 14730,
        "pnr": "4521876390",
        "amount": 1730,
        "method": "UPI",
        "status": "SUCCESS",
        "paidAt": "2026-10-09 15:03:12"
      },
      {
        "paymentId": 14112,
        "pnr": "6757495670",
        "amount": 9120,
        "method": "CARD",
        "status": "SUCCESS",
        "paidAt": "2026-09-14 11:20:05"
      },
      "... 1 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 6"
  }
}
```

### Preview a cancellation (no change made)

`POST /bookings/4521876390/cancel?preview=true`  
**Who:** Passenger. **Requirements:** FR-G6-05, FR-G6-06. **Now:** stub.

Request body:

```json
{
  "bpIds": [
    28600
  ],
  "reason": "Change of plans"
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "pnr": "4521876390",
    "preview": true,
    "hoursBeforeDeparture": 962,
    "rule": "More than 48 hours before departure: flat charge per traveller",
    "items": [
      {
        "bpId": 28600,
        "name": "Kartik Gaikwad",
        "fare": 865,
        "charge": 180,
        "refund": 685
      }
    ],
    "totalRefund": 685
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 6"
  }
}
```

### Cancel travellers

`POST /bookings/4521876390/cancel`  
**Who:** Passenger. **Requirements:** FR-G6-05, FR-G6-07, FR-G6-09. **Now:** stub.

Request body:

```json
{
  "bpIds": [
    28600
  ],
  "reason": "Change of plans"
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "pnr": "4521876390",
    "preview": false,
    "hoursBeforeDeparture": 962,
    "rule": "More than 48 hours before departure: flat charge per traveller",
    "items": [
      {
        "bpId": 28600,
        "name": "Kartik Gaikwad",
        "fare": 865,
        "charge": 180,
        "refund": 685
      }
    ],
    "totalRefund": 685,
    "bookingStatus": "PARTIALLY_CANCELLED",
    "refundStatus": "PENDING",
    "waitlistPromoted": 1
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 6"
  }
}
```

### My refunds

`GET /refunds/my`  
**Who:** Passenger. **Requirements:** FR-G6-12. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "refundId": 2490,
        "pnr": "7739195991",
        "traveller": "Pallavi Agarwal",
        "amount": 285,
        "status": "PROCESSED",
        "createdAt": "2026-09-10 09:12:44",
        "processedAt": "2026-09-12 18:00:10"
      }
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 6"
  }
}
```

### Mark a refund processed (staff or admin)

`PATCH /refunds/2490`  
**Who:** Admin. **Requirements:** FR-G6-07. **Now:** stub.

Request body:

```json
{
  "status": "PROCESSED"
}
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "refundId": 2490,
    "status": "PROCESSED"
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 6"
  }
}
```

### Waiting list position (public)

`GET /waitlist/4521876390`  
**Who:** Anyone. **Requirements:** FR-G6-08. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "pnr": "4521876390",
    "classCode": "3A",
    "travellers": [
      {
        "serial": 2,
        "name": "Ananya Gaikwad",
        "wlNumber": 7,
        "currentPosition": 3,
        "status": "WAITING"
      }
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 6"
  }
}
```


## Group 7 - Admin, reports and DBMS

### Dashboard

`GET /admin/dashboard`  
**Who:** Admin. **Requirements:** FR-G7-01. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "today": {
      "bookings": 182,
      "revenue": 412650,
      "cancellations": 14,
      "activeTrains": 12,
      "waitlisted": 525
    },
    "last30Days": [
      {
        "date": "2026-09-10",
        "bookings": 206,
        "revenue": 442900
      },
      {
        "date": "2026-09-11",
        "bookings": 155,
        "revenue": 333250
      },
      "... 28 more"
    ],
    "topTrains": [
      {
        "trainNumber": "12952",
        "trainName": "New Delhi - Mumbai Central Rajdhani Express",
        "occupancyPercent": 71
      },
      {
        "trainNumber": "12301",
        "trainName": "Howrah - New Delhi Rajdhani Express",
        "occupancyPercent": 66
      },
      "... 1 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 7"
  }
}
```

### Report (bookings, revenue, occupancy, passengers, cancellations)

`GET /admin/reports/revenue?from=2026-07-01&to=2026-10-31`  
**Who:** Admin. **Requirements:** FR-G7-02..06. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "columns": [
      "month",
      "gross",
      "... 2 more"
    ],
    "rows": [
      [
        "2026-07",
        920075,
        "... 2 more"
      ],
      [
        "2026-08",
        3806715,
        "... 2 more"
      ],
      "... 2 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 7"
  }
}
```

### Audit log

`GET /admin/audit-logs?table=bookings&page=1`  
**Who:** Admin. **Requirements:** FR-G7-07. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "page": 1,
    "pageSize": 20,
    "total": 3,
    "items": [
      {
        "logId": 3,
        "tableName": "fare_rules",
        "recordId": "3",
        "action": "UPDATE",
        "changedBy": {
          "userId": 1,
          "name": "Kartik Gaikwad"
        },
        "changedAt": "2026-10-09 12:10:44.120",
        "oldData": {
          "per_km_rate": 1
        },
        "newData": {
          "per_km_rate": 1.05
        }
      },
      {
        "logId": 2,
        "tableName": "bookings",
        "recordId": "14080",
        "action": "UPDATE",
        "changedBy": {
          "userId": 11,
          "name": "Farhan Gupta"
        },
        "changedAt": "2026-10-09 15:03:12.481",
        "oldData": {
          "status": "PENDING_PAYMENT"
        },
        "newData": {
          "status": "BOOKED"
        }
      },
      "... 1 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 7"
  }
}
```

### SQL showcase queries

`GET /admin/sql-showcase`  
**Who:** Admin. **Requirements:** FR-G7-12. **Now:** stub.

Response `200`:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "Top 5 routes by revenue this month",
        "concept": "JOIN + GROUP BY + ORDER BY"
      },
      {
        "id": 2,
        "title": "Passengers who travelled more than 5 times",
        "concept": "GROUP BY + HAVING"
      },
      "... 1 more"
    ]
  },
  "error": null,
  "meta": {
    "stub": true,
    "owner": "Group 7"
  }
}
```
