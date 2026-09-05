const API_BASE_URL = "http://localhost:8080";

/**
 * =========================================================
 * COMMON API REQUEST FUNCTION
 * =========================================================
 */

async function request(endpoint, options = {}) {
  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    /**
     * 204 No Content
     */
    if (response.status === 204) {
      return null;
    }

    const contentType =
      response.headers.get("content-type") || "";

    const isJson = contentType.includes("application/json");

    let data = null;

    if (isJson) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      try {
        data = await response.text();
      } catch {
        data = null;
      }
    }

    /**
     * Handle HTTP errors
     */
    if (!response.ok) {
      let message = `Request failed with status ${response.status}`;

      if (data && typeof data === "object") {
        message =
          data.message ||
          data.error ||
          data.detail ||
          message;
      } else if (
        typeof data === "string" &&
        data.trim()
      ) {
        message = data;
      }

      throw new Error(message);
    }

    return data;
  } catch (error) {
    /**
     * Network / backend connection error
     */
    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to backend. Make sure Spring Boot is running on port 8080."
      );
    }

    throw error;
  }
}

/**
 * =========================================================
 * CUSTOMERS
 * =========================================================
 */

export const customerApi = {
  /**
   * GET /api/customers
   */
  getAll: () =>
    request("/api/customers"),

  /**
   * GET /api/customers/{id}
   */
  getById: (id) =>
    request(`/api/customers/${id}`),

  /**
   * POST /api/customers
   */
  create: (customer) =>
    request("/api/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    }),

  /**
   * PUT /api/customers/{id}
   */
  update: (id, customer) =>
    request(`/api/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customer),
    }),

  /**
   * DELETE /api/customers/{id}
   */
  delete: (id) =>
    request(`/api/customers/${id}`, {
      method: "DELETE",
    }),
};

/**
 * =========================================================
 * FOOD ITEMS
 * =========================================================
 */

export const foodItemApi = {
  /**
   * GET /api/food-items
   */
  getAll: () =>
    request("/api/food-items"),

  /**
   * GET /api/food-items/{id}
   */
  getById: (id) =>
    request(`/api/food-items/${id}`),

  /**
   * POST /api/food-items
   */
  create: (foodItem) =>
    request("/api/food-items", {
      method: "POST",
      body: JSON.stringify(foodItem),
    }),

  /**
   * PUT /api/food-items/{id}
   */
  update: (id, foodItem) =>
    request(`/api/food-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(foodItem),
    }),

  /**
   * DELETE /api/food-items/{id}
   */
  delete: (id) =>
    request(`/api/food-items/${id}`, {
      method: "DELETE",
    }),
};

/**
 * =========================================================
 * ORDERS
 * =========================================================
 */

export const orderApi = {
  /**
   * GET /api/orders
   */
  getAll: () =>
    request("/api/orders"),

  /**
   * GET /api/orders/{id}
   */
  getById: (id) =>
    request(`/api/orders/${id}`),

  /**
   * GET /api/orders/customer/{customerId}
   */
  getByCustomer: (customerId) =>
    request(`/api/orders/customer/${customerId}`),

  /**
   * POST /api/orders
   */
  create: (order) =>
    request("/api/orders", {
      method: "POST",
      body: JSON.stringify(order),
    }),

  /**
   * PUT /api/orders/{id}/status
   */
  updateStatus: (id, status) =>
    request(`/api/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({
        status,
      }),
    }),

  /**
   * DELETE /api/orders/{id}
   */
  delete: (id) =>
    request(`/api/orders/${id}`, {
      method: "DELETE",
    }),
};

/**
 * =========================================================
 * NAMED CUSTOMER FUNCTIONS
 *
 * These are useful for Orders.jsx
 * =========================================================
 */

export const getCustomers = () =>
  customerApi.getAll();

export const getCustomerById = (id) =>
  customerApi.getById(id);

export const createCustomer = (customer) =>
  customerApi.create(customer);

export const updateCustomer = (id, customer) =>
  customerApi.update(id, customer);

export const deleteCustomer = (id) =>
  customerApi.delete(id);

/**
 * =========================================================
 * NAMED FOOD ITEM FUNCTIONS
 *
 * These are useful for Orders.jsx
 * =========================================================
 */

export const getFoodItems = () =>
  foodItemApi.getAll();

export const getFoodItemById = (id) =>
  foodItemApi.getById(id);

export const createFoodItem = (foodItem) =>
  foodItemApi.create(foodItem);

export const updateFoodItem = (id, foodItem) =>
  foodItemApi.update(id, foodItem);

export const deleteFoodItem = (id) =>
  foodItemApi.delete(id);

/**
 * =========================================================
 * NAMED ORDER FUNCTIONS
 *
 * These are useful for Orders.jsx
 * =========================================================
 */

export const getOrders = () =>
  orderApi.getAll();

export const getOrderById = (id) =>
  orderApi.getById(id);

export const getOrdersByCustomer = (customerId) =>
  orderApi.getByCustomer(customerId);

export const createOrder = (order) =>
  orderApi.create(order);

export const updateOrderStatus = (id, status) =>
  orderApi.updateStatus(id, status);

export const deleteOrder = (id) =>
  orderApi.delete(id);

/**
 * =========================================================
 * DEFAULT EXPORT
 * =========================================================
 */

export default {
  customerApi,
  foodItemApi,
  orderApi,

  // Customers
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,

  // Food Items
  getFoodItems,
  getFoodItemById,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,

  // Orders
  getOrders,
  getOrderById,
  getOrdersByCustomer,
  createOrder,
  updateOrderStatus,
  deleteOrder,
};