import { getSignedUrl as _f } from "@aws-sdk/s3-request-presigner";

export const getSignedUrl: typeof _f = jest.fn(
  async (client, command, options) => {
    return `signed_url_(${JSON.stringify({
      config: client.config,
      command,
      options,
    })})`;
  }
);
