export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  email: string;
  idToken: string;
  registered?: boolean;
  message?: string;
  errors?: Array<{ message: string }>;
};
