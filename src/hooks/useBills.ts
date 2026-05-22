import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billService, Bill } from '@/services/billService';

export function useMyBills() {
    return useQuery({
        queryKey: ['bills', 'me'],
        queryFn: billService.getMyBills,
    });
}

export function useAllBills() {
    return useQuery({
        queryKey: ['bills', 'all'],
        queryFn: billService.getAllBills,
    });
}

export function useBill(id: number | null) {
    return useQuery({
        queryKey: ['bills', id],
        queryFn: () => billService.getBillById(id!),
        enabled: !!id,
    });
}

export function useCreateBill() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (bill: Partial<Bill>) => billService.createBill(bill),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bills'] });
        },
    });
}

export function useUpdateBillStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => billService.updateBillStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bills'] });
        },
    });
}
