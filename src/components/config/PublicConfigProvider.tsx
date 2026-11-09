"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_SETTINGS, toPublicConfig, type PublicConfig } from "@/lib/settings-defaults";

const PublicConfigContext = createContext<PublicConfig>(toPublicConfig(DEFAULT_SETTINGS));

export function PublicConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<PublicConfig>(toPublicConfig(DEFAULT_SETTINGS));

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data: PublicConfig) => setConfig({ ...toPublicConfig(DEFAULT_SETTINGS), ...data }))
      .catch(() => {
        /* keep defaults */
      });
  }, []);

  const value = useMemo(() => config, [config]);
  return <PublicConfigContext.Provider value={value}>{children}</PublicConfigContext.Provider>;
}

export function usePublicConfig() {
  return useContext(PublicConfigContext);
}

export function useGeoConfig() {
  const config = usePublicConfig();
  return useMemo(
    () => ({
      packMinutes: config.packMinutes,
      scooterKmh: config.scooterKmh,
      maxDeliveryKm: config.maxDeliveryKm,
      cityLat: config.cityLat,
      cityLng: config.cityLng,
      cityRadiusKm: config.cityRadiusKm,
    }),
    [
      config.packMinutes,
      config.scooterKmh,
      config.maxDeliveryKm,
      config.cityLat,
      config.cityLng,
      config.cityRadiusKm,
    ],
  );
}
