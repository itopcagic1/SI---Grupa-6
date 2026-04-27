const { z } = require('zod');

const registerSchema = z.object({
  ime: z
    .string()
    .trim()
    .min(2, { message: 'Ime mora imati najmanje 2 znaka' })
    .regex(/^[\p{L}\s'-]+$/u, { message: 'Ime ne smije sadržavati brojeve' }),
  email: z.string().email({ message: 'Email nije validan' }),
  password: z.string().min(8, { message: 'Lozinka mora imati najmanje 8 znakova' }),
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Email nije validan' }),
  password: z.string().min(8, { message: 'Lozinka mora imati najmanje 8 znakova' }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
