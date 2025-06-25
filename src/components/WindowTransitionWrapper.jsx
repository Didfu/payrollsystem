'use client';
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

const WindowTransitionWrapper = ({ children, keyName }) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={keyName}
        
        transition={{ 
          duration: 0.2,
          ease: "easeOut"
        }}
        
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default WindowTransitionWrapper;
