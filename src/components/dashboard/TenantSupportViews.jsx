import { useMemo, useState } from "react";
import {
  CalendarDays,
  CircleAlert,
  Clock3,
  FileImage,
  Filter,
  MessageSquareText,
  Paperclip,
  Plus,
  Search,
  SendHorizonal,
  ShieldAlert,
  Wrench,
  X,
} from "lucide-react";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { classNames } from "../../utils/classNames.js";

const issueCategories = ["Plumbing", "Electricity", "Security", "Other"];
const issuePriorities = ["Low", "Medium", "High"];
const requestTypes = ["Maintenance", "Repair", "Inquiry", "Other"];
const announcementCategories = ["All", "General", "Maintenance", "Emergency"];

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

function formatTime(dateString) {
  if (!dateString) {
    return "";
  }

  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusTone(status) {
  const normalizedStatus = String(status ?? "").toLowerCase();

  if (normalizedStatus === "resolved" || normalizedStatus === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalizedStatus === "approved" || normalizedStatus === "in progress") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (normalizedStatus === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (normalizedStatus === "rejected") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function getPriorityTone(priority) {
  const normalizedPriority = String(priority ?? "").toLowerCase();

  if (normalizedPriority === "high") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (normalizedPriority === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
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

function PriorityBadge({ priority }) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        getPriorityTone(priority)
      )}
    >
      {priority} priority
    </span>
  );
}

function CategoryChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-300",
        active
          ? "border-[#18399F] bg-[#18399F] text-white"
          : "border-[#D7E0F3] bg-white text-[#3656B7] hover:border-[#18399F] hover:text-[#18399F]"
      )}
    >
      {children}
    </button>
  );
}

function AttachmentPills({ files }) {
  if (!files?.length) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {files.map((file) => (
        <span
          key={file}
          className="inline-flex items-center gap-2 rounded-full bg-[#EEF4FF] px-3 py-1.5 text-xs font-medium text-[#18399F]"
        >
          <FileImage className="size-3.5" />
          {file}
        </span>
      ))}
    </div>
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

export function TenantIssueReportView({ issues, onSubmitIssue }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(issueCategories[0]);
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [priority, setPriority] = useState(issuePriorities[1]);

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmitIssue({
      attachments,
      category,
      description,
      priority,
      title,
    });

    setTitle("");
    setCategory(issueCategories[0]);
    setDescription("");
    setAttachments([]);
    setPriority(issuePriorities[1]);
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
            Report An Issue
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#102A74] sm:text-[2rem]">
            Send a maintenance issue straight to your landlord
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Share what is wrong, how urgent it is, and attach supporting photos
            or videos if that helps explain the issue faster.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Issue Title
              </span>
              <input
                type="text"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Describe the issue briefly"
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Issue Category
              </span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              >
                {issueCategories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Priority
              </span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              >
                {issuePriorities.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Description
              </span>
              <textarea
                required
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Explain what happened, when it started, and any immediate safety concerns."
                className="min-h-[10rem] w-full rounded-[1rem] border border-[#DCE5F7] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Upload Images or Videos
              </span>
              <label className="flex min-h-[6rem] cursor-pointer flex-col items-center justify-center rounded-[1.2rem] border border-dashed border-[#C9D4EC] bg-[#F8FBFF] px-4 text-center text-sm text-slate-500">
                <Paperclip className="mb-2 size-5 text-[#18399F]" />
                Optional evidence makes it easier to diagnose the issue
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={(event) =>
                    setAttachments(
                      Array.from(event.target.files ?? []).map((file) => file.name)
                    )
                  }
                  className="hidden"
                />
              </label>
              <AttachmentPills files={attachments} />
            </label>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#18399F] px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
          >
            Submit Report
          </button>
        </form>

        <article className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
            Reporting Guide
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[#102A74]">
            Help the team respond faster
          </h3>
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] bg-white p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#102A74]">
                <CircleAlert className="size-4 text-[#18399F]" />
                High priority
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use for safety risks, active leaks, power faults, or security
                issues that need attention urgently.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#102A74]">
                <Wrench className="size-4 text-[#18399F]" />
                Add useful detail
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Mention location, time first noticed, and whether the issue is
                getting worse or affecting daily use.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#102A74]">
                <ShieldAlert className="size-4 text-[#18399F]" />
                Keep evidence handy
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Photos and short videos can speed up approval and help the
                maintenance team come prepared.
              </p>
            </div>
          </div>
        </article>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
              Previous Reports
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[#102A74]">
              Track past issues and their status
            </h3>
          </div>
          <span className="text-sm font-medium text-slate-500">
            {issues.length} report{issues.length === 1 ? "" : "s"} on record
          </span>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {issues.map((issue) => (
            <article
              key={issue.id}
              className="rounded-[1.7rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_18px_36px_rgba(15,32,86,0.08)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                    Date Submitted
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#102A74]">
                    {formatDate(issue.submittedAt)}
                  </p>
                </div>
                <StatusBadge status={issue.status} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <PriorityBadge priority={issue.priority} />
                <span className="inline-flex items-center rounded-full bg-[#F3F6FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#3656B7]">
                  {issue.category}
                </span>
              </div>

              <h4 className="mt-4 text-lg font-semibold text-[#102A74]">
                {issue.title}
              </h4>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {issue.description}
              </p>

              <AttachmentPills files={issue.attachments} />
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export function TenantRequestsView({ requests, onCreateRequest }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [requestTitle, setRequestTitle] = useState("");
  const [requestType, setRequestType] = useState(requestTypes[0]);
  const [requestDetails, setRequestDetails] = useState("");
  const [requestAttachments, setRequestAttachments] = useState([]);

  useBodyScrollLock(Boolean(selectedRequest) || isComposerOpen);

  const filteredRequests = useMemo(
    () =>
      requests.filter((request) => {
        const matchesStatus =
          statusFilter === "all" || request.status.toLowerCase() === statusFilter;
        const matchesDate =
          !dateFilter || request.submittedAt.slice(0, 10) === dateFilter;

        return matchesStatus && matchesDate;
      }),
    [dateFilter, requests, statusFilter]
  );

  const handleCreateRequest = (event) => {
    event.preventDefault();

    onCreateRequest({
      attachments: requestAttachments,
      details: requestDetails,
      requestType,
      title: requestTitle,
    });

    setRequestTitle("");
    setRequestType(requestTypes[0]);
    setRequestDetails("");
    setRequestAttachments([]);
    setIsComposerOpen(false);
  };

  return (
    <section className="space-y-6">
      <article className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
              My Requests
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#102A74] sm:text-[2rem]">
              Follow every tenant service request in one place
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              Review the status of your requests, see landlord responses, and open
              each card for full details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsComposerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
          >
            <Plus className="size-4" />
            Create New Request
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-[0.9fr_0.9fr_auto]">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Status Filter
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Date Filter
            </span>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            />
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setDateFilter("");
              }}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-[#C9D4EC] px-5 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
            >
              <Filter className="size-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </article>

      <div className="relative space-y-4 before:absolute before:left-[1.15rem] before:top-4 before:hidden before:h-[calc(100%-2rem)] before:w-px before:bg-[#DCE5F7] lg:before:block">
        {filteredRequests.map((request) => (
          <button
            key={request.id}
            type="button"
            onClick={() => setSelectedRequest(request)}
            className="relative z-10 flex w-full flex-col rounded-[1.7rem] border border-[#DCE5F7] bg-white p-5 text-left shadow-[0_18px_36px_rgba(15,32,86,0.08)] transition-colors duration-300 hover:border-[#18399F] lg:ml-10"
          >
            <span className="absolute -left-10 top-7 hidden size-5 rounded-full border-4 border-white bg-[#18399F] shadow-[0_0_0_1px_#DCE5F7] lg:block" />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                  {request.requestType}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
                  {request.title}
                </h3>
              </div>
              <StatusBadge status={request.status} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-[#18399F]" />
                {formatDate(request.submittedAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="size-4 text-[#18399F]" />
                {formatTime(request.submittedAt)}
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              {request.details}
            </p>

            {request.response ? (
              <div className="mt-4 rounded-[1.3rem] bg-[#F8FBFF] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5C7BD9]">
                  Response from landlord
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {request.response}
                </p>
              </div>
            ) : null}

            <span className="mt-4 text-sm font-semibold text-[#18399F]">
              View full details
            </span>
          </button>
        ))}
      </div>

      {isComposerOpen ? (
        <ModalShell onClose={() => setIsComposerOpen(false)} title="Close new request composer">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3656B7]">
                New Request
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
                Create a service request
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsComposerOpen(false)}
              className="grid size-9 place-items-center rounded-full border border-[#C9D4EC] text-[#18399F]"
              aria-label="Close create request modal"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleCreateRequest} className="mt-6 grid gap-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Request Title
              </span>
              <input
                type="text"
                required
                value={requestTitle}
                onChange={(event) => setRequestTitle(event.target.value)}
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Request Type
              </span>
              <select
                value={requestType}
                onChange={(event) => setRequestType(event.target.value)}
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              >
                {requestTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Details
              </span>
              <textarea
                required
                value={requestDetails}
                onChange={(event) => setRequestDetails(event.target.value)}
                className="min-h-[9rem] w-full rounded-[1rem] border border-[#DCE5F7] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Attach Files
              </span>
              <label className="flex min-h-[5.5rem] cursor-pointer flex-col items-center justify-center rounded-[1.2rem] border border-dashed border-[#C9D4EC] bg-[#F8FBFF] px-4 text-center text-sm text-slate-500">
                <Paperclip className="mb-2 size-5 text-[#18399F]" />
                Optional documents, images, or short clips
                <input
                  type="file"
                  multiple
                  onChange={(event) =>
                    setRequestAttachments(
                      Array.from(event.target.files ?? []).map((file) => file.name)
                    )
                  }
                  className="hidden"
                />
              </label>
              <AttachmentPills files={requestAttachments} />
            </label>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#18399F] px-4 py-2 text-sm font-semibold text-white"
              >
                Save Request
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {selectedRequest ? (
        <ModalShell onClose={() => setSelectedRequest(null)} title="Close request details">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3656B7]">
                Request Details
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
                {selectedRequest.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRequest(null)}
              className="grid size-9 place-items-center rounded-full border border-[#C9D4EC] text-[#18399F]"
              aria-label="Close request details modal"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.3rem] bg-[#F8FBFF] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Type
              </p>
              <p className="mt-2 font-semibold text-[#102A74]">
                {selectedRequest.requestType}
              </p>
            </div>
            <div className="rounded-[1.3rem] bg-[#F8FBFF] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Status
              </p>
              <div className="mt-2">
                <StatusBadge status={selectedRequest.status} />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[1.3rem] bg-[#F8FBFF] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Date Submitted
            </p>
            <p className="mt-2 font-medium text-[#102A74]">
              {formatDate(selectedRequest.submittedAt)} at{" "}
              {formatTime(selectedRequest.submittedAt)}
            </p>
          </div>

          <div className="mt-4 rounded-[1.3rem] bg-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Full Details
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              {selectedRequest.details}
            </p>
          </div>

          {selectedRequest.response ? (
            <div className="mt-4 rounded-[1.3rem] bg-[#EEF4FF] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3656B7]">
                Landlord Response
              </p>
              <p className="mt-3 text-sm leading-7 text-[#29448F]">
                {selectedRequest.response}
              </p>
            </div>
          ) : null}
        </ModalShell>
      ) : null}
    </section>
  );
}

export function TenantAnnouncementsView({ announcements, onOpenAnnouncement }) {
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredAnnouncements = useMemo(
    () =>
      announcements.filter((announcement) => {
        const matchesCategory =
          categoryFilter === "All" || announcement.category === categoryFilter;
        const searchableText = [
          announcement.title,
          announcement.authorName,
          announcement.authorRole,
          announcement.content,
          announcement.category,
        ]
          .join(" ")
          .toLowerCase();
        const matchesSearch =
          !searchValue.trim() ||
          searchableText.includes(searchValue.trim().toLowerCase());

        return matchesCategory && matchesSearch;
      }),
    [announcements, categoryFilter, searchValue]
  );

  return (
    <section className="space-y-6">
      <article className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
          Announcements
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#102A74] sm:text-[2rem]">
          Stay on top of updates from your landlord and property team
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
          Browse a clean feed of rent reminders, maintenance notices, and urgent
          property updates. Important posts stand out automatically.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_auto] lg:items-center">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Search
            </span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search announcements"
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </span>
          </label>

          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Category
            </span>
            <div className="flex flex-wrap gap-2">
              {announcementCategories.map((category) => (
                <CategoryChip
                  key={category}
                  active={categoryFilter === category}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </CategoryChip>
              ))}
            </div>
          </div>
        </div>
      </article>

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
                  aria-hidden="true"
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
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {announcement.isRead ? "Read" : "Unread"}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-[#102A74]">
                    {announcement.title}
                  </h3>
                </div>
              </div>

              <div className="text-right text-sm text-slate-500">
                <p>{formatDate(announcement.datePosted)}</p>
                <p className="mt-1">{formatTime(announcement.datePosted)}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <MessageSquareText className="size-4 text-[#18399F]" />
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
    </section>
  );
}

export function TenantChatWithLandlordView({
  conversations,
  onOpenConversation,
  onSendMessage,
  tenantName,
  typingConversationId,
}) {
  const initialConversationId =
    conversations.find((conversation) =>
      conversation.messages.some(
        (message) => message.sender === "landlord" && !message.readByTenant
      )
    )?.id ??
    conversations[0]?.id ??
    null;
  const [selectedConversationId, setSelectedConversationId] = useState(
    initialConversationId
  );
  const [draftMessage, setDraftMessage] = useState("");
  const [draftAttachments, setDraftAttachments] = useState([]);

  const conversationSummaries = useMemo(
    () =>
      conversations.map((conversation) => {
        const unreadCount = conversation.messages.filter(
          (message) => message.sender === "landlord" && !message.readByTenant
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
    ) ?? conversationSummaries[0] ?? null;

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    onOpenConversation(conversationId);
  };

  const handleSend = (event) => {
    event.preventDefault();

    if (!selectedConversation || (!draftMessage.trim() && draftAttachments.length === 0)) {
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
      <article className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
          Chat With Landlord
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#102A74] sm:text-[2rem]">
          A fast, familiar chat space for rent and property conversations
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
          Message your landlord or property manager, share attachments, and keep
          every conversation in one mobile-friendly workspace.
        </p>
      </article>

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
                        {conversation.landlordName}
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
                  <span>{formatTime(conversation.lastMessage?.timestamp)}</span>
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
                        {selectedConversation.landlordName}
                      </h3>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedConversation.online ? "Online now" : "Away"} •{" "}
                      {selectedConversation.roleLabel} • {selectedConversation.propertyName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-[#F8FBFF] px-4 py-5 sm:px-5">
                {selectedConversation.messages.map((message) => {
                  const isTenantMessage = message.sender === "tenant";

                  return (
                    <div
                      key={message.id}
                      className={classNames(
                        "flex",
                        isTenantMessage ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={classNames(
                          "max-w-[85%] rounded-[1.35rem] px-4 py-3 shadow-sm sm:max-w-[70%]",
                          isTenantMessage
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
                                  isTenantMessage
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
                            isTenantMessage ? "text-white/70" : "text-slate-400"
                          )}
                        >
                          <span>{formatTime(message.timestamp)}</span>
                          {isTenantMessage && message.deliveryStatus ? (
                            <span>{message.deliveryStatus}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {typingConversationId === selectedConversation.id ? (
                  <div className="flex justify-start">
                    <div className="rounded-[1.35rem] rounded-bl-md bg-white px-4 py-3 text-sm text-slate-400 shadow-sm">
                      {selectedConversation.landlordName} is typing...
                    </div>
                  </div>
                ) : null}
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
                      placeholder={`Message ${selectedConversation.landlordName}`}
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
                  Signed in as {tenantName}. Messages update instantly in this demo flow.
                </p>
              </form>
            </>
          ) : null}
        </article>
      </div>
    </section>
  );
}
