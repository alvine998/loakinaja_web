import React from 'react';

const Illustration = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="60" fill="#E6F0FB" />
      <path
        d="M40 78c0-11.046 8.954-20 20-20s20 8.954 20 20"
        stroke="#2B6FE8"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="38" y="48" width="44" height="30" rx="6" fill="#2B6FE8" />
      <rect x="46" y="40" width="28" height="10" rx="3" fill="#1E4FB0" />
      <circle cx="60" cy="63" r="7" fill="#FFFFFF" />
      <path d="M60 56v14M53 63h14" stroke="#2B6FE8" strokeWidth="3" strokeLinecap="round" />
      <circle cx="34" cy="40" r="5" fill="#FFB020" />
      <circle cx="88" cy="36" r="4" fill="#FF7A59" />
      <circle cx="90" cy="80" r="6" fill="#34C759" />
      <path
        d="M28 86c4-4 8-4 12 0s8 4 12 0"
        stroke="#34C759"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default Illustration;
