import CommentForm from "@/components/blog/CommentForm";
import DeleteCommentButton from "@/components/blog/DeleteCommentButton";
import { getComments } from "@/lib/blog/queries";
import { formatDate } from "@/lib/blog/types";

export default async function Comments({ postId }: { postId: string }) {
  const comments = await getComments(postId);

  return (
    <div>
      <h2 style={{ fontSize: "var(--text-sm)", fontWeight: 600, letterSpacing: 0, color: "var(--sapphire-dark)" }}>
        Bình luận{comments.length > 0 && ` (${comments.length})`}
      </h2>
      <div className="hairline mt-3 mb-6" />

      <CommentForm postId={postId} />

      {comments.length > 0 && (
        <ul className="mt-8 flex flex-col">
          {comments.map((comment) => (
            <li key={comment.id} className="py-5" style={{ borderTop: "1px solid var(--ink-08)" }}>
              <div className="flex items-center justify-between gap-4">
                <p style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--ink)" }}>
                  {comment.author_name}
                </p>
                <div className="flex items-center gap-2">
                  <time dateTime={comment.created_at} style={{ fontSize: "var(--text-xs)", color: "var(--ink-50)" }}>
                    {formatDate(comment.created_at)}
                  </time>
                  <DeleteCommentButton id={comment.id} postId={postId} />
                </div>
              </div>
              <p className="mt-1 whitespace-pre-line" style={{ fontSize: "var(--text-sm)", color: "var(--ink-70)" }}>
                {comment.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
