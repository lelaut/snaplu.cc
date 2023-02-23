import { ChangeEvent, ReactElement, useRef } from "react";

interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;
  name: string;

  error?: string;
  multiline?: boolean;
  placeholder?: string;
}

export const TextField = ({
  value,
  onChange,
  name,
  error,
  multiline,
  placeholder,
}: TextFieldProps) => {
  function handleChange(
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) {
    onChange(e.target.value);
  }

  return (
    <div>
      <p>{name}</p>
      <div className="group flex flex-row-reverse">
        {multiline ? (
          <textarea
            className={`w-full rounded-sm border border-black/50 bg-neutral-200 px-1 focus:border-blue-500 dark:border-white/50 dark:bg-neutral-700 dark:focus:border-blue-500${
              error ? " border-red-400 dark:border-red-400" : ""
            }`}
            style={{ minHeight: 100 }}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
          />
        ) : (
          <>
            <input
              type="text"
              className="peer w-full rounded-r-sm bg-neutral-200 px-1 dark:bg-neutral-700"
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
            />
            <div
              className={`w-1 bg-black/50 peer-focus:bg-blue-500 dark:bg-white/50 dark:peer-focus:bg-blue-500${
                error ? " bg-red-400 dark:bg-red-400" : ""
              }`}
            />
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

interface UploadFieldProps {
  children: ReactElement | string;
  onReceive: (files: FileList) => void;

  error?: string;
  multiple?: boolean;
  disabled?: boolean;
}

// TODO: allow video(within a certain duration) as well
export const UploadField = ({
  children,
  onReceive,
  error,
  multiple,
  disabled,
}: UploadFieldProps) => {
  const ref = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    ref.current?.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    onReceive(e.target.files);
  };

  return (
    <div className="flex flex-row-reverse text-white">
      <button
        className={`rounded border border-pink-500 bg-pink-500 px-4 py-1${
          error ? " border-red-400" : ""
        }`}
        onClick={handleClick}
        disabled={disabled}
      >
        {children}
      </button>
      <input
        ref={ref}
        type="file"
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
        // accept="image/jpeg"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

interface SubmitFieldProps {
  children: ReactElement | string;
  onSubmit: () => void;

  disabled?: boolean;
}

export const SubmitField = ({
  children,
  onSubmit,
  disabled,
}: SubmitFieldProps) => {
  return (
    <div className="flex flex-row-reverse text-white">
      <button
        onClick={onSubmit}
        className="cursor-pointer rounded bg-blue-500 py-1 px-4 shadow-2xl shadow-blue-500"
        disabled={disabled}
      >
        {children}
      </button>
    </div>
  );
};
