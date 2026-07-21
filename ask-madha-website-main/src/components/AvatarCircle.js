"use client";

import Image from "next/image";

export default function AvatarCircle({ size = 36, uri, initials, displayName }) {
  const displayInitials = initials || (displayName ? displayName.charAt(0).toUpperCase() : "M");
  const dimension = `${size}px`;

  if (uri) {
    return (
      <div
        className="overflow-hidden rounded-full border-2 border-primary"
        style={{ width: dimension, height: dimension }}
      >
        <Image
          src={uri}
          alt="Profile"
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center overflow-hidden rounded-full border-2 border-primary gradient-bg"
      style={{ width: dimension, height: dimension }}
    >
      <span
        className="font-bold text-white"
        style={{ fontSize: `${Math.round(size * 0.4)}px` }}
      >
        {displayInitials}
      </span>
    </div>
  );
}
