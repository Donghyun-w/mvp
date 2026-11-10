import AuthForm from "../components/AuthForm";

export const metadata = { title: "로그인 | 내 과제 관리" };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
