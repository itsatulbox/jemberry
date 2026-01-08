import Header from "@/components/common/header";
import Navbar from "@/components/common/navbar";

export default function About() {
  return (
    <div className="w-full flex flex-col items-center">
      <Navbar />
      <Header />

      <div className="flex flex-col max-w-3xl mx-auto" > 
        <h1 className="mx-auto mb-8">Read me!</h1>
        <h3>˚࿔ about my creations</h3>
        <p className="my-4">
          every clay trinket is made with love here in the beautiful Auckland, New
          Zealand 📮 each piece is carefully sculpted by hand using polymer clay,
          making no two exactly the same. little quirks or marks might appear from
          the handmade process — but that’s part of their charm ♡ i’m just one
          person creating from a small space, so your kindness and patience mean
          so much. thank you for supporting my work and valuing the time that goes
          into each tiny piece ♡
        </p>

        <h3>˚࿔ shipping</h3>
        <p className="my-4">
          orders are sent from Auckland, NZ, and usually take up to a week to
          process before shipping. delivery times depend on your location — once
          the parcel is handed to the courier, it’s out of my control. i can’t be
          held responsible for postal delays, damage, or lost items. please make
          sure your shipping info is correct! any customs or import fees are the
          buyer’s responsibility.
        </p>

        <h3>˚࿔ pricing</h3>
        <p className="my-4">
          every item is individually handmade, with attention to detail at every
          step ~ prices reflect the materials, design process, and the care that
          goes into sculpting, curing, finishing, and packaging your order.
        </p>

        <h3>˚࿔ care guide</h3>
        <p className="my-4">
          each charm is sealed with UV resin for extra shine and durability, but
          please handle gently — dropping or bending may cause damage. store in a
          dry, cool place away from direct sunlight to prevent yellowing. to
          clean, use a soft, damp cloth and lightly wipe the surface to bring back
          that glossy finish ♡
        </p>
      </div>
    </div>
  );
}

