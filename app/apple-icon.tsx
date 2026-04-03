import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0A0A',
        }}
      >
        <div
          style={{
            width: '112px',
            height: '24px',
            backgroundColor: '#E62424',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
