import type React from 'react';
import {
  Activity,
  BarChart3,
  BookOpen,
  IdCard,
  LayoutDashboard,
  Map,
  Shield,
  UserCheck,
  Video,
} from 'lucide-react';

export interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  group: 'operations' | 'records' | 'access';
}

export const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, group: 'operations' },
  { name: 'Lot Management', path: '/lot-management', icon: <Map size={18} />, group: 'operations' },
  { name: 'Live Camera', path: '/parking-space', icon: <Video size={18} />, group: 'operations' },
  { name: 'System Health', path: '/system-health', icon: <Activity size={18} />, group: 'operations' },
  { name: 'Weekly Reports', path: '/reports', icon: <BarChart3 size={18} />, group: 'operations' },
  { name: 'Licence Plate', path: '/licence-plate', icon: <IdCard size={18} />, group: 'records' },
  { name: 'Entry Records', path: '/entry-records', icon: <BookOpen size={18} />, group: 'records' },
  { name: 'Access Requests', path: '/auth-requests', icon: <UserCheck size={18} />, group: 'access' },
  { name: 'Admin Profile', path: '/admin-profile', icon: <Shield size={18} />, group: 'access' },
];
