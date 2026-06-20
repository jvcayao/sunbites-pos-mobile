import client from "./client";

export const referencesApi = {
  // Inventory
  inventory: {
    list: () => client.get("/references/inventory"),
    create: (data: object) => client.post("/references/inventory", data),
    update: (id: number, data: object) =>
      client.put(`/references/inventory/${id}`, data),
    destroy: (id: number) => client.delete(`/references/inventory/${id}`),
    archive: (id: number) =>
      client.patch(`/references/inventory/${id}/archive`),
    unarchive: (id: number) =>
      client.patch(`/references/inventory/${id}/unarchive`),
    logs: (id: number) => client.get(`/references/inventory/${id}/logs`),
    history: (params?: object) =>
      client.get("/references/inventory/history", { params }),
  },

  // Meal Planner
  mealPlanner: {
    show: (month: string, week: number) =>
      client.get("/references/meal-planner", { params: { month, week } }),
    update: (data: object) => client.patch("/references/meal-planner", data),
    reset: (data: object) =>
      client.post("/references/meal-planner/reset", data),
    updateVisibility: (data: object) =>
      client.patch("/references/meal-planner/week-visibility", data),
  },

  // Users
  users: {
    list: (params?: object) => client.get("/users", { params }),
    show: (id: number) => client.get(`/users/${id}`),
    create: (data: object) => client.post("/users", data),
    update: (id: number, data: object) => client.put(`/users/${id}`, data),
    // NOTE: API uses PATCH not POST for deactivate/reactivate
    deactivate: (id: number) => client.patch(`/users/${id}/deactivate`),
    reactivate: (id: number) => client.patch(`/users/${id}/reactivate`),
    resetPassword: (id: number) => client.post(`/users/${id}/reset-password`),
  },

  // Branches
  branches: {
    list: () => client.get("/branches"),
    update: (id: number, data: object) => client.put(`/branches/${id}`, data),
    toggle: (id: number) => client.post(`/branches/${id}/toggle`),
  },

  // Subscription config (branch monthly amounts)
  subscriptionConfig: {
    getMonthlyAmounts: (year: number) =>
      client.get("/branch-monthly-amounts", { params: { year } }),
    createAmount: (data: object) =>
      client.post("/branch-monthly-amounts", data),
    updateAmount: (id: number, data: object) =>
      client.put(`/branch-monthly-amounts/${id}`, data),
    deleteAmount: (id: number) =>
      client.delete(`/branch-monthly-amounts/${id}`),
    // System meal rate used for subscription config calculations
    getSystemMealRate: () => client.get("/system-configurations"),
  },

  // Parents
  parents: {
    list: (params?: object) => client.get("/references/parents", { params }),
    show: (id: number) => client.get(`/references/parents/${id}`),
    resendActivation: (id: number) =>
      client.post(`/references/parents/${id}/resend-activation`),
  },

  // Feedback
  feedback: {
    list: (params?: object) => client.get("/references/feedback", { params }),
    markRead: (id: number) =>
      client.patch(`/references/feedback/${id}/mark-read`),
    reply: (id: number, message: string) =>
      client.post(`/references/feedback/${id}/reply`, { message }),
  },

  // System configurations — NOTE: path is /system-configurations not /references/system-settings
  systemSettings: {
    list: () => client.get("/system-configurations"),
    update: (key: string, value: string | number) =>
      client.put(`/system-configurations/${key}`, { value }),
  },
};
