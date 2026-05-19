import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles.css";
import "./styles-dark.css";
import {
  getAdminSession,
  isSupabaseConfigured,
  loadAdminReviews,
  loadPublicContent,
  signInAdmin,
  signOutAdmin,
  submitVisitorReview,
  updateReviewStatus,
  uploadGalleryPhoto,
} from "./supabaseClient";

gsap.registerPlugin(ScrollTrigger);

const PHONE_DISPLAY = "052-8804065";
const PHONE_LINK = "972528804065";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "היי אופק, הגעתי מהאתר ואשמח לשמוע פרטים על צילום לאירוע."
);

const PRELOADER_VIDEO = "/assets/pre_loading.mp4";
const HERO_VIDEO = "/assets/hero-scroll-video.mp4";

const fallbackGalleryCategories = [
  {
    id: "wedding",
    label: "חתונה",
    folder: "weddings",
    count: 5,
  },
  {
    id: "bar-mitzvah",
    label: "בר מצווה",
    folder: "bar-mitzvah",
    count: 4,
  },
  {
    id: "brit",
    label: "ברית",
    folder: "brit",
    count: 4,
  },
].map((category) => ({
  ...category,
  items: Array.from({ length: category.count }, (_, index) => ({
    src: `/assets/gallery/${category.folder}/${String(index + 1).padStart(2, "0")}.webp`,
    alt: `${category.label} ${index + 1}`,
  })),
}));

const galleryItems = fallbackGalleryCategories.flatMap((category) => category.items);

function buildGalleryCategories(remotePhotos) {
  if (!remotePhotos?.length) return fallbackGalleryCategories;

  return fallbackGalleryCategories.map((category) => ({
    ...category,
    items: remotePhotos
      .filter((photo) => photo.category_id === category.id)
      .map((photo, index) => ({
        src: photo.file_url,
        alt: photo.alt || `${category.label} ${index + 1}`,
      })),
  })).filter((category) => category.items.length);
}

const fallbackReviews = [
  {
    name: "משפחת הלקוח",
    date: "03/01/2025",
    quote:
      "מעבר להיותו מקצועי ברמות אחרות, אופק סבלני, קשוב מאוד לילד ולנו. כל התמונות איכותיות מאוד, האלבום מעוצב, המגנטים ברמה גבוהה — בהחלט אחת הבחירות הכי טובות שלנו לאירוע.",
  },
  {
    name: "Yehuda",
    date: "12/02/2025",
    quote:
      "מהשיחה הראשונה ועד סוף האירוע — גישה סבלנית, שירות מכל הלב ומקצועיות ברמה הכי גבוהה. התמונות יצאו איכותיות ומרשימות, והאורחים לא הפסיקו להחמיא.",
  },
  {
    name: "אמיתי מ.",
    date: "27/06/2023",
    quote:
      "לקחתי את אופק לצילום ברית, סטילס, אלבום דיגיטלי ומגנטים. השירות והחיוך היו מצוינים, התמונות הגיעו כבר באותו היום, וקיבלנו גם בלוקי עץ במתנה.",
  },
  {
    name: "אדיר ס.",
    date: "17/05/2023",
    quote:
      "תחת מצב ביטחוני לא פשוט ושינויים בשעות ובמיקום, אופק היה לעזר רב הרבה מעבר למצופה — הכול באיכות, מקצועיות, מחיר הוגן ושירות הכי טוב.",
  },
  {
    name: "Nehorai C.",
    date: "27/06/2023",
    quote:
      "אירוע מאוד מוצלח ומושקע, עם תמונות, מגנטים וסרטונים באיכות טובה. אליפות.",
  },
  {
    name: "Yeuda C.",
    date: "27/06/2023",
    quote:
      "מחיר אש, צילום איכותי, בן אדם זהב ומתחשב. רואים שמבין עניין.",
  },
];

function Hero() {
  const heroRef = useRef(null);
  const stackRef = useRef(null);
  const copyRef = useRef(null);
  const noteRef = useRef(null);
  const actionsRef = useRef(null);

  const floatingPhotos = useMemo(() => galleryItems.slice(0, 4), []);

  useEffect(() => {
    if (
      !heroRef.current ||
      !stackRef.current ||
      !copyRef.current ||
      !noteRef.current ||
      !actionsRef.current
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const heroScroll = {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      };

      gsap.fromTo(
        stackRef.current,
        { "--hero-stack-gap": "0.45rem", opacity: 0.88 },
        {
          "--hero-stack-gap": "1.35rem",
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          delay: 0.15,
        }
      );

      gsap.fromTo(
        actionsRef.current,
        { "--hero-actions-gap": "0.35rem" },
        {
          "--hero-actions-gap": "0.9rem",
          duration: 0.9,
          ease: "power3.out",
          delay: 0.35,
        }
      );

      gsap.to(stackRef.current, {
        "--hero-stack-gap": "2.15rem",
        ease: "none",
        scrollTrigger: heroScroll,
      });

      gsap.to(actionsRef.current, {
        "--hero-actions-gap": "1.35rem",
        ease: "none",
        scrollTrigger: heroScroll,
      });

      gsap.to(copyRef.current, {
        yPercent: -18,
        ease: "none",
        scrollTrigger: heroScroll,
      });

      gsap.to(noteRef.current, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: heroScroll,
      });

      gsap.to(".site-video", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: heroScroll,
      });

      gsap.from(".hero-floating-photo", {
        y: 18,
        opacity: 0,
        stagger: 0.08,
        duration: 0.8,
        ease: "power2.out",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero-shell" ref={heroRef} id="top">
      <div className="hero-sticky">
        <div className="hero-photo-cloud" aria-hidden="true">
          {floatingPhotos.map((item, index) => (
            <figure className={`hero-floating-photo photo-${index + 1}`} key={item.src}>
              <img src={item.src} alt="" />
            </figure>
          ))}
        </div>

        <header className="topbar">
          <div className="topbar-side">
            <img src="/assets/ofek-logo.jpg" alt="לוגו אופק פרץ" />
            <nav>
              <a href="#works">עבודות</a>
              <a href="#about">אודות</a>
              <a href="#contact">יצירת קשר</a>
            </nav>
          </div>

          <div className="hero-brand">
            <p>צילום סטילס ווידאו לאירועים</p>
            <h1 className="hero-brand-title">אופק פרץ</h1>
          </div>
        </header>

        <div className="hero-video-window" aria-hidden="true" />

        <div className="hero-stack" ref={stackRef}>
          <div className="hero-copy" ref={copyRef}>
            <h2>רגעים שנשארים חיים</h2>
          </div>

          <div className="hero-actions" ref={actionsRef}>
            <a
              className="button button-dark"
              href={`https://wa.me/${PHONE_LINK}?text=${WHATSAPP_MESSAGE}`}
              target="_blank"
              rel="noreferrer"
            >
              דברו איתי בוואטסאפ
            </a>
            <a className="button button-light" href={`tel:${PHONE_LINK}`}>
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>

        <aside className="hero-note" ref={noteRef}>
          <strong>יותר מצילום.</strong>
          <p>
            ליווי רגוע, עין מדויקת ותוצאה שנראית כמו שהאירוע הרגיש באמת.
          </p>
        </aside>

        <div className="scroll-meter">
          <span />
          <small>גללו כדי לפתוח את הסיפור</small>
        </div>
      </div>
    </section>
  );
}

function SiteBackdrop() {
  const backdropRef = useRef(null);
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [isMobileVideo, setIsMobileVideo] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 820px)");
    const update = () => setIsMobileVideo(media.matches);

    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!backdropRef.current || !video || !videoReady) return;

    if (isMobileVideo) {
      video.loop = true;
      video.playbackRate = 0.82;
      video.currentTime = Math.min(video.currentTime || 0, 0.2);
      video.play().catch(() => {});

      return () => {
        video.pause();
        video.loop = false;
        video.playbackRate = 1;
      };
    }

    const tween = gsap.to(video, {
      currentTime: video.duration,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [isMobileVideo, videoReady]);

  return (
    <div className="site-backdrop" ref={backdropRef} aria-hidden="true">
      <video
        ref={videoRef}
        className={`site-video ${videoReady ? "is-ready" : ""}`}
        muted
        playsInline
        autoPlay={isMobileVideo}
        loop={isMobileVideo}
        preload={isMobileVideo ? "auto" : "metadata"}
        poster="/assets/ofek-logo.jpg"
        onLoadedData={() => setVideoReady(true)}
        onCanPlay={() => setVideoReady(true)}
        onLoadedMetadata={() => setVideoReady(true)}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <div className="site-backdrop-wash" />
    </div>
  );
}

function GallerySection({ categories }) {
  const galleryRef = useRef(null);
  const lineRef = useRef(null);
  useEffect(() => {
    if (!galleryRef.current || !lineRef.current) return;

    const ctx = gsap.context(() => {
      const galleryScroll = {
        trigger: galleryRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      };

      gsap.utils.toArray(".gallery-grid-3d").forEach((grid) => {
        gsap.fromTo(
          grid,
          { "--gallery-gap": "0.45rem" },
          {
            "--gallery-gap": "1rem",
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: grid,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );

        gsap.to(grid, {
          "--gallery-gap": "1.35rem",
          ease: "none",
          scrollTrigger: {
            trigger: grid,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      gsap.fromTo(
        lineRef.current,
        { scaleX: 0.15, xPercent: 18, opacity: 0.2 },
        {
          scaleX: 1,
          xPercent: -8,
          opacity: 1,
          ease: "none",
          scrollTrigger: galleryScroll,
        }
      );
    }, galleryRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="section gallery" id="works" ref={galleryRef}>
      <div className="section-heading">
        <p>גלריית עבודות</p>
        <h2>רגעים שנשארים קרובים, מכל זווית</h2>
      </div>

      <div className="gallery-line" ref={lineRef} aria-hidden="true" />

      <div className="gallery-categories">
        {categories.map((category) => (
          <article
            className="gallery-category"
            id={category.id}
            key={category.id}
          >
            <h3 className="gallery-category-title">{category.label}</h3>
            <div className="gallery-grid-3d">
              {category.items.map((item, index) => (
                <figure
                  className="gallery-photo"
                  key={item.src}
                  style={{
                    "--tilt": `${((index % 5) - 2) * 2}deg`,
                    "--lift": `${(index % 3) * 10}px`,
                  }}
                >
                  <img
                    src={item.src}
                    alt={`${category.label} — ${item.alt}`}
                    loading="lazy"
                  />
                </figure>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReviewsSection({ reviews, onSubmitReview }) {
  const reviewsRef = useRef(null);

  useEffect(() => {
    const section = reviewsRef.current;
    if (!section) return;

    const handleMove = (event) => {
      const rect = section.getBoundingClientRect();
      section.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      section.style.setProperty("--my", `${event.clientY - rect.top}px`);

      const card = event.target.closest(".review-card");
      if (card) {
        const cr = card.getBoundingClientRect();
        const x = event.clientX - cr.left;
        const y = event.clientY - cr.top;
        card.style.setProperty("--gx", `${(x / cr.width) * 100}%`);
        card.style.setProperty("--gy", `${(y / cr.height) * 100}%`);
        card.style.setProperty("--rx", `${((y - cr.height / 2) / (cr.height / 2)) * -5}deg`);
        card.style.setProperty("--ry", `${((x - cr.width / 2) / (cr.width / 2)) * 5}deg`);
      }
    };

    const handleLeave = (e) => {
      if (e.target.classList.contains("review-card")) {
        e.target.style.setProperty("--rx", "0deg");
        e.target.style.setProperty("--ry", "0deg");
      }
    };

    section.addEventListener("pointermove", handleMove);
    section.addEventListener("pointerleave", handleLeave, true);
    return () => {
      section.removeEventListener("pointermove", handleMove);
      section.removeEventListener("pointerleave", handleLeave, true);
    };
  }, []);

  return (
    <section className="section reviews" ref={reviewsRef}>
      <div className="section-heading">
        <p>ביקורות</p>
        <h2>כשאנשים מדברים על החוויה, לא רק על התמונות</h2>
      </div>

      <div className="reviews-summary">
        <strong>5.0</strong>
        <span>לקוחות חוזרים שוב ושוב על אותם דברים: מקצועיות, סבלנות ושירות מכל הלב.</span>
      </div>

      <div className="reviews-track">
        {reviews.map((review) => (
          <article className="review-card" key={review.id || `${review.name}-${review.date}`}>
            <div>
              <strong>{review.name}</strong>
              <span>{review.date || review.event_date || "ביקורת לקוח"}</span>
            </div>
            <p>“{review.quote}”</p>
          </article>
        ))}
      </div>

      <ReviewSubmitForm onSubmitReview={onSubmitReview} />
    </section>
  );
}

function ReviewSubmitForm({ onSubmitReview }) {
  const [form, setForm] = useState({ name: "", quote: "", rating: 5 });
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("saving");

    try {
      await onSubmitReview(form);
      setForm({ name: "", quote: "", rating: 5 });
      setStatus("sent");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <form className="review-submit" onSubmit={handleSubmit}>
      <div>
        <p>רוצים לפרגן?</p>
        <h3>השאירו ביקורת לאתר</h3>
        <span>הביקורת תעלה אחרי אישור אדמין, כדי לשמור על האתר נקי.</span>
      </div>
      <label>
        שם
        <input
          required
          minLength="2"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="השם שלכם"
        />
      </label>
      <label>
        ביקורת
        <textarea
          required
          minLength="10"
          value={form.quote}
          onChange={(event) => setForm((current) => ({ ...current, quote: event.target.value }))}
          placeholder="איך הייתה החוויה עם אופק?"
        />
      </label>
      <button className="button button-dark" type="submit" disabled={status === "saving"}>
        {status === "saving" ? "שולח..." : "שליחת ביקורת"}
      </button>
      {status === "sent" && <small>תודה! הביקורת ממתינה לאישור.</small>}
      {status === "error" && <small>לא הצלחתי לשלוח כרגע. נבדוק את החיבור ל־Supabase.</small>}
    </form>
  );
}

function AboutSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const handleMove = (e) => {
      const rect = section.getBoundingClientRect();
      section.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      section.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };
    section.addEventListener("pointermove", handleMove);
    return () => section.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <section className="section about" id="about" ref={sectionRef}>
      <span className="about-orb about-orb-1" aria-hidden="true" />
      <span className="about-orb about-orb-2" aria-hidden="true" />
      <span className="about-orb about-orb-3" aria-hidden="true" />
      <div className="section-heading">
        <p>אודות</p>
        <h2>נוכחות שקטה. תוצאה שמדברת.</h2>
      </div>

      <div className="about-copy">
        <p>
          אופק פרץ מתמחה בצילום אירועים פרטיים ועסקיים, עם שילוב של סטילס,
          וידאו ועריכה שמחזיקים יחד את כל מה שקורה באמת: ההתרגשות, התנועה,
          המבטים הקטנים שבדרך כלל חולפים מהר מדי.
        </p>
        <p>
          מחתונות וחינות ועד בר ובת מצווה — המטרה היא לא רק לתעד את האירוע,
          אלא להחזיר אתכם אליו בכל פעם מחדש.
        </p>
      </div>

      <figure className="about-portrait">
        <img src="/assets/ofek-portrait.png" alt="אופק פרץ" loading="lazy" />
      </figure>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="section contact" id="contact">
      <div>
        <p>מתכננים אירוע?</p>
        <h2>בואו נדבר על איך הוא ייזכר.</h2>
      </div>

      <div className="contact-actions">
        <a
          className="button button-dark"
          href={`https://wa.me/${PHONE_LINK}?text=${WHATSAPP_MESSAGE}`}
          target="_blank"
          rel="noreferrer"
        >
          שלחו הודעה בוואטסאפ
        </a>
        <a className="button button-light" href={`tel:${PHONE_LINK}`}>
          חייגו {PHONE_DISPLAY}
        </a>
        <a
          className="text-link"
          href="https://www.instagram.com/OFEK.PERETZ2/"
          target="_blank"
          rel="noreferrer"
        >
          אינסטגרם
        </a>
      </div>
    </section>
  );
}

const PRELOAD_BACKGROUND_ASSETS = [
  HERO_VIDEO,
  "/assets/ofek-portrait.png",
  ...galleryItems.slice(0, 4).map((item) => item.src),
];

function loadAsset(src) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    if (src.endsWith(".mp4")) {
      const video = document.createElement("video");
      video.preload = src === HERO_VIDEO ? "metadata" : "auto";
      video.muted = true;
      video.playsInline = true;
      video.onloadedmetadata = finish;
      video.oncanplaythrough = finish;
      video.onloadeddata = finish;
      video.onerror = finish;
      video.src = src;

      if (video.readyState >= 1) {
        finish();
      } else {
        video.load();
      }
      return;
    }

    const image = new Image();
    image.onload = finish;
    image.onerror = finish;
    image.src = src;

    if (image.complete) {
      finish();
    }
  });
}

function SitePreloader({ onComplete }) {
  const shellRef = useRef(null);
  const videoRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.add("is-loading");

    let cancelled = false;
    let finished = false;
    let assetsReady = false;
    let assetsLoaded = 0;
    const startedAt = performance.now();
    const minDuration = 1200;
    const maxDuration = 14000;

    const setProgress = (value) => {
      if (barRef.current) {
        barRef.current.style.setProperty("--progress", `${Math.min(100, value)}%`);
      }
    };

    const tryFinish = () => {
      if (cancelled || finished || !assetsReady) return;
      finished = true;
      window.clearTimeout(timeoutId);

      if (videoRef.current) {
        videoRef.current.pause();
      }

      const elapsed = performance.now() - startedAt;
      const wait = Math.max(0, minDuration - elapsed);

      window.setTimeout(() => {
        if (cancelled || !shellRef.current) return;

        gsap.to(shellRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => {
            document.documentElement.classList.remove("is-loading");
            onComplete();
          },
        });
      }, wait);
    };

    const updateProgress = () => {
      const video = videoRef.current;
      const introProgress =
        video && video.duration && !Number.isNaN(video.duration)
          ? (video.currentTime / video.duration) * 45
          : 0;
      const assetProgress =
        (assetsLoaded / PRELOAD_BACKGROUND_ASSETS.length) * 55;
      setProgress(Math.min(99, Math.round(introProgress + assetProgress)));
    };

    const onAssetLoaded = () => {
      assetsLoaded += 1;
      updateProgress();

      if (assetsLoaded >= PRELOAD_BACKGROUND_ASSETS.length) {
        assetsReady = true;
        tryFinish();
      }
    };

    PRELOAD_BACKGROUND_ASSETS.forEach((src) => {
      loadAsset(src).then(onAssetLoaded);
    });

    const timeoutId = window.setTimeout(() => {
      assetsReady = true;
      setProgress(100);
      tryFinish();
    }, maxDuration);

    const attachVideo = () => {
      const video = videoRef.current;
      if (!video) return false;

      const onIntroProgress = () => updateProgress();
      const onIntroDone = () => {
        setProgress(100);
        tryFinish();
      };

      video.addEventListener("timeupdate", onIntroProgress);
      video.addEventListener("ended", onIntroDone);
      video.addEventListener("error", onIntroDone);

      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(onIntroDone);
      }

      return () => {
        video.removeEventListener("timeupdate", onIntroProgress);
        video.removeEventListener("ended", onIntroDone);
        video.removeEventListener("error", onIntroDone);
        video.pause();
      };
    };

    let detachVideo = attachVideo();
    let retryId;

    if (!detachVideo) {
      retryId = window.setInterval(() => {
        if (detachVideo || cancelled) return;
        detachVideo = attachVideo();
        if (detachVideo) {
          window.clearInterval(retryId);
        }
      }, 40);
    }

    return () => {
      cancelled = true;
      finished = true;
      window.clearTimeout(timeoutId);
      if (retryId) {
        window.clearInterval(retryId);
      }
      if (typeof detachVideo === "function") {
        detachVideo();
      }
      document.documentElement.classList.remove("is-loading");
    };
  }, [onComplete]);

  return (
    <div className="site-preloader" ref={shellRef} role="status" aria-live="polite">
      <video
        ref={videoRef}
        className="site-preloader-video"
        src={PRELOADER_VIDEO}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="site-preloader-vignette" aria-hidden="true" />
      <div className="site-preloader-footer">
        <p className="site-preloader-label">רגע לפני שהסיפור נפתח</p>
        <div className="site-preloader-track" aria-hidden="true">
          <span className="site-preloader-bar" ref={barRef} style={{ "--progress": "6%" }} />
        </div>
      </div>
    </div>
  );
}

function CursorTrail() {
  const canvasRef = useRef(null);
  const stateRef = useRef({ points: [], raf: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const state = stateRef.current;
    const TRAIL_DURATION = 920;
    const MAX_POINTS = 80;

    // gold → rose → cranberry (site palette)
    const COLORS = [
      { r: 200, g: 164, b: 107 }, // gold  (#c8a46b)
      { r: 201, g: 143, b: 146 }, // rose  (#c98f92)
      { r: 179, g: 58,  b: 76  }, // cranberry (#b33a4c)
    ];

    const lerpColor = (ratio) => {
      // ratio 0 = tail (gold), 1 = head (cranberry)
      const seg = ratio < 0.5 ? 0 : 1;
      const t = ratio < 0.5 ? ratio * 2 : (ratio - 0.5) * 2;
      const a = COLORS[seg], b2 = COLORS[seg + 1];
      return {
        r: Math.round(a.r + (b2.r - a.r) * t),
        g: Math.round(a.g + (b2.g - a.g) * t),
        b: Math.round(a.b + (b2.b - a.b) * t),
      };
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const onMove = (e) => {
      const now = Date.now();
      const last = state.points[state.points.length - 1];
      if (!last || Math.hypot(e.clientX - last.x, e.clientY - last.y) > 2) {
        state.points.push({ x: e.clientX, y: e.clientY, t: now });
        if (state.points.length > MAX_POINTS) state.points.shift();
      }
    };

    const draw = () => {
      state.raf = requestAnimationFrame(draw);
      const now = Date.now();
      state.points = state.points.filter((p) => now - p.t < TRAIL_DURATION);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pts = state.points;
      if (pts.length < 2) return;

      const n = pts.length;

      // — glow pass (blurred, larger) —
      ctx.save();
      ctx.filter = "blur(6px)";
      for (let i = 1; i < n; i++) {
        const life = i / (n - 1);
        const age = (now - pts[i].t) / TRAIL_DURATION;
        const opacity = life * (1 - age) * 0.28;
        if (opacity <= 0.005) continue;
        const c = lerpColor(life);
        ctx.beginPath();
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        ctx.lineTo(pts[i].x, pts[i].y);
        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${opacity})`;
        ctx.lineWidth = life * (1 - age) * 9 + 1;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      }
      ctx.restore();

      // — crisp trail pass —
      for (let i = 1; i < n; i++) {
        const life = i / (n - 1);
        const age = (now - pts[i].t) / TRAIL_DURATION;
        const opacity = life * (1 - age) * 0.75;
        if (opacity <= 0.005) continue;
        const c = lerpColor(life);
        ctx.beginPath();
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        ctx.lineTo(pts[i].x, pts[i].y);
        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${opacity})`;
        ctx.lineWidth = life * (1 - age) * 2.6 + 0.4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      }

      // — pulsing halo at cursor tip —
      const head = pts[n - 1];
      if (head && now - head.t < 120) {
        const pulse = 0.5 + 0.5 * Math.sin(now / 110);
        const r = 6 + pulse * 4;
        const grad = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, r);
        grad.addColorStop(0, "rgba(179,58,76,0.55)");
        grad.addColorStop(0.45, "rgba(179,58,76,0.14)");
        grad.addColorStop(1, "rgba(179,58,76,0)");
        ctx.beginPath();
        ctx.arc(head.x, head.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    };

    state.raf = requestAnimationFrame(draw);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(state.raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-trail" aria-hidden="true" />;
}

function AdminPanel({ onRefresh }) {
  const [isOpen, setIsOpen] = useState(() => window.location.hash === "#admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState({ user: null, profile: null });
  const [adminReviews, setAdminReviews] = useState([]);
  const [upload, setUpload] = useState({ categoryId: "wedding", alt: "", file: null });
  const [message, setMessage] = useState("");

  const isAdmin = session.profile?.role === "admin";

  const refreshAdmin = useCallback(async () => {
    const nextSession = await getAdminSession();
    setSession(nextSession);
    if (nextSession.profile?.role === "admin") {
      setAdminReviews(await loadAdminReviews());
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !isSupabaseConfigured) return;
    refreshAdmin().catch(console.error);
  }, [isOpen, refreshAdmin]);

  if (!isOpen) {
    return (
      <button className="admin-trigger" type="button" onClick={() => setIsOpen(true)}>
        Admin
      </button>
    );
  }

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("מתחבר...");
    try {
      await signInAdmin(email, password);
      await refreshAdmin();
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("התחברות נכשלה. בדוק מייל/סיסמה או הרשאת אדמין.");
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!upload.file) return;
    setMessage("מעלה תמונה...");
    try {
      await uploadGalleryPhoto(upload);
      setUpload({ categoryId: "wedding", alt: "", file: null });
      await onRefresh();
      setMessage("התמונה עלתה בהצלחה.");
    } catch (error) {
      console.error(error);
      setMessage("העלאת התמונה נכשלה.");
    }
  };

  const setReviewStatus = async (id, status) => {
    await updateReviewStatus(id, status);
    await refreshAdmin();
    await onRefresh();
  };

  return (
    <aside className="admin-panel" dir="rtl">
      <button className="admin-close" type="button" onClick={() => setIsOpen(false)}>×</button>
      <h3>ניהול אתר</h3>

      {!isSupabaseConfigured ? (
        <p>חסר חיבור Supabase. צריך להוסיף VITE_SUPABASE_URL ו־VITE_SUPABASE_PUBLISHABLE_KEY.</p>
      ) : !session.user ? (
        <form onSubmit={handleLogin} className="admin-form">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="אימייל אדמין" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="סיסמה" />
          <button className="button button-dark" type="submit">כניסה</button>
        </form>
      ) : !isAdmin ? (
        <p>המשתמש מחובר, אבל עדיין לא מוגדר כאדמין.</p>
      ) : (
        <>
          <form className="admin-form" onSubmit={handleUpload}>
            <strong>הוספת תמונה</strong>
            <select value={upload.categoryId} onChange={(e) => setUpload((v) => ({ ...v, categoryId: e.target.value }))}>
              <option value="wedding">חתונה</option>
              <option value="bar-mitzvah">בר מצווה</option>
              <option value="brit">ברית</option>
            </select>
            <input value={upload.alt} onChange={(e) => setUpload((v) => ({ ...v, alt: e.target.value }))} placeholder="תיאור קצר" />
            <input type="file" accept="image/*" onChange={(e) => setUpload((v) => ({ ...v, file: e.target.files?.[0] || null }))} />
            <button className="button button-dark" type="submit">העלאה</button>
          </form>

          <div className="admin-reviews">
            <strong>ביקורות</strong>
            {adminReviews.map((review) => (
              <article key={review.id}>
                <span>{review.status}</span>
                <b>{review.name}</b>
                <p>{review.quote}</p>
                <button type="button" onClick={() => setReviewStatus(review.id, "approved")}>אשר</button>
                <button type="button" onClick={() => setReviewStatus(review.id, "rejected")}>דחה</button>
              </article>
            ))}
          </div>

          <button className="text-link" type="button" onClick={async () => { await signOutAdmin(); setSession({ user: null, profile: null }); }}>
            יציאה
          </button>
        </>
      )}

      {message && <small>{message}</small>}
    </aside>
  );
}

function App() {
  const [siteReady, setSiteReady] = useState(false);
  const [galleryCategories, setGalleryCategories] = useState(fallbackGalleryCategories);
  const [reviews, setReviews] = useState(fallbackReviews);
  const handleSiteReady = useCallback(() => setSiteReady(true), []);

  const refreshContent = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      const content = await loadPublicContent();
      setGalleryCategories(buildGalleryCategories(content.galleryPhotos));
      if (content.reviews?.length) setReviews(content.reviews);
    } catch (error) {
      console.error("Supabase content load failed", error);
    }
  }, []);

  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  const handleSubmitReview = useCallback(async (form) => {
    await submitVisitorReview(form);
  }, []);

  return (
    <>
      {!siteReady && <SitePreloader onComplete={handleSiteReady} />}
      <div className={`site-root ${siteReady ? "is-ready" : ""}`}>
        {siteReady ? (
          <>
            <SiteBackdrop />
            <div className="ambient-lights" aria-hidden="true">
              <span />
              <span />
            </div>
            <CursorTrail />
            <div className="site-stage">
              <Hero />
            </div>
            <main className="content-stage">
              <GallerySection categories={galleryCategories} />
              <ReviewsSection reviews={reviews} onSubmitReview={handleSubmitReview} />
              <AboutSection />
              <ContactSection />
            </main>
            <AdminPanel onRefresh={refreshContent} />
          </>
        ) : null}
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
