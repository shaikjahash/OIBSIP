export default function Footer() {
  return (
    <footer className="bg-char text-semolina/70 mt-24">
      <div className="mx-auto max-w-6xl px-5 py-10 flex flex-col sm:flex-row justify-between gap-4 text-sm font-body">
        <p className="font-display text-lg text-semolina">Forno</p>
        <p>Wood-fired, made to order, delivered warm.</p>
        <p>&copy; {new Date().getFullYear()} Forno Pizza Co.</p>
      </div>
    </footer>
  );
}
