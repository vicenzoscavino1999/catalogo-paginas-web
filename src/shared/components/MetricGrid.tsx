import type { MetricItem } from "@/shared/types/site";

interface MetricGridProps {
  items: MetricItem[];
}

export function MetricGrid({ items }: MetricGridProps) {
  return (
    <section className="metric-grid" aria-label="Metricas destacadas">
      {items.map((item, index) => (
        <article className="metric-card" key={`${item.label}-${item.value}-${index}`}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </article>
      ))}
    </section>
  );
}
