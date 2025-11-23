import React from 'react';

interface AvatarStackProps {
  avatars?: string[];
  max?: number;
  size?: number;
}

export default function AvatarStack({ avatars = [], max = 4, size = 32 }: AvatarStackProps) {
  // Default mock avatars if none provided
  const defaultAvatars = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5',
    'https://i.pravatar.cc/150?img=6',
    'https://i.pravatar.cc/150?img=7',
    'https://i.pravatar.cc/150?img=8',
    'https://i.pravatar.cc/150?img=9',
    'https://i.pravatar.cc/150?img=10'
  ];

  const displayAvatars = avatars.length > 0 ? avatars : defaultAvatars;
  const visibleAvatars = displayAvatars.slice(0, max);
  const remaining = displayAvatars.length - max;

  return (
    <div className="flex items-center">
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className="relative inline-block rounded-full border-2 border-[#0e1316] overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]"
          style={{
            width: size,
            height: size,
            marginLeft: index > 0 ? -size / 4 : 0,
            zIndex: max - index
          }}
        >
          <img
            src={avatar}
            alt={`Participant ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="relative inline-flex items-center justify-center rounded-full border-2 border-[#0e1316] bg-[#12171c] text-xs font-semibold text-[#9aa6b2]"
          style={{
            width: size,
            height: size,
            marginLeft: -size / 4,
            zIndex: 0
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
