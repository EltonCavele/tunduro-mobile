import { useQuery } from '@tanstack/react-query';

import { getPaymentById } from 'services/payments.service';

export const usePaymentByIdQuery = (id: string | null) => {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => getPaymentById(id!),
    enabled: Boolean(id),
  });
};
