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
      // 백엔드 jobTitle을 mainJob > subJob 형태로 파싱 필요 시 처리
      setUserInfo({
        nickname: data.nickname,
        mainJob: data.jobTitle || '',
        subJob: '', // 백엔드 구조에 맞춰 조정 필요
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
      const data = await userApi.updateMyInfo({
        nickname: updated.nickname,
        jobTitle: updated.mainJob, // mainJob을 jobTitle로 저장
        career: updated.career,
      });
      setUserInfo({
        nickname: data.nickname,
        mainJob: data.jobTitle || '',
        subJob: '',
        career: data.career || '',
      });
    } catch (e) {
      console.error('유저 정보 수정 실패:', e);
      throw e;
    }
  };

  return (
    <UserContext.Provider value={{ userInfo, updateUserInfo, fetchUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}