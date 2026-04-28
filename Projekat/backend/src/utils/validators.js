const { z } = require('zod');

// Validation for user name - only letters and spaces, no numbers
const nameSchema = z
  .string()
  .trim()
  .min(2, { message: 'Ime mora imati najmanje 2 znaka' })
  .regex(/^[\p{L}\s'-]+$/u, { message: 'Ime ne smije sadržavati brojeve' });

// Validation for email
const emailSchema = z.string().email({ message: 'Email nije validan' });

// Strict password validation
const passwordSchema = z
  .string()
  .min(8, { message: 'Lozinka mora imati najmanje 8 znakova' })
  .regex(/[A-Z]/, { message: 'Lozinka mora sadržavati barem jedno veliko slovo' })
  .regex(/[a-z]/, { message: 'Lozinka mora sadržavati barem jedno malo slovo' })
  .regex(/[0-9]/, { message: 'Lozinka mora sadržavati barem jedan broj' })
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, { 
    message: 'Lozinka mora sadržavati barem jedan specijalni znak (!@#$%^&*)' 
  });

// Registration schema - strict validation
const registerSchema = z.object({
  ime: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// Login schema - basic validation (service handles verification)
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Lozinka je obavezna' }),
});

module.exports = {
  registerSchema,
  loginSchema,
  nameSchema,
  emailSchema,
  passwordSchema,
};
