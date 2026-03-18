import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

type Task = {
    id: number;
    title: string;
    detail: string | null;
    status: string;
    updated_at: string;
    created_at: string;
};

async function createTask(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "").trim();

    if (!title) {
        return;
    }

    const now = new Date().toISOString();

    const stmt = db.prepare(`
    INSERT INTO task (title, detail, status, updated_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

    stmt.run(title, "", "uncomplete", now, now);

    revalidatePath("/");
}

export default async function Home() {
    const uncompletedStmt = db.prepare(`
    SELECT id, title, detail, status, updated_at, created_at
    FROM task
    WHERE status != ?
    ORDER BY created_at DESC
  `);

    const completedStmt = db.prepare(`
    SELECT id, title, detail, status, updated_at, created_at
    FROM task
    WHERE status = ?
    ORDER BY created_at DESC
  `);

    const uncompletedTasks = uncompletedStmt.all("complete") as Task[];
    const completedTasks = completedStmt.all("complete") as Task[];

    return (
        <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px" }}>
            <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "24px" }}>
                Growry
            </h1>

            <section style={{ marginBottom: "32px" }}>
                <form action={createTask} style={{ display: "flex", gap: "8px" }}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Todoタイトルを入力"
                        style={{
                            flex: 1,
                            padding: "12px",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: "12px 16px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        新規作成
                    </button>
                </form>

                <p style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}>
                    タイトルを入力して新規作成すると、未完了タスクとして保存されます。
                </p>
            </section>

            <section style={{ marginBottom: "40px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
                    未完了タスク
                </h2>

                {uncompletedTasks.length === 0 ? (
                    <p style={{ color: "#666" }}>未完了タスクはありません。</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "12px" }}>
                        {uncompletedTasks.map((task) => (
                            <li
                                key={task.id}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "10px",
                                    padding: "14px",
                                }}
                            >
                                <div style={{ fontWeight: "bold", marginBottom: "6px" }}>{task.title}</div>
                                <div style={{ fontSize: "13px", color: "#666" }}>
                                    status: {task.status}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
                    完了タスク
                </h2>

                {completedTasks.length === 0 ? (
                    <p style={{ color: "#666" }}>完了タスクはありません。</p>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "12px" }}>
                        {completedTasks.map((task) => (
                            <li
                                key={task.id}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "10px",
                                    padding: "14px",
                                    opacity: 0.8,
                                }}
                            >
                                <div style={{ fontWeight: "bold", marginBottom: "6px" }}>{task.title}</div>
                                <div style={{ fontSize: "13px", color: "#666" }}>
                                    status: {task.status}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
