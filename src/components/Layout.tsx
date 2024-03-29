import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  useRef,
  type ReactNode,
  type ReactElement,
  useState,
  type CSSProperties,
  useEffect,
} from "react";

import { signIn } from "../utils/auth";
import { Person } from "./Icon";
import Logo from "./Logo";
import Searchbar from "./Searchbar";
import ThemeSwitch from "./ThemeSwitch";

export const BaseLayout = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => {
  return (
    <main
      className="h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
      style={style}
    >
      {children}
    </main>
  );
};

interface LayoutWithNavProps {
  children: (marginTop: number, marginBottom: number) => ReactNode;
}

export const LayoutWithNav = ({ children }: LayoutWithNavProps) => {
  const navRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const computeMarginTop = () => navRef.current?.clientHeight ?? 0;
  const computeMarginBottom = () => bannerRef.current?.clientHeight ?? 0;

  const [marginTop, setMarginTop] = useState(computeMarginTop());
  const [marginBottom, setMarginBottom] = useState(computeMarginBottom());

  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    setMarginTop(computeMarginTop());
    setMarginBottom(computeMarginBottom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computeMarginTop(), computeMarginBottom()]);

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0  z-50 flex w-screen items-center gap-4 border-b border-neutral-200 bg-neutral-50/80 p-2 text-neutral-900 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-50 md:p-4"
      >
        <div className="flex flex-1 gap-2 md:flex-wrap md:gap-4">
          <Logo />
          <Searchbar />
        </div>
        <div className="flex gap-4">
          <div className="hidden gap-2 md:flex">
            {!isAuthenticated && <EnterButton />}
          </div>
          <ThemeSwitch />
          {isAuthenticated && (
            <Link
              href="/me"
              className="rounded-full border border-transparent bg-neutral-200 p-2 hover:border-indigo-400 dark:bg-neutral-700"
            >
              <Person size={20} className="fill-neutral-400" />
              {/* <button className="h-10 w-10 rounded-full bg-green-500" /> */}
            </Link>
          )}
        </div>
      </nav>
      <BaseLayout>{children(marginTop, marginBottom)}</BaseLayout>

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
            {!isAuthenticated && <EnterButton />}
          </div>
        </div>
      )}
    </>
  );
};

interface LayoutCenteredProps {
  children: ReactNode;
  style?: CSSProperties;
}

export const LayoutCentered = ({ children, style }: LayoutCenteredProps) => {
  return (
    <div
      className="mx-auto flex h-full w-full flex-col border-neutral-200 dark:border-neutral-700 md:max-w-screen-md md:border-x"
      style={style}
    >
      {children}
    </div>
  );
};

const EnterButton = () => (
  <button
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onClick={signIn}
    className="rounded bg-neutral-800 px-4 py-1 text-neutral-50 drop-shadow-lg dark:bg-neutral-50 dark:text-neutral-900"
  >
    Enter
  </button>
);

interface LayoutWithFixedContextProps {
  children: ReactNode;
  style?: CSSProperties;
  contextTitle: string;
  contextSubtitle?: ReactElement;
  contextAction?: ReactElement;
  contextContent: ReactElement;
}

export const LayoutWithFixedContext = ({
  children,
  style,
  contextAction,
  contextTitle,
  contextSubtitle,
  contextContent,
}: LayoutWithFixedContextProps) => {
  const [headerOpened, setHeaderOpened] = useState(false);

  const renderContextHeader = () => (
    <div
      className="sticky top-0 flex w-full items-center justify-between border-b border-neutral-200 bg-neutral-50/80 p-4 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/80"
      style={style}
    >
      <div
        className="max-w-screen flex items-center gap-2"
        onClick={() => setHeaderOpened(!headerOpened)}
      >
        <svg
          width="16px"
          height="16px"
          viewBox="0 0 24 24"
          fill="none"
          className={`${
            headerOpened ? "-rotate-180" : "rotate-0"
          } stroke-neutral-900 transition duration-500 dark:stroke-neutral-50 sm:hidden`}
        >
          <path
            d="M7 10L12 15L17 10"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="max-w-full">
          <h2 className="max-w-full break-all text-xl">{contextTitle}</h2>
          {contextSubtitle}
        </div>
      </div>
      {contextAction}
    </div>
  );

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 sm:hidden">
          {renderContextHeader()}
          {headerOpened && (
            <div className="max-h-[300px] overflow-y-auto border-b border-neutral-200 bg-neutral-50/80 p-4 text-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/80">
              {contextContent}
            </div>
          )}
        </div>
        {children}
      </div>
      <div className="hidden max-h-fit w-[400px] border-l border-neutral-200 dark:border-neutral-700 sm:block">
        <div className="h-full overflow-y-auto">
          {renderContextHeader()}
          <div className="p-4 text-sm">{contextContent}</div>
        </div>
      </div>
    </div>
  );
};
