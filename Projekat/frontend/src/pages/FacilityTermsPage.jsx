import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  blockTerm,
  createObjectTerms,
  getObjectDetails,
  getObjectTerms,
  updateTerm,
} from '../api/facilityTermsApi';

const initialForm = {
  datum: '',
  vrijeme: '',
  trajanje: '60',
  ponavljanje: 'JEDNOM',
  brojPonavljanja: '1',
};

const ALL_STATUSES = ['SLOBODAN', 'ZAUZET', 'BLOKIRAN', 'NA_CEKANJU'];
const DAY_LABELS = ['NED', 'PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB'];

function pad(value) {
  return String(value).padStart(2, '0');
}

function toDateInputValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateInput(value) {
  return new Date(`${value}T00:00:00`);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay() || 7;
  next.setDate(next.getDate() - day + 1);
  return next;
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    return {
      key: toDateInputValue(date),
      date,
    };
  });
}

function formatShortDay(date) {
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}, ${DAY_LABELS[date.getDay()]}`;
}

function formatFullDate(dateString) {
  const date = new Date(dateString);
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}.`;
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('bs-BA', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusClass(status) {
  const classes = {
    SLOBODAN: 'bg-green-50 text-green-700 border-green-200',
    ZAUZET: 'bg-blue-50 text-blue-700 border-blue-200',
    BLOKIRAN: 'bg-red-50 text-red-700 border-red-200',
    NA_CEKANJU: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  return classes[status] || classes.SLOBODAN;
}

function normalizeStatus(termin) {
  return termin.status || termin.tipTermina || 'SLOBODAN';
}

function getApiErrorMessage(error, fallback) {
  const code = error.response?.data?.greska;
  const messages = {
    TERMIN_SE_PREKLAPA: 'Termin se preklapa sa već postojećim terminom.',
    NISTE_VLASNIK_OBJEKTA: 'Nemate pravo upravljati terminima ovog sportskog objekta.',
    NISTE_VLASNIK_TERMINA: 'Nemate pravo urediti ili blokirati ovaj termin.',
    TOKEN_ISTEKAO: 'Sesija je istekla. Prijavite se ponovo.',
    NEOVLASTEN: 'Morate biti prijavljeni kao vlasnik objekta.',
    TERMIN_NIJE_PRONADJEN: 'Termin nije pronađen.',
    OBJEKAT_NIJE_PRONADJEN: 'Sportski objekat nije pronađen.',
    NEVALIDAN_DATUM: 'Unesite validan datum i vrijeme.',
    NEVALIDNO_TRAJANJE: 'Trajanje mora biti 60, 90 ili 120 minuta.',
    NEVALIDNO_PONAVLJANJE: 'Ponavljanje mora biti JEDNOM, SEDMICNO ili MJESECNO.',
    NEVALIDAN_BROJ_PONAVLJANJA: 'Broj ponavljanja mora biti pozitivan cijeli broj.',
  };

  return messages[code] || error.response?.data?.poruka || fallback;
}

function datePart(dateString) {
  return toDateInputValue(new Date(dateString));
}

function timePart(dateString) {
  return new Date(dateString).toTimeString().slice(0, 5);
}

function calculateDurationMinutes(termin) {
  const start = new Date(termin.vrijemePocetka);
  const end = new Date(termin.vrijemeZavrsetka);
  const duration = Math.round((end.getTime() - start.getTime()) / 60000);
  return ['60', '90', '120'].includes(String(duration)) ? String(duration) : '60';
}

function groupTermsByDate(termini) {
  const groups = termini.reduce((acc, termin) => {
    const key = datePart(termin.vrijemePocetka);
    if (!acc[key]) acc[key] = [];
    acc[key].push(termin);
    return acc;
  }, {});

  Object.values(groups).forEach((items) => {
    items.sort((first, second) => new Date(first.vrijemePocetka) - new Date(second.vrijemePocetka));
  });

  return groups;
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

function generatePreviewOccurrences(formData) {
  const start = new Date(`${formData.datum}T${formData.vrijeme}:00`);
  const duration = Number(formData.trajanje);
  const count = formData.ponavljanje === 'JEDNOM' ? 1 : Number(formData.brojPonavljanja || 1);

  return Array.from({ length: count }, (_, index) => {
    let occurrenceStart = new Date(start);
    if (formData.ponavljanje === 'SEDMICNO') occurrenceStart = addDays(start, index * 7);
    if (formData.ponavljanje === 'MJESECNO') occurrenceStart = addMonths(start, index);

    return {
      start: occurrenceStart,
      end: new Date(occurrenceStart.getTime() + duration * 60 * 1000),
    };
  });
}

export default function FacilityTermsPage() {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));
  const [facilityName, setFacilityName] = useState('');
  const [termini, setTermini] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [modalError, setModalError] = useState('');
  const [termModalMode, setTermModalMode] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeStatuses, setActiveStatuses] = useState(ALL_STATUSES);

  const weekStart = useMemo(() => startOfWeek(parseDateInput(selectedDate)), [selectedDate]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const weekEndExclusive = useMemo(() => addDays(weekStart, 7), [weekStart]);
  const calendarDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const filteredTermini = useMemo(() => {
    if (activeStatuses.length === 0) return termini;
    return termini.filter((termin) => activeStatuses.includes(normalizeStatus(termin)));
  }, [termini, activeStatuses]);
  const groupedTerms = useMemo(() => groupTermsByDate(filteredTermini), [filteredTermini]);
  const isEditMode = termModalMode === 'edit';
  const detailsStatus = selectedTerm ? normalizeStatus(selectedTerm) : 'SLOBODAN';

  const showNotification = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const loadFacility = async () => {
    try {
      const facility = await getObjectDetails(id);
      setFacilityName(facility?.naziv || '');
    } catch {
      setFacilityName('');
    }
  };

  const loadTerms = async () => {
    setLoading(true);
    try {
      const response = await getObjectTerms(id, weekStart.toISOString(), weekEndExclusive.toISOString());
      setTermini(Array.isArray(response.termini) ? response.termini : []);
    } catch (error) {
      showNotification('error', getApiErrorMessage(error, 'Nije moguće učitati termine.'));
      setTermini([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacility();
  }, [id]);

  useEffect(() => {
    loadTerms();
  }, [id, weekStart]);

  const validateForm = () => {
    if (!formData.datum || !formData.vrijeme) return 'Datum i vrijeme početka su obavezni.';
    if (!['60', '90', '120'].includes(String(formData.trajanje))) return 'Trajanje mora biti 60, 90 ili 120 minuta.';
    if (!['JEDNOM', 'SEDMICNO', 'MJESECNO'].includes(formData.ponavljanje)) return 'Ponavljanje mora biti JEDNOM, SEDMICNO ili MJESECNO.';

    if (!isEditMode && formData.ponavljanje !== 'JEDNOM') {
      const brojPonavljanja = Number(formData.brojPonavljanja);
      if (!Number.isInteger(brojPonavljanja) || brojPonavljanja <= 0) return 'Broj ponavljanja mora biti pozitivan cijeli broj.';
    }

    return null;
  };

  const getLocalOverlapMessage = () => {
    const occurrences = generatePreviewOccurrences(formData);
    const ignoredId = isEditMode ? selectedTerm?.terminId : null;

    const hasOverlap = occurrences.some((occurrence) => (
      termini.some((termin) => {
        if (termin.terminId === ignoredId) return false;
        return overlaps(occurrence.start, occurrence.end, new Date(termin.vrijemePocetka), new Date(termin.vrijemeZavrsetka));
      })
    ));

    return hasOverlap ? 'Termin se preklapa sa već postojećim terminom.' : null;
  };

  const closeTermModal = () => {
    setTermModalMode(null);
    setSelectedTerm(null);
    setSelectedDay(null);
    setModalError('');
    setFormData(initialForm);
  };

  const openCreateModal = (datum = '') => {
    setSelectedTerm(null);
    setSelectedDay(null);
    setModalError('');
    setFormData({
      ...initialForm,
      datum,
      vrijeme: datum ? '08:00' : '',
    });
    setTermModalMode('form');
  };

  const openDetailsModal = (termin) => {
    setSelectedTerm(termin);
    setSelectedDay(null);
    setModalError('');
    setTermModalMode('details');
  };

  const openEditModal = (termin) => {
    setSelectedTerm(termin);
    setSelectedDay(null);
    setModalError('');
    setFormData({
      datum: datePart(termin.vrijemePocetka),
      vrijeme: timePart(termin.vrijemePocetka),
      trajanje: calculateDurationMinutes(termin),
      ponavljanje: 'JEDNOM',
      brojPonavljanja: '1',
    });
    setTermModalMode('edit');
  };

  const openDayModal = (day) => {
    setSelectedDay(day);
    setSelectedTerm(null);
    setModalError('');
    setTermModalMode('day');
  };

  const toggleStatus = (status) => {
    setActiveStatuses((current) => {
      const next = current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status];

      return next.length === 0 ? ALL_STATUSES : next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setModalError(validationError);
      return;
    }

    const localOverlap = getLocalOverlapMessage();
    if (localOverlap) {
      setModalError(localOverlap);
      return;
    }

    const vrijemePocetka = new Date(`${formData.datum}T${formData.vrijeme}:00`).toISOString();
    const payload = {
      vrijemePocetka,
      trajanje: Number(formData.trajanje),
      ponavljanje: formData.ponavljanje,
    };

    if (!isEditMode && formData.ponavljanje !== 'JEDNOM') {
      payload.brojPonavljanja = Number(formData.brojPonavljanja);
    }

    setSaving(true);
    setModalError('');
    try {
      if (isEditMode) {
        const response = await updateTerm(selectedTerm.terminId, {
          vrijemePocetka: payload.vrijemePocetka,
          trajanje: payload.trajanje,
        });
        showNotification('success', response.poruka || 'Termin je uspješno izmijenjen.');
      } else {
        const response = await createObjectTerms(id, payload);
        showNotification('success', response.poruka || 'Termini su uspješno kreirani.');
      }
      closeTermModal();
      await loadTerms();
    } catch (error) {
      setModalError(getApiErrorMessage(error, isEditMode ? 'Greška pri izmjeni termina.' : 'Greška pri kreiranju termina.'));
    } finally {
      setSaving(false);
    }
  };

  const handleBlockTerm = async (termin = selectedTerm) => {
    if (!termin) return;

    try {
      await blockTerm(termin.terminId);
      showNotification('success', 'Termin je blokiran.');
      closeTermModal();
      await loadTerms();
    } catch (error) {
      showNotification('error', getApiErrorMessage(error, 'Greška pri blokiranju termina.'));
    }
  };

  const handleWeekJump = (days) => {
    setSelectedDate(toDateInputValue(addDays(weekStart, days)));
  };

  const handleDatePickerChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const facilityLabel = facilityName || `sportski objekat #${id}`;

  return (
    <div className="min-h-screen bg-amber-50/60 font-sans pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <Link to="/objekti" className="text-xs font-black uppercase tracking-widest text-orange-600 underline underline-offset-4 hover:text-orange-700 hover:opacity-80">
              Nazad na objekte
            </Link>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-2">
              Kalendar <span className="text-orange-600">Termina</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Pregled termina za "{facilityLabel}".
            </p>
          </div>

          <button
            type="button"
            onClick={() => openCreateModal()}
            className="h-12 px-6 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-md shadow-orange-600/20 active:scale-95"
          >
            + Kreiraj termin
          </button>
        </div>

        {statusMessage && (
          <div className={`mb-6 p-4 rounded-2xl border-2 font-bold text-sm shadow-sm ${
            statusMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {statusMessage.text}
          </div>
        )}

        <section className="bg-white rounded-[32px] border-2 border-amber-100 shadow-sm p-5 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-amber-950 uppercase tracking-wide">Sedmični prikaz</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {formatFullDate(weekStart.toISOString())} - {formatFullDate(weekEnd.toISOString())}
              </p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">Skok na datum</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDatePickerChange}
                className="w-full lg:w-56 px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-sm shadow-sm h-12"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[32px] border-2 border-amber-100 shadow-sm p-4 lg:p-5">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5">
            <h2 className="text-lg font-black text-amber-950 uppercase tracking-wide">Kalendar</h2>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => toggleStatus(status)}
                  className={`px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    statusClass(status)
                  } ${activeStatuses.includes(status) ? 'opacity-100 ring-2 ring-orange-100' : 'opacity-40 grayscale'}`}
                  aria-pressed={activeStatuses.includes(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm font-bold text-slate-400">Ucitavanje termina...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
              {calendarDays.map((day) => {
                const dayTerms = groupedTerms[day.key] || [];
                const visibleDayTerms = dayTerms.slice(0, 4);
                return (
                  <div key={day.key} className="bg-amber-50/50 border-2 border-amber-100 rounded-[24px] p-2.5 min-h-64">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-widest text-orange-600 leading-tight">{formatShortDay(day.date)}</div>
                        <div className="text-[11px] font-bold text-slate-400 mt-1">{formatFullDate(day.date.toISOString())}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openCreateModal(day.key)}
                        className="w-7 h-7 rounded-xl bg-white border border-amber-200 text-orange-600 font-black hover:bg-orange-50 transition-colors"
                        aria-label="Kreiraj termin"
                      >
                        +
                      </button>
                    </div>

                    <div className="space-y-2">
                      {dayTerms.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => openCreateModal(day.key)}
                          className="w-full h-28 rounded-2xl border-2 border-dashed border-amber-200 flex items-center justify-center text-center px-3 hover:bg-orange-50/50 transition-colors"
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-700/60">Klik za novi termin</span>
                        </button>
                      ) : (
                        visibleDayTerms.map((termin) => {
                          const status = normalizeStatus(termin);
                          return (
                            <button
                              key={termin.terminId}
                              type="button"
                              onClick={() => openDetailsModal(termin)}
                              className="w-full bg-white border border-amber-100 rounded-2xl p-2.5 shadow-sm text-left hover:border-orange-200 hover:shadow-md transition-all"
                            >
                              <div className="font-black text-slate-800 text-xs">
                                {formatTime(termin.vrijemePocetka)} - {formatTime(termin.vrijemeZavrsetka)}
                              </div>
                              <span className={`inline-flex mt-2 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${statusClass(status)}`}>
                                {status}
                              </span>
                            </button>
                          );
                        })
                      )}
                      {dayTerms.length > 4 && (
                        <button
                          type="button"
                          onClick={() => openDayModal(day)}
                          className="w-full pt-1 text-[10px] font-black uppercase tracking-widest text-orange-600 underline underline-offset-4 hover:text-orange-700"
                        >
                          Vidi sve termine dana
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => handleWeekJump(-7)}
              className="px-5 py-3 bg-white border-2 border-amber-100 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-50 transition-colors"
            >
              Prethodna sedmica
            </button>
            <button
              type="button"
              onClick={() => handleWeekJump(7)}
              className="px-5 py-3 bg-white border-2 border-amber-100 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-50 transition-colors"
            >
              Sljedeća sedmica
            </button>
          </div>
        </section>
      </main>

      {termModalMode === 'details' && selectedTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-white/60 overflow-hidden">
            <div className="px-8 py-6 border-b border-amber-50">
              <h2 className="text-2xl font-black text-slate-800">Detalji termina</h2>
              <p className="text-sm font-medium text-slate-400 mt-1">Pregled osnovnih informacija o terminu.</p>
            </div>

            <div className="px-8 py-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-2xl p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-amber-900/60 mb-1">Datum</div>
                  <div className="font-black text-slate-800">{formatFullDate(selectedTerm.vrijemePocetka)}</div>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-amber-900/60 mb-1">Vrijeme</div>
                  <div className="font-black text-slate-800">{formatTime(selectedTerm.vrijemePocetka)} - {formatTime(selectedTerm.vrijemeZavrsetka)}</div>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-amber-900/60 mb-1">Status</div>
                  <span className={`inline-flex px-3 py-1 rounded-xl border text-[10px] font-black uppercase tracking-widest ${statusClass(detailsStatus)}`}>
                    {detailsStatus}
                  </span>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-amber-900/60 mb-1">Ponavljanje</div>
                  <div className="font-black text-slate-800">{selectedTerm.tipTermina || '-'}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                {detailsStatus !== 'BLOKIRAN' && (
                  <>
                    <button
                      type="button"
                      onClick={() => openEditModal(selectedTerm)}
                      className="px-5 py-3 bg-amber-50 border-2 border-amber-200 text-amber-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-100 transition-colors"
                    >
                      Uredi
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBlockTerm(selectedTerm)}
                      className="px-5 py-3 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-100 transition-colors"
                    >
                      Blokiraj
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={closeTermModal}
                  className="px-5 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors"
                >
                  Zatvori
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {termModalMode === 'day' && selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-white/60 overflow-hidden">
            <div className="px-8 py-6 border-b border-amber-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Termini dana</h2>
                <p className="text-sm font-medium text-slate-400 mt-1">{formatFullDate(selectedDay.date.toISOString())}</p>
              </div>
              <button
                type="button"
                onClick={closeTermModal}
                className="w-10 h-10 bg-slate-50 text-slate-500 rounded-full font-black hover:bg-slate-100 transition-colors"
              >
                X
              </button>
            </div>

            <div className="px-8 py-6 space-y-3">
              {(groupedTerms[selectedDay.key] || []).map((termin) => {
                const status = normalizeStatus(termin);
                return (
                  <button
                    key={termin.terminId}
                    type="button"
                    onClick={() => openDetailsModal(termin)}
                    className="w-full bg-amber-50/70 border-2 border-amber-100 rounded-2xl p-4 text-left hover:border-orange-200 hover:bg-orange-50/60 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black text-slate-800 text-sm">
                        {formatTime(termin.vrijemePocetka)} - {formatTime(termin.vrijemeZavrsetka)}
                      </span>
                      <span className={`shrink-0 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${statusClass(status)}`}>
                        {status}
                      </span>
                    </div>
                  </button>
                );
              })}

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={closeTermModal}
                  className="px-5 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors"
                >
                  Zatvori
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(termModalMode === 'form' || termModalMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl border border-white/60 overflow-hidden">
            <div className="px-8 py-6 border-b border-amber-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800">
                  {isEditMode ? 'Uredi termin' : 'Kreiraj termin'}
                </h2>
                <p className="text-sm font-medium text-slate-400 mt-1">
                  {isEditMode ? 'Izmijenite vrijeme i trajanje pojedinačnog termina.' : 'Dodajte jedan ili više termina za odabrani objekat.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeTermModal}
                className="w-10 h-10 bg-slate-50 text-slate-500 rounded-full font-black hover:bg-slate-100 transition-colors"
              >
                X
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6">
              {modalError && (
                <div className="mb-5 p-4 rounded-2xl border-2 border-red-100 bg-red-50 text-red-700 text-sm font-bold">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">Datum *</label>
                  <input
                    type="date"
                    name="datum"
                    value={formData.datum}
                    onChange={(event) => setFormData((current) => ({ ...current, datum: event.target.value }))}
                    className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-sm shadow-sm h-12"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">Vrijeme početka *</label>
                  <input
                    type="time"
                    name="vrijeme"
                    value={formData.vrijeme}
                    onChange={(event) => setFormData((current) => ({ ...current, vrijeme: event.target.value }))}
                    className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-sm shadow-sm h-12"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">Trajanje *</label>
                  <select
                    name="trajanje"
                    value={formData.trajanje}
                    onChange={(event) => setFormData((current) => ({ ...current, trajanje: event.target.value }))}
                    className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-sm shadow-sm h-12"
                  >
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">120 min</option>
                  </select>
                </div>

                {!isEditMode && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">Ponavljanje *</label>
                    <select
                      name="ponavljanje"
                      value={formData.ponavljanje}
                      onChange={(event) => setFormData((current) => ({ ...current, ponavljanje: event.target.value }))}
                      className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-sm shadow-sm h-12"
                    >
                      <option value="JEDNOM">Jednom</option>
                      <option value="SEDMICNO">Sedmično</option>
                      <option value="MJESECNO">Mjesečno</option>
                    </select>
                    <p className="mt-2 text-xs font-medium text-slate-400">
                      Jednom kreira jedan termin; sedmično ponavlja isti dan i vrijeme; mjesečno ponavlja isti datum i vrijeme.
                    </p>
                  </div>
                )}

                {!isEditMode && formData.ponavljanje !== 'JEDNOM' && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">Broj ponavljanja</label>
                    <input
                      type="number"
                      min="1"
                      name="brojPonavljanja"
                      value={formData.brojPonavljanja}
                      onChange={(event) => setFormData((current) => ({ ...current, brojPonavljanja: event.target.value }))}
                      className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-sm shadow-sm h-12"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={closeTermModal}
                  className="px-6 py-3.5 bg-white border-2 border-amber-200 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3.5 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-md active:scale-95 disabled:opacity-60"
                >
                  {saving ? 'Spasavam...' : isEditMode ? 'Spasi' : 'Kreiraj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
