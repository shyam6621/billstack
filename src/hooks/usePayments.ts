import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/paymentService';

export function useMyPayments() {
    return useQuery({
        queryKey: ['payments', 'me'],
        queryFn: paymentService.getMyPayments,
    });
}

export function useAllPayments() {
    return useQuery({
        queryKey: ['payments', 'all'],
        queryFn: paymentService.getAllPayments,
    });
}

export function usePayBill() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ billId, method, amount }: { billId: string; method: string; amount?: number }) =>
            paymentService.payBill(billId, method, amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['payment-history'] });
            queryClient.invalidateQueries({ queryKey: ['bills'] });
            queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}
