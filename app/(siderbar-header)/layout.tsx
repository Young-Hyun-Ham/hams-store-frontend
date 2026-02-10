// app/(siderbar-header)/layout.tsx

export default function SiderbarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}