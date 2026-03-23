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


        const stmt = db.prepare(`
            UPDATE task
            SET
                title = ?,
                detail = ?,
                status = ?,
                updated_at = ?,
                completed_at = ?
            WHERE id = ?
        `);
        const now = new Date().toLocaleString("ja-JP", {
            timeZone: "Asia/Tokyo",
        });
        let completedAt = null;
        if (status === "complete") {
            completedAt = now;
        }
        const updatedAt = now;
        const result = stmt.run(
            title,
            detail,
            status,
            updatedAt,
            completedAt,
            taskId
        );


        if ((result.changes ?? 0) === 0) {
            return NextResponse.json(
                { error: "対象のタスクが見つかりませんでした。" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "更新しました。",
        });
    } catch (error) {
        console.error("PUT /api/tasks/[id] error:", error);

        return NextResponse.json(
            {
                error: error instanceof Error
                    ? `更新処理でエラーが発生しました: ${error.message}`
                    : "更新処理で不明なエラーが発生しました。",
            },
            { status: 500 }
        );
    }
}
