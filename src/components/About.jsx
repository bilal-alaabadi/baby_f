import React from 'react';
import { Link } from 'react-router-dom';
import perfumeImg from '../assets/IMG_0566 (1).jpg';

const About = () => {
  return (
    <div dir="rtl" className="bg-white text-[#4E5A3F]">
      <section className="max-w-6xl mx-auto py-16 px-4 md:px-8">
        <div className="flex flex-col md:flex-row-reverse items-center gap-10">
          {/* الصورة */}
          {/* <div className="md:w-1/2">
            <img
              src={perfumeImg}
              alt="قصتنا"
              className="w-full max-w-md mx-auto rounded-xl shadow-lg transform scale-105"
            />
          </div> */}

          {/* النص */}
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold text-[#d3ae27] mb-6">قصتنا</h2>

            <p className="text-gray-700 text-lg leading-loose mb-6">
              انطلقت فكرة هذا المشروع من إيمان عميق بأن الطفولة هي المرحلة الأجمل في حياة الإنسان،
              وأن كل منتج يصل إلى يد طفل يمكن أن يصنع فرقًا في يومه، ويترك أثرًا جميلاً في ذاكرته.
            </p>

            <p className="text-gray-700 leading-loose mb-6">
              ومن هنا جاءت رؤيتنا لنوفر للأسر مكانًا موثوقًا يجدون فيه ما يبحثون عنه من ألعاب
              ومستلزماتها، تجمع بين المتعة والفائدة، وبين الجودة والأمان. فالألعاب ليست مجرد تسلية،
              بل هي وسيلة للتعلّم، واكتشاف العالم، وصناعة لحظات تبقى في الذاكرة.
            </p>

            <p className="text-gray-700 leading-loose">
              نؤمن أن دورنا يتجاوز البيع، فنحن نرافق الأهالي في رحلتهم لتوفير ما يسعد أطفالهم
              ويغذي خيالهم، لنكون شريكًا في بناء طفولة مليئة بالبهجة والإبداع.
            </p>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-xl text-[#d3ae27] font-semibold">
            شريككم في طفولة مليئة بالبهجة والإبداع
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
