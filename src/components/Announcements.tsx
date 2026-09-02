import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ReceiptText,
  FileText,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import "./Announcements.css";

type Slide = {
  id: string;
  status: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonPath?: string;
  icon: LucideIcon;
};

const slides: Slide[] = [
  {
    id: "gst-invoice",
    status: "NOW LIVE",
    title: "GST Invoice Generator",
    description:
      "Create professional GST invoices quickly with Noorado's easy-to-use GST Invoice Generator.",
    buttonText: "Create Invoice →",
    buttonPath: "/tools/gst-invoice-generator",
    icon: ReceiptText,
  },
  {
    id: "hr-letter-generator",
    status: "COMING SOON",
    title: "Noorado HR Letter Generator",
    description:
      "Create professional HR letters including Offer Letters, Appointment Letters, Experience Letters, and Relieving Letters.",
    icon: FileText,
  },
  {
    id: "announcements",
    status: "ANNOUNCEMENTS",
    title: "Latest from Noorado",
    description:
      "New releases, product improvements and important updates from the Noorado platform will appear here.",
    icon: Megaphone,
  },
];

function Announcements() {
  const [activeSlide, setActiveSlide] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goToNext = () => {
    setActiveSlide((current) =>
      current === slides.length - 1 ? 0 : current + 1
    );
  };

  const goToPrevious = () => {
    setActiveSlide((current) =>
      current === 0 ? slides.length - 1 : current - 1
    );
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) =>
        current === slides.length - 1 ? 0 : current + 1
      );
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    touchStartX.current =
      event.touches[0]?.clientX ?? null;

    touchStartY.current =
      event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return;
    }

    const touchEndX =
      event.changedTouches[0]?.clientX ??
      touchStartX.current;

    const touchEndY =
      event.changedTouches[0]?.clientY ??
      touchStartY.current;

    const deltaX =
      touchEndX - touchStartX.current;

    const deltaY =
      touchEndY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (
      Math.abs(deltaX) < 45 ||
      Math.abs(deltaX) <= Math.abs(deltaY)
    ) {
      return;
    }

    if (deltaX < 0) {
      goToNext();
    } else {
      goToPrevious();
    }
  };

  return (
    <section
      id="announcements"
      className="announcements"
      aria-labelledby="announcements-title"
    >
      <div className="announcements-container">

        {/* HEADER */}
        <div className="announcements-header">
          <span>NOORADO</span>

          <h2 id="announcements-title">
            What's new
          </h2>

          <p>
            Explore what is live, what we are building,
            and what's happening at Noorado.
          </p>
        </div>


        {/* CAROUSEL */}
        <div
          className="announcements-carousel"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="announcements-viewport">
            <div
              className="announcements-track"
              style={{
                transform: `translateX(-${
                  activeSlide * 100
                }%)`,
              }}
            >
              {slides.map((slide, index) => {
                const SlideIcon = slide.icon;

                return (
                  <article
                    className="announcements-slide"
                    key={slide.id}
                  >
                    <div className="announcements-slide-inner">

                      {/* ICON */}
                      <div className="announcements-slide-icon">
                        <SlideIcon
                          size={26}
                          strokeWidth={2}
                        />
                      </div>


                      {/* STATUS */}
                      <div className="announcements-status">
                        <span className="announcements-status-dot" />
                        {slide.status}
                      </div>


                      {/* CONTENT */}
                      <div className="announcements-slide-content">

                        <h3>
                          {slide.title}
                        </h3>

                        <p>
                          {slide.description}
                        </p>

                        {slide.buttonText &&
                          slide.buttonPath && (
                            <Link
                              to={slide.buttonPath}
                              className="announcements-link"
                            >
                              {slide.buttonText}
                            </Link>
                          )}

                      </div>


                      {/* NUMBER */}
                      <div className="announcements-slide-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>


        {/* DOTS */}
        <div
          className="announcements-dots"
          aria-label="Announcement slides"
        >
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.id}
              className={`announcements-dot-button ${
                activeSlide === index ? "active" : ""
              }`}
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to ${slide.status} slide`}
              aria-current={
                activeSlide === index
                  ? "true"
                  : undefined
              }
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default Announcements;