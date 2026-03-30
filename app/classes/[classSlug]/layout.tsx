export default function ClassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] overflow-y-auto">
      {children}
    </div>
  );
}
