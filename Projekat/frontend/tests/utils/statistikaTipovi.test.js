import { describe, expect, it } from 'vitest';
import {
  formatStatistikaVrijednost,
  getIgrackiTipoviStatistike,
  getStatistikaInputConfig,
  getTimskiTipoviStatistike,
  validateStatistikaVrijednost
} from '../../src/utils/statistikaTipovi';

const footballTipovi = [
  { tipStatistikeId: 1, nazivStatistike: 'Golovi' },
  { tipStatistikeId: 2, nazivStatistike: 'Asistencije' },
  { tipStatistikeId: 3, nazivStatistike: 'Zuti kartoni' },
  { tipStatistikeId: 4, nazivStatistike: 'Crveni kartoni' },
  { tipStatistikeId: 5, nazivStatistike: 'Posjed lopte' },
  { tipStatistikeId: 6, nazivStatistike: 'Prekrsaji' },
  { tipStatistikeId: 7, nazivStatistike: 'Golovi iz penala' },
  { tipStatistikeId: 8, nazivStatistike: 'Sutevi u okvir' },
  { tipStatistikeId: 9, nazivStatistike: 'Korneri' }
];

describe('statistikaTipovi', () => {
  it('filtrira fudbalske igracke tipove statistike', () => {
    expect(getIgrackiTipoviStatistike(footballTipovi, 'Fudbal').map((tip) => tip.nazivStatistike)).toEqual([
      'Golovi',
      'Asistencije',
      'Zuti kartoni',
      'Crveni kartoni',
      'Prekrsaji',
      'Golovi iz penala',
      'Sutevi u okvir',
    ]);
  });

  it('filtrira fudbalske timske tipove statistike', () => {
    expect(getTimskiTipoviStatistike(footballTipovi, 'Fudbal').map((tip) => tip.nazivStatistike)).toEqual([
      'Golovi',
      'Asistencije',
      'Zuti kartoni',
      'Crveni kartoni',
      'Posjed lopte',
      'Prekrsaji',
      'Golovi iz penala',
      'Sutevi u okvir',
      'Korneri'
    ]);
  });

  it('vraca ogranicenja za fudbalske kartone i posjed', () => {
    expect(getStatistikaInputConfig({ nazivStatistike: 'Crveni kartoni' }, 'Fudbal', 'player')).toEqual(
      expect.objectContaining({ min: 0, max: 1, step: 1 })
    );
    expect(getStatistikaInputConfig({ nazivStatistike: 'Zuti kartoni' }, 'Fudbal', 'player')).toEqual(
      expect.objectContaining({ min: 0, max: 2, step: 1 })
    );
    expect(getStatistikaInputConfig({ nazivStatistike: 'Posjed lopte' }, 'Fudbal', 'team')).toEqual(
      expect.objectContaining({ min: 0, max: 100, suffix: '%' })
    );
  });

  it('validira ogranicenja za kartone i posjed na frontendu', () => {
    expect(validateStatistikaVrijednost({ nazivStatistike: 'Crveni kartoni' }, 2, 'Fudbal', 'player'))
      .toBe('Crveni kartoni moze biti samo 0 ili 1.');
    expect(validateStatistikaVrijednost({ nazivStatistike: 'Zuti kartoni' }, 3, 'Fudbal', 'player'))
      .toBe('Zuti kartoni moze biti samo 0, 1 ili 2.');
    expect(validateStatistikaVrijednost({ nazivStatistike: 'Posjed lopte' }, 101, 'Fudbal', 'team'))
      .toBe('Posjed lopte mora biti cijeli broj izmedju 0 i 100.');
  });

  it('formatira procente i vremena sa jedinicama', () => {
    expect(formatStatistikaVrijednost('Posjed lopte', 60, { mode: 'aggregate' })).toBe('60%');
    expect(formatStatistikaVrijednost('Kazneni minuti', 12, { mode: 'aggregate' })).toBe('12 min');
    expect(formatStatistikaVrijednost('Vrijeme trke', 58.34, { mode: 'aggregate' })).toBe('58.34 s');
  });
});
