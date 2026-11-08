import { ImageResponse } from "next/og";

// Home-screen icon for iPhones and iPads: the same sedan as src/app/icon.svg.
// iOS rounds the corners itself, so the tile is drawn square.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const ACCENT = "#183e78";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ACCENT,
        }}
      >
        <svg width="180" height="180" viewBox="0 0 32 32">
          <path
            fill="#ffffff"
            d="M3 20V17.8Q3 15.9 5 15.5L9.5 14.6 13 11.2Q13.8 10.4 15 10.4H20.2Q21.3 10.4 22.1 11.1L25.6 14.4 27.4 14.9Q29 15.4 29 17.3V20Q29 21.2 27.8 21.2H4.2Q3 21.2 3 20Z"
          />
          <path
            fill={ACCENT}
            d="M11.8 14.3 13.9 12Q14.4 11.6 15 11.6H17.4V14.3ZM18.4 11.6H20Q20.7 11.6 21.2 12.1L23.3 14.3H18.4Z"
          />
          <circle cx="8.6" cy="21.2" r="3.1" fill="#ffffff" stroke={ACCENT} strokeWidth="1.6" />
          <circle cx="23.4" cy="21.2" r="3.1" fill="#ffffff" stroke={ACCENT} strokeWidth="1.6" />
        </svg>
      </div>
    ),
    size,
  );
}
