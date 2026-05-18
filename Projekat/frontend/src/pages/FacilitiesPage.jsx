import { useState, useEffect } from 'react';
import axios from 'axios'; 
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:3000/api/objekti';

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [formData, setFormData] = useState({
    naziv: '',
    adresa: '',
    opis: '',
    kapacitet: '',
    status: 'AKTIVAN'
  });
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const token = localStorage.getItem('token');

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFacilities(response.data);
    } catch (error) {
      showNotification('error', 'Greška pri učitavanju sportskih objekata.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const showNotification = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validacija za naziv
    if (!formData.naziv.trim()) {
      showNotification('error', 'Naziv objekta je obavezan.');
      return;
    }

    // 2. NOVO OGRANIČENJE: Validacija za kapacitet (mora biti veći od 0)
    if (formData.kapacitet !== '' && parseInt(formData.kapacitet, 10) <= 0) {
      showNotification('error', 'Kapacitet objekta mora biti veći od nule.');
      return;
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    const payload = {
      ...formData,
      kapacitet: formData.kapacitet ? parseInt(formData.kapacitet, 10) : null
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload, config);
        showNotification('success', 'Sportski objekat je uspješno izmijenjen.');
      } else {
        await axios.post(API_URL, payload, config);
        showNotification('success', 'Novi sportski objekat je uspješno kreiran.');
      }
      resetForm();
      fetchFacilities();
    } catch (error) {
      showNotification('error', error.response?.data?.error || 'Došlo je do greške prilikom spašavanja.');
    }
  };

  const handleEdit = (facility) => {
    setEditingId(facility.objekatId);
    setDeleteConfirmId(null);
    setFormData({
      naziv: facility.naziv || '',
      adresa: facility.adresa || '',
      opis: facility.opis || '',
      kapacitet: facility.kapacitet || '',
      status: facility.status || 'AKTIVAN'
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('success', 'Objekat je uspješno deaktiviran.');
      setDeleteConfirmId(null);
      fetchFacilities();
    } catch (error) {
      showNotification('error', 'Greška pri brisanju objekta.');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ naziv: '', adresa: '', opis: '', kapacitet: '', status: 'AKTIVAN' });
  };

  return (
    <div className="min-h-screen bg-amber-50/60 font-sans pb-12">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-8">
        {/* Naslov sekcije */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Upravljanje <span className="text-orange-600">Objektima</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Dodajte, uredite ili deaktivirajte Vaše sportske terene i dvorane.
          </p>
        </div>

        {/* Notifikacije */}
        {statusMessage && (
          <div className={`mb-6 p-4 rounded-2xl border-2 font-bold text-sm shadow-sm transition-all ${
            statusMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {statusMessage.text}
          </div>
        )}

        <div className="flex flex-col gap-8">
          
          {/* FORMA ZA DODAVANJE / UREĐIVANJE */}
          <div className="bg-white rounded-[32px] border-2 border-amber-100 shadow-sm p-6 w-full">
            <h3 className="text-lg font-black text-amber-950 uppercase tracking-wide mb-6">
              {editingId ? 'Uredi objekat' : 'Novi objekat'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* PRVI RED */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                <div className="flex flex-col">
                  <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1 h-4">
                    Naziv objekta *
                  </label>
                  <input 
                    type="text" 
                    name="naziv" 
                    value={formData.naziv} 
                    onChange={handleInputChange}
                    placeholder="npr. Dvorana Mirza Delibašić"
                    className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-sm shadow-sm h-12"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1 h-4">
                    Adresa / Grad
                  </label>
                  <input 
                    type="text" 
                    name="adresa" 
                    value={formData.adresa} 
                    onChange={handleInputChange}
                    placeholder="npr. Skenderija bb, Sarajevo"
                    className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-sm shadow-sm h-12"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1 h-4">
                    Kapacitet (broj osoba)
                  </label>
                  <input 
                    type="number" 
                    name="kapacitet" 
                    min="1" 
                    value={formData.kapacitet} 
                    onChange={handleInputChange}
                    placeholder="npr. 50"
                    className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-sm shadow-sm h-12"
                  />
                </div>
              </div>

              {/* DRUGI RED */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                <div className={editingId ? "lg:col-span-1 flex flex-col" : "lg:col-span-2 flex flex-col"}>
                  <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1 h-4">
                    Opis i detalji
                  </label>
                  <textarea 
                    name="opis" 
                    value={formData.opis} 
                    onChange={handleInputChange}
                    rows="1"
                    placeholder="Unesite detalje o podlozi, opremi, terminima..."
                    className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-sm shadow-sm resize-none h-12 flex items-center line-clamp-1"
                  />
                </div>

                {editingId && (
                  <div className="flex flex-col">
                    <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1 h-4">
                      Status objekta
                    </label>
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium text-sm shadow-sm h-12"
                    >
                      <option value="AKTIVAN">Aktivan</option>
                      <option value="NEAKTIVAN">Neaktivan</option>
                    </select>
                  </div>
                )}

                <div className="flex flex-col w-full">
                  <div className="text-xs mb-2 h-4 invisible">Dugmad</div>
                  <div className="flex gap-2 w-full h-12">
                    <button 
                      type="submit" 
                      className="flex-1 h-full bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-700 transition-all shadow-md active:scale-95 transform"
                    >
                      {editingId ? 'Spasi' : 'Kreiraj'}
                    </button>
                    {editingId && (
                      <button 
                        type="button" 
                        onClick={resetForm}
                        className="px-4 h-full bg-white border-2 border-amber-200 text-slate-700 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all"
                      >
                        Otkaži
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* TABELA SA LISTOM OBJEKATA */}
          <div className="bg-white rounded-[32px] border-2 border-amber-100 shadow-sm p-6 w-full overflow-hidden">
            <h3 className="text-lg font-black text-amber-950 uppercase tracking-wide mb-6">
              Moji registrovani objekti
            </h3>

            {loading ? (
              <div className="py-12 text-center text-sm font-bold text-slate-400">Učitavanje podataka...</div>
            ) : facilities.length === 0 ? (
              <div className="py-12 text-center text-sm font-bold text-slate-400">Nemate dodanih aktivnih sportskih objekata.</div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-amber-100 bg-amber-50/40 text-xs font-black uppercase tracking-widest text-amber-900/60">
                      <th className="pb-4 pt-2 px-6">Naziv i opis</th>
                      <th className="pb-4 pt-2 px-6">Lokacija</th>
                      <th className="pb-4 pt-2 px-6 text-center">Kapacitet</th>
                      <th className="pb-4 pt-2 px-6 text-right">Akcije</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-50 text-sm">
                    {facilities.map((facility) => (
                      <tr key={facility.objekatId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">{facility.naziv}</div>
                          {facility.opis && (
                            <div className="text-xs text-slate-400 font-medium max-w-md truncate">{facility.opis}</div>
                          )}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-600">
                          {facility.adresa || 'Nije unesena'}
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-slate-700">
                          {facility.kapacitet ? `${facility.kapacitet} os.` : '/'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {deleteConfirmId === facility.objekatId ? (
                            <div className="flex justify-end items-center gap-2 animate-fadeIn">
                              <span className="text-xs font-black text-red-700 mr-1 uppercase tracking-wider">Sigurni ste?</span>
                              <button 
                                onClick={() => handleDelete(facility.objekatId)}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-colors shadow-sm"
                              >
                                Da
                              </button>
                              <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm"
                              >
                                Ne
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleEdit(facility)}
                                className="px-4 py-1.5 bg-amber-50 border border-amber-200 text-amber-950 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors"
                              >
                                Uredi
                              </button>
                              <button 
                                onClick={() => setDeleteConfirmId(facility.objekatId)}
                                className="px-4 py-1.5 bg-red-50 border border-red-100 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors"
                              >
                                Ukloni
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}