import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./LogoPage.css";

function LogoPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="logo-page">
      <video className="bg-video" autoPlay muted loop playsInline>
        <source src="/bgv.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default LogoPage;