import { useMemo, useState } from "react";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileBadge2,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  MessageSquareText,
  Plus,
  Search,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { classNames } from "../../utils/classNames.js";

const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

function formatMoney(value) {
  return currencyFormatter.format(Number(value ?? 0));
}

function formatDate(dateString) {
  if (!dateString) {
    return "Date unavailable";
  }

  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeValue) {
  if (!timeValue) {
    return "Time unavailable";
  }

  const [hours = 0, minutes = 0] = String(timeValue)
    .split(":")
    .map((value) => Number(value));
  const nextDate = new Date();

  nextDate.setHours(hours, minutes, 0, 0);

  return nextDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateTime(date, time) {
  return `${formatDate(date)} at ${formatTime(time)}`;
}

function getStatusTone(status) {
  const normalizedStatus = String(status ?? "").toLowerCase();

  if (
    normalizedStatus === "paid" ||
    normalizedStatus === "successful" ||
    normalizedStatus === "completed"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalizedStatus === "due" || normalizedStatus === "upcoming") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (normalizedStatus === "overdue" || normalizedStatus === "cancelled") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function StatusBadge({ status }) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        getStatusTone(status)
      )}
    >
      {status}
    </span>
  );
}

function PanelTitle({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
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

      {action}
    </div>
  );
}

function OverviewStatCard({ detail, icon, label, value }) {
  const Icon = icon;

  return (
    <article className="rounded-[1.7rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_18px_36px_rgba(15,32,86,0.08)]">
      <span className="grid size-11 place-items-center rounded-[1rem] bg-[#EEF4FF] text-[#18399F]">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[#102A74]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </article>
  );
}

function ActionTile({ description, icon, label, onClick }) {
  const Icon = icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[1.6rem] border border-[#DCE5F7] bg-white p-4 text-left shadow-[0_16px_32px_rgba(15,32,86,0.06)] transition-colors duration-300 hover:border-[#18399F]"
    >
      <span className="grid size-11 place-items-center rounded-[1rem] bg-[#18399F] text-white shadow-[0_14px_28px_rgba(24,57,159,0.2)]">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-base font-semibold text-[#102A74]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#18399F]">
        Open action
        <ArrowRight className="size-4" />
      </span>
    </button>
  );
}

function ModalShell({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#07163F]/45"
        aria-label={title}
      />
      <div
        className="relative z-10 w-full max-w-2xl rounded-[1.8rem] border border-[#DCE5F7] bg-white p-6 shadow-[0_22px_44px_rgba(13,29,76,0.2)]"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function BookingCard({ booking, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(booking)}
      className="rounded-[1.8rem] border border-[#DCE5F7] bg-white p-5 text-left shadow-[0_18px_36px_rgba(15,32,86,0.08)] transition-colors duration-300 hover:border-[#18399F]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            {booking.type}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
            {booking.title}
          </h3>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-5 space-y-3 text-sm text-slate-500">
        <p className="inline-flex items-center gap-2">
          <CalendarDays className="size-4 text-[#18399F]" />
          {formatDateTime(booking.date, booking.startTime)}
        </p>
        <p className="inline-flex items-center gap-2">
          <Clock3 className="size-4 text-[#18399F]" />
          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
        </p>
        <p className="text-sm leading-7 text-slate-500">{booking.location}</p>
      </div>

      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#18399F]">
        View details
        <ArrowRight className="size-4" />
      </span>
    </button>
  );
}

function BookingDetailsModal({ booking, onClose }) {
  if (!booking) {
    return null;
  }

  return (
    <ModalShell onClose={onClose} title={`View booking ${booking.title}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
            Booking Details
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[#102A74]">
            {booking.title}
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">{booking.type}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center rounded-full border border-[#C9D4EC] text-[#18399F]"
          aria-label="Close booking details"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.4rem] bg-[#F8FBFF] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Date & Time
          </p>
          <p className="mt-3 text-base font-semibold text-[#102A74]">
            {formatDateTime(booking.date, booking.startTime)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Ends at {formatTime(booking.endTime)}
          </p>
        </div>

        <div className="rounded-[1.4rem] bg-[#F8FBFF] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Status
          </p>
          <div className="mt-3">
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-3 text-sm text-slate-500">Hosted by {booking.host}</p>
        </div>
      </div>

      <div className="mt-5 rounded-[1.4rem] border border-[#DCE5F7] bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
          Location
        </p>
        <p className="mt-3 text-base font-semibold text-[#102A74]">
          {booking.location}
        </p>
      </div>

      <div className="mt-5 rounded-[1.4rem] border border-[#DCE5F7] bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
          Notes
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-500">{booking.notes}</p>
      </div>
    </ModalShell>
  );
}

function BookingComposerModal({ bookingTypes, onClose, onCreate }) {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  const [title, setTitle] = useState("");
  const [type, setType] = useState(bookingTypes[0] ?? "Appointment");
  const [date, setDate] = useState(tomorrow.toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [location, setLocation] = useState("Palm Court Apartment, Block B");
  const [notes, setNotes] = useState("");

  return (
    <ModalShell onClose={onClose} title="Create booking">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
            Schedule Visit
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[#102A74]">
            Create a new booking
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Add an inspection, appointment, or facility reservation to your
            tenant schedule.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center rounded-full border border-[#C9D4EC] text-[#18399F]"
          aria-label="Close booking composer"
        >
          <X className="size-4" />
        </button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onCreate({
            title,
            type,
            date,
            startTime,
            endTime,
            location,
            notes,
          });
        }}
        className="mt-6 grid gap-4"
      >
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Booking Title
          </span>
          <input
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Inspection Visit"
            className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Type
            </span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            >
              {bookingTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Date
            </span>
            <input
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Start Time
            </span>
            <input
              type="time"
              required
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              End Time
            </span>
            <input
              type="time"
              required
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Location
          </span>
          <input
            type="text"
            required
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Notes
          </span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Any preparation notes or contact information for the visit."
            className="min-h-[8rem] w-full rounded-[1rem] border border-[#DCE5F7] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
          />
        </label>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#C9D4EC] px-4 py-2.5 text-sm font-semibold text-[#18399F]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
          >
            <Plus className="size-4" />
            Create Booking
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function DocumentCard({ document, onDownload, onView }) {
  const iconMap = {
    DOC: FileBadge2,
    PDF: FileText,
    XLS: FileSpreadsheet,
  };
  const Icon = iconMap[document.fileType] ?? FileText;

  return (
    <article className="rounded-[1.7rem] border border-[#DCE5F7] bg-white p-5 text-left shadow-[0_18px_36px_rgba(15,32,86,0.08)] transition-colors duration-300 hover:border-[#18399F]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-[1rem] bg-[#EEF4FF] text-[#18399F]">
          <Icon className="size-5" />
        </span>
        <span className="rounded-full bg-[#F8FBFF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#3656B7]">
          {document.fileType}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
          {document.category}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-[#102A74]">
          {document.name}
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          {document.description}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <div>
          <p>{formatDate(document.issuedDate)}</p>
          <p className="mt-1">{document.size}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onView(document)}
            className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] px-3 py-2 text-sm font-semibold text-[#18399F]"
          >
            <Eye className="size-4" />
            View
          </button>
          <button
            type="button"
            onClick={() => onDownload(document)}
            className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-3 py-2 text-sm font-semibold text-white"
          >
            <Download className="size-4" />
            Download
          </button>
        </div>
      </div>
    </article>
  );
}

function DocumentPreviewModal({ document, onClose, onDownload }) {
  if (!document) {
    return null;
  }

  return (
    <ModalShell onClose={onClose} title={`View ${document.name}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
            Document Preview
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[#102A74]">
            {document.name}
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            {document.category} issued by {document.issuer}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center rounded-full border border-[#C9D4EC] text-[#18399F]"
          aria-label="Close document preview"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-[#DCE5F7] bg-[#FBFDFF] p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Issued Date
            </p>
            <p className="mt-2 font-semibold text-[#102A74]">
              {formatDate(document.issuedDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              File Type
            </p>
            <p className="mt-2 font-semibold text-[#102A74]">{document.fileType}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Size
            </p>
            <p className="mt-2 font-semibold text-[#102A74]">{document.size}</p>
          </div>
        </div>

        <div className="mt-5 rounded-[1.3rem] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
            Summary
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            {document.description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onDownload(document)}
          className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
        >
          <Download className="size-4" />
          Download
        </button>
      </div>
    </ModalShell>
  );
}

export function TenantOverviewDashboardView({
  announcements,
  onContactLandlord,
  onOpenAnnouncement,
  onPayRent,
  onReportIssue,
  paymentDetails,
  paymentHistory,
  serviceRequests,
}) {
  const recentActivity = useMemo(() => {
    const paymentItems = paymentHistory.slice(0, 2).map((entry) => ({
      id: entry.id,
      category: "Payment",
      detail: `${formatMoney(entry.amountPaid)} via ${entry.paymentMethod}`,
      status: entry.status,
      timestamp: `${entry.paymentDate}T09:00:00.000Z`,
      title: `Rent receipt ${entry.receiptId}`,
    }));
    const requestItems = serviceRequests.slice(0, 2).map((request) => ({
      id: request.id,
      category: "Request",
      detail: request.requestType,
      status: request.status,
      timestamp: request.submittedAt,
      title: request.title,
    }));
    const announcementItems = announcements.slice(0, 2).map((announcement) => ({
      id: announcement.id,
      category: "Announcement",
      detail: announcement.authorRole,
      status: announcement.isRead ? "Read" : "New",
      timestamp: announcement.datePosted,
      title: announcement.title,
    }));

    return [...paymentItems, ...requestItems, ...announcementItems]
      .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp))
      .slice(0, 5);
  }, [announcements, paymentHistory, serviceRequests]);

  const notificationPreview = useMemo(
    () =>
      [...announcements]
        .sort(
          (left, right) => new Date(right.datePosted) - new Date(left.datePosted)
        )
        .slice(0, 3),
    [announcements]
  );
  const unpaidCount = paymentDetails.paymentStatus === "Paid" ? 0 : 1;
  const unreadAnnouncementsCount = announcements.filter(
    (announcement) => !announcement.isRead
  ).length;

  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(135deg,#17338E_0%,#254BBE_54%,#EEF4FF_54%,#FFFFFF_100%)] p-6 shadow-[0_22px_44px_rgba(15,32,86,0.12)]">
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
              Dashboard Overview
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              A clear snapshot of your rent, support, and latest property updates
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">
              Keep the essentials in reach: what is due, what is coming up, and
              what needs your attention right now.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-white/30 bg-white/92 p-5 shadow-[0_18px_36px_rgba(15,32,86,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  Current rent
                </p>
                <p className="mt-2 text-3xl font-semibold text-[#102A74]">
                  {formatMoney(paymentDetails.outstandingAmount)}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Due {formatDate(paymentDetails.dueDate)}
                </p>
              </div>
              <StatusBadge status={paymentDetails.paymentStatus} />
            </div>

            <div className="mt-5 rounded-[1.4rem] bg-[#F8FBFF] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Property
              </p>
              <p className="mt-2 text-base font-semibold text-[#102A74]">
                {paymentDetails.propertyName}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {paymentDetails.propertyDetails}
              </p>
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-3">
        <OverviewStatCard
          icon={Wallet}
          label="Rent Status"
          value={paymentDetails.paymentStatus}
          detail={`Outstanding balance ${formatMoney(paymentDetails.outstandingAmount)}`}
        />
        <OverviewStatCard
          icon={CalendarDays}
          label="Upcoming Payments"
          value={unpaidCount ? `${unpaidCount} Due` : "All Clear"}
          detail={
            unpaidCount
              ? `Next rent due on ${formatDate(paymentDetails.dueDate)}`
              : "Your latest rent invoice has already been settled."
          }
        />
        <OverviewStatCard
          icon={BellRing}
          label="Recent Activity"
          value={`${recentActivity.length} Updates`}
          detail={`${unreadAnnouncementsCount} announcement${unreadAnnouncementsCount === 1 ? "" : "s"} still unread`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
          <PanelTitle
            eyebrow="Quick Actions"
            title="Do the most common tasks in one tap"
            description="Move straight into payments, issue reporting, or a conversation with your landlord."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            <ActionTile
              icon={Wallet}
              label="Pay Rent"
              description="Open the payment workspace and settle the current invoice."
              onClick={onPayRent}
            />
            <ActionTile
              icon={Wrench}
              label="Report Issue"
              description="Send a maintenance request with details and attachments."
              onClick={onReportIssue}
            />
            <ActionTile
              icon={MessageSquareText}
              label="Contact Landlord"
              description="Jump into the tenant chat thread for a quick update."
              onClick={onContactLandlord}
            />
          </div>
        </article>

        <article className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
          <PanelTitle
            eyebrow="Notifications"
            title="Latest announcements and updates"
            description="Recent notices stay visible here so you can catch important changes quickly."
          />

          <div className="mt-6 space-y-4">
            {notificationPreview.map((announcement) => (
              <button
                key={announcement.id}
                type="button"
                onClick={() => onOpenAnnouncement(announcement.id)}
                className={classNames(
                  "w-full rounded-[1.5rem] border p-4 text-left transition-colors duration-300 hover:border-[#18399F]",
                  announcement.isImportant
                    ? "border-[#F6D17C] bg-[#FFF9EA]"
                    : "border-[#DCE5F7] bg-[#FBFDFF]"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#18399F]">
                        {announcement.category}
                      </span>
                      {!announcement.isRead ? (
                        <span className="rounded-full bg-[#18399F] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                          New
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-[#102A74]">
                      {announcement.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400">
                    {formatDate(announcement.datePosted)}
                  </p>
                </div>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {announcement.content}
                </p>
              </button>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <PanelTitle
          eyebrow="Recent Activity"
          title="Payments, requests, and announcements in one feed"
          description="A compact timeline of the latest actions around your tenancy."
        />

        <div className="mt-6 space-y-4">
          {recentActivity.map((item) => {
            const activityIconMap = {
              Announcement: BellRing,
              Payment: Wallet,
              Request: Wrench,
            };
            const Icon = activityIconMap[item.category] ?? CheckCircle2;

            return (
              <article
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-[1.5rem] border border-[#E7EDF9] bg-[#FBFDFF] p-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#EEF4FF] text-[#18399F]">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                      {item.category}
                    </p>
                    <h3 className="mt-2 text-base font-semibold text-[#102A74]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                  </div>
                </div>

                <div className="text-right">
                  <StatusBadge status={item.status} />
                  <p className="mt-3 text-sm text-slate-400">
                    {formatDate(item.timestamp)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </article>
    </section>
  );
}

export function TenantBookingsView({ bookings, onCreateBooking }) {
  const bookingTypes = useMemo(
    () => Array.from(new Set(bookings.map((booking) => booking.type))),
    [bookings]
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useBodyScrollLock(Boolean(selectedBooking) || isComposerOpen);

  const filteredBookings = useMemo(
    () =>
      [...bookings]
        .filter((booking) => {
          const matchesStatus =
            statusFilter === "all" ||
            booking.status.toLowerCase() === statusFilter;
          const matchesDate = !dateFilter || booking.date === dateFilter;

          return matchesStatus && matchesDate;
        })
        .sort(
          (left, right) =>
            new Date(`${left.date}T${left.startTime}`) -
            new Date(`${right.date}T${right.startTime}`)
        ),
    [bookings, dateFilter, statusFilter]
  );
  const stats = useMemo(
    () => ({
      cancelled: bookings.filter((booking) => booking.status === "Cancelled")
        .length,
      completed: bookings.filter((booking) => booking.status === "Completed")
        .length,
      upcoming: bookings.filter((booking) => booking.status === "Upcoming")
        .length,
    }),
    [bookings]
  );

  return (
    <section className="space-y-6">
      <article className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <PanelTitle
          eyebrow="Bookings"
          title="Track upcoming visits, reservations, and appointments"
          description="Filter by date or status, review every booking card, and schedule a new visit whenever you need one."
          action={
            <button
              type="button"
              onClick={() => setIsComposerOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
            >
              <Plus className="size-4" />
              Schedule Visit
            </button>
          }
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <OverviewStatCard
            icon={CalendarDays}
            label="Upcoming"
            value={stats.upcoming}
            detail="Visits or reservations that are still ahead."
          />
          <OverviewStatCard
            icon={CheckCircle2}
            label="Completed"
            value={stats.completed}
            detail="Bookings that have already been fulfilled."
          />
          <OverviewStatCard
            icon={Clock3}
            label="Cancelled"
            value={stats.cancelled}
            detail="Visits or reservations that were cancelled."
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.7fr]">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Filter by Date
            </span>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Filter by Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            >
              <option value="all">All statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredBookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onOpen={setSelectedBooking}
          />
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <article className="grid min-h-[18rem] place-items-center rounded-[2rem] border border-dashed border-[#C9D4EC] bg-[#F9FBFF] p-6 text-center">
          <div className="max-w-md">
            <p className="text-lg font-semibold text-[#102A74]">
              No bookings match those filters
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Clear the current filters or schedule a new visit to get started.
            </p>
          </div>
        </article>
      ) : null}

      {selectedBooking ? (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      ) : null}

      {isComposerOpen ? (
        <BookingComposerModal
          bookingTypes={bookingTypes}
          onClose={() => setIsComposerOpen(false)}
          onCreate={(bookingDraft) => {
            onCreateBooking(bookingDraft);
            setIsComposerOpen(false);
          }}
        />
      ) : null}
    </section>
  );
}

export function TenantDocumentsView({ documents, onDownloadDocument }) {
  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState(null);

  useBodyScrollLock(Boolean(selectedDocument));

  const typeOptions = useMemo(
    () => ["all", ...new Set(documents.map((document) => document.fileType))],
    [documents]
  );
  const filteredDocuments = useMemo(
    () =>
      [...documents]
        .filter((document) => {
          const searchableText = [
            document.name,
            document.category,
            document.issuer,
            document.description,
          ]
            .join(" ")
            .toLowerCase();
          const matchesSearch =
            !searchValue.trim() ||
            searchableText.includes(searchValue.trim().toLowerCase());
          const matchesType =
            typeFilter === "all" || document.fileType === typeFilter;

          return matchesSearch && matchesType;
        })
        .sort((left, right) => {
          if (left.isPinned !== right.isPinned) {
            return left.isPinned ? -1 : 1;
          }

          return new Date(right.issuedDate) - new Date(left.issuedDate);
        }),
    [documents, searchValue, typeFilter]
  );
  const tenancyAgreement =
    filteredDocuments.find((document) => document.isPinned) ?? null;
  const otherDocuments = filteredDocuments.filter((document) => !document.isPinned);

  return (
    <section className="space-y-6">
      <article className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <PanelTitle
          eyebrow="Documents"
          title="Find agreements, notices, and receipts in one place"
          description="Use the search bar and file-type filter to reach the document you need quickly."
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.65fr]">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Search Documents
            </span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Agreement, receipt, notice, or issuer"
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              File Type
            </span>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            >
              <option value="all">All file types</option>
              {typeOptions
                .filter((option) => option !== "all")
                .map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </article>

      {tenancyAgreement ? (
        <article className="rounded-[2rem] border border-[#CFE0FF] bg-[linear-gradient(135deg,#EEF4FF_0%,#FFFFFF_100%)] p-5 shadow-[0_18px_36px_rgba(15,32,86,0.08)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
                Pinned Document
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#102A74]">
                Tenancy Agreement
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Keep your signed agreement close at hand for quick checks on rent
                obligations, occupancy terms, and property rules.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSelectedDocument(tenancyAgreement)}
                className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#18399F]"
              >
                <Eye className="size-4" />
                View
              </button>
              <button
                type="button"
                onClick={() => onDownloadDocument(tenancyAgreement)}
                className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Download className="size-4" />
                Download
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.3rem] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Document Name
              </p>
              <p className="mt-3 font-semibold text-[#102A74]">
                {tenancyAgreement.name}
              </p>
            </div>
            <div className="rounded-[1.3rem] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Issued Date
              </p>
              <p className="mt-3 font-semibold text-[#102A74]">
                {formatDate(tenancyAgreement.issuedDate)}
              </p>
            </div>
            <div className="rounded-[1.3rem] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                File Details
              </p>
              <p className="mt-3 font-semibold text-[#102A74]">
                {tenancyAgreement.fileType} · {tenancyAgreement.size}
              </p>
            </div>
          </div>
        </article>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
              Document Library
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[#102A74]">
              Other documents
            </h3>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full bg-[#F8FBFF] px-4 py-2 text-sm font-semibold text-[#18399F]">
            <FolderOpen className="size-4" />
            {otherDocuments.length} file{otherDocuments.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {otherDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onDownload={onDownloadDocument}
              onView={setSelectedDocument}
            />
          ))}
        </div>
      </section>

      {filteredDocuments.length === 0 ? (
        <article className="grid min-h-[18rem] place-items-center rounded-[2rem] border border-dashed border-[#C9D4EC] bg-[#F9FBFF] p-6 text-center">
          <div className="max-w-md">
            <p className="text-lg font-semibold text-[#102A74]">
              No documents found
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Try a broader search term or switch the current file-type filter.
            </p>
          </div>
        </article>
      ) : null}

      {selectedDocument ? (
        <DocumentPreviewModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onDownload={onDownloadDocument}
        />
      ) : null}
    </section>
  );
}
