import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeaturedTools from "../components/FeaturedTools";
import Services from "../components/Services";
import Announcements from "../components/Announcements";
import Footer from "../components/Footer";
import InvoiceGuide from "../components/InvoiceGuide";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Announcements />
      <InvoiceGuide />  
      <FeaturedTools />
      <Services />
      <Footer />
    </>
  );
}

export default Home;