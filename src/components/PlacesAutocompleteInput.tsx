"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (address: string, lat: number, lng: number) => void;
}

export default function PlacesAutocompleteInput({ value, onChange, onPlaceSelect }: Props) {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ["address_components", "geometry", "formatted_address"],
      types: ["address"],
    };

    const autocomplete = new places.Autocomplete(inputRef.current, options);

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (place.geometry?.location) {
        const address = place.formatted_address || "";
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setInputValue(address);
        onChange(address);
        onPlaceSelect(address, lat, lng);
      }
    });

    return () => {
      // Cleanup listener if possible, but Autocomplete doesn't have a simple off()
    };
  }, [places, onChange, onPlaceSelect]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        onChange(e.target.value);
      }}
      placeholder="Ej: Palermo, Mar del Plata"
      className="w-full rounded-2xl border border-white/10 bg-surface-dark/50 px-4 py-3.5 text-sm text-foreground focus:border-brand-500 outline-none transition-all"
    />
  );
}
