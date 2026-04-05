import { useEffect, useState } from 'react'
import FeatureShowcaseCard from '../cards/FeatureShowcaseCard.jsx'
import Container from '../common/Container.jsx'
import Reveal from '../common/Reveal.jsx'
import SectionHeading from '../common/SectionHeading.jsx'

export default function FeaturesSection({ features }) {
  const [activeFeatureId, setActiveFeatureId] = useState(features.categories[0].id)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveFeatureId((currentId) => {
        const currentIndex = features.categories.findIndex(
          (feature) => feature.id === currentId,
        )
        const nextIndex = (currentIndex + 1) % features.categories.length
        return features.categories[nextIndex].id
      })
    }, 5200)

    return () => window.clearInterval(timer)
  }, [features.categories])

  const activeFeature =
    features.categories.find((feature) => feature.id === activeFeatureId) ??
    features.categories[0]

  return (
    <section id="features" className="py-0">
      <Container className="space-y-10">
        <Reveal>
          <SectionHeading
            eyebrow={features.eyebrow}
            title={features.title}
            description={features.description}
            align="center"
          />
        </Reveal>

        <Reveal
          className="flex flex-wrap items-center justify-center gap-3"
          delay={100}
        >
          {features.categories.map((feature) => (
            <button
              key={feature.id}
              type="button"
              onClick={() => setActiveFeatureId(feature.id)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition ${
                feature.id === activeFeatureId
                  ? 'border-brand-700 bg-brand-900 text-white'
                  : 'border-brand-200 bg-white text-brand-700 hover:bg-brand-50'
              }`}
            >
              {feature.label}
            </button>
          ))}
        </Reveal>

        <Reveal delay={160}>
          <FeatureShowcaseCard feature={activeFeature} actions={features.actions} />
        </Reveal>
      </Container>
    </section>
  )
}
