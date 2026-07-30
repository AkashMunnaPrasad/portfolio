import { QRCodeCanvas } from 'qrcode.react';

interface QrCodeProps {
  url: string;
  title: string;
}

export default function QrCode({ url, title }: QrCodeProps) {
  return (
    <div className="hidden xl:flex fixed left-6 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-2 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-glass)] backdrop-blur-lg shadow-[var(--shadow-card)]">
      <div className="rounded-lg overflow-hidden bg-white p-1.5">
        <QRCodeCanvas
          value={url}
          size={100}
          bgColor="#ffffff"
          fgColor="#000000"
          level="M"
        />
      </div>
      <span className="text-[0.55rem] font-bold uppercase tracking-widest text-[var(--text-muted)] text-center leading-tight">
        Scan to view
        <br />
        on mobile
      </span>
      <span className="text-[0.45rem] text-[var(--text-muted)] text-center truncate max-w-[110px]">
        {title}
      </span>
    </div>
  );
}
