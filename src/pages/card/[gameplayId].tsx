import { type NextPage } from "next";

import { api } from "../../utils/api";
import { CollectionFreeCard } from "../../components/Collection";
import { BaseLayout } from "../../components/Layout";
import { PlayAction } from "../../components/Action";
import { useRouter } from "next/router";
import Link from "next/link";
import { collectionLink } from "../../utils/format";
import { Spin } from "../../components/Icon";

const PlayPage: NextPage = () => {
  const router = useRouter();

  const gameplay = api.game.get.useQuery(
    { gameplayId: router.query.gameplayId as string },
    {
      refetchOnWindowFocus: false,
    }
  );

  // TODO: make it prettier
  if (gameplay.status === "loading") {
    return (
      <BaseLayout>
        <div className="flex h-screen w-screen items-center justify-center">
          <Spin size={60} />
        </div>
      </BaseLayout>
    );
  }
  if (gameplay.status === "error") {
    return (
      <BaseLayout>
        <div className="flex h-screen w-screen items-center justify-center">
          {gameplay.error.message}
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout
      style={{ display: "flex", flexDirection: "column", padding: "1rem" }}
    >
      <Link
        href={collectionLink({
          userslug: gameplay.data.producerSlug,
          collectionId: gameplay.data.collectionId,
        })}
        className="py-8 text-center text-4xl"
      >
        <span className="opacity-50">Snap</span> <i>L U C C</i>
      </Link>

      <div className="flex h-full flex-1 flex-col items-center justify-center">
        <h2 className="py-2 text-center text-lg tracking-widest">
          {`${gameplay.data.collectionName} - ${
            gameplay.data.rarity?.name ?? "NONE"
          }`}
        </h2>
        <div className="w-fit">
          <CollectionFreeCard url={gameplay.data.url} />
        </div>
      </div>

      <div className="flex flex-row-reverse p-4">
        <PlayAction collectionId={gameplay.data.collectionId} />
      </div>
    </BaseLayout>
  );
};

export default PlayPage;
