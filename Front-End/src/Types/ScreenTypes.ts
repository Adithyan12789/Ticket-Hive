/** Screen Types */
export interface Seat {
  label: string;
  isAvailable: boolean;
}

export interface Screen {
  _id: string;
  screenNumber: number;
  capacity: number;
  layout: { label: string }[][];
  showTimes: string[];
}

export interface ShowTime {
  time: string;
  movieTitle: string;
  movie?: string
}