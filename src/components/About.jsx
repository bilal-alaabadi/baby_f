import React from 'react';
import { Link } from 'react-router-dom';
import perfumeImg from '../assets/IMG_0566 (1).jpg';

const About = () => {
  return (
    <div dir="rtl" className="bg-white text-[#4E5A3F]">
      <section className="max-w-6xl mx-auto py-16 px-4 md:px-8">
        <div className="flex flex-col md:flex-row-reverse items-center gap-10">
          {/* الصورة - حجم أكبر */}
          <div className="md:w-1/2">
            <img
              src={perfumeImg}
              alt="منتجات آيفي"
              className="w-full max-w-md mx-auto rounded-xl shadow-lg transform scale-105"
            />
          </div>

          {/* النص - أكثر تفصيلاً */}
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold text-[#d3ae27] mb-6">الأنثور</h2>
            <p className="text-gray-700 text-lg leading-loose mb-6">
              تهتم بجمـع التـراث والأصالـة في بخات عطرية فريدة
            </p>
            
            <p className="text-gray-700 leading-loose mb-4">
              منذ تأسيسنا، ونحن نسعى لخلق عطور تحكي قصصاً، تعبر عن هويات، وتخلد ذكريات.
              كل زجاجة تحمل بين طياتها رائحة التاريخ وعبق المستقبل.
            </p>
            
            <p className="text-gray-700 leading-loose mb-4">
              نختار مكوناتنا بعناية فائقة من أفضل المصادر العالمية، لنقدم لكم تجربة عطرية
              لا تُنسى، تتناغم مع شخصيتكم وتضفي لمسة من الفخامة على حياتكم اليومية.
            </p>
            
            <p className="text-gray-700 leading-loose mb-6">
              في آيفي، نؤمن أن العطر ليس مجرد رائحة، بل هو بصمة تتركها في كل مكان تذهب إليه.
            </p>
            
            <p className="text-gray-700 font-medium">
              الأنثور - رائحة تخلد الذكرى
            </p>
          </div>
        </div>

        <div className="text-center mt-16">
         
          <p className="text-xl text-[#d3ae27] font-semibold">
            الأنثور هو أكثر من مجرد عطر... هو حكاية ترويها أنت
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;