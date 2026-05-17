import { describe, expect, it } from 'vitest';
import {
  getIgrackiTipoviStatistike,
  getTimskiTipoviStatistike
} from '../../src/utils/statistikaTipovi';

const tipovi = [
  { tipStatistikeId: 1, nazivStatistike: 'Golovi' },
  { tipStatistikeId: 2, nazivStatistike: 'Asistencije' },
  { tipStatistikeId: 3, nazivStatistike: 'Zuti kartoni' },
  { tipStatistikeId: 4, nazivStatistike: 'Crveni kartoni' },
  { tipStatistikeId: 5, nazivStatistike: 'Posjed lopte' },
  { tipStatistikeId: 6, nazivStatistike: 'Prekrsaji' }
];

describe('statistikaTipovi', () => {
  it('filtrira samo individualne statistike za igraca', () => {
    expect(getIgrackiTipoviStatistike(tipovi).map((tip) => tip.nazivStatistike)).toEqual([
      'Golovi',
      'Asistencije',
      'Zuti kartoni',
      'Crveni kartoni'
    ]);
  });

  it('zadrzava agregatne i individualne aggregate za tim', () => {
    expect(getTimskiTipoviStatistike(tipovi).map((tip) => tip.nazivStatistike)).toEqual([
      'Golovi',
      'Asistencije',
      'Zuti kartoni',
      'Crveni kartoni',
      'Posjed lopte',
      'Prekrsaji'
    ]);
  });
});
