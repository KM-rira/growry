import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const taskId = Number(id);

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return NextResponse.json(
                { error: "不正なtask idです。" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const title = String(body.title ?? "").trim();
        const detail = body.detail == null ? "" : String(body.detail);
        const status = String(body.status ?? "").trim();

        if (!title) {
            return NextResponse.json(
                { error: "titleは必須です。" },
                { status: 400 }
            );
        }

        if (!["uncomplete", "complete"].includes(status)) {
            return NextResponse.json(
                { error: "statusは uncomplete または complete を指定してください。" },
                { status: 400 }
            );
        }

        const now = new Date().toISOString();

        const stmt = db.prepare(`
      UPDATE task
      SET
        title = ?,
        detail = ?,
        status = ?,
        updated_at = ?
      WHERE id = ?
    `);

        const result = stmt.run(title, detail, status, now, taskId) as {
            changes?: number;
        };

        if ((result.changes ?? 0) === 0) {
            return NextResponse.json(
                { error: "対象のタスクが見つかりませんでした。" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "更新しました。",
        });
    } catch {
        return NextResponse.json(
            { error: "更新処理でエラーが発生しました。" },
            { status: 500 }
        );
    }
}
