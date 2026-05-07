const {
  kreirajLiguSchema,
  izmijeniLiguSchema,
} = require('../../../src/utils/ligaValidators');

describe('ligaValidators', () => {
  test('validni podaci za kreiranje lige prolaze validaciju', () => {
    const result = kreirajLiguSchema.safeParse({
      naziv: 'Premijer liga',
      sportId: 1,
      sezona: '2026/2027',
      opis: 'Opis lige',
      datumPocetka: '2026-08-01T12:00:00.000Z',
      datumZavrsetka: '2027-05-30T12:00:00.000Z',
      tipTakmicenja: 'Liga',
    });

    expect(result.success).toBe(true);
    expect(result.data.sportId).toBe(1);
  });

  test('prazan naziv lige se odbija', () => {
    const result = kreirajLiguSchema.safeParse({ naziv: '   ', sportId: 1 });

    expect(result.success).toBe(false);
  });

  test('nedostajuci sportId se odbija ako je obavezan', () => {
    const result = kreirajLiguSchema.safeParse({ naziv: 'Premijer liga' });

    expect(result.success).toBe(false);
  });

  test('nevalidan tip sportId-a se odbija', () => {
    const result = kreirajLiguSchema.safeParse({
      naziv: 'Premijer liga',
      sportId: 'abc',
    });

    expect(result.success).toBe(false);
  });

  test('prazni podaci za update se odbijaju ako validator to predvidja', () => {
    const result = izmijeniLiguSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  test('nevalidni podaci za update se odbijaju ako validator to predvidja', () => {
    const result = izmijeniLiguSchema.safeParse({ naziv: '   ' });

    expect(result.success).toBe(false);
  });

  test('dozvoljeni djelimicni update prolazi ako je implementiran', () => {
    const result = izmijeniLiguSchema.safeParse({ status: 'AKTIVNA' });

    expect(result.success).toBe(true);
    expect(result.data.status).toBe('AKTIVNA');
  });
});
