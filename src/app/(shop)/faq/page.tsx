export default function FAQ() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-12">Keycap commission FAQ</h1>

      <div className="space-y-12">
        <section>
          <h3 className="text-xl font-semibold mb-4">˚࿔ how to order & rates</h3>
          <div className="space-y-4">
            <p>Commission inquiries are handled through Instagram DMs. Send me a DM expressing interest, and I’ll send you a form to fill out.</p>
            <p>I can provide a rough sketch to help you visualise the design. Once approved, I begin after receiving full payment.</p>
            <div className="pt-2">
              <p><strong>Turnaround time:</strong> 2–3 weeks (depending on queue).</p>
              <p><strong>Base rates:</strong> $35 NZD (1u); varies by complexity.</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section>
            <h3 className="text-xl font-semibold mb-4">˚࿔ what i make</h3>
            <ul className="space-y-1">
              <li>- Fictional characters (Sanrio, Pokémon, etc.)</li>
              <li>- Animals & pets</li>
              <li>- Original characters</li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-semibold mb-4">˚࿔ what i don't make</h3>
            <ul className="space-y-1">
              <li>- NSFW / explicit content</li>
              <li>- Realistic portraits</li>
              <li>- Logos or branded designs</li>
            </ul>
          </section>
        </div>

        <section>
          <h3 className="text-xl font-semibold mb-4">˚࿔ shipping & payment</h3>
          <div className="space-y-4">
            <p><strong>Local (NZ):</strong> Bank transfer or Cash. $8 Tracked shipping (3-5 days) or pickup in Newmarket.</p>
            <p><strong>International:</strong> PayPal or Wise. $18 - $35 Tracked shipping (3-10 days).</p>
            <p className="text-sm italic pt-2 border-t border-current">
              Note: Shipping costs are the buyer's responsibility. I am not responsible for courier delays.
            </p>
          </div>
        </section>

        <section className="space-y-2 pt-4">
          <p>All keycaps are handmade; small variations are normal and part of their charm!</p>
          <p>I don’t accept returns for custom pieces. Feel free to message for progress updates.</p>
          <p className="pt-8 font-medium italic">✨ thank you for supporting handmade art and small creators in nz ♡</p>
        </section>
      </div>
    </div>
  );
}
