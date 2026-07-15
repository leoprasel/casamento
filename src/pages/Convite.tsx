import { Link } from 'react-router-dom'
import { site } from '@/config/site'
import { useCountdown } from '@/hooks/useCountdown'
import IntroVideo from '@/components/IntroVideo'
import Ornament from '@/components/Ornament'

/**
 * Main invitation (design §1): intro video freezing into a vertical scroll of
 * cards, each with a photo cut-out overflowing the top edge.
 */
export default function Convite() {
  return (
    <div className="phone overflow-x-hidden">
      <IntroVideo />
      <Opener />
      <Countdown />
      <Local />
      <Traje />
      <ClosingCta />
    </div>
  )
}

function Opener() {
  return (
    <section className="relative overflow-hidden bg-cream px-6 pb-11 pt-[82px]">
      {/* Lateral pillars framing the card */}
      <img
        src="/assets/pilar-esq.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[-122px] z-[2] h-[620px] w-auto"
      />
      <img
        src="/assets/pilar-dir.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-[-120px] z-[2] h-[620px] w-auto"
      />

      <div className="relative mx-auto max-w-[340px]">
        <div
          className="relative z-[3] mx-[6px] rounded-sm border border-olive/25 px-6 pb-[30px] pt-[118px] text-center backdrop-blur-[7px]"
          style={{ background: 'rgba(245,243,234,0.62)' }}
        >
          <img
            src="/assets/arco-topo.png"
            alt="Arco floral"
            className="absolute left-1/2 top-[-40px] w-[214px] -translate-x-1/2 drop-shadow-cutout"
          />
          <div className="font-serif text-[10px] font-semibold uppercase tracking-[0.3em] text-olive-muted">
            Com alegria, convidamos você
          </div>
          <h1 className="mt-2 whitespace-nowrap font-script text-[40px] leading-[1.05] text-olive">
            {site.couple.partnerA}
            <span className="align-[0.12em] text-[0.6em] text-olive-accent"> &amp; </span>
            {site.couple.partnerB}
          </h1>
          <Ornament className="my-3" />
          <p className="mx-auto max-w-[260px] text-[15px] leading-[1.55] text-olive-body">
            {site.invitationLine}
          </p>
          <div className="mx-auto mt-5 flex w-full max-w-[260px] flex-col gap-[10px]">
            <Link to="/confirmar" className="btn-dark !py-[14px] !text-[12px]">
              Confirmar Presença
            </Link>
            <Link to="/presentes" className="btn-outline !py-[14px] !text-[12px]">
              Lista de Presentes
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Countdown() {
  const c = useCountdown(site.weddingDate)
  const units = [
    { label: 'Dias', value: c.days },
    { label: 'Horas', value: c.hours },
    { label: 'Minutos', value: c.mins },
    { label: 'Segundos', value: c.secs },
  ]
  return (
    <section className="bg-cream-band px-6 pb-11 pt-[70px]">
      <div className="relative mx-auto max-w-[360px] rounded-sm border border-olive/25 bg-cream-card px-[26px] pb-9 pt-[168px] text-center">
        <img
          src="/assets/estufa-cutout.png"
          alt="Estufa"
          className="absolute left-1/2 top-[-85px] w-[236px] -translate-x-1/2 drop-shadow-cutout"
        />
        <div className="font-serif text-[11px] uppercase tracking-[0.34em] text-olive-muted">
          Contamos os dias
        </div>
        <h2 className="mt-2 font-script text-[46px] leading-none text-olive">Contagem Regressiva</h2>
        <div className="mt-3 font-serif text-[12px] uppercase tracking-[0.3em] text-olive-muted">
          até {site.weddingDateLabel}
        </div>

        <div className="mt-[22px] flex items-stretch justify-center border-y border-olive/20 py-5">
          {units.map((u, i) => (
            <div key={u.label} className="flex items-center">
              {i > 0 && <span className="mx-0 w-px self-stretch bg-olive/20" />}
              <div className="flex w-16 flex-col items-center">
                <span className="font-serif text-[42px] italic leading-none text-olive tabular-nums">
                  {u.value}
                </span>
                <span className="mt-[10px] font-serif text-[10px] uppercase tracking-[0.22em] text-olive-muted">
                  {u.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[18px] font-serif text-[20px] tracking-[0.14em] text-olive-body">
          {site.weddingDateShort}
        </div>
      </div>
    </section>
  )
}

function Local() {
  return (
    <section className="bg-cream px-6 pb-[92px] pt-[100px]">
      <div className="relative mx-auto max-w-[360px] rounded-sm border border-olive/25 bg-cream-card px-[30px] pb-[46px] pt-[150px] text-center">
        <img
          src="/assets/chacara-llar-cutout.png"
          alt={site.venue.name}
          className="absolute left-1/2 top-[-54px] w-[250px] -translate-x-1/2 drop-shadow-cutout"
        />
        <div className="font-serif text-[11px] uppercase tracking-[0.36em] text-olive-muted">
          Onde vamos celebrar
        </div>
        <h2 className="mt-3 font-script text-[48px] leading-none text-olive">{site.venue.name}</h2>
        <Ornament className="my-[22px]" />
        <p className="text-[16px] leading-[1.75] text-olive-body">
          {site.venue.addressLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < site.venue.addressLines.length - 1 && <br />}
            </span>
          ))}
        </p>
        <a
          href={site.venue.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block border-b border-olive/50 pb-[5px] font-serif text-[11px] uppercase tracking-[0.26em] text-olive"
        >
          Ver no mapa →
        </a>
      </div>
    </section>
  )
}

function Traje() {
  return (
    <section className="bg-cream-band px-6 pb-[92px] pt-[116px]">
      <div className="relative mx-auto max-w-[360px] rounded-sm border border-olive/25 bg-cream-card px-[30px] pb-[46px] pt-[132px] text-center">
        <img
          src="/assets/dress-code-casal.png"
          alt="Traje"
          className="absolute left-[180px] top-[-45px] w-[322px] -translate-x-1/2 drop-shadow-cutout"
        />
        <div className="font-serif text-[11px] uppercase tracking-[0.36em] text-olive-muted">
          Dress code
        </div>
        <h2 className="mt-3 font-script text-[52px] leading-none text-olive">Traje</h2>
        <Ornament className="my-[22px]" />
        <p className="text-[18px] leading-[1.6] text-olive-body">{site.dressCode.label}</p>
        <p className="mx-auto mt-3 max-w-[290px] text-[14px] italic leading-[1.7] text-olive-muted">
          {site.dressCode.note}
        </p>
      </div>
    </section>
  )
}

function ClosingCta() {
  return (
    <section className="bg-olive px-6 py-[84px] text-center text-cream">
      <div className="font-serif text-[11px] uppercase tracking-[0.34em] text-cream/60">
        Faça parte deste dia
      </div>
      <h2 className="mt-3 font-script text-[46px] leading-none text-cream">Esperamos por você</h2>
      <p className="mx-auto mt-[18px] max-w-[300px] text-[16px] leading-[1.7] text-cream/80">
        Sua presença é o presente mais importante. Confirme sua vinda e, se quiser nos presentear,
        veja nossa lista com carinho.
      </p>
      <div className="mx-auto mt-9 flex w-full max-w-[300px] flex-col gap-[14px]">
        <Link
          to="/confirmar"
          className="block border-none bg-cream px-6 py-4 text-center font-serif text-[13px] font-semibold uppercase tracking-[0.22em] text-olive"
        >
          Confirmar Presença
        </Link>
        <Link
          to="/presentes"
          className="block border border-cream/60 bg-transparent px-6 py-4 text-center font-serif text-[13px] font-semibold uppercase tracking-[0.22em] text-cream"
        >
          Lista de Presentes
        </Link>
      </div>
      <Ornament light className="mt-11" />
      <div className="mt-[22px] font-serif text-[11px] uppercase tracking-[0.3em] text-cream/60">
        {site.couple.line}
      </div>
    </section>
  )
}
