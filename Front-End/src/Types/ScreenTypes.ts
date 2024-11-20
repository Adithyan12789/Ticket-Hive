export interface Screen {
  theater: Theater; 
  _id: string;
  screenNumber: number;
  capacity: number;
  showTimes: ShowTime[];
  createdAt: string;
  updatedAt: string;
}

export interface Theater {
  name: string;
  ticketPrice: number;
}

export interface ShowTime {
  time: string;
  movie: string;
  movieTitle: string;
  layout: Seat[][];
  _id?: string;
}

export interface Seat {
  label: string;
  isAvailable: boolean;
}
