// Sample responses for Group 1 stubs. Same shape the real endpoints must return.

export const registeredUser = (body) => ({
  userId: 211,
  fullName: body.fullName,
  email: body.email,
  role: 'PASSENGER',
});

export const profile = {
  userId: 11,
  fullName: 'Farhan Gupta',
  email: 'farhan.gupta@example.com',
  phone: '9876501234',
  role: 'PASSENGER',
  passenger: {
    dateOfBirth: '1994-03-12', gender: 'M', idProofType: 'AADHAAR', idProofNumber: 'XXXX-XXXX-4821',
    address: '42, Shivaji Nagar', city: 'Pune', state: 'Maharashtra', pincode: '411005',
  },
  staff: null,
};

export const userList = {
  page: 1,
  pageSize: 20,
  total: 210,
  items: [
    { userId: 1, fullName: 'Kartik Gaikwad', email: 'admin.kartik@example.com', phone: '9000000001', role: 'ADMIN', isActive: true },
    { userId: 3, fullName: 'Asha Shinde', email: 'asha.shinde@example.com', phone: '9812345670', role: 'STAFF', isActive: true },
    { userId: 11, fullName: 'Farhan Gupta', email: 'farhan.gupta@example.com', phone: '9876501234', role: 'PASSENGER', isActive: true },
    { userId: 12, fullName: 'Meera Iyer', email: 'meera.iyer@example.com', phone: '9123456780', role: 'PASSENGER', isActive: false },
  ],
};
