import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import { api } from "../utils/api";
import { signIn } from "../utils/auth";

interface PlayActionProps {
  collectionId: string;
}

export const PlayAction = ({ collectionId }: PlayActionProps) => {
  const router = useRouter();
  const session = useSession();
  const play = api.game.play.useMutation();

  const handleClick = async () => {
    if (session.status === "authenticated") {
      const response = await play.mutateAsync({ collectionId });
      await router.push(`/card/${response.gameplayId}`);
    } else if (session.status === "unauthenticated") {
      await signIn();
    }
  };

  return (
    <button
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={handleClick}
      className="rounded-full bg-green-400 px-6 py-1 font-bold text-green-800 shadow-2xl shadow-green-500 hover:animate-shake"
    >
      Play
    </button>
  );
};
