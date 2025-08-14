import React from 'react';
import { Link } from 'react-router-dom';
import timings from "../../assets/بنر-عطور02 (1).jpg";

const Banner = () => {
  return (
    <div className="py-1 px-2"> {/* قللنا المسافة العلوية والسفلية */}
      <div className="text-right" dir="rtl">
        {/* محتوى نصي لو احتجته */}
      </div>

      <div className="mt-4"> {/* قللنا المسافة بين النص والصورة */}
        <Link to="/shop">
          <img
            src={timings}
            alt="صورة البانر"
            className="w-full h-auto object-contain max-w-[100%] mx-auto"
          />
        </Link>
      </div>
    </div>
  );
};

export default Banner;
