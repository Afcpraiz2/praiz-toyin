import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Calendar, Sparkles, MessageSquare, Trophy, Star, Camera, 
  Send, Quote, Clock, Music, CheckCircle2, MapPin, 
  Trash2, Plus, Play, Pause, Hourglass, Flame, Infinity as InfinityIcon, Sparkle
} from 'lucide-react';

// FIREBASE IMPORTS
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, 
  serverTimestamp, updateDoc, doc, deleteDoc 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// -------------------------------------------------------------------------
// STEP 1: YOUR FIREBASE CONFIG
// -------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBV_Kh3-3GZzCTDF8t5hIgkxqtqML6swZc",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'praiz-toyin-2029';

const App = () => {
  const couplePhoto = "/our-photo.jpg"; 
  const weddingDate = useMemo(() => new Date("August 4, 2029 00:00:00").getTime(), []);
  const callDate = useMemo(() => new Date("May 27, 2024").getTime(), []); 
  
  const [user, setUser] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [gameScore, setGameScore] = useState(0);
  const [gameState, setGameState] = useState('idle');
  const [hearts, setHearts] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const [thoughts, setThoughts] = useState([]);
  const [bucketList, setBucketList] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [compliment, setCompliment] = useState("");
  const [thoughtInput, setThoughtInput] = useState("");
  const [bucketInput, setBucketInput] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // --- 1. AUTHENTICATION ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth failed:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // --- 2. DATA SYNC (STRICT PATHS FOR PERSISTENCE) ---
  useEffect(() => {
    if (!user) return;

    // Listener for Thoughts
    const thoughtsCol = collection(db, 'artifacts', appId, 'public', 'data', 'thoughts');
    const unsubThoughts = onSnapshot(thoughtsCol, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setThoughts(data);
    }, (err) => console.error("Thoughts Sync Error:", err));

    // Listener for Bucket List
    const bucketCol = collection(db, 'artifacts', appId, 'public', 'data', 'bucketlist');
    const unsubBucket = onSnapshot(bucketCol, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setBucketList(data);
    }, (err) => console.error("Bucket Sync Error:", err));

    return () => { unsubThoughts(); unsubBucket(); };
  }, [user]);

  // --- 3. LIVE TIMER ---
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
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  // --- 4. HANDLERS ---
  const postThought = async (e) => {
    e.preventDefault();
    if (!thoughtInput.trim() || !user || isPosting) return;
    setIsPosting(true);
    try {
      const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'thoughts');
      await addDoc(colRef, {
        author: selectedAuthor,
        text: thoughtInput,
        createdAt: serverTimestamp()
      });
      setThoughtInput(""); 
      setCompliment(""); 
      setSelectedAuthor(null);
    } catch (err) { 
      alert("Database Error: " + err.message + "\nDid you publish the Rules in Firebase?");
    } finally { 
      setIsPosting(false); 
    }
  };

  const addToBucketList = async (e) => {
    e.preventDefault();
    if (!bucketInput.trim() || !user) return;
    try {
      const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'bucketlist');
      await addDoc(colRef, {
        task: bucketInput, completed: false, createdAt: serverTimestamp()
      });
      setBucketInput("");
    } catch (err) { console.error(err); }
  };

  const toggleBucketItem = async (id, current) => {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'bucketlist', id);
      await updateDoc(docRef, { completed: !current });
    } catch (err) { console.error(err); }
  };

  const deleteBucketItem = async (id) => {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'bucketlist', id);
      await deleteDoc(docRef);
    } catch (err) { console.error(err); }
  };

  // UI Handlers
  const handleStartExperience = () => {
    setHasStarted(true);
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log("Audio block", e));
    }
  };

  // --- 5. GAME LOGIC ---
  const startGame = () => { setGameScore(0); setGameState('playing'); setHearts([]); };
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      const id = Math.random();
      setHearts(prev => [...prev, { id, left: Math.random() * 80 + 10 + '%', dur: Math.random() * 2 + 2 }]);
      setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 4000);
    }, 500);
    setTimeout(() => setGameState('finished'), 15000);
    return () => clearInterval(interval);
  }, [gameState]);

  const daysSinceCall = Math.floor((new Date().getTime() - callDate) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-[#fffcfb] text-[#3d332d] font-serif overflow-x-hidden selection:bg-rose-100">
      <AnimatePresence>
        {!hasStarted && (
          <motion.div exit={{ opacity: 0, scale: 1.1 }} className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-6 text-center">
             <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} className="mb-12"><Heart size={80} className="text-rose-400 fill-rose-100" /></motion.div>
             <h1 className="text-4xl md:text-6xl font-light italic mb-4">Praiz & Toyin</h1>
             <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-stone-400 mb-12">August 4, 2029 • The Eternal Vow</p>
             <button onClick={handleStartExperience} className="px-12 py-5 bg-rose-500 text-white rounded-full font-sans font-bold uppercase tracking-widest text-xs shadow-xl">Begin Our Journey</button>
          </motion.div>
        )}
      </AnimatePresence>

      <audio ref={audioRef} loop src="https://www.chosic.com/wp-content/uploads/2021/04/Warm-Spring.mp3" />

      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-10 right-10 z-[100] flex items-center gap-4 bg-white/60 backdrop-blur-2xl border border-white/60 p-2 rounded-full shadow-2xl">
        <AnimatePresence>
          {isPlaying && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} className="flex gap-1 px-4 overflow-hidden">
               {[1,2,3,4,5].map(i => (
                 <motion.div key={i} animate={{ height: [8, 22, 8] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }} className="w-[3px] bg-rose-400 rounded-full" />
               ))}
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => {
            if (isPlaying) { audioRef.current.pause(); } 
            else { audioRef.current.play(); }
            setIsPlaying(!isPlaying);
        }} className="w-16 h-16 bg-rose-500 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg">
          {isPlaying ? <Pause size={24} /> : <Play size={24} fill="white" className="ml-1" />}
        </button>
      </motion.div>

      <nav className="fixed top-0 w-full z-50 px-6 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/40 backdrop-blur-2xl border border-white/40 rounded-full px-10 py-4 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shadow-lg"><Sparkle size={18} className="text-white animate-pulse" /></div>
             <span className="text-2xl font-bold tracking-[0.3em] font-sans">P & T</span>
          </div>
          <div className="hidden lg:flex gap-12 text-[10px] uppercase tracking-[0.4em] font-sans font-black text-stone-500">
            <a href="#stats" className="hover:text-rose-500 transition-colors">Vitals</a>
            <a href="#sanctuary" className="hover:text-rose-500 transition-colors">Sanctuary</a>
            <a href="#blueprint" className="hover:text-rose-500 transition-colors">Blueprint</a>
            <a href="#game" className="hover:text-rose-500 transition-colors">Quest</a>
          </div>
        </div>
      </nav>

      <section className="relative pt-48 pb-40 px-6 text-center">
          <h1 className="text-7xl md:text-[12rem] font-light italic leading-none mb-6 tracking-tighter">Praiz <span className="text-rose-300 font-serif not-italic">&</span> Toyin</h1>
          <p className="text-stone-400 font-sans tracking-[0.8em] uppercase text-xs mb-24 opacity-60">Architects of a Shared Destiny</p>
          
          <div className="relative w-full max-w-5xl mx-auto aspect-[16/8] group">
             <div className="absolute inset-0 bg-rose-50/50 rounded-[5rem] -rotate-1 group-hover:rotate-0 transition-transform duration-1000"></div>
             <div className="relative h-full w-full bg-stone-50 rounded-[5rem] overflow-hidden border-[16px] border-white shadow-2xl flex items-center justify-center">
                <img src={couplePhoto} alt="Praiz and Toyin" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-1000" onError={(e) => e.target.style.display = 'none'} />
                <div className="z-10"><Heart size={64} className="text-rose-200" fill="currentColor" /></div>
                <div className="absolute bottom-12 right-12 text-right z-20">
                   <div className="flex items-center justify-end gap-2 text-white drop-shadow-lg mb-2"><MapPin size={14} /><span className="text-[10px] font-sans font-bold tracking-widest uppercase">Connected Forever</span></div>
                   <p className="text-2xl italic font-serif text-white underline decoration-rose-400 underline-offset-8 drop-shadow-lg">Since May 2024</p>
                </div>
             </div>
          </div>
      </section>

      <section id="stats" className="py-24 bg-white border-y border-stone-50 px-6 text-center">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
             <div className="bg-[#fffcfb] p-10 rounded-[3rem] border border-stone-100"><Flame size={20} className="text-orange-400 mx-auto mb-4" /><h3 className="text-5xl font-light mb-2 tabular-nums">{daysSinceCall}</h3><p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Days of choosing us</p></div>
             <div className="md:col-span-2 bg-rose-500 p-10 rounded-[3.5rem] shadow-2xl text-white">
                <div className="grid grid-cols-4 gap-4 items-center">
                   {[{ l: 'Days', v: timeLeft.days }, { l: 'Hrs', v: timeLeft.hours }, { l: 'Min', v: timeLeft.minutes }, { l: 'Sec', v: timeLeft.seconds }].map((t, i) => (
                     <div key={i}><div className="text-4xl md:text-5xl font-light tabular-nums">{t.v}</div><div className="text-[9px] font-sans font-bold uppercase tracking-widest mt-2 opacity-60">{t.l}</div></div>
                   ))}
                </div>
             </div>
             <div className="bg-[#fffcfb] p-10 rounded-[3rem] border border-stone-100"><CheckCircle2 size={20} className="text-emerald-400 mx-auto mb-4" /><h3 className="text-5xl font-light mb-2 tabular-nums">{bucketList.filter(b => b.completed).length}</h3><p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-400">Dreams Captured</p></div>
        </div>
      </section>

      <section id="sanctuary" className="py-40 px-6 max-w-7xl mx-auto grid lg:grid-cols-5 gap-24">
          <div className="lg:col-span-2">
            <div className="sticky top-40 bg-white p-12 rounded-[4rem] shadow-xl border border-stone-50">
               <AnimatePresence mode="wait">
                  {!selectedAuthor ? (
                    <motion.div key="sel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <p className="text-[10px] font-sans font-black text-stone-300 mb-10 text-center uppercase tracking-widest">Verify Identity</p>
                      <div className="grid grid-cols-2 gap-6">
                         <button onClick={() => { setSelectedAuthor('Praiz'); setCompliment("Praiz, the architect of this union."); }} className="py-6 rounded-3xl border border-stone-100 hover:bg-stone-900 hover:text-white transition-all font-sans font-bold text-[10px] uppercase text-center">Praiz</button>
                         <button onClick={() => { setSelectedAuthor('Toyin'); setCompliment("Toyin, the heartbeat of our future."); }} className="py-6 rounded-3xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all font-sans font-bold text-[10px] uppercase text-center">Toyin</button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                      <div className="mb-10 p-6 bg-stone-50 rounded-3xl text-xs italic text-stone-500 text-center">"{compliment}"</div>
                      <form onSubmit={postThought} className="space-y-6">
                         <textarea value={thoughtInput} onChange={(e) => setThoughtInput(e.target.value)} placeholder="Whisper something..." className="w-full bg-stone-50 rounded-[2.5rem] p-8 border-none focus:ring-2 focus:ring-rose-100 outline-none text-sm italic min-h-[180px] shadow-inner" />
                         <button disabled={isPosting} className="w-full py-6 bg-stone-900 text-white rounded-[2.5rem] font-sans font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
                            {isPosting ? <span className="animate-pulse">Saving...</span> : <><Send size={14} /> Commit to Forever</>}
                         </button>
                         <button type="button" onClick={() => setSelectedAuthor(null)} className="w-full text-[10px] font-sans font-bold uppercase text-stone-300 text-center">Back</button>
                      </form>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </div>
          <div className="lg:col-span-3 space-y-10">
             {thoughts.length === 0 ? (
               <div className="text-center py-20 bg-stone-50 rounded-[4rem] border border-dashed border-stone-200 italic text-stone-400">No whispers yet. Be the first.</div>
             ) : (
               thoughts.map((t) => (
                 <motion.div key={t.id} layout className={`p-12 rounded-[4rem] border relative ${t.author === 'Praiz' ? 'bg-white border-stone-100' : 'bg-[#fffcfd] border-rose-100'}`}>
                    <Quote size={32} className="absolute top-8 right-12 text-rose-100 opacity-30" />
                    <p className="text-stone-700 leading-relaxed text-xl italic mb-10">"{t.text}"</p>
                    <div className="flex items-center justify-between border-t border-stone-50 pt-8">
                       <span className="text-[11px] font-sans font-black tracking-widest text-stone-500 uppercase">{t.author}</span>
                       <span className="text-[10px] text-stone-300 font-sans tracking-widest">{t.createdAt ? new Date(t.createdAt.seconds * 1000).toLocaleDateString() : 'Now'}</span>
                    </div>
                 </motion.div>
               ))
             )}
          </div>
      </section>

      <section id="blueprint" className="py-40 px-6 bg-[#f9f8f6]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-6xl italic mb-24">The 2029 Blueprint</h2>
          <div className="bg-white p-12 rounded-[5rem] shadow-xl border border-stone-100 text-left">
             <form onSubmit={addToBucketList} className="flex flex-col md:flex-row gap-6 mb-16">
                <input value={bucketInput} onChange={(e) => setBucketInput(e.target.value)} placeholder="Dream something new..." className="flex-grow bg-stone-50 border-none rounded-full px-10 py-6 text-sm italic outline-none shadow-inner" />
                <button className="w-20 h-20 bg-stone-900 text-white rounded-full flex items-center justify-center shadow-2xl shrink-0"><Plus size={32} /></button>
             </form>
             <div className="grid md:grid-cols-2 gap-6">
                {bucketList.map(item => (
                  <div key={item.id} className={`flex items-center gap-6 p-8 rounded-[3rem] border ${item.completed ? 'bg-stone-50 border-stone-100 opacity-60' : 'bg-white border-rose-50 shadow-sm'}`}>
                     <button onClick={() => toggleBucketItem(item.id, item.completed)} className="w-10 h-10 border-2 border-stone-200 rounded-full flex items-center justify-center">
                       {item.completed && <CheckCircle2 size={20} className="text-emerald-500" />}
                     </button>
                     <span className={`flex-grow text-sm font-sans font-bold tracking-widest uppercase ${item.completed ? 'text-stone-300 line-through' : 'text-stone-600'}`}>{item.task}</span>
                     <button onClick={() => deleteBucketItem(item.id)} className="text-stone-200 hover:text-rose-500 p-2 transition-colors"><Trash2 size={18} /></button>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      <section id="game" className="py-40 px-6">
        <div className="max-w-2xl mx-auto text-center mb-16"><h2 className="text-4xl italic mb-4">The Quest</h2><p className="text-xs font-sans text-stone-400 tracking-[0.3em] uppercase">Catch 15 Hearts to Unlock Prophecy</p></div>
        <div className="relative h-[500px] max-w-2xl mx-auto bg-white rounded-[5rem] shadow-2xl border border-stone-50 overflow-hidden">
            {gameState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                 <Star size={36} className="text-amber-300 mb-8 animate-spin" />
                 <button onClick={startGame} className="px-16 py-6 bg-stone-900 text-white rounded-full font-sans font-bold uppercase tracking-[0.4em] text-[10px] shadow-2xl transition-all">Invoke Destiny</button>
              </div>
            )}
            {gameState === 'playing' && (
              <>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 text-5xl font-light tabular-nums">{gameScore}</div>
                <AnimatePresence>{hearts.map(h => (<motion.button key={h.id} initial={{ y: -50, x: h.left, opacity: 1 }} animate={{ y: 550 }} exit={{ scale: 0 }} transition={{ duration: h.dur, ease: "linear" }} onClick={() => { setGameScore(s => s + 1); setHearts(p => p.filter(x => x.id !== h.id)); }} className="absolute p-4 text-rose-300 cursor-pointer hover:scale-150 transition-transform"><Heart fill="currentColor" size={44} /></motion.button>))}</AnimatePresence>
              </>
            )}
            {gameState === 'finished' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-16 text-center bg-white/98">
                <Trophy size={72} className="text-amber-400 mb-8" />
                {gameScore >= 15 ? (<div className="p-10 bg-rose-50 rounded-[4rem] text-rose-600 text-sm italic font-medium leading-relaxed">"August 4, 2029: A day of absolute joy. Praiz & Toyin, your love is written in the stars."</div>) : (<div className="space-y-4"><p className="text-stone-400 text-sm italic">You caught {gameScore} hearts. Try again.</p><button onClick={startGame} className="text-rose-500 font-sans font-black text-[11px] uppercase tracking-[0.4em] border-b-2 border-rose-100 pb-1">Retry</button></div>)}
                <button onClick={() => setGameState('idle')} className="mt-12 text-[10px] font-sans font-bold text-stone-300 uppercase tracking-widest">Back</button>
              </div>
            )}
        </div>
      </section>

      <footer className="py-40 text-center bg-white border-t border-stone-100">
         <Heart size={36} className="text-rose-400 mx-auto mb-10" />
         <h2 className="text-3xl italic mb-2 tracking-wide text-stone-800">Praiz & Toyin</h2>
         <p className="font-sans text-[11px] font-black tracking-[0.8em] text-stone-300 uppercase mb-20">United Forever</p>
         <div className="flex flex-col md:flex-row justify-center items-center gap-16 text-[10px] font-sans font-black text-stone-400 tracking-[0.5em] uppercase">
            <div><span>THE START</span><br/><span className="text-stone-800">MAY 2024</span></div>
            <div className="hidden md:block w-px h-16 bg-stone-100"></div>
            <div><span>THE VOW</span><br/><span className="text-stone-800">AUGUST 4, 2029</span></div>
         </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Montserrat', sans-serif; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 20px; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default App;