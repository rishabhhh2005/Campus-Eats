import { Loader2 } from "lucide-react";

export default function LoadingOverlay({ message = "Loading..." }) {
  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-md"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-[280px]"
        style={{ margin: 'auto' }}
      >
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          {message}
        </p>
      </div>
    </div>
  );
}
