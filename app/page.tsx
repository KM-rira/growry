import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import TaskBoard from "@/app/components/task-board";

export const dynamic = "force-dynamic";

export type Task = {
    id: number;
    title: string;
    detail: string | null;
    status: string;
    updated_at: string;
    created_at: string;
    completed_at: string | null;
};

async function createTask(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "").trim();
    if (!title) return;

    const now = new Date().toLocaleString("ja-JP", {
        timeZone: "Asia/Tokyo",
    });

    db.prepare(`
      INSERT INTO task (title, detail, status, updated_at, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, "", "uncomplete", now, now, null);

    revalidatePath("/growry");
}

function toTask(row: any): Task {
    return {
        id: Number(row.id),
        title: String(row.title ?? ""),
        detail: row.detail == null ? null : String(row.detail),
        status: String(row.status ?? ""),
        updated_at: String(row.updated_at ?? ""),
        created_at: String(row.created_at ?? ""),
        completed_at: String(row.completed_at ?? ""),
    };
}

export default function Home() {
    console.log("PAGE DB READ");

    const uncompletedRows = db.prepare(`
      SELECT id, title, detail, status, updated_at, created_at, completed_at
      FROM task
      WHERE status != ?
      ORDER BY created_at DESC
    `).all("complete");

    const completedRows = db.prepare(`
      SELECT id, title, detail, status, updated_at, created_at, completed_at
      FROM task
      WHERE status = ?
      ORDER BY created_at DESC
    `).all("complete");

    const uncompletedTasks = uncompletedRows.map(toTask);
    const completedTasks = completedRows.map(toTask);

    return (
        <main className="page">
            <h1 className="pageTitle">Growry</h1>
            <p className="pageDescription">
                タイトルを入力して新規作成すると、未完了タスクとして保存されます。
            </p>

            <section className="createSection">
                <form action={createTask} className="taskForm">
                    <input
                        type="text"
                        name="title"
                        placeholder="Todoタイトルを入力"
                        className="taskInput"
                    />
                    <button type="submit" className="taskButton">
                        新規作成
                    </button>
                </form>
            </section>

            <TaskBoard
                uncompletedTasks={uncompletedTasks}
                completedTasks={completedTasks}
            />
        </main>
    );
}
