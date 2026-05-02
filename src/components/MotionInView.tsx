import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Reusable scroll-reveal wrapper. Subtle by default, respects prefers-reduced-motion.
 */
const MotionInView = ({
  children,
  delay = 0,
  y = 16,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) => {
  const reduce = useReducedMotion();
  const Comp = motion[As as "div"];
  return (
    <Comp
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease }}
      className={className}
    >
      {children}
    </Comp>
  );
};

export default MotionInView;