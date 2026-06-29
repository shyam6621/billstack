import { fetchWithAuth } from './api';

export interface Payment {
    id?: string;
    bill_id: string;
    transaction_id?: string;
    payment_method: string;
    payment_status: string;
    payment_date?: string;
    amount: number;
    bills?: {
        bill_type?: string;
    };
}

export const paymentService = {
    payBill: (billId: string, paymentMethod: string, amount?: number) =>
        fetchWithAuth('/payments/pay', {
            method: 'POST',
            body: JSON.stringify({ billId, paymentMethod, amount }),
        }),

    getMyPayments: (): Promise<Payment[]> => fetchWithAuth('/payments/my-payments'),

    getAllPayments: (): Promise<Payment[]> => fetchWithAuth('/payments'),
};
