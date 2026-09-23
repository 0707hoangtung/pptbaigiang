export type UserRole = 'super_admin' | 'member' | 'guest';

export type MemberPermission = 'editor' | 'viewer';

export type AccountStatus = 'active' | 'locked';

export interface Member {
  id: string;
  fullName: string;
  phone: string;
  password: string;
  role: 'member';
  permission: MemberPermission;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CurrentUser {
  role: UserRole;
  memberId?: string;
  fullName: string;
  phone?: string;
  permission: MemberPermission;
}

export interface AdminAuthDoc {
  adminPassword: string;
  adminName?: string;
  adminEmail?: string;
  updatedAt: string;
}
