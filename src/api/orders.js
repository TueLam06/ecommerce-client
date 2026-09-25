import { authFetch } from "./http";

export const getMyOrders = (token) => authFetch("/api/orders/my", { token });

export const getMyOrderById = (id, token) =>
    authFetch(`/api/orders/my/${id}`, { token });

export const cancelMyOrder = (id, token) =>
    authFetch(`/api/orders/my/${id}/cancel`, { method: "PATCH", token });
