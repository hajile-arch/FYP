import React from "react";
import { Link } from "react-router-dom";

interface OptionProps {
  imageSrc: string;
  imageTitle: string;
  linkTo: string; // URL to navigate on click
}

const Option: React.FC<OptionProps> = ({ imageSrc, imageTitle, linkTo }) => {
  return (
    <Link
      to={linkTo}
      className="relative group bg-white flex justify-center items-center h-[320px] w-[320px] overflow-hidden"
    >
      <img
        src={imageSrc}
        alt={imageTitle}
        className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110 rounded"
      />
      <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-20 transition-opacity duration-300"></div>
      <p className="bebas-neue-regular absolute bottom-2 left-2 text-white font-bold text-[40px] pl-4">
        {imageTitle}
      </p>
    </Link>
  );
};

export default Option;
