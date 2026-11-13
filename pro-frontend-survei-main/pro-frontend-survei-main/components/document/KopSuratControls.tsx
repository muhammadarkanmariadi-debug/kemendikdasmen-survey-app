'use client';

import React, { useRef } from 'react';
import {
  Upload,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import { KopSuratLayout } from './KopSuratCanvas';
import { readKopImageFile } from './kopImageUtils';

interface KopSuratControlsProps {
  layout: KopSuratLayout;
  onChange: (updates: Partial<KopSuratLayout>) => void;
  onError?: (message: string) => void;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function KopSuratControls({
  layout,
  onChange,
  onError,
  fileInputRef: externalRef,
}: KopSuratControlsProps) {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = externalRef || internalRef;

  const scale = layout.kopScale ?? 100;
  const offsetX = layout.kopX ?? 0;
  const offsetY = layout.kopY ?? 0;
  const align = layout.kopAlign ?? 'center';
  const showDivider = layout.kopShowDivider ?? true;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readKopImageFile(file);
      onChange({
        kopImageUrl: dataUrl,
        kopScale: layout.kopScale ?? 100,
        kopAlign: layout.kopAlign ?? 'center',
        kopX: layout.kopX ?? 0,
        kopY: layout.kopY ?? 0,
      });
    } catch (err: any) {
      onError?.(err?.message || 'Gagal memuat gambar kop surat.');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleAlignPreset = (preset: 'left' | 'center' | 'right' | 'full') => {
    if (preset === 'full') {
      onChange({ kopAlign: 'center', kopScale: 100, kopX: 0, kopY: 0 });
    } else {
      const nextScale = scale === 100 ? 75 : scale;
      const nextX =
        preset === 'left' ? 0 : preset === 'right' ? 100 - nextScale : (100 - nextScale) / 2;
      onChange({ kopAlign: preset, kopScale: nextScale, kopX: nextX });
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload / Preview */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
          Gambar Kop Surat (PNG / JPG / WebP)
        </label>

        {!layout.kopImageUrl ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full py-5 px-4 border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-5 h-5 text-slate-500" />
            <span className="font-semibold text-slate-700">Unggah Gambar Kop Surat</span>
            <span className="text-[10px] text-slate-500">
              Seperti di Microsoft Word: setelah diunggah, atur skala &amp; posisi langsung di kertas
            </span>
          </button>
        ) : (
          <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
            <div className="bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-center max-h-24 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={layout.kopImageUrl}
                alt="Preview Kop Surat"
                className="max-h-20 w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Ganti Gambar</span>
              </button>
              <button
                type="button"
                onClick={() => onChange({ kopImageUrl: '' })}
                className="py-1.5 px-2.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold flex items-center justify-center gap-1 cursor-pointer"
                title="Hapus gambar kop surat"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alignment & Scale Controls */}
      {layout.kopImageUrl && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
              Posisi Cepat (Alignment)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleAlignPreset('left')}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                  align === 'left'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Kiri</span>
              </button>
              <button
                type="button"
                onClick={() => handleAlignPreset('center')}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                  align === 'center' && scale < 100
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
                <span>Tengah</span>
              </button>
              <button
                type="button"
                onClick={() => handleAlignPreset('right')}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                  align === 'right'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <AlignRight className="w-3.5 h-3.5" />
                <span>Kanan</span>
              </button>
              <button
                type="button"
                onClick={() => handleAlignPreset('full')}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                  scale === 100 && align === 'center'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Penuh</span>
              </button>
            </div>
          </div>

          {/* Skala (%) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-700">Skala / Lebar Kop</label>
              <span className="text-[11px] font-mono font-bold text-slate-800">{scale}%</span>
            </div>
            <input
              type="range"
              min={15}
              max={100}
              value={scale}
              onChange={(e) => onChange({ kopScale: Number(e.target.value) })}
              className="w-full accent-slate-900 cursor-pointer"
            />
          </div>

          {/* Posisi Horizontal (X %) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-700">Posisi Horizontal (X)</label>
              <span className="text-[11px] font-mono font-bold text-slate-800">
                {Math.round(offsetX)}%
              </span>
            </div>
            <input
              type="range"
              min={-10}
              max={Math.max(0, 100 - scale + 10)}
              step={0.5}
              value={offsetX}
              onChange={(e) =>
                onChange({ kopAlign: 'custom', kopX: Number(e.target.value) })
              }
              className="w-full accent-slate-900 cursor-pointer"
            />
          </div>

          {/* Posisi Vertikal (Y px) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-700">Posisi Vertikal (Y)</label>
              <span className="text-[11px] font-mono font-bold text-slate-800">{offsetY}px</span>
            </div>
            <input
              type="range"
              min={-30}
              max={80}
              value={offsetY}
              onChange={(e) => onChange({ kopY: Number(e.target.value) })}
              className="w-full accent-slate-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={showDivider}
                onChange={(e) => onChange({ kopShowDivider: e.target.checked })}
                className="rounded border-slate-300 accent-slate-900"
              />
              <span>Tampilkan garis pemisah kop</span>
            </label>

            <button
              type="button"
              onClick={() =>
                onChange({ kopScale: 100, kopAlign: 'center', kopX: 0, kopY: 0 })
              }
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Posisi</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

