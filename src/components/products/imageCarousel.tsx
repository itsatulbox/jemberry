"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cdnUrl } from "@/utils/cdnUrl";

export default function ImageCarousel({
  mainImage,
  images,
  alt,
}: {
  mainImage: string | null;
  images: string[];
  alt: string;
}) {
  const main = cdnUrl(mainImage || "/placeholder.jpg");
  const rest = (images || [])
    .filter((img) => img && img !== mainImage)
    .map(cdnUrl);
  const allImages = [main, ...rest];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    allImages.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [allImages.length]);

  const prev = () =>
    setCurrent((i) => (i === 0 ? allImages.length - 1 : i - 1));
  const next = () =>
    setCurrent((i) => (i === allImages.length - 1 ? 0 : i + 1));

  return (
    <div className="w-full md:w-1/2 shrink-0 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {allImages.length > 1 ? (
          <button
            onClick={prev}
            aria-label="Previous image"
            className="shrink-0 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        ) : null}

        <div className="relative aspect-square bg-gray-50 overflow-hidden rounded-lg w-full">
          <Image
            src={allImages[current]}
            alt={alt}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {allImages.length > 1 ? (
          <button
            onClick={next}
            aria-label="Next image"
            className="shrink-0 bg-gray-100 hover:bg-gray-200 rounded-full p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        ) : null}
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
          {allImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative w-16 h-16 shrink-0 rounded-md overflow-hidden border-2 transition ${
                i === current
                  ? "border-black"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt={`${alt} ${i + 1}`}
                className="object-cover"
                fill
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
