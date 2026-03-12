import FloatingBackground from "@/components/FloatingBackground";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <FloatingBackground />
      <div className="absolute inset-0 z-10">{children}</div>
    </div>
  );
}
