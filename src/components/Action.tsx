interface PlayActionProps {
  collectionId: string;
}

export const PlayAction = ({ collectionId }: PlayActionProps) => {
  return (
    <button className="rounded-full bg-green-400 px-6 py-1 font-bold text-green-800 shadow-2xl shadow-green-500">
      Play
    </button>
  );
};
