"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  skeleton: ReactNode;
  rootMargin?: string;
}

export default function LazySection({ children, skeleton, rootMargin = "200px 0px" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          obs.disconnect();
        }
      },
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);

  return <div ref={ref}>{show ? children : skeleton}</div>;
}
