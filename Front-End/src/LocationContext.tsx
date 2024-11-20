import { createContext } from "react";

export const LocationContext = createContext<{
  userLocation: string;
  setUserLocation: React.Dispatch<React.SetStateAction<string>>;
}>({
  userLocation: "Unknown Location",
  setUserLocation: () => {},
});
