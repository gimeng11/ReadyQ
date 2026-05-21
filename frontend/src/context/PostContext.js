import React, { createContext, useContext, useState, useEffect } from 'react';
import * as communityApi from '../api/community';

const PostContext = createContext();

export function PostProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [scrappedPosts, setScrappedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [commentedPosts, setCommentedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 전체 게시글 로드 (탭별)
  const loadPosts = async (boardType) => {
    setLoading(true);
    try {
      const data = await communityApi.getBoards(boardType);
      setPosts(data);
    } catch (e) {
      console.error('게시글 로드 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  // 내 활동 데이터 로드
  const loadMyActivities = async (type) => {
    try {
      let data = [];
      if (type === 'myPosts') {
        data = await communityApi.getMyPosts();
        setMyPosts(data);
      } else if (type === 'liked') {
        data = await communityApi.getLikedPosts();
        setLikedPosts(data);
      } else if (type === 'scrapped') {
        data = await communityApi.getScrappedPosts();
        setScrappedPosts(data);
      } else if (type === 'myComments') {
        data = await communityApi.getCommentedPosts();
        setCommentedPosts(data);
      }
      return data;
    } catch (e) {
      console.error(`${type} 로드 실패:`, e);
      return [];
    }
  };

  const addPost = async (content) => {
    try {
      const newPost = await communityApi.createBoard(content);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (e) {
      throw e;
    }
  };

  const deletePost = async (id) => {
    try {
      await communityApi.deleteBoard(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      throw e;
    }
  };

  const updatePost = async (id, updated) => {
    try {
      const newPost = await communityApi.updateBoard(id, updated);
      setPosts((prev) => prev.map((p) => (p.id === id ? newPost : p)));
    } catch (e) {
      throw e;
    }
  };

  const addComment = async (postId, text) => {
    // 댓글 API는 아직 안만들었으므로 추후 연동 필요
    console.log('댓글 추가:', postId, text);
  };

  const toggleLike = async (id) => {
    try {
      const isLiked = await communityApi.toggleLike(id);
      // 목록 데이터 업데이트 로직 필요 (필요 시 loadPosts 재호출)
      return isLiked;
    } catch (e) {
      throw e;
    }
  };

  const toggleScrap = async (id) => {
    try {
      const isScrappedNow = await communityApi.toggleScrap(id);
      await loadMyActivities('scrapped'); // 스크랩 목록 갱신
      return isScrappedNow;
    } catch (e) {
      throw e;
    }
  };

  const isScrapped = (id) => {
    return scrappedPosts.some((p) => p.id === id);
  };

  return (
    <PostContext.Provider value={{
      posts, loading, loadPosts, loadMyActivities,
      myPosts, likedPosts, scrappedPosts, commentedPosts,
      addPost, deletePost, updatePost,
      addComment, toggleLike, toggleScrap, isScrapped,
    }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  return useContext(PostContext);
}