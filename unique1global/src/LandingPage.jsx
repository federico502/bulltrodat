import React, { useContext } from "react";
import { AppContext, Icons, motion } from "./App.jsx";

const LandingPage = ({ onNavigate }) => {
  const { VITE_PLATFORM_LOGO } = useContext(AppContext);
  const platformLogo = VITE_PLATFORM_LOGO;

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg shadow-md z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <img src={platformLogo} alt="Logo" className="h-8" />
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection("inicio")}
              className="hover:text-purple-600 transition-colors"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection("nosotros")}
              className="hover:text-purple-600 transition-colors"
            >
              Sobre Nosotros
            </button>
            <button
              onClick={() => scrollToSection("contacto")}
              className="hover:text-purple-600 transition-colors"
            >
              Contacto
            </button>
          </nav>
          <button
            onClick={() => onNavigate("login")}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg"
            style={{ backgroundColor: "#410093" }}
          >
            Login / Registro
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="pt-24 md:pt-32 pb-16 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4"
          >
            Tu Puerta de Acceso a los Mercados Financieros
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Descubre una experiencia de trading superior. Opera con acciones,
            Forex, criptomonedas y más, con herramientas avanzadas y una
            ejecución ultra rápida.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => onNavigate("login")}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors shadow-xl"
            style={{ backgroundColor: "#410093" }}
          >
            Comienza a Operar Ahora{" "}
            <Icons.ArrowRight className="inline-block h-5 w-5 ml-2" />
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-8 text-gray-600"
          >
            <div className="flex items-center gap-2">
              <Icons.ShieldCheck className="h-5 w-5 text-green-500" />
              <span>Plataforma Segura</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.Banknotes className="h-5 w-5 text-green-500" />
              <span>Comisiones Bajas</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.UserGroup className="h-5 w-5 text-green-500" />
              <span>Soporte 24/7</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sobre Nosotros Section */}
      <section id="nosotros" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Diseñada para el Trader Moderno
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Combinamos tecnología de punta, seguridad robusta y una amplia
              gama de mercados para ofrecerte la experiencia de trading
              definitiva.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-md transition-transform hover:-translate-y-2">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <Icons.ShieldCheck className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Seguridad Inquebrantable
              </h3>
              <p className="text-gray-600">
                Operamos con los más altos estándares. Tus fondos e información
                personal están protegidos por encriptación avanzada y protocolos
                robustos.
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-md transition-transform hover:-translate-y-2">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <Icons.CreditCard className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Un Universo de Activos</h3>
              <p className="text-gray-600">
                Desde divisas y acciones hasta las criptomonedas más volátiles.
                Diversifica tu portafolio sin salir de nuestra plataforma.
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-md transition-transform hover:-translate-y-2">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <Icons.Adjustments className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Ejecución y Herramientas Pro
              </h3>
              <p className="text-gray-600">
                Aprovecha nuestra ejecución de baja latencia, gráficos en tiempo
                real y un conjunto completo de herramientas de análisis para
                tomar decisiones informadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para Empezar?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Únete a miles de traders que confían en nosotros. Abre tu cuenta hoy
            mismo.
          </p>
          <button
            onClick={() => onNavigate("login")}
            className="bg-white hover:bg-gray-200 text-purple-600 font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Abrir Cuenta
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-6 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Unique 1 Global. Todos los
            derechos reservados.
          </p>
          <p className="text-gray-400 mt-2">
            El trading implica riesgos. Invierte de manera responsable.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
