import axios, { isAxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import type { AuthTokens } from './auth.types';
import { ApiClientError } from './error-utils';
import type { ApiSuccessResponse } from './api.types';
import { clearAuthStorage, getAccessToken, getRefreshToken, setAuthTokens } from './auth-storage';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const baseURL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');

let refreshRequest: Promise<string | null> | null = null;

function isAuthRequest(url?: string) {
  return Boolean(url?.includes('/v1/auth/'));
}

function normalizeError(error: unknown) {
  if (isAxiosError(error)) {
    return new ApiClientError(
      error.response?.data?.message || error.message,
      error.response?.status,
      error.response?.data
    );
  }

  if (error instanceof Error) {
    return error;
  }

  return new ApiClientError('Nao foi possivel concluir a requisicao.');
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken || !baseURL) {
    return null;
  }

  const response = await axios.get<ApiSuccessResponse<AuthTokens>>(
    `${baseURL}/v1/auth/refresh-token`,
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const tokens = response.data.data;
  await setAuthTokens(tokens);

  return tokens.accessToken;
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function unwrapResponse<T>(request: Promise<AxiosResponse<ApiSuccessResponse<T>>>) {
  const response = await request;

  return response.data.data;
}

api.interceptors.request.use(
  async (config) => {
    if (!baseURL && config.url && !/^https?:\/\//.test(config.url)) {
      throw new ApiClientError('EXPO_PUBLIC_API_URL nao esta configurado.');
    }

    const token = getAccessToken();

    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Let the browser define the multipart boundary for FormData uploads.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (typeof config.headers?.delete === 'function') {
        config.headers.delete('Content-Type');
      } else if (config.headers) {
        delete config.headers['Content-Type'];
      }
    }

    return config;
  },
  (error) => Promise.reject(normalizeError(error))
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const statusCode = error.response?.status;

    if (
      statusCode === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRequest(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshRequest) {
          refreshRequest = refreshAccessToken().finally(() => {
            refreshRequest = null;
          });
        }

        const accessToken = await refreshRequest;

        if (accessToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        await clearAuthStorage();
        return Promise.reject(normalizeError(refreshError));
      }
    }

    if (statusCode === 401) {
      await clearAuthStorage();
    }

    return Promise.reject(normalizeError(error));
  }
);
