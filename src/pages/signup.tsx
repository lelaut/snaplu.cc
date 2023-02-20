import { type NextPage } from "next";

import { EmailField, PasswordField, SubmitField } from "../components/Field";
import { BaseLayout } from "../components/Layout";
import Logo from "../components/Logo";

const SignUpPage: NextPage = () => {
  return (
    <BaseLayout
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* <form className="rounded border border-neutral-200 p-8 dark:border-neutral-700">
        <div className="text-center">
          <Logo />
        </div>

        <div className="py-4 pb-8">
          <EmailField />
          <PasswordField />
        </div>

        <SubmitField />
      </form> */}
    </BaseLayout>
  );
};

export default SignUpPage;
