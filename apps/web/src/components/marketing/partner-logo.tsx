"use client";

/**
 * Partner logos arrive in any format. Transparent ones become a solid ink
 * silhouette; opaque JPEG-style ones would turn into solid boxes, so we sample
 * the real corner pixels and tag the image with data-bg="light" | "dark",
 * which switches to a blend that drops the backdrop (see marketing.css).
 */
function classify(img: HTMLImageElement) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h || img.dataset.bg) return;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    // Copy the true top-left and bottom-right source pixels — downscaling
    // would blend logo pixels into the sample.
    ctx.drawImage(img, 0, 0, 1, 1, 0, 0, 1, 1);
    ctx.drawImage(img, w - 1, h - 1, 1, 1, 1, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 2, 1).data;
    // Opaque only if both opposite corners are solid.
    if (d[3] < 200 || d[7] < 200) return;
    const lum = (0.299 * (d[0] + d[4]) + 0.587 * (d[1] + d[5]) + 0.114 * (d[2] + d[6])) / 2;
    img.dataset.bg = lum > 128 ? "light" : "dark";
  } catch {
    // Decode or cross-origin issue: keep the default silhouette treatment.
  }
}

export function PartnerLogo({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="partner-logo"
      loading="lazy"
      onLoad={(e) => classify(e.currentTarget)}
      // Images that finished loading before hydration never fire onLoad.
      ref={(img) => {
        if (img?.complete) classify(img);
      }}
    />
  );
}
