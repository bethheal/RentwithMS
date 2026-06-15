import {
  ArrowRight,
  CalendarDays,
  Eye,
  MapPin,
  Pencil,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";
import { classNames } from "../../utils/classNames.js";
import { formatPropertyDate } from "../../utils/propertyRecords.js";

function PropertyStatusBadge({ label, tone = "neutral" }) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]",
        tone === "success" && "bg-emerald-50 text-emerald-700",
        tone === "warning" && "bg-amber-50 text-amber-700",
        tone === "danger" && "bg-rose-50 text-rose-700",
        tone === "neutral" && "bg-[#EEF3FF] text-[#3656B7]"
      )}
    >
      {label}
    </span>
  );
}

function getWorkflowTone(workflowStatus) {
  if (workflowStatus === "published") {
    return "success";
  }

  if (workflowStatus === "unpublished") {
    return "warning";
  }

  return "neutral";
}

function getTenantTone(status) {
  if (status === "Active") {
    return "success";
  }

  if (status === "Inactive") {
    return "danger";
  }

  return "warning";
}

function LandlordPropertyCard({
  onDelete,
  onEdit,
  onPublishToggle,
  property,
  showDeleteAction = true,
}) {
  const isPublished = property.workflowStatus === "published";
  const assignedTenantName =
    property.draft.details.assignedTenantName?.trim() || "No tenant assigned";
  const assignedTenantEmail =
    property.draft.details.assignedTenantEmail?.trim() || "No email linked";
  const hasTenantAssignment = Boolean(
    property.draft.details.assignedTenantEmail?.trim() ||
      property.draft.details.assignedTenantName?.trim()
  );
  const moveInDate = property.draft.details.moveInDate
    ? formatPropertyDate(property.draft.details.moveInDate)
    : "Move-in date not set";

  return (
    <article className="overflow-hidden rounded-[1.8rem] border border-[#DCE5F7] bg-white shadow-[0_18px_36px_rgba(15,32,86,0.08)]">
      <div className="grid gap-5 p-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-[1.3rem] bg-[#EEF3FF]">
          <img
            src={property.summary.image}
            alt={property.summary.title}
            className="h-full min-h-[14rem] w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <PropertyStatusBadge
                  label={property.workflowStatus}
                  tone={getWorkflowTone(property.workflowStatus)}
                />
                <PropertyStatusBadge
                  label={property.draft.details.tenantStatus || "Pending"}
                  tone={getTenantTone(property.draft.details.tenantStatus || "Pending")}
                />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-[#102A74]">
                  {property.summary.title}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="size-4 text-[#5C7BD9]" />
                  <span>{property.summary.location}</span>
                </p>
              </div>

              <p className="max-w-3xl text-sm leading-7 text-slate-500">
                {property.summary.description || "No description added yet."}
              </p>
            </div>

            <div className="min-w-[11rem] rounded-[1.25rem] bg-[#F7FAFF] px-4 py-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Rent
              </p>
              <p className="mt-2 text-lg font-semibold text-[#102A74]">
                {property.summary.amount}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Updated {formatPropertyDate(property.updatedAt)}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.2rem] border border-[#E2EAF8] bg-[#FBFDFF] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Assigned Tenant
              </p>
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#102A74]">
                <UserRound className="size-4 text-[#18399F]" />
                <span>{assignedTenantName}</span>
              </p>
              <p className="mt-2 text-sm text-slate-500">{assignedTenantEmail}</p>
            </div>

            <div className="rounded-[1.2rem] border border-[#E2EAF8] bg-[#FBFDFF] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Move-In Date
              </p>
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#102A74]">
                <CalendarDays className="size-4 text-[#18399F]" />
                <span>{moveInDate}</span>
              </p>
            </div>

            <div className="rounded-[1.2rem] border border-[#E2EAF8] bg-[#FBFDFF] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                Tenant Visibility
              </p>
              <p className="mt-3 text-sm font-semibold text-[#102A74]">
                {isPublished && hasTenantAssignment
                  ? "Visible to assigned tenant"
                  : "Hidden from tenants"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Published properties only appear for linked tenants.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
            >
              <Pencil className="size-4" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={onPublishToggle}
              className={classNames(
                "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-300",
                isPublished
                  ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "bg-[#18399F] text-white hover:bg-[#102A74]"
              )}
            >
              <Send className="size-4" />
              <span>{isPublished ? "Unpublish" : "Publish"}</span>
            </button>

            {showDeleteAction ? (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors duration-300 hover:bg-rose-100"
              >
                <Trash2 className="size-4" />
                <span>Delete</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function LandlordMyPropertiesView({
  onCreateProperty,
  onDeleteProperty,
  onEditProperty,
  onPublishToggle,
  properties,
}) {
  const publishedCount = properties.filter(
    (property) => property.workflowStatus === "published"
  ).length;

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
              Managed Inventory
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-[#102A74] sm:text-[2rem]">
              My Properties
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Create, edit, publish, unpublish, and delete properties here. Tenant
              visibility updates immediately whenever a published assignment changes.
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateProperty}
            className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
          >
            <ArrowRight className="size-4" />
            <span>Add Property</span>
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.35rem] bg-white p-4 shadow-[0_12px_24px_rgba(15,32,86,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Total Properties
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#102A74]">
              {properties.length}
            </p>
          </div>
          <div className="rounded-[1.35rem] bg-white p-4 shadow-[0_12px_24px_rgba(15,32,86,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Published
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#102A74]">
              {publishedCount}
            </p>
          </div>
          <div className="rounded-[1.35rem] bg-white p-4 shadow-[0_12px_24px_rgba(15,32,86,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
              Hidden From Tenants
            </p>
            <p className="mt-3 text-3xl font-semibold text-[#102A74]">
              {properties.length - publishedCount}
            </p>
          </div>
        </div>
      </div>

      {properties.length > 0 ? (
        <div className="space-y-5">
          {properties.map((property) => (
            <LandlordPropertyCard
              key={property.id}
              property={property}
              onDelete={() => onDeleteProperty(property)}
              onEdit={() => onEditProperty(property)}
              onPublishToggle={() => onPublishToggle(property)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.8rem] border border-dashed border-[#C9D4EC] bg-[#F9FBFF] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[#102A74]">
            No properties yet
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Add a property, assign a tenant, and publish it to make it appear in the
            tenant&apos;s My Properties view.
          </p>
          <button
            type="button"
            onClick={onCreateProperty}
            className="mt-6 rounded-full bg-[#18399F] px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
          >
            Create Property
          </button>
        </div>
      )}
    </section>
  );
}

export function LandlordPropertyListingsView({
  onManageProperties,
  onOpenAddProperty,
  properties,
}) {
  const publishedProperties = properties.filter(
    (property) => property.workflowStatus === "published"
  );

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-[#DCE5F7] bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FAFF_100%)] p-5 shadow-[0_20px_40px_rgba(15,32,86,0.08)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5C7BD9]">
          Tenant Visibility
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#102A74] sm:text-[2rem]">
          Property Listings
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          Published listings are the only ones tenants can see. Draft and unpublished
          records stay hidden until you push them live.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onManageProperties}
            className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
          >
            <Eye className="size-4" />
            <span>Manage Inventory</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddProperty}
            className="inline-flex items-center gap-2 rounded-full bg-[#18399F] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
          >
            <ArrowRight className="size-4" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {publishedProperties.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {publishedProperties.map((property) => (
            <article
              key={property.id}
              className="overflow-hidden rounded-[1.8rem] border border-[#DCE5F7] bg-white shadow-[0_18px_36px_rgba(15,32,86,0.08)]"
            >
              <div className="overflow-hidden bg-[#EEF3FF]">
                <img
                  src={property.summary.image}
                  alt={property.summary.title}
                  className="h-52 w-full object-cover"
                />
              </div>

              <div className="space-y-4 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <PropertyStatusBadge
                    label={property.workflowStatus}
                    tone={getWorkflowTone(property.workflowStatus)}
                  />
                  <PropertyStatusBadge
                    label={property.draft.details.tenantStatus || "Pending"}
                    tone={getTenantTone(property.draft.details.tenantStatus || "Pending")}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-[#102A74]">
                    {property.summary.title}
                  </h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="size-4 text-[#5C7BD9]" />
                    <span>{property.summary.location}</span>
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.2rem] bg-[#F7FAFF] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                      Rent
                    </p>
                    <p className="mt-2 text-base font-semibold text-[#102A74]">
                      {property.summary.amount}
                    </p>
                  </div>

                  <div className="rounded-[1.2rem] bg-[#F7FAFF] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5C7BD9]">
                      Published
                    </p>
                    <p className="mt-2 text-base font-semibold text-[#102A74]">
                      {formatPropertyDate(property.publishedAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onManageProperties}
                  className="inline-flex items-center gap-2 rounded-full border border-[#C9D4EC] bg-white px-4 py-2.5 text-sm font-semibold text-[#18399F] transition-colors duration-300 hover:border-[#18399F]"
                >
                  <Eye className="size-4" />
                  <span>Open Property Manager</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.8rem] border border-dashed border-[#C9D4EC] bg-[#F9FBFF] px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[#102A74]">
            No published listings yet
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Publish a property with an assigned tenant to make it visible in the tenant
            portal.
          </p>
          <button
            type="button"
            onClick={onOpenAddProperty}
            className="mt-6 rounded-full bg-[#18399F] px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#102A74]"
          >
            Add a Listing
          </button>
        </div>
      )}
    </section>
  );
}
