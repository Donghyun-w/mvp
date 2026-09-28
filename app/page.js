"use client";

import { useState } from "react";

const initialTasks = [
  { id: 1, subject: "C언어", title: "배열 과제", due: "2026-09-30", done: false },
  { id: 2, subject: "수학", title: "적분 문제 풀이", due: "2026-10-02", done: false },
  { id: 3, subject: "영어", title: "Essay 작성", due: "2026-10-05", done: true }
];

export default function Home() {
  const [tasks, setTasks] = useState(initialTasks);
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");

  const addTask = (e) => {
    e.preventDefault();
    if (!subject.trim() || !title.trim() || !due) return;

    setTasks([
      ...tasks,
      {
        id: Date.now(),
        subject: subject.trim(),
        title: title.trim(),
        due,
        done: false
      }
    ]);

    setSubject("");
    setTitle("");
    setDue("");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.due.localeCompare(b.due);
  });

  const remaining = tasks.filter((task) => !task.done).length;

  return (
    <main className="page">
      <section className="container">
        <header className="hero">
          <div>
            <p className="eyebrow">COLLEGE MVP</p>
            <h1>📚 My Task Manager</h1>
            <p className="subtitle">
              여러 과목의 과제와 마감일을 한 곳에서 관리해보세요.
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

            <button type="submit">+ 과제 추가</button>
          </form>
        </section>

        <section className="card">
          <div className="section-title">
            <div>
              <h2>내 과제</h2>
              <p>마감일이 빠른 순서로 정리됩니다.</p>
            </div>
            <span className="badge">{tasks.length}개</span>
          </div>

          <div className="task-list">
            {sortedTasks.length === 0 ? (
              <div className="empty">등록된 과제가 없습니다.</div>
            ) : (
              sortedTasks.map((task) => (
                <article className={`task ${task.done ? "completed" : ""}`} key={task.id}>
                  <button
                    className="check"
                    onClick={() => toggleTask(task.id)}
                    aria-label={`${task.title} 완료 처리`}
                  >
                    {task.done ? "✓" : ""}
                  </button>

                  <div className="task-info">
                    <span className="subject">{task.subject}</span>
                    <h3>{task.title}</h3>
                    <p>마감일 · {task.due}</p>
                  </div>

                  <button className="delete" onClick={() => deleteTask(task.id)}>
                    삭제
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <footer>
          <p>Next.js로 만든 과제 관리 MVP · 기능을 하나씩 추가해보세요.</p>
        </footer>
      </section>
    </main>
  );
}
