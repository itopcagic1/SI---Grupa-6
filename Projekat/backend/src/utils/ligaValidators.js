const { z } = require('zod');

const kreirajLiguSchema = z.object({
  naziv: z
    .string({ required_error: 'Naziv lige je obavezan' })
    .trim()
    .min(1, 'Naziv ne smije biti prazan')
    .max(150, 'Naziv ne smije biti duži od 150 znakova'),

  sportId: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, { message: 'Sport je obavezan i mora biti validan ID' }),

  sezona: z
    .string()
    .trim()
    .max(50, 'Sezona ne smije biti duža od 50 znakova')
    .optional(),

  opis: z.string().trim().max(1000, 'Opis ne smije biti duži od 1000 znakova').optional(),

  datumPocetka: z
    .string()
    .datetime({ message: 'Neispravan format datuma početka (ISO 8601)' })
    .optional(),

  datumZavrsetka: z
    .string()
    .datetime({ message: 'Neispravan format datuma završetka (ISO 8601)' })
    .optional(),

  tipTakmicenja: z.string().trim().max(50).optional(),
});

const izmijeniLiguSchema = z.object({
  naziv: z
    .string()
    .trim()
    .min(1, 'Naziv ne smije biti prazan')
    .max(150, 'Naziv ne smije biti duži od 150 znakova')
    .optional(),

  sportId: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, { message: 'Sport mora biti validan ID' })
    .optional(),

  sezona: z.string().trim().max(50).optional(),

  opis: z.string().trim().max(1000).optional(),

  datumPocetka: z
    .string()
    .datetime({ message: 'Neispravan format datuma početka (ISO 8601)' })
    .optional(),

  datumZavrsetka: z
    .string()
    .datetime({ message: 'Neispravan format datuma završetka (ISO 8601)' })
    .optional(),

  tipTakmicenja: z.string().trim().max(50).optional(),

  status: z.string().trim().max(50).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Potrebno je poslati barem jedno polje za izmjenu',
});

module.exports = {
  kreirajLiguSchema,
  izmijeniLiguSchema,
};