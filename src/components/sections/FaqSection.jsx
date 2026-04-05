import { useState } from 'react'
import faqScene from '../../assets/illustrations/faq-scene.svg'
import FaqAccordionItem from '../cards/FaqAccordionItem.jsx'
import Container from '../common/Container.jsx'
import Reveal from '../common/Reveal.jsx'
import SectionHeading from '../common/SectionHeading.jsx'

export default function FaqSection({ faq }) {
  const [openId, setOpenId] = useState(faq.items[0].id)

  const handleToggle = (nextId) => {
    setOpenId((currentId) => (currentId === nextId ? '' : nextId))
  }

  return (
    <section className="py-0">
      <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="space-y-6">
          <SectionHeading
            eyebrow={faq.eyebrow}
            title={faq.title}
            description={faq.description}
          />

          <div className="space-y-4">
            {faq.items.map((item) => (
              <FaqAccordionItem
                key={item.id}
                item={item}
                isOpen={item.id === openId}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </Reveal>

        <Reveal
          className="relative flex items-end overflow-hidden rounded-[2.25rem] border border-brand-900/10 bg-brand-900 p-6 text-white sm:p-8"
          delay={120}
        >
          <div className="w-full">
            <div className="max-w-sm space-y-4">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white">
                Support that scales
              </span>
              <h3 className="font-display text-3xl font-bold tracking-[-0.05em]">
                Confident answers for growing rental teams.
              </h3>
              <p className="text-sm leading-7 text-brand-100 sm:text-base">
                This section is ready for longer help content, knowledge base links,
                or backend-powered support responses later on.
              </p>
            </div>

            <img
              src={faqScene}
              alt="Illustration of a landlord and tenant reviewing property questions"
              className="mt-8 w-full max-w-[32rem]"
            />
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
