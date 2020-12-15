import {Entity, Role, SharedBy, SharedWith} from '@/models/interfaces/company';

export interface User {
  name: string;
  email: string;
  mobileNo: string;
  contactNo: string;
  uniqueName: string;
  isVerified: boolean;
}

export interface UserStateDetails {
  lastState: string;
  companyUniqueName: string;
}

export interface UserEntityRole {
  duration?: any;
  from?: any;
  entity: Entity;
  role: Role;
  uniqueName: string;
  to?: any;
  period?: any;
  allowedIps: any[];
  allowedCidrs: any[];
  sharedWith: SharedWith;
  sharedBy: SharedBy;
}

export interface UserDetails {
  name: string;
  uniqueName: string;
  email: string;
  signUpOn: string;
  mobileno: string;
  lastSeen?: any;
  managerDetails?: any;
}
