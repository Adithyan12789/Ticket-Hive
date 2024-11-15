/** Screen Types */
export interface Seat {
  label: string;
  type: 'regular' | 'vip' | 'unavailable';
}

export interface Screen {
  theater: string;
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
