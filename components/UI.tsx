
import React from 'react';
import { GestureType } from '../types';
import { COLORS } from '../constants';

interface UIProps {
  gesture: GestureType;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const UI: React.FC<UIProps> = ({ gesture, isMusicPlaying, onToggleMusic, onUpload, videoRef }) => {
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-8">
      {/* Top Header */}
      <div className="text-center mt-4">
        <h1 
          className="text-6xl font-handwriting drop-shadow-[0_0_20px_rgba(212,175,55,0.8)]"
          style={{ color: COLORS.GOLD }}
        >
          Merry Christmas
        </h1>
        {/* Sub-header removed as requested in previous turn */}
      </div>

      {/* Middle Layer */}
      <div className="flex-1 flex justify-between items-end">
        {/* Left: Webcam - 200px wide, 4:3 ratio, Golden Glow Border */}
        <div className="w-[200px] h-[150px] bg-black/50 border-2 border-[#D4AF37] rounded-lg overflow-hidden shadow-[0_0_25px_rgba(212,175,55,0.4)] pointer-events-auto">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover scale-x-[-1]" 
          />
        </div>

        {/* Gesture Sidebar Hidden */}
        <div className="hidden">
        </div>
      </div>

      {/* Bottom: Control Bar */}
      <div className="flex justify-center items-center gap-6 mt-8 pointer-events-auto">
        <label className="flex items-center gap-3 bg-gradient-to-r from-[#043927] to-[#0a5c3e] px-8 py-3 rounded-full border border-[#D4AF37]/50 cursor-pointer hover:scale-105 transition-transform shadow-lg group">
          <span className="text-xl">✨</span>
          <span className="font-bold tracking-wider text-sm text-white font-serif">UPLOAD MEMORIES</span>
          <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
        </label>

        <button 
          onClick={onToggleMusic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${isMusicPlaying ? 'bg-[#D4AF37] text-black' : 'bg-black/80 text-[#D4AF37] border border-[#D4AF37]'}`}
        >
          {isMusicPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default UI;
