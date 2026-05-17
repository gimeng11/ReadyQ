import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userInfo, setUserInfo] = useState({
    nickname: '레디큐',
    mainJob: '디자인',
    subJob: 'UI/UX',
    career: '신입',
  });

  const updateUserInfo = (updated) => {
    setUserInfo((prev) => ({ ...prev, ...updated }));
  };

  return (
    <UserContext.Provider value={{ userInfo, updateUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}