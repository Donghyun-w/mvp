import "./globals.css";

export const metadata = {
  title: "내 과제 관리",
  description: "마감일과 과목별 과제를 관리하는 대학생 과제 관리 앱"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
