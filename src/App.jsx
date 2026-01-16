import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Trophy, Star, Quote, MapPin, Play, Pause, 
  Flame, Infinity as InfinityIcon, Sparkle, 
  Sun, Moon, Sparkles, Anchor, Milestone, 
  Wind, Navigation, Clover, Eye, Gem, 
  Send, Ghost, RotateCcw
} from 'lucide-react';

// FIREBASE (Auth only for stability)
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBV_Kh3-3GZzCTDF8t5hIgkxqtqML6swZc",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const App = () => {
  const couplePhoto = "/our-photo.jpg"; 
  const weddingDate = useMemo(() => new Date("August 4, 2029 00:00:00").getTime(), []);
  const callDate = useMemo(() => new Date("May 27, 2024").getTime(), []); 
  
  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- THE ATMOSPHERE SWITCHER ---
  const themes = {
    day: { bg: "bg-[#FDFBF7]", text: "text-[#3E4A3D]", accent: "text-[#A8B89F]", card: "bg-white", border: "border-[#E5EBE0]", lantern: "bg-[#E5D3B3]" },
    twilight: { bg: "bg-[#2C3E50]", text: "text-[#ECF0F1]", accent: "text-[#D4AF37]", card: "bg-[#34495E]", border: "border-[#5D6D7E]", lantern: "bg-[#D4AF37]" }
  };
  const [theme, setTheme] = useState('day');

  // --- THE LOVE ORACLE ---
  const prophecies = [
    { title: "Our Foundation", text: "By 2029, our roots will be deeper than any storm could reach.", icon: <Anchor className="text-blue-400" /> },
    { title: "Our Adventure", text: "Laughter will be the primary language spoken in our new home.", icon: <Navigation className="text-orange-400" /> },
    { title: "Our Prosperity", text: "Our hands will build more than a house; we will build a legacy.", icon: <Gem className="text-emerald-400" /> },
    { title: "Our Peace", text: "Peace will forever be in our sanctuary.", icon: <Wind className="text-teal-400" /> }
  ];
  const [selectedProphecy, setSelectedProphecy] = useState(null);

  // --- NEW GAME: FLOATING LANTERNS ---
  const blessings = [
    "Our love is a guiding light.",
    "Our future is bright and golden.",
    "Our hearts beat as one.",
    "Our laughter fills the sky.",
    "Our journey is just beginning.",
    "Our bond is unbreakable.",
    "Our peace is found in each other."
  ];

  const [lanterns, setLanterns] = useState([]);

  const releaseLantern = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newLantern = {
      id: Date.now(),
      x,
      y,
      text: blessings[Math.floor(Math.random() * blessings.length)]
    };

    setLanterns((prev) => [...prev, newLantern]);

    setTimeout(() => {
      setLanterns((prev) => prev.filter((l) => l.id !== newLantern.id));
    }, 6000);
  };

  // --- LIVE TIMER LOGIC ---
  useEffect(() => {
    const updateTimer = () => {
      const distance = weddingDate - new Date().getTime();
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };
    
    // Initial call to prevent 1s delay
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  const daysSinceCall = Math.floor((new Date().getTime() - callDate) / (1000 * 60 * 60 * 24));
  const t = themes[theme];

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} transition-colors duration-1000 font-serif selection:bg-[#A8B89F]/30`}>
      
      {/* Entry Logic */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-6 text-center">
             <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="mb-8">
                <Heart size={40} className="text-[#A8B89F] fill-[#A8B89F]/10" />
             </motion.div>
             <h1 className="text-4xl font-serif italic mb-2 tracking-tight">Praiz & Toyin</h1>
             <p className="text-stone-400 font-sans text-[9px] tracking-[0.6em] uppercase mb-12">The 2029 Vow</p>
             <button 
               onClick={() => { setHasStarted(true); signInAnonymously(auth).catch(() => {}); }} 
               className="px-10 py-4 bg-[#3E4A3D] text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
             >
               Open Experience
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      <audio ref={audioRef} loop src="https://www.chosic.com/wp-content/uploads/2021/04/Warm-Spring.mp3" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 p-10 flex justify-between items-center pointer-events-none">
        <span className="text-xl italic font-bold tracking-tighter pointer-events-auto">P&T</span>
        <div className="flex gap-4 pointer-events-auto">
           <button onClick={() => setTheme(theme === 'day' ? 'twilight' : 'day')} className="p-3 bg-white/40 backdrop-blur-md rounded-full shadow-sm border border-black/5">
             {theme === 'day' ? <Moon size={16} /> : <Sun size={16} className="text-white" />}
           </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-48 pb-20 px-6 text-center">
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-6xl md:text-[10rem] italic leading-none mb-10 tracking-tighter">
            Praiz <span className={`${t.accent} not-italic`}>&</span> Toyin
          </motion.h1>
          
          <div className="max-w-4xl mx-auto relative group">
             <div className={`absolute inset-0 ${t.accent} opacity-5 rounded-[3rem] rotate-1 group-hover:rotate-0 transition-all duration-1000`}></div>
             <div className={`relative aspect-[16/9] ${t.card} rounded-[3rem] overflow-hidden border ${t.border} shadow-2xl`}>
                <img src={couplePhoto} alt="Our Story" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Heart size={64} className="text-white opacity-20" fill="currentColor" />
                </div>
                <div className="absolute bottom-10 right-10 text-right">
                   <p className="text-2xl italic">August 4, 2029</p>
                   <p className="text-[8px] font-sans font-bold uppercase tracking-[0.4em] mt-2 opacity-50">The Covenant Date</p>
                </div>
             </div>
          </div>
      </section>

      {/* Countdown & Vitals */}
      <section className="py-20 px-6 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className={`${t.card} p-8 rounded-[2.5rem] border ${t.border}`}>
             <Flame size={18} className="mx-auto mb-4 text-orange-400" />
             <h4 className="text-4xl italic mb-1 tabular-nums">{daysSinceCall}</h4>
             <p className="text-[8px] font-sans font-bold tracking-widest uppercase opacity-40">Days of Unity</p>
          </div>
          <div className="col-span-2 p-8 bg-[#3E4A3D] rounded-[3rem] text-white flex items-center justify-center">
             <div className="grid grid-cols-4 gap-6 md:gap-4 text-center w-full">
                {[ 
                  { l: 'DAYS', v: timeLeft.days }, 
                  { l: 'HRS', v: timeLeft.hours }, 
                  { l: 'MIN', v: timeLeft.minutes },
                  { l: 'SEC', v: timeLeft.seconds }
                ].map((u, i) => (
                  <div key={i}>
                     <div className="text-3xl md:text-5xl italic leading-none tabular-nums">{u.v}</div>
                     <div className="text-[7px] font-sans font-bold tracking-[0.3em] uppercase mt-2 opacity-40">{u.l}</div>
                  </div>
                ))}
             </div>
          </div>
          <div className={`${t.card} p-8 rounded-[2.5rem] border ${t.border}`}>
             <Sparkle size={18} className="mx-auto mb-4 text-amber-400" />
             <h4 className="text-4xl italic mb-1">May</h4>
             <p className="text-[8px] font-sans font-bold tracking-widest uppercase opacity-40">The Beginning</p>
          </div>
      </section>

      {/* The Love Oracle Section */}
      <section className="py-40 px-6 max-w-6xl mx-auto">
         <div className="text-center mb-20">
            <h2 className="text-4xl italic mb-4">The Love Oracle</h2>
            <p className="text-[9px] font-sans font-bold uppercase tracking-[0.4em] opacity-40">Tap a path to reveal our blessing</p>
         </div>
         <div className="grid md:grid-cols-4 gap-6">
            {prophecies.map((p, i) => (
              <motion.button 
                key={i}
                whileHover={{ y: -10 }}
                onClick={() => setSelectedProphecy(p)}
                className={`${t.card} p-10 rounded-[3rem] border ${t.border} text-center group transition-all`}
              >
                 <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Sparkles size={16} className="text-stone-300" />
                 </div>
                 <h3 className="text-lg italic">{p.title}</h3>
              </motion.button>
            ))}
         </div>

         <AnimatePresence>
            {selectedProphecy && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-white/80 backdrop-blur-xl">
                 <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="max-w-md w-full p-12 bg-[#3E4A3D] text-white rounded-[4rem] text-center shadow-2xl relative">
                    <button onClick={() => setSelectedProphecy(null)} className="absolute top-8 right-8 text-white/40 uppercase text-[9px] tracking-widest">Close</button>
                    <div className="mb-8 flex justify-center scale-150">{selectedProphecy.icon}</div>
                    <h2 className="text-3xl italic mb-6">{selectedProphecy.title}</h2>
                    <p className="text-xl italic leading-relaxed opacity-80">"{selectedProphecy.text}"</p>
                    <div className="mt-10 pt-8 border-t border-white/10 text-[9px] font-sans font-bold uppercase tracking-[0.4em]">Prophecy for 2029</div>
                 </motion.div>
              </motion.div>
            )}
         </AnimatePresence>
      </section>

      {/* NEW GAME: Floating Lanterns */}
      <section className={`py-40 px-6 overflow-hidden ${theme === 'day' ? 'bg-stone-50/50' : 'bg-[#243342]'}`}>
         <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl italic mb-4">Floating Lanterns</h2>
            <p className="text-[9px] font-sans font-bold uppercase tracking-[0.4em] opacity-40 mb-20">Tap the sky to release our shared blessings</p>
            
            <div 
              onClick={releaseLantern}
              className="relative h-[500px] w-full border border-dashed border-stone-200 rounded-[4rem] cursor-crosshair overflow-hidden group shadow-inner"
            >
               <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                  <Star size={100} className="text-stone-400" />
               </div>
               
               <AnimatePresence>
                  {lanterns.map((l) => (
                    <motion.div
                      key={l.id}
                      initial={{ y: 500, x: l.x, opacity: 0, scale: 0.5 }}
                      animate={{ y: -100, opacity: [0, 1, 1, 0], scale: 1.2 }}
                      transition={{ duration: 6, ease: "easeOut" }}
                      className="absolute pointer-events-none"
                    >
                       <div className={`p-4 ${t.lantern} rounded-t-full rounded-b-lg shadow-2xl flex flex-col items-center gap-2 border border-white/20`}>
                          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_white]" />
                          <p className="text-[10px] whitespace-nowrap font-sans font-bold uppercase tracking-widest text-stone-800">
                             {l.text}
                          </p>
                       </div>
                    </motion.div>
                  ))}
               </AnimatePresence>

               {lanterns.length === 0 && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-stone-300 italic">The sky is waiting for us...</p>
                 </div>
               )}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-40 text-center px-6">
         <Heart size={24} className={`${t.accent} mx-auto mb-10 opacity-30`} />
         <h2 className="text-3xl italic mb-4 tracking-tighter text-stone-800">Praiz & Toyin</h2>
         <p className="text-[9px] font-sans font-black tracking-[0.8em] text-stone-300 uppercase mb-20">The Eternal Bond</p>
         <div className="flex flex-col md:flex-row justify-center items-center gap-16 text-[8px] font-sans font-bold text-stone-400 tracking-[0.4em] uppercase">
            <div className="flex flex-col gap-2"><span>OUR FOUNDATION</span><span className={t.text}>MAY 2024</span></div>
            <div className="hidden md:block w-px h-10 bg-stone-200"></div>
            <div className="flex flex-col gap-2"><span>OUR COVENANT</span><span className={t.text}>AUGUST 4, 2029</span></div>
         </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Montserrat:wght@100;400;700;900&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Montserrat', sans-serif; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #A8B89F; }
      `}</style>
    </div>
  );
};

export default App;