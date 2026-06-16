export type ParkingLotId = 'CAMT_01' | 'CAMT_02';

export interface ParkingSnapshot {
  available_spaces: number;
  total_spaces: number;
  occupied_spaces: number;
  occupacy_rate?: number;
}

export interface KpiSummary {
  utilization_percentage: number;
  peak_occupancy: number;
  vehicle_count: number;
  avg_dwell_time_minutes: number;
}

export interface ParkingSpot {
  id: string;
  status: 'available' | 'occupied' | 'offline';
  heatRate?: number;
}

export interface DeviceNodeHealth {
  status?: 'online' | 'offline' | 'unknown' | string;
}

export interface DeviceHealth {
  system_status?: string;
  uptime_percentage?: number;
  board?: DeviceNodeHealth;
  camera_1?: DeviceNodeHealth;
  camera_2?: DeviceNodeHealth;
  camera_3?: DeviceNodeHealth;
  camera_4?: DeviceNodeHealth;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revoked';

export interface AdminAccessRequest {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  status: ApprovalStatus;
  requestDate: string;
}

export type ReportExportFormat = 'csv' | 'pdf';
