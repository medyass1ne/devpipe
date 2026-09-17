"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ModalContext = createContext(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'alert', // 'alert' or 'confirm'
    message: '',
    resolve: null
  });

  const showAlert = useCallback((message) => {
    return new Promise((resolve) => {
      setModalConfig({
        type: 'alert',
        message,
        resolve
      });
      setIsOpen(true);
    });
  }, []);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setModalConfig({
        type: 'confirm',
        message,
        resolve
      });
      setIsOpen(true);
    });
  }, []);

  const handleClose = (result) => {
    setIsOpen(false);
    if (modalConfig.resolve) {
      modalConfig.resolve(result);
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-surface border border-surface-raised rounded-sm p-6 max-w-md w-full mx-4 shadow-xl"
            >
              <div className="font-mono text-text-main text-sm mb-6 whitespace-pre-wrap">
                {modalConfig.message}
              </div>
              <div className="flex justify-end space-x-3">
                {modalConfig.type === 'confirm' ? (
                  <>
                    <button
                      onClick={() => handleClose(false)}
                      className="px-4 py-2 font-mono text-sm text-text-muted hover:text-text-main bg-transparent transition"
                    >
                      cancel
                    </button>
                    <button
                      onClick={() => handleClose(true)}
                      className="px-4 py-2 font-mono text-sm text-diff-remove border border-surface-raised hover:bg-surface-raised transition rounded-sm"
                    >
                      confirm
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleClose(true)}
                    className="px-4 py-2 font-mono text-sm text-accent border border-surface-raised hover:bg-surface-raised transition rounded-sm"
                  >
                    ok
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};
