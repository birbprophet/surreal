import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { FiHome, FiPlusCircle, FiUser } from "react-icons/fi";

interface IProps {
  routerPath: string;
}

const Layout: React.FC<IProps> = ({ children, routerPath }) => {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-grow bg-indigo-100 overflow-y-auto">
        {children}
      </main>
      <TabBar routerPath={routerPath} />
    </div>
  );
};

const TabBar: React.FC<IProps> = ({ routerPath }) => {
  return (
    <footer
      className="sticky bottom-0 flex flex-row bg-white h-16 shadow-xl"
      style={{ minHeight: "64px" }}
    >
      <TabItem path="/home" routerPath={routerPath}>
        <FiHome />
      </TabItem>
      <TabItem path="/create" routerPath={routerPath}>
        <FiPlusCircle className="text-2xl text-indigo-900" />
      </TabItem>
      <TabItem path="/profile" routerPath={routerPath}>
        <FiUser className="" />
      </TabItem>
    </footer>
  );
};

const TabItem: React.FC<{ path: string, routerPath: string }> = ({
  path,
  routerPath,
  children
}) => {
  const isOpen = path === routerPath;

  const variants = {
    open: {
      scale: [1, 1.4, 1.25]
    },
    closed: { scale: 1 }
  };

  return (
    <Link href={path}>
      <div className="flex-1 flex">
        <motion.div
          className={"m-auto text-2xl text-indigo-900"}
          animate={isOpen ? "open" : "closed"}
          variants={variants}
          whileTap={{ scale: 0.9 }}
        >
          {children}
        </motion.div>
      </div>
    </Link>
  );
};

export default Layout;
