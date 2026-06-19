const stats = [
  { metric: "200+", label: "startups structured", color: "bg-[#ffd84d]", tilt: "rotate-[-2deg]" },
  { metric: "$80M+", label: "deals supported", color: "bg-[#9ee8c2]", tilt: "rotate-1" },
  { metric: "3", label: "countries covered", color: "bg-[#84b6f4]", tilt: "rotate-[-1deg]" },
  { metric: "4.9/5", label: "founder happiness", color: "bg-[#ff9c87]", tilt: "rotate-2" },
];

export default function SocialProofStrip() {
  return (
    <section className="border-y-2 border-[#17211b] bg-white px-4 py-8 sm:px-6" aria-label="Orion by the numbers">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className={`${item.color} ${item.tilt} rounded-2xl border-2 border-[#17211b] px-4 py-5 text-center shadow-[3px_3px_0_#17211b]`}>
            <p className="display-type text-3xl tabular-nums sm:text-4xl">{item.metric}</p>
            <p className="mt-1 text-sm font-bold">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
