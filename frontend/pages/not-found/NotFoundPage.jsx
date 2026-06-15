import { Link } from "react-router-dom";
import Container from "../../components/common/Container.jsx";
import PrimaryButton from "../../components/common/PrimaryButton.jsx";
import { ROUTES } from "../../routes/routePaths.js";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center bg-ivory py-12">
      <Container>
        <div className="mx-auto max-w-2xl space-y-6 rounded-[2rem] border border-white/60 bg-white/90 p-8 text-center shadow-soft backdrop-blur-sm sm:p-10">
          <span className="inline-flex items-center rounded-full border border-brand-900/15 bg-white px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-brand-700">
            404
          </span>
          <h1 className="font-display text-5xl font-bold tracking-[-0.06em] text-brand-950">
            Page not found
          </h1>
          <p className="text-sm leading-7 text-slate-600 sm:text-base">
            The route you requested does not exist yet. Head back to the landing
            page or jump into the demo dashboard.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryButton to="/" variant="brand">
              Back Home
            </PrimaryButton>
            <Link
              to={ROUTES.DASHBOARD}
              className="inline-flex items-center justify-center rounded-full border border-brand-200 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-brand-900"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
