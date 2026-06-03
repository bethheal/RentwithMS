import { useMemo, useState } from "react";
import {
  Bell,
  BellRing,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Download,
  Eye,
  FileImage,
  FileText,
  Fingerprint,
  FolderOpen,
  History,
  LifeBuoy,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Paperclip,
  Phone,
  Plus,
  Receipt,
  Search,
  Send,
  SendHorizonal,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  UserCircle2,
  UserRound,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { classNames } from "../../utils/classNames.js";
import FaqAccordionItem from "../cards/FaqAccordionItem.jsx";
import {
  showErrorToast,
  showSuccessToast,
} from "../../utils/toast.js";

const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

function formatMoney(value) {
  return currencyFormatter.format(Number(value ?? 0));
}

function formatDate(dateString, options = {}) {
  if (!dateString) {
    return "Date unavailable";
  }

  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

function formatLongDate(dateString) {
  return formatDate(dateString, {
    month: "long",
  });
}

function formatDateTime(dateString) {
  if (!dateString) {
    return "Date unavailable";
  }

  return new Date(dateString).toLocaleString("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPercent(value) {
  return `${Math.round(Number(value ?? 0))}%`;
}

function normalizeValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function matchesSearch(searchValue, values) {
  const normalizedSearch = normalizeValue(searchValue);

  if (!normalizedSearch) {
    return true;
  }

  return values.some((value) =>
    normalizeValue(value).includes(normalizedSearch)
  );
}

function isWithinDateRange(dateString, startDate, endDate) {
  if (!dateString) {
    return !startDate && !endDate;
  }

  const target = new Date(dateString);

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    if (target < start) {
      return false;
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (target > end) {
      return false;
    }
  }

  return true;
}

function getStatusTone(status) {
  const normalizedStatus = normalizeValue(status);

  if (
    normalizedStatus === "paid" ||
    normalizedStatus === "successful" ||
    normalizedStatus === "approved" ||
    normalizedStatus === "confirmed" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "resolved" ||
    normalizedStatus === "active"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalizedStatus === "pending" ||
    normalizedStatus === "due" ||
    normalizedStatus === "processing" ||
    normalizedStatus === "upcoming" ||
    normalizedStatus === "under review"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (
    normalizedStatus === "overdue" ||
    normalizedStatus === "failed" ||
    normalizedStatus === "rejected" ||
    normalizedStatus === "cancelled" ||
    normalizedStatus === "inactive"
  ) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function getPriorityTone(priority) {
  const normalizedPriority = normalizeValue(priority);

  if (normalizedPriority === "high") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (normalizedPriority === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function getRatingTone(rating) {
  if (rating >= 4) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (rating === 3) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-rose-200 bg-rose-50 text-rose-700";
}

function getFileTypeIcon(fileType) {
  const normalizedType = normalizeValue(fileType);

  if (["png", "jpg", "jpeg", "image"].includes(normalizedType)) {
    return FileImage;
  }

  return FileText;
}

function escapeCsvValue(value) {
  const stringValue = String(value ?? "");

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function downloadTextFile(fileName, content, type = "text/plain;charset=utf-8;") {
  if (typeof window === "undefined") {
    return;
  }

  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function printHtmlDocument(title, bodyMarkup) {
  if (typeof window === "undefined") {
    return;
  }

  const printWindow = window.open("", "_blank", "noopener,noreferrer");

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        body {
          font-family: Inter, Arial, sans-serif;
          margin: 24px;
          color: #102a74;
          background: #ffffff;
        }
        h1, h2, h3, h4, p {
          margin: 0;
        }
        .shell {
          border: 1px solid #dce5f7;
          border-radius: 24px;
          padding: 24px;
        }
        .grid {
          display: grid;
          gap: 16px;
        }
        .cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .cols-3 {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .card {
          border: 1px solid #dce5f7;
          border-radius: 18px;
          padding: 16px;
          background: #fbfdff;
        }
        .row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 10px 0;
          border-bottom: 1px dashed #dce5f7;
        }
        .row:last-child {
          border-bottom: none;
        }
        .muted {
          color: #64748b;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
        }
        th, td {
          border-bottom: 1px solid #e7edf9;
          padding: 12px 10px;
          text-align: left;
          font-size: 14px;
        }
        th {
          color: #5c7bd9;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 11px;
        }
      </style>
    </head>
    <body>${bodyMarkup}</body>
  </html>`);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildReceiptHtml(receipt) {
  const utilityAmount = receipt.paymentBreakdown.utilities ?? 0;
  const feesAmount = receipt.paymentBreakdown.fees ?? 0;

  return `
    <div class="shell">
      <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
        <div>
          <p style="color:#5c7bd9;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">Printable Receipt</p>
          <h1 style="margin-top:8px;font-size:28px;">Receipt ${escapeHtml(receipt.id)}</h1>
          <p class="muted" style="margin-top:8px;">Payment received on ${escapeHtml(
            formatLongDate(receipt.paymentDate)
          )}</p>
        </div>
        <div class="card" style="min-width:180px;">
          <p style="font-size:12px;color:#5c7bd9;font-weight:700;text-transform:uppercase;">Status</p>
          <p style="margin-top:8px;font-size:18px;font-weight:700;">${escapeHtml(
            receipt.status
          )}</p>
        </div>
      </div>

      <div class="grid cols-3" style="margin-top:24px;">
        <div class="card">
          <p style="font-size:12px;color:#5c7bd9;font-weight:700;text-transform:uppercase;">Landlord Details</p>
          <p style="margin-top:12px;font-weight:700;">${escapeHtml(receipt.landlordName)}</p>
          <p class="muted" style="margin-top:6px;">${escapeHtml(receipt.landlordEmail)}</p>
          <p class="muted" style="margin-top:6px;">${escapeHtml(receipt.landlordPhone)}</p>
        </div>
        <div class="card">
          <p style="font-size:12px;color:#5c7bd9;font-weight:700;text-transform:uppercase;">Tenant Details</p>
          <p style="margin-top:12px;font-weight:700;">${escapeHtml(receipt.tenantName)}</p>
          <p class="muted" style="margin-top:6px;">${escapeHtml(receipt.tenantEmail)}</p>
          <p class="muted" style="margin-top:6px;">${escapeHtml(receipt.tenantPhone)}</p>
        </div>
        <div class="card">
          <p style="font-size:12px;color:#5c7bd9;font-weight:700;text-transform:uppercase;">Property Info</p>
          <p style="margin-top:12px;font-weight:700;">${escapeHtml(receipt.propertyName)}</p>
          <p class="muted" style="margin-top:6px;">${escapeHtml(receipt.propertyDetails)}</p>
        </div>
      </div>

      <div class="grid cols-2" style="margin-top:24px;">
        <div class="card">
          <p style="font-size:12px;color:#5c7bd9;font-weight:700;text-transform:uppercase;">Payment Breakdown</p>
          <div class="row" style="margin-top:12px;">
            <span>Rent amount</span>
            <strong>${escapeHtml(formatMoney(receipt.paymentBreakdown.rent))}</strong>
          </div>
          <div class="row">
            <span>Utilities</span>
            <strong>${escapeHtml(formatMoney(utilityAmount))}</strong>
          </div>
          <div class="row">
            <span>Fees</span>
            <strong>${escapeHtml(formatMoney(feesAmount))}</strong>
          </div>
          <div class="row">
            <span>Total paid</span>
            <strong>${escapeHtml(formatMoney(receipt.totalPaid))}</strong>
          </div>
        </div>
        <div class="card">
          <p style="font-size:12px;color:#5c7bd9;font-weight:700;text-transform:uppercase;">Receipt Details</p>
          <div class="row" style="margin-top:12px;">
            <span>Amount</span>
            <strong>${escapeHtml(formatMoney(receipt.amount))}</strong>
          </div>
          <div class="row">
            <span>Payment method</span>
            <strong>${escapeHtml(receipt.paymentMethod)}</strong>
          </div>
          <div class="row">
            <span>Receipt number</span>
            <strong>${escapeHtml(receipt.id)}</strong>
          </div>
          <div class="row">
            <span>Payment date</span>
            <strong>${escapeHtml(formatLongDate(receipt.paymentDate))}</strong>
          </div>
        </div>
      </div>
    </div>
  `;
}

function PanelIntro({ actions, description, eyebrow, title }) {
  return (
    <article className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#102A74] sm:text-[2rem]">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </article>
  );
}

function SummaryCard({ icon: Icon, label, tone = "blue", value, helper }) {
  const iconTone =
    tone === "rose"
      ? "bg-rose-50 text-rose-700"
      : tone === "emerald"
        ? "bg-emerald-50 text-emerald-700"
        : tone === "amber"
          ? "bg-amber-50 text-amber-700"
          : "bg-[#EEF4FF] text-[#18399F]";

  return (
    <article className="rounded-[1.5rem] border border-[#DCE5F7] bg-white p-4 shadow-[0_14px_28px_rgba(15,32,86,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold text-[#102A74]">{value}</p>
          {helper ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">{helper}</p>
          ) : null}
        </div>
        {Icon ? (
          <span className={classNames("grid size-11 place-items-center rounded-[1rem]", iconTone)}>
            <Icon className="size-5" />
          </span>
        ) : null}
      </div>
    </article>
  );
}

function SearchField({ label = "Search", onChange, placeholder, value }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
        {label}
      </span>
      <span className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
        />
      </span>
    </label>
  );
}

function SelectField({ children, label, onChange, value }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
        {label}
      </span>
      <select
        value={value}
        onChange={onChange}
        className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
      >
        {children}
      </select>
    </label>
  );
}

function DateField({ label, onChange, value }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
      />
    </label>
  );
}

function ToneBadge({ className = "", icon: Icon, label, tone }) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        tone,
        className
      )}
    >
      {Icon ? <Icon className="size-3.5" /> : null}
      <span>{label}</span>
    </span>
  );
}

function StatusBadge({ status }) {
  return <ToneBadge label={status} tone={getStatusTone(status)} />;
}

function PriorityBadge({ priority }) {
  return <ToneBadge label={priority} tone={getPriorityTone(priority)} />;
}

function RatingBadge({ rating }) {
  return <ToneBadge label={`${rating} stars`} tone={getRatingTone(rating)} />;
}

function SectionCard({ children, className = "" }) {
  return (
    <article
      className={classNames(
        "rounded-[1.7rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_18px_36px_rgba(15,32,86,0.08)]",
        className
      )}
    >
      {children}
    </article>
  );
}

function EmptyState({ action, description, title }) {
  return (
    <div className="rounded-[1.8rem] border border-dashed border-[#C9D4EC] bg-[#F9FBFF] px-6 py-12 text-center">
      <p className="text-lg font-semibold text-[#102A74]">{title}</p>
      <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

function DetailList({ items }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[1.2rem] border border-[#E7EDF9] bg-[#FBFDFF] p-4"
        >
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5C7BD9]">
            {item.label}
          </dt>
          <dd className="mt-2 text-sm font-medium leading-6 text-[#102A74]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ModalShell({ children, maxWidth = "max-w-3xl", onClose }) {
  useBodyScrollLock(true);

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#07163F]/45"
        aria-label="Close dialog"
      />
      <div
        className={classNames(
          "relative z-10 w-full rounded-[1.8rem] border border-[#DCE5F7] bg-white p-6 shadow-[0_22px_44px_rgba(13,29,76,0.2)]",
          maxWidth
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ eyebrow, title, description, onClose }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
          {eyebrow}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[#102A74]">{title}</h3>
        {description ? (
          <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="grid size-9 place-items-center rounded-full border border-[#C9D4EC] text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
        aria-label="Close dialog"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={classNames(
            "size-4",
            index < rating
              ? "fill-current text-amber-400"
              : "text-slate-300"
          )}
        />
      ))}
    </div>
  );
}

function ChartBars({ colorClass = "bg-[#18399F]", data, suffix = "" }) {
  const maxValue = Math.max(...data.map((item) => Number(item.value ?? item.net ?? item.gross ?? 0)), 1);

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(3.5rem,1fr))] gap-3">
      {data.map((item) => {
        const value = Number(item.value ?? item.net ?? item.gross ?? 0);
        const height = `${Math.max(18, (value / maxValue) * 100)}%`;

        return (
          <div key={item.month ?? item.propertyName ?? item.label} className="flex flex-col items-center gap-3">
            <div className="flex h-40 w-full items-end rounded-[1.2rem] bg-[#F4F7FF] p-2">
              <div
                className={classNames("w-full rounded-[0.9rem]", colorClass)}
                style={{ height }}
                title={`${value}${suffix}`}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#102A74]">
                {item.month ?? item.propertyName ?? item.label}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {suffix === "%" ? `${value}%` : formatMoney(value)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReceiptDetailCard({ receipt }) {
  if (!receipt) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-[#DCE5F7] pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
            Receipt Detail
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[#102A74]">
            {receipt.id}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Payment received on {formatLongDate(receipt.paymentDate)}
          </p>
        </div>
        <StatusBadge status={receipt.status} />
      </div>

      <DetailList
        items={[
          {
            label: "Landlord details",
            value: `${receipt.landlordName} - ${receipt.landlordEmail} - ${receipt.landlordPhone}`,
          },
          {
            label: "Tenant details",
            value: `${receipt.tenantName} - ${receipt.tenantEmail} - ${receipt.tenantPhone}`,
          },
          {
            label: "Property info",
            value: `${receipt.propertyName} - ${receipt.propertyDetails}`,
          },
          {
            label: "Payment method",
            value: receipt.paymentMethod,
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <SectionCard className="border-[#E7EDF9] bg-[#FBFDFF] shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Payment Breakdown
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-[1rem] bg-white px-4 py-3">
              <span className="text-sm text-slate-500">Rent amount</span>
              <span className="text-sm font-semibold text-[#102A74]">
                {formatMoney(receipt.paymentBreakdown.rent)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-[1rem] bg-white px-4 py-3">
              <span className="text-sm text-slate-500">Utilities</span>
              <span className="text-sm font-semibold text-[#102A74]">
                {formatMoney(receipt.paymentBreakdown.utilities)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-[1rem] bg-white px-4 py-3">
              <span className="text-sm text-slate-500">Fees</span>
              <span className="text-sm font-semibold text-[#102A74]">
                {formatMoney(receipt.paymentBreakdown.fees)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-[1rem] bg-[#EEF4FF] px-4 py-3">
              <span className="text-sm font-semibold text-[#102A74]">Total paid</span>
              <span className="text-lg font-semibold text-[#18399F]">
                {formatMoney(receipt.totalPaid)}
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="border-[#E7EDF9] bg-[#FBFDFF] shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Reference
          </p>
          <div className="mt-4 space-y-4 text-sm text-slate-500">
            <div>
              <p className="font-semibold uppercase tracking-[0.14em] text-[#5C7BD9]">
                Amount paid
              </p>
              <p className="mt-2 text-lg font-semibold text-[#102A74]">
                {formatMoney(receipt.amount)}
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.14em] text-[#5C7BD9]">
                Receipt number
              </p>
              <p className="mt-2 font-medium text-[#102A74]">{receipt.id}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.14em] text-[#5C7BD9]">
                Payment date
              </p>
              <p className="mt-2 font-medium text-[#102A74]">
                {formatLongDate(receipt.paymentDate)}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export function LandlordTenantsView({
  onMessageTenant,
  onViewPaymentHistory,
  tenants,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTenant, setSelectedTenant] = useState(null);

  const propertyOptions = useMemo(
    () => Array.from(new Set(tenants.map((tenant) => tenant.propertyName))),
    [tenants]
  );
  const filteredTenants = useMemo(
    () =>
      tenants.filter((tenant) => {
        const matchesText = matchesSearch(searchValue, [
          tenant.fullName,
          tenant.propertyName,
          tenant.unit,
        ]);
        const matchesProperty =
          propertyFilter === "all" || tenant.propertyName === propertyFilter;
        const matchesStatus =
          statusFilter === "all" || tenant.rentStatus === statusFilter;

        return matchesText && matchesProperty && matchesStatus;
      }),
    [propertyFilter, searchValue, statusFilter, tenants]
  );
  const activeLeases = useMemo(
    () =>
      tenants.filter(
        (tenant) => new Date(tenant.leaseEnd).getTime() >= new Date("2026-05-04").getTime()
      ).length,
    [tenants]
  );
  const overdueCount = useMemo(
    () => tenants.filter((tenant) => tenant.rentStatus === "Overdue").length,
    [tenants]
  );

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Tenant Management"
        title="My Tenants"
        description="Search by tenant or property, filter by rent health, and jump straight into the next action you need to take."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={UserRound}
          label="Total Tenants"
          value={tenants.length}
          helper="All occupied units currently linked to your account."
        />
        <SummaryCard
          icon={CalendarDays}
          label="Active Leases"
          value={activeLeases}
          helper="Leases that are still within their current end date."
          tone="emerald"
        />
        <SummaryCard
          icon={CircleAlert}
          label="Overdue Tenants"
          value={overdueCount}
          helper="Tenants needing follow-up on rent this cycle."
          tone="rose"
        />
      </div>

      <SectionCard>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.7fr_0.7fr]">
          <SearchField
            label="Search by Name or Property"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Naomi Mensah, Palm Court Apartment..."
          />
          <SelectField
            label="Property"
            value={propertyFilter}
            onChange={(event) => setPropertyFilter(event.target.value)}
          >
            <option value="all">All properties</option>
            {propertyOptions.map((propertyName) => (
              <option key={propertyName} value={propertyName}>
                {propertyName}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Rent Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="Paid">Paid</option>
            <option value="Due">Due</option>
            <option value="Overdue">Overdue</option>
          </SelectField>
        </div>
      </SectionCard>

      {filteredTenants.length ? (
        <>
          <div className="hidden overflow-hidden rounded-[1.8rem] border border-[#DCE5F7] bg-white shadow-[0_18px_36px_rgba(15,32,86,0.08)] lg:block">
            <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr_0.9fr_1.2fr] gap-4 border-b border-[#E7EDF9] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              <p>Tenant</p>
              <p>Property / Unit</p>
              <p>Contact</p>
              <p>Lease Window</p>
              <p>Rent Status</p>
              <p>Actions</p>
            </div>
            {filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="grid grid-cols-[1.1fr_1fr_1fr_1fr_0.9fr_1.2fr] gap-4 border-b border-[#F0F4FB] px-6 py-5 last:border-b-0"
              >
                <div>
                  <p className="font-semibold text-[#102A74]">{tenant.fullName}</p>
                  <p className="mt-2 text-sm text-slate-500">{tenant.occupation}</p>
                </div>
                <div>
                  <p className="font-medium text-[#102A74]">{tenant.propertyName}</p>
                  <p className="mt-2 text-sm text-slate-500">{tenant.unit}</p>
                </div>
                <div className="text-sm text-slate-500">
                  <p>{tenant.phone}</p>
                  <p className="mt-2">{tenant.email}</p>
                </div>
                <div className="text-sm text-slate-500">
                  <p>{formatLongDate(tenant.leaseStart)}</p>
                  <p className="mt-2">to {formatLongDate(tenant.leaseEnd)}</p>
                </div>
                <div>
                  <StatusBadge status={tenant.rentStatus} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTenant(tenant)}
                    className="rounded-full border border-[#C9D4EC] px-3 py-2 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => onMessageTenant(tenant)}
                    className="rounded-full bg-[#18399F] px-3 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
                  >
                    Message Tenant
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewPaymentHistory(tenant)}
                    className="rounded-full border border-[#C9D4EC] px-3 py-2 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
                  >
                    Payment History
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:hidden">
            {filteredTenants.map((tenant) => (
              <SectionCard key={tenant.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-[#102A74]">
                      {tenant.fullName}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      {tenant.propertyName} - {tenant.unit}
                    </p>
                  </div>
                  <StatusBadge status={tenant.rentStatus} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <p className="text-sm text-slate-500">{tenant.phone}</p>
                  <p className="text-sm text-slate-500">{tenant.email}</p>
                  <p className="text-sm text-slate-500">
                    Lease start: {formatLongDate(tenant.leaseStart)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Lease end: {formatLongDate(tenant.leaseEnd)}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTenant(tenant)}
                    className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => onMessageTenant(tenant)}
                    className="rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Message Tenant
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewPaymentHistory(tenant)}
                    className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
                  >
                    Payment History
                  </button>
                </div>
              </SectionCard>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title="No tenants match those filters"
          description="Try widening the search or reset the property and rent status filters."
        />
      )}

      {selectedTenant ? (
        <ModalShell onClose={() => setSelectedTenant(null)} maxWidth="max-w-4xl">
          <ModalHeader
            eyebrow="Tenant Profile"
            title={selectedTenant.fullName}
            description={`${selectedTenant.propertyName} - ${selectedTenant.unit}`}
            onClose={() => setSelectedTenant(null)}
          />
          <div className="mt-6 space-y-5">
            <DetailList
              items={[
                { label: "Phone", value: selectedTenant.phone },
                { label: "Email", value: selectedTenant.email },
                {
                  label: "Lease window",
                  value: `${formatLongDate(selectedTenant.leaseStart)} to ${formatLongDate(
                    selectedTenant.leaseEnd
                  )}`,
                },
                {
                  label: "Monthly rent",
                  value: formatMoney(selectedTenant.monthlyRent),
                },
                { label: "Occupation", value: selectedTenant.occupation },
                {
                  label: "Emergency contact",
                  value: selectedTenant.emergencyContact,
                },
              ]}
            />
            <SectionCard className="border-[#E7EDF9] bg-[#FBFDFF] shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Profile Notes
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {selectedTenant.notes}
              </p>
            </SectionCard>
          </div>
        </ModalShell>
      ) : null}
    </section>
  );
}

export function LandlordApplicationsView({
  applications,
  description,
  eyebrow,
  onApprove,
  onReject,
  title,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const propertyOptions = useMemo(
    () => Array.from(new Set(applications.map((application) => application.desiredProperty))),
    [applications]
  );
  const filteredApplications = useMemo(
    () =>
      applications.filter((application) => {
        const matchesStatus =
          statusFilter === "all" || application.status === statusFilter;
        const matchesProperty =
          propertyFilter === "all" || application.desiredProperty === propertyFilter;

        return matchesStatus && matchesProperty;
      }),
    [applications, propertyFilter, statusFilter]
  );

  return (
    <section className="space-y-6">
      <PanelIntro eyebrow={eyebrow} title={title} description={description} />

      <SectionCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </SelectField>
          <SelectField
            label="Property"
            value={propertyFilter}
            onChange={(event) => setPropertyFilter(event.target.value)}
          >
            <option value="all">All properties</option>
            {propertyOptions.map((propertyName) => (
              <option key={propertyName} value={propertyName}>
                {propertyName}
              </option>
            ))}
          </SelectField>
        </div>
      </SectionCard>

      {filteredApplications.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredApplications.map((application) => (
            <SectionCard
              key={application.id}
              className={classNames(
                application.status === "Pending"
                  ? "border-[#F6D17C] bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFFFF_100%)]"
                  : ""
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={application.status} />
                    {application.isNew ? (
                      <ToneBadge
                        label="New"
                        tone="border-[#CFE0FF] bg-[#EEF4FF] text-[#18399F]"
                      />
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[#102A74]">
                    {application.applicantName}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {application.desiredProperty} - {application.desiredUnit}
                  </p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>Move-in</p>
                  <p className="mt-2 font-medium text-[#102A74]">
                    {formatLongDate(application.moveInDate)}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-[#F8FBFF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                    Contact
                  </p>
                  <p className="mt-3 text-sm text-slate-500">{application.phone}</p>
                  <p className="mt-2 text-sm text-slate-500">{application.email}</p>
                </div>
                <div className="rounded-[1.2rem] bg-[#F8FBFF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                    Application Date
                  </p>
                  <p className="mt-3 text-sm font-medium text-[#102A74]">
                    {formatLongDate(application.applicationDate)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedApplication(application)}
                  className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => onApprove(application.id)}
                  disabled={application.status === "Approved"}
                  className={classNames(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300",
                    application.status === "Approved"
                      ? "cursor-not-allowed bg-emerald-100 text-emerald-700"
                      : "bg-[#18399F] text-white hover:bg-[#102A74]"
                  )}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => onReject(application.id)}
                  disabled={application.status === "Rejected"}
                  className={classNames(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300",
                    application.status === "Rejected"
                      ? "cursor-not-allowed bg-rose-100 text-rose-700"
                      : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                  )}
                >
                  Reject
                </button>
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No applications match those filters"
          description="Try another property or widen the status filter to see more applications."
        />
      )}

      {selectedApplication ? (
        <ModalShell onClose={() => setSelectedApplication(null)} maxWidth="max-w-4xl">
          <ModalHeader
            eyebrow="Full Application"
            title={selectedApplication.applicantName}
            description={`${selectedApplication.desiredProperty} - ${selectedApplication.desiredUnit}`}
            onClose={() => setSelectedApplication(null)}
          />
          <div className="mt-6 space-y-6">
            <DetailList
              items={[
                { label: "Phone", value: selectedApplication.phone },
                { label: "Email", value: selectedApplication.email },
                {
                  label: "Move-in date",
                  value: formatLongDate(selectedApplication.moveInDate),
                },
                {
                  label: "Application date",
                  value: formatLongDate(selectedApplication.applicationDate),
                },
                {
                  label: "ID number",
                  value: selectedApplication.personalDetails.idNumber,
                },
                {
                  label: "Current address",
                  value: selectedApplication.personalDetails.currentAddress,
                },
              ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
              <SectionCard className="border-[#E7EDF9] bg-[#FBFDFF] shadow-none">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  Personal Details
                </p>
                <div className="mt-4 space-y-3 text-sm text-slate-500">
                  <p>
                    <span className="font-semibold text-[#102A74]">Full name:</span>{" "}
                    {selectedApplication.personalDetails.fullName}
                  </p>
                  <p>
                    <span className="font-semibold text-[#102A74]">Date of birth:</span>{" "}
                    {formatLongDate(selectedApplication.personalDetails.dateOfBirth)}
                  </p>
                  <p>
                    <span className="font-semibold text-[#102A74]">Marital status:</span>{" "}
                    {selectedApplication.personalDetails.maritalStatus}
                  </p>
                </div>
              </SectionCard>

              <SectionCard className="border-[#E7EDF9] bg-[#FBFDFF] shadow-none">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  Employment & Income
                </p>
                <div className="mt-4 space-y-3 text-sm text-slate-500">
                  <p>
                    <span className="font-semibold text-[#102A74]">Employer:</span>{" "}
                    {selectedApplication.employment.employer}
                  </p>
                  <p>
                    <span className="font-semibold text-[#102A74]">Role:</span>{" "}
                    {selectedApplication.employment.role}
                  </p>
                  <p>
                    <span className="font-semibold text-[#102A74]">Monthly income:</span>{" "}
                    {selectedApplication.employment.monthlyIncome}
                  </p>
                  <p>
                    <span className="font-semibold text-[#102A74]">Work email:</span>{" "}
                    {selectedApplication.employment.workEmail}
                  </p>
                </div>
              </SectionCard>
            </div>

            <SectionCard className="border-[#E7EDF9] bg-[#FBFDFF] shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Rental History
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {selectedApplication.rentalHistory}
              </p>
            </SectionCard>

            <SectionCard className="border-[#E7EDF9] bg-[#FBFDFF] shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Uploaded Documents
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedApplication.documents.map((document) => {
                  const Icon = getFileTypeIcon(document.type);

                  return (
                    <span
                      key={document.id}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-[#18399F]"
                    >
                      <Icon className="size-4" />
                      {document.name} ({document.type})
                    </span>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </ModalShell>
      ) : null}
    </section>
  );
}

export function LandlordReviewsView({ onReply, reviews }) {
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseDraft, setResponseDraft] = useState("");

  const propertyOptions = useMemo(
    () => Array.from(new Set(reviews.map((review) => review.propertyName))),
    [reviews]
  );
  const averageRating = useMemo(() => {
    if (!reviews.length) {
      return 0;
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((total / reviews.length).toFixed(1));
  }, [reviews]);
  const filteredReviews = useMemo(
    () =>
      reviews.filter((review) => {
        const matchesProperty =
          propertyFilter === "all" || review.propertyName === propertyFilter;
        const matchesRating =
          ratingFilter === "all" ||
          (ratingFilter === "high" && review.rating >= 4) ||
          (ratingFilter === "mid" && review.rating === 3) ||
          (ratingFilter === "low" && review.rating <= 2);

        return matchesProperty && matchesRating;
      }),
    [propertyFilter, ratingFilter, reviews]
  );

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Tenant Feedback"
        title="Tenant Reviews"
        description="Track rating trends, spot low-scoring feedback quickly, and reply without leaving the review stream."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={Star}
          label="Average Rating"
          value={averageRating.toFixed(1)}
          helper={`${reviews.length} review${reviews.length === 1 ? "" : "s"} received`}
          tone="emerald"
        />
        <SummaryCard
          icon={MessageSquareText}
          label="4+ Star Reviews"
          value={reviews.filter((review) => review.rating >= 4).length}
          helper="Positive sentiment you can reinforce."
        />
        <SummaryCard
          icon={CircleAlert}
          label="Low Ratings"
          value={reviews.filter((review) => review.rating <= 2).length}
          helper="Reviews needing follow-up or a response."
          tone="rose"
        />
      </div>

      <SectionCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Property"
            value={propertyFilter}
            onChange={(event) => setPropertyFilter(event.target.value)}
          >
            <option value="all">All properties</option>
            {propertyOptions.map((propertyName) => (
              <option key={propertyName} value={propertyName}>
                {propertyName}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Rating"
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
          >
            <option value="all">All ratings</option>
            <option value="high">4+ stars</option>
            <option value="mid">3 stars</option>
            <option value="low">Low ratings</option>
          </SelectField>
        </div>
      </SectionCard>

      {filteredReviews.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredReviews.map((review) => (
            <SectionCard
              key={review.id}
              className={classNames(
                review.rating <= 2
                  ? "border-rose-200 bg-[linear-gradient(180deg,#FFF8F8_0%,#FFFFFF_100%)]"
                  : review.rating >= 4
                    ? "border-emerald-200 bg-[linear-gradient(180deg,#F8FFFB_0%,#FFFFFF_100%)]"
                    : ""
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <RatingBadge rating={review.rating} />
                    {review.isAnonymous ? (
                      <ToneBadge
                        label="Anonymous"
                        tone="border-slate-200 bg-slate-50 text-slate-600"
                      />
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[#102A74]">
                    {review.tenantName}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">{review.propertyName}</p>
                </div>
                <div className="text-right">
                  <RatingStars rating={review.rating} />
                  <p className="mt-2 text-sm text-slate-500">
                    {formatLongDate(review.submittedAt)}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-500">{review.feedback}</p>

              {review.response ? (
                <div className="mt-5 rounded-[1.2rem] border border-[#DCE5F7] bg-[#F8FBFF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                    Landlord Response
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#29448F]">
                    {review.response}
                  </p>
                </div>
              ) : null}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedReview(review);
                    setResponseDraft(review.response ?? "");
                  }}
                className="mt-5 rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
              >
                {review.response ? "Edit Response" : "Reply"}
              </button>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No reviews match those filters"
          description="Adjust the property or rating filters to see more tenant feedback."
        />
      )}

      {selectedReview ? (
        <ModalShell onClose={() => setSelectedReview(null)} maxWidth="max-w-2xl">
          <ModalHeader
            eyebrow="Reply to Review"
            title={selectedReview.propertyName}
            description={`Review from ${selectedReview.tenantName}`}
            onClose={() => setSelectedReview(null)}
          />
          <div className="mt-6">
            <p className="rounded-[1.3rem] bg-[#F8FBFF] p-4 text-sm leading-7 text-slate-500">
              {selectedReview.feedback}
            </p>

            <label className="mt-5 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Landlord Response
              </span>
              <textarea
                value={responseDraft}
                onChange={(event) => setResponseDraft(event.target.value)}
                className="min-h-[10rem] w-full rounded-[1rem] border border-[#DCE5F7] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
                placeholder="Write a calm, clear response to the tenant..."
              />
            </label>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onReply(selectedReview.id, responseDraft);
                  setSelectedReview(null);
                }}
                className="rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white"
              >
                Save Response
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}
    </section>
  );
}

function getLatestMonthKey(payments) {
  const latestPayment = [...payments].sort(
    (left, right) => new Date(right.paymentDate) - new Date(left.paymentDate)
  )[0];

  if (!latestPayment) {
    return "";
  }

  const date = new Date(latestPayment.paymentDate);
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function getMonthLabelFromKey(monthKey) {
  if (!monthKey) {
    return "this period";
  }

  const [year, monthIndex] = monthKey.split("-");
  const date = new Date(Number(year), Number(monthIndex), 1);

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function LandlordRentPaymentsView({
  onIssueReceipt,
  payments,
  tenants,
}) {
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const propertyOptions = useMemo(
    () => Array.from(new Set(payments.map((payment) => payment.propertyName))),
    [payments]
  );
  const filteredPayments = useMemo(
    () =>
      payments.filter((payment) => {
        const matchesProperty =
          propertyFilter === "all" || payment.propertyName === propertyFilter;
        const matchesStatus =
          statusFilter === "all" || payment.status === statusFilter;
        const matchesRange = isWithinDateRange(
          payment.paymentDate,
          startDate,
          endDate
        );

        return matchesProperty && matchesStatus && matchesRange;
      }),
    [endDate, payments, propertyFilter, startDate, statusFilter]
  );
  const referenceMonthKey = useMemo(() => getLatestMonthKey(payments), [payments]);
  const monthPayments = useMemo(
    () =>
      payments.filter((payment) => {
        const date = new Date(payment.paymentDate);
        return `${date.getFullYear()}-${date.getMonth()}` === referenceMonthKey;
      }),
    [payments, referenceMonthKey]
  );
  const totalCollected = useMemo(
    () =>
      monthPayments
        .filter((payment) => payment.status === "Successful")
        .reduce((sum, payment) => sum + payment.amount, 0),
    [monthPayments]
  );
  const expectedRent = useMemo(
    () => tenants.reduce((sum, tenant) => sum + tenant.monthlyRent, 0),
    [tenants]
  );
  const outstandingBalance = useMemo(
    () =>
      tenants
        .filter((tenant) => tenant.rentStatus !== "Paid")
        .reduce((sum, tenant) => sum + tenant.monthlyRent, 0),
    [tenants]
  );
  const collectionRate = expectedRent ? (totalCollected / expectedRent) * 100 : 0;

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Rent Collection"
        title="Rent Payments"
        description="Use this page to read the month at a glance, review recent transactions, and issue receipts without leaving the collection workflow."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Wallet}
          label={`Collected (${getMonthLabelFromKey(referenceMonthKey)})`}
          value={formatMoney(totalCollected)}
          helper="Successful rent collected in the most recent payment month."
          tone="emerald"
        />
        <SummaryCard
          icon={Receipt}
          label="Expected Rent"
          value={formatMoney(expectedRent)}
          helper="Total expected rent based on current tenant leases."
        />
        <SummaryCard
          icon={CircleAlert}
          label="Outstanding Balance"
          value={formatMoney(outstandingBalance)}
          helper="Open rent still due or overdue across all tenants."
          tone="rose"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Collection Rate"
          value={formatPercent(collectionRate)}
          helper="Share of expected rent already collected."
          tone="amber"
        />
      </div>

      <SectionCard>
        <div className="grid gap-4 lg:grid-cols-[0.8fr_0.8fr_0.7fr_0.7fr]">
          <SelectField
            label="Property"
            value={propertyFilter}
            onChange={(event) => setPropertyFilter(event.target.value)}
          >
            <option value="all">All properties</option>
            {propertyOptions.map((propertyName) => (
              <option key={propertyName} value={propertyName}>
                {propertyName}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Payment Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="Successful">Successful</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </SelectField>
          <DateField
            label="Start Date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <DateField
            label="End Date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </SectionCard>

      {filteredPayments.length ? (
        <div className="overflow-hidden rounded-[1.8rem] border border-[#DCE5F7] bg-white shadow-[0_18px_36px_rgba(15,32,86,0.08)]">
          <div className="grid grid-cols-[1fr_1fr_0.8fr_0.9fr_0.9fr_1.1fr] gap-4 border-b border-[#E7EDF9] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            <p>Tenant</p>
            <p>Property / Unit</p>
            <p>Amount Paid</p>
            <p>Payment Date</p>
            <p>Method</p>
            <p>Status / Actions</p>
          </div>
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="grid grid-cols-[1fr_1fr_0.8fr_0.9fr_0.9fr_1.1fr] gap-4 border-b border-[#F0F4FB] px-6 py-5 last:border-b-0"
            >
              <div>
                <p className="font-semibold text-[#102A74]">{payment.tenantName}</p>
                <p className="mt-2 text-sm text-slate-500">{payment.transactionId}</p>
              </div>
              <div>
                <p className="font-medium text-[#102A74]">{payment.propertyName}</p>
                <p className="mt-2 text-sm text-slate-500">{payment.unit}</p>
              </div>
              <p className="font-semibold text-[#102A74]">{formatMoney(payment.amount)}</p>
              <p className="text-sm text-slate-500">{formatLongDate(payment.paymentDate)}</p>
              <p className="text-sm text-slate-500">{payment.paymentMethod}</p>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={payment.status} />
                <button
                  type="button"
                  onClick={() => setSelectedPayment(payment)}
                  className="rounded-full border border-[#C9D4EC] px-3 py-2 text-sm font-semibold text-[#18399F]"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => onIssueReceipt(payment)}
                  className="rounded-full bg-[#18399F] px-3 py-2 text-sm font-semibold text-white"
                >
                  Issue Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No payments match those filters"
          description="Try widening the date range or choosing another property or payment status."
        />
      )}

      {selectedPayment ? (
        <ModalShell onClose={() => setSelectedPayment(null)} maxWidth="max-w-2xl">
          <ModalHeader
            eyebrow="Payment Detail"
            title={selectedPayment.tenantName}
            description={`${selectedPayment.propertyName} - ${selectedPayment.unit}`}
            onClose={() => setSelectedPayment(null)}
          />
          <div className="mt-6">
            <DetailList
              items={[
                { label: "Amount paid", value: formatMoney(selectedPayment.amount) },
                {
                  label: "Payment date",
                  value: formatLongDate(selectedPayment.paymentDate),
                },
                { label: "Payment method", value: selectedPayment.paymentMethod },
                { label: "Transaction ID", value: selectedPayment.transactionId },
                { label: "Status", value: selectedPayment.status },
                { label: "Unit", value: selectedPayment.unit },
              ]}
            />
          </div>
        </ModalShell>
      ) : null}
    </section>
  );
}

export function LandlordPaymentHistoryView({
  initialSearchValue,
  payments,
}) {
  const [searchValue, setSearchValue] = useState(initialSearchValue ?? "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  const filteredPayments = useMemo(() => {
    const nextPayments = payments.filter((payment) => {
      const matchesText = matchesSearch(searchValue, [
        payment.tenantName,
        payment.propertyName,
        payment.transactionId,
      ]);
      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;
      const matchesMethod =
        methodFilter === "all" || payment.paymentMethod === methodFilter;
      const matchesRange = isWithinDateRange(
        payment.paymentDate,
        startDate,
        endDate
      );

      return matchesText && matchesStatus && matchesMethod && matchesRange;
    });

    return [...nextPayments].sort((left, right) => {
      if (sortBy === "amount-asc") {
        return left.amount - right.amount;
      }

      if (sortBy === "amount-desc") {
        return right.amount - left.amount;
      }

      if (sortBy === "date-asc") {
        return new Date(left.paymentDate) - new Date(right.paymentDate);
      }

      return new Date(right.paymentDate) - new Date(left.paymentDate);
    });
  }, [endDate, methodFilter, payments, searchValue, sortBy, startDate, statusFilter]);

  const handleExportCsv = () => {
    const lines = [
      [
        "Tenant",
        "Property",
        "Amount",
        "Payment Method",
        "Transaction ID",
        "Date",
        "Status",
      ].join(","),
      ...filteredPayments.map((payment) =>
        [
          payment.tenantName,
          `${payment.propertyName} ${payment.unit}`,
          payment.amount,
          payment.paymentMethod,
          payment.transactionId,
          payment.paymentDate,
          payment.status,
        ]
          .map(escapeCsvValue)
          .join(",")
      ),
    ];

    downloadTextFile("payment-history.csv", lines.join("\n"), "text/csv;charset=utf-8;");
    showSuccessToast("Payment history exported as CSV.");
  };

  const handleExportPdf = () => {
    const tableRows = filteredPayments
      .map(
        (payment) => `
          <tr>
            <td>${escapeHtml(payment.tenantName)}</td>
            <td>${escapeHtml(`${payment.propertyName} - ${payment.unit}`)}</td>
            <td>${escapeHtml(formatMoney(payment.amount))}</td>
            <td>${escapeHtml(payment.paymentMethod)}</td>
            <td>${escapeHtml(payment.transactionId)}</td>
            <td>${escapeHtml(formatLongDate(payment.paymentDate))}</td>
            <td>${escapeHtml(payment.status)}</td>
          </tr>`
      )
      .join("");

    printHtmlDocument(
      "Payment History",
      `
        <div class="shell">
          <h1 style="font-size:28px;">Payment History</h1>
          <p class="muted" style="margin-top:8px;">Filtered transaction export generated from the landlord dashboard.</p>
          <table>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Property</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      `
    );
    showSuccessToast("Payment history opened as a printable PDF view.");
  };

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Transactions"
        title="Payment History"
        description="Review the full rent transaction log, sort it quickly, and export filtered records when you need an external report."
        actions={
          <>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#18399F]"
            >
              <Download className="size-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Download className="size-4" />
              Export PDF
            </button>
          </>
        }
      />

      <SectionCard>
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr_0.7fr_0.7fr]">
          <SearchField
            label="Search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Tenant, property, or transaction ID"
          />
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="Successful">Successful</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </SelectField>
          <SelectField
            label="Method"
            value={methodFilter}
            onChange={(event) => setMethodFilter(event.target.value)}
          >
            <option value="all">All methods</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Card">Card</option>
            <option value="Bank">Bank</option>
          </SelectField>
          <DateField
            label="Start Date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <DateField
            label="End Date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
          <SelectField
            label="Sort By"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="date-desc">Date: newest first</option>
            <option value="date-asc">Date: oldest first</option>
            <option value="amount-desc">Amount: high to low</option>
            <option value="amount-asc">Amount: low to high</option>
          </SelectField>
        </div>
      </SectionCard>

      {filteredPayments.length ? (
        <div className="overflow-hidden rounded-[1.8rem] border border-[#DCE5F7] bg-white shadow-[0_18px_36px_rgba(15,32,86,0.08)]">
          <div className="grid grid-cols-[1fr_1fr_0.75fr_0.85fr_1fr_0.9fr_0.75fr] gap-4 border-b border-[#E7EDF9] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            <p>Tenant</p>
            <p>Property</p>
            <p>Amount</p>
            <p>Method</p>
            <p>Transaction ID</p>
            <p>Date</p>
            <p>Status</p>
          </div>
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="grid grid-cols-[1fr_1fr_0.75fr_0.85fr_1fr_0.9fr_0.75fr] gap-4 border-b border-[#F0F4FB] px-6 py-5 last:border-b-0"
            >
              <p className="font-semibold text-[#102A74]">{payment.tenantName}</p>
              <p className="text-sm text-slate-500">
                {payment.propertyName} - {payment.unit}
              </p>
              <p className="font-semibold text-[#102A74]">{formatMoney(payment.amount)}</p>
              <p className="text-sm text-slate-500">{payment.paymentMethod}</p>
              <p className="text-sm text-slate-500">{payment.transactionId}</p>
              <p className="text-sm text-slate-500">{formatLongDate(payment.paymentDate)}</p>
              <StatusBadge status={payment.status} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No transactions match those filters"
          description="Reset the search, change the date range, or choose a different status or method."
        />
      )}
    </section>
  );
}

export function LandlordOutstandingRentView({
  onContactTenant,
  onSendReminder,
  outstandingRent,
}) {
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [bucketFilter, setBucketFilter] = useState("all");

  const propertyOptions = useMemo(
    () => Array.from(new Set(outstandingRent.map((entry) => entry.propertyName))),
    [outstandingRent]
  );
  const filteredEntries = useMemo(
    () =>
      outstandingRent.filter((entry) => {
        const matchesProperty =
          propertyFilter === "all" || entry.propertyName === propertyFilter;
        const matchesBucket =
          bucketFilter === "all" || entry.bucket === bucketFilter;

        return matchesProperty && matchesBucket;
      }),
    [bucketFilter, outstandingRent, propertyFilter]
  );
  const totalOutstanding = useMemo(
    () => outstandingRent.reduce((sum, entry) => sum + entry.amountDue, 0),
    [outstandingRent]
  );
  const overdueCount = useMemo(
    () => outstandingRent.filter((entry) => entry.bucket === "Overdue").length,
    [outstandingRent]
  );

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Collections Follow-up"
        title="Outstanding Rent"
        description="Keep the unpaid queue focused, separate overdue from upcoming rent, and trigger the next reminder or conversation quickly."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard
          icon={Wallet}
          label="Total Outstanding"
          value={formatMoney(totalOutstanding)}
          helper="Combined open rent across all unpaid records."
          tone="rose"
        />
        <SummaryCard
          icon={CircleAlert}
          label="Overdue Tenants"
          value={overdueCount}
          helper="Tenants whose due date has already passed."
          tone="amber"
        />
      </div>

      <SectionCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Property"
            value={propertyFilter}
            onChange={(event) => setPropertyFilter(event.target.value)}
          >
            <option value="all">All properties</option>
            {propertyOptions.map((propertyName) => (
              <option key={propertyName} value={propertyName}>
                {propertyName}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Due Window"
            value={bucketFilter}
            onChange={(event) => setBucketFilter(event.target.value)}
          >
            <option value="all">Overdue and upcoming</option>
            <option value="Overdue">Overdue only</option>
            <option value="Upcoming">Upcoming only</option>
          </SelectField>
        </div>
      </SectionCard>

      {filteredEntries.length ? (
        <div className="grid gap-4">
          {filteredEntries.map((entry) => (
            <SectionCard
              key={entry.id}
              className={classNames(
                entry.bucket === "Overdue"
                  ? "border-rose-200 bg-[linear-gradient(180deg,#FFF8F8_0%,#FFFFFF_100%)]"
                  : "border-amber-200 bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFFFF_100%)]"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={entry.bucket} />
                    {entry.daysOverdue > 0 ? (
                      <ToneBadge
                        label={`${entry.daysOverdue} days overdue`}
                        tone="border-rose-200 bg-rose-50 text-rose-700"
                      />
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[#102A74]">
                    {entry.tenantName}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {entry.propertyName} - {entry.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                    Amount due
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[#102A74]">
                    {formatMoney(entry.amountDue)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Due {formatLongDate(entry.dueDate)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSendReminder(entry)}
                  className="rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white"
                >
                  Send Reminder
                </button>
                <button
                  type="button"
                  onClick={() => onContactTenant(entry)}
                  className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
                >
                  Contact Tenant
                </button>
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No outstanding records match those filters"
          description="Change the property or due window filter to see more unpaid rent records."
        />
      )}
    </section>
  );
}

export function LandlordReceiptsView({
  initialSelectedReceiptId,
  onResendReceipt,
  receipts,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [selectedReceipt, setSelectedReceipt] = useState(
    () =>
      receipts.find((receipt) => receipt.id === initialSelectedReceiptId) ?? null
  );

  const propertyOptions = useMemo(
    () => Array.from(new Set(receipts.map((receipt) => receipt.propertyName))),
    [receipts]
  );
  const filteredReceipts = useMemo(
    () =>
      receipts.filter((receipt) => {
        const matchesText = matchesSearch(searchValue, [
          receipt.id,
          receipt.tenantName,
          receipt.propertyName,
        ]);
        const matchesProperty =
          propertyFilter === "all" || receipt.propertyName === propertyFilter;

        return matchesText && matchesProperty;
      }),
    [propertyFilter, receipts, searchValue]
  );

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Receipts"
        title="Receipts"
        description="Keep every generated receipt organized, searchable, and ready to view, download, or resend to tenants."
      />

      <SectionCard>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <SearchField
            label="Search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Receipt ID, tenant, or property"
          />
          <SelectField
            label="Property"
            value={propertyFilter}
            onChange={(event) => setPropertyFilter(event.target.value)}
          >
            <option value="all">All properties</option>
            {propertyOptions.map((propertyName) => (
              <option key={propertyName} value={propertyName}>
                {propertyName}
              </option>
            ))}
          </SelectField>
        </div>
      </SectionCard>

      {filteredReceipts.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredReceipts.map((receipt) => (
            <SectionCard key={receipt.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                    Receipt ID
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
                    {receipt.id}
                  </h3>
                </div>
                <StatusBadge status={receipt.status} />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-[#F8FBFF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                    Tenant
                  </p>
                  <p className="mt-3 text-sm font-medium text-[#102A74]">
                    {receipt.tenantName}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{receipt.propertyName}</p>
                </div>
                <div className="rounded-[1.2rem] bg-[#F8FBFF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                    Payment
                  </p>
                  <p className="mt-3 text-sm font-medium text-[#102A74]">
                    {formatMoney(receipt.amount)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {formatLongDate(receipt.paymentDate)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(receipt)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
                >
                  <Eye className="size-4" />
                  View Receipt
                </button>
                <button
                  type="button"
                  onClick={() => printHtmlDocument(receipt.id, buildReceiptHtml(receipt))}
                  className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white"
                >
                  <Download className="size-4" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => onResendReceipt(receipt)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
                >
                  <Send className="size-4" />
                  Resend
                </button>
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No receipts match those filters"
          description="Search by receipt ID, tenant, or property to locate the record you need."
        />
      )}

      {selectedReceipt ? (
        <ModalShell onClose={() => setSelectedReceipt(null)} maxWidth="max-w-4xl">
          <ModalHeader
            eyebrow="Receipt Detail"
            title={selectedReceipt.id}
            description={`${selectedReceipt.tenantName} - ${selectedReceipt.propertyName}`}
            onClose={() => setSelectedReceipt(null)}
          />
          <div className="mt-6">
            <ReceiptDetailCard receipt={selectedReceipt} />
          </div>
        </ModalShell>
      ) : null}
    </section>
  );
}

export function LandlordViewingRequestsView({
  onConfirm,
  onDecline,
  onMessageApplicant,
  onReschedule,
  requests,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");

  const propertyOptions = useMemo(
    () => Array.from(new Set(requests.map((request) => request.propertyName))),
    [requests]
  );
  const filteredRequests = useMemo(
    () =>
      requests.filter((request) => {
        const matchesStatus =
          statusFilter === "all" || request.status === statusFilter;
        const matchesProperty =
          propertyFilter === "all" || request.propertyName === propertyFilter;
        const matchesDate =
          !dateFilter || request.preferredDateTime.slice(0, 10) === dateFilter;

        return matchesStatus && matchesProperty && matchesDate;
      }),
    [dateFilter, propertyFilter, requests, statusFilter]
  );

  const groupedByDate = useMemo(() => {
    return filteredRequests.reduce((accumulator, request) => {
      const dateKey = request.preferredDateTime.slice(0, 10);
      const currentGroup = accumulator[dateKey] ?? [];

      return {
        ...accumulator,
        [dateKey]: [...currentGroup, request],
      };
    }, {});
  }, [filteredRequests]);

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Property Viewings"
        title="Viewing Requests"
        description="Handle approvals, reschedules, and applicant follow-up from one place, with a quick toggle between list and calendar-style views."
        actions={
          <div className="inline-flex rounded-full border border-[#DCE5F7] bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={classNames(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300",
                viewMode === "list"
                  ? "bg-[#18399F] text-white"
                  : "text-[#18399F]"
              )}
            >
              List View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={classNames(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300",
                viewMode === "calendar"
                  ? "bg-[#18399F] text-white"
                  : "text-[#18399F]"
              )}
            >
              Calendar View
            </button>
          </div>
        }
      />

      <SectionCard>
        <div className="grid gap-4 lg:grid-cols-[0.8fr_0.8fr_0.8fr]">
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </SelectField>
          <SelectField
            label="Property"
            value={propertyFilter}
            onChange={(event) => setPropertyFilter(event.target.value)}
          >
            <option value="all">All properties</option>
            {propertyOptions.map((propertyName) => (
              <option key={propertyName} value={propertyName}>
                {propertyName}
              </option>
            ))}
          </SelectField>
          <DateField
            label="Date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          />
        </div>
      </SectionCard>

      {filteredRequests.length ? (
        viewMode === "list" ? (
          <div className="grid gap-4">
            {filteredRequests.map((request) => {
              const isUpcoming =
                ["Pending", "Confirmed"].includes(request.status) &&
                new Date(request.preferredDateTime).getTime() >=
                  new Date("2026-05-04T00:00:00.000Z").getTime();

              return (
                <SectionCard
                  key={request.id}
                  className={classNames(
                    isUpcoming ? "border-[#CFE0FF] bg-[linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_100%)]" : ""
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={request.status} />
                        {isUpcoming ? (
                          <ToneBadge
                            label="Upcoming"
                            tone="border-[#CFE0FF] bg-[#EEF4FF] text-[#18399F]"
                          />
                        ) : null}
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-[#102A74]">
                        {request.applicantName}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {request.propertyName}
                      </p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <p>Preferred time</p>
                      <p className="mt-2 font-medium text-[#102A74]">
                        {formatDateTime(request.preferredDateTime)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.2rem] bg-[#F8FBFF] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                        Contact Information
                      </p>
                      <p className="mt-3 text-sm text-slate-500">
                        {request.contactPhone}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {request.contactEmail}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] bg-[#F8FBFF] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                        Request Date
                      </p>
                      <p className="mt-3 text-sm font-medium text-[#102A74]">
                        {formatDateTime(request.requestDate)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-slate-500">{request.notes}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onConfirm(request.id)}
                      className="rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Approve / Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const requestDate = new Date(request.preferredDateTime);
                        setRescheduleTarget(request);
                        setNextDate(requestDate.toISOString().slice(0, 10));
                        setNextTime(
                          requestDate.toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        );
                      }}
                      className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
                    >
                      Reschedule
                    </button>
                    <button
                      type="button"
                      onClick={() => onDecline(request.id)}
                      className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => onMessageApplicant(request)}
                      className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
                    >
                      Message Applicant
                    </button>
                  </div>
                </SectionCard>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {Object.entries(groupedByDate).map(([dateKey, dayRequests]) => (
              <SectionCard key={dateKey}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                      Scheduled Date
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
                      {formatLongDate(dateKey)}
                    </h3>
                  </div>
                  <ToneBadge
                    label={`${dayRequests.length} viewing${dayRequests.length === 1 ? "" : "s"}`}
                    tone="border-[#CFE0FF] bg-[#EEF4FF] text-[#18399F]"
                  />
                </div>
                <div className="mt-5 space-y-3">
                  {dayRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-[1.2rem] border border-[#E7EDF9] bg-[#FBFDFF] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-[#102A74]">
                            {request.applicantName}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {request.propertyName}
                          </p>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>
                      <p className="mt-3 text-sm text-slate-500">
                        {new Date(request.preferredDateTime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title="No viewing requests match those filters"
          description="Change the status, property, or date filter to review more scheduled requests."
        />
      )}

      {rescheduleTarget ? (
        <ModalShell onClose={() => setRescheduleTarget(null)} maxWidth="max-w-xl">
          <ModalHeader
            eyebrow="Reschedule Viewing"
            title={rescheduleTarget.applicantName}
            description={rescheduleTarget.propertyName}
            onClose={() => setRescheduleTarget(null)}
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <DateField
              label="New Date"
              value={nextDate}
              onChange={(event) => setNextDate(event.target.value)}
            />
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                New Time
              </span>
              <input
                type="time"
                value={nextTime}
                onChange={(event) => setNextTime(event.target.value)}
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setRescheduleTarget(null)}
              className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onReschedule(rescheduleTarget.id, `${nextDate}T${nextTime}:00.000Z`);
                setRescheduleTarget(null);
              }}
              className="rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white"
            >
              Save New Time
            </button>
          </div>
        </ModalShell>
      ) : null}
    </section>
  );
}

export function LandlordPayoutsView({
  availableBalance,
  onRequestPayout,
  payouts,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [amountDraft, setAmountDraft] = useState("");
  const [methodDraft, setMethodDraft] = useState("bank-transfer");

  const filteredPayouts = useMemo(
    () =>
      payouts.filter((payout) => {
        const matchesStatus =
          statusFilter === "all" || payout.status === statusFilter;
        const matchesRange = isWithinDateRange(
          payout.dateRequested,
          startDate,
          endDate
        );

        return matchesStatus && matchesRange;
      }),
    [endDate, payouts, startDate, statusFilter]
  );
  const totalThisMonth = useMemo(
    () =>
      payouts
        .filter((payout) => payout.dateRequested.startsWith("2026-05"))
        .reduce((sum, payout) => sum + payout.amount, 0),
    [payouts]
  );
  const pendingCount = useMemo(
    () =>
      payouts.filter((payout) =>
        ["Pending", "Processing"].includes(payout.status)
      ).length,
    [payouts]
  );

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Withdrawals"
        title="Payouts"
        description="Track landlord withdrawals, watch each processing timeline, and request another payout when you have available balance."
        actions={
          <button
            type="button"
            onClick={() => setIsComposerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-5 py-3 text-sm font-semibold text-white"
          >
            <Plus className="size-4" />
            Request Payout
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={Wallet}
          label="Available Balance"
          value={formatMoney(availableBalance)}
          helper="Funds available for your next payout request."
          tone="emerald"
        />
        <SummaryCard
          icon={History}
          label="Total Payouts (This Month)"
          value={formatMoney(totalThisMonth)}
          helper="All payout amounts requested in May 2026."
        />
        <SummaryCard
          icon={Clock3}
          label="Pending Payouts"
          value={pendingCount}
          helper="Requests still waiting to complete."
          tone="amber"
        />
      </div>

      <SectionCard>
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
          </SelectField>
          <DateField
            label="Start Date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <DateField
            label="End Date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </SectionCard>

      {filteredPayouts.length ? (
        <div className="grid gap-4">
          {filteredPayouts.map((payout) => (
            <SectionCard key={payout.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                    Payout ID
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
                    {payout.id}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">{payout.destination}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={payout.status} />
                  <p className="mt-3 text-2xl font-semibold text-[#102A74]">
                    {formatMoney(payout.amount)}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.2rem] bg-[#F8FBFF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                    Date Requested
                  </p>
                  <p className="mt-3 text-sm font-medium text-[#102A74]">
                    {formatLongDate(payout.dateRequested)}
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-[#F8FBFF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                    Date Processed
                  </p>
                  <p className="mt-3 text-sm font-medium text-[#102A74]">
                    {payout.dateProcessed ? formatLongDate(payout.dateProcessed) : "Awaiting processing"}
                  </p>
                </div>
                <div className="rounded-[1.2rem] bg-[#F8FBFF] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                    Payment Method
                  </p>
                  <p className="mt-3 text-sm font-medium text-[#102A74]">
                    {payout.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  Processing Timeline
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {payout.timeline.map((step) => (
                    <div
                      key={`${payout.id}-${step.label}`}
                      className={classNames(
                        "rounded-[1.2rem] border p-4",
                        step.complete
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-[#DCE5F7] bg-[#FBFDFF]"
                      )}
                    >
                      <p className="text-sm font-semibold text-[#102A74]">
                        {step.label}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {step.date ? formatLongDate(step.date) : "Pending"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No payouts match those filters"
          description="Try a wider date range or pick another payout status."
        />
      )}

      {isComposerOpen ? (
        <ModalShell onClose={() => setIsComposerOpen(false)} maxWidth="max-w-xl">
          <ModalHeader
            eyebrow="Request Payout"
            title="Create a new payout"
            description="Choose the amount and preferred payout method for this transfer."
            onClose={() => setIsComposerOpen(false)}
          />
          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Amount
              </span>
              <input
                type="number"
                min="0"
                value={amountDraft}
                onChange={(event) => setAmountDraft(event.target.value)}
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
                placeholder="8200"
              />
            </label>
            <SelectField
              label="Payment Method"
              value={methodDraft}
              onChange={(event) => setMethodDraft(event.target.value)}
            >
              <option value="bank-transfer">Bank</option>
              <option value="mobile-money">Mobile Money</option>
            </SelectField>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsComposerOpen(false)}
              className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onRequestPayout({
                  amount: Number(amountDraft),
                  paymentMethod: methodDraft,
                });
                setAmountDraft("");
                setMethodDraft("bank-transfer");
                setIsComposerOpen(false);
              }}
              className="rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white"
            >
              Submit Request
            </button>
          </div>
        </ModalShell>
      ) : null}
    </section>
  );
}

export function LandlordCommissionView({ commission }) {
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const propertyOptions = useMemo(
    () =>
      Array.from(new Set(commission.entries.map((entry) => entry.propertyName))),
    [commission.entries]
  );
  const filteredEntries = useMemo(
    () =>
      commission.entries.filter((entry) => {
        const matchesProperty =
          propertyFilter === "all" || entry.propertyName === propertyFilter;
        const matchesRange = isWithinDateRange(entry.date, startDate, endDate);

        return matchesProperty && matchesRange;
      }),
    [commission.entries, endDate, propertyFilter, startDate]
  );
  const totalCommission = useMemo(
    () =>
      filteredEntries.reduce(
        (sum, entry) => sum + entry.commissionDeducted,
        0
      ),
    [filteredEntries]
  );

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Platform Fees"
        title="Commission"
        description="Keep the fee breakdown transparent for every successful rent transaction and review how net income is calculated."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard
          icon={Wallet}
          label="Total Commission Paid"
          value={formatMoney(totalCommission)}
          helper="Filtered total of platform fees deducted so far."
        />
        <SummaryCard
          icon={Settings}
          label="Commission Rate"
          value={commission.rate}
          helper="Applied only to successful payment transactions."
          tone="amber"
        />
      </div>

      <SectionCard>
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Property"
            value={propertyFilter}
            onChange={(event) => setPropertyFilter(event.target.value)}
          >
            <option value="all">All properties</option>
            {propertyOptions.map((propertyName) => (
              <option key={propertyName} value={propertyName}>
                {propertyName}
              </option>
            ))}
          </SelectField>
          <DateField
            label="Start Date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <DateField
            label="End Date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </SectionCard>

      <SectionCard className="border-[#CFE0FF] bg-[#EEF4FF]">
        <p className="text-sm leading-7 text-[#29448F]">
          Commission is calculated as a percentage of each successful rent payment.
          Net amount equals amount paid minus commission deducted for that record.
        </p>
      </SectionCard>

      {filteredEntries.length ? (
        <div className="overflow-hidden rounded-[1.8rem] border border-[#DCE5F7] bg-white shadow-[0_18px_36px_rgba(15,32,86,0.08)]">
          <div className="grid grid-cols-[1fr_1fr_1fr_0.8fr_0.8fr_0.9fr] gap-4 border-b border-[#E7EDF9] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            <p>Transaction</p>
            <p>Property</p>
            <p>Tenant</p>
            <p>Amount Paid</p>
            <p>Commission</p>
            <p>Net Amount</p>
          </div>
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-[1fr_1fr_1fr_0.8fr_0.8fr_0.9fr] gap-4 border-b border-[#F0F4FB] px-6 py-5 last:border-b-0"
            >
              <div>
                <p className="font-semibold text-[#102A74]">{entry.transactionId}</p>
                <p className="mt-2 text-sm text-slate-500">{formatLongDate(entry.date)}</p>
              </div>
              <p className="text-sm text-slate-500">{entry.propertyName}</p>
              <p className="text-sm text-slate-500">{entry.tenantName}</p>
              <p className="font-semibold text-[#102A74]">
                {formatMoney(entry.amountPaid)}
              </p>
              <p className="font-semibold text-rose-700">
                {formatMoney(entry.commissionDeducted)}
              </p>
              <p className="font-semibold text-emerald-700">
                {formatMoney(entry.netAmount)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No commission records match those filters"
          description="Change the property or date range to review more transactions."
        />
      )}
    </section>
  );
}

export function LandlordEarningsView({ earnings }) {
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const propertyOptions = useMemo(
    () => Array.from(new Set(earnings.entries.map((entry) => entry.propertyName))),
    [earnings.entries]
  );
  const filteredEntries = useMemo(
    () =>
      earnings.entries.filter((entry) => {
        const matchesProperty =
          propertyFilter === "all" || entry.propertyName === propertyFilter;
        const matchesRange = isWithinDateRange(entry.date, startDate, endDate);

        return matchesProperty && matchesRange;
      }),
    [earnings.entries, endDate, propertyFilter, startDate]
  );
  const topProperty =
    [...earnings.propertyComparison].sort((left, right) => right.amount - left.amount)[0] ??
    null;

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Income Overview"
        title="Earnings"
        description="Review lifetime and month-to-date performance, compare properties, and keep net income front and center."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={Wallet}
          label="Lifetime Earnings"
          value={formatMoney(earnings.totalLifetime)}
          helper="Total gross rent earned across the portfolio."
          tone="emerald"
        />
        <SummaryCard
          icon={History}
          label="This Month"
          value={formatMoney(earnings.thisMonth)}
          helper="Gross earnings recorded in the current month."
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Net Income"
          value={formatMoney(earnings.netIncome)}
          helper="Earnings after commission for the current month."
          tone="amber"
        />
      </div>

      <SectionCard>
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Property"
            value={propertyFilter}
            onChange={(event) => setPropertyFilter(event.target.value)}
          >
            <option value="all">All properties</option>
            {propertyOptions.map((propertyName) => (
              <option key={propertyName} value={propertyName}>
                {propertyName}
              </option>
            ))}
          </SelectField>
          <DateField
            label="Start Date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <DateField
            label="End Date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Monthly Earnings Trend
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
            Gross vs net performance by month
          </h3>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-sm font-medium text-slate-500">Gross</p>
              <ChartBars data={earnings.monthlyTrend.map((item) => ({ month: item.month, value: item.gross }))} />
            </div>
            <div>
              <p className="mb-4 text-sm font-medium text-slate-500">Net</p>
              <ChartBars
                data={earnings.monthlyTrend.map((item) => ({ month: item.month, value: item.net }))}
                colorClass="bg-emerald-500"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Property Comparison
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
            Top-performing properties
          </h3>
          {topProperty ? (
            <div className="mt-5 rounded-[1.4rem] bg-[#EEF4FF] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Leading Property
              </p>
              <p className="mt-3 text-lg font-semibold text-[#102A74]">
                {topProperty.propertyName}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {formatMoney(topProperty.amount)} earned so far
              </p>
            </div>
          ) : null}
          <div className="mt-6 space-y-3">
            {earnings.propertyComparison.map((property) => (
              <div
                key={property.propertyName}
                className="rounded-[1.2rem] border border-[#E7EDF9] bg-[#FBFDFF] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-[#102A74]">{property.propertyName}</p>
                  <p className="text-sm font-semibold text-[#18399F]">
                    {formatMoney(property.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {filteredEntries.length ? (
        <div className="overflow-hidden rounded-[1.8rem] border border-[#DCE5F7] bg-white shadow-[0_18px_36px_rgba(15,32,86,0.08)]">
          <div className="grid grid-cols-[1fr_1fr_0.8fr_0.9fr] gap-4 border-b border-[#E7EDF9] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            <p>Property</p>
            <p>Tenant</p>
            <p>Amount Earned</p>
            <p>Date</p>
          </div>
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-[1fr_1fr_0.8fr_0.9fr] gap-4 border-b border-[#F0F4FB] px-6 py-5 last:border-b-0"
            >
              <p className="font-semibold text-[#102A74]">{entry.propertyName}</p>
              <p className="text-sm text-slate-500">{entry.tenantName}</p>
              <p className="font-semibold text-emerald-700">{formatMoney(entry.amount)}</p>
              <p className="text-sm text-slate-500">{formatLongDate(entry.date)}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No earnings entries match those filters"
          description="Change the property or date range to review a different slice of earnings."
        />
      )}
    </section>
  );
}

export function LandlordMessagesView({
  conversations,
  initialConversationId,
  landlordName,
  onOpenConversation,
  onSendMessage,
}) {
  const [selectedConversationId, setSelectedConversationId] = useState(
    initialConversationId ?? conversations[0]?.id ?? null
  );
  const [draftMessage, setDraftMessage] = useState("");
  const [draftAttachments, setDraftAttachments] = useState([]);

  const conversationSummaries = useMemo(
    () =>
      conversations.map((conversation) => {
        const unreadCount = conversation.messages.filter(
          (message) => message.sender === "tenant" && !message.readByLandlord
        ).length;
        const lastMessage = conversation.messages[conversation.messages.length - 1];

        return {
          ...conversation,
          lastMessage,
          unreadCount,
        };
      }),
    [conversations]
  );
  const selectedConversation =
    conversationSummaries.find(
      (conversation) => conversation.id === selectedConversationId
    ) ??
    conversationSummaries[0] ??
    null;

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    onOpenConversation(conversationId);
  };

  const handleSend = (event) => {
    event.preventDefault();

    if (!selectedConversation || (!draftMessage.trim() && !draftAttachments.length)) {
      return;
    }

    onSendMessage(selectedConversation.id, {
      attachments: draftAttachments,
      text: draftMessage,
    });
    setDraftMessage("");
    setDraftAttachments([]);
  };

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Tenant Messaging"
        title="Messages"
        description="Keep direct rent, property, and issue conversations in one familiar chat workspace with fast tenant switching."
      />

      <div className="grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="rounded-[1.8rem] border border-[#DCE5F7] bg-white p-4 shadow-[0_18px_36px_rgba(15,32,86,0.08)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[#102A74]">Conversations</h3>
            <span className="text-sm text-slate-500">
              {conversationSummaries.length} active
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {conversationSummaries.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => handleSelectConversation(conversation.id)}
                className={classNames(
                  "rounded-[1.4rem] border p-4 text-left transition-colors duration-300",
                  selectedConversation?.id === conversation.id
                    ? "border-[#18399F] bg-[#EEF4FF]"
                    : "border-[#DCE5F7] bg-white hover:border-[#18399F]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={classNames(
                          "size-2.5 rounded-full",
                          conversation.online ? "bg-emerald-500" : "bg-slate-300"
                        )}
                      />
                      <p className="truncate text-base font-semibold text-[#102A74]">
                        {conversation.tenantName}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {conversation.roleLabel}
                    </p>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                      {conversation.lastMessage?.text ??
                        conversation.lastMessage?.attachments?.join(", ") ??
                        "No messages yet"}
                    </p>
                  </div>

                  {conversation.unreadCount > 0 ? (
                    <span className="grid size-6 place-items-center rounded-full bg-[#18399F] text-xs font-semibold text-white">
                      {conversation.unreadCount}
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span>{conversation.propertyName}</span>
                  <span>{formatDateTime(conversation.lastMessage?.timestamp)}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <article className="flex min-h-[42rem] flex-col overflow-hidden rounded-[1.8rem] border border-[#DCE5F7] bg-white shadow-[0_18px_36px_rgba(15,32,86,0.08)]">
          {selectedConversation ? (
            <>
              <div className="border-b border-[#E7EDF9] px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={classNames(
                          "size-2.5 rounded-full",
                          selectedConversation.online ? "bg-emerald-500" : "bg-slate-300"
                        )}
                      />
                      <h3 className="text-lg font-semibold text-[#102A74]">
                        {selectedConversation.tenantName}
                      </h3>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedConversation.online ? "Online now" : "Away"} -{" "}
                      {selectedConversation.propertyName} - {selectedConversation.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-[#F8FBFF] px-4 py-5 sm:px-5">
                {selectedConversation.messages.map((message) => {
                  const isLandlordMessage = message.sender === "landlord";

                  return (
                    <div
                      key={message.id}
                      className={classNames(
                        "flex",
                        isLandlordMessage ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={classNames(
                          "max-w-[85%] rounded-[1.35rem] px-4 py-3 shadow-sm sm:max-w-[70%]",
                          isLandlordMessage
                            ? "rounded-br-md bg-[#18399F] text-white"
                            : "rounded-bl-md bg-white text-[#102A74]"
                        )}
                      >
                        {message.text ? (
                          <p className="text-sm leading-7">{message.text}</p>
                        ) : null}
                        {message.attachments?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.attachments.map((attachment) => (
                              <span
                                key={`${message.id}-${attachment}`}
                                className={classNames(
                                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                                  isLandlordMessage
                                    ? "bg-white/15 text-white"
                                    : "bg-[#EEF4FF] text-[#18399F]"
                                )}
                              >
                                <Paperclip className="size-3.5" />
                                {attachment}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <div
                          className={classNames(
                            "mt-3 flex items-center justify-end gap-2 text-xs",
                            isLandlordMessage ? "text-white/70" : "text-slate-400"
                          )}
                        >
                          <span>{formatDateTime(message.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSend} className="border-t border-[#E7EDF9] bg-white p-4 sm:p-5">
                {draftAttachments.length ? (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {draftAttachments.map((attachment) => (
                      <span
                        key={attachment}
                        className="inline-flex items-center gap-2 rounded-full bg-[#EEF4FF] px-3 py-1.5 text-xs font-medium text-[#18399F]"
                      >
                        <Paperclip className="size-3.5" />
                        {attachment}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="flex items-end gap-3">
                  <label className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-full border border-[#DCE5F7] text-[#18399F] transition-colors duration-300 hover:border-[#18399F]">
                    <Paperclip className="size-4" />
                    <input
                      type="file"
                      multiple
                      onChange={(event) =>
                        setDraftAttachments(
                          Array.from(event.target.files ?? []).map((file) => file.name)
                        )
                      }
                      className="hidden"
                    />
                  </label>

                  <label className="flex-1">
                    <span className="sr-only">Message</span>
                    <textarea
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      placeholder={`Message ${selectedConversation.tenantName}`}
                      className="min-h-[3rem] w-full rounded-[1.2rem] border border-[#DCE5F7] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
                    />
                  </label>

                  <button
                    type="submit"
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-[#18399F] px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
                  >
                    <SendHorizonal className="size-4" />
                    Send
                  </button>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Signed in as {landlordName}. Messages update instantly in this demo flow.
                </p>
              </form>
            </>
          ) : null}
        </article>
      </div>
    </section>
  );
}

export function LandlordAnnouncementsView({
  announcements,
  onCreateAnnouncement,
  onOpenAnnouncement,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [categoryDraft, setCategoryDraft] = useState("General");
  const [contentDraft, setContentDraft] = useState("");
  const [importantDraft, setImportantDraft] = useState(false);

  const categories = ["All", "General", "Maintenance", "Emergency"];
  const filteredAnnouncements = useMemo(
    () =>
      announcements.filter((announcement) => {
        const matchesCategory =
          categoryFilter === "All" || announcement.category === categoryFilter;
        const matchesText = matchesSearch(searchValue, [
          announcement.title,
          announcement.content,
          announcement.category,
          announcement.authorName,
        ]);

        return matchesCategory && matchesText;
      }),
    [announcements, categoryFilter, searchValue]
  );

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Announcement Feed"
        title="Announcement"
        description="Publish rent reminders and property updates, while keeping important notices easy to scan for both you and tenants."
        actions={
          <button
            type="button"
            onClick={() => setIsComposerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-5 py-3 text-sm font-semibold text-white"
          >
            <Plus className="size-4" />
            Create Announcement
          </button>
        }
      />

      <SectionCard>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_auto] lg:items-center">
          <SearchField
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search announcements"
          />

          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Category
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setCategoryFilter(category)}
                  className={classNames(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-300",
                    categoryFilter === category
                      ? "border-[#18399F] bg-[#18399F] text-white"
                      : "border-[#D7E0F3] bg-white text-[#3656B7] hover:border-[#18399F] hover:text-[#18399F]"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {filteredAnnouncements.length ? (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <button
              key={announcement.id}
              type="button"
              onClick={() => onOpenAnnouncement(announcement.id)}
              className={classNames(
                "w-full rounded-[1.8rem] border bg-white p-5 text-left shadow-[0_18px_36px_rgba(15,32,86,0.08)] transition-colors duration-300 hover:border-[#18399F]",
                announcement.isImportant
                  ? "border-[#F6D17C] bg-[linear-gradient(180deg,#FFFDF7_0%,#FFFFFF_100%)]"
                  : "border-[#DCE5F7]"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={classNames(
                      "mt-1 size-3 shrink-0 rounded-full",
                      announcement.isRead ? "bg-slate-300" : "bg-[#18399F]"
                    )}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#18399F]">
                        {announcement.category}
                      </span>
                      {announcement.isImportant ? (
                        <span className="rounded-full bg-[#FFF4D6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#B7791F]">
                          Important
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-[#102A74]">
                      {announcement.title}
                    </h3>
                  </div>
                </div>

                <div className="text-right text-sm text-slate-500">
                  <p>{formatLongDate(announcement.datePosted)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <Bell className="size-4 text-[#18399F]" />
                <span className="font-medium text-[#102A74]">
                  {announcement.authorName}
                </span>
                <span>{announcement.authorRole}</span>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                {announcement.content}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No announcements match that search"
          description="Try another keyword or switch the category filter."
        />
      )}

      {isComposerOpen ? (
        <ModalShell onClose={() => setIsComposerOpen(false)} maxWidth="max-w-2xl">
          <ModalHeader
            eyebrow="Create Announcement"
            title="Publish a tenant update"
            description="Draft the title, category, and message body for this notice."
            onClose={() => setIsComposerOpen(false)}
          />
          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Title
              </span>
              <input
                type="text"
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
                placeholder="Water tank servicing on Friday"
              />
            </label>
            <SelectField
              label="Category"
              value={categoryDraft}
              onChange={(event) => setCategoryDraft(event.target.value)}
            >
              <option value="General">General</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Emergency">Emergency</option>
            </SelectField>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Content
              </span>
              <textarea
                value={contentDraft}
                onChange={(event) => setContentDraft(event.target.value)}
                className="min-h-[10rem] w-full rounded-[1rem] border border-[#DCE5F7] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
                placeholder="Describe the update clearly and include the key timing."
              />
            </label>
            <label className="flex items-start gap-3 rounded-[1.2rem] border border-[#DCE5F7] bg-[#FBFDFF] p-4">
              <input
                type="checkbox"
                checked={importantDraft}
                onChange={(event) => setImportantDraft(event.target.checked)}
                className="mt-1 size-4 rounded border border-[#C9D4EC] text-[#18399F]"
              />
              <div>
                <p className="text-sm font-semibold text-[#102A74]">Mark as important</p>
                <p className="mt-1 text-sm text-slate-500">
                  Important notices will stand out visually in the announcement feed.
                </p>
              </div>
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsComposerOpen(false)}
              className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onCreateAnnouncement({
                  category: categoryDraft,
                  content: contentDraft,
                  isImportant: importantDraft,
                  title: titleDraft,
                });
                setTitleDraft("");
                setCategoryDraft("General");
                setContentDraft("");
                setImportantDraft(false);
                setIsComposerOpen(false);
              }}
              className="rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white"
            >
              Publish
            </button>
          </div>
        </ModalShell>
      ) : null}
    </section>
  );
}

export function LandlordIssuesView({
  issues,
  onMessageTenant,
  onUpdateStatus,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState(null);

  const filteredIssues = useMemo(
    () =>
      issues.filter((issue) => {
        const matchesStatus =
          statusFilter === "all" || issue.status === statusFilter;
        const matchesPriority =
          priorityFilter === "all" || issue.priority === priorityFilter;

        return matchesStatus && matchesPriority;
      }),
    [issues, priorityFilter, statusFilter]
  );

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Issue Board"
        title="Issues"
        description="Review the maintenance queue from the landlord side, update status quickly, and contact the tenant when more detail is needed."
      />

      <SectionCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </SelectField>
          <SelectField
            label="Priority"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="all">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </SelectField>
        </div>
      </SectionCard>

      {filteredIssues.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredIssues.map((issue) => (
            <SectionCard key={issue.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={issue.status} />
                    <PriorityBadge priority={issue.priority} />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[#102A74]">
                    {issue.tenantName}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {issue.propertyName} - {issue.category}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  {formatDateTime(issue.submittedAt)}
                </p>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-500">
                {issue.description}
              </p>

              {issue.attachments?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {issue.attachments.map((attachment) => (
                    <span
                      key={attachment}
                      className="inline-flex items-center gap-2 rounded-full bg-[#EEF4FF] px-3 py-1.5 text-xs font-medium text-[#18399F]"
                    >
                      <FileImage className="size-3.5" />
                      {attachment}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIssue(issue)}
                  className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateStatus(
                      issue.id,
                      issue.status === "Pending" ? "In Progress" : "Resolved"
                    )
                  }
                  className="rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white"
                >
                  {issue.status === "Pending" ? "Start Issue" : "Mark Resolved"}
                </button>
                <button
                  type="button"
                  onClick={() => onMessageTenant(issue)}
                  className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
                >
                  Message Tenant
                </button>
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No issues match those filters"
          description="Change the status or priority filter to inspect more maintenance reports."
        />
      )}

      {selectedIssue ? (
        <ModalShell onClose={() => setSelectedIssue(null)} maxWidth="max-w-3xl">
          <ModalHeader
            eyebrow="Issue Detail"
            title={`${selectedIssue.tenantName} - ${selectedIssue.category}`}
            description={selectedIssue.propertyName}
            onClose={() => setSelectedIssue(null)}
          />
          <div className="mt-6 space-y-5">
            <DetailList
              items={[
                { label: "Status", value: selectedIssue.status },
                { label: "Priority", value: selectedIssue.priority },
                { label: "Submitted", value: formatDateTime(selectedIssue.submittedAt) },
                { label: "Property", value: selectedIssue.propertyName },
              ]}
            />
            <SectionCard className="border-[#E7EDF9] bg-[#FBFDFF] shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Description
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {selectedIssue.description}
              </p>
            </SectionCard>
          </div>
        </ModalShell>
      ) : null}
    </section>
  );
}

export function LandlordDocumentsView({
  documents,
  onDeleteDocument,
  onUploadDocument,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [documentDraft, setDocumentDraft] = useState({
    fileType: "PDF",
    name: "",
    propertyName: "",
    relatedName: "",
    section: "Property Documents",
  });

  const propertyOptions = useMemo(
    () => Array.from(new Set(documents.map((document) => document.propertyName))),
    [documents]
  );
  const filteredDocuments = useMemo(
    () =>
      documents.filter((document) => {
        const matchesText = matchesSearch(searchValue, [
          document.name,
          document.relatedName,
          document.propertyName,
        ]);
        const matchesSection =
          sectionFilter === "all" || document.section === sectionFilter;
        const matchesProperty =
          propertyFilter === "all" || document.propertyName === propertyFilter;
        const matchesRange = isWithinDateRange(
          document.uploadDate,
          startDate,
          endDate
        );

        return matchesText && matchesSection && matchesProperty && matchesRange;
      }),
    [documents, endDate, propertyFilter, searchValue, sectionFilter, startDate]
  );
  const groupedDocuments = useMemo(
    () =>
      filteredDocuments.reduce((accumulator, document) => {
        const currentGroup = accumulator[document.section] ?? [];

        return {
          ...accumulator,
          [document.section]: [...currentGroup, document],
        };
      }, {}),
    [filteredDocuments]
  );

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Document Management"
        title="Documents"
        description="Keep property, tenant, and financial files structured and easy to retrieve with search, filters, and quick actions."
        actions={
          <button
            type="button"
            onClick={() => setIsComposerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-5 py-3 text-sm font-semibold text-white"
          >
            <Upload className="size-4" />
            Upload New Document
          </button>
        }
      />

      <SectionCard>
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr_0.7fr]">
          <SearchField
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Document, tenant, or property"
          />
          <SelectField
            label="Section"
            value={sectionFilter}
            onChange={(event) => setSectionFilter(event.target.value)}
          >
            <option value="all">All sections</option>
            <option value="Property Documents">Property Documents</option>
            <option value="Tenant Documents">Tenant Documents</option>
            <option value="Financial Documents">Financial Documents</option>
          </SelectField>
          <SelectField
            label="Property"
            value={propertyFilter}
            onChange={(event) => setPropertyFilter(event.target.value)}
          >
            <option value="all">All properties</option>
            {propertyOptions.map((propertyName) => (
              <option key={propertyName} value={propertyName}>
                {propertyName}
              </option>
            ))}
          </SelectField>
          <DateField
            label="Start Date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <DateField
            label="End Date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </SectionCard>

      {filteredDocuments.length ? (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([sectionName, sectionDocuments]) => (
            <section key={sectionName} className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                    Section
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
                    {sectionName}
                  </h3>
                </div>
                <ToneBadge
                  label={`${sectionDocuments.length} file${sectionDocuments.length === 1 ? "" : "s"}`}
                  tone="border-[#CFE0FF] bg-[#EEF4FF] text-[#18399F]"
                />
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {sectionDocuments.map((document) => {
                  const Icon = getFileTypeIcon(document.fileType);

                  return (
                    <SectionCard key={document.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="grid size-11 place-items-center rounded-[1rem] bg-[#EEF4FF] text-[#18399F]">
                            <Icon className="size-5" />
                          </span>
                          <div>
                            <h4 className="text-lg font-semibold text-[#102A74]">
                              {document.name}
                            </h4>
                            <p className="mt-2 text-sm text-slate-500">
                              {document.relatedName} - {document.fileType}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-slate-500">{document.size}</span>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[1.2rem] bg-[#F8FBFF] p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                            Property
                          </p>
                          <p className="mt-3 text-sm font-medium text-[#102A74]">
                            {document.propertyName}
                          </p>
                        </div>
                        <div className="rounded-[1.2rem] bg-[#F8FBFF] p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                            Upload Date
                          </p>
                          <p className="mt-3 text-sm font-medium text-[#102A74]">
                            {formatLongDate(document.uploadDate)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDocument(document)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
                        >
                          <Eye className="size-4" />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            downloadTextFile(
                              `${document.name}.${document.fileType.toLowerCase()}`,
                              `${document.name}\n${document.relatedName}\n${document.propertyName}\n${document.uploadDate}`
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white"
                        >
                          <Download className="size-4" />
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteDocument(document.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </button>
                      </div>
                    </SectionCard>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No documents match those filters"
          description="Try another keyword or widen the section, property, or date filters."
        />
      )}

      {selectedDocument ? (
        <ModalShell onClose={() => setSelectedDocument(null)} maxWidth="max-w-2xl">
          <ModalHeader
            eyebrow="Document Detail"
            title={selectedDocument.name}
            description={`${selectedDocument.section} - ${selectedDocument.fileType}`}
            onClose={() => setSelectedDocument(null)}
          />
          <div className="mt-6">
            <DetailList
              items={[
                { label: "Related to", value: selectedDocument.relatedName },
                { label: "Property", value: selectedDocument.propertyName },
                { label: "Upload date", value: formatLongDate(selectedDocument.uploadDate) },
                { label: "File size", value: selectedDocument.size },
              ]}
            />
          </div>
        </ModalShell>
      ) : null}

      {isComposerOpen ? (
        <ModalShell onClose={() => setIsComposerOpen(false)} maxWidth="max-w-xl">
          <ModalHeader
            eyebrow="Upload Document"
            title="Add a new record"
            description="Create a new landlord document entry and attach it to the right section."
            onClose={() => setIsComposerOpen(false)}
          />
          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Document Name
              </span>
              <input
                type="text"
                value={documentDraft.name}
                onChange={(event) =>
                  setDocumentDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </label>
            <SelectField
              label="Section"
              value={documentDraft.section}
              onChange={(event) =>
                setDocumentDraft((current) => ({
                  ...current,
                  section: event.target.value,
                }))
              }
            >
              <option value="Property Documents">Property Documents</option>
              <option value="Tenant Documents">Tenant Documents</option>
              <option value="Financial Documents">Financial Documents</option>
            </SelectField>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Related Name
              </span>
              <input
                type="text"
                value={documentDraft.relatedName}
                onChange={(event) =>
                  setDocumentDraft((current) => ({
                    ...current,
                    relatedName: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Property
              </span>
              <input
                type="text"
                value={documentDraft.propertyName}
                onChange={(event) =>
                  setDocumentDraft((current) => ({
                    ...current,
                    propertyName: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </label>
            <SelectField
              label="File Type"
              value={documentDraft.fileType}
              onChange={(event) =>
                setDocumentDraft((current) => ({
                  ...current,
                  fileType: event.target.value,
                }))
              }
            >
              <option value="PDF">PDF</option>
              <option value="DOC">DOC</option>
              <option value="PNG">PNG</option>
            </SelectField>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsComposerOpen(false)}
              className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onUploadDocument(documentDraft);
                setDocumentDraft({
                  fileType: "PDF",
                  name: "",
                  propertyName: "",
                  relatedName: "",
                  section: "Property Documents",
                });
                setIsComposerOpen(false);
              }}
              className="rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white"
            >
              Upload
            </button>
          </div>
        </ModalShell>
      ) : null}
    </section>
  );
}

export function LandlordAnalyticsView({ analytics }) {
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const propertyOptions = analytics.propertyPerformance.map(
    (property) => property.propertyName
  );
  const selectedProperty =
    propertyFilter === "all"
      ? null
      : analytics.propertyPerformance.find(
          (property) => property.propertyName === propertyFilter
        ) ?? null;
  const summary = selectedProperty
    ? {
        occupancyRate: selectedProperty.occupancyRate,
        outstandingRent: selectedProperty.outstanding,
        totalProperties: 1,
        totalRevenue: selectedProperty.revenue,
      }
    : analytics;

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Portfolio Performance"
        title="Analytics"
        description="Use a clean, data-first view of occupancy, revenue, and collection quality to spot both portfolio strengths and weak spots."
      />

      <SectionCard>
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Property"
            value={propertyFilter}
            onChange={(event) => setPropertyFilter(event.target.value)}
          >
            <option value="all">All properties</option>
            {propertyOptions.map((propertyName) => (
              <option key={propertyName} value={propertyName}>
                {propertyName}
              </option>
            ))}
          </SelectField>
          <DateField
            label="Start Date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <DateField
            label="End Date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={FolderOpen}
          label="Total Properties"
          value={summary.totalProperties}
          helper="Properties in the currently selected portfolio slice."
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Occupancy Rate"
          value={formatPercent(summary.occupancyRate)}
          helper="Share of occupied units versus total managed inventory."
          tone="emerald"
        />
        <SummaryCard
          icon={Wallet}
          label="Total Revenue"
          value={formatMoney(summary.totalRevenue)}
          helper="Revenue associated with the selected view."
        />
        <SummaryCard
          icon={CircleAlert}
          label="Outstanding Rent"
          value={formatMoney(summary.outstandingRent)}
          helper="Open rent balance still needing collection."
          tone="rose"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Monthly Revenue Trend
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
            Revenue by month
          </h3>
          <div className="mt-6">
            <ChartBars data={analytics.monthlyRevenue} />
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Occupancy Rate Over Time
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
            Occupancy pattern
          </h3>
          <div className="mt-6">
            <ChartBars
              data={analytics.occupancyTrend}
              colorClass="bg-emerald-500"
              suffix="%"
            />
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Collection Rate
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
            Collection quality by month
          </h3>
          <div className="mt-6">
            <ChartBars
              data={analytics.collectionRate}
              colorClass="bg-amber-500"
              suffix="%"
            />
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Property Performance
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
            Compare income and arrears
          </h3>
          <div className="mt-6 space-y-3">
            {analytics.propertyPerformance.map((property) => (
              <div
                key={property.propertyName}
                className="rounded-[1.2rem] border border-[#E7EDF9] bg-[#FBFDFF] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#102A74]">{property.propertyName}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Occupancy {formatPercent(property.occupancyRate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#18399F]">
                      {formatMoney(property.revenue)}
                    </p>
                    <p
                      className={classNames(
                        "mt-2 text-sm",
                        property.outstanding > 0 ? "text-rose-600" : "text-emerald-600"
                      )}
                    >
                      Outstanding {formatMoney(property.outstanding)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </section>
  );
}

export function LandlordVerificationView({
  onUploadVerificationDocument,
  verification,
}) {
  const [sectionDraft, setSectionDraft] = useState("Identity Verification");
  const [nameDraft, setNameDraft] = useState("");
  const [fileTypeDraft, setFileTypeDraft] = useState("PDF");

  const completedSteps = verification.steps.filter((step) => step.complete).length;
  const progressPercentage = verification.steps.length
    ? (completedSteps / verification.steps.length) * 100
    : 0;

  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Trust & Security"
        title="Verification"
        description="Complete identity and property ownership verification with a clear step-based flow, visible document statuses, and strong trust signals."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard
          icon={ShieldCheck}
          label="Verification Status"
          value={verification.overallStatus}
          helper="Current overall state of your landlord verification."
          tone={verification.overallStatus === "Verified" ? "emerald" : "amber"}
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Progress"
          value={formatPercent(progressPercentage)}
          helper={`${completedSteps} of ${verification.steps.length} steps completed`}
        />
      </div>

      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Completion Steps
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
              Follow the trust checklist
            </h3>
          </div>
          <ToneBadge
            label={`${completedSteps}/${verification.steps.length} done`}
            tone="border-[#CFE0FF] bg-[#EEF4FF] text-[#18399F]"
          />
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#E7EDF9]">
          <div
            className="h-full rounded-full bg-[#18399F]"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {verification.steps.map((step) => (
            <div
              key={step.id}
              className={classNames(
                "rounded-[1.2rem] border p-4",
                step.complete
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-[#DCE5F7] bg-[#FBFDFF]"
              )}
            >
              <p className="text-sm font-semibold text-[#102A74]">{step.label}</p>
              <p className="mt-2 text-sm text-slate-500">
                {step.complete ? "Completed" : "Still required"}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Upload Interface
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
            Add another verification file
          </h3>
          <div className="mt-6 grid gap-4">
            <SelectField
              label="Section"
              value={sectionDraft}
              onChange={(event) => setSectionDraft(event.target.value)}
            >
              <option value="Identity Verification">Identity Verification</option>
              <option value="Property Ownership Verification">
                Property Ownership Verification
              </option>
            </SelectField>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Document Name
              </span>
              <input
                type="text"
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
                placeholder="Palm Court title document"
              />
            </label>
            <SelectField
              label="File Type"
              value={fileTypeDraft}
              onChange={(event) => setFileTypeDraft(event.target.value)}
            >
              {verification.supportedFormats.map((fileType) => (
                <option key={fileType} value={fileType}>
                  {fileType}
                </option>
              ))}
            </SelectField>
            <label className="flex min-h-[7rem] cursor-pointer flex-col items-center justify-center rounded-[1.3rem] border border-dashed border-[#C9D4EC] bg-[#F8FBFF] px-4 text-center text-sm text-slate-500">
              <Upload className="mb-2 size-5 text-[#18399F]" />
              Drag-and-drop is not needed in this demo. Use the button below to create an uploaded record.
            </label>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Supported formats: {verification.supportedFormats.join(", ")}
            </p>
            <button
              type="button"
              onClick={() => {
                onUploadVerificationDocument({
                  fileType: fileTypeDraft,
                  name: nameDraft,
                  section: sectionDraft,
                });
                setNameDraft("");
                setFileTypeDraft("PDF");
              }}
              className="rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white"
            >
              Complete Verification
            </button>
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Trust Indicators
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
            What reviewers look for
          </h3>
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.3rem] bg-[#F8FBFF] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#102A74]">
                <ShieldCheck className="size-4 text-[#18399F]" />
                Match the account owner
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use documents that clearly match the name on the landlord account.
              </p>
            </div>
            <div className="rounded-[1.3rem] bg-[#F8FBFF] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#102A74]">
                <FileText className="size-4 text-[#18399F]" />
                Keep pages legible
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Upload full-page scans or clear photos with edges and addresses visible.
              </p>
            </div>
            <div className="rounded-[1.3rem] bg-[#F8FBFF] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#102A74]">
                <ShieldAlert className="size-4 text-[#18399F]" />
                Watch rejected reasons
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Rejected files include a reason so you can correct the next upload quickly.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4">
        {verification.documents.map((document) => (
          <SectionCard key={document.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="grid size-11 place-items-center rounded-[1rem] bg-[#EEF4FF] text-[#18399F]">
                  <FileText className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-[#102A74]">{document.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {document.section} - {document.fileType}
                  </p>
                </div>
              </div>
              <StatusBadge status={document.status} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] bg-[#F8FBFF] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  Upload Date
                </p>
                <p className="mt-3 text-sm font-medium text-[#102A74]">
                  {formatLongDate(document.uploadDate)}
                </p>
              </div>
              <div className="rounded-[1.2rem] bg-[#F8FBFF] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  Review Notes
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  {document.reason || "No issues flagged by the review team so far."}
                </p>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </section>
  );
}

function AccountManagementActions() {
  const { deactivateAccount, deleteAccount } = useAuth();
  const [modalMode, setModalMode] = useState(null);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDeactivate = modalMode === "deactivate";

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    setModalMode(null);
    setPassword("");
    setErrorMessage("");
  };

  const handleConfirm = async () => {
    if (!password.trim()) {
      setErrorMessage("Password confirmation is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      if (isDeactivate) {
        await deactivateAccount({ password });
      } else {
        await deleteAccount({ password });
      }
    } catch (error) {
      const nextMessage = error.message || "Account action failed.";
      setErrorMessage(nextMessage);
      showErrorToast(error, "Account action failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SectionCard className="border-rose-200">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-[1rem] bg-rose-50 text-rose-600">
            <ShieldAlert className="size-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
              Account Management
            </p>
            <h3 className="mt-1 text-xl font-semibold text-[#102A74]">
              Deactivate or delete your account
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Deactivation hides your landlord profile and activity for 30 days.
              Logging in during that period restores access automatically.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setModalMode("deactivate")}
            className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] px-4 py-2.5 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
          >
            <ShieldAlert className="size-4" />
            Deactivate Account
          </button>
          <button
            type="button"
            onClick={() => setModalMode("delete")}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-rose-700"
          >
            <Trash2 className="size-4" />
            Delete Account
          </button>
        </div>
      </SectionCard>

      {modalMode ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={closeModal}
            className="absolute inset-0 bg-[#07163F]/45"
            aria-label="Close account action confirmation"
          />

          <div className="relative z-10 w-full max-w-lg rounded-[1.8rem] border border-[#DCE5F7] bg-white p-6 shadow-[0_22px_44px_rgba(13,29,76,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">
              Confirm Account Action
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#102A74]">
              {isDeactivate ? "Deactivate account for 30 days" : "Delete account access"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {isDeactivate
                ? "Your profile and activity will be hidden. You can return within 30 days to reactivate automatically. After 30 days, account access is permanently removed while required records may be retained."
                : "This permanently removes account access. Important history may remain in system records where required."}
            </p>

            <label className="mt-5 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Confirm Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrorMessage("");
                }}
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </label>

            {errorMessage ? (
              <p className="mt-4 rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-rose-700 disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : isDeactivate ? "Deactivate Account" : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function LandlordSettingsView({ onSaveSettings, settings }) {
  const [draftSettings, setDraftSettings] = useState(settings);
  const [passwordDraft, setPasswordDraft] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

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

    if (
      (passwordDraft.currentPassword ||
        passwordDraft.newPassword ||
        passwordDraft.confirmPassword) &&
      passwordDraft.newPassword !== passwordDraft.confirmPassword
    ) {
      setErrorMessage("New password and confirmation do not match.");
      showErrorToast("New password and confirmation do not match.");
      return;
    }

    setErrorMessage("");
    onSaveSettings(draftSettings);
    setPasswordDraft({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PanelIntro
        eyebrow="Settings"
        title="Profile, payout preferences, and account security"
        description="Keep your landlord profile current, fine-tune alerts, and manage the account protections that matter most."
      />

      <SectionCard>
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
                <span>LM</span>
              )}
            </div>
            <p className="mt-4 text-base font-semibold text-[#102A74]">
              {draftSettings.profile.name}
            </p>
            <p className="mt-1 text-sm text-slate-500">Landlord profile photo</p>

            <label className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white">
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
              Landlord Profile
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
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  Business Name
                </span>
                <input
                  type="text"
                  value={draftSettings.profile.businessName}
                  onChange={(event) =>
                    updateSection("profile", "businessName", event.target.value)
                  }
                  className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  Location
                </span>
                <input
                  type="text"
                  value={draftSettings.profile.location}
                  onChange={(event) =>
                    updateSection("profile", "location", event.target.value)
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
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <SectionCard>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-[1rem] bg-[#EEF4FF] text-[#18399F]">
              <BellRing className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
                Notifications
              </p>
              <h3 className="mt-1 text-xl font-semibold text-[#102A74]">
                Control what reaches you
              </h3>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {[
              ["newApplications", "New applications", "Be alerted when a new tenant or rental application arrives."],
              ["payoutUpdates", "Payout updates", "Receive updates as payout requests move through processing."],
              ["rentAlerts", "Rent alerts", "Get notifications when rent becomes due or overdue."],
              ["maintenanceAlerts", "Maintenance alerts", "Stay on top of incoming issue reports from tenants."],
              ["smsAlerts", "SMS alerts", "Receive urgent alerts by SMS when needed."],
            ].map(([key, label, description]) => (
              <div
                key={key}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[1.3rem] border border-[#DCE5F7] bg-white p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-[#102A74]">{label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={draftSettings.notifications[key]}
                  onClick={() =>
                    updateSection(
                      "notifications",
                      key,
                      !draftSettings.notifications[key]
                    )
                  }
                  className="inline-flex items-center gap-3"
                >
                  <span className="text-sm font-semibold text-[#18399F]">
                    {draftSettings.notifications[key] ? "On" : "Off"}
                  </span>
                  <span
                    className={classNames(
                      "relative inline-flex h-8 w-14 rounded-full transition-colors duration-300",
                      draftSettings.notifications[key] ? "bg-[#18399F]" : "bg-slate-300"
                    )}
                  >
                    <span
                      className={classNames(
                        "absolute top-1 size-6 rounded-full bg-white shadow-sm transition-transform duration-300",
                        draftSettings.notifications[key] ? "translate-x-7" : "translate-x-1"
                      )}
                    />
                  </span>
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-[1rem] bg-[#EEF4FF] text-[#18399F]">
              <Wallet className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
                Payout Preferences
              </p>
              <h3 className="mt-1 text-xl font-semibold text-[#102A74]">
                Choose how landlord payouts behave
              </h3>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <SelectField
              label="Preferred Payout Method"
              value={draftSettings.payments.preferredPayoutMethod}
              onChange={(event) =>
                updateSection(
                  "payments",
                  "preferredPayoutMethod",
                  event.target.value
                )
              }
            >
              <option value="bank-transfer">Bank Transfer</option>
              <option value="mobile-money">Mobile Money</option>
            </SelectField>
            <SelectField
              label="Payout Schedule"
              value={draftSettings.payments.payoutSchedule}
              onChange={(event) =>
                updateSection("payments", "payoutSchedule", event.target.value)
              }
            >
              <option value="Weekly">Weekly</option>
              <option value="Bi-weekly">Bi-weekly</option>
              <option value="Monthly">Monthly</option>
            </SelectField>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.3rem] border border-[#DCE5F7] bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-[#102A74]">Automatic receipts</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Send receipts immediately when a payment settles successfully.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={draftSettings.payments.autoReceipts}
                onClick={() =>
                  updateSection(
                    "payments",
                    "autoReceipts",
                    !draftSettings.payments.autoReceipts
                  )
                }
                className="inline-flex items-center gap-3"
              >
                <span className="text-sm font-semibold text-[#18399F]">
                  {draftSettings.payments.autoReceipts ? "On" : "Off"}
                </span>
                <span
                  className={classNames(
                    "relative inline-flex h-8 w-14 rounded-full transition-colors duration-300",
                    draftSettings.payments.autoReceipts ? "bg-[#18399F]" : "bg-slate-300"
                  )}
                >
                  <span
                    className={classNames(
                      "absolute top-1 size-6 rounded-full bg-white shadow-sm transition-transform duration-300",
                      draftSettings.payments.autoReceipts ? "translate-x-7" : "translate-x-1"
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard>
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
            {[
              ["biometricLogin", "Biometric login", "Enable fingerprint or device biometrics where supported on mobile."],
              ["twoFactorAuth", "Two-factor authentication", "Require a second verification step for sensitive account actions."],
            ].map(([key, label, description]) => (
              <div
                key={key}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[1.3rem] border border-[#DCE5F7] bg-white p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-[#102A74]">{label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={draftSettings.security[key]}
                  onClick={() =>
                    updateSection(
                      "security",
                      key,
                      !draftSettings.security[key]
                    )
                  }
                  className="inline-flex items-center gap-3"
                >
                  <span className="text-sm font-semibold text-[#18399F]">
                    {draftSettings.security[key] ? "On" : "Off"}
                  </span>
                  <span
                    className={classNames(
                      "relative inline-flex h-8 w-14 rounded-full transition-colors duration-300",
                      draftSettings.security[key] ? "bg-[#18399F]" : "bg-slate-300"
                    )}
                  >
                    <span
                      className={classNames(
                        "absolute top-1 size-6 rounded-full bg-white shadow-sm transition-transform duration-300",
                        draftSettings.security[key] ? "translate-x-7" : "translate-x-1"
                      )}
                    />
                  </span>
                </button>
              </div>
            ))}
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
                Leave password fields empty if you only want to update profile and payout settings.
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      <AccountManagementActions />

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-6 py-3 text-sm font-semibold text-white"
        >
          <UserCircle2 className="size-4" />
          Save Settings
        </button>
      </div>
    </form>
  );
}

export function LandlordHelpView({ helpCenter, onStartSupportChat }) {
  const [searchValue, setSearchValue] = useState("");
  const [openItemId, setOpenItemId] = useState(helpCenter.faqs[0]?.id ?? null);

  const filteredFaqs = useMemo(() => {
    const normalizedSearch = normalizeValue(searchValue);

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
      <PanelIntro
        eyebrow="Help"
        title="Support for the landlord workspace"
        description="Search common landlord questions first, then use the support channel that matches the urgency of the issue."
      />

      <SectionCard>
        <SearchField
          label="Search help topics"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Payouts, verification, tenants, receipts..."
        />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <SectionCard>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-[1rem] bg-[#EEF4FF] text-[#18399F]">
              <LifeBuoy className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
                Frequently Asked Questions
              </p>
              <h3 className="mt-1 text-xl font-semibold text-[#102A74]">
                Quick answers for common landlord workflows
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
            <EmptyState
              title="No help topics match that search"
              description="Try another keyword or contact support directly."
            />
          ) : null}
        </SectionCard>

        <div className="space-y-4">
          {[
            {
              action: (
                <a
                  href={`mailto:${helpCenter.support.email}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Mail className="size-4" />
                  {helpCenter.support.email}
                </a>
              ),
              description:
                "Best for account, billing, and verification questions that need a written trail.",
              icon: Mail,
              title: "Email support",
            },
            {
              action: (
                <a
                  href={`tel:${helpCenter.support.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] px-4 py-2.5 text-sm font-semibold text-[#18399F]"
                >
                  <Phone className="size-4" />
                  {helpCenter.support.phone}
                </a>
              ),
              description: `Direct line during support hours: ${helpCenter.support.chatHours}. Emergency: ${helpCenter.support.emergencyLine}.`,
              icon: Phone,
              title: "Call support",
            },
            {
              action: (
                <button
                  type="button"
                  onClick={onStartSupportChat}
                  className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <MessageSquareText className="size-4" />
                  Start support chat
                </button>
              ),
              description:
                "Use live chat for quick questions about dashboard workflows or tenant operations.",
              icon: MessageSquareText,
              title: "Live chat",
            },
          ].map((card) => {
            const Icon = card.icon;

            return (
              <SectionCard key={card.title}>
                <span className="grid size-11 place-items-center rounded-[1rem] bg-[#EEF4FF] text-[#18399F]">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[#102A74]">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  {card.description}
                </p>
                <div className="mt-5">{card.action}</div>
              </SectionCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LandlordTermsView({ accepted, onToggleAccepted, terms }) {
  return (
    <section className="space-y-6">
      <PanelIntro
        eyebrow="Terms & Conditions"
        title="Readable, structured terms for the landlord workspace"
        description="Review the current portal terms carefully. The latest version appears below with the last updated date."
      />

      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Last updated: {formatLongDate(terms.lastUpdated)}
            </p>
          </div>
          <StatusBadge status={accepted ? "Accepted" : "Pending"} />
        </div>
      </SectionCard>

      <SectionCard>
        <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-2">
          {terms.sections.map((section) => (
            <section
              key={section.id}
              className="rounded-[1.5rem] border border-[#E7EDF9] bg-[#FBFDFF] p-5"
            >
              <h3 className="text-base font-semibold text-[#102A74]">
                {section.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">{section.body}</p>
            </section>
          ))}
        </div>
      </SectionCard>

      <label className="flex items-start gap-3 rounded-[1.6rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_16px_30px_rgba(15,32,86,0.06)]">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onToggleAccepted(event.target.checked)}
          className="mt-1 size-4 rounded border border-[#C9D4EC] text-[#18399F]"
        />
        <div>
          <p className="text-sm font-semibold text-[#102A74]">
            I have read and accept the current landlord portal terms.
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            You can revisit this page anytime to review the latest updates.
          </p>
        </div>
      </label>
    </section>
  );
}
