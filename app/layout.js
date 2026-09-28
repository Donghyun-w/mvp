import "./globals.css";

export const metadata = {
  title: "My Task Manager",
  description: "Supabase와 연결된 대학생 과제 관리 MVP"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}