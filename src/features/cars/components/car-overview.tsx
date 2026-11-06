import { carCopy } from "../copy";
import { formatKilometres } from "../presentation";
import type { Language } from "@/lib/i18n/language";
import type { Car } from "../types";

export function CarOverview({
  car,
  language,
}: {
  car: Car;
  language: Language;
}) {
  const copy = carCopy[language];
  const facts = [
    [copy.year, String(car.year)],
    [copy.fuel, copy[car.fuel]],
    [copy.mileage, `${formatKilometres(car.kilometres)} ${copy.km}`],
    [copy.variant, car.variant],
    [copy.type, car.type === "New" ? copy.newCars : copy.usedCars],
    [copy.stockId, car.stockId],
    ...(car.type === "Used"
      ? [
          [copy.owners, car.owners ? String(car.owners) : copy.notProvided],
          [copy.registration, car.registrationMasked || copy.notProvided],
        ]
      : []),
  ];

  return (
    <section id="overview" className="scroll-mt-8">
      <p className="eyebrow">{copy.detailsLabel}</p>
      <h2 className="mt-3 text-2xl font-medium tracking-tight">
        {copy.detailsTitle}
      </h2>
      {car.description && (
        <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-muted">
          {car.description}
        </p>
      )}
      <dl className="mt-7 grid grid-cols-2 border-t border-line sm:grid-cols-3">
        {facts.map(([label, value]) => (
          <div key={label} className="border-b border-line py-5 pr-4">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="mt-2 text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      {!!car.colours?.length && (
        <p className="mt-6 text-sm">
          <strong>{language === "hi" ? "रंग" : "Colours"}:</strong>{" "}
          {car.colours.join(", ")}
        </p>
      )}
      {!!car.specifications?.length && (
        <dl className="mt-6 divide-y divide-line">
          {car.specifications.map((spec, index) => (
            <div
              key={index}
              className="flex justify-between gap-6 py-3 text-sm"
            >
              <dt className="text-muted">{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-5 text-xs leading-6 text-muted">{copy.specsNote}</p>
    </section>
  );
}
