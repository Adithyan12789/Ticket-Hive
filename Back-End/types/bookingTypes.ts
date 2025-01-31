export interface BookingDetails {
    movie: string;
    schedule: string;
    theater: string;
    screen: string; 
    offer: string | null; 
    seats: string[]; 
    user: string;
    totalPrice: number; 
    showTime: string;  
    paymentStatus: string;
    paymentMethod: string;
    convenienceFee: number; 
    bookingDate: Date;
  }
  