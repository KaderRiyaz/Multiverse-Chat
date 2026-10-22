import { useEffect, useState } from "react";

function initials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CharacterAvatar({ character, size = "md", className = "", onClick }) {
  const [failed, setFailed] = useState(false);
  const dimensions = size === "sm" ? "h-9 w-9 text-[10px]" : size === "lg" ? "h-16 w-16 text-lg" : "h-11 w-11 text-xs";
  const source = character.imageUrl || character.avatar;
  useEffect(() => setFailed(false), [source]);

  const avatar = (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent font-bold ${dimensions} ${className}`}
      style={{ color: character.themeColor }}
      aria-label={`${character.name} avatar`}
    >
      {!failed && source ? (
        <img
          src={source}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : initials(character.name)}
    </div>
  );

  if (!onClick) return avatar;
  return <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onClick(event); } }} className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300">{avatar}</div>;
}
