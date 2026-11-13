'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface GeoLocationProps {
  onLocationCaptured: (coords: { latitude: number; longitude: number; accuracy: number }) => void;
}

export function GeolocationCapture({ onLocationCaptured }: GeoLocationProps) {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Perangkat Anda tidak mendukung geolokasi GPS.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const captured = {
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
        };
        setCoords(captured);
        setLoading(false);
        onLocationCaptured(captured);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setErrorMsg('Izin akses lokasi ditolak oleh browser/perangkat.');
            break;
          case err.POSITION_UNAVAILABLE:
            setErrorMsg('Informasi lokasi GPS tidak tersedia.');
            break;
          case err.TIMEOUT:
            setErrorMsg('Waktu permintaan lokasi habis.');
            break;
          default:
            setErrorMsg('Gagal mendeteksi koordinat lokasi.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-kemendikbud-blue" />
          <span>Verifikasi Lokasi Lapangan (GPS Geotag)</span>
        </div>
        <button
          type="button"
          onClick={captureLocation}
          disabled={loading}
          className="text-xs bg-kemendikbud-blue text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 transition-colors font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Mendeteksi...
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              {coords ? 'Perbarui Lokasi' : 'Deteksi Lokasi GPS'}
            </>
          )}
        </button>
      </div>

      {coords ? (
        <div className="p-3 bg-white border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-mono font-semibold">
                {coords.latitude}, {coords.longitude}
              </span>
              <p className="text-[11px] text-emerald-600 mt-0.5">
                Akurasi GPS: &plusmn;{coords.accuracy} meter
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            Terverifikasi
          </span>
        </div>
      ) : (
        <div className="p-3 bg-white border border-dashed border-slate-300 rounded-xl text-xs text-slate-500">
          {errorMsg ? (
            <div className="flex items-center gap-1.5 text-rose-600 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <span>
              Klik tombol &quot;Deteksi Lokasi GPS&quot; untuk mencatat titik koordinat sekolah saat wawancara lapangan.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

