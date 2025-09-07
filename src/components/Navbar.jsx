import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import CartModal from '../pages/shop/CartModal';
import avatarImg from "../assets/avatar.png";
import { useLogoutUserMutation } from '../redux/features/auth/authApi';
import { logout } from '../redux/features/auth/authSlice';
import log from "../assets/logo.png"; // شعار
import { setCountry } from '../redux/features/cart/cartSlice';

const Navbar = () => {
  const products = useSelector((state) => state.cart.products);
  const { country } = useSelector((state) => state.cart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // << shrinks on scroll
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutUser] = useLogoutUserMutation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCartToggle = () => setIsCartOpen(!isCartOpen);
  const handleDropDownToggle = () => setIsDropDownOpen(!isDropDownOpen);
  const handleMobileMenuToggle = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleCountryChange = (e) => {
    dispatch(setCountry(e.target.value));
  };

  const adminMenus = [
    { label: "لوحة التحكم", path: "/dashboard/admin" },
    { label: "إدارة العناصر", path: "/dashboard/manage-products" },
    { label: "جميع الطلبات", path: "/dashboard/manage-orders" },
    { label: "إضافة منتج", path: "/dashboard/add-product" },
  ];

  const userMenus = [{ label: "لوحة التحكم", path: "/dashboard" }];

  const dropdownMenus = user?.role === 'admin' ? adminMenus : userMenus;

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <>
      {/* Spacer لمنع القفز عند التثبيت/التصغير */}
      <div
        aria-hidden
        className={`w-full ${isScrolled ? 'h-20 md:h-24' : 'h-28 md:h-40'}`}
      />

      <header
        className={[
          "fixed top-0 left-0 right-0 z-50 bg-white shadow-sm transition-all duration-300",
          isScrolled ? "py-2" : "pt-10"
        ].join(" ")}
      >
        <div className="mx-auto px-4">
          {/* Mobile Navbar */}
          <div className={[
              "md:hidden flex items-center justify-between transition-all duration-300",
              isScrolled ? "h-14 mb-0 pb-4 pt-2" : "h-16 mb-2 pb-12 pt-4"
            ].join(" ")}
          >
            <button
              onClick={handleMobileMenuToggle}
              className="text-gray-800 text-2xl"
              aria-label="القائمة"
              title="القائمة"
            >
              <i className="ri-menu-line"></i>
            </button>

            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link to="/">
                <img
                  src={log}
                  alt="الشعار"
                  className={[
                    "object-contain transition-all duration-300",
                    isScrolled ? "h-14" : "h-24"
                  ].join(" ")}
                />
              </Link>
            </div>

            <div className="flex items-center gap-4" dir="rtl">
              {/* أزلنا زر البحث من هنا ليكون حصريًا في الشريط المنزلق */}
              {user ? (
                <div className="relative">
                  <img
                    onClick={handleDropDownToggle}
                    src={user?.profileImage || avatarImg}
                    alt="صورة المستخدم"
                    className={[
                      "rounded-full cursor-pointer border-2 border-gray-200 transition-all duration-300",
                      isScrolled ? "w-9 h-9" : "w-10 h-10"
                    ].join(" ")}
                  />
                  {isDropDownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <ul className="py-2">
                        {dropdownMenus.map((menu, idx) => (
                          <li key={idx}>
                            <Link
                              to={menu.path}
                              onClick={() => setIsDropDownOpen(false)}
                              className="block px-4 py-3 text-lg text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              {menu.label}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-right px-4 py-3 text-lg text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            تسجيل الخروج
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="text-[var(--brand)] text-2xl">
                  <i className="ri-user-line"></i>
                </Link>
              )}

              <button
                onClick={handleCartToggle}
                className="relative text-[var(--brand)] text-2xl"
                aria-label="سلة المشتريات"
                title="سلة المشتريات"
              >
                <i className="ri-shopping-bag-line"></i>
                {products.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[var(--accent)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {products.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Navbar */}
          <div className={[
              "hidden md:flex items-center justify-between transition-all duration-300",
              isScrolled ? "h-16 pb-4" : "h-20 pb-7"
            ].join(" ")}
          >
            <div className="flex items-center gap-6">
              {/* أزلنا زر البحث من الديسكتوب أيضًا */}
              <Link
                to="/search"
                className={[
                  "text-[var(--brand)] hover:text-[var(--accent)] transition-all duration-300",
                  isScrolled ? "text-2xl" : "text-3xl"
                ].join(" ")}
                aria-label="بحث"
                title="بحث"
              >
                <i className="ri-search-line"></i>
              </Link>
              <button
                onClick={handleCartToggle}
                className={[
                  "relative text-[var(--brand)] hover:text-[var(--accent)] transition-all duration-300",
                  isScrolled ? "text-2xl" : "text-3xl"
                ].join(" ")}
                aria-label="سلة المشتريات"
                title="سلة المشتريات"
              >
                <i className="ri-shopping-bag-line"></i>
                {products.length > 0 && (
                  <span className={[
                      "absolute -top-2 -right-2 bg-[var(--accent)] text-white rounded-full flex items-center justify-center",
                      isScrolled ? "text-xs w-5 h-5" : "text-sm w-6 h-6"
                    ].join(" ")}
                  >
                    {products.length}
                  </span>
                )}
              </button>
            </div>

            <div className="flex-grow flex justify-center">
              <Link to="/">
                <img
                  src={log}
                  alt="الشعار"
                  className={[
                    "object-contain transition-all duration-300 hover:scale-105",
                    isScrolled ? "h-16" : "h-28"
                  ].join(" ")}
                />
              </Link>
            </div>

            <div className="flex items-center gap-4" dir="rtl">
              {user ? (
                <div className="relative">
                  <img
                    onClick={handleDropDownToggle}
                    src={user?.profileImage || avatarImg}
                    alt="صورة المستخدم"
                    className={[
                      "rounded-full cursor-pointer border-2 border-gray-200 hover:border-[var(--accent)] transition-all duration-300",
                      isScrolled ? "w-10 h-10" : "w-12 h-12"
                    ].join(" ")}
                  />
                  {isDropDownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <ul className="py-2">
                        {dropdownMenus.map((menu, idx) => (
                          <li key={idx}>
                            <Link
                              to={menu.path}
                              onClick={() => setIsDropDownOpen(false)}
                              className="block px-4 py-3 text-lg text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              {menu.label}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-right px-4 py-3 text-lg text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            تسجيل الخروج
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className={[
                    "text-[var(--brand)] hover:text-[var(--accent)] transition-colors",
                    isScrolled ? "text-2xl" : "text-3xl"
                  ].join(" ")}
                >
                  <i className="ri-user-line"></i>
                </Link>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className={[
              "hidden md:flex justify-center border-t border-gray-200 transition-all duration-300",
              isScrolled ? "py-2 mt-0" : "py-4 mt-2"
            ].join(" ")}
          >
            <div className="flex gap-10">
              <Link to="/shop" className="text-[var(--brand)] hover:text-[var(--accent)] font-bold text-xl transition-colors">
                المنتجات
              </Link>
              <Link to="/" className="text-[var(--brand)] hover:text-[var(--accent)] font-bold text-xl transition-colors">
                الصفحة الرئيسية
              </Link>
              <Link to="/about" className="text-[var(--brand)] hover:text-[var(--accent)] font-bold text-xl transition-colors">
                من نحن
              </Link>
            </div>
          </nav>
        </div>

        {/* Mobile Sliding Menu */}
        <div className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="px-6 py-6 flex flex-col items-center gap-4">
              <button
                onClick={handleMobileMenuToggle}
                className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-2xl"
              >
                <i className="ri-close-line"></i>
              </button>

              {/* زر البحث — حصري للموبايل في الشريط المنزلق */}
              <Link
                to="/search"
                onClick={handleMobileMenuToggle}
                className="w-full text-center py-4 px-6 font-bold text-lg text-white bg-[var(--brand)] hover:bg-[var(--brand-dark)] rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                aria-label="بحث"
                title="بحث"
              >
                <i className="ri-search-line text-xl"></i>
                بحث عن المنتجات
              </Link>

              <Link
                to="/shop"
                onClick={handleMobileMenuToggle}
                className="w-full text-center py-4 px-6 font-medium text-xl text-[var(--brand)] hover:text-[var(--accent)] rounded-lg transition-all duration-300"
              >
                المنتجات
              </Link>
              <Link
                to="/"
                onClick={handleMobileMenuToggle}
                className="w-full text-center py-4 px-6 font-medium text-xl text-[var(--brand)] hover:text-[var(--accent)] rounded-lg transition-all duration-300"
              >
                الصفحة الرئيسية
              </Link>
              <Link
                to="/about"
                onClick={handleMobileMenuToggle}
                className="w-full text-center py-4 px-6 font-medium text-xl text-[var(--brand)] hover:text-[var(--accent)] rounded-lg transition-all duration-300"
              >
                من نحن
              </Link>
            </div>
          </div>
        </div>

        {/* Cart Modal */}
        {isCartOpen && (
          <CartModal
            products={products}
            isOpen={isCartOpen}
            onClose={handleCartToggle}
          />
        )}
      </header>
    </>
  );
};

export default Navbar;
