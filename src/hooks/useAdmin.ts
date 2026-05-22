import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';

export function useAdminStats() {
    return useQuery({ queryKey: ['admin', 'stats'], queryFn: adminService.getDashboardStats });
}

export function useAdminRevenue() {
    return useQuery({ queryKey: ['admin', 'revenue'], queryFn: adminService.getMonthlyRevenue });
}

export function useAdminPendingBills() {
    return useQuery({ queryKey: ['admin', 'pending-bills'], queryFn: adminService.getPendingBills });
}

export function useAdminUsers() {
    return useQuery({ queryKey: ['admin', 'users'], queryFn: adminService.getAllUsers });
}

export function useAdminTransactions() {
    return useQuery({ queryKey: ['admin', 'transactions'], queryFn: adminService.getAllTransactions });
}

export function useAdminPaymentMethods() {
    return useQuery({ queryKey: ['admin', 'payment-methods'], queryFn: adminService.getPaymentMethodsStat });
}
