import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  CreditCard,
  Fingerprint,
  LifeBuoy,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Phone,
  Search,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import FaqAccordionItem from "../cards/FaqAccordionItem.jsx";
import { classNames } from "../../utils/classNames.js";
import { showErrorToast } from "../../utils/toast.js";

function formatDate(dateString) {
  if (!dateString) {
    return "Date unavailable";
  }

  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function deriveInitials(name, fallback = "TU") {
  const initials = String(name ?? "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || fallback;
}

function PanelTitle({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-[#102A74] sm:text-[2rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3"
    >
      <span className="text-sm font-semibold text-[#18399F]">
        {checked ? "On" : "Off"}
      </span>
      <span
        className={classNames(
          "relative inline-flex h-8 w-14 rounded-full transition-colors duration-300",
          checked ? "bg-[#18399F]" : "bg-slate-300"
        )}
      >
        <span
          className={classNames(
            "absolute top-1 size-6 rounded-full bg-white shadow-sm transition-transform duration-300",
            checked ? "translate-x-7" : "translate-x-1"
          )}
        />
      </span>
    </button>
  );
}

function PreferenceRow({ checked, description, label, onChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.3rem] border border-[#DCE5F7] bg-white p-4">
      <div>
        <p className="text-sm font-semibold text-[#102A74]">{label}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}

function ContactCard({ action, description, icon, title }) {
  const Icon = icon;

  return (
    <article className="rounded-[1.6rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_18px_36px_rgba(15,32,86,0.08)]">
      <span className="grid size-11 place-items-center rounded-[1rem] bg-[#EEF4FF] text-[#18399F]">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-[#102A74]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
      <div className="mt-5">{action}</div>
    </article>
  );
}

export function TenantSettingsView({ onSaveSettings, settings }) {
  const [draftSettings, setDraftSettings] = useState(settings);
  const [passwordDraft, setPasswordDraft] = useState({
    confirmPassword: "",
    currentPassword: "",
    newPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  const updateSection = (section, key, value) => {
    setDraftSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateSection("profile", "avatar", reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const hasPasswordAttempt =
      passwordDraft.currentPassword ||
      passwordDraft.newPassword ||
      passwordDraft.confirmPassword;

    if (
      hasPasswordAttempt &&
      passwordDraft.newPassword !== passwordDraft.confirmPassword
    ) {
      setErrorMessage("New password and confirmation do not match.");
      showErrorToast("New password and confirmation do not match.");
      return;
    }

    setErrorMessage("");
    onSaveSettings(draftSettings);
    setPasswordDraft({
      confirmPassword: "",
      currentPassword: "",
      newPassword: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <article className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <PanelTitle
          eyebrow="Settings"
          title="Profile, app preferences, and account security"
          description="Update your personal details, tune how the app notifies you, and adjust how you sign in."
        />
      </article>

      <article className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <div className="flex flex-col items-center rounded-[1.6rem] bg-[#F8FBFF] p-5 text-center">
            <div className="grid size-24 place-items-center overflow-hidden rounded-full bg-[#E8EEFF] text-2xl font-bold text-[#18399F]">
              {draftSettings.profile.avatar ? (
                <img
                  src={draftSettings.profile.avatar}
                  alt={draftSettings.profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{deriveInitials(draftSettings.profile.name)}</span>
              )}
            </div>
            <p className="mt-4 text-base font-semibold text-[#102A74]">
              {draftSettings.profile.name}
            </p>
            <p className="mt-1 text-sm text-slate-500">Tenant profile photo</p>

            <label className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]">
              Upload picture
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                onClick={(event) => {
                  event.currentTarget.value = "";
                }}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
              User Profile
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  Full Name
                </span>
                <input
                  type="text"
                  value={draftSettings.profile.name}
                  onChange={(event) =>
                    updateSection("profile", "name", event.target.value)
                  }
                  className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  Phone Number
                </span>
                <input
                  type="tel"
                  value={draftSettings.profile.phone}
                  onChange={(event) =>
                    updateSection("profile", "phone", event.target.value)
                  }
                  className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  Email Address
                </span>
                <input
                  type="email"
                  value={draftSettings.profile.email}
                  onChange={(event) =>
                    updateSection("profile", "email", event.target.value)
                  }
                  className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
                />
              </label>
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <article className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-[1rem] bg-[#EEF4FF] text-[#18399F]">
              <BellRing className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
                App Settings
              </p>
              <h3 className="mt-1 text-xl font-semibold text-[#102A74]">
                Notification preferences
              </h3>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <PreferenceRow
              checked={draftSettings.notifications.announcements}
              description="Receive notifications when new property notices are published."
              label="Announcements"
              onChange={(value) =>
                updateSection("notifications", "announcements", value)
              }
            />
            <PreferenceRow
              checked={draftSettings.notifications.rentReminders}
              description="Get reminded before your next rent due date arrives."
              label="Rent reminders"
              onChange={(value) =>
                updateSection("notifications", "rentReminders", value)
              }
            />
            <PreferenceRow
              checked={draftSettings.notifications.maintenanceUpdates}
              description="Stay updated when service requests change status."
              label="Maintenance updates"
              onChange={(value) =>
                updateSection("notifications", "maintenanceUpdates", value)
              }
            />
            <PreferenceRow
              checked={draftSettings.notifications.smsAlerts}
              description="Receive urgent notices by SMS when needed."
              label="SMS alerts"
              onChange={(value) =>
                updateSection("notifications", "smsAlerts", value)
              }
            />
          </div>
        </article>

        <article className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-[1rem] bg-[#EEF4FF] text-[#18399F]">
              <CreditCard className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
                Payment Preferences
              </p>
              <h3 className="mt-1 text-xl font-semibold text-[#102A74]">
                Choose how payments should behave
              </h3>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Preferred Payment Method
              </span>
              <select
                value={draftSettings.payment.preferredMethod}
                onChange={(event) =>
                  updateSection("payment", "preferredMethod", event.target.value)
                }
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              >
                <option value="mobile-money">Mobile Money</option>
                <option value="card">Card</option>
                <option value="bank-transfer">Bank Transfer</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Receipt Delivery
              </span>
              <select
                value={draftSettings.payment.receiptDelivery}
                onChange={(event) =>
                  updateSection("payment", "receiptDelivery", event.target.value)
                }
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              >
                <option value="Email">Email</option>
                <option value="In-app only">In-app only</option>
                <option value="Email and SMS">Email and SMS</option>
              </select>
            </label>

            <PreferenceRow
              checked={draftSettings.payment.autoPay}
              description="Automatically attempt payment on the due date using the selected method."
              label="Auto-pay"
              onChange={(value) => updateSection("payment", "autoPay", value)}
            />
          </div>
        </article>
      </div>

      <article className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-[1rem] bg-[#EEF4FF] text-[#18399F]">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
              Security
            </p>
            <h3 className="mt-1 text-xl font-semibold text-[#102A74]">
              Password and sign-in controls
            </h3>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <PreferenceRow
              checked={draftSettings.security.biometricLogin}
              description="Enable fingerprint or device biometrics where supported on mobile."
              label="Biometric login"
              onChange={(value) =>
                updateSection("security", "biometricLogin", value)
              }
            />
            <PreferenceRow
              checked={draftSettings.security.twoFactorAuth}
              description="Require a second verification step for sensitive account actions."
              label="Two-factor authentication"
              onChange={(value) =>
                updateSection("security", "twoFactorAuth", value)
              }
            />
          </div>

          <div className="grid gap-4">
            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                <LockKeyhole className="size-4" />
                Current Password
              </span>
              <input
                type="password"
                value={passwordDraft.currentPassword}
                onChange={(event) =>
                  setPasswordDraft((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </label>

            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                <Fingerprint className="size-4" />
                New Password
              </span>
              <input
                type="password"
                value={passwordDraft.newPassword}
                onChange={(event) =>
                  setPasswordDraft((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Confirm New Password
              </span>
              <input
                type="password"
                value={passwordDraft.confirmPassword}
                onChange={(event) =>
                  setPasswordDraft((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </label>

            {errorMessage ? (
              <p className="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Leave the password fields empty if you only want to update your
                profile and app preferences.
              </p>
            )}
          </div>
        </div>
      </article>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
        >
          <UserCircle2 className="size-4" />
          Save Settings
        </button>
      </div>
    </form>
  );
}

export function TenantHelpView({ helpCenter, onStartSupportChat }) {
  const [searchValue, setSearchValue] = useState("");
  const [openItemId, setOpenItemId] = useState(helpCenter.faqs[0]?.id ?? null);

  const filteredFaqs = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return helpCenter.faqs.filter((item) => {
      const searchableText = [item.question, item.answer].join(" ").toLowerCase();

      return !normalizedSearch || searchableText.includes(normalizedSearch);
    });
  }, [helpCenter.faqs, searchValue]);

  const resolvedOpenItemId = filteredFaqs.some((item) => item.id === openItemId)
    ? openItemId
    : (filteredFaqs[0]?.id ?? null);

  return (
    <section className="space-y-6">
      <article className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <PanelTitle
          eyebrow="Help"
          title="Friendly support when you need it"
          description="Search common help topics first, then reach out through the support channel that feels easiest."
        />

        <label className="mt-6 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Search help topics
          </span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Rent, bookings, receipts, maintenance..."
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            />
          </span>
        </label>
      </article>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <article className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-[1rem] bg-[#EEF4FF] text-[#18399F]">
              <LifeBuoy className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
                Frequently Asked Questions
              </p>
              <h3 className="mt-1 text-xl font-semibold text-[#102A74]">
                Quick answers that reduce back-and-forth
              </h3>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {filteredFaqs.map((item) => (
              <FaqAccordionItem
                key={item.id}
                isOpen={resolvedOpenItemId === item.id}
                item={item}
                onToggle={(itemId) =>
                  setOpenItemId((current) => (current === itemId ? null : itemId))
                }
              />
            ))}
          </div>

          {!filteredFaqs.length ? (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#C9D4EC] bg-[#F9FBFF] px-5 py-10 text-center">
              <p className="text-lg font-semibold text-[#102A74]">
                No help topics match that search
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Try another keyword or reach out to support directly.
              </p>
            </div>
          ) : null}
        </article>

        <section className="space-y-4">
          <ContactCard
            icon={Mail}
            title="Email support"
            description="Best for billing questions, account updates, and document-related requests."
            action={
              <a
                href={`mailto:${helpCenter.support.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Mail className="size-4" />
                {helpCenter.support.email}
              </a>
            }
          />

          <ContactCard
            icon={Phone}
            title="Call support"
            description={`Direct line during support hours: ${helpCenter.support.chatHours}. Emergency: ${helpCenter.support.emergencyLine}.`}
            action={
              <a
                href={`tel:${helpCenter.support.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] px-4 py-2.5 text-sm font-semibold text-[#18399F]"
              >
                <Phone className="size-4" />
                {helpCenter.support.phone}
              </a>
            }
          />

          <ContactCard
            icon={MessageSquareText}
            title="Live chat"
            description="Use chat when you want a lighter, less stressful way to ask a quick question."
            action={
              <button
                type="button"
                onClick={onStartSupportChat}
                className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <MessageSquareText className="size-4" />
                Start support chat
              </button>
            }
          />
        </section>
      </div>
    </section>
  );
}

export function TenantTermsView({ accepted, onToggleAccepted, terms }) {
  return (
    <section className="space-y-6">
      <article className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PanelTitle
            eyebrow="Terms & Conditions"
            title="Readable, structured terms for the tenant workspace"
            description="Review the current portal terms carefully. The latest version appears below with the last updated date."
          />

          <span
            className={classNames(
              "inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold",
              accepted
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            )}
          >
            {accepted ? "Accepted" : "Awaiting acceptance"}
          </span>
        </div>

        <p className="mt-5 text-sm font-medium text-slate-500">
          Last updated: {formatDate(terms.lastUpdated)}
        </p>
      </article>

      <article className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-2">
          {terms.sections.map((section) => (
            <section
              key={section.id}
              className="rounded-[1.5rem] border border-[#E7EDF9] bg-[#FBFDFF] p-5"
            >
              <h3 className="text-base font-semibold text-[#102A74]">
                {section.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </article>

      <label className="flex items-start gap-3 rounded-[1.6rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_16px_30px_rgba(15,32,86,0.06)]">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onToggleAccepted(event.target.checked)}
          className="mt-1 size-4 rounded border border-[#C9D4EC] text-[#18399F]"
        />
        <div>
          <p className="text-sm font-semibold text-[#102A74]">
            I have read and accept the current tenant portal terms.
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            You can revisit this page anytime to review the latest updates.
          </p>
        </div>
      </label>
    </section>
  );
}
