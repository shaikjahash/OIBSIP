const STEPS = ['Base', 'Sauce', 'Cheese', 'Vegetables', 'Summary'];

export default function StepIndicator({ current }) {
  return (
    <ol className="flex items-center justify-between gap-2 mb-8 font-body text-sm">
      {STEPS.map((label, idx) => {
        const isActive = idx === current;
        const isDone = idx < current;
        return (
          <li key={label} className="flex-1 flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 font-medium transition-colors ${
                  isActive ? 'bg-tomato text-semolina' : isDone ? 'bg-basil text-semolina' : 'bg-char/10 text-ash'
                }`}
              >
                {idx + 1}
              </span>
              <span className={`hidden sm:inline ${isActive ? 'text-char font-medium' : 'text-ash'}`}>{label}</span>
            </div>
            {idx < STEPS.length - 1 && <div className={`h-px flex-1 ${isDone ? 'bg-basil' : 'bg-char/10'}`} />}
          </li>
        );
      })}
    </ol>
  );
}
