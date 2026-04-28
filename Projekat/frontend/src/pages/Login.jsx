import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authApi';

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await loginUser(data);

      localStorage.setItem('token', res.access_token);
      localStorage.setItem('korisnik', JSON.stringify(res.korisnik));

      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.poruka || 'Greška pri prijavi');
    }
  };

  return (
    <div className="relative min-h-screen bg-amber-50 flex flex-col justify-center py-12 px-6 font-sans overflow-hidden">
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-amber-950 lowercase italic tracking-tighter">
            sport<span className="text-orange-600">.ba</span>
          </h1>
          <h2 className="mt-4 text-2xl font-bold text-slate-700">Dobrodošli nazad</h2>
          <p className="text-slate-500 mt-2">Unesite podatke za pristup svom profilu</p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl py-10 px-8 shadow-2xl rounded-[40px] border border-white/50">
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

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-amber-900/60">
                  Lozinka
                </label>
                <a href="#" className="text-[10px] font-bold text-orange-600 hover:underline uppercase tracking-tighter">
                  Zaboravili ste lozinku?
                </a>
              </div>
              <input
                {...register('lozinka', { required: 'Lozinka je obavezna' })}
                type="password"
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm"
              />
              {errors.lozinka && <p className="text-red-500 text-xs mt-1 font-bold">{errors.lozinka.message}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/30 active:scale-95 transform"
              >
                Prijavi se
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-amber-50 pt-6">
            <p className="text-sm text-slate-400 font-medium">
              Nemaš nalog?{' '}
              <Link to="/register" className="text-orange-600 font-black hover:underline ml-1 uppercase text-xs tracking-tighter">
                Registruj se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;