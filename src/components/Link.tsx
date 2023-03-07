import Link from "next/link";

export const ArtistLink = ({ name, link }: { name: string; link: string }) => (
  <Link href={link} className="font-bold text-pink-500 hover:opacity-60">
    {name}
  </Link>
);
