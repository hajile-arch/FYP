import React from 'react';

const Preloader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col md:flex-row items-center justify-center bg-black z-50">
      {/* Logo on the left on large screens, on top on smaller screens */}
      <img
        src="src\assets\takeaway.png"
        alt="Logo"
        className="h-16 w-16 md:h-24 md:w-24 mb-4 md:mb-0 md:mr-8"
      />
      {/* Text on the right, but stacked on smaller screens */}
      <div className="text-left text-white ">
        <div className="text-4xl md:text-6xl montserrat-bold md:-ml-[10px]">CampusEats</div>
        <div className="text-xl md:text-2xl bebas-neue-regular">From Campus to Plate</div>
      </div>
    </div>
  );
};

export default Preloader;
