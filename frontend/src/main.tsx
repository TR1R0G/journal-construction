import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

function App() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Строительный объект</p>
        <h1>Журнал работ</h1>
        <p>
          Каркас приложения готов: React frontend, Express API, Prisma и PostgreSQL.
          Бизнес-логика записей журнала будет добавлена следующим шагом.
        </p>
      </section>

      <section className="card">
        <h2>API</h2>
        <p>
          Backend URL: <code>{apiUrl}</code>
        </p>
        <a href={`${apiUrl}/health`} target="_blank" rel="noreferrer">
          Проверить healthcheck
        </a>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
