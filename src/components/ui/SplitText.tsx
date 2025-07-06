import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: "chars" | "words" | "lines" | "words, chars";
  from?: Record<string, any>;
  to?: Record<string, any>;
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "center" | "right";
  onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = "",
  delay = 100,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  onLetterAnimationComplete,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const animationCompletedRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Custom text splitting function
  const splitText = (text: string, type: string) => {
    switch (type) {
      case "chars":
        return text.split("").map((char, i) => char === " " ? "\u00A0" : char);
      case "words":
        return text.split(" ");
      case "lines":
        return text.split("\n");
      default:
        return text.split("");
    }
  };

  const parts = splitText(text, splitType);

  useEffect(() => {
    const el = ref.current;
    if (!el || animationCompletedRef.current) return;

    const elements = el.querySelectorAll('.split-element');
    
    if (elements.length === 0) return;

    // Set initial styles for better performance
    gsap.set(elements, {
      ...from,
      willChange: "transform, opacity",
      force3D: true,
    });

    // Create timeline with simpler scroll trigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        toggleActions: "play none none none",
        once: true,
        onComplete: () => {
          animationCompletedRef.current = true;
          // Clean up willChange for better performance
          gsap.set(elements, { clearProps: "willChange" });
          onLetterAnimationComplete?.();
        },
      },
      onComplete: () => {
        // Additional cleanup
        gsap.set(elements, { clearProps: "willChange" });
      },
    });

    // Animate elements
    tl.to(elements, {
      ...to,
      duration,
      ease,
      stagger: delay / 1000,
      force3D: true,
    });

    timelineRef.current = tl;

    return () => {
      // Comprehensive cleanup
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === el) {
          trigger.kill();
        }
      });
      gsap.killTweensOf(elements);
    };
  }, [text, delay, duration, ease, splitType, threshold, rootMargin, onLetterAnimationComplete]);

  return (
    <div
      ref={ref}
      className={`split-parent ${className}`}
      style={{
        textAlign,
        overflow: "hidden",
        display: "inline-block",
        whiteSpace: "normal",
        wordWrap: "break-word",
      }}
    >
      {parts.map((part, index) => (
        <span
          key={index}
          className="split-element"
          style={{
            display: splitType === "words" ? "inline-block" : "inline",
            marginRight: splitType === "words" && part !== "\u00A0" ? "0.25em" : "0",
          }}
        >
          {part}
        </span>
      ))}
    </div>
  );
};

export default SplitText; 