'use client'
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { StatusType  } from '../types/message';

interface MessageState {
  message: StatusType | null;
}

type MessageAction = 
  | { type: 'SET_MESSAGE'; payload: StatusType }
  | { type: 'CLEAR_MESSAGE' };

const initialState: MessageState = {
  message: null,
};

const messageReducer = (state: MessageState, action: MessageAction): MessageState => {
  switch (action.type) {
    case 'SET_MESSAGE':
      return { ...state, message: action.payload };
    case 'CLEAR_MESSAGE':
      return { ...state, message: null };
    default:
      return state;
  }
};

const MessageContext = createContext<{
  state: MessageState;
  dispatch: React.Dispatch<MessageAction>;
} | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);

  return (
    <MessageContext.Provider value={{ state, dispatch }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

export const useMessageActions = () => {
  const { dispatch } = useMessage();
  return {
    setMessage: (message: StatusType) => dispatch({ type: 'SET_MESSAGE', payload: message }),
    clearMessage: () => dispatch({ type: 'CLEAR_MESSAGE' }),
  };
};