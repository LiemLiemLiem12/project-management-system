type IconLoaderProps = {
  size: number;
};

export default function IconLoader({ size }: IconLoaderProps) {
  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className="animate-spin border-4 border-blue-600 border-t-transparent rounded-full"
    ></div>
  );
}
