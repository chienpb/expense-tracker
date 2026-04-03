import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 256,
  height: 256,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0A0A', // dark mode background (0 0% 4%)
        }}
      >
        {/* A stark, simple minus sign representing an expense. No decoration. */}
        <div
          style={{
            width: '160px',
            height: '32px',
            backgroundColor: '#E62424', // accent red (0 72% 51%)
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
