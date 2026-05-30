import React, { createContext, useContext, useState, useEffect } from 'react';
import * as userApi from '../api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userInfo, setUserInfo] = useState({
    nickname: '로딩중...',
    mainJob: '',
    subJob: '',
    career: '',
  });

  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      
      const data = await userApi.getMyInfo();
      const jobParts = (data.jobTitle || '').split(' > ');
      setUserInfo({
        nickname: data.nickname,
        mainJob: jobParts[0] || '',
        subJob: jobParts[1] || '',
        career: data.career || '',
      });
    } catch (e) {
      console.log('유저 정보 로드 실패 (로그인 필요):', e.message);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const updateUserInfo = async (updated) => {
    try {
      const jobTitle = updated.mainJob && updated.subJob
        ? `${updated.mainJob} > ${updated.subJob}`
        : updated.mainJob || '';
      const data = await userApi.updateMyInfo({
        nickname: updated.nickname,
        jobTitle,
        career: updated.career,
      });
      const jobParts = (data.jobTitle || '').split(' > ');
      setUserInfo({
        nickname: data.nickname,
        mainJob: jobParts[0] || '',
        subJob: jobParts[1] || '',
        career: data.career || '',
      });
    } catch (e) {
      console.error('유저 정보 수정 실패:', e);
      throw e;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setUserInfo({
        nickname: '로그인 필요',
        mainJob: '',
        subJob: '',
        career: '',
      });
    } catch (e) {
      console.error('로그아웃 실패:', e);
    }
  };

  return (
    <UserContext.Provider value={{ userInfo, updateUserInfo, fetchUserInfo, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}