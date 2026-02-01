import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { useStore } from '../context/Store';
import { searchMovies, getImage } from '../services/tmdb';
import { Movie } from '../types';
import { Modal } from '../components/Modal';

export const Search: React.FC = () => {
    const { searchQuery } = useStore();
    const [results, setResults] = useState<Movie[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (searchQuery.length > 2) {
                const res = await searchMovies(searchQuery);
                setResults(res);
            } else {
                setResults([]);
            }
        };
        const debounce = setTimeout(fetchResults, 500);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    return (
        <Layout>
            <div className="pt-24 px-4 md:px-12 min-h-screen">
                <h2 className="text-gray-400 mb-6">
                    {searchQuery ? `Results for "${searchQuery}"` : "Start typing to search..."}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {results.map(movie => (
                        <div
                            key={movie.id}
                            className="relative aspect-video bg-[#2f2f2f] rounded cursor-pointer group overflow-hidden"
                            onClick={() => setSelectedMovie(movie)}
                        >
                            <img
                                src={getImage(movie.backdrop_path)}
                                alt={movie.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-white font-bold text-center p-2">{movie.title}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {results.length === 0 && searchQuery && (
                    <div className="text-center mt-20 text-gray-500">
                        <p>Your search for "{searchQuery}" did not have any matches.</p>
                        <p className="mt-2">Suggestions:</p>
                        <ul className="list-disc list-inside mt-2">
                            <li>Try different keywords</li>
                            <li>Looking for a movie or TV show?</li>
                            <li>Try using a movie, TV show title, or an actor</li>
                        </ul>
                    </div>
                )}
            </div>
            {selectedMovie && (
                <Modal
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                    onSwitchMovie={(movie) => setSelectedMovie(movie)}
                />
            )}
        </Layout>
    );
};