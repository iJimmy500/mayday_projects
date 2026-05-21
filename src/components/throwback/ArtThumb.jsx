import React from 'react';

export default function ArtThumb({ src, fallback }) {
  return src
    ? <img className="tb-art" src={src} alt="" loading="lazy" />
    : <div className="tb-art-placeholder">{fallback}</div>;
}
