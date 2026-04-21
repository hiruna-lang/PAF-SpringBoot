import { useState } from "react";
import { formatDate } from "../utils";
import { VALIDATION_LIMITS } from "../validation";

export default function CommentSection({
  ticket,
  currentUserId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  disabled,
}) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingText, setEditingText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleAdd(event) {
    event.preventDefault();
    if (!draft.trim()) {
      return;
    }
    setIsSaving(true);
    try {
      await onAddComment(draft.trim());
      setDraft("");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEditSave(commentId) {
    if (!editingText.trim()) {
      return;
    }
    setIsSaving(true);
    try {
      await onEditComment(commentId, editingText.trim());
      setEditingId("");
      setEditingText("");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="m3-surface-card">
      <div className="m3-section-header">
        <div>
          <span className="m3-eyebrow">Conversation</span>
          <h2>Comments</h2>
          <p>Coordinate updates between requesters, operations staff, and technicians.</p>
        </div>
      </div>

      <div className="m3-comment-thread">
        {ticket.comments.length ? (
          ticket.comments.map((comment) => {
            const isOwner = comment.authorId === currentUserId;
            const isEditing = editingId === comment.id;

            return (
              <article
                key={comment.id}
                className={`m3-comment-bubble ${isOwner ? "m3-comment-bubble--owner" : ""}`}
              >
                <div className="m3-comment-bubble__meta">
                  <div>
                    <strong>{comment.authorName}</strong>
                    <span className="m3-comment-role">{comment.authorRole}</span>
                  </div>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
                {isEditing ? (
                  <>
                    <textarea
                      rows="3"
                      value={editingText}
                      onChange={(event) => setEditingText(event.target.value)}
                      maxLength={VALIDATION_LIMITS.comment.maxMessageLength}
                    />
                    <div className="m3-inline-actions">
                      <button
                        type="button"
                        className="m3-primary-button m3-primary-button--small"
                        onClick={() => handleEditSave(comment.id)}
                        disabled={isSaving}
                      >
                        Save
                      </button>
                      <button type="button" className="m3-secondary-button" onClick={() => setEditingId("")}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <p>{comment.message}</p>
                )}
                {comment.editedAt ? <span className="m3-comment-bubble__edited">Edited</span> : null}
                {isOwner && !disabled && !isEditing ? (
                  <div className="m3-inline-actions">
                    <button
                      type="button"
                      className="m3-link-button"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditingText(comment.message);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="m3-link-button m3-link-button--danger"
                      onClick={() => {
                        if (window.confirm("Delete this comment?")) {
                          onDeleteComment(comment.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="m3-empty-inline">No comments yet. Start the conversation with an operational update.</div>
        )}
      </div>

      <form className="m3-comment-composer" onSubmit={handleAdd}>
        <textarea
          rows="3"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={disabled ? "Comments are locked because this ticket is closed." : "Add an update or ask a question..."}
          maxLength={VALIDATION_LIMITS.comment.maxMessageLength}
          disabled={disabled}
        />
        <button type="submit" className="m3-primary-button" disabled={disabled || isSaving}>
          {isSaving ? "Posting..." : "Add Comment"}
        </button>
      </form>
    </section>
  );
}
