import "./globals.css";
import { ReactQueryProvider } from "@/src/providers/ReactQueryProvider";
import { Toaster } from "sonner"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased text-black dark:text-white">
  <ReactQueryProvider>
    {children}
    <Toaster position="top-center" richColors />
  </ReactQueryProvider>
</body>

    </html>
  );
}
