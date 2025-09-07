import React from "react";
import log from "../assets/logo.png"; // شعار Baby Haven
import {
  SiVisa,
  SiMastercard,
  SiApplepay,
  SiPaypal,
  SiGooglepay,
} from "react-icons/si";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white">
      {/* ===== شريط علوي FULL-BLEED بعرض الشاشة بالكامل ===== */}
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
        {/* الخلفية المنحنية */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 36"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M28 0 H100 V36 H28 A28 28 0 0 1 28 0 Z" fill="#92B0B0" />
        </svg>

        {/* محتوى الشريط */}
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* الشعار (كما هو) */}
            <div className="shrink-0 self-start">
              <img
                src={log}
                alt="شعار Baby Haven"
                className="w-28 md:w-40 object-contain select-none pointer-events-none"
              />
            </div>

            {/* وسائل الدفع */}
            <div className="text-white w-full md:w-auto md:ml-auto md:self-center">
              <div className="w-full flex justify-end">
                <div className="flex items-center gap-5 md:gap-6 mb-3 md:mb-4">
                  <SiVisa className="text-3xl md:text-4xl drop-shadow-sm" />
                  <SiMastercard className="text-3xl md:text-4xl drop-shadow-sm" />
                  <SiApplepay className="text-3xl md:text-4xl drop-shadow-sm" />
                  {/* <SiPaypal className="text-3xl md:text-4xl drop-shadow-sm" /> */}
                  <SiGooglepay className="text-3xl md:text-4xl drop-shadow-sm" />
                </div>
              </div>

              <p className="text-right text-lg md:text-2xl font-semibold leading-relaxed">
                وسائل دفع متعددة
                <br />
                اختر وسيلة الدفع المناسبة
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* ===== نهاية الشريط العلوي ===== */}

      {/* الأقسام السفلية */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-10 grid grid-cols-1 md:grid-cols-3 gap-10 text-[#4E5A3F] md:text-right text-center">
          {/* Baby Haven */}
          <div>
            <h4 className="text-xl font-bold mb-3">Baby Haven</h4>
            <p className="text-sm leading-7">
              نهتم بجمع التراث والأصالة في باقات عطرية فريدة. منذ تأسيسنا ونحن
              نسعى لإبداع عطور تُحاكي قصصًا، تعبر عن هويتك وتخلّد ذكرياتك، كما
              نقدم لك تجربة تحمل بين طياتها رائحة التاريخ وعبق المستقبل.
            </p>
          </div>

          {/* روابط مهمة */}
          <div>
            <h4 className="text-xl font-bold mb-3">روابط مهمة</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/about" className="hover:text-[#d3ae27] transition">
                  من نحن
                </a>
              </li>
              <li></li>
              <li>
                <a
                  href="/return-policy"
                  className="hover:text-[#d3ae27] transition"
                >
                  سياسة الاستبدال والاسترجاع
                </a>
              </li>
            </ul>
          </div>

          {/* تواصل معنا */}
          <div>
            <h4 className="text-xl font-bold mb-3">تواصل معنا</h4>
            <p className="text-sm mb-2">+96877613033</p>
            {/* الإيميل (مضاف فقط) */}
            <a
              href="mailto:baby7aven.om@gmail.com"
              className="text-sm underline hover:text-[#d3ae27] transition"
            >
              baby7aven.om@gmail.com
            </a>
            <div className="flex justify-center md:justify-start gap-4 mt-4">
              <a
                href="https://www.instagram.com/babyhaven_om?igsh=MTFuYzBkZDd2dzIxeg%3D%3D&utm_source=qr"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#d3ae27] transition"
                aria-label="Instagram"
              >
                <FaInstagram className="text-xl" />
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=96877613033"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#d3ae27] transition"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="text-xl" />
              </a>
            </div>
          </div>
        </div>

        {/* الحقوق */}
        <div className="border-t border-[#4E5A3F]/30 pt-4 pb-8 text-center text-sm text-[#4E5A3F]">
          جميع الحقوق محفوظة لدى متجر Baby Haven —{" "}
          <a
            href="https://www.instagram.com/mobadeere/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#2e3528] transition-colors"
          >
            تصميم مبادر
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
