"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchLocationInfo, type LocationInfo } from "@/lib/shabbat";

interface LocationContextValue {
  info: LocationInfo | null;
  loading: boolean;
}

const LocationContext = createContext<LocationContextValue>({ info: null, loading: true });

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [info, setInfo] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocationInfo()
      .then(setInfo)
      .finally(() => setLoading(false));
  }, []);

  return (
    <LocationContext.Provider value={{ info, loading }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
