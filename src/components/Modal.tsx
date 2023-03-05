import { type ReactNode, useRef } from "react";

import { useOutsideEvent } from "../utils/hooks";

interface ModalProps {
  children: ReactNode;
  close: () => void;
}

const Modal = ({ children, close }: ModalProps) => {
  const ref = useRef(null);

  useOutsideEvent(ref, close);

  return (
    <div className="fixed inset-0 z-10 flex h-screen w-screen items-center justify-center overflow-hidden bg-white/60 backdrop-blur dark:bg-black/60">
      <div
        ref={ref}
        className="rounded-xl border border-black bg-neutral-50 p-4 dark:border-white dark:bg-neutral-900"
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
