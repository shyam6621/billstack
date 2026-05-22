export type Role = 'USER' | 'ADMIN';
export type BillStatus = 'PENDING' | 'PAID' | 'OVERDUE';
export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export interface UserSummary {
    id: string;
    name: string;
    email: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt?: string;
}

export interface Bill {
    id: string;
    user: UserSummary;
    billType: string;
    description: string;
    amount: number;
    dueDate: string;
    status: BillStatus;
    createdAt: string;
}

export interface Payment {
    id: string;
    transactionId: string;
    user: UserSummary;
    bill: { id: string; description: string; amount: number };
    amount: number;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    paymentDate: string;
}
