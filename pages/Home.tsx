import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Hero } from '../components/Hero';
import { Row } from '../components/Row';
import { getSections, getContentBySection } from '../services/contentService';
import { Section, Movie } from '../types';
import { useStore } from '../context/Store';
import { MovieCard } from '../components/MovieCard';
import { Modal } from '../components/Modal';

interface HomeProps {
  category?: 'tv' | 'movie' | 'new' | 'my-list';
}

export const Home: React.FC<HomeProps> = ({ category }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const { myList, profiles, currentProfile } = useStore();
  const [myListMovies, setMyListMovies] = useState<Movie[]>([]);
  const [modalConfig, setModalConfig] = useState<{ movie: Movie; autoPlay: boolean } | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);

      if (category === 'my-list') {
        // Fetch My List content
        if (currentProfile?.myList && currentProfile.myList.length > 0) {
          const tempSection: Section = {
            id: 'mylist',
            title: 'My List',
            order: 0,
            type: 'curated',
            contentIds: currentProfile.myList,
            enabled: true
          };
          const movies = await getContentBySection(tempSection);
          setMyListMovies(movies);
        } else {
          setMyListMovies([]);
        }
      } else {
        const scope = category === 'tv' ? 'tv' : category === 'movie' ? 'movie' : category === 'new' ? 'new' : 'home';
        const data = await getSections(scope as any);
        setSections(data);
      }
      setLoading(false);
    };
    loadContent();
  }, [category, currentProfile?.myList]); // Depend on myList to refresh

  return (
    <Layout>
      {category !== 'my-list' && <Hero />}
      <div className={`relative ${category !== 'my-list' ? 'pt-8 md:pt-16 px-4 md:px-12' : 'pt-24 px-4 md:px-12'} space-y-2 md:space-y-4 pb-20 overflow-x-hidden min-h-[500px]`}>

        {category === 'my-list' ? (
          <div>
            <h1 className="text-2xl font-bold mb-6 text-white">My List</h1>
            {myListMovies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {myListMovies.map(movie => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelect={(m) => setModalConfig({ movie: m, autoPlay: false })}
                    onPlay={(m) => setModalConfig({ movie: m, autoPlay: true })}
                  />
                ))}
              </div>
            ) : (
              <div className="text-gray-500">Your list is empty.</div>
            )}
          </div>
        ) : (
          !loading && sections.length > 0 ? (
            sections.map((section) => (
              <Row
                key={section.id}
                section={section}
                isLarge={section.type === 'originals'}
              />
            ))
          ) : loading ? (
            <div className="min-h-screen bg-[#141414] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e50914]"></div></div>
          ) : (
            <div className="text-center text-gray-500 pt-20">
              <p>  </p>
            </div>
          )
        )}
      </div>
      {modalConfig && (
        <Modal
          movie={modalConfig.movie}
          autoPlay={modalConfig.autoPlay}
          onClose={() => setModalConfig(null)}
          onSwitchMovie={(movie) => setModalConfig({ movie, autoPlay: true })}
        />
      )}
    </Layout>
  );
};
