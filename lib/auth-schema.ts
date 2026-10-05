import { z } from 'zod';

const email = z.string().trim().email('Enter a valid email address');

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
});

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name'),
  email,
  password: z.string().min(8, 'Use at least 8 characters'),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
