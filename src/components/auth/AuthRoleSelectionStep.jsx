import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AuthRoleArtwork from "./AuthRoleArtwork.jsx";

const roleCards = [
 
  {
    id: "tenant",
    label: "Tenant",
   
  },
  {
    id: "landlord",
    label: "Landlord",
 
  },
];

export default function AuthRoleSelectionStep({ mode = "signup" }) {
  const targetPath = mode === "login" ? "/login" : "/signup";
  const title = mode === "login" ? "Choose your login path" : "Choose your account type";

  return (
    <div className="relative grid min-h-screen overflow-hidden bg-[linear-gradient(160deg,#2047B5_0%,#18399F_48%,#10286C_100%)] lg:grid-cols-[minmax(0,0.56fr)_minmax(0,0.44fr)]">
      <div
        className="pointer-events-none absolute inset-y-[-10%] right-[-7%] hidden w-[52%] rounded-l-[52%] bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FAFF_100%)] shadow-[-30px_0_80px_rgba(10,24,76,0.12)] lg:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-[-12%] right-[-7.6%] hidden w-[52.8%] rounded-l-[54%] border-[3px] border-[#4FA8F8]/65 lg:block"
        aria-hidden="true"
      />

      <section className="relative z-10 flex flex-col overflow-hidden px-5 py-6 text-white sm:px-8 lg:px-14 lg:py-10">
        <div
          className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-white/8 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-[-5rem] left-10 h-72 w-72 rounded-full bg-[#4FA8F8]/16 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 text-white transition-all duration-300 hover:bg-white/10"
            aria-label="Back to home"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <Link
            to="/"
            className="text-[1rem] font-extrabold uppercase tracking-[0.36em] text-white transition-opacity duration-300 hover:opacity-85"
          >
            MS
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 items-center py-8 sm:py-10">
          <div className="mx-auto w-full max-w-[40rem] lg:mx-0">
            <span className="inline-flex rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/80 shadow-[0_14px_30px_rgba(5,15,54,0.18)]">
              {mode === "login" ? "Welcome back" : "Get started"}
            </span>

            <h1 className="mt-6 max-w-[26rem] text-[2.35rem] font-bold leading-[1.02] tracking-[-0.05em] text-white sm:text-[3rem]">
              {title}
            </h1>

      

            <div className="mt-12 grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
              {roleCards.map((role) => (
                <Link
                  key={role.id}
                  to={`${targetPath}?role=${role.id}`}
                  className="group flex min-h-[18.5rem] flex-col rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_24px_48px_rgba(5,15,54,0.2)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/12 hover:shadow-[0_30px_56px_rgba(5,15,54,0.28)] sm:p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[1.2rem] font-semibold uppercase tracking-[0.18em] text-white">
                      {role.label}
                    </span>
                    <ArrowRight className="size-5 text-white/80 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>

                  <div className="mt-6 grid flex-1 place-items-center rounded-[1.6rem] border border-white/8 bg-white/6 px-5 py-6">
                    <AuthRoleArtwork roleKey={role.id} compact />
                  </div>

                
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 hidden overflow-hidden lg:flex lg:flex-col lg:justify-center lg:px-14 xl:px-20">
        <div
          className="pointer-events-none absolute right-10 top-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,168,248,0.12),transparent_70%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-[24rem] text-center">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.32em] text-[#18399F]">
            MS logo
          </p>
          <h2 className="mt-6 text-[2.4rem] font-bold leading-[1.04] tracking-[-0.05em] text-[#18399F]">
            The right workspace for every rental journey.
          </h2>
          <p className="mt-6 text-base leading-8 text-slate-500">
            Tenants get a calmer renting experience, landlords manage listings
            with confidence, and admins keep verification and trust signals
            visible across the platform.
          </p>
        </div>
      </section>
    </div>
  );
}
