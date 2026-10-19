"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "@/i18n/navigation";
import {
  contactSchema,
  type ContactData,
  type ContactInput,
} from "@/lib/booking-schema";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FieldError, TextField } from "./fields";

/** Formulari de contacte curt */
export function ContactForm() {
  const t = useTranslations("contact");
  const tb = useTranslations("booking");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const { register, handleSubmit, reset, formState } = useForm<
    ContactInput,
    unknown,
    ContactData
  >({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: {
      locale: locale as ContactInput["locale"],
      website: "",
      privacy: false as unknown as true,
    },
  });
  const errors = formState.errors;

  const onSubmit = async (data: ContactData) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/sollicitud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "contact", ...data }),
      });
      if (res.ok) {
        setStatus("sent");
        reset();
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-5 sm:grid-cols-2"
    >
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label>
          Website{" "}
          <input tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>
      <TextField
        id="c-name"
        label={tb("name")}
        autoComplete="name"
        error={errors.name?.message}
        className="sm:col-span-2"
        {...register("name")}
      />
      <TextField
        id="c-email"
        type="email"
        label={tb("email")}
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <TextField
        id="c-phone"
        type="tel"
        label={tb("phone")}
        autoComplete="tel"
        error={errors.phone?.message}
        {...register("phone")}
      />
      <TextField
        id="c-subject"
        label={t("subject")}
        error={errors.subject?.message}
        className="sm:col-span-2"
        {...register("subject")}
      />
      <TextField
        id="c-message"
        textarea
        label={t("message")}
        error={errors.comments?.message}
        className="sm:col-span-2"
        {...register("comments")}
      />
      <div className="sm:col-span-2">
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 accent-ink"
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
        <FieldError id="c-privacy-error" error={errors.privacy?.message} />
      </div>
      <div
        className="flex flex-wrap items-center gap-4 sm:col-span-2"
        aria-live="polite"
      >
        <Button
          type="submit"
          variant="ink"
          size="lg"
          disabled={status === "sending"}
        >
          {status === "sending" ? t("sending") : t("send")}
        </Button>
        {status === "sent" && (
          <p className="flex items-center gap-2 font-semibold">
            <Icon name="check" className="h-5 w-5" /> {t("success")}
          </p>
        )}
        {status === "error" && (
          <p className="font-medium text-[#9A3412]">{t("error")}</p>
        )}
      </div>
    </form>
  );
}
