"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Task } from "@/app/page";

type Props = {
    uncompletedTasks: Task[];
    completedTasks: Task[];
};

export default function TaskBoard({
    uncompletedTasks,
    completedTasks,
}: Props) {
    const router = useRouter();

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDetail, setEditDetail] = useState("");
    const [editStatus, setEditStatus] = useState("uncomplete");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    function openModal(task: Task) {
        setSelectedTask(task);
        setEditTitle(task.title);
        setEditDetail(task.detail ?? "");
        setEditStatus(task.status);
        setMessage("");
    }

    function closeModal() {
        setSelectedTask(null);
        setMessage("");
    }

    async function handleUpdate() {
        if (!selectedTask) return;

        const trimmedTitle = editTitle.trim();

        if (!trimmedTitle) {
            setMessage("タイトルを入力してください。");
            return;
        }

        setIsSubmitting(true);
        setMessage("");

        try {
            const response = await fetch(`/growry/api/tasks/${selectedTask.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: trimmedTitle,
                    detail: editDetail,
                    status: editStatus,
                }),
            });

            const contentType = response.headers.get("content-type");
            let data: any = null;

            if (contentType?.includes("application/json")) {
                data = await response.json();
            }

            if (!response.ok) {
                setMessage(
                    data?.error ?? `更新に失敗しました。status: ${response.status}`
                );
                return;
            }

            closeModal();
            router.refresh();
        } catch (error) {
            if (error instanceof Error) {
                setMessage(`更新中にエラーが発生しました: ${error.message}`);
            } else {
                setMessage("更新中に不明なエラーが発生しました。");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <section className="taskSection">
                <h2 className="sectionTitle">未完了タスク</h2>
                {uncompletedTasks.length === 0 ? (
                    <div className="emptyState">未完了タスクはありません。</div>
                ) : (
                    <ul className="taskList">
                        {uncompletedTasks.map((task) => (
                            <li key={task.id}>
                                <button
                                    type="button"
                                    className="taskCardButton"
                                    onClick={() => openModal(task)}
                                >
                                    <div className="taskCard">
                                        <div className="taskTitle">{task.title}</div>
                                        <div className="taskMeta">status: {task.status}</div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="taskSection">
                <h2 className="sectionTitle">完了タスク</h2>
                {completedTasks.length === 0 ? (
                    <div className="emptyState">完了タスクはありません。</div>
                ) : (
                    <ul className="taskList">
                        {completedTasks.map((task) => (
                            <li key={task.id}>
                                <button
                                    type="button"
                                    className="taskCardButton"
                                    onClick={() => openModal(task)}
                                >
                                    <div className="taskCard completedTaskCard">
                                        <div className="taskTitle">{task.title}</div>
                                        <div className="taskMeta">status: {task.status}</div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {selectedTask && (
                <div className="modalOverlay" onClick={closeModal}>
                    <div
                        className="modalCard"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="modalHeader">
                            <h3 className="modalTitle">タスク詳細</h3>
                            <button
                                type="button"
                                className="modalCloseButton"
                                onClick={closeModal}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modalBody">
                            <div className="fieldBlock">
                                <label className="fieldLabel" htmlFor="edit-title">
                                    Title
                                </label>
                                <input
                                    id="edit-title"
                                    className="modalInput"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                />
                            </div>

                            <div className="fieldBlock">
                                <label className="fieldLabel" htmlFor="edit-detail">
                                    Detail
                                </label>
                                <textarea
                                    id="edit-detail"
                                    className="modalTextarea"
                                    value={editDetail}
                                    onChange={(e) => setEditDetail(e.target.value)}
                                    placeholder="詳細を入力（メモ・進捗・気づきなど）"
                                />
                            </div>

                            <div className="fieldBlock">
                                <label className="fieldLabel" htmlFor="edit-status">
                                    Status
                                </label>
                                <select
                                    id="edit-status"
                                    className="modalSelect"
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                >
                                    <option value="uncomplete">uncomplete</option>
                                    <option value="complete">complete</option>
                                </select>
                            </div>

                            <div className="fieldBlock">
                                <div className="fieldLabel">Updated At</div>
                                <div className="readonlyValue">{selectedTask.updated_at}</div>
                            </div>

                            <div className="fieldBlock">
                                <div className="fieldLabel">Created At</div>
                                <div className="readonlyValue">{selectedTask.created_at}</div>
                            </div>

                            {message && <p className="formMessage">{message}</p>}
                        </div>

                        <div className="modalFooter">
                            <button
                                type="button"
                                className="secondaryButton"
                                onClick={closeModal}
                                disabled={isSubmitting}
                            >
                                閉じる
                            </button>
                            <button
                                type="button"
                                className="taskButton"
                                onClick={handleUpdate}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "更新中..." : "更新"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
