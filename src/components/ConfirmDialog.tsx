import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md p-6 mx-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <p className="mb-6 text-gray-600 dark:text-gray-300">{message}</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary bg-error hover:bg-red-600"
          >
            確認刪除
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 