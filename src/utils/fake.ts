import { v4 as uuidv4 } from "uuid";

export function fakeCollectionCards() {
  return Array.from(Array(Math.floor(Math.random() * 10 + 10)).keys()).map(
    () => ({
      id: uuidv4(),
      color: ["#f00", "#0f0", "#00f"][Math.floor(Math.random() * 3)] as string,
      imageSrc: Math.random() < 0.2,
    })
  );
}

export function fakeCollections(creatorUsername: string) {
  return Array.from(Array(Math.floor(Math.random() * 4 + 2)).keys()).map(() => {
    const id = uuidv4();
    const name = `COLLECITON_${id.slice(0, 8)}`;

    return {
      name,
      description: `Collection ${id} description...`,
      link: `${creatorUsername}/${name}`,
      playcost: Math.random() * 0.9 + 0.1,
      playLink: `/play/${id}`,
      creatorUsername,
      creatorLink: `/${creatorUsername}`,

      cardsUnblocked: fakeCollectionCards(),
      cardsBlocked: Math.floor(Math.random() * 10 + 10),
    };
  });
}
