import React, { useRef, useEffect, useState, useCallback, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useTexture, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import './styles.css'

// ─── Constants ────────────────────────────────────────────────────────────────
const PHONE_DISPLAY = '052-8804065'
const PHONE_LINK = '972528804065'
const INSTAGRAM_URL = 'https://www.instagram.com/picchak_1/'

const GALLERY_PHOTOS = [
  '/assets/gallery/WhatsApp Image 2026-05-28 at 16.33.39 (1).jpeg',
  '/assets/gallery/WhatsApp Image 2026-05-28 at 16.33.40.jpeg',
  '/assets/gallery/WhatsApp Image 2026-05-28 at 16.33.39.jpeg',
  '/assets/gallery/WhatsApp Image 2026-05-28 at 16.33.40 (2).jpeg',
  '/assets/gallery/WhatsApp Image 2026-05-28 at 16.33.40 (4).jpeg',
  '/assets/gallery/WhatsApp Image 2026-05-28 at 16.33.40 (6).jpeg',
  '/assets/gallery/WhatsApp Image 2026-05-28 at 16.33.40 (1).jpeg',
  '/assets/gallery/WhatsApp Image 2026-05-28 at 16.33.40 (3).jpeg',
  '/assets/gallery/WhatsApp Image 2026-05-28 at 16.33.40 (5).jpeg',
]

const HERO_PHOTOS = GALLERY_PHOTOS.slice(0, 5)

useGLTF.preload('/assets/model/camera.glb')

// ─── Reveal Hook (IntersectionObserver) ──────────────────────────────────────
function useReveal(ref, threshold = 0.1) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('is-revealed'); obs.unobserve(el) } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, threshold])
}

// ─── Video Preloader ──────────────────────────────────────────────────────────
function VideoPreloader({ onDone }) {
  const [fading, setFading] = useState(false)
  const dismissed = useRef(false)
  const videoRef  = useRef()

  const dismiss = useCallback(() => {
    if (dismissed.current) return
    dismissed.current = true
    setFading(true)
    setTimeout(onDone, 650)
  }, [onDone])

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) { dismiss(); return }
    const p = vid.play()
    if (p) p.catch(dismiss)
    vid.addEventListener('ended', dismiss)
    const timer = setTimeout(dismiss, 14000)
    return () => { vid.removeEventListener('ended', dismiss); clearTimeout(timer) }
  }, [dismiss])

  return (
    <div className={`preloader${fading ? ' preloader--out' : ''}`}>
      <video
        ref={videoRef}
        src="/assets/pre_loading.mp4"
        muted
        playsInline
        autoPlay
        className="preloader-video"
      />
      <button className="preloader-skip" onClick={dismiss}>דלג ›</button>
    </div>
  )
}

// ─── Loading Bar ──────────────────────────────────────────────────────────────
function PageLoader() {
  const { active, progress } = useProgress()
  return active ? (
    <div className="page-loader">
      <div className="page-loader-bar" style={{ width: `${progress}%` }} />
    </div>
  ) : null
}

// ─── 3D Camera Model ─────────────────────────────────────────────────────────
function CameraModel({ scrollRef }) {
  const groupRef = useRef()
  const { camera } = useThree()
  const { scene } = useGLTF('/assets/model/camera.glb')

  const diffuse = useTexture('/assets/model/DSLR_DSLR_Diffuse.png')
  const normalTex = useTexture('/assets/model/DSLR_DSLR_Normal.png')

  useEffect(() => {
    diffuse.colorSpace = THREE.SRGBColorSpace
    diffuse.flipY = false
    normalTex.flipY = false

    const mat = new THREE.MeshStandardMaterial({
      map: diffuse,
      normalMap: normalTex,
      normalScale: new THREE.Vector2(1.5, 1.5),
      roughness: 0.5,
      metalness: 0.25,
    })

    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = mat
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    // Auto-normalize: fit model inside 2-unit bounding box, bottom at y=0
    const box1 = new THREE.Box3().setFromObject(scene)
    const size = box1.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const normalScale = 2.2 / maxDim
    scene.scale.set(normalScale, normalScale, normalScale)

    const box2 = new THREE.Box3().setFromObject(scene)
    const center = box2.getCenter(new THREE.Vector3())
    scene.position.set(-center.x, -box2.min.y, -center.z)
  }, [scene, diffuse, normalTex])

  useFrame(({ clock }) => {
    const p = scrollRef.current
    if (groupRef.current) {
      groupRef.current.rotation.y += (p * Math.PI * 2.2 - groupRef.current.rotation.y) * 0.06
      // lively float + subtle rock
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.72) * 0.09
      groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.41) * 0.018
    }
    camera.position.z += (4.5 - Math.sin(p * Math.PI) * 1.4 - camera.position.z) * 0.05
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0.1, -0.4, 0]}>
      <primitive object={scene} />
    </group>
  )
}

function HeroScene({ scrollRef }) {
  return (
    <>
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={1.0} />
      <directionalLight position={[6, 10, 6]} intensity={1.9} />
      <directionalLight position={[-6, 3, -3]} intensity={0.55} color="#d0dff0" />
      <pointLight position={[0, 2, 4]} intensity={0.5} color="#fff8ef" />
      <pointLight position={[3, 5, 2]} intensity={0.28} color="#ffeedd" />
      <Suspense fallback={null}>
        <CameraModel scrollRef={scrollRef} />
      </Suspense>
    </>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  const scrollRef = useRef(0)
  const sectionRef = useRef()

  useEffect(() => {
    const update = () => {
      if (!sectionRef.current) return
      const { top, height } = sectionRef.current.getBoundingClientRect()
      const scrollable = height - window.innerHeight
      scrollRef.current = Math.max(0, Math.min(1, -top / scrollable))
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <section ref={sectionRef} className="hero-section">
      <div className="hero-canvas-wrap">
        <Canvas
          camera={{ position: [0, 1.1, 4.5], fov: 50, near: 0.1, far: 100 }}
          shadows={false}
          gl={{ antialias: true, alpha: false }}
        >
          <HeroScene scrollRef={scrollRef} />
        </Canvas>
        <div className="hero-overlay">
          <div className="hero-photo-orbit" aria-hidden="true">
            {HERO_PHOTOS.map((src, index) => (
              <figure className={`hero-orbit-photo hero-orbit-photo--${index + 1}`} key={src}>
                <img src={src} alt="" />
              </figure>
            ))}
          </div>

          <div className="hero-brand">
            <span className="hero-eyebrow">צלם אירועים מקצועי</span>
            <h1 className="hero-title">פיקצאק</h1>
            <p className="hero-intro">
              תיעוד אירועים נקי, אלגנטי ומרגש, עם סטילס ווידאו שמרגישים כמו הזיכרון עצמו.
            </p>
            <a
              className="hero-quote-btn"
              href={"https://wa.me/" + PHONE_LINK + "?text=" + encodeURIComponent("היי פיקצאק, אשמח לקבל הצעת מחיר לצילום אירוע")}
              target="_blank"
              rel="noopener noreferrer"
            >
              קבלו הצעת מחיר
            </a>
          </div>

          <div className="hero-scroll-cue">
            <span>גלול לגלות</span>
            <div className="scroll-line" />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── About Section ────────────────────────────────────────────────────────────
function AboutSection() {
  const ref = useRef()
  useReveal(ref)
  return (
    <section className="about-section">
      <div ref={ref} className="section-inner about-inner reveal">
        <div className="about-text">
          <span className="label-tag">אודות</span>
          <h2>
            מצלמים רגעים,<br />
            <em>יוצרים זכרונות</em>
          </h2>
          <p>
            אנחנו פיקצאק — צלמי אירועים עם עין אמנותית ולב פתוח. כל אירוע הוא
            סיפור ייחודי שמגיע לתיעוד מושלם. אנחנו מביאים עמנו ניסיון, ציוד
            מקצועי וחיבור אמיתי לרגע.
          </p>
          <div className="about-stats">
            <div className="stat"><strong>200+</strong><span>אירועים</span></div>
            <div className="stat"><strong>5★</strong><span>דירוג ממוצע</span></div>
            <div className="stat"><strong>7+</strong><span>שנות ניסיון</span></div>
          </div>
        </div>
          <div className="about-photos">
            <div className="about-photo about-photo--main">
            <img src={GALLERY_PHOTOS[0]} alt="חתונה" loading="eager" />
          </div>
          <div className="about-photo about-photo--secondary">
            <img src={GALLERY_PHOTOS[1]} alt="אירוע" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Services Section ─────────────────────────────────────────────────────────
const services = [
  { num: '01', title: 'חתונות', desc: 'תיעוד מלא ומרגש של היום הגדול שלכם — מחופה ועד ריקוד האחרון' },
  { num: '02', title: 'ברית ובר מצווה', desc: 'רגעים מיוחדים שישארו לכם לנצח בתמונות מקצועיות ומרגשות' },
  { num: '03', title: 'אירועים פרטיים', desc: 'ימי הולדת, אירוסין וכל אירוע שמגיע לתיעוד ראוי ומכבד' },
]

function ServicesSection() {
  const ref = useRef()
  useReveal(ref)
  return (
    <section className="services-section">
      <div ref={ref} className="section-inner reveal">
        <span className="label-tag">שירותים</span>
        <h2 className="section-h2">מה אנחנו מציעים</h2>
        <div className="services-grid">
          {services.map((s) => (
            <div key={s.num} className="service-card">
              <span className="service-num">{s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Gallery Section ──────────────────────────────────────────────────────────
function GallerySection() {
  const [lightbox, setLightbox] = useState(null)
  const headerRef = useRef()
  const gridRef   = useRef()
  useReveal(headerRef)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { grid.classList.add('is-revealed'); obs.unobserve(grid) } },
      { threshold: 0.05 }
    )
    obs.observe(grid)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e) => {
      if (e.key === 'Escape')     setLightbox(null)
      if (e.key === 'ArrowLeft')  setLightbox(n => (n + 1) % GALLERY_PHOTOS.length)
      if (e.key === 'ArrowRight') setLightbox(n => (n - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  return (
    <section id="gallery" className="gallery-section">
      <div ref={headerRef} className="section-inner reveal">
        <span className="label-tag">גלריה</span>
        <h2 className="section-h2">העבודות שלנו</h2>
      </div>

      <div ref={gridRef} className="gallery-grid">
        {GALLERY_PHOTOS.map((src, i) => (
          <button
            key={i}
            className="gallery-item"
            style={{ '--i': i }}
            onClick={() => setLightbox(i)}
            aria-label={`פתח תמונה ${i + 1}`}
          >
            <img src={src} alt={`תמונה ${i + 1}`} loading={i < 6 ? 'eager' : 'lazy'} />
            <div className="gallery-item-hover">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="סגור">✕</button>
          <button
            className="lightbox-arrow lightbox-prev"
            onClick={(e) => { e.stopPropagation(); setLightbox(n => (n - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length) }}
            aria-label="הקודם"
          >›</button>
          <img
            src={GALLERY_PHOTOS[lightbox]}
            alt=""
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-arrow lightbox-next"
            onClick={(e) => { e.stopPropagation(); setLightbox(n => (n + 1) % GALLERY_PHOTOS.length) }}
            aria-label="הבא"
          >‹</button>
          <span className="lightbox-counter">{lightbox + 1} / {GALLERY_PHOTOS.length}</span>
        </div>
      )}
    </section>
  )
}

// ─── Showreel Section ─────────────────────────────────────────────────────────
function ShowreelSection() {
  const [playing, setPlaying] = useState(false)
  const [muted,   setMuted]   = useState(true)
  const videoRef = useRef()
  const ref      = useRef()
  useReveal(ref)

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    const onPlay  = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    vid.addEventListener('play',  onPlay)
    vid.addEventListener('pause', onPause)
    return () => { vid.removeEventListener('play', onPlay); vid.removeEventListener('pause', onPause) }
  }, [])

  const toggle = () => {
    const vid = videoRef.current
    if (!vid) return
    if (vid.paused) vid.play(); else vid.pause()
  }

  const toggleMute = (e) => {
    e.stopPropagation()
    const vid = videoRef.current
    if (!vid) return
    vid.muted = !muted
    setMuted(m => !m)
  }

  return (
    <section id="showreel" className="showreel-section">
      <div ref={ref} className="section-inner showreel-header reveal">
        <span className="label-tag label-tag--light">סרטון</span>
        <h2 className="section-h2 showreel-h2">ראו אותנו בפעולה</h2>
      </div>

      <div className="showreel-frame" onClick={toggle}>
        <video
          ref={videoRef}
          src="/assets/video.mp4"
          muted={muted}
          playsInline
          loop
          preload="metadata"
          className="showreel-video"
        />

        <div className={`showreel-overlay${playing ? ' is-playing' : ''}`}>
          <div className="showreel-play-btn" aria-hidden="true">
            {playing
              ? <svg viewBox="0 0 24 24" fill="white" width="40" height="40"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              : <svg viewBox="0 0 24 24" fill="white" width="40" height="40"><polygon points="6,3 20,12 6,21"/></svg>
            }
          </div>
        </div>

        <button className="showreel-mute" onClick={toggleMute} aria-label={muted ? 'בטל השתקה' : 'השתק'}>
          {muted
            ? <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            : <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19"/><path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/></svg>
          }
        </button>
      </div>
    </section>
  )
}

// ─── Reviews Section ──────────────────────────────────────────────────────────
const reviews = [
  { name: 'שירה כהן', event: 'חתונה', text: 'פיקצאק היה פשוט מדהים. התמונות יצאו כמו מגזין — כל רגע תועד עם כזאת רגישות ואמנותיות.' },
  { name: 'דן לוי', event: 'בר מצווה', text: 'מאוד מקצועי, ידע בדיוק מה לצלם ומתי. כל המשפחה אוהבת את התמונות!' },
  { name: 'מיכל ברק', event: 'אירוסין', text: 'הגיע מוכן, אדיב ופשוט תפס את הרגע המושלם. ממליצה בחום לכל אחד!' },
  { name: 'תמר גולדברג', event: 'חתונה', text: 'חלום! יצרנו יחד פשוט יצירת אמנות — תמונות שנתבונן בהן כל חיינו.' },
  { name: 'אביב שמואלי', event: 'ברית', text: 'כל כך נחמד ומקצועי. הצליח להיות בכל מקום ולתפוס כל רגע שהיה חשוב.' },
  { name: 'נועה פרידמן', event: 'יום הולדת', text: 'אמנות טהורה. הבין בדיוק את הסגנון שרציתי ועשה הרבה מעל ומעבר.' },
]

function ReviewsSection() {
  const ref = useRef()
  useReveal(ref)
  return (
    <section className="reviews-section">
      <div ref={ref} className="section-inner reveal">
        <span className="label-tag">המלצות</span>
        <h2 className="section-h2">מה אומרים עלינו</h2>
        <div className="reviews-grid">
          {reviews.map((r) => (
            <article key={r.name} className="review-card">
              <div className="review-stars">★★★★★</div>
              <p className="review-text">"{r.text}"</p>
              <footer className="review-author">
                <strong>{r.name}</strong>
                <span>{r.event}</span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Contact Section ──────────────────────────────────────────────────────────
function ContactSection() {
  const ref = useRef()
  useReveal(ref)
  return (
    <section id="contact" className="contact-section">
      <div ref={ref} className="section-inner contact-inner reveal">
        <span className="label-tag label-tag--light">צור קשר</span>
        <h2 className="section-h2 contact-h2">בואו נצלם ביחד</h2>
        <p className="contact-sub">מוכנים לתעד את הרגעים שלכם? אנחנו כאן בשבילכם</p>
        <div className="contact-btns">
          <a
            href={"https://wa.me/" + PHONE_LINK + "?text=" + encodeURIComponent("היי פיקצאק, אשמח לשמוע פרטים על צילום האירוע שלי")}
            className="btn btn-wa"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            וואטסאפ
          </a>
          <a
            href={INSTAGRAM_URL}
            className="btn btn-ig"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            אינסטגרם
          </a>
        </div>
        <a className="contact-phone" href={"tel:+" + PHONE_LINK}>{PHONE_DISPLAY}</a>
      </div>
    </section>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav className="site-nav" aria-label="ניווט ראשי">
      <a href="#" className="nav-logo" aria-label="פיקצאק">
        <img src="/assets/logo.jpg" alt="פיקצאק" />
        <span>פיקצאק</span>
      </a>
      <div className="nav-links">
        <a href="#gallery">גלריה</a>
        <a href="#showreel">סרטון</a>
        <a href="#contact">צור קשר</a>
      </div>
      <div className="nav-socials" aria-label="רשתות חברתיות">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="אינסטגרם"
        >
          IG
        </a>
        <a
          href={"https://wa.me/" + PHONE_LINK + "?text=" + encodeURIComponent("היי פיקצאק, אשמח לקבל פרטים")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="וואטסאפ"
        >
          WA
        </a>
      </div>
    </nav>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [ready, setReady] = useState(false)
  return (
    <>
      {!ready && <VideoPreloader onDone={() => setReady(true)} />}
      <PageLoader />
      <Nav />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <GallerySection />
        <ShowreelSection />
        <ReviewsSection />
        <ContactSection />
      </main>
    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)
