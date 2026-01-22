import "./globals.css";

export const metadata = {
  title: "Security Lab",
  description: "SQL Injection Laboratory",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
