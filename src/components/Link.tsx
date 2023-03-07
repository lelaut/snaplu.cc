import Link from "next/link";

import { producerLink } from "../utils/format";

interface ArtistLinkProps {
  name: string;
  slug: string;
}

export const ArtistLink = ({ name, slug }: ArtistLinkProps) => (
  <Link
    href={producerLink({ userslug: slug })}
    className="font-bold text-pink-500 hover:opacity-60"
  >
    {name}
  </Link>
);
