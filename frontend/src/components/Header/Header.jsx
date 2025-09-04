
// import React, { useEffect, useRef, useState } from "react";
// import Logo from "../../assets/Logo.png";
// import { Link } from "react-router-dom";
// import { HashLink } from "react-router-hash-link";

// export default function Header() {
//   const THEME = {
//     bg: "rgba(255, 255, 255, 0.7)", // translucent glass
//     brown: "#854836",
//     gold: "#FFB22C",
//     text: "#000000",
//     font: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
//   };

//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   // Close dropdown on outside click
//   useEffect(() => {
//     function onDocClick(e) {
//       if (!dropdownRef.current) return;
//       if (!dropdownRef.current.contains(e.target)) setDropdownOpen(false);
//     }
//     document.addEventListener("click", onDocClick);
//     return () => document.removeEventListener("click", onDocClick);
//   }, []);

//   const linkBase =
//     "flex items-center py-2 px-3 rounded-sm transition-colors duration-200";
//   const linkStyle = { color: THEME.brown };
//   const hoverHandlers = {
//     onMouseEnter: (e) => (e.currentTarget.style.color = THEME.gold),
//     onMouseLeave: (e) => (e.currentTarget.style.color = THEME.brown),
//   };

//   // Helper renderers to keep styling identical between desktop & mobile
//   const renderRouteLink = (to, label, extraProps = {}) => (
//     <Link
//       to={to}
//       className={linkBase}
//       style={linkStyle}
//       {...hoverHandlers}
//       {...extraProps}
//     >
//       {label}
//     </Link>
//   );

//   const renderHashLink = (to, label, extraProps = {}) => (
//     <HashLink
//       smooth
//       to={to}
//       className={linkBase}
//       style={linkStyle}
//       {...hoverHandlers}
//       {...extraProps}
//     >
//       {label}
//     </HashLink>
//   );

//   // For items you haven't wired yet, keep as '#'
//   const renderStub = (label, extraProps = {}) => (
//     <a
//       href="#"
//       className={linkBase}
//       style={linkStyle}
//       {...hoverHandlers}
//       {...extraProps}
//     >
//       {label}
//     </a>
//   );

//   return (
//     <nav
//       className="border-b w-full sticky top-0 z-50 shadow-lg backdrop-blur-md"
//       style={{
//         background: THEME.bg,
//         fontFamily: THEME.font,
//         boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)", // clean floating shadow
//         borderColor: "rgba(255,255,255,0.3)", // subtle border on glass
//       }}
//     >
//       <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
//         {/* Logo */}
//         <Link to="/home" className="flex items-center gap-3">
//           <img src={Logo} className="h-10 w-auto" alt="Trippens Logo" />
//         </Link>

//         {/* Desktop menu */}
//         <div className="hidden md:block">
//           <ul className="flex items-center gap-8 font-medium">
//             <li>{renderRouteLink("/home", "Home")}</li>
//             <li>{renderHashLink("/home#about", "About Us")}</li>

//             {["Kerala to Kashmir", "Adventure", "Domestic", "International"].map(
//               (item) => (
//                 <li key={item}>
//                   {item === "Domestic"
//                     ? renderRouteLink(
//                         "/categories/68ad71659f92ae4d957a54b9",
//                         "Domestic"
//                       )
//                     : renderStub(item)}
//                 </li>
//               )
//             )}

//             {/* Contact goes to /contact */}
//             <li>{renderRouteLink("/contact", "Contact")}</li>
//           </ul>
//         </div>

//         {/* Mobile toggle */}
//         <button
//           type="button"
//           onClick={() => setMobileOpen((s) => !s)}
//           className="md:hidden inline-flex items-center p-2 w-10 h-10 justify-center rounded-lg transition"
//           style={{ color: THEME.brown }}
//           aria-label="Toggle menu"
//         >
//           <svg
//             className="w-6 h-6"
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 17 14"
//           >
//             <path
//               stroke="currentColor"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M1 1h15M1 7h15M1 13h15"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Mobile menu */}
//       <div
//         className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${
//           mobileOpen ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-80"
//         }`}
//         style={{
//           background: "rgba(255,255,255,0.85)",
//           backdropFilter: "blur(12px)",
//         }}
//       >
//         <ul className="flex flex-col px-4 pb-4 font-medium">
//           <li>
//             {renderRouteLink("/home", "Home", {
//               className: "block py-2 px-2 rounded-md transition-colors",
//               onClick: () => setMobileOpen(false),
//             })}
//           </li>
//           <li>
//             {renderHashLink("/home#about", "About Us", {
//               className: "block py-2 px-2 rounded-md transition-colors",
//               onClick: () => setMobileOpen(false),
//             })}
//           </li>

//           {["Kerala to Kashmir", "Adventure", "Domestic", "International"].map(
//             (item) => (
//               <li key={item}>
//                 {item === "Domestic"
//                   ? renderRouteLink(
//                       "/categories/68ad71659f92ae4d957a54b9",
//                       "Domestic",
//                       {
//                         className:
//                           "block py-2 px-2 rounded-md transition-colors",
//                         onClick: () => setMobileOpen(false),
//                       }
//                     )
//                   : renderStub(item, {
//                       className: "block py-2 px-2 rounded-md transition-colors",
//                       onClick: () => setMobileOpen(false),
//                     })}
//               </li>
//             )
//           )}

//           <li>
//             {renderRouteLink("/contact", "Contact", {
//               className: "block py-2 px-2 rounded-md transition-colors",
//               onClick: () => setMobileOpen(false),
//             })}
//           </li>
//         </ul>
//       </div>
//     </nav>
//   );
// }


import React, { useEffect, useRef, useState } from "react";
import Logo from "../../assets/Logo.png";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

export default function Header() {
  const THEME = {
    bg: "rgba(255, 255, 255, 0.7)", // translucent glass
    brown: "#854836",
    gold: "#FFB22C",
    text: "#000000",
    font: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const linkBase =
    "flex items-center py-2 px-3 rounded-sm transition-colors duration-200";
  const linkStyle = { color: THEME.brown };
  const hoverHandlers = {
    onMouseEnter: (e) => (e.currentTarget.style.color = THEME.gold),
    onMouseLeave: (e) => (e.currentTarget.style.color = THEME.brown),
  };

  // Category links (dummy paths for now — replace later)
  const CATEGORY_LINKS = [
    { label: "Kerala to Kashmir", to: "/tours/kerala-to-kashmir-demo" },
    { label: "Adventure", to: "/categories/adventure-demo" },
    { label: "Domestic", to: "/categories/68ad71659f92ae4d957a54b9" }, // real
    { label: "International", to: "/categories/68ad71a59f92ae4d957a54be" },
  ];

  // Helper renderers (keeps styling identical)
  const renderRouteLink = (to, label, extraProps = {}) => (
    <Link
      to={to}
      className={linkBase}
      style={linkStyle}
      {...hoverHandlers}
      {...extraProps}
    >
      {label}
    </Link>
  );

  const renderHashLink = (to, label, extraProps = {}) => (
    <HashLink
      smooth
      to={to}
      className={linkBase}
      style={linkStyle}
      {...hoverHandlers}
      {...extraProps}
    >
      {label}
    </HashLink>
  );

  return (
    <nav
      className="border-b w-full sticky top-0 z-50 shadow-lg backdrop-blur-md"
      style={{
        background: THEME.bg,
        fontFamily: THEME.font,
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
        borderColor: "rgba(255,255,255,0.3)",
      }}
    >
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-3">
          <img src={Logo} className="h-10 w-auto" alt="Trippens Logo" />
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:block">
          <ul className="flex items-center gap-8 font-medium">
            <li>{renderRouteLink("/home", "Home")}</li>
            <li>{renderHashLink("/home#about", "About Us")}</li>

            {CATEGORY_LINKS.map(({ label, to }) => (
              <li key={label}>{renderRouteLink(to, label)}</li>
            ))}

            {/* Contact */}
            <li>{renderRouteLink("/contact", "Contact")}</li>
          </ul>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((s) => !s)}
          className="md:hidden inline-flex items-center p-2 w-10 h-10 justify-center rounded-lg transition"
          style={{ color: THEME.brown }}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${
          mobileOpen ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-80"
        }`}
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <ul className="flex flex-col px-4 pb-4 font-medium">
          <li>
            {renderRouteLink("/home", "Home", {
              className: "block py-2 px-2 rounded-md transition-colors",
              onClick: () => setMobileOpen(false),
            })}
          </li>
          <li>
            {renderHashLink("/home#about", "About Us", {
              className: "block py-2 px-2 rounded-md transition-colors",
              onClick: () => setMobileOpen(false),
            })}
          </li>

          {CATEGORY_LINKS.map(({ label, to }) => (
            <li key={label}>
              {renderRouteLink(to, label, {
                className: "block py-2 px-2 rounded-md transition-colors",
                onClick: () => setMobileOpen(false),
              })}
            </li>
          ))}

          <li>
            {renderRouteLink("/contact", "Contact", {
              className: "block py-2 px-2 rounded-md transition-colors",
              onClick: () => setMobileOpen(false),
            })}
          </li>
        </ul>
      </div>
    </nav>
  );
}
