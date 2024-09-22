import FAQs from "@/components/FAQs";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Macbook from "@/components/Macbook";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
    <Navbar />
    <Hero />
    <Features />
    <Macbook />
    <FAQs />
    <Footer />
    </>
  );
}
