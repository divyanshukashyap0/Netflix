import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '../types';
import { useStore } from '../context/Store';
import { getImage } from '../services/tmdb';
import { getContentBySection } from '../services/contentService';
import { X, Play, Plus, Check, ThumbsUp, ArrowLeft } from 'lucide-react';

interface ModalProps {
  movie: Movie;
  onClose: () => void;
  autoPlay?: boolean;
  onSwitchMovie?: (movie: Movie) => void;
}

export const Modal: React.FC<ModalProps> = ({ movie, onClose, autoPlay = false, onSwitchMovie }) => {
  const { myList, addToMyList, removeFromMyList } = useStore();
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<string>('');
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const inList = myList.includes(movie.id);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);

  // Reset playing state and scroll to top when movie changes
  useEffect(() => {
    setIsPlaying(autoPlay);
    // Scroll to top of modal for visibility of video
    if (scrollerRef.current) {
      scrollerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [movie.id, autoPlay]);

  useEffect(() => {
    const fetchSimilar = async () => {
      // Mock "More Like This" by fetching trending/default content
      // In a real app, this would use an algorithm based on movie.genres
      const movies = await getContentBySection({
        id: 'similar',
        title: 'Similar',
        type: 'trending',
        order: 0,
        enabled: true
      });
      // Filter out current movie and limit to 9
      setSimilarMovies(movies.filter(m => m.id !== movie.id).slice(0, 9));
    };
    fetchSimilar();
  }, [movie.id]);

  const toggleList = () => {
    if (inList) removeFromMyList(movie.id);
    else addToMyList(movie);
  };

  const handleAudioTrackChange = (trackId: string) => {
    if (playerRef.current && playerRef.current.setOption) {
      try {
        playerRef.current.setOption('captions', 'track', { languageCode: trackId });
        setCurrentAudioTrack(trackId);
        setShowAudioMenu(false);
      } catch (e) {
        console.error('Failed to change audio track:', e);
      }
    }
  };

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
      if (!isPlaying || !movie.youtubeId || !containerRef.current) return;
      const YT = await ensureYouTubeAPI();
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { }
        playerRef.current = null;
      }
      playerRef.current = new YT.Player(containerRef.current, {
        videoId: movie.youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          cc_load_policy: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (e: any) => {
            setMaxQuality(e.target);
            try { e.target.playVideo(); } catch { }

            // Try to get available audio tracks (YouTube API limitation: not all videos support this)
            try {
              const options = e.target.getOptions();
              if (options && options.length > 0) {
                setAudioTracks(options);
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
  }, [isPlaying, movie.youtubeId]);

  return (
    <div
      ref={scrollerRef}
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-4 md:py-8 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[850px] bg-[#181818] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-[#181818] rounded-full p-2 hover:bg-[#2a2a2a] transition"
        >
          <X size={24} />
        </button>

        {/* Video / Cover Area */}
        <div className="relative h-[280px] md:h-[400px] bg-black group">

          {!isPlaying ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent z-[5]" />
              <img
                src={getImage(movie.backdrop_path, 'original')}
                alt={movie.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute bottom-10 left-10 z-10 max-w-lg">
                <h2 className="text-5xl font-bold mb-6 drop-shadow-lg tracking-tighter">{movie.title}</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="flex items-center gap-2 bg-white text-black px-8 py-2 rounded font-bold hover:bg-opacity-90 transition text-lg"
                  >
                    <Play fill="black" size={24} />
                    Play
                  </button>
                  <button
                    onClick={toggleList}
                    className="flex items-center justify-center border-2 border-gray-500 bg-[#2a2a2a]/60 text-white p-2 rounded-full hover:border-white transition"
                  >
                    {inList ? <Check size={24} /> : <Plus size={24} />}
                  </button>
                  <button className="flex items-center justify-center border-2 border-gray-500 bg-[#2a2a2a]/60 text-white p-2 rounded-full hover:border-white transition">
                    <ThumbsUp size={24} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full relative">
              <button
                onClick={() => setIsPlaying(false)}
                className="absolute top-4 left-4 z-30 bg-black/50 p-2 rounded-full hover:bg-black/80 text-white flex items-center gap-2"
              >
                <ArrowLeft size={20} /> Back
              </button>

              {/* Audio Language Selector - Repositioned for visibility */}
              <div className="absolute bottom-4 right-4 z-30">
                <div className="relative">
                  <button
                    onClick={() => setShowAudioMenu(!showAudioMenu)}
                    className="bg-black/70 px-3 py-2 rounded hover:bg-black/90 text-white flex items-center gap-2 text-xs md:text-sm font-medium backdrop-blur-sm"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">Audio & Subtitles</span>
                    <span className="sm:hidden">A/S</span>
                  </button>

                  {showAudioMenu && (
                    <div className="absolute bottom-12 right-0 bg-black/95 border border-gray-700 rounded-lg p-3 md:p-4 w-[200px] md:min-w-[250px] shadow-xl max-h-[50vh] overflow-y-auto">
                      <div className="text-white space-y-3">
                        <div>
                          <h4 className="text-xs md:text-sm font-bold mb-2 text-gray-300 uppercase tracking-wide">Audio</h4>
                          <div className="space-y-1">
                            {['English', 'Hindi', 'Spanish', 'French', 'German'].map((lang) => (
                              <button
                                key={lang}
                                onClick={() => handleAudioTrackChange(lang.toLowerCase())}
                                className={`w-full text-left px-2 md:px-3 py-1.5 md:py-2 rounded text-xs md:text-sm hover:bg-gray-800 transition ${currentAudioTrack === lang.toLowerCase() ? 'bg-gray-700 text-white font-semibold' : 'text-gray-300'
                                  }`}
                              >
                                {lang}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="border-t border-gray-700 pt-3">
                          <h4 className="text-xs md:text-sm font-bold mb-2 text-gray-300 uppercase tracking-wide">Subtitles</h4>
                          <div className="space-y-1">
                            <button className="w-full text-left px-2 md:px-3 py-1.5 md:py-2 rounded text-xs md:text-sm hover:bg-gray-800 transition text-gray-300">
                              Off
                            </button>
                            {['English', 'Hindi', 'Spanish'].map((lang) => (
                              <button
                                key={lang}
                                className="w-full text-left px-2 md:px-3 py-1.5 md:py-2 rounded text-xs md:text-sm hover:bg-gray-800 transition text-gray-300"
                              >
                                {lang}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div ref={containerRef} className="w-full h-full" />
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-[#181818]">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <span className="text-[#46d369] font-bold">98% Match</span>
              <span className="text-gray-400">2023</span>
              <span className="border border-gray-500 px-1 text-xs rounded">HD</span>
            </div>
            <p className="text-lg leading-relaxed text-gray-200">
              {movie.overview}
            </p>
          </div>
          <div className="md:col-span-1 space-y-4 text-sm">
            <div>
              <span className="text-gray-500 block mb-1">Cast:</span>
              <span className="text-white text-sm">{movie.cast?.join(', ') || 'Cast unavailable'}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Genres:</span>
              <span className="text-white text-sm">{movie.genres?.join(', ') || 'Drama'}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">This show is:</span>
              <span className="text-white text-sm">{movie.tags?.join(', ') || 'Exciting'}</span>
            </div>
          </div>
        </div>

        {/* More Like This */}
        {similarMovies.length > 0 && (
          <div className="p-6 md:p-10 bg-[#181818] border-t border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">More Like This</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {similarMovies.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#2f2f2f] rounded-md cursor-pointer hover:bg-[#333] transition overflow-hidden group"
                  onClick={() => onSwitchMovie && onSwitchMovie(m)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={getImage(m.backdrop_path || m.poster_path)}
                      alt={m.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 text-xs font-bold bg-black/60 px-1 rounded text-white">
                      {Math.floor(Math.random() * 60 + 60)}m
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/30">
                      <div className="bg-white/90 rounded-full p-2">
                        <Play size={20} fill="black" className="text-black ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[#46d369] font-bold">{Math.round(m.vote_average * 10)}% Match</span>
                        <span className="border border-gray-500 px-1 text-[10px] uppercase text-gray-400">HD</span>
                      </div>
                      <div className="border border-gray-500 rounded-full p-1 hover:border-white text-white">
                        <Plus size={16} />
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs line-clamp-3 leading-relaxed">{m.overview}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
