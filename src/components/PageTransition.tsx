import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";

/**
 * Page transition wrapper. Uses Outlet so nested routes still work,
 * and AnimatePresence keyed by pathname for buttery cross-fades.
 */
const PageTransition = () => {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="will-change-[transform,opacity]"
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;