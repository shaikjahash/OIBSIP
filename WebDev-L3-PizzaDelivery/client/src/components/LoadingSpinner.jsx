export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ash font-body">
      <div className="w-8 h-8 border-2 border-ash/30 border-t-tomato rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
