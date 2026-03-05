export default function ShieldIcon({ size = 32, pulse = false }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 32 32" fill="none"
      style={pulse ? { filter: "drop-shadow(0 0 8px #10b981)", animation: "pulse 2s ease-in-out infinite" } : {}}
    >
      <path
        d="M16 2L4 7v9c0 7.18 5.16 13.89 12 15.93C22.84 29.89 28 23.18 28 16V7L16 2z"
        fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1.5"
      />
      <path
        d="M12 16l3 3 5-6"
        stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
