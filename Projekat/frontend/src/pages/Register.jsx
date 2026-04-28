import { useForm } from 'react-hook-form';
import { registerUser } from '../api/authApi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; 

function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await registerUser(data);
      alert("Uspješna registracija! Status: " + result.poruka_uloge.status);
    } catch (err) {
      alert("Greška: " + (err.response?.data?.poruka || "Nešto nije u redu"));
    }
  };

  return (
    <div className="relative min-h-screen bg-amber-50 flex flex-col justify-center py-12 px-6 lg:px-8 font-sans overflow-hidden">
      
      <motion.div 
        initial={{ x: -200, y: -200, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 0.07 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-[15%] left-[10%] md:left-[20%] text-[10rem] select-none grayscale hover:grayscale-0 transition-all duration-700 -rotate-12"
      >
        🏀
      </motion.div>
    
      <motion.div 
        initial={{ x: -200, y: 200, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 0.07 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className="absolute bottom-[10%] left-[5%] md:left-[15%] text-[12rem] select-none grayscale hover:grayscale-0 transition-all duration-700 rotate-12"
      >
        ⚽
      </motion.div>
      
      <motion.div 
        initial={{ x: 200, y: -200, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 0.07 }}
        transition={{ duration: 1.3, ease: "easeOut", delay: 0.1 }}
        className="absolute top-[10%] right-[5%] md:right-[18%] text-[9rem] select-none grayscale hover:grayscale-0 transition-all duration-700 rotate-45"
      >
        🎾
      </motion.div>
      
      <motion.div 
        initial={{ x: 200, y: 200, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 0.07 }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
        className="absolute bottom-[15%] right-[10%] md:right-[20%] text-[11rem] select-none grayscale hover:grayscale-0 transition-all duration-700 -rotate-45"
      >
        🏐
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
          <h1 className="text-5xl font-black text-amber-950 lowercase italic tracking-tighter">
            sport<span className="text-orange-600">.ba</span>
          </h1>
          <h2 className="mt-4 text-2xl font-bold text-slate-700">Napravi novi račun</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium tracking-wide">Postani dio naše sportske zajednice</p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/90 backdrop-blur-md py-10 px-8 shadow-[0_20px_50px_rgba(234,88,12,0.1)] rounded-[40px] border border-white/50">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* ime i prezime */}
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.1em] text-amber-900/50 mb-2 ml-1">Ime i Prezime</label>
                <input 
                  {...register("punoIme", { required: "Ime je obavezno" })} 
                  placeholder="npr. Edin Džeko"
                  className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm"
                />
              </div>

              {/* email */}
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.1em] text-amber-900/50 mb-2 ml-1">Email adresa</label>
                <input 
                  {...register("email", { required: "Email je obavezan" })} 
                  type="email"
                  placeholder="ime@primjer.ba"
                  className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm"
                />
              </div>

              {/* lozinka */}
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.1em] text-amber-900/50 mb-2 ml-1">Lozinka</label>
                <input 
                  {...register("lozinka", { required: "Lozinka je obavezna" })} 
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-medium shadow-sm"
                />
              </div>

              {/* uloga */}
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.1em] text-amber-900/50 mb-2 ml-1">Registruj se kao</label>
                <div className="relative">
                  <select 
                    {...register("trazenaUloga")}
                    className="w-full px-5 py-3.5 bg-white border-2 border-amber-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold text-amber-950 appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="NAVIJAC">Navijač</option>
                    <option value="IGRAC">Igrač</option>
                    <option value="TRENER">Trener</option>
                    <option value="VLASNIK">Vlasnik sportskog objekta</option>
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-orange-600 font-bold italic text-xl">
                    ↓
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/30 active:scale-95 transform"
                >
                  Registruj se
                </button>
              </div>
            </form>

            <div className="mt-8 text-center border-t border-amber-50 pt-6">
              <p className="text-sm text-slate-400 font-medium">
                Već imaš nalog? <Link to="/login" className="text-orange-600 font-black hover:underline ml-1 uppercase text-xs tracking-tighter">Prijavi se</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;