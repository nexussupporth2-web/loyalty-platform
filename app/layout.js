import "./globals.css";

export const metadata = {
  title: "Loyalty Cards for Stores",
  description: "Give every customer a loyalty card.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en"> <body> <div className="wrap">{children}</div> </body> </html>
  );
}
