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
  sportNaziv = 'Fudbal',
  statistikeIgraca = [],
  statistikeTimova = []
} = {}) {
  return {
    utakmicaId: 1,
    domaciTimId: 20,
    gostujuciTimId: 30,
    takmicenje: {
      sport: {
        naziv: sportNaziv
      }
    },
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

  test('odbija vise od jednog crvenog kartona za fudbalera', async () => {
    const tx = txFor(utakmicaSaStatistikom({
      statistikeIgraca: [
        { statistikaIgracaId: 1, timId: 20, vrijednosti: [vrijednost(1, 'Crveni kartoni', 2)] }
      ]
    }));

    await expect(validateStatistikaKonzistentnost(tx, 1))
      .rejects.toThrow('Crveni karton za igraca moze biti samo 0 ili 1.');
  });

  test('odbija vise od dva zuta kartona za fudbalera', async () => {
    const tx = txFor(utakmicaSaStatistikom({
      statistikeIgraca: [
        { statistikaIgracaId: 1, timId: 20, vrijednosti: [vrijednost(1, 'Zuti kartoni', 3)] }
      ]
    }));

    await expect(validateStatistikaKonzistentnost(tx, 1))
      .rejects.toThrow('Zuti kartoni za igraca mogu biti samo 0, 1 ili 2.');
  });

  test('odbija previse timskih zutih kartona u fudbalu', async () => {
    const tx = txFor(utakmicaSaStatistikom({
      statistikeTimova: [
        { statistikaTimaId: 1, timId: 20, vrijednosti: [vrijednost(1, 'Zuti kartoni', 12)] }
      ]
    }));

    await expect(validateStatistikaKonzistentnost(tx, 1))
      .rejects.toThrow('Timski zuti kartoni u fudbalu ne mogu biti veci od 11.');
  });

  test('odbija posjed lopte van opsega', async () => {
    const tx = txFor(utakmicaSaStatistikom({
      statistikeTimova: [
        { statistikaTimaId: 1, timId: 20, vrijednosti: [vrijednost(1, 'Posjed lopte', 101)] }
      ]
    }));

    await expect(validateStatistikaKonzistentnost(tx, 1))
      .rejects.toThrow('Posjed lopte mora biti cijeli broj izmedju 0 i 100.');
  });

  test('odbija kada posjed oba fudbalska tima nije priblizno 100%', async () => {
    const tx = txFor(utakmicaSaStatistikom({
      statistikeTimova: [
        { statistikaTimaId: 1, timId: 20, vrijednosti: [vrijednost(1, 'Posjed lopte', 60)] },
        { statistikaTimaId: 2, timId: 30, vrijednosti: [vrijednost(2, 'Posjed lopte', 35)] }
      ]
    }));

    await expect(validateStatistikaKonzistentnost(tx, 1))
      .rejects.toThrow('Posjed lopte oba tima zajedno mora biti priblizno 100%.');
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
