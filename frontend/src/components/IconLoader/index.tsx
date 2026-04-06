type IconLoaderProps = {
  size: number;
};

export default function IconLoader({ size }: IconLoaderProps) {
  return (
    <div
      className={`animate-spin h-${size} w-${size} border-2 border-white border-t-transparent rounded-full`}
    ></div>
  );
}
