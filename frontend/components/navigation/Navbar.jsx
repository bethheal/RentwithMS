import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAppShell } from "../../context/AppShellContext.jsx";
import { marketingNavigation } from "../../data/navigation.js";
import BrandMark from "../common/BrandMark.jsx";
import Container from "../common/Container.jsx";
import PrimaryButton from "../common/PrimaryButton.jsx";
import { ROUTES } from "../../routes/routePaths.js";

function getIsActive(item, pathname, hash) {
  if (!item.to) {
    return false;
  }

  const [itemPathname, itemHashValue] = item.to.split("#");
  const normalizedPathname = itemPathname || "/";
  const normalizedHash = itemHashValue ? `#${itemHashValue}` : "";

  if (normalizedHash) {
    return (
      pathname === normalizedPathname && (hash || "#home") === normalizedHash
    );
  }

  return pathname === normalizedPathname;
}

function NavAnchor({ item, isActive, onClick }) {
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={`relative inline-flex items-center self-stretch px-2 pt-3 pb-2 text-[0.76rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-700 ${
        isActive ? "text-white" : "text-white/85 hover:text-white"
      }`}
    >
      <span
        className={`absolute left-1/2 top-0 h-1.5 w-12 -translate-x-1/2 rounded-b-full bg-white transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isActive ? "scale-x-100 opacity-100" : "scale-x-35 opacity-0"
        }`}
        aria-hidden="true"
      />
      {item.label}
    </Link>
  );
}

export default function Navbar() {
  const { toggleSidebar } = useAppShell();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-transparent">
      <Container className="max-w-[1380px] px-2 py-3 sm:px-4 sm:py-4 lg:px-5">
        <div className="flex min-h-[3.55rem] items-center justify-between gap-4 rounded-full border border-white/15 bg-[var(--color-hero-ink)] px-5 py-0 text-white shadow-hero sm:px-7 lg:px-10">
          <div className="hidden items-stretch gap-9 self-stretch lg:flex">
            {marketingNavigation.left.map((item) => (
              <NavAnchor
                key={item.label}
                item={item}
                isActive={getIsActive(item, location.pathname, location.hash)}
              />
            ))}
          </div>

          <div className="hidden shrink-0 lg:flex lg:items-center">
            <BrandMark compact className="text-white" theme="light" />
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <BrandMark compact theme="light" />
          </div>

          <div className="hidden items-stretch gap-5 self-stretch lg:flex">
            {marketingNavigation.right.map((item) => (
              <NavAnchor
                key={item.label}
                item={item}
                isActive={getIsActive(item, location.pathname, location.hash)}
              />
            ))}

            <div className="flex items-center gap-4">
              <PrimaryButton
                to={ROUTES.LOGIN}
                size="md"
                variant="light"
                className="px-7 py-2 text-[0.72rem]"
              >
                Login
              </PrimaryButton>

              <PrimaryButton
                to={ROUTES.SIGNUP}
                size="md"
                variant="light"
                className="px-7 py-2 text-[0.72rem]"
              >
                Signup
              </PrimaryButton>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <Link
              to={ROUTES.LOGIN}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
            >
              Login
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              className="grid size-11 place-items-center rounded-full border border-white/20 text-white transition hover:bg-white/10"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
