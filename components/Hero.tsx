import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '../types';
import { Modal } from './Modal';
import { getHeroContent, getSiteSettings } from '../services/contentService';
import { Info, Play } from 'lucide-react';

export const Hero: React.FC = () => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [autoPlayModal, setAutoPlayModal] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoQuality, setVideoQuality] = useState<string>('hd1080');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadHero = async () => {
      const heroContent = await getHeroContent();
      if (heroContent) setMovie(heroContent);

      // Fetch quality setting
      const settings = await getSiteSettings();
      if (settings.heroVideoQuality) {
        setVideoQuality(settings.heroVideoQuality);
      }
    };
    loadHero();
  }, []);

  // YouTube postMessage API for mute control
  useEffect(() => {
    if (iframeRef.current && videoLoaded) {
      const command = isMuted ? 'mute' : 'unMute';
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command }),
        '*'
      );
    }
  }, [isMuted, videoLoaded]);

  // Set video as loaded after a short delay to allow iframe to initialize
  useEffect(() => {
    if (movie?.youtubeId) {
      const timer = setTimeout(() => setVideoLoaded(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [movie?.youtubeId]);

  if (!movie) return <div className="h-[70vh] md:h-[56.25vw] bg-[#141414] animate-pulse flex items-center justify-center text-gray-700">Loading Preview...</div>;

  // Build YouTube embed URL with quality parameter
  const qualityParam = videoQuality !== 'auto' ? `&vq=${videoQuality}` : '';
  const youtubeEmbedUrl = movie.youtubeId
    ? `https://www.youtube.com/embed/${movie.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${movie.youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&start=10&enablejsapi=1&origin=${window.location.origin}${qualityParam}`
    : null;

  return (
    <div className="relative h-[85vh] md:h-[56.25vw] md:max-h-[85vh] w-full bg-[#141414] overflow-hidden group">
      {/* Fallback Backdrop Image - Shows when video not loaded */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${videoLoaded && youtubeEmbedUrl ? 'opacity-0' : 'opacity-100'}`}>
        <img
          src={movie.backdrop_path || 'https://via.placeholder.com/1920x1080'}
          alt={movie.title}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Video Player - Direct iframe embed */}
      {youtubeEmbedUrl && (
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
          <iframe
            ref={iframeRef}
            src={youtubeEmbedUrl}
            title="Hero Video"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] min-w-[200%] min-h-[200%]"
            style={{ border: 'none' }}
          />
        </div>
      )}

      {/* Vignette Overlays - Above video */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent opacity-90 z-[2]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent opacity-90 z-[2]"></div>

      {/* Manual Mute Toggle */}
      {videoLoaded && youtubeEmbedUrl && (
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
