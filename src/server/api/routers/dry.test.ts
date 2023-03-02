import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3 } from "../../storage";
import { env } from "../../../env.mjs";
import { bucketKey } from "../../../utils/format";
import { getSignedUrlPattern } from "../../../utils/test";

test("its working", async () => {
  const userId = "user_id";
  const collectionId = "collection_id";
  const cardId = "card_id";
  const key = bucketKey(userId, collectionId, cardId);
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
  });
  const url = await getSignedUrl(s3, command, {
    expiresIn: +env.AWS_S3_PUT_EXP,
  });
  const pattern = getSignedUrlPattern(key, "PutObject");
  expect(url).toMatch(pattern);
});
