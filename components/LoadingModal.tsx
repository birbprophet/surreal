import React from "react";
import { motion } from "framer-motion";

const Component: React.FC = () => {
  const loadingContainer = {
    width: "6rem",
    height: "6rem",
    display: "flex",
    justifyContent: "space-around",
    margin: "auto"
  };

  const loadingCircle = {
    display: "block",
    width: "1.5rem",
    height: "1.5rem",
    borderRadius: "0.25rem"
  };

  const loadingContainerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2
      }
    },
    end: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const loadingCircleVariants = {
    start: {
      y: "50%"
    },
    end: {
      y: "150%"
    }
  };

  const loadingCircleTransition = {
    duration: 0.5,
    yoyo: Infinity,
    ease: "easeInOut"
  };

  return (
    <>
      <div className="absolute top-0 h-full w-full bg-white opacity-75 z-10"></div>
      <div className="absolute flex-1 flex h-screen w-screen z-20">
        <motion.div
          style={loadingContainer}
          variants={loadingContainerVariants}
          initial="start"
          animate="end"
        >
          <motion.span
            className="bg-indigo-700"
            style={loadingCircle}
            variants={loadingCircleVariants}
            transition={loadingCircleTransition}
          />
          <motion.span
            className="bg-indigo-700"
            style={loadingCircle}
            variants={loadingCircleVariants}
            transition={loadingCircleTransition}
          />
          <motion.span
            className="bg-indigo-700"
            style={loadingCircle}
            variants={loadingCircleVariants}
            transition={loadingCircleTransition}
          />
        </motion.div>
      </div>
    </>
  );
};

export default Component;
