interface SpinProps {
  size: number;

  label?: string;
}

export const Spin = ({ size, label }: SpinProps) => {
  const icon = (
    <svg
      className="animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      style={{ width: size, height: size }}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  if (label) {
    return (
      <div className="flex items-center gap-1">
        {icon}
        <p className="text-xs">{label}</p>
      </div>
    );
  }

  return icon;
};

interface EmptyProps {
  size: number;
}

export const Empty = ({ size }: EmptyProps) => (
  <svg
    className="fill-neutral-900 dark:fill-neutral-50"
    width={size}
    height={size}
    viewBox="0 0 312 312"
  >
    <g transform="translate(-2956.982 -3048.416)">
      <path
        d="M3268.982,3078.286a29.869,29.869,0,0,0-29.869-29.87H2986.851a29.869,29.869,0,0,0-29.869,29.87v252.259a29.87,29.87,0,0,0,29.869,29.871h252.262a29.87,29.87,0,0,0,29.869-29.871Zm-281.9-4.87H3239.3a5.378,5.378,0,0,1,5.684,5.268v141.732h-73.54a12.038,12.038,0,0,0-12.114,12.025,47.854,47.854,0,0,1-95.668,1.918,11.273,11.273,0,0,0,.162-1.906,12.049,12.049,0,0,0-12.116-12.037h-70.724V3078.684C2980.982,3075.574,2983.97,3073.416,2987.08,3073.416Zm252.218,263H2987.08c-3.11,0-6.1-2.4-6.1-5.514v-86.486h59.426a72.092,72.092,0,0,0,142.13,0h62.444V3330.9A5.577,5.577,0,0,1,3239.3,3336.416Z"
        // fill="#453c5c"
      />
    </g>
  </svg>
);

interface CloseProps {
  size: number;
  className?: string;
}

export const Close = ({ size, className }: CloseProps) => (
  <svg
    className={className || "fill-black dark:fill-white"}
    width={size}
    height={size}
    viewBox="0 0 1024 1024"
  >
    <path d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504 738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512 828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496 285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512 195.2 285.696a64 64 0 0 1 0-90.496z" />
  </svg>
);

interface PersonProps {
  size: number;
  className?: string;
}

export const Person = ({ size, className }: PersonProps) => (
  <svg className={className} height={size} width={size} viewBox="0 0 512 512">
    <path d="M159.131,169.721c5.635,58.338,43.367,96.867,96.871,96.867c53.502,0,91.23-38.53,96.867-96.867l7.988-63.029   C365.812,44.768,315.281,0,256.002,0c-59.281,0-109.812,44.768-104.86,106.692L159.131,169.721z" />
    <path d="M463.213,422.569l-3.824-24.35c-3.203-20.417-16.035-38.042-34.475-47.361l-80.473-40.693   c-2.519-1.274-4.57-3.194-6.289-5.338c-23.297,24.632-51.6,39.12-82.15,39.12c-30.549,0-58.856-14.488-82.152-39.12   c-1.719,2.144-3.77,4.064-6.289,5.338l-80.472,40.693c-18.442,9.319-31.272,26.944-34.475,47.361l-3.826,24.35   c-1.363,8.692,0.436,21.448,8.222,27.825C67.42,458.907,105.875,512,256.002,512c150.125,0,188.578-53.093,198.988-61.606   C462.779,444.017,464.576,431.261,463.213,422.569z" />
  </svg>
);
