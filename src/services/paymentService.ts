import { fetchWithAuth } from './api';

export interface Payment {
    payment_id?: number;
    bill_id: number;
    transaction_id?: string;
    payment_method: string;
    payment_status: string;
    payment_date?: string;
    amount: number; // useful for display / response
}

export const paymentService = {
    payBill: (billId: number, paymentMethod: string, amount: number) => fetchWithAuth(`/payments/pay`, {
        method: 'POST',
        body: JSON.stringify({ billId, paymentMethod, amount }),
    }),
    getMyPayments: () => fetchWithAuth('/payments/my-payments'),
    getAllPayments: () => fetchWithAuth('/payments'),
};
