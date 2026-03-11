import { Link } from "react-router-dom";

const BrandLogo = ({ compact = false }) => {
  return (
    <Link to="/" className={`brand-logo${compact ? " brand-logo--compact" : ""}`} aria-label="Full Count 홈">
      <span className="brand-logo__mark" aria-hidden="true">
        <span className="brand-logo__stitch brand-logo__stitch--left" />
        <span className="brand-logo__stitch brand-logo__stitch--right" />
        <span className="brand-logo__seam" />
      </span>
      <span className="brand-logo__text">
        <strong>Full Count</strong>
        <span>MLB Live Relay</span>
      </span>
    </Link>
  );
};

export default BrandLogo;
