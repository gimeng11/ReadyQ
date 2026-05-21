import { apiCallAuth } from './client';

export const getMyInfo = () => apiCallAuth('/api/users/me');

export const updateMyInfo = (data) => apiCallAuth('/api/users/me', {
  method: 'PUT',
  body: JSON.stringify(data),
});
