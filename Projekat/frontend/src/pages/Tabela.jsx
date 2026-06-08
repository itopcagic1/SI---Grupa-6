import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchTabela } from '../api/tabelaApi';
import { downloadTabelaPDF, canExportPDF } from '../api/pdfApi';
import { fetchPublicMatches } from '../api/matchApi';
import { generateLeagueAIPrediction } from '../api/ligaApi';

// Boja reda prema poziciji
function getRedBoja(pozicija) {
  if (pozicija === 1) return 'border-l-4 border-yellow-400 bg-yellow-50';
  if (pozicija === 2) return 'border-l-4 border-gray-300 bg-gray-50';
  if (pozicija === 3) return 'border-l-4 border-amber-500 bg-amber-50';
  return 'hover:bg-amber-50 transition-colors';
}

// Emoji medalja za top 3
function getPozicijaLabel(pozicija) {
  if (pozicija === 1) return '🥇';
  if (pozicija === 2) return '🥈';
  if (pozicija === 3) return '🥉';
  return pozicija;
}

// Boja gol razlike
function getGolRazlikaBoja(gr) {
  if (gr > 0) return 'text-green-600';
  if (gr < 0) return 'text-red-500';
  return 'text-slate-500';
}

// Formatiranje datuma i vremena za utakmice
function formatDateTime(dateString) {
  if (!dateString) return 'Datum nije definisan';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Datum nije definisan';

  return `${date.toLocaleDateString('bs-BA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })} | ${date.toLocaleTimeString('bs-BA', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}

// Lokacija utakmice
function getLocationLabel(utakmica) {
  return utakmica.sportskiObjekat?.naziv || utakmica.lokacijaOpis || 'Lokacija nije definisana';
}

// Rezultat utakmice ako postoji
function getResultLabel(utakmica) {
  const rezultat = utakmica.rezultatUtakmice;
  if (!rezultat) return null;

  return `${rezultat.rezultatDomacin} : ${rezultat.rezultatGost}`;
}

function formatPercent(value) {
  if (value === null || value === undefined) return '-';
  return `${Math.round(Number(value) * 100)}%`;
}

function Tabela() {
  const { id } = useParams();

  const [tabela, setTabela] = useState([]);
  const [takmicenje, setTakmicenje] = useState(null);
  const [sortBy, setSortBy] = useState('ukupniBodovi');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // PDF export state
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const mozePDF = canExportPDF();

  // State za raspored utakmica unutar otvorene lige
  const [utakmice, setUtakmice] = useState([]);
  const [loadingUtakmice, setLoadingUtakmice] = useState(false);
  const [errorUtakmice, setErrorUtakmice] = useState('');
  const [prikaziRaspored, setPrikaziRaspored] = useState(false);

  const [prikaziAI, setPrikaziAI] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Učitaj tabelu kada se promijeni id ili sortiranje
  useEffect(() => {
    let isActive = true;

    const ucitajTabelu = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await fetchTabela(id, sortBy);

        if (isActive) {
          setTakmicenje(data.takmicenje);
          setTabela(data.tabela);
        }
      } catch (err) {
        if (isActive) {
          setError(err.response?.data?.message || 'Nije moguće učitati tabelu.');
          setTabela([]);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    ucitajTabelu();

    return () => {
      isActive = false;
    };
  }, [id, sortBy]);

  // Učitaj utakmice samo za ovu ligu kada korisnik klikne dugme Raspored
  useEffect(() => {
    let isActive = true;

    const ucitajUtakmice = async () => {
      if (!prikaziRaspored) return;

      try {
        setLoadingUtakmice(true);
        setErrorUtakmice('');

        const data = await fetchPublicMatches({ takmicenjeId: id });

        if (isActive) {
          setUtakmice(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isActive) {
          setErrorUtakmice(err.response?.data?.poruka || 'Nije moguće učitati raspored.');
          setUtakmice([]);
        }
      } finally {
        if (isActive) {
          setLoadingUtakmice(false);
        }
      }
    };

    ucitajUtakmice();

    return () => {
      isActive = false;
    };
  }, [id, prikaziRaspored]);

  const handleExportPDF = async () => {
    if (!id) return;
    setPdfLoading(true);
    setPdfError('');
    try {
      await downloadTabelaPDF(id);
    } catch (err) {
      setPdfError(err.response?.data?.poruka || 'Nije moguće generisati PDF. Pokušajte ponovo.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleAIPrediction = async () => {
    try {
      setAiLoading(true);
      setAiError('');
      setPrikaziAI(true);
      setPrikaziRaspored(true);

      const data = await generateLeagueAIPrediction(id);
      setAiPrediction(data.prediction);
    }  catch (err) {
      setAiError(
        err.response?.data?.message ||
        'Nije moguće generisati AI predikciju.'
      );
    } finally {
      setAiLoading(false);
    }
  };

  const renderUtakmica = (utakmica) => {
  const rezultat = getResultLabel(utakmica);

  const aiMatch = aiPrediction?.predictions?.find(
    p => p.utakmicaId === utakmica.utakmicaId
  );

  return (
    <article
      key={utakmica.utakmicaId}
      className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm hover:shadow-lg transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
            {utakmica.takmicenje?.naziv || takmicenje?.naziv || 'Takmičenje nije definisano'}
          </span>

          <span className="text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">
            {utakmica.status || 'Status nije definisan'}
          </span>

          <span
            className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
              rezultat ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {rezultat ? 'Uneseno' : 'Čeka unos'}
          </span>

          {aiMatch && (
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-purple-50 text-purple-700">
              AI GENERISANO
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex-1 text-right">
          <div className="text-lg font-black text-slate-800">
            {utakmica.domaciTim?.naziv || 'Domaći tim'}
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-100 text-center min-w-20">
          <div className="text-xl font-black text-orange-600">
            {rezultat || 'VS'}
          </div>
        </div>

        <div className="flex-1 text-left">
          <div className="text-lg font-black text-slate-800">
            {utakmica.gostujuciTim?.naziv || 'Gostujući tim'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-medium text-slate-500">
        <div className="bg-slate-50 rounded-2xl px-4 py-3">
          <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
            Datum i vrijeme
          </span>
          <span className="text-slate-800">
            {formatDateTime(utakmica.vrijemePocetka)}
          </span>
        </div>

        <div className="bg-slate-50 rounded-2xl px-4 py-3">
          <span className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
            Lokacija
          </span>
          <span className="text-slate-800">
            {getLocationLabel(utakmica)}
          </span>
        </div>
      </div>

      {aiMatch && (
        <div className="mt-4 bg-purple-50 border border-purple-100 rounded-2xl p-4">
          <div className="text-sm font-black text-purple-700 uppercase tracking-widest mb-3">
            AI Predikcija
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">Domaćin</div>
              <div className="font-black text-lg">
                {formatPercent(aiMatch.homeWinProbability)}
              </div>
            </div>

            <div className="bg-white rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">Neriješeno</div>
              <div className="font-black text-lg">
                {formatPercent(aiMatch.drawProbability)}
              </div>
            </div>

            <div className="bg-white rounded-xl p-3">
              <div className="text-xs text-slate-500 mb-1">Gost</div>
              <div className="font-black text-lg">
                {formatPercent(aiMatch.awayWinProbability)}
              </div>
            </div>
          </div>

          <div className="mt-3 text-sm">
            <span className="font-bold text-slate-700">
              Predviđeni ishod:
            </span>{' '}
            <span className="font-black text-purple-700">
              {{
                HOME_WIN: 'HOME WIN',
                AWAY_WIN: 'AWAY WIN',
                DRAW: 'DRAW'
              }[aiMatch.prediction] || aiMatch.prediction}
            </span>
          </div>
        </div>
      )}
    </article>
  );
};

  return (
    <div className="min-h-screen bg-amber-50 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Naslov */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            TABELA
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            {takmicenje
              ? `${takmicenje.naziv}${takmicenje.sezona ? ` · Sezona ${takmicenje.sezona}` : ''}`
              : 'Učitavanje...'}
          </p>
        </div>

        {/* Sortiranje + dugme raspored */}
        <section className="bg-white rounded-[32px] border border-amber-100 p-6 shadow-sm mb-8">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-xs font-black uppercase tracking-widest text-amber-900/60">
                Sortiraj po:
              </span>

              {[
                { key: 'ukupniBodovi', label: 'Bodovi' },
                { key: 'golRazlika', label: 'Gol razlika' },
              ].map(opcija => (
                <button
                  key={opcija.key}
                  onClick={() => setSortBy(opcija.key)}
                  className={`px-5 py-2 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 ${
                    sortBy === opcija.key
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                      : 'bg-amber-50 text-slate-700 hover:bg-amber-100'
                  }`}
                >
                  {opcija.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPrikaziRaspored(current => !current)}
                className={`px-5 py-2 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 shadow-md ${
                  prikaziRaspored
                    ? 'bg-slate-800 text-white hover:bg-slate-900'
                    : 'bg-amber-50 text-slate-700 hover:bg-amber-100'
                }`}
              >
                {prikaziRaspored ? 'Sakrij raspored' : 'Raspored'}
              </button>

              <button
                type="button"
                onClick={handleAIPrediction}
                disabled={aiLoading || loading}
                className={`px-5 py-2 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 shadow-md ${
                  prikaziAI
                    ? 'bg-purple-700 text-white hover:bg-purple-800'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                } disabled:opacity-50`}
              >
                {aiLoading ? 'AI obrađuje...' : 'AI predikcija'}
              </button>

              {aiError && (
                <p className="text-xs font-semibold text-red-600">
                  {aiError}
                </p>
              )}

              {mozePDF && (
                <div className="flex flex-col items-end gap-1">
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    disabled={pdfLoading || loading || !takmicenje}
                    className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {pdfLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Izvoz u toku...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Izvezi u PDF
                      </>
                    )}
                  </button>
                  {pdfError && (
                    <p className="text-xs font-semibold text-red-600">{pdfError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stanja: loading / error / prazno / tabela */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-sm">
              Učitavanje tabele...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center font-bold">
            {error}
          </div>
        ) : tabela.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[32px] border border-amber-100 shadow-sm">
            <p className="text-slate-500 text-lg font-medium">
              Nema dostupnih podataka za ovo takmičenje.
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Tabela će biti prikazana nakon generisanja rasporeda ili unosa rezultata.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-amber-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-50 text-left">
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">
                      #
                    </th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60">
                      Tim
                    </th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">
                      O
                    </th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">
                      W
                    </th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">
                      D
                    </th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">
                      L
                    </th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">
                      G+
                    </th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">
                      G-
                    </th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">
                      GR
                    </th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-amber-900/60 text-center">
                      BOD
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tabela.map((tim) => (
                    <tr
                      key={tim.timId}
                      className={`border-t border-amber-50 ${getRedBoja(tim.pozicija)}`}
                    >
                      <td className="px-5 py-4 font-bold text-lg">
                        {getPozicijaLabel(tim.pozicija)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {tim.logoUrl ? (
                            <img
                              src={tim.logoUrl}
                              alt={tim.naziv}
                              className="w-7 h-7 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}

                          <div
                            style={{ display: tim.logoUrl ? 'none' : 'flex' }}
                            className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-black text-orange-600"
                          >
                            {tim.naziv.charAt(0)}
                          </div>

                          <Link
                            to={`/statistika-tima/${tim.timId}`}
                            className="font-bold text-slate-800 hover:text-orange-600 transition"
                          >
                            {tim.naziv}
                          </Link>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center text-slate-600">
                        {tim.odigrane}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-green-600">
                        {tim.pobjede}
                      </td>
                      <td className="px-5 py-4 text-center text-slate-500">
                        {tim.nerijeseno}
                      </td>
                      <td className="px-5 py-4 text-center text-red-500">
                        {tim.porazi}
                      </td>
                      <td className="px-5 py-4 text-center text-slate-600">
                        {tim.golovi}
                      </td>
                      <td className="px-5 py-4 text-center text-slate-600">
                        {tim.primljeniGolovi}
                      </td>
                      <td className={`px-5 py-4 text-center font-bold ${getGolRazlikaBoja(tim.golRazlika)}`}>
                        {tim.golRazlika > 0 ? `+${tim.golRazlika}` : tim.golRazlika}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex min-w-10 justify-center rounded-2xl bg-orange-50 px-3 py-1 font-black text-orange-600">
                          {tim.bodovi}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {prikaziAI && aiPrediction?.finalTable?.length > 0 && (
          <section className="mt-10 bg-white rounded-[32px] border border-purple-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-purple-100 bg-purple-50">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                AI PREDIKCIJA FINALNOG PORETKA
              </h2>
              <p className="text-slate-500 mt-2">
                AI generisano · {aiPrediction.explanation}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-purple-50 text-left">
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-purple-900/60">#</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-purple-900/60">Tim</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-purple-900/60 text-center">Trenutni bodovi</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-purple-900/60 text-center">AI bodovi</th>
                    <th className="px-5 py-4 font-black text-xs uppercase tracking-widest text-purple-900/60 text-center">Ukupno</th>
                  </tr>
                </thead>

                <tbody>
                  {aiPrediction.finalTable.map((tim) => (
                    <tr key={tim.timId} className="border-t border-purple-50 hover:bg-purple-50/50">
                      <td className="px-5 py-4 font-black text-purple-700">
                        {tim.predictedPosition}
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-800">
                        {tim.naziv}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {tim.currentPoints}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {Number(tim.predictedPoints).toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex min-w-12 justify-center rounded-2xl bg-purple-50 px-3 py-1 font-black text-purple-700">
                          {Number(tim.predictedTotalPoints).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Raspored utakmica samo za otvorenu ligu */}
        {prikaziRaspored && (
          <section className="mt-10">
            <div className="mb-6">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                RASPORED UTAKMICA
              </h2>
              <p className="text-slate-500 mt-2 text-lg">
                Zakazane utakmice za ovu ligu.
              </p>
            </div>

            {loadingUtakmice ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
                <p className="mt-4 font-bold text-slate-500 uppercase tracking-widest text-sm">
                  Učitavanje rasporeda...
                </p>
              </div>
            ) : errorUtakmice ? (
              <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center font-bold">
                {errorUtakmice}
              </div>
            ) : utakmice.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[32px] border border-amber-100 shadow-sm">
                <p className="text-slate-500 text-lg font-medium">
                  Nema zakazanih utakmica za ovu ligu.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {utakmice.map(renderUtakmica)}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default Tabela;