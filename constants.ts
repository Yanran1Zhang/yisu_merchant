
import { Room, Booking, DailyStat } from './types';

export const MOCK_ROOMS: Room[] = [
  { id: '1', number: '101', type: 'Single', status: 'Available', price: 120 },
  { id: '2', number: '102', type: 'Double', status: 'Occupied', price: 200 },
  { id: '3', number: '201', type: 'Suite', status: 'Available', price: 450 },
  { id: '4', number: '202', type: 'Deluxe', status: 'Cleaning', price: 320 },
  { id: '5', number: '301', type: 'Suite', status: 'Maintenance', price: 500 },
  { id: '6', number: '302', type: 'Double', status: 'Available', price: 180 },
  { id: '7', number: '303', type: 'Single', status: 'Occupied', price: 130 },
  { id: '8', number: '401', type: 'Deluxe', status: 'Available', price: 350 },
];

export const MOCK_BOOKINGS: Booking[] = [
  { id: 'BK001', guestName: '张三', roomNumber: '102', checkIn: '2024-05-10', checkOut: '2024-05-12', status: 'Checked-in', amount: 400 },
  { id: 'BK002', guestName: '李四', roomNumber: '201', checkIn: '2024-05-15', checkOut: '2024-05-18', status: 'Confirmed', amount: 1350 },
  { id: 'BK003', guestName: '王五', roomNumber: '303', checkIn: '2024-05-11', checkOut: '2024-05-12', status: 'Checked-in', amount: 130 },
  { id: 'BK004', guestName: '赵六', roomNumber: '101', checkIn: '2024-05-20', checkOut: '2024-05-25', status: 'Pending', amount: 600 },
];

export const MOCK_STATS: DailyStat[] = [
  { date: '周一', revenue: 4500, occupancy: 85 },
  { date: '周二', revenue: 3200, occupancy: 70 },
  { date: '周三', revenue: 5100, occupancy: 92 },
  { date: '周四', revenue: 4800, occupancy: 88 },
  { date: '周五', revenue: 7200, occupancy: 95 },
  { date: '周六', revenue: 8900, occupancy: 100 },
  { date: '周日', revenue: 6500, occupancy: 80 },
];
