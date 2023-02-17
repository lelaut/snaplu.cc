interface SearchbarProps {}

// TODO: implement this
const Searchbar = ({}: SearchbarProps) => {
  return (
    <div className="flex w-full transform items-center gap-2 rounded-sm border border-neutral-200 bg-neutral-100 px-2 transition-transform focus-within:border-blue-400 dark:border-neutral-600 dark:bg-neutral-700 focus-within:dark:border-blue-600 md:w-fit md:focus-within:scale-105">
      <input className="w-full bg-transparent md:w-[250px]" type="text" />
      <svg
        className="h-8 w-8 fill-black opacity-50 dark:fill-white md:h-6 md:w-6"
        viewBox="0 0 1024 1024"
      >
        <path d="M768 713.7L630.2 575.9c22.3-32.8 35.4-72.4 35.4-115.1 0-113.1-91.7-204.8-204.8-204.8S256 347.7 256 460.8s91.7 204.8 204.8 204.8c42.7 0 82.3-13.1 115.1-35.4L713.7 768l54.3-54.3zM332.8 460.8c0-70.6 57.4-128 128-128s128 57.4 128 128-57.4 128-128 128-128-57.4-128-128z" />
      </svg>
    </div>
  );
};

export default Searchbar;
