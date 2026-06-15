import { useState } from "react";
import FeatureShowcaseCard from "../cards/FeatureShowcaseCard.jsx";
import PrimaryButton from "../common/PrimaryButton.jsx";
import Reveal from "../common/Reveal.jsx";
import SectionHeading from "../common/SectionHeading.jsx";
import { classNames } from "../../utils/classNames.js";

export default function FeaturesSection({ features }) {
  const categories = features.categories ?? [];
  const initialFeatureId = categories[0]?.id ?? "";
  const [activeFeatureId, setActiveFeatureId] = useState(initialFeatureId);

  const activeFeature =
    categories.find((feature) => feature.id === activeFeatureId) ??
    categories[0];
  

  if (!activeFeature) {
    return null;
  }

  return (
    <section id="features" className="overflow-hidden py-14 sm:py-16 lg:py-20">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="relative overflow-hidden rounded-[2.25rem] bg-white px-5 py-8 shadow-[0_24px_70px_rgba(18,24,58,0.08)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(24,57,159,0.12),transparent_55%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-56 bg-[radial-gradient(circle_at_center,rgba(178,196,255,0.18),transparent_60%)]"
            aria-hidden="true"
          />

          <Reveal className="relative z-10">
            <SectionHeading
              align="center"
              eyebrow={features.eyebrow}
              eyebrowVariant="underline"
              title={features.title}
              description={features.description}
              className="mx-auto max-w-3xl"
            />
          </Reveal>

          <Reveal delay={100} className="relative z-10 mt-10">
            <div className="rounded-[1.75rem] bg-[#f7f9ff] p-3 shadow-[0_16px_40px_rgba(18,24,58,0.06)] sm:p-4">
              <div
                role="tablist"
                aria-label="Feature categories"
                className="hidden flex-wrap items-center justify-center gap-3 md:flex"
              >
                {categories.map((feature) => {
                  const isActive = feature.id === activeFeatureId;

                  return (
                    <button
                      key={feature.id}
                      id={`feature-tab-${feature.id}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`feature-panel-${feature.id}`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveFeatureId(feature.id)}
                      className={classNames(
                        "rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18399F]/30 focus-visible:ring-offset-2",
                        isActive
                          ? "bg-[#18399F] text-white shadow-[0_16px_30px_rgba(24,57,159,0.24)] hover:-translate-y-0.5 hover:bg-[#15338D]"
                          : "bg-white text-[#18399F] shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:bg-[#E8EEFF] hover:text-[#15338D] hover:shadow-[0_16px_28px_rgba(24,57,159,0.12)]",
                      )}
                    >
                      {feature.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 md:hidden">
                {categories.map((feature) => {
                  const isActive = feature.id === activeFeatureId;

                  return (
                    <button
                      key={feature.id}
                      id={`feature-tab-${feature.id}-mobile`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`feature-panel-${feature.id}`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveFeatureId(feature.id)}
                      className={classNames(
                        "rounded-[1.1rem] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18399F]/30 focus-visible:ring-offset-2",
                        isActive
                          ? "bg-[#18399F] text-white shadow-[0_14px_24px_rgba(24,57,159,0.22)] hover:bg-[#15338D]"
                          : "bg-white text-[#18399F] shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:bg-[#E8EEFF] hover:text-[#15338D] hover:shadow-[0_14px_24px_rgba(24,57,159,0.12)]",
                      )}
                    >
                      {feature.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={160} className="relative z-10 mt-6 space-y-6">
            <FeatureShowcaseCard
              key={activeFeature.id}
              feature={activeFeature}
            />

            <div className="flex flex-col items-center justify-between gap-4 rounded-[1.5rem] bg-[#f7f9ff] px-4 py-4 shadow-[0_14px_32px_rgba(18,24,58,0.06)] sm:flex-row sm:px-6">
              

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                {(features.actions ?? []).map((action, index) => (
                  <PrimaryButton
                    key={action.label}
                    to={action.to}
                    href={action.href}
                    variant={index === 0 ? "outline" : "brand"}
                    className={classNames(
                      "min-w-[13.5rem] border-0 px-6 py-3 shadow-none",
                      index === 0
                        ? "bg-white text-[#18399F] shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:bg-[#E8EEFF] hover:text-[#15338D] hover:shadow-[0_16px_30px_rgba(24,57,159,0.12)]"
                        : "bg-[#18399F] text-white hover:-translate-y-0.5 hover:bg-[#15338D] hover:shadow-[0_18px_32px_rgba(24,57,159,0.24)]",
                    )}
                  >
                    {action.label}
                  </PrimaryButton>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
