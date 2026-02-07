"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ThumbsUp, ThumbsDown, MessageSquare, Pin } from 'lucide-react';
import type { Comment } from '@/types/database';

interface CommentsProps {
  cardType: 'ship' | 'squadron' | 'upgrade' | 'objective';
  cardId: string;
}

interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

export function Comments({ cardType, cardId }: CommentsProps) {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [newComment, setNewComment] = useState({
    authorName: '',
    authorEmail: '',
    content: '',
  });

  const [replyContent, setReplyContent] = useState('');

  const organizeComments = useCallback((flatComments: Comment[]): CommentWithReplies[] => {
    const commentMap = new Map<string, CommentWithReplies>();
    const rootComments: CommentWithReplies[] = [];

    // First pass: create all comment objects
    flatComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into tree
    flatComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies!.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    // Sort: pinned first, then by date
    return rootComments.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, []);

  const loadComments = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/comments?card_type=${cardType}&card_id=${cardId}`
      );
      if (response.ok) {
        const data = await response.json();
        // Organize comments with replies
        const organized = organizeComments(data.data || []);
        setComments(organized);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  }, [cardId, cardType, organizeComments]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.content.trim() || !newComment.authorName.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_type: cardType,
          card_id: cardId,
          author_name: newComment.authorName,
          author_email: newComment.authorEmail,
          content: newComment.content,
        }),
      });

      if (response.ok) {
        setNewComment({ authorName: '', authorEmail: '', content: '' });
        await loadComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !newComment.authorName.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_type: cardType,
          card_id: cardId,
          author_name: newComment.authorName,
          author_email: newComment.authorEmail,
          content: replyContent,
          parent_id: parentId,
        }),
      });

      if (response.ok) {
        setReplyContent('');
        setReplyingTo(null);
        await loadComments();
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment: CommentWithReplies, depth = 0) => {
    const isReplying = replyingTo === comment.id;

    return (
      <div key={comment.id} className={depth > 0 ? 'ml-8 mt-4' : 'mt-4'}>
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{comment.author_name}</span>
                {comment.is_pinned && (
                  <Pin className="h-4 w-4 text-primary" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <p className="text-sm mb-3 whitespace-pre-wrap">{comment.content}</p>

          <div className="flex items-center gap-4 text-sm">
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <ThumbsUp className="h-4 w-4" />
              <span>{comment.upvotes}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-primary transition-colors">
              <ThumbsDown className="h-4 w-4" />
              <span>{comment.downvotes}</span>
            </button>
            <button
              onClick={() => setReplyingTo(isReplying ? null : comment.id)}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Reply</span>
            </button>
          </div>

          {isReplying && (
            <div className="mt-4 space-y-2">
              <Textarea
                placeholder="Write your reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={submitting || !replyContent.trim()}
                >
                  {submitting ? 'Posting...' : 'Post Reply'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-8">
        <p className="text-center text-muted-foreground">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Discussion</h2>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Your name *"
            value={newComment.authorName}
            onChange={(e) =>
              setNewComment({ ...newComment, authorName: e.target.value })
            }
            required
          />
          <Input
            type="email"
            placeholder="Email (optional)"
            value={newComment.authorEmail}
            onChange={(e) =>
              setNewComment({ ...newComment, authorEmail: e.target.value })
            }
          />
        </div>
        <Textarea
          placeholder="Share your thoughts, strategies, or questions about this card..."
          value={newComment.content}
          onChange={(e) =>
            setNewComment({ ...newComment, content: e.target.value })
          }
          rows={4}
          required
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
}
