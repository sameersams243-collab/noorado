import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeaturedTools from "../components/FeaturedTools";
import WhyChooseUs from "../components/WhyChooseUs";
import Services from "../components/Services";
import Stats from "../components/Stats";
import Contact from "../components/Contact";
import Footer from "../components/Footer";



function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedTools />
      <WhyChooseUs />
      <Services />
      <Stats />
      <Contact />
      <Footer />
    </>
  );
}

export default Home;