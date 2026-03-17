import type { MetricItem } from "@/shared/types/site";
import styles from "@/shared/components/metricGrid.module.css";

interface MetricGridProps {
  items: MetricItem[];
}

export function MetricGrid({ items }: MetricGridProps) {
  return (
    <section className={styles.grid} aria-label="Metricas destacadas">
      {items.map((item, index) => (
        <article className={styles.card} key={`${item.label}-${item.value}-${index}`}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </article>
      ))}
    </section>
  );
}
