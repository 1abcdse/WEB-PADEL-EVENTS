"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { Link } from "@/i18n/navigation";
import { dates as allDates } from "@/content/dates";
import { extrasById } from "@/content/extras";
import { formatList, formats } from "@/content/formats";
import { getPack, packsByFormat } from "@/content/packs";
import type { FormatSlug } from "@/content/types";
import {
  bookingSchema,
  FORMAT_MAX,
  LEVELS,
  type BookingData,
  type BookingInput,
} from "@/lib/booking-schema";
import {
  bookingSummary,
  contactRows,
  summaryText,
} from "@/lib/booking-summary";
import {
  formatDateRange,
  formatPrice,
  isBookable,
  tr,
  upcoming,
} from "@/lib/i18n-content";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { Button, ButtonA } from "@/components/ui/Button";
import { FormatBadge, Tag } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { DayCalendar } from "@/components/packs/DayCalendar";
import { ChoiceCard, FieldError, Stepper, TextField } from "./fields";

const STEPS = [
  "format",
  "pack",
  "date",
  "players",
  "extras",
  "contact",
  "summary",
] as const;
type Step = (typeof STEPS)[number];

/** Camps que es validen abans de passar al pas següent */
const STEP_FIELDS: Record<Step, FieldPath<BookingInput>[]> = {
  format: ["format"],
  pack: ["pack", "customHours"],
  date: ["date"],
  players: ["players", "level", "companions"],
  extras: ["extras"],
  contact: ["name", "email", "phone", "comments", "privacy"],
  summary: [],
};

export function BookingWizard() {
  const t = useTranslations();
  const tb = useTranslations("booking");
  const locale = useLocale();
  const params = useSearchParams();
  const topRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const form = useForm<BookingInput, unknown, BookingData>({
    resolver: zodResolver(bookingSchema),
    mode: "onTouched",
    defaultValues: {
      players: 1,
      companions: 0,
      extras: [],
      customHours: 10,
      comments: "",
      website: "",
      locale: locale as BookingInput["locale"],
      privacy: false as unknown as true,
    },
  });
  const {
    register,
    setValue,
    control,
    trigger,
    handleSubmit,
    reset,
    formState,
  } = form;
  const errors = formState.errors;
  const values = useWatch({ control }) as Partial<BookingInput>;
  const format = values.format as FormatSlug | undefined;
  const max = format ? FORMAT_MAX[format] : 30;

  // Pre-omple des de la URL (?format=…&pack=…&date=…), p. ex. des d'una pàgina de pack
  useEffect(() => {
    const f = params.get("format");
    if (!f || !(f in formats)) return;
    setValue("format", f as FormatSlug);
    let start = 1;
    const p = params.get("pack");
    if (p && getPack(f, p)) {
      setValue("pack", p);
      start = 2;
    }
    const d = params.get("date");
    if (
      d &&
      allDates.some((x) => x.id === d && x.format === f && isBookable(x.status))
    ) {
      setValue("date", d);
      if (start === 2) start = 3;
    }
    setStep(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatPacks = useMemo(
    () => (format ? packsByFormat(format) : []),
    [format],
  );
  const formatDates = useMemo(
    () => (format ? upcoming(allDates, format) : []),
    [format],
  );
  const selectedPack =
    format && values.pack ? getPack(format, values.pack) : undefined;
  const availableExtras = selectedPack
    ? selectedPack.extras
    : format
      ? Object.keys(extrasById)
      : [];

  const chooseFormat = (slug: FormatSlug) => {
    if (slug !== format) {
      setValue("pack", "");
      setValue("date", "");
      setValue("extras", []);
      setValue(
        "customHours",
        Math.min(values.customHours ?? 10, FORMAT_MAX[slug]),
      );
    }
    setValue("format", slug, { shouldValidate: true });
  };

  const go = (to: number) => {
    setStep(to);
    requestAnimationFrame(() =>
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const next = async () => {
    const ok = await trigger(STEP_FIELDS[STEPS[step]!]);
    if (ok) go(step + 1);
  };

  const onSubmit = async (data: BookingData) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/sollicitud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "booking", ...data }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  const summary = bookingSummary(values, locale, t);
  const whatsappMessage = `${tb("whatsappIntro")}\n\n${summaryText([...summary, ...contactRows(values, t)])}`;

  if (status === "sent") {
    return (
      <div
        className="lime-stripe overflow-hidden rounded-brand bg-ink p-8 text-paper sm:p-12"
        role="status"
      >
        <span className="skew-box inline-flex h-16 w-16 items-center justify-center rounded-[4px] bg-lime text-ink">
          <Icon name="check" className="h-9 w-9" />
        </span>
        <h2 className="mt-8 text-h2 font-black italic">{tb("successTitle")}</h2>
        <p className="mt-4 max-w-lg text-paper/80">
          {tb("successText", { name: values.name ?? "" })}
        </p>
        <Button
          className="mt-10"
          variant="secondary"
          icon={null}
          onClick={() => {
            reset();
            setStatus("idle");
            go(0);
          }}
        >
          {tb("successAgain")}
        </Button>
      </div>
    );
  }

  const current = STEPS[step]!;

  return (
    <div ref={topRef} className="scroll-mt-28">
      {/* Progrés */}
      <div className="mb-8">
        <p className="eyebrow text-ink/60">
          {tb("stepOf", { current: Math.min(step + 1, 6), total: 6 })}
        </p>
        <ol
          className="mt-3 grid grid-cols-7 gap-1.5"
          aria-label={tb("stepOf", { current: step + 1, total: STEPS.length })}
        >
          {STEPS.map((s, i) => (
            <li key={s} className="min-w-0">
              <button
                type="button"
                disabled={i > step}
                onClick={() => go(i)}
                aria-current={i === step ? "step" : undefined}
                aria-label={tb(`steps.${s}`)}
                className="block w-full text-left disabled:cursor-default"
              >
                <span
                  className={cn(
                    "skew-box block h-2 rounded-[2px]",
                    i < step
                      ? "bg-ink"
                      : i === step
                        ? "bg-lime ring-1 ring-ink"
                        : "bg-ink/15",
                  )}
                />
                <span
                  className={cn(
                    "mt-2 hidden truncate font-display text-[0.65rem] font-bold uppercase tracking-[0.12em] sm:block",
                    i === step ? "text-ink" : "text-ink/60",
                  )}
                >
                  {tb(`steps.${s}`)}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-brand bg-stone p-5 sm:p-8 lg:p-10"
      >
        {/* Parany anti-spam (ocult per a humans) */}
        <div className="absolute left-[-9999px]" aria-hidden="true">
          <label>
            Website{" "}
            <input tabIndex={-1} autoComplete="off" {...register("website")} />
          </label>
        </div>

        {/* Només animació d'entrada: cada pas és un fieldset nou (key) */}
        <motion.fieldset
          key={current}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22 }}
          className="min-w-0"
        >
          {/* 1. Format */}
          {current === "format" && (
            <>
              <legend className="mb-6 font-display text-h3 font-black uppercase italic">
                {tb("formatQuestion")}
              </legend>
              <div className="grid gap-4 md:grid-cols-2">
                {formatList.map((f) => (
                  <ChoiceCard
                    key={f.slug}
                    type="radio"
                    name="format"
                    value={f.slug}
                    checked={format === f.slug}
                    onChange={() => chooseFormat(f.slug)}
                  >
                    <FormatBadge
                      format={f.slug}
                      label={tr(f.badge, locale)}
                      className="self-start"
                      onDark={false}
                    />
                    <span className="mt-5 font-display text-5xl font-black italic">
                      {f.maxHours}h{" "}
                      <span className="eyebrow !text-[0.65rem] not-italic text-ink/65">
                        {t("home.formats.max")}
                      </span>
                    </span>
                    <span className="mt-3 font-display text-lg font-extrabold uppercase">
                      {tr(f.name, locale)}
                    </span>
                    <span className="mt-1 text-sm text-ink/70">
                      {tr(f.tagline, locale)}
                    </span>
                    <span className="mt-5 rounded-[4px] bg-ink p-2 [&_li]:h-8 [&_li]:w-9 [&_li]:text-[0.65rem]">
                      <DayCalendar active={f.days} />
                    </span>
                  </ChoiceCard>
                ))}
              </div>
              <FieldError id="format-error" error={errors.format?.message} />
            </>
          )}

          {/* 2. Pack o hores personalitzades */}
          {current === "pack" && format && (
            <>
              <legend className="mb-6 font-display text-h3 font-black uppercase italic">
                {tb("packQuestion")}
              </legend>
              <div className="grid gap-4 md:grid-cols-2">
                {formatPacks.map((p) => (
                  <ChoiceCard
                    key={p.slug}
                    type="radio"
                    name="pack"
                    value={p.slug}
                    checked={values.pack === p.slug}
                    onChange={() =>
                      setValue("pack", p.slug, { shouldValidate: true })
                    }
                  >
                    <span className="flex items-baseline gap-3 pr-8">
                      <span className="font-display text-4xl font-black italic">
                        {p.hours}h
                      </span>
                      <span className="font-display text-lg font-extrabold uppercase">
                        {p.name}
                      </span>
                    </span>
                    <span className="mt-2 text-sm text-ink/70">
                      {tr(p.tagline, locale)}
                    </span>
                    <span className="mt-4 text-sm">
                      <span className="text-ink/65">{t("common.from")} </span>
                      <span className="font-display font-bold">
                        {formatPrice(p.priceFrom, locale)}
                      </span>
                      {p.featured && (
                        <Tag tone="ink" className="ml-3">
                          {t("common.featured")}
                        </Tag>
                      )}
                    </span>
                  </ChoiceCard>
                ))}
                <ChoiceCard
                  type="radio"
                  name="pack"
                  value="custom"
                  checked={values.pack === "custom"}
                  onChange={() =>
                    setValue("pack", "custom", { shouldValidate: true })
                  }
                >
                  <span className="font-display text-lg font-extrabold uppercase">
                    {tb("customPack")}
                  </span>
                  <span className="mt-2 text-sm text-ink/70">
                    {tb("customPackText")}
                  </span>
                </ChoiceCard>
              </div>
              {values.pack === "custom" && (
                <div className="mt-6 rounded-brand bg-paper p-5">
                  <label
                    htmlFor="customHours"
                    className="font-display text-lg font-extrabold uppercase"
                  >
                    {tb("customHours", { count: values.customHours ?? 0 })}
                  </label>
                  <input
                    id="customHours"
                    type="range"
                    min={2}
                    max={max}
                    step={1}
                    className="mt-4 w-full accent-ink"
                    aria-describedby="customHours-help"
                    {...register("customHours", { valueAsNumber: true })}
                  />
                  <div
                    className="mt-1 flex justify-between text-xs text-ink/65"
                    aria-hidden="true"
                  >
                    <span>2h</span>
                    <span>{max}h</span>
                  </div>
                  <p id="customHours-help" className="mt-2 text-sm text-ink/70">
                    {tb("customHoursHelp", { max })}
                  </p>
                  <FieldError
                    id="customHours-error"
                    error={errors.customHours?.message}
                  />
                </div>
              )}
              <FieldError id="pack-error" error={errors.pack?.message} />
            </>
          )}

          {/* 3. Data */}
          {current === "date" && format && (
            <>
              <legend className="mb-6 font-display text-h3 font-black uppercase italic">
                {tb("dateQuestion")}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {formatDates.map((d) => {
                  const disabled = !isBookable(d.status);
                  return (
                    <ChoiceCard
                      key={d.id}
                      type="radio"
                      name="date"
                      value={d.id}
                      disabled={disabled}
                      checked={values.date === d.id}
                      onChange={() =>
                        setValue("date", d.id, { shouldValidate: true })
                      }
                    >
                      <span className="pr-8 font-display text-lg font-extrabold uppercase">
                        {formatDateRange(d, locale)}
                      </span>
                      {d.note && (
                        <span className="mt-1 text-sm text-ink/70">
                          {tr(d.note, locale)}
                        </span>
                      )}
                      <span className="mt-3">
                        <Tag
                          tone={
                            d.status === "disponible"
                              ? "lime"
                              : d.status === "poques-places"
                                ? "ink"
                                : "outline"
                          }
                        >
                          {t(`common.status.${d.status}`)}
                        </Tag>
                      </span>
                    </ChoiceCard>
                  );
                })}
                <ChoiceCard
                  type="radio"
                  name="date"
                  value="flexible"
                  checked={values.date === "flexible"}
                  onChange={() =>
                    setValue("date", "flexible", { shouldValidate: true })
                  }
                >
                  <span className="pr-8 font-display text-lg font-extrabold uppercase">
                    {tb("flexible")}
                  </span>
                </ChoiceCard>
              </div>
              <FieldError id="date-error" error={errors.date?.message} />
            </>
          )}

          {/* 4. Jugadors, nivell i acompanyants */}
          {current === "players" && (
            <>
              <legend className="mb-6 font-display text-h3 font-black uppercase italic">
                {tb("playersQuestion")}
              </legend>
              <div className="grid gap-8 sm:grid-cols-2">
                <Stepper
                  id="players"
                  label={tb("players")}
                  value={values.players ?? 1}
                  min={1}
                  max={12}
                  onChange={(v) =>
                    setValue("players", v, { shouldValidate: true })
                  }
                  error={errors.players?.message}
                />
                <Stepper
                  id="companions"
                  label={tb("companions")}
                  value={values.companions ?? 0}
                  min={0}
                  max={10}
                  onChange={(v) => setValue("companions", v)}
                />
              </div>
              <p className="mb-3 mt-10 text-sm font-semibold">{tb("level")}</p>
              <div
                className="grid grid-cols-2 gap-3 md:grid-cols-4"
                role="radiogroup"
                aria-label={tb("level")}
              >
                {LEVELS.map((l) => (
                  <ChoiceCard
                    key={l}
                    type="radio"
                    name="level"
                    value={l}
                    checked={values.level === l}
                    onChange={() =>
                      setValue("level", l, { shouldValidate: true })
                    }
                  >
                    <span className="pr-8 font-display font-extrabold uppercase">
                      {t(`common.levels.${l}`)}
                    </span>
                  </ChoiceCard>
                ))}
              </div>
              <FieldError id="level-error" error={errors.level?.message} />
            </>
          )}

          {/* 5. Extres */}
          {current === "extras" && (
            <>
              <legend className="mb-6 font-display text-h3 font-black uppercase italic">
                {tb("extrasQuestion")}
              </legend>
              {availableExtras.length === 0 ? (
                <p>{tb("noExtras")}</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {availableExtras.map((id) => {
                    const extra = extrasById[id]!;
                    const checked = values.extras?.includes(id) ?? false;
                    return (
                      <ChoiceCard
                        key={id}
                        type="checkbox"
                        value={id}
                        checked={checked}
                        onChange={() =>
                          setValue(
                            "extras",
                            checked
                              ? (values.extras ?? []).filter((e) => e !== id)
                              : [...(values.extras ?? []), id],
                          )
                        }
                      >
                        <span className="pr-8 font-display font-extrabold uppercase">
                          {tr(extra.name, locale)}
                        </span>
                        <span className="mt-1 text-sm text-ink/70">
                          {tr(extra.description, locale)}
                        </span>
                        <span className="mt-3 text-xs text-ink/60">
                          {extra.price === null
                            ? t("common.onRequest")
                            : formatPrice(extra.price, locale)}{" "}
                          · {tr(extra.unit, locale)}
                        </span>
                      </ChoiceCard>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* 6. Dades de contacte */}
          {current === "contact" && (
            <>
              <legend className="mb-6 font-display text-h3 font-black uppercase italic">
                {tb("contactQuestion")}
              </legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  id="name"
                  label={tb("name")}
                  autoComplete="name"
                  error={errors.name?.message}
                  className="sm:col-span-2"
                  {...register("name")}
                />
                <TextField
                  id="email"
                  type="email"
                  label={tb("email")}
                  autoComplete="email"
                  inputMode="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <TextField
                  id="phone"
                  type="tel"
                  label={tb("phone")}
                  autoComplete="tel"
                  inputMode="tel"
                  error={errors.phone?.message}
                  {...register("phone")}
                />
                <TextField
                  id="comments"
                  textarea
                  label={tb("comments")}
                  error={errors.comments?.message}
                  className="sm:col-span-2"
                  {...register("comments")}
                />
              </div>
              <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-ink"
                  aria-describedby="privacy-error"
                  {...register("privacy")}
                />
                <span>
                  {tb.rich("privacy", {
                    link: (chunks) => (
                      <Link
                        href="/legal/privacitat"
                        target="_blank"
                        className="font-semibold underline underline-offset-2"
                      >
                        {chunks}
                      </Link>
                    ),
                  })}
                </span>
              </label>
              <FieldError id="privacy-error" error={errors.privacy?.message} />
            </>
          )}

          {/* Resum final */}
          {current === "summary" && (
            <>
              <legend className="mb-6 font-display text-h3 font-black uppercase italic">
                {tb("summaryTitle")}
              </legend>
              <dl className="divide-y divide-ink/10 overflow-hidden rounded-brand bg-paper">
                {[...summary, ...contactRows(values, t)].map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-5 py-3.5 text-sm"
                  >
                    <dt className="text-ink/60">{row.label}</dt>
                    <dd className="whitespace-pre-wrap break-words font-semibold">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {status === "error" && (
                <p
                  role="alert"
                  className="mt-5 rounded-brand bg-[#FFF1E6] p-4 text-sm font-medium text-[#9A3412]"
                >
                  {tb("error")}
                </p>
              )}
            </>
          )}
        </motion.fieldset>

        {/* Navegació */}
        <div className="mt-10 flex flex-col-reverse gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => go(step - 1)}
              className="inline-flex items-center gap-2 self-start font-display text-xs font-bold uppercase tracking-[0.14em] text-ink/70 hover:text-ink"
            >
              <Icon name="arrowLeft" className="h-4 w-4" /> {tb("back")}
            </button>
          ) : (
            <span />
          )}
          {current === "summary" ? (
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <ButtonA
                href={whatsappUrl(whatsappMessage)}
                variant="outline-ink"
                icon={null}
                iconStart="whatsapp"
              >
                {tb("orWhatsapp")}
              </ButtonA>
              <Button
                type="submit"
                variant="ink"
                size="lg"
                disabled={status === "sending"}
              >
                {status === "sending" ? tb("sending") : tb("send")}
              </Button>
            </div>
          ) : (
            <Button
              variant="ink"
              size="lg"
              onClick={next}
              className="w-full sm:w-auto"
            >
              {tb("next")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
