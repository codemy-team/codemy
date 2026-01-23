// Course Item Component
interface CourseItemProps {
  item: any;
  courseId: string;
  onDelete: (
    courseId: string,
    itemId: string,
    title: string,
    type: string,
  ) => void;
}

const CourseItem = ({ item, courseId, onDelete }: CourseItemProps) => {
  const isFlashcard =
    (item.type === "quiz" &&
      item.questions?.some((q: QuizQuestion) => q.isFlashcard)) ||
    item.type === "flashcard";
  let icon: string, typeLabel: string;

  if (item.type === "material") {
    icon = "📄";
    typeLabel = "PDF";
  } else if (isFlashcard) {
    icon = "📇";
    typeLabel = "Flashcard";
  } else if (item.type === "quiz") {
    icon = "🎯";
    typeLabel = "Quiz";
  } else {
    icon = "▶";
    typeLabel = "Video";
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <div>
          <p className="font-medium text-gray-800">{item.title}</p>
          <p className="text-xs text-gray-500">{typeLabel}</p>
        </div>
      </div>
      <button
        onClick={() => onDelete(courseId, item.itemId, item.title, typeLabel)}
        className="px-3 py-1.5 text-red-500 hover:bg-red-100 rounded-lg text-sm font-medium transition-all"
      >
        Delete
      </button>
    </div>
  );
};

export default CourseItem;
