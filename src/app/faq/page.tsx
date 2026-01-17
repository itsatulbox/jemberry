import Header from "@/components/common/header";
import Navbar from "@/components/common/navbar";

export default function faqPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <Navbar />
      <Header />

      <div className="flex flex-col max-w-3xl mx-auto">
        <h1 className="mx-auto mb-8">Keycap commission FAQ</h1>
        <h3>˚࿔ how to order</h3>
        <p className="my-4">
          ˚࿔ Commission inquiries are handled through Instagram DMs.
          <br />
          ˚࿔ Send me a DM expressing your interest, and I’ll send you a
          commission keycap form to fill out.
          <br />
          ˚࿔ If needed, I can provide a rough sketch so you can visualise your
          keycap before I begin.
          <br />
          ˚࿔ Once the design is approved, I’ll start your order after receiving
          full payment.
          <br />
          <br />
          <span className="font-bold">Turnaround time:</span> around
          <span className="font-bold">2–3 weeks,</span>
          depending on design complexity and my current queue.
          <br />
          Base rates: base price per keycap (1u) is $35NZD, the price can vary
          depending on the design complexity.
        </p>

        <h3>˚࿔ what I can make</h3>
        <p className="my-4">
          ˚࿔ Fictional characters (inspired by Sanrio, Pokémon, Studio Ghibli,
          etc.)
          <br />
          ˚࿔ Animals & pets (cats, dogs, frogs, bunnies, bears, etc.)
          <br />
          ˚࿔ Original characters
        </p>

        <h3>˚࿔ what I don't make</h3>
        <p className="my-4">
          ˚࿔ NSFW / explicit content
          <br />
          ˚࿔ Realistic portraits or hyper-detailed objects
          <br />
          ˚࿔ Logos or branded designs (e.g., Disney, Nike, etc.)
          <br />
          ˚࿔ Political, hateful, or offensive themes
          <br />
          <br />
          Please understand that I reserve the right to respectfully decline any
          request that doesn’t align with my comfort, style, or values.
        </p>

        <h3>˚࿔ payment methods</h3>
        <p className="my-4">
          <span className="font-bold">Local (NZ)</span>
          <br />
          ˚࿔ Bank transfer
          <br />
          ˚࿔ Cash (for pickups in Newmarket, Auckland)
          <span className="font-bold">International</span>
          <br />
          ˚࿔ PayPal
          <br />
          ˚࿔ Wise
        </p>

        <h3>˚࿔ shipping methods</h3>
        <p className="my-4">
          <span className="font-bold">New Zealand orders:</span>
          <br />
          ˚࿔ NZ Post tracked shipping -{" "}
          <span className="font-bold">$8 NZD</span>
          (3-5 business days)
          <br />
          ˚࿔ Local pickup available in Newmarket, Auckland (by arrangement)
          <br />
          <br />
          <span className="font-bold">International orders:</span>
          <br />
          ˚࿔ Standard tracked shipping -{" "}
          <span className="font-bold">$18 - 35 NZD</span>
          (3-10 business days)
          <br />
          Please not that shipping costs are the buyer;s responsibility, and I'm
          not responsible for delays once the parcel has been handed over to the
          courier.
        </p>

        <h3>˚࿔ other notes</h3>
        <p className="my-4">
          <br />
          ˚࿔ All keycaps are handmade, so small imperfections or variations are
          normal and part of their charm!
          <br />
          ˚࿔ I don’t accept returns for custom pieces.
          <br />
          ˚࿔ Feel free to message me anytime for progress updates!
          <br />
          ✨thank you for supporting handmade art and small creators in nz ♡ ˚࿔
        </p>
      </div>
    </div>
  );
}
