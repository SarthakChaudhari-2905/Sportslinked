import clsx from "clsx";
import logoLight from "../../assets/sportslinked-logo-transparent.png"; // for light backgrounds
import logoDark from "../../assets/sportslinked-logo-dark.png"; // for dark backgrounds

// The PNG is 623x201 and already contains the wordmark + tagline.
// size    = rendered height of the full logo in px
// dark    = use the white-text version (for dark panels)
// withText=false -> show only the ring mark (used for the faint watermark)
export default function Logo({ size = 40, dark = false, withText = true, className }) {
  const src = dark ? logoDark : logoLight;

  if (!withText) {
    // crop to the ring mark only (x≈20–185, y≈35–170 of the 623x201 image)
    const scale = size / 135;
    return (
      <div
        className={clsx("relative shrink-0 overflow-hidden", className)}
        style={{ width: 175 * scale, height: size }}
        aria-hidden
      >
        <img
          src={src}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            maxWidth: "none",
            height: 201 * scale,
            left: -15 * scale,
            top: -33 * scale,
          }}
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="SportsLinked"
      draggable={false}
      className={clsx("w-auto select-none", className)}
      style={{ height: size }}
    />
  );
}