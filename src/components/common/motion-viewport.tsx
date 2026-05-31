"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface MotionViewportProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  viewPortOnce?: boolean;
}

export function FadeIn({ children, delay = 0, viewPortOnce = true, ...props }: MotionViewportProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: viewPortOnce }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeInStagger({ children, viewPortOnce = true, ...props }: MotionViewportProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: viewPortOnce }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeInStaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
