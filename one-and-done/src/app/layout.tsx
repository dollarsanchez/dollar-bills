import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "One&Done - Smart Bill Splitter",
  description: "แชร์ค่าใช้จ่ายอย่างชาญฉลาด ไม่มีทะเลาะกัน",
  keywords: "bill splitter, แชร์บิล, หารค่าใช้จ่าย, คิดเงิน",
  authors: [{ name: "One&Done Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
