import { type NextPage } from "next";

import { api } from "../../utils/api";
import { CollectionUnblockedCard } from "../../components/Collection";
import { BaseLayout } from "../../components/Layout";
import { PlayLink } from "../../components/Link";
import { useRouter } from "next/router";
import Link from "next/link";

const PlayPage: NextPage = () => {
  const router = useRouter();

  const gameplay = api.game.gameplay.useQuery(router.query.resultId as string, {
    refetchOnWindowFocus: false,
  });

  // TODO: make it prettier
  if (gameplay.status === "loading") {
    return <BaseLayout>Loading...</BaseLayout>;
  }
  if (gameplay.status === "error") {
    return <BaseLayout>Some error: {gameplay.error.message}</BaseLayout>;
  }

  return (
    <BaseLayout
      style={{ display: "flex", flexDirection: "column", padding: "1rem" }}
    >
      <Link
        href={gameplay.data.collectionLink}
        className="py-8 text-center text-4xl"
      >
        <span className="opacity-50">Snap</span> <i>L U C C</i>
      </Link>

      <div className="flex h-full flex-1 flex-col items-center justify-center">
        <h2 className="py-2 text-center text-lg tracking-widest">
          {gameplay.data.card.name} - {gameplay.data.card.rarity}
        </h2>
        <div className="w-fit">
          <CollectionUnblockedCard color={gameplay.data.card.color} />
        </div>
      </div>

      <div className="flex flex-row-reverse p-4">
        <PlayLink link={gameplay.data.replayLink} />
      </div>
    </BaseLayout>
  );
};

export default PlayPage;
