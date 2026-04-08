import { useState } from 'react'
import faqImage from '../../assets/faq.png'
import FaqAccordionItem from '../cards/FaqAccordionItem.jsx'
import Container from '../common/Container.jsx'
import Reveal from '../common/Reveal.jsx'

export default function FaqSection({ faq }) {
  const [openId, setOpenId] = useState(faq.items[faq.items.length - 1]?.id ?? '')

  const handleToggle = (nextId) => {
    setOpenId((currentId) => (currentId === nextId ? '' : nextId))
  }

  return (
    <section id="faq" className="relative overflow-hidden bg-white pb-0 pt-12 sm:pt-14 lg:pt-16">
      <Container className="!max-w-none !px-0">
        <div className="relative overflow-hidden px-5 pb-0 pt-4 sm:px-8 lg:pl-10 lg:pr-0 xl:pl-14 xl:pr-0">
          <div
            className="pointer-events-none absolute -left-16 top-20 h-28 w-[26rem] rotate-[13deg] rounded-full border-[18px] border-slate-100/90"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-20 top-[9.5rem] h-28 w-[31rem] rotate-[13deg] rounded-full border-[18px] border-slate-100/80"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-16 bottom-[-5rem] h-40 w-[40rem] rotate-[11deg] rounded-full border-[20px] border-slate-100/85"
            aria-hidden="true"
          />
          <Reveal className="relative z-10 flex justify-center">
            <div className="flex w-fit flex-col items-center gap-2 bg-white px-5">
              <span className="text-[0.88rem] font-semibold uppercase tracking-[0.42em] text-[#18399F] sm:text-[0.95rem]">
                {faq.eyebrow}
              </span>
              <span className="h-0.5 w-44 rounded-full bg-[#18399F] sm:w-52" aria-hidden="true" />
            </div>
          </Reveal>

          <div className="relative z-10 mt-10 grid gap-10 lg:grid-cols-[minmax(25rem,30rem)_minmax(0,1fr)] lg:items-center lg:gap-8 xl:grid-cols-[minmax(27rem,32rem)_minmax(0,1fr)] xl:gap-10">
            <Reveal className="w-full max-w-[28rem] space-y-7 sm:space-y-8 xl:max-w-[30rem]" delay={80}>
              <h2 className="font-sans text-[2.2rem] font-bold tracking-[-0.06em] text-[#18399F] sm:text-[2.7rem]">
                {faq.title}
              </h2>

              <div className="space-y-6">
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

            <Reveal className="w-full min-w-0 self-stretch" delay={140}>
              <div className="h-full min-h-[22rem] w-full overflow-hidden sm:min-h-[28rem] lg:min-h-[36rem] xl:min-h-[38rem]">
                <img
                  src={faqImage}
                  alt="People reviewing housing documents beside a house model"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  )
}
