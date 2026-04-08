'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';

interface TektalPlayerProps {
  propertyId: string;
}

export function TektalPlayer({ propertyId }: TektalPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    const { data } = supabase.storage.from('property-images').getPublicUrl(`tektal/${propertyId}.m4a`);

    // Check if file exists
    fetch(data.publicUrl, { method: 'HEAD' }).then(res => {
      if (res.ok) setAudioUrl(data.publicUrl);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [propertyId]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  if (loading) return <p className="text-xs text-slate-400">Chargement...</p>;
  if (!audioUrl) return <p className="text-xs text-slate-400">Aucune description vocale</p>;

  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 hover:bg-orange-600 transition-colors"
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1" width="4" height="12" rx="1" /><rect x="8" y="1" width="4" height="12" rx="1" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 1.5v11l9-5.5z" /></svg>
        )}
      </button>

      <div className="flex-1">
        <div className="flex items-center gap-1.5 h-6">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-orange-400 transition-all"
              style={{
                height: `${4 + Math.sin(i * 0.8) * 8 + Math.random() * 4}px`,
                opacity: playing ? 0.8 : 0.3,
              }}
            />
          ))}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setProgress((audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100);
          }
        }}
      />
    </div>
  );
}
