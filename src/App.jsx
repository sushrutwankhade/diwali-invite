import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Camera, 
  Share2, 
  Check,
  PartyPopper,
  AlertTriangle,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDB4VDCmqlgX-hmN3yWQnIsQyC2MhPXtZQ",
  authDomain: "diwali-party-2026.firebaseapp.com",
  projectId: "diwali-party-2026",
  storageBucket: "diwali-party-2026.firebasestorage.app",
  messagingSenderId: "844512823947",
  appId: "1:844512823947:web:d6bf0f7658982f23ea228e"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'diwali-invite-app';

// --- STYLES & ANIMATIONS ---
const customStyles = `
  @keyframes brutalPop {
    0% { transform: scale(0.3) rotate(-15deg); opacity: 0; }
    50% { transform: scale(1.15) rotate(7deg); opacity: 1; }
    75% { transform: scale(0.9) rotate(-3deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes wobble {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    15% { transform: translateX(-10px) rotate(-10deg); }
    30% { transform: translateX(15px) rotate(10deg); }
    45% { transform: translateX(-15px) rotate(-7deg); }
    60% { transform: translateX(10px) rotate(5deg); }
    75% { transform: translateX(-5px) rotate(-2deg); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideUpBounce {
    0% { transform: translateY(100vh) rotate(10deg); opacity: 0; }
    60% { transform: translateY(-20px) rotate(-5deg); opacity: 1; }
    80% { transform: translateY(10px) rotate(2deg); opacity: 1; }
    100% { transform: translateY(0) rotate(0deg); opacity: 1; }
  }
  @keyframes popInDelay {
    0% { transform: scale(0) rotate(20deg); opacity: 0; }
    80% { transform: scale(1.2) rotate(20deg); opacity: 1; }
    100% { transform: scale(1) rotate(20deg); opacity: 1; }
  }
  @keyframes floatContinuous {
    0% { transform: translateY(0px) rotate(-2deg); }
    50% { transform: translateY(-15px) rotate(3deg); }
    100% { transform: translateY(0px) rotate(-2deg); }
  }
  @keyframes aggressiveScale {
    0% { transform: scale(0.3) translateY(100px) rotate(-15deg); opacity: 0; }
    60% { transform: scale(1.1) translateY(-20px) rotate(5deg); opacity: 1; }
    100% { transform: scale(1) translateY(0) rotate(0deg); opacity: 1; }
  }
  @keyframes spinCrazy {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.1); }
    100% { transform: rotate(360deg) scale(1); }
  }
  @keyframes ignitePulse {
    0%, 100% { transform: scale(1) rotate(-8deg); }
    50% { transform: scale(1.15) rotate(8deg) translateY(-10px); }
  }
  .animate-step {
    animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .sunburst-bg {
    background-image: repeating-conic-gradient(
      from 0deg, 
      transparent 0deg 15deg, 
      rgba(0, 0, 0, 0.08) 15deg 30deg
    );
  }
  .brutal-border {
    border: 4px solid #000;
  }
  .brutal-shadow {
    box-shadow: 6px 6px 0px 0px rgba(0,0,0,1);
    transition: all 0.2s ease;
  }
  .brutal-shadow:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
  }
  .brutal-shadow:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);
  }
  .brutal-shadow-sm {
    box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
  }
  
  ::-webkit-scrollbar {
    width: 12px;
  }
  ::-webkit-scrollbar-track {
    background: #fff;
    border-left: 4px solid #000;
  }
  ::-webkit-scrollbar-thumb {
    background: #FBC02D;
    border-left: 4px solid #000;
    border-bottom: 4px solid #000;
  }
`;

// --- DATA ---
const FIT_OPTIONS = [
  { id: 1, name: 'LAAL TAMATAR', desc: 'Poster Red', sub: 'Ketchup-coded confidence.', color: 'bg-[#E53935]', text: 'text-white' },
  { id: 2, name: 'HALDI GANG', desc: 'Marigold Yellow', sub: 'Glowing before the diyas do.', color: 'bg-[#FBC02D]', text: 'text-black' },
  { id: 3, name: 'HARI MIRCH', desc: 'Emerald Green', sub: 'Spicy. Sharp. Slightly dangerous.', color: 'bg-[#2E7D32]', text: 'text-white' },
  { id: 4, name: 'MOR PANKH', desc: 'Peacock Blue', sub: 'Peacock confidence, on loop.', color: 'bg-[#0288D1]', text: 'text-white' },
  { id: 5, name: 'GULABI SCENE', desc: 'Hot Pink', sub: 'Loud, lovely, a little extra.', color: 'bg-[#D81B60]', text: 'text-white' },
  { id: 6, name: 'ORANGE BARFI', desc: 'Saffron Orange', sub: 'Sweet, saffron, sorted.', color: 'bg-[#EF6C00]', text: 'text-white' },
];

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    };
  });
};

export default function App() {
  // --- GLOBAL STATE ---
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [selectedOutfit, setSelectedOutfit] = useState(FIT_OPTIONS[1]);
  
  // LIVE FIREBASE STATE
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  // UI STATE
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showRudeModal, setShowRudeModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // --- FIREBASE AUTH & DB SYNC ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      }
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Photos Sync
    const photosRef = collection(db, 'artifacts', appId, 'public', 'data', 'photos');
    const unsubPhotos = onSnapshot(photosRef, (snapshot) => {
      const photos = [];
      snapshot.forEach(doc => photos.push({ id: doc.id, ...doc.data() }));
      photos.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setUploadedPhotos(photos);
    }, (err) => {
      console.error("Photos listener error:", err);
    });

    return () => {
      unsubPhotos();
    };
  }, [user]);

  // --- UTILITIES ---
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 3500);
  };

  const goToStep = (newStep) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(newStep);
      if (newStep > maxStepReached) setMaxStepReached(newStep);
      setIsTransitioning(false);
    }, 300);
  };

  const handleAddCalendar = () => {
    showToast("Event downloading! Check your files.", "success");
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20261031T133000Z
DTEND:20261031T183000Z
SUMMARY:Diwali Party @ 705 C Wing
LOCATION:705 c wing, 33 Keshavkunj Society, Keshav Nagar, Pune
DESCRIPTION:Diwali Party at My Place. Skipping small talk, straight to mithai and main character moments.
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'diwali_party_scene.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- REUSABLE COMPONENTS ---
  const ToastMessage = () => (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
      <div className={`
        px-6 py-4 rounded-full brutal-border brutal-shadow-sm font-black flex items-center gap-3 text-lg uppercase tracking-wide
        ${toast.type === 'error' ? 'bg-red-500 text-white' : toast.type === 'success' ? 'bg-green-400 text-black' : 'bg-white text-black'}
      `}>
        {toast.type === 'error' ? <AlertTriangle size={24} /> : toast.type === 'success' ? <Check size={24} /> : <PartyPopper size={24} />}
        {toast.message}
      </div>
    </div>
  );

  const RudeModal = () => {
    if (!showRudeModal) return null;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-step">
         <div className="bg-yellow-400 brutal-border p-8 rounded-3xl brutal-shadow max-w-sm w-full text-center relative">
           <div className="absolute -top-6 -right-6 text-6xl drop-shadow-md">🤬</div>
           <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-black drop-shadow-[2px_2px_0_#fff]">
             G### mara<br/>mt aa
           </h2>
           <button 
             onClick={() => setShowRudeModal(false)} 
             className="bg-black text-white px-6 py-4 rounded-xl font-black text-xl brutal-border hover:bg-gray-800 transition-colors w-full shadow-[4px_4px_0_0_#fff]"
           >
             OKAY, MY BAD
           </button>
         </div>
      </div>
    );
  };

  const Header = () => (
    <header className="fixed top-0 left-0 w-full p-4 flex flex-col sm:flex-row justify-between items-center z-50 gap-3 pointer-events-none bg-gradient-to-b from-white/50 to-transparent sm:bg-none">
      <div className="pointer-events-auto flex items-center gap-2 bg-white px-5 py-2 brutal-border rounded-full brutal-shadow-sm font-black text-sm md:text-base uppercase">
        <span className="text-xl">🪔</span> DIWALI SCENE
      </div>
      <div className="pointer-events-auto flex gap-2 bg-white/90 backdrop-blur-md p-2 rounded-full brutal-border brutal-shadow-sm">
        {[1, 2, 3, 4, 5].map((s) => (
          <button 
            key={s} 
            onClick={() => s <= maxStepReached ? goToStep(s) : null}
            disabled={s > maxStepReached}
            className={`w-10 h-10 rounded-full border-[3px] border-black flex items-center justify-center font-black text-sm transition-all
              ${currentStep === s ? 'bg-yellow-400 ring-2 ring-black scale-110' : ''}
              ${s < currentStep ? 'bg-green-400 cursor-pointer hover:bg-green-300' : ''}
              ${s > maxStepReached ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60' : 'cursor-pointer hover:-translate-y-1'}
            `}
          >
            {s < currentStep ? <Check size={18} strokeWidth={4} /> : s}
          </button>
        ))}
      </div>
    </header>
  );

  // --- STEPS ---

  // STEP 1: LANDING
  const Step1Landing = () => (
    <div className="min-h-screen bg-[#E53935] flex flex-col items-center justify-center relative overflow-hidden p-6 text-center">
      <div className="absolute inset-[-100%] sunburst-bg sunburst-spin opacity-40 pointer-events-none"></div>
      
      <div className="z-10 max-w-2xl pt-16" style={{ animation: 'aggressiveScale 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
        <div>
          <h1 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter drop-shadow-[6px_6px_0_rgba(0,0,0,1)] leading-none mb-2">
            DIL WAALI
          </h1>
          <h1 className="text-7xl md:text-9xl font-black text-yellow-400 italic tracking-tighter drop-shadow-[6px_6px_0_rgba(0,0,0,1)] leading-none mb-6">
            Diwali
          </h1>
        
          <div className="mx-auto mb-10 relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mt-12">
            <div className="absolute inset-0 bg-yellow-400 brutal-border border-[6px] rounded-full brutal-shadow" style={{ animation: 'spinCrazy 8s infinite linear' }}>
              <div className="w-full h-full border-[6px] border-dashed border-black rounded-full opacity-40 scale-90"></div>
            </div>
            <div className="relative text-[7rem] md:text-[9rem] leading-none z-10 drop-shadow-[6px_6px_0_rgba(0,0,0,1)]" style={{ animation: 'ignitePulse 2s infinite ease-in-out' }}>
              🪔
            </div>
          </div>

          <p className="text-white font-bold text-lg md:text-xl max-w-md mx-auto mb-10 brutal-border bg-black/50 p-5 rounded-2xl backdrop-blur-sm shadow-[6px_6px_0_0_#000]">
            This Diwali, we're skipping the small talk and going straight to the mithai, masti and main character moments.
          </p>

          <div>
            <button onClick={() => goToStep(2)} className="group bg-yellow-400 text-black brutal-border rounded-full px-10 py-5 font-black text-2xl md:text-3xl uppercase tracking-wide brutal-shadow flex items-center gap-3 mx-auto transition-transform active:scale-95">
              ENTER THE SCENE <ArrowRight className="group-hover:translate-x-2 transition-transform" strokeWidth={5}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // STEP 2: REVEAL
  const Step2Reveal = () => (
    <div className="min-h-screen bg-[#2E7D32] flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 sunburst-bg pt-44 sm:pt-32">
      <div className="w-full max-w-5xl animate-step">
        <div className="flex flex-col lg:flex-row gap-0 bg-[#FDF9F1] brutal-border rounded-3xl overflow-hidden shadow-[12px_12px_0_0_#000]">
          
          <div className="p-8 lg:p-12 lg:w-3/5 border-b-4 lg:border-b-0 lg:border-r-4 border-black border-dashed relative bg-[#FFF8E7]">
            <div className="absolute top-6 left-6 text-sm font-black bg-black text-white px-3 py-1.5 rounded brutal-border shadow-sm">NO. 001</div>
            <div className="absolute top-6 right-6 text-sm font-black bg-pink-500 text-white px-3 py-1.5 rounded brutal-border rotate-3 shadow-sm">LIMITED PRINT</div>
            
            <div className="mt-14 mb-8 border-4 border-black rounded-t-[100px] overflow-hidden bg-orange-500 aspect-[4/3] flex items-center justify-center brutal-shadow relative">
              <div className="text-[120px] z-10 animate-pulse drop-shadow-xl">🌼</div>
            </div>

            <h2 className="text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-red-600 drop-shadow-[3px_3px_0_#000]">
              PLOT TWIST:<br/>
              <span className="text-green-700 italic lowercase font-serif pr-2">TU invited</span><br/>
              HAI!
            </h2>
          </div>

          <div className="p-8 lg:p-10 lg:w-2/5 flex flex-col justify-center bg-[#1A1A1A] text-white relative">
            <div className="text-yellow-400 font-black tracking-widest text-sm mb-8 flex justify-between items-center border-b-4 border-white/20 pb-4">
              <span>ADMIT ONE • BEST FIT</span>
              <span className="text-xl">✨</span>
            </div>

            <div className="space-y-6 mb-10">
              <div className="grid grid-cols-[80px_1fr] border-b-2 border-white/10 pb-3 items-center">
                <span className="text-gray-400 font-black text-xs uppercase tracking-wider">Event</span>
                <span className="font-black text-lg leading-tight text-white">Diwali at My Place</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] border-b-2 border-white/10 pb-3 items-center">
                <span className="text-gray-400 font-black text-xs uppercase tracking-wider">Date</span>
                <span className="font-black text-2xl text-yellow-400 leading-tight">Sat, 31 October 2026</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] border-b-2 border-white/10 pb-3 items-center">
                <span className="text-gray-400 font-black text-xs uppercase tracking-wider">Time</span>
                <span className="font-black text-lg leading-tight text-white">7:00 PM onwards</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] border-b-2 border-white/10 pb-3 items-start">
                <span className="text-gray-400 font-black text-xs uppercase tracking-wider pt-1">Venue</span>
                <span className="font-bold leading-tight text-white/90">705 c wing, 33 Keshavkunj Society, Keshav Nagar, Pune</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] border-b-2 border-white/10 pb-3 items-center">
                <span className="text-gray-400 font-black text-xs uppercase tracking-wider">Host</span>
                <span className="font-black text-lg leading-tight text-pink-400">MOON BHAU</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-auto">
              <button 
                onClick={() => setShowRudeModal(true)}
                className="w-full bg-gray-800 text-gray-300 brutal-border border-gray-600 rounded-xl py-3 font-black text-lg uppercase hover:bg-red-600 hover:text-white hover:border-black transition-all shadow-[4px_4px_0_0_#000]"
              >
                IS BAAR NAHI
              </button>
              
              <div className="flex gap-4">
                <button onClick={handleAddCalendar} className="w-1/2 bg-white text-black brutal-border rounded-xl py-3 font-black uppercase hover:bg-gray-200 transition-colors brutal-shadow-sm flex items-center justify-center gap-2 text-sm sm:text-base">
                  <Calendar size={18} strokeWidth={3}/> CALENDAR
                </button>
                <button 
                  onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=705+c+wing,+33+Keshavkunj+Society,+Keshav+Nagar,+Pune', '_blank')} 
                  className="w-1/2 bg-pink-500 text-white brutal-border rounded-xl py-3 font-black uppercase hover:bg-pink-400 transition-colors brutal-shadow-sm flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <MapPin size={18} strokeWidth={3}/> MAPS
                </button>
              </div>

              <div className="flex gap-4 mt-4">
                <button onClick={() => goToStep(1)} className="w-1/3 bg-white text-black brutal-border rounded-xl py-4 font-black text-lg uppercase hover:bg-gray-200 brutal-shadow flex items-center justify-center transition-transform active:translate-y-1">
                  BACK
                </button>
                <button onClick={() => goToStep(3)} className="w-2/3 bg-yellow-400 text-black brutal-border rounded-xl py-4 font-black text-xl uppercase hover:bg-yellow-300 brutal-shadow flex items-center justify-center gap-2 transition-transform active:translate-y-1">
                  NEXT <ArrowRight strokeWidth={4}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // STEP 3: FIT CHECK
  const Step3FitCheck = () => (
    <div className="min-h-screen bg-[#FDF9F1] flex flex-col justify-start sm:justify-center p-4 sm:p-6 pb-24 pt-44 sm:pt-32">
      <div className="max-w-6xl mx-auto w-full animate-step">
        <div className="mb-10 md:mb-14">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-black leading-[0.9] drop-shadow-[4px_4px_0_#000]">
            FIT CHECK, <br/>
            <span className="text-pink-600 italic font-serif lowercase">festive</span> EDITION.
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="lg:w-3/5 grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
            {FIT_OPTIONS.map((fit) => (
              <button
                key={fit.id}
                onClick={() => setSelectedOutfit(fit)}
                className={`
                  ${fit.color} ${fit.text} p-6 rounded-2xl brutal-border text-left transition-all relative overflow-hidden group
                  ${selectedOutfit.id === fit.id 
                    ? 'shadow-[8px_8px_0_0_#000] -translate-y-2 ring-4 ring-black ring-offset-4 ring-offset-[#FDF9F1]' 
                    : 'shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000]'}
                `}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-black text-white text-sm font-black px-3 py-1 rounded-full brutal-border">0{fit.id}</span>
                    {selectedOutfit.id === fit.id && (
                      <div className="bg-white text-black rounded-full p-1.5 brutal-border shadow-sm animate-bounce">
                        <Check size={20} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  <h3 className="font-black text-2xl xl:text-3xl uppercase tracking-tighter leading-none mb-2">{fit.name}</h3>
                  <p className="font-serif italic text-base md:text-lg opacity-95 mb-4">{fit.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:w-2/5 flex flex-col gap-6">
            <div className={`${selectedOutfit.color} brutal-border rounded-[2rem] p-8 shadow-[10px_10px_0_0_#000] text-black relative overflow-hidden transition-colors duration-500`}>
              <div className="relative z-10">
                <div className="flex justify-between items-center border-b-4 border-black/20 pb-4 mb-6">
                  <span className="font-black text-sm uppercase tracking-widest bg-black text-white px-4 py-2 rounded-lg brutal-border">
                    FIT PASS
                  </span>
                </div>
                <div className="bg-white brutal-border px-5 py-2 -rotate-3 w-fit shadow-[4px_4px_0_0_#000] font-black text-red-600 mb-8 text-xl">FIT LOCKED IN ✓</div>
                <div className={`${selectedOutfit.text} mt-4`}>
                  <h3 className="font-black text-5xl uppercase tracking-tighter leading-none">{selectedOutfit.name}</h3>
                  <p className="text-base font-bold opacity-90 mt-4 border-t-4 border-current/30 pt-4">
                    {selectedOutfit.sub}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-2">
              <button onClick={() => goToStep(2)} className="w-1/3 bg-white text-black brutal-border rounded-2xl py-5 font-black text-xl uppercase hover:bg-gray-200 transition-colors brutal-shadow flex items-center justify-center">
                BACK
              </button>
              <button onClick={() => goToStep(4)} className="w-2/3 bg-pink-500 text-white brutal-border rounded-2xl py-5 font-black text-2xl uppercase hover:bg-pink-400 transition-colors brutal-shadow flex items-center justify-center gap-3">
                CONFIRM FIT <ArrowRight strokeWidth={4}/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // STEP 4: PHOTO WALL (Live Gossip Archive)
  const Step4PhotoWall = () => {
    const fileInputRef = useRef(null);

    const handlePhotoUpload = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;
      if (!user) {
        showToast("Waiting for live connection...", "error");
        return;
      }
      
      showToast("Compressing & uploading to live wall...", "info");

      for (const file of files) {
        try {
          const base64DataUrl = await compressImage(file);
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'photos'), {
            userId: user.uid,
            url: base64DataUrl,
            timestamp: serverTimestamp()
          });
        } catch (err) {
          console.error("Upload error:", err);
          showToast("Upload failed.", "error");
        }
      }
      showToast("Pic pushed to live archive!", "success");
    };

    return (
      <div className="min-h-screen bg-[#FDF9F1] p-4 sm:p-6 pt-44 sm:pt-32 flex flex-col items-center justify-start sm:justify-center sunburst-bg">
        <div className="w-full max-w-6xl animate-step">
          
          <div className="bg-pink-600 brutal-border rounded-[2rem] p-8 md:p-14 shadow-[12px_12px_0_0_#000] mb-12 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-black uppercase tracking-tighter leading-[0.85] drop-shadow-[5px_5px_0_#fff]">
                DIWALI KI<br/>
                <span className="text-white italic font-serif lowercase drop-shadow-[5px_5px_0_#000]">gossip</span> ARCHIVE <span className="inline-block hover:scale-110 transition-transform">📸</span>
              </h1>
              <p className="text-white font-black text-2xl mt-8 mb-12 bg-black inline-block px-5 py-3 brutal-border -rotate-2 shadow-[4px_4px_0_0_#FBC02D]">
                Proof that we actually touched grass.
              </p>

              <div className="flex flex-wrap gap-5">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload}
                />
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="bg-yellow-400 text-black brutal-border rounded-xl px-8 py-4 font-black uppercase brutal-shadow flex items-center gap-3 text-xl"
                >
                  ADD YOUR PIC <Upload strokeWidth={4} />
                </button>
              </div>
            </div>
          </div>

          {uploadedPhotos.length === 0 ? (
            <div className="bg-white border-4 border-dashed border-black/40 rounded-[2rem] p-16 md:p-24 text-center max-w-4xl mx-auto shadow-[12px_12px_0_0_rgba(0,0,0,0.1)]">
              <h3 className="font-black text-4xl uppercase tracking-tighter mb-4 text-black">THE ARCHIVE IS EMPTY — FOR NOW.</h3>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="bg-black text-white brutal-border rounded-xl px-10 py-5 font-black text-xl uppercase shadow-[6px_6px_0_0_#FFB300] mt-4"
              >
                BE THE FIRST
              </button>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {uploadedPhotos.map((photo, index) => (
                <div key={photo.id} className="break-inside-avoid animate-step" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="bg-white p-4 brutal-border rounded-xl shadow-[8px_8px_0_0_#000] rotate-1 hover:rotate-0 transition-transform">
                    <img src={photo.url} alt={`Live Upload ${index}`} className="w-full h-auto rounded-lg brutal-border object-cover border-2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-20 mb-12 text-center border-t-8 border-black pt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => goToStep(3)}
              className="bg-white text-black brutal-border rounded-full px-12 py-6 font-black text-2xl uppercase hover:bg-gray-200 brutal-shadow inline-flex items-center gap-4 transition-transform active:translate-y-1"
            >
              BACK
            </button>
            <button 
              onClick={() => goToStep(5)}
              className="bg-green-500 text-black brutal-border rounded-full px-16 py-6 font-black text-3xl uppercase hover:bg-green-400 brutal-shadow inline-flex items-center gap-4 transition-transform active:translate-y-1"
            >
              NEXT: SUMMARY <ArrowRight strokeWidth={5} size={32}/>
            </button>
          </div>

        </div>
      </div>
    );
  };

  // STEP 5: FINAL SCENE (Summary Details)
  const Step5Summary = () => {
    return (
      <div className="min-h-screen bg-[#E53935] flex flex-col justify-start items-center p-4 sm:p-6 sunburst-bg relative overflow-hidden pt-44 sm:pt-32 pb-16">
        <div className="max-w-7xl w-full flex flex-col lg:flex-row gap-12 lg:gap-20 items-center relative z-10 animate-step">
          
          {/* Left Summary Area */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-yellow-400 uppercase tracking-tighter drop-shadow-[6px_6px_0_rgba(0,0,0,1)] leading-[0.85] mb-8">
              SCENE SET <br/>
              <span className="text-white">HAI.</span> <br/>
              TU BAS <br/>
              <span className="text-white italic font-serif lowercase">aaja.</span>
            </h1>

            <p className="text-white font-bold text-xl max-w-lg mb-8 brutal-border bg-black/40 p-6 rounded-2xl backdrop-blur-sm shadow-[6px_6px_0_0_#000]">
              Lock the date in your calendar, turn up in your fit, and get ready for good vibes and endless fun!
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
              <button onClick={() => goToStep(4)} className="bg-white text-black brutal-border rounded-xl px-8 py-4 font-black uppercase brutal-shadow flex items-center gap-3 text-lg hover:bg-gray-200 transition-transform active:translate-y-1">
                BACK
              </button>
              <button onClick={handleAddCalendar} className="bg-yellow-400 text-black brutal-border rounded-xl px-8 py-4 font-black uppercase brutal-shadow flex items-center gap-3 text-lg hover:bg-yellow-300 transition-transform active:translate-y-1">
                <Calendar size={24} strokeWidth={3}/> ADD CALENDAR
              </button>
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-[#1A1A1A] brutal-border rounded-[2rem] p-8 md:p-12 shadow-[16px_16px_0_0_#000] relative">
              <div className="text-yellow-400 font-black tracking-widest text-sm mb-12 flex justify-between items-center border-b-4 border-white/20 pb-5">
                <span>YOUR SCENE, SUMMARISED</span>
                <span className="text-3xl">🎟️</span>
              </div>

              <div className="space-y-8 text-white">
                <div className="bg-white/5 p-5 rounded-2xl brutal-border border-white/20">
                  <span className="text-green-400 font-black text-sm uppercase tracking-widest block mb-3 flex items-center gap-2"><Calendar size={18}/> WHEN</span>
                  <div className="font-black text-3xl drop-shadow-[2px_2px_0_#000]">Saturday, 31 October 2026<br/>@ 7:00 PM</div>
                </div>
                
                <div className="bg-white/5 p-5 rounded-2xl brutal-border border-white/20">
                  <span className="text-pink-400 font-black text-sm uppercase tracking-widest block mb-3 flex items-center gap-2"><MapPin size={18}/> WHERE</span>
                  <div className="font-bold text-2xl leading-tight drop-shadow-[2px_2px_0_#000]">
                    705 c wing, 33 Keshavkunj Society,<br/>Keshav Nagar, Pune
                  </div>
                </div>

                <div className="bg-white/5 p-5 rounded-2xl brutal-border border-white/20">
                  <span className="text-yellow-400 font-black text-sm uppercase tracking-widest block mb-3">YOUR FIT</span>
                  <div className="font-bold text-2xl flex items-center gap-4">
                    <span className={`w-10 h-10 rounded-full brutal-border border-white shadow-sm ${selectedOutfit.color}`}></span>
                    <div className="flex flex-col">
                      <span className="drop-shadow-[2px_2px_0_#000] font-black">{selectedOutfit.name}</span>
                      <span className="italic font-serif opacity-80 text-base text-gray-300">{selectedOutfit.desc}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="relative font-sans antialiased text-gray-900 selection:bg-yellow-400 selection:text-black overflow-x-hidden bg-[#E53935]">
        <ToastMessage />
        <RudeModal />

        <div className={`transition-opacity duration-500 ${currentStep > 1 ? 'opacity-100' : 'opacity-0'}`}>
          <Header />
        </div>
        
        <main className={`transition-all duration-300 transform ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {currentStep === 1 && <Step1Landing />}
          {currentStep === 2 && <Step2Reveal />}
          {currentStep === 3 && <Step3FitCheck />}
          {currentStep === 4 && <Step4PhotoWall />}
          {currentStep === 5 && <Step5Summary />}
        </main>
      </div>
    </>
  );
}