export function Footer() {
  return (
    <footer className="border-t border-parchment-400 bg-parchment-50 py-8">
      <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-ui text-sm font-semibold text-navy-900">Convertme</p>
        <p className="font-ui text-xs text-navy-700">
          Hebrew texts via{" "}
          <a
            href="https://www.sefaria.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-navy-900"
          >
            Sefaria
          </a>{" "}
          · Open Content License
        </p>
      </div>
    </footer>
  );
}
