import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-400 sm:px-6">
      <p>
        {APP_NAME}. Credit-weighted CGPA, calculated the right way.
      </p>

      <p className="mt-2">
        <strong className="text-slate-400">Designed & Built by Raymond</strong>
        <br />
        Computer Engineering, '26 Set · ESUT
      </p>
    </footer>
  );
}