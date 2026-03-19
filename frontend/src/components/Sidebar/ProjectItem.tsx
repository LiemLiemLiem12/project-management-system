type ProjectItemProps = {
  label: string;
  link: string;
};

export default function ProjectItem({ label, link }: ProjectItemProps) {
  return (
    <a
      href={link}
      className="flex w-full px-3 py-2 items-center rounded-md text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors"
    >
      <span className="w-1 h-1 bg-blue-300 rounded-full mr-3"></span>
      <span>{label}</span>
    </a>
  );
}
