'use client'
import React, { useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useMessage, useMessageActions } from '@/store/MessageContext';
import { MessageType } from '@/types/message';

const MessageDisplay: React.FC = () => {
  const { state } = useMessage();
  const { clearMessage } = useMessageActions();

  useEffect(() => {
    if (state.message) {
      const timer = setTimeout(() => {
        clearMessage();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.message, clearMessage]);

  if (!state.message) return null;

  return (
    <Snackbar 
      open={!!state.message} 
      autoHideDuration={5000} 
      onClose={clearMessage}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={clearMessage} 
        severity={state.message.resultType as MessageType} 
        sx={{ width: '100%' }}
      >
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {state.message.message}
        </div>
      </Alert>
    </Snackbar>
  );
};

export default MessageDisplay;