import axios from "axios";
import { logoutUser } from "./slices/authSlice/asyncActions";
import { AppDispatch } from "./store";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if this is an authentication error and the request hasn't been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Perform token refresh
        const refreshResponse = await api.post("/refresh-token");

        // Reset the flag
        isRefreshing = false;

        // Process queued requests
        processQueue(null, refreshResponse.data.token);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        const dispatch: AppDispatch = useDispatch();
        const router = useRouter();
        // If refresh fails, process queue with error and potentially logout
        isRefreshing = false;
        processQueue(refreshError);

        //dispatch logout action & redirect to login
        dispatch(logoutUser());
        router.push("/signin");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
