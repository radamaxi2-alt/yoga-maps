"use client";

function formatGCalDate(dateString: string, addHours = 1) {
  const d = new Date(dateString);
  const end = new Date(d.getTime() + addHours * 60 * 60 * 1000);
  
  const fmt = (dt: Date) => dt.toISOString().replace(/-|:|\.\d\d\d/g, "");
  return `${fmt(d)}/${fmt(end)}`;
}

export default function CalendarButton({
  title,
  scheduledAt,
  description,
  location,
}: {
  title: string;
  scheduledAt: string;
  description: string;
  location?: string;
}) {
  const dates = formatGCalDate(scheduledAt);
  const details = encodeURIComponent(description || "Clase de yoga reservada vía Yoga Maps.");
  const text = encodeURIComponent(`🧘 ${title}`);
  const loc = encodeURIComponent(location || "Yoga Maps Online");

  const href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${loc}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/60 bg-surface-alt/50 px-3 py-1.5 text-xs font-medium text-foreground/70 transition-all hover:bg-brand-50 hover:text-brand-700 dark:border-brand-800/50 dark:bg-surface-dark-alt/50 dark:hover:bg-brand-900/30 dark:hover:text-brand-300"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Añadir al calendario
    </a>
  );
}
