import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/authApi';

function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [statusMessage, setStatusMessage] = useState(null);

  const onSubmit = async (data) => {
    setStatusMessage(null);
    try {
      await forgotPassword(data.email);
      setStatusMessage({ type: 'success', text: 'Poslan je link za reset lozinke na vaš email.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.poruka || 'Greška pri slanju maila.' });
    }
  };

  return (
    <div className="relative min-h-screen bg-amber-50 flex flex-col justify-center py-12 px-6 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-amber-950 lowercase italic tracking-tighter">
            sport<span className="text-orange-600">.ba</span>
          </h1>
          <h2 className="mt-4 text-2xl font-bold text-slate-700">Zaboravljena lozinka</h2>
          <p className="text-slate-500 mt-2">Unesite email i poslaćemo vam link za reset</p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl py-10 px-8 shadow-2xl rounded-[40px] border border-white/50">
          {statusMessage && (
            <div className={`mb-5 px-5 py-3.5 rounded-2xl text-sm font-semibold border-2 ${
              statusMessage.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-400 text-red-700'
            }`}>
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-amber-900/60 mb-2 ml-1">
                Email adresa
              </label>
              <input
                {...register('email', { required: 'Email je obavezan' })}
                type="email"
                placeholder="ime@primjer.ba"
                className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email.message}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/30 active:scale-95 transform"
              >
                Pošalji link
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-amber-50 pt-6">
            <Link to="/login" className="text-orange-600 font-black hover:underline uppercase text-xs tracking-tighter">
              Nazad na prijavu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;