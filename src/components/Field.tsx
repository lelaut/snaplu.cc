import { type ChangeEvent, type ReactElement, useRef } from "react";

interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;

  name?: string;
  disabled?: boolean;
  error?: string;
  multiline?: boolean;
  placeholder?: string;
  posfix?: string;
}

export const TextField = ({
  value,
  onChange,
  name,
  disabled,
  error,
  multiline,
  placeholder,
  posfix,
}: TextFieldProps) => {
  function handleChange(
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) {
    onChange(e.target.value);
  }

  return (
    <div className="flex-1">
      {name && <p>{name}</p>}
      <div className="group flex flex-row-reverse bg-neutral-200 dark:bg-neutral-700">
        {multiline ? (
          <textarea
            className={`w-full rounded-sm border border-black/50 bg-transparent px-1 focus:border-blue-500 dark:border-white/50 dark:focus:border-blue-500${
              error ? " border-red-400 dark:border-red-400" : ""
            }`}
            style={{ minHeight: 100 }}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
          />
        ) : (
          <>
            {posfix && <p className="px-2 opacity-50">{posfix}</p>}
            <input
              type="text"
              className="peer w-full bg-transparent px-1"
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              disabled={disabled}
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
  onSubmit: () => Promise<void> | void;

  disabled?: boolean;
}

export const SubmitField = ({
  children,
  onSubmit,
  disabled,
}: SubmitFieldProps) => {
  return (
    <button
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={onSubmit}
      className={`cursor-pointer rounded ${
        disabled ? "bg-gray-500" : "bg-blue-500"
      } py-1 px-4 text-white${disabled ? "" : " shadow-2xl shadow-blue-500"}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
