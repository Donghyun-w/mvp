"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTasks() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("done", { ascending: true })
      .order("due", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setTasks(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(e) {
    e.preventDefault();

    if (!subject.trim() || !title.trim() || !due) {
      setError("과목, 과제 이름, 마감일을 모두 입력해주세요.");
      return;
    }

    setSaving(true);
    setError("");

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        subject: subject.trim(),
        title: title.trim(),
        due,
        done: false
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else {
      setTasks((current) => [...current, data]);
      setSubject("");
      setTitle("");
      setDue("");
    }

    setSaving(false);
  }

  async function toggleTask(task) {
    setError("");

    const { error } = await supabase
      .from("tasks")
      .update({ done: !task.done })
      .eq("id", task.id);

    if (error) {
      setError(error.message);
      return;
    }

    setTasks((current) =>
      current.map((item) =>
        item.id === task.id ? { ...item, done: !item.done } : item
      )
    );
  }

  async function deleteTask(id) {
    setError("");

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setTasks((current) => current.filter((task) => task.id !== id));
  }

  const remaining = tasks.filter((task) => !task.done).length;

  return (
    <main className="page">
      <section className="container">
        <header className="hero">
          <div>
            <p className="eyebrow">COLLEGE MVP · SUPABASE</p>
            <h1>📚 My Task Manager</h1>
            <p className="subtitle">
              과제를 추가하면 Supabase 데이터베이스에 저장됩니다.
            </p>
          </div>

          <div className="count">
            <strong>{remaining}</strong>
            <span>남은 과제</span>
          </div>
        </header>

        <section className="card add-card">
          <div className="section-title">
            <div>
              <h2>새 과제 추가</h2>
              <p>과목, 과제 이름, 마감일을 입력하세요.</p>
            </div>
          </div>

          <form onSubmit={addTask} className="form">
            <label>
              과목
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="예: C언어"
              />
            </label>

            <label>
              과제 이름
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 배열 과제"
              />
            </label>

            <label>
              마감일
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </label>

            <button type="submit" disabled={saving}>
              {saving ? "저장 중..." : "+ 과제 추가"}
            </button>
          </form>
        </section>

        {error && <div className="error">⚠️ {error}</div>}

        <section className="card">
          <div className="section-title">
            <div>
              <h2>내 과제</h2>
              <p>데이터베이스에서 불러온 과제입니다.</p>
            </div>
            <span className="badge">{tasks.length}개</span>
          </div>

          {loading ? (
            <div className="empty">과제를 불러오는 중...</div>
          ) : (
            <div className="task-list">
              {tasks.length === 0 ? (
                <div className="empty">등록된 과제가 없습니다.</div>
              ) : (
                tasks.map((task) => (
                  <article
                    className={`task ${task.done ? "completed" : ""}`}
                    key={task.id}
                  >
                    <button
                      className="check"
                      onClick={() => toggleTask(task)}
                      aria-label="완료 처리"
                    >
                      {task.done ? "✓" : ""}
                    </button>

                    <div className="task-info">
                      <span className="subject">{task.subject}</span>
                      <h3>{task.title}</h3>
                      <p>마감일 · {task.due}</p>
                    </div>

                    <button
                      className="delete"
                      onClick={() => deleteTask(task.id)}
                    >
                      삭제
                    </button>
                  </article>
                ))
              )}
            </div>
          )}
        </section>

        <footer>
          <p>Next.js + Supabase로 만든 과제 관리 MVP</p>
        </footer>
      </section>
    </main>
  );
}