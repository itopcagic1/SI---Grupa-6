const { z } = require('zod');

const registerSchema = z.object({
  punoIme: z
    .string()
    .trim()
    .min(2, { message: 'Ime mora imati najmanje 2 znaka' })
    .max(100, "Ime ne smije biti duže od 100 znakova")
    .regex(/^[\p{L}\s'-]+$/u, { message: 'Ime ne smije sadržavati brojeve' }),
  email: z.string({
    required_error: "Email i lozinka su obavezni", 
  }).trim()
  .email("Nevaljalan format emaila")
  .refine((val) => val === val.toLowerCase(), {
    message: "Email mora biti napisan isključivo malim slovima",
  }),
  lozinka: z.string({
    required_error: "Email i lozinka su obavezni",
  }).min(8, "Lozinka mora imati barem 8 znakova")
    .regex(/[A-Z]/, "Mora sadržavati veliko slovo")
    .regex(/[a-z]/, "Mora sadržavati malo slovo")
    .regex(/[0-9]/, "Mora sadržavati broj")
    .regex(/[@#$%^&*!]/, "Mora sadržavati specijalni znak"),
  trazenaUloga: z.string().optional(),
  documents: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Email nije validan' }),
  lozinka: z.string()
    .min(8, "Lozinka mora imati barem 8 znakova")
    .regex(/[A-Z]/, "Mora sadržavati veliko slovo")
    .regex(/[a-z]/, "Mora sadržavati malo slovo")
    .regex(/[0-9]/, "Mora sadržavati broj")
    .regex(/[@#$%^&*!]/, "Mora sadržavati specijalni znak"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
