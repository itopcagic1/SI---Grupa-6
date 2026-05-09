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
  .email("Neispravan format emaila")
  .refine((val) => val === val.toLowerCase(), {
    message: "Email mora biti napisan isključivo malim slovima",
  }),
  lozinka: z.string({
    required_error: "Email i lozinka su obavezni",
  }).min(8, "Lozinka mora imati najmanje 8 znakova")
    .regex(/[A-Z]/, "Lozinka mora sadržavati veliko slovo")
    .regex(/[a-z]/, "Lozinka mora sadržavati malo slovo")
    .regex(/[0-9]/, "Lozinka mora sadržavati broj")
    .regex(/[@#$%^&*!]/, "Lozinka mora sadržavati specijalni znak"),
  potvrdalozinke: z.string({
    required_error:"Potvrda lozinke je obavezna",
  }),
  trazenaUloga: z.string().optional(),
  documents: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Email nije validan' }),
  lozinka: z.string()
    .min(8, "Lozinka mora imati najmanje 8 znakova")
    .regex(/[A-Z]/, "Lozinka mora sadržavati veliko slovo")
    .regex(/[a-z]/, "Lozinka mora sadržavati malo slovo")
    .regex(/[0-9]/, "Lozinka mora sadržavati broj")
    .regex(/[@#$%^&*!]/, "Lozinka mora sadržavati specijalni znak"),
});

const changePasswordSchema = z.object({
  trenutnaLozinka: z.string().min(1, "Morate unijeti trenutnu lozinku"),
  novaLozinka: z.string()
    .min(8, "Lozinka mora imati najmanje 8 znakova")
    .regex(/[A-Z]/, "Lozinka mora sadržavati veliko slovo")
    .regex(/[a-z]/, "Lozinka mora sadržavati malo slovo")
    .regex(/[0-9]/, "Lozinka mora sadržavati broj")
    .regex(/[@#$%^&*!]/, "Lozinka mora sadržavati specijalni znak"),
  potvrda: z.string().min(1, "Potvrda je obavezna")
}).refine((data) => data.novaLozinka === data.potvrda, {
  message: "Nove lozinke se ne podudaraju",
  path: ["potvrda"],
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema
};
