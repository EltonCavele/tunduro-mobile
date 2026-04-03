import { useQuery } from '@tanstack/react-query';
import { getPayments } from 'services/payments.service';

export const usePayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
  });
};
