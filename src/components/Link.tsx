import Link from "next/link";

export const ArtistLink = ({ name, link }: { name: string; link: string }) => (
  <Link href={link} className="font-bold text-pink-500 hover:opacity-60">
    {name}
  </Link>
);

export const PlayLink = ({ link }: { link: string }) => (
  <Link
    href={link}
    className="rounded-full bg-green-400 px-6 py-1 font-bold text-green-800 shadow-2xl shadow-green-500"
  >
    Play
  </Link>
);
