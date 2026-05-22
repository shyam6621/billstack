import { fetchWithAuth } from './api';

export const adminService = {
    getDashboardStats: () => fetchWithAuth('/admin/stats'),
    getMonthlyRevenue: () => fetchWithAuth('/admin/revenue/monthly'),
    getPendingBills: () => fetchWithAuth('/admin/pending-bills'),
    getTopUsers: () => fetchWithAuth('/admin/top-users'),
    getPaymentMethodsStat: () => fetchWithAuth('/admin/payment-methods'),
    getAllUsers: () => fetchWithAuth('/admin/users'),
    getAllTransactions: () => fetchWithAuth('/admin/transactions'),
};
