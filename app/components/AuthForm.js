"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isSignup = mode === "signup";

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    const credentials = { email: email.trim(), password };
    const result = isSignup
      ? await supabase.auth.signUp(credentials)
      : await supabase.auth.signInWithPassword(credentials);

    if (result.error) {
      setError(result.error.message);
    } else if (isSignup && !result.data.session) {
      setMessage("가입 확인 이메일을 보냈습니다. 이메일 인증 후 로그인해주세요.");
    } else {
      router.push("/");
      router.refresh();
    }
    setSaving(false);
  }

  async function signInWithGoogle() {
    setError("");
    setMessage("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (oauthError) setError(oauthError.message);
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <Link className="back-link" href="/">← 과제 관리로 돌아가기</Link>
        <p className="eyebrow">COLLEGE MVP · SUPABASE</p>
        <h1 id="auth-title">{isSignup ? "회원가입" : "로그인"}</h1>
        <p className="subtitle">{isSignup ? "이메일로 계정을 만들고 나만의 과제를 관리하세요." : "내 과제를 확인하려면 로그인하세요."}</p>
        <form className="auth-page-form" onSubmit={submit}>
          <label>이메일<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoComplete="email" /></label>
          <label>비밀번호<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="6자 이상" minLength="6" required autoComplete={isSignup ? "new-password" : "current-password"} /></label>
          <button type="submit" disabled={saving}>{saving ? "처리 중..." : isSignup ? "회원가입" : "로그인"}</button>
        </form>
        <div className="auth-divider"><span>또는</span></div>
        <button className="google-button" type="button" onClick={signInWithGoogle}>
          Google로 계속하기
        </button>
        {message && <div className="notice" role="status">{message}</div>}
        {error && <div className="error" role="alert">⚠️ {error}</div>}
        <p className="auth-footer">{isSignup ? <>이미 계정이 있나요? <Link href="/login">로그인</Link></> : <>처음인가요? <Link href="/signup">회원가입</Link></>}</p>
      </section>
    </main>
  );
}
