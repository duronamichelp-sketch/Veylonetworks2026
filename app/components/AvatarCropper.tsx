'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  file: File;
  onCancel: () => void;
  onSave: (cropped: File) => Promise<void>;
};

const VIEW = 280;

export default function AvatarCropper({ file, onCancel, onSave }: Props) {
  const [url, setUrl] = useState('');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const imageRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const baseScale = dimensions.width && dimensions.height
    ? Math.max(VIEW / dimensions.width, VIEW / dimensions.height) : 1;
  const displayWidth = dimensions.width * baseScale * zoom;
  const displayHeight = dimensions.height * baseScale * zoom;
  const maxX = Math.max(0, (displayWidth - VIEW) / 2);
  const maxY = Math.max(0, (displayHeight - VIEW) / 2);
  const clamp = (value: number, max: number) => Math.max(-max, Math.min(max, value));

  async function confirmCrop() {
    const img = imageRef.current;
    if (!img || !dimensions.width || saving) return;
    setSaving(true);
    setError('');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Image editing is unavailable in this browser.');
      const scale = baseScale * zoom;
      const sourceSize = VIEW / scale;
      const sx = (dimensions.width - sourceSize) / 2 - clamp(offset.x, maxX) / scale;
      const sy = (dimensions.height - sourceSize) / 2 - clamp(offset.y, maxY) / scale;
      context.drawImage(img, sx, sy, sourceSize, sourceSize, 0, 0, 512, 512);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      if (!blob) throw new Error('Could not crop this photo.');
      await onSave(new File([blob], 'veylo-profile.jpg', { type: 'image/jpeg' }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not crop this photo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Crop profile picture"
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(3,9,24,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#101b35', color: '#fff', border: '1px solid rgba(135,185,255,.3)', borderRadius: 22, padding: 22, boxShadow: '0 30px 90px rgba(0,0,0,.5)' }}>
        <h2 style={{ fontSize: 21, fontWeight: 700, margin: '0 0 8px' }}>Adjust your profile photo</h2>
        <p style={{ opacity: .7, fontSize: 13, marginBottom: 18 }}>Drag to reposition and zoom to get the perfect crop.</p>
        <div style={{ width: VIEW, height: VIEW, maxWidth: '100%', margin: '0 auto', borderRadius: '50%', overflow: 'hidden', position: 'relative', background: '#18243a', touchAction: 'none', cursor: 'grab', border: '2px solid #69b5ff' }}
          onPointerDown={event => { if (saving) return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { x: event.clientX, y: event.clientY, startX: offset.x, startY: offset.y }; }}
          onPointerMove={event => { if (!drag.current) return; setOffset({ x: clamp(drag.current.startX + event.clientX - drag.current.x, maxX), y: clamp(drag.current.startY + event.clientY - drag.current.y, maxY) }); }}
          onPointerUp={() => { drag.current = null; }}
          onPointerCancel={() => { drag.current = null; }}>
          {url && <img ref={imageRef} src={url} alt="Crop preview" draggable={false}
            onLoad={event => setDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
            style={{ width: displayWidth, height: displayHeight, position: 'absolute', left: '50%', top: '50%', maxWidth: 'none', transform: `translate(calc(-50% + ${clamp(offset.x, maxX)}px), calc(-50% + ${clamp(offset.y, maxY)}px))`, userSelect: 'none', pointerEvents: 'none' }} />}
        </div>
        <label htmlFor="veylo-avatar-zoom" style={{ display: 'block', marginTop: 22, fontSize: 14 }}>Zoom</label>
        <input id="veylo-avatar-zoom" type="range" min="1" max="3" step=".01" value={zoom} disabled={saving}
          onChange={event => { const next = Number(event.target.value); setZoom(next); setOffset(current => ({ x: clamp(current.x, Math.max(0, (dimensions.width * baseScale * next - VIEW) / 2)), y: clamp(current.y, Math.max(0, (dimensions.height * baseScale * next - VIEW) / 2)) })); }}
          style={{ width: '100%', accentColor: '#69b5ff', margin: '10px 0 22px' }} />
        {error && <p role="alert" style={{ color: '#ff9a9a', fontSize: 13 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onCancel} disabled={saving} style={{ flex: 1, borderRadius: 12, padding: 12, background: '#263450', color: '#fff', border: '1px solid #425473' }}>Cancel</button>
          <button type="button" onClick={confirmCrop} disabled={saving || !dimensions.width} style={{ flex: 1, borderRadius: 12, padding: 12, background: '#4b9cf4', color: '#051126', fontWeight: 700, border: 0 }}>{saving ? 'Saving...' : 'Save photo'}</button>
        </div>
      </div>
    </div>
  );
}
