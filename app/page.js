"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const SUBJECTS = [
  "C 프로그래밍", "공학설계", "미적분학", "영어 학술 글쓰기",
  "시사 쟁점", "미술의 이해", "홀리램스/슬기짜기", "기타"
];

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return Number(a.done) - Number(b.done);
    return a.due.localeCompare(b.due);
  });
}

function formatDueDate(due) {
  const [year, month, day] = due.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function Home() {
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
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    const [taskResult, guestbookResult] = await Promise.all([
      supabase.from("tasks").select("*").order("done", { ascending: true }).order("due", { ascending: true }),
      supabase.from("guestbook_entries").select("*").order("created_at", { ascending: false }).limit(20)
    ]);

    const errors = [taskResult.error, guestbookResult.error].filter(Boolean);
    if (errors.length) setError(errors[0].message);
    if (!taskResult.error) setTasks(sortTasks(taskResult.data ?? []));
    if (!guestbookResult.error) setGuestbookEntries(guestbookResult.data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim() || !due) {
      setError("과제 이름과 마감일을 모두 입력해주세요.");
      return;
    }

    setSavingTask(true);
    setError("");
    const { data, error } = await supabase
      .from("tasks")
      .insert({ subject, title: title.trim(), due, done: false })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else {
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
    const { error } = await supabase.from("tasks").update({ done: !task.done }).eq("id", task.id);

    if (error) {
      setError(error.message);
    } else {
      setTasks((current) => sortTasks(current.map((item) => item.id === task.id ? { ...item, done: !item.done } : item)));
    }
    setActiveTaskId(null);
  }

  async function deleteTask(task) {
    if (!window.confirm(`“${task.title}” 과제를 삭제할까요?`)) return;
    setError("");
    setActiveTaskId(task.id);
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);

    if (error) setError(error.message);
    else setTasks((current) => current.filter((item) => item.id !== task.id));
    setActiveTaskId(null);
  }

  async function addGuestbookEntry(event) {
    event.preventDefault();
    if (!guestName.trim() || !guestMessage.trim()) {
      setError("이름과 방명록 메시지를 모두 입력해주세요.");
      return;
    }

    setSavingGuestbook(true);
    setError("");
    const { data, error } = await supabase
      .from("guestbook_entries")
      .insert({ name: guestName.trim(), message: guestMessage.trim() })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else {
      setGuestbookEntries((current) => [data, ...current].slice(0, 20));
      setGuestName("");
      setGuestMessage("");
    }
    setSavingGuestbook(false);
  }

  const remaining = tasks.filter((task) => !task.done).length;

  return (
    <main className="page">
      <section className="container">
        <header className="hero">
          <div>
            <p className="eyebrow">COLLEGE MVP · SUPABASE</p>
            <h1>내 과제 관리</h1>
            <p className="subtitle">과제와 방명록은 Supabase 데이터베이스에 저장됩니다.</p>
          </div>
          <div className="count"><strong>{remaining}</strong><span>남은 과제</span></div>
        </header>

        <section className="card add-card" aria-labelledby="add-task-title">
          <div className="section-title"><div><h2 id="add-task-title">새 과제 추가</h2><p>과목, 과제 이름, 마감일을 입력하세요.</p></div></div>
          <form onSubmit={addTask} className="form">
            <label>과목<select value={subject} onChange={(event) => setSubject(event.target.value)}>{SUBJECTS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label>과제 이름<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="예: 배열 과제" required /></label>
            <label>마감일<input type="date" value={due} onChange={(event) => setDue(event.target.value)} required /></label>
            <button type="submit" disabled={savingTask}>{savingTask ? "저장 중..." : "+ 과제 추가"}</button>
          </form>
        </section>

        {error && <div className="error" role="alert">⚠️ {error}</div>}

        <section className="card" aria-labelledby="task-list-title">
          <div className="section-title"><div><h2 id="task-list-title">내 과제</h2><p>마감일이 가까운 미완료 과제부터 표시합니다.</p></div><span className="badge">{tasks.length}개</span></div>
          {loading ? <div className="empty">정보를 불러오는 중...</div> : <div className="task-list">
            {tasks.length === 0 ? <div className="empty">등록된 과제가 없습니다.</div> : tasks.map((task) => <article className={`task ${task.done ? "completed" : ""}`} key={task.id}>
              <button className="check" onClick={() => toggleTask(task)} disabled={activeTaskId === task.id} aria-label={task.done ? "미완료로 변경" : "완료 처리"} aria-pressed={task.done}>{task.done ? "✓" : ""}</button>
              <div className="task-info"><span className="subject">{task.subject}</span><h3>{task.title}</h3><p>마감일 · {formatDueDate(task.due)}</p></div>
              <button className="delete" onClick={() => deleteTask(task)} disabled={activeTaskId === task.id}>삭제</button>
            </article>)}
          </div>}
        </section>

        <section className="card guestbook" aria-labelledby="guestbook-title">
          <div className="section-title"><div><h2 id="guestbook-title">방명록</h2><p>방문자에게 짧은 메시지를 남겨달라고 해보세요.</p></div><span className="badge">{guestbookEntries.length}개</span></div>
          <form className="guestbook-form" onSubmit={addGuestbookEntry}>
            <label>이름<input value={guestName} onChange={(event) => setGuestName(event.target.value)} maxLength="30" placeholder="이름 또는 닉네임" required /></label>
            <label>메시지<textarea value={guestMessage} onChange={(event) => setGuestMessage(event.target.value)} maxLength="300" placeholder="따뜻한 한마디를 남겨주세요." required /></label>
            <button type="submit" disabled={savingGuestbook}>{savingGuestbook ? "남기는 중..." : "방명록 남기기"}</button>
          </form>
          {!loading && <div className="guestbook-list">
            {guestbookEntries.length === 0 ? <div className="empty">첫 번째 방명록을 남겨보세요.</div> : guestbookEntries.map((entry) => <article className="guestbook-entry" key={entry.id}>
              <div><strong>{entry.name}</strong><time dateTime={entry.created_at}>{formatDateTime(entry.created_at)}</time></div><p>{entry.message}</p>
            </article>)}
          </div>}
        </section>
        <footer><p>Next.js + Supabase로 만든 과제 관리 MVP</p></footer>
      </section>
    </main>
  );
}
