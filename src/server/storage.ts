import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../env.mjs";
import { bucketKey } from "../utils/format";

interface UploadCardParams {
  userId: string;
  collectionId: string;
  cardId: string;
}

interface FetchCardParams {
  userId: string;
  collectionId: string;
  cardId: string;
}

interface GetCollectionCardsParams {
  userId: string;
  collectionId: string;
}

interface CollectionCardsResponse {
  cards:
    | {
        key: string;
        lastModified: Date;
        size: number;
      }[]
    | null;
}

interface DeleteCollectionCardsParams {
  userId: string;
  collectionId: string;
  cardsId: [string, ...string[]];
}

class StorageSystem {
  private s3: S3Client;

  constructor() {
    this.s3 =
      env.NODE_ENV === "production"
        ? new S3Client({ region: env.AWS_DEFAULT_REGION })
        : new S3Client({
            region: env.AWS_DEFAULT_REGION,
            endpoint: "http://localhost.localstack.cloud:4566/",
          });
  }

  async urlForUploadingCard({
    userId,
    collectionId,
    cardId,
  }: UploadCardParams) {
    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: bucketKey(userId, collectionId, cardId),
    });
    const url = await getSignedUrl(this.s3, command, {
      expiresIn: +env.AWS_S3_PUT_EXP,
    });

    return url;
  }

  async urlForFetchingCard({ userId, collectionId, cardId }: FetchCardParams) {
    const command = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: bucketKey(userId, collectionId, cardId),
    });
    const url = await getSignedUrl(this.s3, command, {
      expiresIn: +env.AWS_S3_GET_EXP,
    });

    return url;
  }

  async getCollectionCards({
    userId,
    collectionId,
  }: GetCollectionCardsParams): Promise<CollectionCardsResponse> {
    const command = new ListObjectsV2Command({
      Bucket: env.AWS_S3_BUCKET,
      Delimiter: "/",
      Prefix: bucketKey(userId, collectionId),
    });
    const response = await this.s3.send(command);

    // TODO: a collection can must have a limit amount of cards
    // that is less than `MaxKeys`, create a test for that as well.

    return {
      cards: (response.Contents?.filter(
        ($) =>
          typeof $.Key !== "undefined" &&
          typeof $.LastModified !== "undefined" &&
          typeof $.Size !== "undefined"
      ).map(($) => ({
        key: $.Key,
        lastModified: $.LastModified,
        size: $.Size,
      })) ?? null) as CollectionCardsResponse["cards"],
    };
  }

  async deleteCollectionCards({
    userId,
    collectionId,
    cardsId,
  }: DeleteCollectionCardsParams) {
    const command = new DeleteObjectsCommand({
      Bucket: env.AWS_S3_BUCKET,
      Delete: {
        Objects: cardsId.map(($) => ({
          Key: bucketKey(userId, collectionId, $),
        })),
        Quiet: true,
      },
    });

    await this.s3.send(command);
  }
}

const storage = new StorageSystem();

export default storage;
