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
    _id: string;
    bookingId: string;
    user: User;
    theater: Theater;
    showTime: string;
    paymentMethod: string;
    seats: string[];
    status: "pending" | "confirmed" | "cancelled" | "failed";
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
  