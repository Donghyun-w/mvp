"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "college-task-manager.tasks";

const SUBJECTS = [
  "C 프로그래밍",
  "공학설계",
  "미적분학",
  "영어 학술 글쓰기",
  "시사 쟁점",
  "미술의 이해",
  "홀리램스/슬기짜기",
  "기타"
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

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasLoadedTasks, setHasLoadedTasks] = useState(false);

  useEffect(() => {
    try {
      const savedTasks = window.localStorage.getItem(STORAGE_KEY);
      if (savedTasks) setTasks(sortTasks(JSON.parse(savedTasks)));
    } catch {
      setError("저장된 과제를 불러오지 못했습니다.");
    } finally {
      setHasLoadedTasks(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedTasks) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      setError("과제를 이 브라우저에 저장하지 못했습니다.");
    }
  }, [hasLoadedTasks, tasks]);

  function addTask(e) {
    e.preventDefault();

    if (!title.trim() || !due) {
      setError("과제 이름과 마감일을 모두 입력해주세요.");
      return;
    }

    setError("");
    const task = { id: crypto.randomUUID(), subject, title: title.trim(), due, done: false };
    setTasks((current) => sortTasks([...current, task]));
    setSubject(SUBJECTS[0]);
    setTitle("");
    setDue("");
  }

  function toggleTask(task) {
    setError("");
    setTasks((current) =>
      sortTasks(current.map((item) =>
        item.id === task.id ? { ...item, done: !item.done } : item
      ))
    );
  }

  function deleteTask(task) {
    if (!window.confirm(`“${task.title}” 과제를 삭제할까요?`)) return;

    setError("");
    setTasks((current) => current.filter((item) => item.id !== task.id));
  }

  const remaining = tasks.filter((task) => !task.done).length;

  return (
    <main className="page">
      <section className="container">
        <header className="hero">
          <div>
            <p className="eyebrow">COLLEGE MVP · LOCAL</p>
            <h1>내 과제 관리</h1>
            <p className="subtitle">
              과제는 이 브라우저에 안전하게 저장됩니다.
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
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {SUBJECTS.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </label>

            <label>
              과제 이름
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 배열 과제"
                required
              />
            </label>

            <label>
              마감일
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                required
              />
            </label>

            <button type="submit">
              + 과제 추가
            </button>
          </form>
        </section>

        {error && <div className="error" role="alert">⚠️ {error}</div>}

        <section className="card">
          <div className="section-title">
            <div>
              <h2>내 과제</h2>
            <p>이 브라우저에 저장된 과제입니다.</p>
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
                      aria-label={task.done ? "미완료로 변경" : "완료 처리"}
                      aria-pressed={task.done}
                    >
                      {task.done ? "✓" : ""}
                    </button>

                    <div className="task-info">
                      <span className="subject">{task.subject}</span>
                      <h3>{task.title}</h3>
                      <p>마감일 · {formatDueDate(task.due)}</p>
                    </div>

                    <button
                      className="delete"
                      onClick={() => deleteTask(task)}
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
          <p>이 브라우저에 저장되는 과제 관리 MVP</p>
        </footer>
      </section>
    </main>
  );
}
