import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '../types';
import { Modal } from './Modal';
import { getHeroContent } from '../services/contentService'; // Changed import
import { getImage } from '../services/tmdb'; // Helper utility only
import { Info, Play } from 'lucide-react';

export const Hero: React.FC = () => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [autoPlayModal, setAutoPlayModal] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHero = async () => {
      // Fetch dynamic hero from Firestore
      const heroContent = await getHeroContent();
      if (heroContent) setMovie(heroContent);
    };
    loadHero();
  }, []);

  useEffect(() => {
    if (playerRef.current && playerRef.current.mute && playerRef.current.unMute) {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(100);
      }
    }
  }, [isMuted]);

  useEffect(() => {
    const ensureYouTubeAPI = () =>
      new Promise<any>((resolve) => {
        const w = window as any;
        if (w.YT && w.YT.Player) resolve(w.YT);
        else {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          document.body.appendChild(tag);
          w.onYouTubeIframeAPIReady = () => resolve(w.YT);
        }
      });

    const setMaxQuality = (player: any) => {
      if (!player || !player.getAvailableQualityLevels) return;
      const levels: string[] = player.getAvailableQualityLevels() || [];
      const order = ['highres', 'hd1080', 'hd720', 'large', 'medium', 'small'];
      const best = order.find(q => levels.includes(q)) || 'highres';
      if (player.setPlaybackQuality) player.setPlaybackQuality(best);
    };

    const initPlayer = async () => {
      if (!movie?.youtubeId || !containerRef.current) return;
      const YT = await ensureYouTubeAPI();
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { }
        playerRef.current = null;
      }
      playerRef.current = new YT.Player(containerRef.current, {
        videoId: movie.youtubeId,
        playerVars: {
          autoplay: 1,
          mute: 1, // Start muted strictly for browser policy
          playsinline: 1,
          controls: 0,
          rel: 0,
          loop: 1,
          playlist: movie.youtubeId, // Required for loop
          modestbranding: 1,
          iv_load_policy: 3,
          start: 10,
          origin: window.location.origin
        },
        events: {
          onReady: (e: any) => {
            try {
              e.target.mute();
            } catch { }
            try { e.target.playVideo(); } catch { }
            setMaxQuality(e.target);
          },
          onStateChange: (ev: any) => {
            try {
              const state = ev?.data;
              if (state === YT.PlayerState.PLAYING) {
                setVideoLoaded(true);
              }
              // Restart video when it ends to ensure continuous loop
              if (state === YT.PlayerState.ENDED) {
                try {
                  ev.target.seekTo(10); // Start from 10 seconds
                  ev.target.playVideo();
                } catch { }
              }
            } catch { }
          }
        }
      });
    };

    initPlayer();
    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { }
        playerRef.current = null;
      }
    };
  }, [movie?.youtubeId]);

  if (!movie) return <div className="h-[70vh] md:h-[56.25vw] bg-[#141414] animate-pulse flex items-center justify-center text-gray-700">Loading Preview...</div>;

  return (
    <div className="relative h-[85vh] md:h-[56.25vw] md:max-h-[85vh] w-full bg-[#141414] overflow-hidden group">
      {/* Fallback Backdrop Image - Shows when video not loaded */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}>
        <img
          src={movie.backdrop_path || 'https://via.placeholder.com/1920x1080'}
          alt={movie.title}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Video Player - Above backdrop, below content */}
      <div className="absolute inset-0 w-full h-full scale-[1.35] pointer-events-none z-[1]">
        <div
          ref={containerRef}
          id="hero-yt-player"
          className={`w-full h-full transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
      </div>
      <style>{`
        #hero-yt-player iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>

      {/* Vignette Overlays - Above video */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent opacity-90 z-[2]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent opacity-90 z-[2]"></div>

      {/* Manual Mute Toggle (Always visible if video loaded) */}
      {videoLoaded && (
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-[25%] right-8 z-30 border border-white/30 rounded-full p-3 bg-black/20 hover:bg-white/10 transition backdrop-blur-sm hidden md:flex items-center justify-center"
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          )}
        </button>
      )}

      {/* Content */}
      <div className="absolute top-[25%] md:top-[30%] left-4 md:left-12 max-w-xl space-y-4 md:space-y-6 z-10 w-full pr-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold drop-shadow-xl text-white tracking-tighter leading-tight">
          {movie.title}
        </h1>
        <div className="flex items-center gap-3 text-white font-semibold drop-shadow-md text-lg">
          <span className="text-[#46d369]">98% Match</span>
          <span className="text-gray-300">{movie.release_date?.substring(0, 4) || '2023'}</span>
          <span className="border border-white/40 px-1 text-xs rounded-sm bg-black/20 uppercase">{movie.type}</span>
        </div>
        <p className="text-base md:text-lg text-white drop-shadow-md line-clamp-3 text-shadow-md w-full md:w-full font-medium leading-relaxed">
          {movie.overview}
        </p>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 pt-4 w-full md:w-auto">
          <button
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-white text-black px-6 md:px-8 py-3 md:py-3 rounded md:rounded-md font-bold hover:bg-white/80 transition text-lg md:text-xl active:scale-95"
            onClick={() => {
              setAutoPlayModal(true);
              setShowModal(true);
            }}
          >
            <Play fill="black" size={24} />
            Play
          </button>
          <button
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[rgba(109,109,110,0.7)] text-white px-6 md:px-8 py-3 md:py-3 rounded md:rounded-md font-bold hover:bg-[rgba(109,109,110,0.4)] transition text-lg md:text-xl active:scale-95"
            onClick={() => {
              setAutoPlayModal(false);
              setShowModal(true);
            }}
          >
            <Info size={24} />
            More Info
          </button>
        </div>
      </div>

      {showModal && <Modal movie={movie} autoPlay={autoPlayModal} onClose={() => setShowModal(false)} />}
    </div>
  );
};
