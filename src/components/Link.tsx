import Link from "next/link";

interface ArtistLinkProps {
  name: string;
  link: string;
}

export const ArtistLink = ({ name, link }: ArtistLinkProps) => {
  return (
    <Link href={link} className="font-bold text-pink-500 hover:opacity-60">
      {name}
    </Link>
  );
};
