// Delete Item Modal Component
import type { ItemToDelete } from "../../types";

interface DeleteItemModalProps {
  itemToDelete: ItemToDelete;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteItemModal = ({
  itemToDelete,
  onClose,
  onDelete,
}: DeleteItemModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            Delete {itemToDelete.type}
          </h3>
          <p className="text-gray-500 mt-2">"{itemToDelete.title}"</p>
          <p className="text-gray-400 text-sm mt-2">
            This action cannot be undone.
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={onDelete}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Permanently
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteItemModal;
