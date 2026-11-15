import { Link } from "react-router-dom";

function Logo() {
  return (
    <Link to="/" className="lp-logo">
      <svg
        viewBox="0 0 32 32"
        width="28"
        height="28"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="32" height="32" rx="8" fill="#2563eb" />
        <path
          d="M9 22c0-5 3-6 7-6s7-1 7-6M9 22h.01M23 10h.01"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span>Ruta Académica</span>
    </Link>
  );
}

export default Logo;
