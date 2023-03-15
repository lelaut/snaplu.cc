import { signIn as _signIn } from "next-auth/react";

export const signIn = async () => {
  await _signIn("google", {
    // TODO: use real callback, use the current path.
    callbackUrl: "http://localhost:3000",
  });
};
