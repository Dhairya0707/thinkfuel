"use client";

import { motion, Variants } from "framer-motion";

type TransitionProps = {
  children: React.ReactNode;
  direction?: "left" | "right";
};

export default function Transition({
  children,
  direction = "left",
}: TransitionProps) {
  const offset = 60; // percent of viewport width to slide

  const variants: Variants = {
    initial: {
      x: direction === "left" ? `-${offset}vw` : `${offset}vw`,
      opacity: 0,
      scale: 0.98,
    },
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: {
      x: direction === "left" ? `${offset}vw` : `-${offset}vw`,
      opacity: 0,
      scale: 0.98,
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{
        duration: 1,
        ease: [0.4, 0, 0.2, 1], // smooth & polished easing
        delay: 0.05,
      }}
      style={{
        position: "absolute",
        width: "100%",
      }}
    >
      {children}
    </motion.div>
  );
}

// "use client";

// import { motion } from "framer-motion";

// export default function Transition({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <motion.div
//       initial={{ y: 20, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ ease: "easeInOut", duration: 0.75 }}
//     >
//       {children}
//     </motion.div>
//   );
// }
