"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

const SUBJECTS = ["C 프로그래밍", "공학설계", "미적분학", "영어 학술 글쓰기", "시사 쟁점", "미술의 이해", "홀리램스/슬기짜기", "기타"];

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || a.due.localeCompare(b.due));
}

function formatDueDate(due) {
  const [year, month, day] = due.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [guestbookEntries, setGuestbookEntries] = useState([]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingTask, setSavingTask] = useState(false);
  const [savingGuestbook, setSavingGuestbook] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [activeGuestbookId, setActiveGuestbookId] = useState(null);
  const [error, setError] = useState("");

  async function loadData(currentUser) {
    setLoading(true);
    const taskQuery = currentUser
      ? supabase.from("tasks").select("*").order("done", { ascending: true }).order("due", { ascending: true })
      : Promise.resolve({ data: [], error: null });
    const [taskResult, guestbookResult] = await Promise.all([
      taskQuery,
      supabase.from("guestbook_entries").select("*").order("created_at", { ascending: false }).limit(20)
    ]);

    const failed = [taskResult.error, guestbookResult.error].find(Boolean);
    if (failed) setError(failed.message);
    if (!taskResult.error) setTasks(sortTasks(taskResult.data ?? []));
    if (!guestbookResult.error) setGuestbookEntries(guestbookResult.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    async function initialize() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      await loadData(currentUser);
    }

    initialize();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      loadData(currentUser);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    setError("");
    await supabase.auth.signOut();
    setTasks([]);
  }

  async function addTask(event) {
    event.preventDefault();
    if (!user) {
      setError("내 과제를 저장하려면 먼저 로그인해주세요.");
      return;
    }
    if (!title.trim() || !due) {
      setError("과제 이름과 마감일을 모두 입력해주세요.");
      return;
    }

    setSavingTask(true);
    setError("");
    const { data, error: insertError } = await supabase
      .from("tasks")
      .insert({ subject, title: title.trim(), due, done: false })
      .select()
      .single();

    if (insertError) setError(insertError.message);
    else {
      setTasks((current) => sortTasks([...current, data]));
      setSubject(SUBJECTS[0]);
      setTitle("");
      setDue("");
    }
    setSavingTask(false);
  }

  async function toggleTask(task) {
    setError("");
    setActiveTaskId(task.id);
    const { error: updateError } = await supabase.from("tasks").update({ done: !task.done }).eq("id", task.id);
    if (updateError) setError(updateError.message);
    else setTasks((current) => sortTasks(current.map((item) => item.id === task.id ? { ...item, done: !item.done } : item)));
    setActiveTaskId(null);
  }

  async function deleteTask(task) {
    if (!window.confirm(`“${task.title}” 과제를 삭제할까요?`)) return;
    setError("");
    setActiveTaskId(task.id);
    const { error: deleteError } = await supabase.from("tasks").delete().eq("id", task.id);
    if (deleteError) setError(deleteError.message);
    else setTasks((current) => current.filter((item) => item.id !== task.id));
    setActiveTaskId(null);
  }

  async function addGuestbookEntry(event) {
    event.preventDefault();
    if (!user) {
      setError("방명록을 남기려면 먼저 로그인해주세요.");
      return;
    }
    if (!guestName.trim() || !guestMessage.trim()) {
      setError("이름과 방명록 메시지를 모두 입력해주세요.");
      return;
    }
    setSavingGuestbook(true);
    setError("");
    const { data, error: insertError } = await supabase
      .from("guestbook_entries")
      .insert({ name: guestName.trim(), message: guestMessage.trim() })
      .select()
      .single();
    if (insertError) setError(insertError.message);
    else {
      setGuestbookEntries((current) => [data, ...current].slice(0, 20));
      setGuestName("");
      setGuestMessage("");
    }
    setSavingGuestbook(false);
  }

  async function deleteGuestbookEntry(entry) {
    if (!window.confirm("이 방명록을 삭제할까요?")) return;
    setError("");
    setActiveGuestbookId(entry.id);
    const { error: deleteError } = await supabase.from("guestbook_entries").delete().eq("id", entry.id);
    if (deleteError) setError(deleteError.message);
    else setGuestbookEntries((current) => current.filter((item) => item.id !== entry.id));
    setActiveGuestbookId(null);
  }

  const remaining = tasks.filter((task) => !task.done).length;

  return (
    <main className="page">
      <section className="container">
        <header className="hero">
          <div>
            <p className="eyebrow">COLLEGE MVP · SUPABASE</p>
            <h1>내 과제 관리</h1>
            <p className="subtitle">로그인하면 나만의 과제를 저장하고 관리할 수 있습니다.</p>
          </div>
          <div className="header-actions">
            {user ? <><p className="user-email">{user.email}</p><button className="text-button" type="button" onClick={signOut}>로그아웃</button></> : <div className="auth-links"><Link href="/login">로그인</Link><Link className="signup-link" href="/signup">회원가입</Link></div>}
            <div className="count"><strong>{remaining}</strong><span>남은 과제</span></div>
          </div>
        </header>
        {error && <div className="error" role="alert">⚠️ {error}</div>}

        <section className="card add-card" aria-labelledby="add-task-title">
          <div className="section-title"><div><h2 id="add-task-title">새 과제 추가</h2><p>{user ? "과목, 과제 이름, 마감일을 입력하세요." : "내 과제를 추가하려면 먼저 로그인하세요."}</p></div></div>
          <form onSubmit={addTask} className="form">
            <label>과목<select value={subject} disabled={!user} onChange={(event) => setSubject(event.target.value)}>{SUBJECTS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label>과제 이름<input value={title} disabled={!user} onChange={(event) => setTitle(event.target.value)} placeholder="예: 배열 과제" required /></label>
            <label>마감일<input type="date" value={due} disabled={!user} onChange={(event) => setDue(event.target.value)} required /></label>
            <button type="submit" disabled={!user || savingTask}>{savingTask ? "저장 중..." : "+ 과제 추가"}</button>
          </form>
        </section>

        <section className="card" aria-labelledby="task-list-title">
          <div className="section-title"><div><h2 id="task-list-title">내 과제</h2><p>{user ? "마감일이 가까운 미완료 과제부터 표시합니다." : "로그인 후 내 과제를 불러옵니다."}</p></div><span className="badge">{tasks.length}개</span></div>
          {loading ? <div className="empty">정보를 불러오는 중...</div> : <div className="task-list">
            {!user ? <div className="empty">로그인하면 내 과제를 확인할 수 있습니다.</div> : tasks.length === 0 ? <div className="empty">등록된 과제가 없습니다.</div> : tasks.map((task) => <article className={`task ${task.done ? "completed" : ""}`} key={task.id}>
              <button className="check" onClick={() => toggleTask(task)} disabled={activeTaskId === task.id} aria-label={task.done ? "미완료로 변경" : "완료 처리"} aria-pressed={task.done}>{task.done ? "✓" : ""}</button>
              <div className="task-info"><span className="subject">{task.subject}</span><h3>{task.title}</h3><p>마감일 · {formatDueDate(task.due)}</p></div>
              <button className="delete" onClick={() => deleteTask(task)} disabled={activeTaskId === task.id}>삭제</button>
            </article>)}
          </div>}
        </section>

        <section className="card guestbook" aria-labelledby="guestbook-title">
          <div className="section-title"><div><h2 id="guestbook-title">방명록</h2><p>방문자에게 짧은 메시지를 남겨달라고 해보세요.</p></div><span className="badge">{guestbookEntries.length}개</span></div>
          {user ? <form className="guestbook-form" onSubmit={addGuestbookEntry}>
            <label>이름<input value={guestName} onChange={(event) => setGuestName(event.target.value)} maxLength="30" placeholder="이름 또는 닉네임" required /></label>
            <label>메시지<textarea value={guestMessage} onChange={(event) => setGuestMessage(event.target.value)} maxLength="300" placeholder="따뜻한 한마디를 남겨주세요." required /></label>
            <button type="submit" disabled={savingGuestbook}>{savingGuestbook ? "남기는 중..." : "방명록 남기기"}</button>
          </form> : <div className="guestbook-login"><span>방명록을 남기려면 로그인해주세요.</span><Link href="/login">로그인</Link></div>}
          {!loading && <div className="guestbook-list">
            {guestbookEntries.length === 0 ? <div className="empty">첫 번째 방명록을 남겨보세요.</div> : guestbookEntries.map((entry) => <article className="guestbook-entry" key={entry.id}><div><strong>{entry.name}</strong><time dateTime={entry.created_at}>{formatDateTime(entry.created_at)}</time></div><p>{entry.message}</p>{user?.id === entry.user_id && <button className="delete guestbook-delete" type="button" disabled={activeGuestbookId === entry.id} onClick={() => deleteGuestbookEntry(entry)}>삭제</button>}</article>)}
          </div>}
        </section>
        <footer><p>Next.js + Supabase로 만든 과제 관리 MVP</p></footer>
      </section>
    </main>
  );
}
