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
    comments: 0,
    content: '안녕하세요. 얼마전에 대기업에 합격했는데요, 많은분들이 도움이 되셨으면 해서 글을 올립니다.',
  },
  {
    id: '2',
    tag: '면접 연습',
    title: '내일이 면접날인데,',
    preview: '어떤옷을 입어야할지 모르겠어요. 도와주세요!!',
    category: 'UXUI',
    date: '02.03',
    views: 760,
    likes: 12,
    comments: 0,
    content: '어떤옷을 입어야할지 모르겠어요. 도와주세요!!',
  },
  {
    id: '3',
    tag: '꿀팁',
    title: '면접 꿀팁 드리겠습니다',
    preview: '안녕하세요. 얼마전에 대기업에 합격했는데요,, 많은분들이...',
    category: 'UXUI',
    date: '02.03',
    views: 760,
    likes: 12,
    comments: 0,
    content: '안녕하세요. 얼마전에 대기업에 합격했는데요, 많은분들이 도움이 되셨으면 해서 글을 올립니다.',
  },
  {
    id: '4',
    tag: '면접 연습',
    title: '저랑 면접 연습할 분 구해요..',
    preview: '안녕하세요. 이제 합격까지 면접만 남았는데, 면접이...',
    category: 'UXUI',
    date: '02.03',
    views: 760,
    likes: 12,
    comments: 0,
    content: '안녕하세요. 이제 합격까지 면접만 남았는데, 면접이 너무 떨려요.',
  },
];

const PostContext = createContext();

export function PostProvider({ children }) {
  const [posts, setPosts] = useState(DUMMY_POSTS);
  const [scrappedIds, setScrappedIds] = useState([]);

  const addPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const toggleScrap = (id) => {
    setScrappedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const isScrapped = (id) => scrappedIds.includes(id);

  const scrappedPosts = posts.filter((p) => scrappedIds.includes(p.id));

  return (
    <PostContext.Provider value={{ posts, addPost, toggleScrap, isScrapped, scrappedPosts }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  return useContext(PostContext);
}