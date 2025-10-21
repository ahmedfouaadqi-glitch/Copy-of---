import { FavoriteMovie } from '../types';

const MOVIES_KEY = 'favoriteMovies';

export const getFavoriteMovies = (): FavoriteMovie[] => {
    try {
        const stored = localStorage.getItem(MOVIES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to parse favorite movies from localStorage", error);
        return [];
    }
};

export const addFavoriteMovie = (movieData: Omit<FavoriteMovie, 'id' | 'addedDate'>): FavoriteMovie => {
    const movies = getFavoriteMovies();
    // Prevent duplicates by title
    if (movies.some(movie => movie.title.trim().toLowerCase() === movieData.title.trim().toLowerCase())) {
        return movies.find(movie => movie.title.trim().toLowerCase() === movieData.title.trim().toLowerCase())!;
    }

    const newMovie: FavoriteMovie = {
        ...movieData,
        id: `movie-${Date.now()}`,
        addedDate: Date.now()
    };
    const updatedMovies = [newMovie, ...movies];
    localStorage.setItem(MOVIES_KEY, JSON.stringify(updatedMovies));
    return newMovie;
};

export const deleteFavoriteMovie = (movieId: string): FavoriteMovie[] => {
    let movies = getFavoriteMovies();
    const updatedMovies = movies.filter(movie => movie.id !== movieId);
    localStorage.setItem(MOVIES_KEY, JSON.stringify(updatedMovies));
    return updatedMovies;
};