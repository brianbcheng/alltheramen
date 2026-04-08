import RamenExplorer from "@/components/RamenExplorer";

export default function Home() {
  return (
    <main>
      <h1 className="sr-only">
        Infinite Ramen — Explore 5,000+ Instant Noodles from Around the World
      </h1>
      <div className="sr-only" role="doc-subtitle">
        <p>
          Browse, filter, and explore an interactive grid of over 5,000 instant
          ramen and noodle products from every corner of the globe. Search by
          brand, country, flavor profile, or star rating to discover your next
          favorite bowl.
        </p>
      </div>
      <RamenExplorer />
    </main>
  );
}
