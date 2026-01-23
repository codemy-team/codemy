// Success Message Toast Component
interface SuccessMessageProps {
  message: string;
  onClose: () => void;
}

const SuccessMessage = ({ message, onClose }: SuccessMessageProps) => {
  return (
    <div className="fixed top-6 right-6 z-50 animate-fade-in-down">
      <div className="bg-white border-l-4 border-emerald-500 rounded-lg shadow-xl p-4 flex items-center gap-3 min-w-[300px]">
        <div className="bg-emerald-100 rounded-full p-2">
          <svg
            className="w-5 h-5 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-800">Success</p>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default SuccessMessage;
