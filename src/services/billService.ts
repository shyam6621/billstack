import { fetchWithAuth } from './api';

export interface Bill {
    bill_id?: number;
    user_id?: number;
    bill_type: string;
    amount: number;
    due_date: string;
    status: string;
    created_at?: string;
}

export const billService = {
    getAllBills: () => fetchWithAuth('/bills'),
    getBillById: (id: number) => fetchWithAuth(`/bills/${id}`),
    createBill: (bill: Partial<Bill>) => fetchWithAuth('/bills', {
        method: 'POST',
        body: JSON.stringify(bill),
    }),
    updateBillStatus: (id: number, status: string) => fetchWithAuth(`/bills/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }),
    getMyBills: () => fetchWithAuth('/bills/my-bills'),
};
