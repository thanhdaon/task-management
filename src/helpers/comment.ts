type Comment = {
  id: number;
  parentId: number | null;
  text: string;
  subComments?: Comment[];
};

export function nest(comments: Comment[]) {
  if (comments.length === 0) {
    return comments;
  }

  return comments.reduce<Comment[]>((nested, comment) => {
    const subComments = comments.filter((c) => c.parentId === comment.id);

    if (subComments.length > 0) {
      comment.subComments = subComments;
      nest(subComments);
    }

    if (comment.parentId == null) {
      nested.push(comment);
    }

    return nested;
  }, []);
}
