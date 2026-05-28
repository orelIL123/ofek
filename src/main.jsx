import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles.css";
import "./styles-dark.css";

gsap.registerPlugin(ScrollTrigger);

const PHONE_DISPLAY = "052-8804065";
const PHONE_LINK = "972528804065";
const INSTAGRAM_URL = "https://www.instagram.com/picchak_1/";
const INSTAGRAM_REELS_URL = "https://www.instagram.com/picchak_1/reels/";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "היי פיקצאק, הגעתי מהאתר ואשמח לשמוע פרטים על צילום לאירוע."
);

const PRELOADER_VIDEO = "/assets/pre_loading.mp4";
const HERO_VIDEO = "/assets/hero-scroll-video.mp4";
/** Portrait 9:16 — place file at public/assets/hero-mobile-video.mp4 */
const HERO_VIDEO_MOBILE = "/assets/hero-mobile-video.mp4";
const BRAND_LOGO = "/assets/brand/picchak-logo.webp";
const BRAND_PORTRAIT = "/assets/brand/picchak-portrait.jpg";
const HERO_STILL = "/assets/gallery/picchak/03.webp";

function pickHeroVideo(isMobile) {
  return isMobile ? HERO_VIDEO_MOBILE : HERO_VIDEO;
}

const picchakPhotos = [
  "/assets/gallery/picchak/01.webp",
  "/assets/gallery/picchak/02.webp",
  "/assets/gallery/picchak/03.webp",
  "/assets/gallery/picchak/04.webp",
  "/assets/gallery/picchak/05.webp",
  "/assets/gallery/picchak/06.webp",
  "/assets/gallery/picchak/07.webp",
  "/assets/gallery/picchak/08.webp",
  "/assets/gallery/picchak/09.webp",
  "/assets/gallery/picchak/10.webp",
  "/assets/gallery/picchak/11.webp",
  "/assets/gallery/picchak/12.webp",
  "/assets/gallery/picchak/13.jpg",
];

const curatedGalleryPhotos = [
  picchakPhotos[2],
  picchakPhotos[6],
  picchakPhotos[0],
  picchakPhotos[9],
  picchakPhotos[12],
  picchakPhotos[3],
  picchakPhotos[8],
  picchakPhotos[11],
];

const galleryCategories = [
  {
    id: "events",
    label: "אירועים וחתונות",
    items: curatedGalleryPhotos.slice(0, 4),
  },
  {
    id: "ceremonies",
    label: "ברית ובר מצווה",
    items: curatedGalleryPhotos.slice(4, 8),
  },
].map((category) => ({
  ...category,
  items: category.items.map((src, index) => ({
    src,
    alt: `${category.label} ${index + 1}`,
  })),
}));

const galleryItems = galleryCategories.flatMap((category) => category.items);

const reviews = [
  {
    name: "משפחת הלקוח",
    date: "03/01/2025",
    quote:
      "מעבר להיותם מקצועיים ברמות אחרות, צוות פיקצאק סבלני וקשוב לכל המשפחה. התמונות יצאו מרגשות, האלבום מעוצב מדהים והשירות ברמה גבוהה.",
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
      "לקחנו את פיקצאק לצילום ברית, סטילס, אלבום דיגיטלי ומגנטים. היחס היה מצוין, התמונות הגיעו מהר מאוד והכל היה איכותי ומסודר.",
  },
  {
    name: "אדיר ס.",
    date: "17/05/2023",
    quote:
      "גם עם שינויים של הרגע האחרון בשעות ובמיקום, פיקצאק היו זמינים ועזרו מעבר למצופה — הכול באיכות, מקצועיות ושירות מכל הלב.",
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

      const backdropMedia = document.querySelector(".site-video");
      if (backdropMedia) {
        gsap.to(backdropMedia, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: heroScroll,
        });
      }

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
            <img src={BRAND_LOGO} alt="לוגו פיקצאק" />
            <nav>
              <a href="#works">עבודות</a>
              <a href="#reels">וידאו</a>
              <a href="#about">אודות</a>
              <a href="#contact">יצירת קשר</a>
            </nav>
          </div>

          <div className="hero-brand">
            <p>צילום סטילס ווידאו לאירועים</p>
            <h1 className="hero-brand-title">פיקצאק</h1>
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
  return (
    <div className="site-backdrop" aria-hidden="true">
      <img className="site-video is-ready" src={HERO_STILL} alt="" loading="eager" />
      <div className="site-backdrop-wash" />
    </div>
  );
}

function GallerySection() {
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
        {galleryCategories.map((category) => (
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

function ReviewsSection() {
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
          <article className="review-card" key={`${review.name}-${review.date}`}>
            <div>
              <strong>{review.name}</strong>
              <span>{review.date}</span>
            </div>
            <p>“{review.quote}”</p>
          </article>
        ))}
      </div>
    </section>
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
          פיקצאק מתמחים בצילום אירועים פרטיים ועסקיים, עם שילוב של סטילס,
          וידאו ועריכה שמחזיקים יחד את כל מה שקורה באמת: ההתרגשות, התנועה,
          המבטים הקטנים שבדרך כלל חולפים מהר מדי.
        </p>
        <p>
          מחתונות וחינות ועד בר ובת מצווה — המטרה היא לא רק לתעד את האירוע,
          אלא להחזיר אתכם אליו בכל פעם מחדש.
        </p>
      </div>

      <figure className="about-portrait">
        <img src={BRAND_PORTRAIT} alt="פיקצאק" loading="lazy" />
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
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
        >
          אינסטגרם @picchak_1
        </a>
      </div>
    </section>
  );
}

function ReelsSection() {
  return (
    <section className="section reels" id="reels">
      <div className="section-heading">
        <p>וידאו</p>
        <h2>טיזר קצר מהסגנון של פיקצאק</h2>
      </div>

      <div className="reels-grid">
        <figure className="reels-video-card">
          <img className="reels-video" src={curatedGalleryPhotos[4]} alt="רגע וידאו מפיקצאק" loading="lazy" />
          <figcaption>סרטון קצר להצגה מהירה לפני מעבר לרילס המלא.</figcaption>
        </figure>

        <div className="reels-copy">
          <p>
            רוצים לראות עוד קליפים של אירועים בזמן אמת? הרילס שלנו מתעדכן
            באופן קבוע ונותן תחושה אמיתית של האנרגיה באירוע.
          </p>
          <a
            className="button button-dark"
            href={INSTAGRAM_REELS_URL}
            target="_blank"
            rel="noreferrer"
          >
            לצפייה בכל הרילס
          </a>
        </div>
      </div>
    </section>
  );
}

function getPreloadBackgroundAssets() {
  const isMobile = window.matchMedia("(max-width: 820px)").matches;
  return [
    pickHeroVideo(isMobile),
    BRAND_PORTRAIT,
    ...galleryItems.slice(0, 4).map((item) => item.src),
  ];
}

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
      video.preload =
        src === HERO_VIDEO || src === HERO_VIDEO_MOBILE ? "metadata" : "auto";
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
    let introReady = false;
    let introDone = false;
    let assetsLoaded = 0;
    const preloadAssets = getPreloadBackgroundAssets();
    const startedAt = performance.now();
    const minDuration = 1200;
    const maxDuration = 45000;

    const setProgress = (value) => {
      if (barRef.current) {
        barRef.current.style.setProperty("--progress", `${Math.min(100, value)}%`);
      }
    };

    const tryFinish = () => {
      if (cancelled || finished || !assetsReady || !introDone) return;
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
          : introReady
            ? 8
            : 0;
      const assetProgress = (assetsLoaded / preloadAssets.length) * 55;
      setProgress(Math.min(99, Math.round(introProgress + assetProgress)));
    };

    const onAssetLoaded = () => {
      assetsLoaded += 1;
      updateProgress();

      if (assetsLoaded >= preloadAssets.length) {
        assetsReady = true;
        tryFinish();
      }
    };

    preloadAssets.forEach((src) => {
      loadAsset(src).then(onAssetLoaded);
    });

    const timeoutId = window.setTimeout(() => {
      // Fallback only for broken/blocked video loading. Normal flow waits for the intro video to end.
      assetsReady = true;
      introDone = true;
      setProgress(100);
      tryFinish();
    }, maxDuration);

    const attachVideo = () => {
      const video = videoRef.current;
      if (!video) return false;

      const playIntro = () => {
        if (introReady) return;
        introReady = true;
        updateProgress();
        const playPromise = video.play();
        if (playPromise) {
          playPromise.catch(() => {
            // If the browser blocks playback, don't trap visitors forever.
            introDone = true;
            tryFinish();
          });
        }
      };

      const onIntroProgress = () => updateProgress();
      const onIntroDone = () => {
        introDone = true;
        setProgress(100);
        tryFinish();
      };
      const onIntroError = () => {
        introDone = true;
        setProgress(100);
        tryFinish();
      };

      video.addEventListener("canplaythrough", playIntro, { once: true });
      video.addEventListener("loadeddata", playIntro, { once: true });
      video.addEventListener("timeupdate", onIntroProgress);
      video.addEventListener("ended", onIntroDone);
      video.addEventListener("error", onIntroError);

      video.load();
      if (video.readyState >= 3) {
        playIntro();
      }

      return () => {
        video.removeEventListener("canplaythrough", playIntro);
        video.removeEventListener("loadeddata", playIntro);
        video.removeEventListener("timeupdate", onIntroProgress);
        video.removeEventListener("ended", onIntroDone);
        video.removeEventListener("error", onIntroError);
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

function App() {
  return (
    <>
      <div className="site-root is-ready">
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
          <GallerySection />
          <ReelsSection />
          <ReviewsSection />
          <AboutSection />
          <ContactSection />
        </main>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
