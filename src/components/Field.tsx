const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="group flex flex-row-reverse transition-transform focus-within:scale-105">
    <input
      {...props}
      className="peer rounded-r-sm bg-neutral-200 px-1 dark:bg-neutral-700"
    />
    <div className="w-1 bg-black/50 peer-focus:bg-blue-500 dark:bg-white/50 dark:peer-focus:bg-blue-500" />
  </div>
);

export const EmailField = () => {
  return (
    <div>
      <p>Email</p>
      <Input type="text" />
    </div>
  );
};

export const PasswordField = () => {
  return (
    <div>
      <p>Password</p>
      <Input type="password" />
    </div>
  );
};

export const SubmitField = () => {
  return (
    <div className="flex flex-row-reverse">
      <input
        type="submit"
        className="cursor-pointer rounded bg-blue-500 py-1 px-4 shadow-2xl shadow-blue-500"
      />
    </div>
  );
};
