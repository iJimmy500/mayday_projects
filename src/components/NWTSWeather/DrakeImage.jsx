import React from 'react';

export default function DrakeImage({ isAlt, onClick }) {
  return (
    <img 
      src={isAlt ? "/nwts2.png" : "/nwts.png"} 
      alt="Drake" 
      className="nwts-drake-image interactive" 
      onClick={onClick}
      title="Click to switch version"
    />
  );
}
