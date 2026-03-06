export type UserRole = "owner" | "admin" | "staff" | "client";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Client extends UserProfile {
  role: "client";
  phone?: string;
  company?: string;
}

export interface Staff extends UserProfile {
  role: "staff" | "admin" | "owner";
  department?: string;
  permissions?: string[];
}

export const rolePermissions: Record<UserRole, string[]> = {
  owner: [
    "manage_users",
    "manage_staff",
    "view_revenue",
    "manage_services",
    "manage_settings",
    "view_all_clients",
    "manage_orders",
    "approve_payments"
  ],
  admin: [
    "view_revenue",
    "view_all_clients",
    "manage_orders",
    "approve_payments",
    "manage_staff",
    "manage_services"
  ],
  staff: [
    "view_assigned_clients",
    "manage_assigned_orders",
    "update_order_status"
  ],
  client: [
    "view_own_orders",
    "create_orders",
    "upload_receipts",
    "message_support"
  ]
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "owner":
    case "admin":
      return "/dashboard/admin";
    case "staff":
      return "/dashboard/staff";
    case "client":
      return "/dashboard/client";
    default:
      return "/dashboard/client";
  }
}

export const roleLabels: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  staff: "Staff",
  client: "Client"
};

export const roleColors: Record<UserRole, string> = {
  owner: "text-purple-400",
  admin: "text-blue-400",
  staff: "text-green-400",
  client: "text-yellow-400"
};
