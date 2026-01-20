export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-12">Read me!</h1>

      <div className="space-y-12">
        <section>
          <h3 className="text-xl font-semibold mb-4">˚࿔ about my creations</h3>
          <div className="space-y-4">
            <p>
              Every clay trinket is made with love here in the beautiful
              Auckland, New Zealand 📮 Each piece is carefully sculpted by hand
              using polymer clay, making no two exactly the same. Little quirks
              or marks might appear from the handmade process — but that’s part
              of their charm ♡
            </p>
            <p>
              I’m just one person creating from a small space, so your kindness
              and patience mean so much. Thank you for supporting my work and
              valuing the time that goes into each tiny piece ♡
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">˚࿔ care guide</h3>
          <div className="space-y-4">
            <p>
              Each charm is sealed with UV resin for extra shine and durability,
              but please handle gently — dropping or bending may cause damage.
            </p>
            <ul className="space-y-1">
              <li>
                - Store in a dry, cool place away from direct sunlight to
                prevent yellowing.
              </li>
              <li>
                - To clean, use a soft, damp cloth and lightly wipe the surface
                to bring back that glossy finish ♡
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">˚࿔ shipping & policies</h3>
          <div className="space-y-4">
            <p>
              Orders are sent from Auckland, NZ, and usually take up to a week
              to process before shipping. Delivery times depend on your
              location.
            </p>
            <p>
              Every item is individually handmade; prices reflect the materials,
              design process, and the care that goes into sculpting, curing,
              finishing, and packaging your order.
            </p>
            <p className="text-sm italic pt-2 border-t border-current">
              Note: Once the parcel is handed to the courier, it’s out of my
              control. I can’t be held responsible for postal delays, damage, or
              lost items. Any customs or import fees are the buyer’s
              responsibility.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
