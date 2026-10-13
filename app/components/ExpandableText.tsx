'use client';

import { useState } from 'react';

type Props = {
  text: string;
  maxCharacters?: number;
  className?: string;
  emptyText?: string;
};

export default function ExpandableText({
  text,
  maxCharacters = 185,
  className = '',
  emptyText = 'No description added yet.',
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const value = typeof text === 'string' ? text.trim() : '';
  const isLong = value.length > maxCharacters;

  // Never cut a word at the end of the preview if we can avoid it.
  const firstSlice = value.slice(0, maxCharacters);
  const lastSpace = firstSlice.lastIndexOf(' ');
  const preview = isLong
    ? firstSlice.slice(0, lastSpace > maxCharacters * 0.65 ? lastSpace : maxCharacters).trimEnd() + '…'
    : value;

  return (
    <div className={'veyloExpandable ' + className}>
      <p className="veyloExpandableText">{expanded || !isLong ? value || emptyText : preview}</p>
      {isLong && (
        <button
          type="button"
          className="veyloReadMore"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? 'Read less ↑' : 'Read more ↓'}
        </button>
      )}
    </div>
  );
}
