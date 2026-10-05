import { z } from 'zod';

// Shared by the checkout form now and by the createOrder server action later.
// Never trust this on the client alone: the server action must parse it again.
export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().trim().min(7, 'Enter a phone number we can reach you on'),
  address: z.string().trim().min(5, 'Enter your street address'),
  city: z.string().trim().min(2, 'Enter your city'),
  state: z.string().trim().min(2, 'Enter your state or region'),
  country: z.string().trim().min(2, 'Enter your country'),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
