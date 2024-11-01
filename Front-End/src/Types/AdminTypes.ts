/** admin login Credentials */
export interface AdminCredentials {
    email: string;
    password: string;
  }
  
  /** admin authentication Response */
  export interface AdminResponse {
    id: string;
    name: string;
    email: string;
    token: string; 
    isAdmin: boolean;
  }
  
  /** admin Information */
  export interface AdminInfo {
    data: unknown;
    id: string;
    name: string;
    email: string;
    token: string;
  }
  
  /**  admin authentication information State */
  export interface AdminAuthState {
    adminInfo: AdminInfo | null;
  }
  
  export interface AdminSidebarProps {
    adminName: string;
  }