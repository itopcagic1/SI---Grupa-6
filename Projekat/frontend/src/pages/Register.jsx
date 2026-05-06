import { useForm } from 'react-hook-form';
import { registerUser } from '../api/authApi';
import { Link } from 'react-router-dom';

function Register() {
  const { register, handleSubmit, getValues, trigger, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await registerUser(data);
      alert("Uspješna registracija! Status: " + result.poruka_uloge.status);
    } catch (err) {
      alert("Greška: " + (err.response?.data?.poruka || "Nešto nije u redu"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <section className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-500 px-6 py-16 text-white lg:flex-1 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.25),_transparent_35%)] opacity-50 blur-3xl" />
          <div className="absolute inset-y-0 right-0 hidden w-2/3 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),_transparent_55%)] lg:block" />
          <div className="relative z-10 mx-auto w-full max-w-xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/90">
              Platforma uživo
            </span>
            <h1 className="mt-8 text-5xl font-black tracking-tight sm:text-6xl">
              SportManager
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-white/80">
              Pridruži se igri. Organizuj. Takmiči se. Ostani povezan.
            </p>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-lg shadow-slate-950/20 backdrop-blur-xl">
                <p className="text-3xl font-extrabold">500+</p>
                <p className="mt-2 text-sm text-white/75">Aktivne lige</p>
              </div>
              <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-lg shadow-slate-950/20 backdrop-blur-xl">
                <p className="text-3xl font-extrabold">12K+</p>
                <p className="mt-2 text-sm text-white/75">Igrači</p>
              </div>
              <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-lg shadow-slate-950/20 backdrop-blur-xl">
                <p className="text-3xl font-extrabold">98%</p>
                <p className="mt-2 text-sm text-white/75">Zadovoljstvo</p>
              </div>
            </div>
          </div>
        </section>

        <main className="flex flex-1 items-center justify-center px-6 py-12 lg:px-12 lg:py-16">
          <div className="w-full max-w-md rounded-[36px] bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/60 lg:p-10">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Kreiraj račun</p>
              <h2 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">Kreirajte svoj račun</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Počnite upravljati sportskim aktivnostima kroz modernu timsku kontrolnu ploču.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-700">Puno ime</label>
                <input
                  {...register('punoIme', { required: 'Ime je obavezno' })}
                  placeholder="npr. Edin Džeko"
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
                {errors.punoIme && <p className="mt-2 text-sm font-medium text-rose-500">{errors.punoIme.message}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input
                  {...register('email', { required: 'Email je obavezan' })}
                  type="email"
                  placeholder="ime@primjer.ba"
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
                {errors.email && <p className="mt-2 text-sm font-medium text-rose-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Lozinka</label>
                <input
                  {...register('lozinka', { required: 'Lozinka je obavezna', onChange: () => trigger('potvrdalozinke') })}
                  type="password"
                  placeholder="Najmanje 8 znakova"
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
                {errors.lozinka && <p className="mt-2 text-sm font-medium text-rose-500">{errors.lozinka.message}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Potvrdite lozinku</label>
                <input
                  {...register('potvrdalozinke', { required: 'Potvrda lozinke je obavezna', validate: (value) => value === watch('lozinka') || 'Lozinke se ne podudaraju' })}
                  type="password"
                  placeholder="Ponovo unesite lozinku"
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
                {errors.potvrdalozinke && <p className="mt-2 text-sm font-medium text-rose-500">{errors.potvrdalozinke.message}</p>}
              </div>

              <button
                type="submit"
                className="mt-1 w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-lg shadow-violet-500/20 transition duration-200 hover:from-violet-500 hover:to-indigo-500 hover:shadow-xl hover:scale-[1.03] focus:outline-none"
              >
                Registruj se
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Već imate račun?{' '}
              <Link to="/login" className="font-semibold text-violet-600 hover:underline hover:text-violet-700">
                Prijavi se
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Register;
