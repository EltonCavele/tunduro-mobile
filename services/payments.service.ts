import { api, unwrapResponse } from 'lib/api';
import type { ApiPaginatedData } from 'lib/api.types';
import type { Payment } from 'lib/payments.types';

export const getPayments = async (): Promise<ApiPaginatedData<Payment>> => {
  return unwrapResponse(api.get('/v1/payments'));
};

export const getPaymentById = async (id: string): Promise<Payment> => {
  return unwrapResponse(api.get(`/v1/payments/${id}`));
};
