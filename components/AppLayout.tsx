import React from "react";

interface IProps {
  routerPath: string;
}

const Layout: React.FC<IProps> = ({ children, routerPath }) => {
  console.log(routerPath);
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow bg-indigo-100">{children}</main>
      <TabBar routerPath={routerPath} />
    </div>
  );
};

const TabBar: React.FC<IProps> = ({ routerPath }) => {
  return (
    <footer className="sticky bottom-0 flex flex-row bg-white h-16">
      
    </footer>
  );
};

export default Layout;
