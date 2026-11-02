import "./globals.css";

export const metadata = {
  title: "내 과제 관리",
  description: "과제와 방문자 방명록을 관리하는 대학생 사이트"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
