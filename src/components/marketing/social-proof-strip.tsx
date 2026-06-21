const stats = [
  { metric: "200+", label: "startups structured", color: "bg-[#f4d66f]/55" },
  { metric: "$80M+", label: "deals supported", color: "bg-[#a9ddc3]/55" },
  { metric: "3", label: "countries covered", color: "bg-[#a7c8ed]/55" },
  { metric: "4.9/5", label: "founder satisfaction", color: "bg-[#f3b2a4]/55" },
];

export default function SocialProofStrip() {
  return (
    <section className="border-y border-[#17211b]/15 bg-white px-4 py-8 sm:px-6" aria-label="Orion by the numbers">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className={`${item.color} rounded-2xl border border-[#17211b]/15 px-4 py-5 text-center`}>
            <p className="display-type text-3xl tabular-nums sm:text-4xl">{item.metric}</p>
            <p className="mt-1 text-sm font-bold">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
