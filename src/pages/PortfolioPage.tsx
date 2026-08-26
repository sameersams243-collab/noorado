import Navbar from "../components/Navbar";
import PortfolioHero from "../components/PortfolioHero";
import PortfolioFilter from "../components/PortfolioFilter";
import PortfolioGrid from "../components/PortfolioGrid";
import Footer from "../components/Footer";
import "../styles/PortfolioPage.css";

function PortfolioPage() {
  return (
    <>
      <Navbar />
      <PortfolioHero />
      <PortfolioFilter />
      <PortfolioGrid />
      <Footer />
    </>
  );
}

export default PortfolioPage;