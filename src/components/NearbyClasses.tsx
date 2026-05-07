"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface YogaClass {
  id: string;
  title: string;
  scheduled_at: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  instructor_name: string | null;
  distance?: number;
}

export default function NearbyClasses() {
  const [classes, setClasses] = useState<YogaClass[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchClasses() {
      const supabase = createClient();
      const { data } = await supabase
        .from("classes")
        .select("*")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(20);

      if (data) {
        let sortedClasses = [...data];
        if (userLocation) {
          sortedClasses = data.map(cls => ({
            ...cls,
            distance: cls.latitude && cls.longitude 
              ? calculateDistance(userLocation.lat, userLocation.lng, cls.latitude, cls.longitude)
              : Infinity
          })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }
        setClasses(sortedClasses.slice(0, 3));
      }
      setLoading(false);
    }

    fetchClasses();
  }, [userLocation]);

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  if (loading) return null;
  if (classes.length === 0) return null;

  return (
    <section className="py-20 bg-surface-dark-alt/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="mb-4 inline-block rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-brand-300 backdrop-blur-xl">
              <h2 className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-brand-400 italic">Estilos de Yoga</h2>
              📍 Ubicación Real
            </span>
            <h2 className="font-serif text-4xl font-black text-white">Clases Cerca Tuyo</h2>
            <p className="mt-4 text-white/50 text-lg">
              Prácticas en Mar del Plata a pocos minutos de tu ubicación actual.
            </p>
          </div>
          <Link 
            href="/mapa"
            className="inline-flex items-center gap-2 text-xs font-black text-brand-400 uppercase tracking-widest hover:text-brand-300 transition-colors"
          >
            Explorar Mapa <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {classes.map((cls) => (
            <Link
              key={cls.id}
              href={`/clases`}
              className="glass group rounded-[2.5rem] p-8 border-white/5 transition-all hover:-translate-y-2 hover:border-brand-500/30"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                  <MapPin size={24} />
                </div>
                {cls.distance !== Infinity && (
                  <span className="text-[10px] font-black text-brand-300 bg-brand-500/20 px-3 py-1 rounded-full uppercase tracking-widest">
                    a {(cls.distance || 0).toFixed(1)} km
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">{cls.title}</h3>
              <p className="text-white/40 text-xs font-medium mb-6 flex items-center gap-2">
                🏠 {cls.address || "Mar del Plata"}
              </p>
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <p className="text-xs font-black text-white uppercase tracking-tighter">{cls.instructor_name || "Profesor"}</p>
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                  {new Date(cls.scheduled_at).toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Reservar →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
