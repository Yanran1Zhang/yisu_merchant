
export interface Room {
  id: string;
  number: string;
  type: 'Single' | 'Double' | 'Suite' | 'Deluxe';
  status: 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';
  price: number;
}

export interface Booking {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: 'Confirmed' | 'Pending' | 'Checked-in' | 'Checked-out' | 'Cancelled';
  amount: number;
}

export interface DailyStat {
  date: string;
  revenue: number;
  occupancy: number;
}

export type ViewType = 'dashboard' | 'rooms' | 'bookings' | 'analytics' | 'info' | 'settings';
