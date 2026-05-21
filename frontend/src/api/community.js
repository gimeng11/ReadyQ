import { apiCall, apiCallAuth } from './client';

export const getBoards = (boardType) => apiCall(`/api/boards?boardType=${boardType}`);

export const getBoardDetail = (id) => apiCallAuth(`/api/boards/${id}`);

export const createBoard = (data) => apiCallAuth('/api/boards', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const updateBoard = (id, data) => apiCallAuth(`/api/boards/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const deleteBoard = (id) => apiCallAuth(`/api/boards/${id}`, {
  method: 'DELETE',
});

export const toggleLike = (id) => apiCallAuth(`/api/boards/${id}/likes`, {
  method: 'POST',
});

export const toggleScrap = (id) => apiCallAuth(`/api/boards/${id}/scraps`, {
  method: 'POST',
});

export const getComments = (boardId) => apiCall(`/api/boards/${boardId}/comments`);

export const createComment = (boardId, data) => apiCallAuth(`/api/boards/${boardId}/comments`, {
  method: 'POST',
  body: JSON.stringify(data),
});

export const getMyPosts = () => apiCallAuth('/api/boards/myposts');
export const getLikedPosts = () => apiCallAuth('/api/boards/liked');
export const getScrappedPosts = () => apiCallAuth('/api/boards/scrapped');
export const getCommentedPosts = () => apiCallAuth('/api/boards/commented');
