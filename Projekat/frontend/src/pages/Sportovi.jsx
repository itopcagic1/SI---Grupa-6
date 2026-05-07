import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { fetchSports, createSport, updateSport, deleteSport } from '../api/teamApi';

function Sportovi() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const korisnikData = JSON.parse(localStorage.getItem('korisnik') || '{}');
  const isAdmin = korisnikData?.trenutnaUloga === 'ADMINISTRATOR' || korisnikData?.trenutnaUloga === 'ADMIN';

  const { register, handleSubmit, reset, setValue } = useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchSports();
      setSports(data);
    } catch (err) {
      setError('Nije moguće učitati sportove.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openModal = (sport = null) => {
    setSelectedSport(sport);
    if (sport) {
      setValue('naziv', sport.naziv);
      setValue('opis', sport.opis || '');
      setValue('jeTimskiSport', sport.jeTimskiSport);
    } else {
      reset({ naziv: '', opis: '', jeTimskiSport: true });
    }
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (selectedSport) {
        await updateSport(selectedSport.sportId, data);
      } else {
        await createSport(data);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Greška pri spremanju sporta.');
    }
  };

  const handleDelete = async (id) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    try {
      await deleteSport(id);
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      setError('Greška pri brisanju. Provjerite je li sport povezan s timovima.');
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-amber-50/30">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-amber-950">Upravljanje sportovima</h1>
        {isAdmin && (
          <button onClick={() => openModal()} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition">
            + Novi sport
          </button>
        )}
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sports.map((sport) => (
          <div key={sport.sportId} className="bg-white border border-amber-100 p-5 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-amber-950 text-lg">{sport.naziv}</h3>
              <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase ${sport.jeTimskiSport ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                {sport.jeTimskiSport ? 'Timski' : 'Individualni'}
              </span>
            </div>
            <p className="text-sm text-amber-800 mb-4 line-clamp-2">{sport.opis || 'Nema opisa.'}</p>

            {isAdmin && (
              <div className="flex flex-col gap-2 border-t border-amber-50 pt-3">
                {deleteConfirmId === sport.sportId ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600">Jeste li sigurni?</span>
                    <button onClick={() => handleDelete(sport.sportId)} className="text-xs text-red-600 font-bold hover:underline">DA</button>
                    <button onClick={() => setDeleteConfirmId(null)} className="text-xs text-amber-700 font-bold hover:underline">NE</button>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <button onClick={() => openModal(sport)} className="text-xs text-orange-600 font-bold hover:underline">UREDI</button>
                    <button onClick={() => handleDelete(sport.sportId)} className="text-xs text-red-600 font-bold hover:underline">OBRIŠI</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6">{selectedSport ? 'Uredi sport' : 'Dodaj novi sport'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Naziv sporta</label>
                <input {...register('naziv', { required: true })} className="w-full border border-amber-100 rounded-xl px-4 py-2 outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Opis</label>
                <textarea {...register('opis')} className="w-full border border-amber-100 rounded-xl px-4 py-2 outline-none focus:border-orange-500" rows={3} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('jeTimskiSport')} id="timski" className="w-4 h-4 accent-orange-600" />
                <label htmlFor="timski" className="text-sm font-medium">Ovo je timski sport</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 border border-amber-100 rounded-xl font-semibold">Odustani</button>
                <button type="submit" className="flex-1 py-2 bg-orange-600 text-white rounded-xl font-semibold">Sačuvaj</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sportovi;