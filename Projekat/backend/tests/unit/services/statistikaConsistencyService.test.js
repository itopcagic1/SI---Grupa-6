const { validateStatistikaKonzistentnost } = require('../../../src/services/statistikaConsistencyService');

function vrijednost(id, nazivStatistike, value) {
  return {
    vrijednostId: id,
    vrijednost: value,
    tipStatistike: { nazivStatistike }
  };
}

function utakmicaSaStatistikom({
  rezultatDomacin = 2,
  rezultatGost = 1,
  statistikeIgraca = [],
  statistikeTimova = []
} = {}) {
  return {
    utakmicaId: 1,
    domaciTimId: 20,
    gostujuciTimId: 30,
    rezultatUtakmice: {
      rezultatDomacin,
      rezultatGost
    },
    statistikeIgraca,
    statistikeTimova
  };
}

function txFor(utakmica) {
  return {
    utakmica: {
      findUnique: jest.fn().mockResolvedValue(utakmica)
    }
  };
}

describe('statistikaConsistencyService', () => {
  test('odbija unos previse golova igraca u odnosu na rezultat tima', async () => {
    const tx = txFor(utakmicaSaStatistikom({
      rezultatDomacin: 1,
      rezultatGost: 0,
      statistikeIgraca: [
        { statistikaIgracaId: 1, timId: 20, vrijednosti: [vrijednost(1, 'Golovi', 2)] }
      ]
    }));

    await expect(validateStatistikaKonzistentnost(tx, 1))
      .rejects.toThrow('Zbir golova igraca ne moze biti veci od rezultata tima.');
  });

  test('odbija promjenu rezultata koja invalidira postojece golove igraca', async () => {
    const tx = txFor(utakmicaSaStatistikom({
      rezultatDomacin: 3,
      rezultatGost: 0,
      statistikeIgraca: [
        { statistikaIgracaId: 1, timId: 20, vrijednosti: [vrijednost(1, 'Golovi', 3)] }
      ]
    }));

    await expect(validateStatistikaKonzistentnost(tx, 1, { rezultatDomacin: 1, rezultatGost: 0 }))
      .rejects.toThrow('Zbir golova igraca ne moze biti veci od rezultata tima.');
  });

  test('odbija kartone igraca koji prelaze timske kartone', async () => {
    const tx = txFor(utakmicaSaStatistikom({
      statistikeIgraca: [
        { statistikaIgracaId: 1, timId: 20, vrijednosti: [vrijednost(1, 'Zuti kartoni', 2)] }
      ],
      statistikeTimova: [
        { statistikaTimaId: 1, timId: 20, vrijednosti: [vrijednost(2, 'Zuti kartoni', 1)] }
      ]
    }));

    await expect(validateStatistikaKonzistentnost(tx, 1))
      .rejects.toThrow('Zbir zutih kartona igraca ne moze biti veci od timskih zutih kartona.');
  });

  test('odbija asistencije igraca koje prelaze timske asistencije kada timska statistika postoji', async () => {
    const tx = txFor(utakmicaSaStatistikom({
      rezultatDomacin: 3,
      rezultatGost: 0,
      statistikeIgraca: [
        { statistikaIgracaId: 1, timId: 20, vrijednosti: [vrijednost(1, 'Asistencije', 2)] }
      ],
      statistikeTimova: [
        { statistikaTimaId: 1, timId: 20, vrijednosti: [vrijednost(2, 'Asistencije', 1)] }
      ]
    }));

    await expect(validateStatistikaKonzistentnost(tx, 1))
      .rejects.toThrow('Zbir asistencija igraca ne moze biti veci od timskih asistencija.');
  });

  test('odbija previse asistencija u odnosu na golove tima', async () => {
    const tx = txFor(utakmicaSaStatistikom({
      rezultatDomacin: 1,
      rezultatGost: 0,
      statistikeIgraca: [
        { statistikaIgracaId: 1, timId: 20, vrijednosti: [vrijednost(1, 'Asistencije', 2)] }
      ]
    }));

    await expect(validateStatistikaKonzistentnost(tx, 1))
      .rejects.toThrow('Broj asistencija ne moze biti veci od broja golova tima.');
  });

  test('propusta validan scenario', async () => {
    const tx = txFor(utakmicaSaStatistikom({
      rezultatDomacin: 2,
      rezultatGost: 1,
      statistikeIgraca: [
        {
          statistikaIgracaId: 1,
          timId: 20,
          vrijednosti: [
            vrijednost(1, 'Golovi', 1),
            vrijednost(2, 'Asistencije', 1),
            vrijednost(3, 'Zuti kartoni', 1)
          ]
        },
        {
          statistikaIgracaId: 2,
          timId: 30,
          vrijednosti: [vrijednost(4, 'Golovi', 1)]
        }
      ],
      statistikeTimova: [
        {
          statistikaTimaId: 1,
          timId: 20,
          vrijednosti: [
            vrijednost(5, 'Zuti kartoni', 1),
            vrijednost(6, 'Golovi', 2)
          ]
        }
      ]
    }));

    await expect(validateStatistikaKonzistentnost(tx, 1)).resolves.toBeUndefined();
  });

  test('propusta djelimicnu statistiku kada je zbir igraca manji od timskog agregata', async () => {
    const tx = txFor(utakmicaSaStatistikom({
      rezultatDomacin: 3,
      rezultatGost: 0,
      statistikeIgraca: [
        {
          statistikaIgracaId: 1,
          timId: 20,
          vrijednosti: [
            vrijednost(1, 'Golovi', 1),
            vrijednost(2, 'Asistencije', 1),
            vrijednost(3, 'Zuti kartoni', 1)
          ]
        }
      ],
      statistikeTimova: [
        {
          statistikaTimaId: 1,
          timId: 20,
          vrijednosti: [
            vrijednost(4, 'Golovi', 3),
            vrijednost(5, 'Asistencije', 2),
            vrijednost(6, 'Zuti kartoni', 3)
          ]
        }
      ]
    }));

    await expect(validateStatistikaKonzistentnost(tx, 1)).resolves.toBeUndefined();
  });
});
