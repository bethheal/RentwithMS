import { useMemo, useState } from "react";
import {
  ArrowRight,
  BellRing,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  Landmark,
  Printer,
  Receipt,
  Search,
  Smartphone,
  X,
} from "lucide-react";
import { classNames } from "../../utils/classNames.js";

const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

const paymentMethodIcons = {
  "bank-transfer": Landmark,
  card: CreditCard,
  "mobile-money": Smartphone,
};

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

function getStatusTone(status) {
  const normalizedStatus = String(status ?? "").toLowerCase();

  if (normalizedStatus === "paid" || normalizedStatus === "successful") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalizedStatus === "pending" || normalizedStatus === "due") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (normalizedStatus === "overdue" || normalizedStatus === "failed") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

function PaymentMethodCard({ isSelected, method, onSelect }) {
  const Icon = paymentMethodIcons[method.id] ?? CreditCard;

  return (
    <button
      type="button"
      onClick={() => onSelect(method.id)}
      className={classNames(
        "rounded-[1.6rem] border p-4 text-left transition-all duration-300",
        isSelected
          ? "border-[#18399F] bg-[#EEF4FF] shadow-[0_18px_34px_rgba(24,57,159,0.12)]"
          : "border-[#DCE5F7] bg-white hover:border-[#18399F]"
      )}
      aria-pressed={isSelected}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={classNames(
            "grid size-11 shrink-0 place-items-center rounded-2xl",
            isSelected ? "bg-[#18399F] text-white" : "bg-[#F6F9FF] text-[#18399F]"
          )}
        >
          <Icon className="size-5" />
        </span>

        {isSelected ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#18399F]">
            <CheckCircle2 className="size-3.5" />
            Selected
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-base font-semibold text-[#102A74]">{method.label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{method.description}</p>
    </button>
  );
}

function ReceiptLineItem({ label, value, emphasized = false }) {
  return (
    <div
      className={classNames(
        "flex items-center justify-between gap-4 rounded-[1rem] px-3 py-2.5",
        emphasized ? "bg-[#EEF4FF]" : "bg-[#F8FBFF]"
      )}
    >
      <span className={emphasized ? "font-semibold text-[#102A74]" : "text-slate-500"}>
        {label}
      </span>
      <span
        className={
          emphasized
            ? "text-lg font-semibold text-[#18399F]"
            : "font-medium text-[#102A74]"
        }
      >
        {value}
      </span>
    </div>
  );
}

function ReceiptLayout({ className = "", receipt }) {
  if (!receipt) {
    return null;
  }

  return (
    <article
      className={classNames(
        "rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-[#DCE5F7] pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
            Printable Receipt
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#102A74]">
            Receipt {receipt.id}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Payment received on {formatDate(receipt.paymentDate)}
          </p>
        </div>

        <StatusBadge status={receipt.status} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.4rem] bg-[#F8FBFF] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
            Landlord
          </p>
          <p className="mt-3 text-base font-semibold text-[#102A74]">
            {receipt.landlordName}
          </p>
        </div>

        <div className="rounded-[1.4rem] bg-[#F8FBFF] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
            Tenant
          </p>
          <p className="mt-3 text-base font-semibold text-[#102A74]">
            {receipt.tenantName}
          </p>
        </div>

        <div className="rounded-[1.4rem] bg-[#F8FBFF] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
            Property
          </p>
          <p className="mt-3 text-base font-semibold text-[#102A74]">
            {receipt.propertyName}
          </p>
          <p className="mt-2 text-sm text-slate-500">{receipt.propertyDetails}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.5rem] border border-[#DCE5F7] bg-[#FBFDFF] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
            Payment Breakdown
          </p>
          <div className="mt-4 space-y-3">
            <ReceiptLineItem
              label="Rent amount"
              value={formatMoney(receipt.paymentBreakdown.rent)}
            />
            <ReceiptLineItem
              label="Utilities"
              value={formatMoney(receipt.paymentBreakdown.utilities)}
            />
            <ReceiptLineItem
              emphasized
              label="Total paid"
              value={formatMoney(receipt.totalPaid)}
            />
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#DCE5F7] bg-[#FBFDFF] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
            Receipt Details
          </p>
          <div className="mt-4 space-y-4 text-sm text-slate-500">
            <div>
              <p className="font-semibold uppercase tracking-[0.14em] text-[#5C7BD9]">
                Amount
              </p>
              <p className="mt-2 text-lg font-semibold text-[#102A74]">
                {formatMoney(receipt.amount)}
              </p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.14em] text-[#5C7BD9]">
                Payment Method
              </p>
              <p className="mt-2 font-medium text-[#102A74]">{receipt.paymentMethod}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.14em] text-[#5C7BD9]">
                Receipt Number
              </p>
              <p className="mt-2 font-medium text-[#102A74]">{receipt.id}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.14em] text-[#5C7BD9]">
                Payment Date
              </p>
              <p className="mt-2 font-medium text-[#102A74]">
                {formatDate(receipt.paymentDate)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function TenantPayRentView({
  onPayNow,
  onSelectPaymentMethod,
  onToggleReminder,
  paymentDetails,
}) {
  const isPaid = paymentDetails.paymentStatus === "Paid";
  const selectedPaymentMethod =
    paymentDetails.paymentMethods.find(
      (method) => method.id === paymentDetails.selectedPaymentMethodId
    ) ?? paymentDetails.paymentMethods[0];

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="overflow-hidden rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(135deg,#17338E_0%,#244BBC_54%,#E7F0FF_54%,#FFFFFF_100%)] p-6 shadow-[0_24px_46px_rgba(15,32,86,0.14)]">
          <div className="flex h-full flex-col justify-between gap-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                  Pay Rent
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-white">
                  {paymentDetails.billingMonth}
                </h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/75">
                  Settle your monthly rent from one place and keep your payment
                  records ready whenever you need them.
                </p>
              </div>

              <StatusBadge status={paymentDetails.paymentStatus} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-sm font-medium text-white/70">
                  Current rent amount due
                </p>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                  {formatMoney(paymentDetails.outstandingAmount)}
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                    <CalendarDays className="size-4" />
                    Due {formatDate(paymentDetails.dueDate)}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                    <Receipt className="size-4" />
                    {paymentDetails.invoiceId}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onPayNow}
                disabled={isPaid}
                className={classNames(
                  "inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-sm font-semibold transition-colors duration-300",
                  isPaid
                    ? "cursor-not-allowed bg-white/60 text-[#102A74]"
                    : "bg-white text-[#18399F] hover:bg-[#EEF4FF]"
                )}
              >
                {isPaid ? "Payment Recorded" : "Pay Now"}
                {!isPaid ? <ArrowRight className="size-4" /> : null}
              </button>
            </div>
          </div>
        </article>

        <div className="grid gap-6">
          <article className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
              Breakdown
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[#102A74]">
              Payment summary
            </h3>

            <div className="mt-5 space-y-3">
              <ReceiptLineItem
                label="Rent amount"
                value={formatMoney(paymentDetails.rentAmount)}
              />
              <ReceiptLineItem
                label="Utilities"
                value={formatMoney(paymentDetails.utilitiesAmount)}
              />
              <ReceiptLineItem
                emphasized
                label="Total amount"
                value={formatMoney(paymentDetails.totalAmount)}
              />
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
          </article>

          <article className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
                  Reminder
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
                  Remind me before due date
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Receive a friendly nudge before your rent becomes overdue.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={paymentDetails.reminderEnabled}
                onClick={onToggleReminder}
                className="inline-flex items-center gap-3"
              >
                <span className="text-sm font-semibold text-[#18399F]">
                  {paymentDetails.reminderEnabled ? "On" : "Off"}
                </span>
                <span
                  className={classNames(
                    "relative inline-flex h-8 w-14 rounded-full transition-colors duration-300",
                    paymentDetails.reminderEnabled ? "bg-[#18399F]" : "bg-slate-300"
                  )}
                >
                  <span
                    className={classNames(
                      "absolute top-1 size-6 rounded-full bg-white shadow-sm transition-transform duration-300",
                      paymentDetails.reminderEnabled ? "translate-x-7" : "translate-x-1"
                    )}
                  />
                </span>
              </button>
            </div>

            <div className="mt-5 rounded-[1.4rem] bg-[#F8FBFF] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#102A74]">
                <BellRing className="size-4 text-[#18399F]" />
                Selected payment method
              </p>
              <p className="mt-2 text-base font-semibold text-[#18399F]">
                {selectedPaymentMethod?.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {selectedPaymentMethod?.description}
              </p>
            </div>
          </article>
        </div>
      </div>

      <article className="rounded-[2rem] border border-[#DCE5F7] bg-white p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
              Payment Method
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[#102A74]">
              Choose how you want to pay
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Switch methods anytime before you confirm the payment.
            </p>
          </div>

          <span className="text-sm font-medium text-slate-500">
            {paymentDetails.paymentMethods.length} options available
          </span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {paymentDetails.paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              isSelected={method.id === paymentDetails.selectedPaymentMethodId}
              method={method}
              onSelect={onSelectPaymentMethod}
            />
          ))}
        </div>
      </article>
    </section>
  );
}

export function TenantRentHistoryView({ history, onViewReceipt }) {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredHistory = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return history.filter((entry) => {
      const matchesStatus =
        statusFilter === "all" || entry.status.toLowerCase() === statusFilter;
      const matchesStartDate = !startDate || entry.paymentDate >= startDate;
      const matchesEndDate = !endDate || entry.paymentDate <= endDate;
      const searchableText = [
        entry.receiptId,
        entry.paymentMethod,
        entry.propertyName,
        entry.status,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesStatus && matchesStartDate && matchesEndDate && matchesSearch;
    });
  }, [endDate, history, searchValue, startDate, statusFilter]);

  return (
    <section className="space-y-6">
      <article className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
          Rent History
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#102A74] sm:text-[2rem]">
          Track past rent payments
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
          Filter records by date and status, search by receipt or payment method,
          and open any receipt in one click.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr]">
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
                placeholder="Receipt ID, method, or property"
                className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Date From
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Date To
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-12 w-full rounded-[1rem] border border-[#DCE5F7] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#18399F]"
            >
              <option value="all">All statuses</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </label>
        </div>
      </article>

      <article className="overflow-hidden rounded-[2rem] border border-[#DCE5F7] bg-white shadow-[0_20px_40px_rgba(15,32,86,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7EDF9] px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-[#102A74]">
              {filteredHistory.length} payment
              {filteredHistory.length === 1 ? "" : "s"} found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Results update as you search or refine the filters.
            </p>
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full divide-y divide-[#E7EDF9] text-left">
            <thead className="bg-[#F8FBFF] text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount Paid</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF3FF]">
              {filteredHistory.map((entry) => (
                <tr key={entry.id} className="align-middle">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-[#102A74]">
                      {formatDate(entry.paymentDate)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{entry.receiptId}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#102A74]">
                    {formatMoney(entry.amountPaid)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#102A74]">{entry.paymentMethod}</p>
                    <p className="mt-1 text-sm text-slate-500">{entry.propertyName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={entry.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => onViewReceipt(entry.receiptId)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
                    >
                      <Eye className="size-4" />
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 p-4 md:hidden">
          {filteredHistory.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[1.5rem] border border-[#E7EDF9] bg-[#FBFDFF] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#102A74]">
                    {formatDate(entry.paymentDate)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{entry.receiptId}</p>
                </div>
                <StatusBadge status={entry.status} />
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-500">
                <div className="flex items-center justify-between gap-3">
                  <span>Amount paid</span>
                  <span className="font-semibold text-[#102A74]">
                    {formatMoney(entry.amountPaid)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Method</span>
                  <span className="font-medium text-[#102A74]">
                    {entry.paymentMethod}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onViewReceipt(entry.receiptId)}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] px-4 py-2 text-sm font-semibold text-[#18399F]"
              >
                <Eye className="size-4" />
                View Receipt
              </button>
            </article>
          ))}
        </div>

        {filteredHistory.length === 0 ? (
          <div className="border-t border-[#EEF3FF] px-6 py-12 text-center">
            <p className="text-lg font-semibold text-[#102A74]">
              No payment records match those filters
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Try widening your date range or switching the payment status filter.
            </p>
          </div>
        ) : null}
      </article>
    </section>
  );
}

export function TenantReceiptsView({
  onDownloadReceipt,
  onOpenReceiptPreview,
  onSelectReceipt,
  receipts,
  selectedReceiptId,
}) {
  const selectedReceipt =
    receipts.find((receipt) => receipt.id === selectedReceiptId) ?? receipts[0] ?? null;
  const sortedReceipts = useMemo(
    () =>
      [...receipts].sort(
        (left, right) => new Date(right.paymentDate) - new Date(left.paymentDate)
      ),
    [receipts]
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
            Receipts
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#102A74] sm:text-[2rem]">
            Download and review your payment receipts
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            Keep a printable copy of every rent payment and open details whenever
            you need a record for reference.
          </p>
        </div>

        {selectedReceipt ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onDownloadReceipt(selectedReceipt)}
              className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
            >
              <Download className="size-4" />
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => onOpenReceiptPreview(selectedReceipt.id)}
              className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] px-4 py-2.5 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
            >
              <Eye className="size-4" />
              View Details
            </button>
          </div>
        ) : null}
      </div>

      {selectedReceipt ? <ReceiptLayout receipt={selectedReceipt} /> : null}

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {sortedReceipts.map((receipt) => (
          <article
            key={receipt.id}
            className={classNames(
              "rounded-[1.8rem] border bg-white p-5 shadow-[0_18px_36px_rgba(15,32,86,0.08)] transition-all duration-300",
              receipt.id === selectedReceiptId
                ? "border-[#18399F] shadow-[0_22px_44px_rgba(24,57,159,0.14)]"
                : "border-[#DCE5F7] hover:border-[#18399F]"
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C7BD9]">
                  Receipt ID
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#102A74]">
                  {receipt.id}
                </h3>
              </div>
              <StatusBadge status={receipt.status} />
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-500">
              <div className="flex items-center justify-between gap-3">
                <span>Payment date</span>
                <span className="font-medium text-[#102A74]">
                  {formatDate(receipt.paymentDate)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Amount</span>
                <span className="font-semibold text-[#102A74]">
                  {formatMoney(receipt.amount)}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-[1.3rem] bg-[#F8FBFF] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Tenant / Property
              </p>
              <p className="mt-2 text-base font-semibold text-[#102A74]">
                {receipt.tenantName}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {receipt.propertyName}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onDownloadReceipt(receipt)}
                className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
              >
                <Download className="size-4" />
                Download PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectReceipt(receipt.id);
                  onOpenReceiptPreview(receipt.id);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] px-4 py-2.5 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
              >
                <Eye className="size-4" />
                View Details
              </button>
            </div>

            <button
              type="button"
              onClick={() => onSelectReceipt(receipt.id)}
              className="mt-4 text-sm font-semibold text-[#3656B7] transition-colors duration-300 hover:text-[#18399F]"
            >
              Use in printable view
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ReceiptPreviewModal({ onClose, onDownloadReceipt, receipt }) {
  if (!receipt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#07163F]/55"
        aria-label="Close receipt preview"
      />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onDownloadReceipt(receipt)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#18399F] shadow-[0_18px_30px_rgba(9,18,49,0.18)] transition-colors duration-300 hover:bg-[#EEF4FF]"
          >
            <Printer className="size-4" />
            Print Layout
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/20"
          >
            <X className="size-4" />
            Close
          </button>
        </div>

        <ReceiptLayout
          className="max-h-[calc(100vh-7rem)] overflow-y-auto"
          receipt={receipt}
        />
      </div>
    </div>
  );
}

export function buildPrintableReceiptHtml(receipt) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Receipt ${escapeHtml(receipt.id)}</title>
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 32px;
        background: #f4f7ff;
        color: #0f172a;
        font-family: "Segoe UI", Arial, sans-serif;
      }
      .sheet {
        max-width: 860px;
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid #dce5f7;
        border-radius: 28px;
        padding: 32px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        padding-bottom: 20px;
        border-bottom: 1px dashed #c9d4ec;
      }
      .eyebrow, .label {
        color: #3656b7;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      h1 {
        margin: 12px 0 8px;
        color: #102a74;
        font-size: 30px;
      }
      .muted {
        color: #475569;
        font-size: 14px;
        line-height: 1.7;
      }
      .badge {
        align-self: flex-start;
        border-radius: 999px;
        border: 1px solid #bbf7d0;
        background: #ecfdf5;
        color: #15803d;
        padding: 8px 14px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .grid { display: grid; gap: 16px; margin-top: 24px; }
      .three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .two { grid-template-columns: 1.15fr 0.85fr; }
      .card {
        border-radius: 20px;
        background: #f8fbff;
        padding: 18px;
      }
      .value {
        margin-top: 10px;
        color: #102a74;
        font-size: 16px;
        font-weight: 700;
      }
      .line-item {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-top: 12px;
        border-radius: 16px;
        background: #ffffff;
        padding: 14px 16px;
      }
      .line-item.total { background: #eef4ff; }
      .line-item span:last-child {
        font-weight: 700;
        color: #102a74;
      }
      .line-item.total span:last-child {
        color: #18399f;
        font-size: 18px;
      }
      @media print {
        body { padding: 0; background: #ffffff; }
        .sheet {
          border: 0;
          border-radius: 0;
          max-width: none;
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    <main class="sheet">
      <section class="header">
        <div>
          <div class="eyebrow">Printable Receipt</div>
          <h1>Receipt ${escapeHtml(receipt.id)}</h1>
          <p class="muted">Payment received on ${escapeHtml(
            formatDate(receipt.paymentDate)
          )}</p>
        </div>
        <div class="badge">${escapeHtml(receipt.status)}</div>
      </section>

      <section class="grid three">
        <article class="card">
          <div class="label">Landlord Name</div>
          <div class="value">${escapeHtml(receipt.landlordName)}</div>
        </article>
        <article class="card">
          <div class="label">Tenant Name</div>
          <div class="value">${escapeHtml(receipt.tenantName)}</div>
        </article>
        <article class="card">
          <div class="label">Property Details</div>
          <div class="value">${escapeHtml(receipt.propertyName)}</div>
          <p class="muted">${escapeHtml(receipt.propertyDetails)}</p>
        </article>
      </section>

      <section class="grid two">
        <article class="card">
          <div class="label">Payment Breakdown</div>
          <div class="line-item">
            <span>Rent amount</span>
            <span>${escapeHtml(formatMoney(receipt.paymentBreakdown.rent))}</span>
          </div>
          <div class="line-item">
            <span>Utilities</span>
            <span>${escapeHtml(
              formatMoney(receipt.paymentBreakdown.utilities)
            )}</span>
          </div>
          <div class="line-item total">
            <span>Total paid</span>
            <span>${escapeHtml(formatMoney(receipt.totalPaid))}</span>
          </div>
        </article>

        <article class="card">
          <div class="label">Receipt Details</div>
          <div class="line-item">
            <span>Payment method</span>
            <span>${escapeHtml(receipt.paymentMethod)}</span>
          </div>
          <div class="line-item">
            <span>Date</span>
            <span>${escapeHtml(formatDate(receipt.paymentDate))}</span>
          </div>
          <div class="line-item">
            <span>Receipt number</span>
            <span>${escapeHtml(receipt.id)}</span>
          </div>
          <div class="line-item total">
            <span>Amount</span>
            <span>${escapeHtml(formatMoney(receipt.amount))}</span>
          </div>
        </article>
      </section>
    </main>

    <script>
      window.addEventListener("load", () => {
        window.focus();
        window.print();
      });
      window.onafterprint = () => window.close();
    </script>
  </body>
</html>`;
}
