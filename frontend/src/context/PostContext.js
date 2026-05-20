import React, { createContext, useContext, useState } from 'react';

const DUMMY_POSTS = [
  {
    id: '1',
    tag: '꿀팁',
    title: '대기업 합격한 사람의 면접 꿀팁!',
    preview: '안녕하세요. 얼마전에 대기업에 합격했는데요,, 많은분들이...',
    category: 'UXUI',
    date: '02.03',
    views: 760,
    likes: 12,
    comments: 5,
    content: '안녕하세요. 얼마전에 대기업에 합격했는데요, 많은분들이 도움이 되셨으면 해서 글을 올립니다.',
    isMyPost: false,
  },
  {
    id: '2',
    tag: '면접 연습',
    title: '내일이 면접날인데,',
    preview: '어떤옷을 입어야할지 모르겠어요. 도와주세요!!',
    category: 'UXUI',
    date: '02.03',
    views: 760,
    likes: 8,
    comments: 5,
    content: '어떤옷을 입어야할지 모르겠어요. 도와주세요!!',
    isMyPost: false,
  },
  {
    id: '3',
    tag: '꿀팁',
    title: '면접 꿀팁 드리겠습니다',
    preview: '안녕하세요. 얼마전에 대기업에 합격했는데요,, 많은분들이...',
    category: 'UXUI',
    date: '02.03',
    views: 760,
    likes: 15,
    comments: 5,
    content: '안녕하세요. 얼마전에 대기업에 합격했는데요, 많은분들이 도움이 되셨으면 해서 글을 올립니다.',
    isMyPost: false,
  },
  {
    id: '4',
    tag: '면접 연습',
    title: '저랑 면접 연습할 분 구해요..',
    preview: '안녕하세요. 이제 합격까지 면접만 남았는데, 면접이...',
    category: 'UXUI',
    date: '02.03',
    views: 760,
    likes: 5,
    comments: 5,
    content: '안녕하세요. 이제 합격까지 면접만 남았는데, 면접이 너무 떨려요.',
    isMyPost: false,
  },
];

const DUMMY_COMMENTS = {
  '1': [
    { id: 'c1', postId: '1', author: '유저1', text: '좋은 정보 감사합니다!', date: '02.03', isMyComment: false },
    { id: 'c2', postId: '1', author: '유저2', text: '도움이 많이 됐어요 :)', date: '02.03', isMyComment: false },
  ],
  '2': [
    { id: 'c3', postId: '2', author: '유저3', text: '면접복장은 깔끔하게 입으시면 돼요!', date: '02.03', isMyComment: false },
  ],
  '3': [],
  '4': [
    { id: 'c4', postId: '4', author: '유저4', text: '저도 같이 하고싶어요!', date: '02.03', isMyComment: false },
  ],
};

const PostContext = createContext();

export function PostProvider({ children }) {
  const [posts, setPosts] = useState(DUMMY_POSTS);
  const [comments, setComments] = useState(DUMMY_COMMENTS);
  const [scrappedIds, setScrappedIds] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  // 내가 댓글 단 게시글 id 목록
  const [myCommentedPostIds, setMyCommentedPostIds] = useState([]);

  const addPost = (newPost) => {
    setPosts((prev) => [{ ...newPost, isMyPost: true }, ...prev]);
    setComments((prev) => ({ ...prev, [newPost.id]: [] }));
  };

  const deletePost = (id) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setScrappedIds((prev) => prev.filter((sid) => sid !== id));
    setComments((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const updatePost = (id, updated) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updated,
              preview: updated.content?.slice(0, 40) + (updated.content?.length > 40 ? '...' : '') || p.preview,
            }
          : p
      )
    );
  };

  const addComment = (postId, text) => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const newComment = {
      id: Date.now().toString(),
      postId,
      author: '나',
      text,
      date: `${month}.${day}`,
      isMyComment: true,
    };

    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));

    // 댓글 수 증가
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p
      )
    );

    // 내가 댓글 단 게시글 추적
    setMyCommentedPostIds((prev) =>
      prev.includes(postId) ? prev : [...prev, postId]
    );
  };

  const deleteComment = (postId, commentId) => {
    setComments((prev) => {
      const updated = {
        ...prev,
        [postId]: prev[postId].filter((c) => c.id !== commentId),
      };
      // 내가 단 댓글이 더 없으면 목록에서 제거
      const hasMyComment = updated[postId].some((c) => c.isMyComment);
      if (!hasMyComment) {
        setMyCommentedPostIds((ids) => ids.filter((id) => id !== postId));
      }
      return updated;
    });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: Math.max((p.comments || 0) - 1, 0) } : p
      )
    );
  };

  const getComments = (postId) => comments[postId] || [];

  const toggleScrap = (id) => {
    setScrappedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const toggleLike = (id) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((lid) => lid !== id) : [...prev, id]
    );
  };

  const isScrapped = (id) => scrappedIds.includes(id);
  const isLiked = (id) => likedIds.includes(id);

  const scrappedPosts = posts.filter((p) => scrappedIds.includes(p.id));
  const likedPosts = posts.filter((p) => likedIds.includes(p.id));
  const myCommentedPosts = posts.filter((p) => myCommentedPostIds.includes(p.id));

  // 인기글: 좋아요 10개 이상
  const popularPosts = posts.filter((p) => p.likes >= 10);

  return (
    <PostContext.Provider value={{
      posts,
      popularPosts,
      addPost, deletePost, updatePost,
      addComment, deleteComment, getComments,
      toggleScrap, isScrapped, scrappedPosts,
      toggleLike, isLiked, likedPosts,
      myCommentedPosts,
    }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  return useContext(PostContext);
}