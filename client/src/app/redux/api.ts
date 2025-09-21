import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

interface RefreshTokenResponse {
  token: string;
}

interface RetryableRequest extends AxiosRequestConfig {
  _retry?: boolean;
}
interface QueueItem {
  resolve: (value: string | null) => void;
  reject: (reason?: unknown) => void;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest;

    // Check if there is an authentication error and the request is not retry
    if (error.response?.status === 401 && !originalRequest?._retry) {
      // If refresh is already in progress, add to request queue
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (originalRequest) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers["Authorization"] = "Bearer " + token;
                resolve(api(originalRequest));
              }
            },
            reject,
          });
        }).catch((err: unknown) => Promise.reject(err));
      }

      if (originalRequest) {
        originalRequest._retry = true;
      }
      isRefreshing = true;

      try {
        // token refresh
        const refreshResponse = await api.post<RefreshTokenResponse>(
          "/refresh-token"
        );

        // refresh flag
        isRefreshing = false;

        // Processes the row
        processQueue(null, refreshResponse.data.token);

        // Retry origin request
        if (originalRequest) {
          return api(originalRequest);
        }
      } catch (refreshError: unknown) {
        // If refresh unsuccessful, rocesses the row with error and redirect
        isRefreshing = false;
        processQueue(refreshError);

        // Redirect to signin with session expired param
        if (typeof window !== "undefined") {
          window.location.href = "/signin?session=expired";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
