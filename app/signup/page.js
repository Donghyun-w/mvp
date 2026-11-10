import AuthForm from "../components/AuthForm";

export const metadata = { title: "회원가입 | 내 과제 관리" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
