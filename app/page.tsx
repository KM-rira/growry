import { revalidatePath } from "next/cache";
import { getPool } from "@/lib/db";
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

    const pool = getPool();
    await pool.query(
        `
      INSERT INTO task (title, detail, status, updated_at, created_at, completed_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $4)
    `,
        [title, "", "uncomplete", null]
    );

    revalidatePath("/growry");
}

function toTask(row: any): Task {
    return {
        id: Number(row.id),
        title: String(row.title ?? ""),
        detail: row.detail == null ? null : String(row.detail),
        status: String(row.status ?? ""),
        updated_at: row.updated_at == null ? "" : new Date(row.updated_at).toISOString(),
        created_at: row.created_at == null ? "" : new Date(row.created_at).toISOString(),
        completed_at:
            row.completed_at == null ? null : new Date(row.completed_at).toISOString(),
    };
}

export default async function Home() {
    console.log("PAGE DB READ");

    const pool = getPool();
    const uncompletedResult = await pool.query(
        `
      SELECT id, title, detail, status, updated_at, created_at, completed_at
      FROM task
      WHERE status <> $1
      ORDER BY created_at DESC
    `,
        ["complete"]
    );

    const completedResult = await pool.query(
        `
      SELECT id, title, detail, status, updated_at, created_at, completed_at
      FROM task
      WHERE status = $1
      ORDER BY created_at DESC
    `,
        ["complete"]
    );

    const uncompletedTasks = uncompletedResult.rows.map(toTask);
    const completedTasks = completedResult.rows.map(toTask);

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
