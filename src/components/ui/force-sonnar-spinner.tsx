// components/ui/force-sonner-spinner.tsx

export function ForceSonnerSpinner() {
  return (
    <>
      <style>{`
        @keyframes force-sonner-spin {
          0%   { opacity: 1;    }
          100% { opacity: 0.15; }
        }
        .fs-loading-wrapper {
          --size: 16px;
          height: var(--size);
          width: var(--size);
          position: absolute;
          inset: 0;
          z-index: 10;
        }
        .fs-spinner {
          position: relative;
          top: 50%;
          left: 50%;
          height: var(--size);
          width: var(--size);
          transform: translate(-50%, -50%);
        }
        .fs-bar {
          animation: force-sonner-spin 1.2s linear infinite;
          animation-play-state: running !important;
          background: var(--gray11, hsl(0, 0%, 43.5%));
          border-radius: 6px;
          height: 8%;
          left: -10%;
          position: absolute;
          top: -3.9%;
          width: 24%;
        }
        .fs-bar:nth-child(1)  { animation-delay: -1.2s; transform: rotate(0.0001deg) translate(146%); }
        .fs-bar:nth-child(2)  { animation-delay: -1.1s;  transform: rotate(30deg)    translate(146%); }
        .fs-bar:nth-child(3)  { animation-delay: -1.0s;  transform: rotate(60deg)    translate(146%); }
        .fs-bar:nth-child(4)  { animation-delay: -0.9s;  transform: rotate(90deg)    translate(146%); }
        .fs-bar:nth-child(5)  { animation-delay: -0.8s;  transform: rotate(120deg)   translate(146%); }
        .fs-bar:nth-child(6)  { animation-delay: -0.7s;  transform: rotate(150deg)   translate(146%); }
        .fs-bar:nth-child(7)  { animation-delay: -0.6s;  transform: rotate(180deg)   translate(146%); }
        .fs-bar:nth-child(8)  { animation-delay: -0.5s;  transform: rotate(210deg)   translate(146%); }
        .fs-bar:nth-child(9)  { animation-delay: -0.4s;  transform: rotate(240deg)   translate(146%); }
        .fs-bar:nth-child(10) { animation-delay: -0.3s;  transform: rotate(270deg)   translate(146%); }
        .fs-bar:nth-child(11) { animation-delay: -0.2s;  transform: rotate(300deg)   translate(146%); }
        .fs-bar:nth-child(12) { animation-delay: -0.1s;  transform: rotate(330deg)   translate(146%); }
      `}</style>

      <div className="fs-loading-wrapper">
        <div className="fs-spinner" role="status" aria-label="Loading">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="fs-bar" />
          ))}
        </div>
      </div>
    </>
  );
}
