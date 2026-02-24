export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
      {children}
    </div>
  );
}
