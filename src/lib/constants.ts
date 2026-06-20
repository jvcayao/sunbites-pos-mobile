export const GRADE_LEVELS = [
  "Nursery",
  "Kinder 1",
  "Kinder 2",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
] as const;

export const PAYMENT_METHODS = [
  "cash",
  "gcash",
  "wallet",
  "subscription",
] as const;

export const ENROLLMENT_STATUSES = [
  "enrolled",
  "paused",
  "unenrolled",
  "banned",
  "graduated",
] as const;

export const STUDENT_TYPES = ["subscription", "non_subscription"] as const;

export const SCHOOL_MONTHS = [
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  "january",
  "february",
  "march",
] as const;

export const USER_ROLES = [
  "admin",
  "manager",
  "supervisor",
  "cashier",
] as const;

export const MENU_CATEGORIES = ["meal", "snack", "drink", "extra"] as const;

export const STAFF_STATUSES = [
  "Working",
  "Off",
  "OnLeave",
  "Emergency",
  "OnBreak",
] as const;

export const listCardStyle = {
  marginHorizontal: 12,
  marginBottom: 8,
  borderRadius: 10,
  backgroundColor: "#FFFFFF",
  elevation: 2,
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.07,
  shadowRadius: 3,
} as const;

export const listCardStyleGrid = {
  ...listCardStyle,
  marginHorizontal: 6,
} as const;

export const spacing = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20,
  space6: 24,
  space8: 32,
  space10: 40,
  space12: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
