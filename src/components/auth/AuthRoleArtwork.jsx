import { BadgeCheck, HandCoins, KeyRound, ShieldCheck } from "lucide-react";
import tenantIllustration from "../../assets/illustrations/tenantillustraton.png";

export default function AuthRoleArtwork({ roleKey, compact = false }) {
  if (roleKey === "tenant") {
    return (
      <img
        src={tenantIllustration}
        alt="Tenant moving into a room"
        className={
          compact ? "w-28 object-contain" : "w-full max-w-[16.5rem] object-contain"
        }
      />
    );
  }

  if (roleKey === "admin") {
    return (
      <div
        className={
          compact
            ? "relative flex h-24 w-24 items-center justify-center"
            : "relative flex h-48 w-48 items-center justify-center"
        }
        aria-hidden="true"
      >
        <ShieldCheck
          className={compact ? "size-20 text-white" : "size-36 text-white"}
          strokeWidth={1.75}
        />
        <BadgeCheck
          className={
            compact
              ? "absolute right-1 top-1 size-8 text-white"
              : "absolute right-6 top-4 size-14 text-white"
          }
          strokeWidth={2.1}
        />
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "relative flex h-24 w-24 items-center justify-center"
          : "relative flex h-48 w-48 items-center justify-center"
      }
      aria-hidden="true"
    >
      <HandCoins
        className={compact ? "size-20 text-white" : "size-36 text-white"}
        strokeWidth={1.75}
      />
      <KeyRound
        className={
          compact
            ? "absolute left-2 top-0 size-8 text-white"
            : "absolute left-6 top-3 size-14 text-white"
        }
        strokeWidth={2.1}
      />
    </div>
  );
}
