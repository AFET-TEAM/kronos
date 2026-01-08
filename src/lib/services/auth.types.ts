export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token?: string;
  email: string;
  idToken?: string;
  uid?: string;
  emailVerified?: boolean;
  registered?: boolean;
  message?: string;
  errors?: Array<{ message: string }>;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    title: string;
    squad: string;
    department?: string;
    avatarUrl: string;
    role: string;
    startDate?: string;
    projects?: string[];
    trainings?: string[];
    awards?: string[];
    certifications?: string[];
  };
};
