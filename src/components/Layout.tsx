import { useSession } from "next-auth/react";
import { useRef, type ReactNode } from "react";
import Logo from "./Logo";
import Searchbar from "./Searchbar";
import ThemeSwitch from "./ThemeSwitch";

interface LayoutProps {
  children: ({
    navHeight,
    bannerHeight,
  }: {
    navHeight: number;
    bannerHeight: number;
  }) => ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const { status } = useSession();

  const isAuthenticated = status === "authenticated";

  return (
    <>
      <nav
        ref={navRef}
        className="fixed z-50 flex w-screen items-center gap-4 border-neutral-200 bg-neutral-50 p-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 md:border-b md:p-4"
      >
        <div className="flex flex-1 gap-2 md:flex-wrap md:gap-4">
          <Logo />
          <Searchbar />
        </div>
        <div className="flex gap-4">
          <div className="hidden gap-2 md:flex">
            <SignInUp />
          </div>
          <ThemeSwitch />
          {isAuthenticated && (
            <div className="h-10 w-10 rounded-full bg-green-500" />
          )}
        </div>
      </nav>
      <main className="h-screen bg-neutral-50 dark:bg-neutral-800">
        {children({
          navHeight: navRef.current?.clientHeight ?? 0,
          bannerHeight: bannerRef.current?.clientHeight ?? 0,
        })}
      </main>

      {!isAuthenticated && (
        <div
          ref={bannerRef}
          className="fixed inset-x-0 bottom-0 flex items-center justify-around bg-green-400 text-neutral-900 md:hidden "
        >
          <div className="py-4">
            <h2 className="text-xl font-semibold">Start playing now</h2>
            <p className="hidden text-sm xs:block">
              People on SnapLu.cc are the first to know.
            </p>
          </div>
          <div className="flex gap-2">
            <SignInUp />
          </div>
        </div>
      )}
    </>
  );
};

const SignInUp = () => (
  <>
    <button className="transition hover:opacity-80">Sign in</button>
    <button className="rounded border border-current px-2 py-1 transition hover:opacity-80">
      Sign up
    </button>
  </>
);
