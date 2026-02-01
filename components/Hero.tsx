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
          mute: 1,
          playsinline: 1,
          controls: 0,
          rel: 0,
          loop: 1,
          playlist: movie.youtubeId,
          modestbranding: 1,
          iv_load_policy: 3,
          start: 10,
          origin: window.location.origin
        },
        events: {
          onReady: (e: any) => {
            try {
              e.target.mute(); // Ensure muted
              e.target.setVolume(0); // Set volume to 0
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

  if (!movie) return <div className="h-[56.25vw] bg-[#141414] animate-pulse flex items-center justify-center text-gray-700">Loading Preview...</div>;

  return (
    <div className="relative h-[56.25vw] max-h-[85vh] w-full bg-[#141414] overflow-hidden group">
      <div className="absolute inset-0 w-full h-full scale-[1.35] pointer-events-none">
        <div ref={containerRef} className={`w-full h-full opacity-0 transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : ''}`} />
      </div>

      <div className={`absolute inset-0 transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}>
        <img
          src={movie.backdrop_path || 'https://via.placeholder.com/1920x1080'}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Vignette Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent opacity-90"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-90"></div>

      {/* Content */}
      <div className="absolute top-[20%] md:top-[30%] left-4 md:left-12 max-w-xl space-y-4 md:space-y-6 z-10">
        <h1 className="text-4xl md:text-7xl font-bold drop-shadow-xl text-white tracking-tighter">
          {movie.title}
        </h1>
        <div className="flex items-center gap-3 text-white font-semibold drop-shadow-md text-lg">
          <span className="text-[#46d369]">98% Match</span>
          <span className="text-gray-300">{movie.release_date?.substring(0, 4) || '2023'}</span>
          <span className="border border-white/40 px-1 text-xs rounded-sm bg-black/20 uppercase">{movie.type}</span>
        </div>
        <p className="text-base md:text-lg text-white drop-shadow-md line-clamp-3 text-shadow-md w-[90%] md:w-full font-medium">
          {movie.overview}
        </p>

        <div className="flex items-center gap-4 pt-4">
          <button
            className="flex items-center gap-2 bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded md:rounded-md font-bold hover:bg-white/80 transition text-lg md:text-xl"
            onClick={() => {
              setAutoPlayModal(true);
              setShowModal(true);
            }}
          >
            <Play fill="black" size={24} />
            Play
          </button>
          <button
            className="flex items-center gap-2 bg-[rgba(109,109,110,0.7)] text-white px-6 md:px-8 py-2 md:py-3 rounded md:rounded-md font-bold hover:bg-[rgba(109,109,110,0.4)] transition text-lg md:text-xl"
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
