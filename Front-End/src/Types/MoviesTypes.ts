export interface MovieManagement {
    _id: string;
    title: string;
    genre: string;
    duration: string;
    description: string;
    posters: string;
    casts: string[];
    releaseDate: Date;
    language: string;
    createdAt: string;
    updatedAt: string;
}

export interface AddMovieForm {
    title: string;
    genre: string;
    duration: string;
    description: string;
    poster: File;
    cast: string[];
    releaseDate: Date;
    language: string;
}


export interface GenreOption {
    id: string;
    name: string;
}

export interface LanguageOption  {
    iso_639_1: string;
    english_name: string;
    name?: string;
}
  