export default function Footer() {
  return (
    <footer className="mt-10 border-t border-neutral-200 dark:border-gray-800">
      <div className="container-pad py-8 text-sm text-neutral-600 dark:text-gray-400 flex items-center justify-between">
        <p>© {new Date().getFullYear()} Campus Eats</p>
        <p className="opacity-80">Made for campus ordering</p>
      </div>
    </footer>
  );
}
