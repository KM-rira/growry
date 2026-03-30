import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

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

        const completedAt = status === "complete" ? new Date() : null;
        const pool = getPool();
        const result = await pool.query(
            `
        UPDATE task
        SET
          title = $1,
          detail = $2,
          status = $3,
          updated_at = CURRENT_TIMESTAMP,
          completed_at = $4
        WHERE id = $5
      `,
            [title, detail, status, completedAt, taskId]
        );

        if ((result.rowCount ?? 0) === 0) {
            return NextResponse.json(
                { error: "更新対象のタスクが見つかりませんでした。" },
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
                error:
                    error instanceof Error
                        ? `更新処理でエラーが発生しました: ${error.message}`
                        : "更新処理で不明なエラーが発生しました。",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
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

        const pool = getPool();
        const result = await pool.query(
            `
        DELETE FROM task
        WHERE id = $1
      `,
            [taskId]
        );

        if ((result.rowCount ?? 0) === 0) {
            return NextResponse.json(
                { error: "削除対象のタスクが見つかりませんでした。" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "削除しました。",
        });
    } catch (error) {
        console.error("DELETE /api/tasks/[id] error:", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? `削除処理でエラーが発生しました: ${error.message}`
                        : "削除処理で不明なエラーが発生しました。",
            },
            { status: 500 }
        );
    }
}
