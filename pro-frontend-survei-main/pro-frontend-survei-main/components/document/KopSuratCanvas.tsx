'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Move, Upload, Image as ImageIcon } from 'lucide-react';

export interface KopSuratLayout {
  kopImageUrl?: string;
  kopScale?: number; // 15 to 100 (% of printable width)
  kopX?: number; // horizontal offset in % (-50 to 50 when centered, or 0 to 100 left%)
  kopY?: number; // vertical offset in px (-30 to 80)
  kopAlign?: 'left' | 'center' | 'right' | 'custom';
  kopShowDivider?: boolean;
}

interface KopSuratCanvasProps {
  layout: KopSuratLayout;
  editable?: boolean;
  onChange?: (updates: Partial<KopSuratLayout>) => void;
  onUploadClick?: () => void;
}

export function KopSuratCanvas({
  layout,
  editable = false,
  onChange,
  onUploadClick,
}: KopSuratCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [dragMode, setDragMode] = useState<'none' | 'move' | 'resize-br' | 'resize-bl'>('none');

  const scale = Math.min(100, Math.max(15, layout.kopScale ?? 100));
  const align = layout.kopAlign ?? 'center';
  const offsetX = layout.kopX ?? 0; // % offset from base alignment (-50..50)
  const offsetY = layout.kopY ?? 0; // px vertical offset
  const showDivider = layout.kopShowDivider ?? true;

  // Calculate CSS left % based on align + offsetX
  const getBaseLeftPercent = () => {
    if (align === 'left') return 0;
    if (align === 'right') return 100 - scale;
    if (align === 'center') return (100 - scale) / 2;
    return Math.min(100 - scale, Math.max(0, offsetX));
  };

  const leftPercent = align === 'custom' ? Math.min(100 - scale, Math.max(-20, offsetX)) : getBaseLeftPercent() + (align === 'center' ? 0 : 0);

  const handleMouseDownMove = useCallback(
    (e: React.MouseEvent) => {
      if (!editable || !onChange || !containerRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      setIsSelected(true);
      setDragMode('move');

      const rect = containerRef.current.getBoundingClientRect();
      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const startLeftPct = align === 'custom' ? (layout.kopX ?? 0) : getBaseLeftPercent();
      const startTopPx = offsetY;

      const onMouseMove = (ev: MouseEvent) => {
        const dxPct = ((ev.clientX - startMouseX) / rect.width) * 100;
        const dyPx = ev.clientY - startMouseY;
        const nextX = Math.round(Math.min(100 - scale + 10, Math.max(-10, startLeftPct + dxPct)) * 10) / 10;
        const nextY = Math.round(Math.min(80, Math.max(-30, startTopPx + dyPx)));
        onChange({
          kopAlign: 'custom',
          kopX: nextX,
          kopY: nextY,
        });
      };

      const onMouseUp = () => {
        setDragMode('none');
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [editable, onChange, align, layout.kopX, offsetY, scale]
  );

  const handleMouseDownResize = useCallback(
    (e: React.MouseEvent, corner: 'br' | 'bl') => {
      if (!editable || !onChange || !containerRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      setIsSelected(true);
      setDragMode(corner === 'br' ? 'resize-br' : 'resize-bl');

      const rect = containerRef.current.getBoundingClientRect();
      const startMouseX = e.clientX;
      const startScale = scale;
      const startLeftPct = align === 'custom' ? (layout.kopX ?? 0) : getBaseLeftPercent();

      const onMouseMove = (ev: MouseEvent) => {
        const dxPct = ((ev.clientX - startMouseX) / rect.width) * 100;
        if (corner === 'br') {
          const nextScale = Math.round(Math.min(100, Math.max(15, startScale + dxPct)));
          onChange({ kopScale: nextScale });
        } else {
          const nextScale = Math.round(Math.min(100, Math.max(15, startScale - dxPct)));
          const scaleDelta = nextScale - startScale;
          const nextX = Math.round(Math.min(100 - nextScale + 10, Math.max(-10, startLeftPct - scaleDelta)) * 10) / 10;
          onChange({
            kopAlign: 'custom',
            kopScale: nextScale,
            kopX: nextX,
          });
        }
      };

      const onMouseUp = () => {
        setDragMode('none');
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [editable, onChange, align, layout.kopX, scale]
  );

  if (!layout.kopImageUrl) {
    if (!editable) {
      return showDivider ? <div className="border-b border-black mb-5" /> : null;
    }
    return (
      <div className="mb-5">
        <button
          type="button"
          onClick={onUploadClick}
          className="w-full py-8 px-4 border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-lg bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex flex-col items-center justify-center gap-2 text-center cursor-pointer print:hidden"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-600">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div className="text-xs font-sans font-semibold text-slate-700">
            Belum ada gambar Kop Surat
          </div>
          <div className="text-[11px] font-sans text-slate-500 flex items-center gap-1">
            <Upload className="w-3.5 h-3.5" />
            <span>Klik untuk unggah gambar kop surat (PNG/JPG/WebP)</span>
          </div>
        </button>
        {showDivider && (
          <div className="mt-3">
            <div className="border-b-[2px] border-black" />
            <div className="border-b-[1px] border-black mt-[2px]" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-5">
      <div
        ref={containerRef}
        onClick={() => editable && setIsSelected(true)}
        onMouseLeave={() => dragMode === 'none' && setIsSelected(false)}
        className={`relative w-full overflow-visible ${editable ? 'min-h-[60px]' : ''}`}
      >
        <div
          style={{
            width: `${scale}%`,
            marginLeft: `${leftPercent}%`,
            transform: `translateY(${offsetY}px)`,
          }}
          onMouseDown={handleMouseDownMove}
          className={`relative select-none transition-shadow ${
            editable ? 'cursor-move' : ''
          } ${
            editable && isSelected
              ? 'outline-2 outline-dashed outline-slate-800 print:outline-none'
              : editable
              ? 'hover:outline-1 hover:outline-dashed hover:outline-slate-400 print:outline-none'
              : ''
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={layout.kopImageUrl}
            alt="Kop Surat Resmi"
            draggable={false}
            className="w-full h-auto block object-contain pointer-events-none"
          />

          {/* MS Word-style interactive handles (hidden when printing) */}
          {editable && isSelected && (
            <>
              <div className="print:hidden absolute -top-6 left-0 bg-slate-900 text-white text-[10px] font-sans px-2 py-0.5 rounded flex items-center gap-1 shadow-sm whitespace-nowrap pointer-events-none">
                <Move className="w-3 h-3" />
                <span>Skala {scale}% • Geser untuk atur posisi</span>
              </div>

              {/* Bottom-Right Resize Handle */}
              <div
                onMouseDown={(e) => handleMouseDownResize(e, 'br')}
                title="Tarik untuk ubah skala"
                className="print:hidden absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 bg-white border-2 border-slate-900 rounded-xs cursor-nwse-resize shadow-sm"
              />

              {/* Bottom-Left Resize Handle */}
              <div
                onMouseDown={(e) => handleMouseDownResize(e, 'bl')}
                title="Tarik untuk ubah skala"
                className="print:hidden absolute -left-1.5 -bottom-1.5 w-3.5 h-3.5 bg-white border-2 border-slate-900 rounded-xs cursor-nesw-resize shadow-sm"
              />
            </>
          )}
        </div>
      </div>

      {showDivider && (
        <div className="mt-2">
          <div className="border-b-[2px] border-black" />
          <div className="border-b-[1px] border-black mt-[2px]" />
        </div>
      )}
    </div>
  );
}

