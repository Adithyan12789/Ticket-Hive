export interface User {
    _id: string;
    name: string;
    email: string;
  }
  
  export interface Theater {
    _id: string;
    name: string;
  }
  
  export interface BookingDetails {
    _id: string; // Unique identifier for the booking
    bookingId: string; // Readable booking ID, if applicable
    user: User; // User who made the booking
    theater: Theater; // Theater where the movie is shown
    showTime: string; // Date and time of the show in ISO string format
    paymentMethod: string; // Date and time of the show in ISO string format
    seats: string[]; // List of seat numbers
    status: "pending" | "confirmed" | "cancelled" | "failed"; // Status of the booking
  }
  

  export interface Ticket {
    movieDetails: {
      title: string;
      duration: string;
      genre: string[];
      poster: string;
    };
    ticket: {
      bookingId: string;
      bookingDate: string;
      movieId: string;
      movieTitle: string;
      paymentStatus: "cancelled" | "confirmed" | "failed";
      screenId: string;
      images: string[];
      screenName: string;
      seats: string[];
      showTime: string;
      paymentMethod: "razorpay" | "paypal" | "wallet";
      theaterName: string;
      totalPrice: number;
      userEmail: string;
      userId: string;
      userName: string;
    };
  }
  