import React from 'react';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#e2e5e5] py-5">
      <div className="mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-right">
          
          {/* قسم قصتنا */}
          <div className='text-[#4E5A3F]'>
            <h4 className="text-lg font-bold mb-4 text-[#4E5A3F]">قصتنا</h4>
            <ul className="space-y-2 text-[#4E5A3F]">
              <li>
                <a href="/about" className="transition-colors duration-300 hover:text-[#d3ae27] text-[#4E5A3F]">
                  تعرف على متجر الأنثور 
                </a>
              </li>
            </ul>
          </div>
          
          {/* قسم المنتجات */}
          <div className='text-[#4E5A3F]'>
            <h4 className="text-lg font-bold mb-4 text-[#4E5A3F]">عن المتجر</h4>
            <ul className="space-y-2 text-[#4E5A3F]">
              <li>
                <a href="/shop" className="transition-colors duration-300 hover:text-[#d3ae27] text-[#4E5A3F]">المنتجات</a>
              </li>
            </ul>
          </div>
          
          {/* قسم الشروط */}
          <div className='text-[#4E5A3F]'>
            <h4 className="text-lg font-bold mb-4 text-[#4E5A3F]">الشروط والأحكام</h4>
            <ul className="space-y-2 text-[#4E5A3F]">
              <li>
                <a href="/return-policy" className="transition-colors hover:text-[#d3ae27] duration-300 text-[#4E5A3F]">سياسة الاسترجاع</a>
              </li>
            </ul>
          </div>
          
          {/* قسم التواصل */}
          <div className='text-[#4E5A3F]'>
            <h4 className="text-lg font-bold mb-4 text-[#4E5A3F]">وسائل التواصل</h4>
            <div className="flex justify-center md:justify-end gap-4 text-[#4E5A3F]">
              <a
                href="https://www.instagram.com/al__anthur/reels/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#d3ae27] transition"
              >
                <FaInstagram className="text-xl" />
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=96895441416&text&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#d3ae27] transition"
              >
                <FaWhatsapp className="text-xl" />
              </a>
            </div>
          </div>
        </div>

        {/* حقوق النشر */}
        <div className="border-t mt-10 pt-5 text-center text-sm text-[#4E5A3F]">
          <p className="leading-relaxed text-[#4E5A3F]">
            تم التطوير بواسطة  
            <a
              href="https://www.instagram.com/mobadeere/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#d3ae27] font-semibold hover:underline mx-1 text-[#4E5A3F]"
            >
              شركة مُبادر 
            </a>
            بجودة واحترافية
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
