import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js";
import { motion, AnimatePresence } from "framer-motion";

// --- Axios Configuration ---
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

// --- Chart.js Registration ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

// --- Modern SVG Icons ---
const Icon = ({ path, className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const MenuIcon = () => (
  <Icon path="M4 6h16M4 12h16M4 18h16" className="h-6 w-6" />
);
const PlusIcon = () => <Icon path="M12 4v16m8-8H4" />;
const UserGroupIcon = () => (
  <Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
);
const LogoutIcon = () => (
  <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
);
const XIcon = ({ className = "h-6 w-6" }) => (
  <Icon path="M6 18L18 6M6 6l12 12" className={className} />
);
const ViewListIcon = () => <Icon path="M4 6h16M4 10h16M4 14h16M4 18h16" />;
const KeyIcon = () => (
  <Icon path="M15 7a4 4 0 11-8 0 4 4 0 018 0zM9 9a2 2 0 11-4 0 2 2 0 014 0zM9 15a4 4 0 100-8 4 4 0 000 8zM9 15c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
);
const UserCircleIcon = ({ className = "h-6 w-6" }) => (
  <Icon
    path="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
    className={className}
  />
);
const ChevronLeftIcon = () => <Icon path="M15 19l-7-7 7-7" />;
const ArrowDownTrayIcon = () => (
  <Icon path="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
);
const ArrowUpTrayIcon = () => (
  <Icon path="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
);
const ClipboardIcon = () => (
  <Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
);
const BanknotesIcon = () => (
  <Icon path="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0 .75-.75V9.75M15 13.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
);
const CreditCardIcon = () => (
  <Icon path="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z" />
);

// --- App Context (No changes in logic) ---
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [realTimePrices, setRealTimePrices] = useState({});
  const [selectedAsset, setSelectedAsset] = useState("BTC-USDT");

  const checkUser = useCallback(async () => {
    try {
      const { data } = await axios.get("/me");
      setUser(data);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsAppLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const logout = useCallback(async () => {
    await axios.post("/logout");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated,
      isAppLoading,
      logout,
      realTimePrices,
      setRealTimePrices,
      selectedAsset,
      setSelectedAsset,
      refreshUser: checkUser,
    }),
    [
      user,
      isAuthenticated,
      isAppLoading,
      logout,
      realTimePrices,
      selectedAsset,
      checkUser,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- UI Components (Redesigned) ---

const useFlashOnUpdate = (value) => {
  const [flashClass, setFlashClass] = useState("");
  const prevValueRef = useRef();
  useEffect(() => {
    const currentValue = parseFloat(value);
    if (prevValueRef.current !== undefined) {
      const prevValue = parseFloat(prevValueRef.current);
      if (
        !isNaN(currentValue) &&
        !isNaN(prevValue) &&
        currentValue !== prevValue
      ) {
        setFlashClass(
          currentValue > prevValue ? "text-green-400" : "text-red-400"
        );
        const timer = setTimeout(() => setFlashClass(""), 300);
        return () => clearTimeout(timer);
      }
    }
    if (!isNaN(currentValue)) {
      prevValueRef.current = currentValue;
    }
  }, [value]);
  return flashClass;
};

const Toast = ({ message, type, onDismiss }) => (
  <motion.div
    layout
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className={`fixed top-5 right-5 z-[9999] px-4 py-3 rounded-lg shadow-2xl text-white text-sm flex items-center border ${
      type === "success"
        ? "bg-green-600/90 border-green-500"
        : "bg-red-600/90 border-red-500"
    }`}
  >
    <p>{message}</p>
    <button onClick={onDismiss} className="ml-4 text-white/70 hover:text-white">
      &times;
    </button>
  </motion.div>
);

const Card = React.forwardRef(({ children, className = "", ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`bg-gray-800/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm ${className}`}
    {...props}
  >
    {children}
  </motion.div>
));

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-700 rounded-md ${className}`} />
);

const TradingViewWidget = React.memo(({ symbol }) => {
  const containerRef = useRef(null);
  const getTradingViewSymbol = (assetSymbol) => {
    if (!assetSymbol) return "KUCOIN:BTCUSDT";
    const s = assetSymbol.toUpperCase();
    if (s.includes("-USDT")) return `KUCOIN:${s.replace("-", "")}`;
    if (s.endsWith("USDT")) return `KUCOIN:${s}`;
    if (s === "WTI/USD") return "TVC:USOIL";
    if (s === "BRENT/USD") return "TVC:UKOIL";
    if (s === "XAU/USD") return "OANDA:XAUUSD";
    if (s === "XAG/USD") return "OANDA:XAGUSD";
    const forexPairs = [
      "EURUSD",
      "USDJPY",
      "GBPUSD",
      "AUDUSD",
      "EURJPY",
      "GBPJPY",
      "AUDJPY",
    ];
    if (forexPairs.includes(s)) return `OANDA:${s}`;
    return `NASDAQ:${s}`;
  };
  useEffect(() => {
    const tvSymbol = getTradingViewSymbol(symbol);
    const createWidget = () => {
      if (!containerRef.current || typeof window.TradingView === "undefined")
        return;
      containerRef.current.innerHTML = "";
      new window.TradingView.widget({
        autosize: true,
        symbol: tvSymbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "es",
        enable_publishing: false,
        hide_side_toolbar: true,
        hide_top_toolbar: false,
        allow_symbol_change: false,
        container_id: containerRef.current.id,
        backgroundColor: "rgba(0, 0, 0, 0)",
        gridColor: "rgba(255, 255, 255, 0.06)",
      });
    };
    if (!document.getElementById("tradingview-script")) {
      const script = document.createElement("script");
      script.id = "tradingview-script";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = createWidget;
      document.body.appendChild(script);
    } else {
      createWidget();
    }
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [symbol]);
  return (
    <div
      id="tradingview-widget-container"
      ref={containerRef}
      className="h-full w-full"
    />
  );
});

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };
  return (
    <div className="flex justify-center items-center gap-2 mt-2">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors text-xs"
      >
        Anterior
      </button>
      <span className="text-gray-400 text-xs">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors text-xs"
      >
        Siguiente
      </button>
    </div>
  );
};

const PerformanceChart = ({ performanceData, isLoading }) => {
  const chartData = {
    labels: performanceData.map((d) => new Date(d.fecha).toLocaleDateString()),
    datasets: [
      {
        label: "Ganancia Diaria",
        data: performanceData.map((d) => parseFloat(d.ganancia_dia || 0)),
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "#3B82F6",
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { display: false }, y: { display: false } },
    plugins: { legend: { display: false } },
  };
  return (
    <Card className="mt-4">
      <h3 className="text-white font-bold text-base mb-4">Rendimiento</h3>
      <div className="h-28">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : !performanceData || performanceData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-xs">
            No hay datos de rendimiento
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </Card>
  );
};

const StatisticsPanel = ({ stats, performanceData, isLoading }) => (
  <div className="mt-6 space-y-4">
    <Card>
      <h3 className="text-white font-bold text-base mb-4">Estadísticas</h3>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-5" /> <Skeleton className="h-5" />
          <Skeleton className="h-5" /> <Skeleton className="h-5" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 text-gray-300 text-sm">
          <div>
            Total Invertido:{" "}
            <span className="font-semibold text-white">
              ${parseFloat(stats.total_invertido || 0).toFixed(2)}
            </span>
          </div>
          <div>
            Ganancia Total:{" "}
            <span className="font-semibold text-green-400">
              ${parseFloat(stats.ganancia_total || 0).toFixed(2)}
            </span>
          </div>
          <div>
            Abiertas:{" "}
            <span className="font-semibold text-white">
              {stats.abiertas || 0}
            </span>
          </div>
          <div>
            Cerradas:{" "}
            <span className="font-semibold text-white">
              {stats.cerradas || 0}
            </span>
          </div>
        </div>
      )}
    </Card>
    <PerformanceChart performanceData={performanceData} isLoading={isLoading} />
  </div>
);

const AssetPrice = React.memo(({ symbol }) => {
  const { realTimePrices } = useContext(AppContext);
  const normalizedSymbol = symbol.toUpperCase().replace(/[-/]/g, "");
  const price = realTimePrices[normalizedSymbol];
  const flashClass = useFlashOnUpdate(price);
  const baseColor = price ? "text-white" : "text-gray-500";
  const finalColorClass = flashClass || baseColor;
  return (
    <div className="px-2 py-1 rounded-md">
      <span
        className={`font-mono text-xs transition-colors duration-300 ${finalColorClass}`}
      >
        {price?.toFixed(4) || "---"}
      </span>
    </div>
  );
});

const AssetRow = React.memo(({ symbol, isSelected, onClick, onRemove }) => (
  <li
    onClick={() => onClick(symbol)}
    className={`cursor-pointer transition-all duration-200 rounded-lg flex justify-between items-center p-2 group ${
      isSelected
        ? "bg-blue-600/20 text-white"
        : "hover:bg-gray-700 text-gray-300"
    }`}
  >
    <span className="font-semibold">{symbol}</span>
    <div className="flex items-center gap-2">
      <AssetPrice symbol={symbol} />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(symbol);
        }}
        className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        title={`Eliminar ${symbol}`}
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  </li>
));

const AssetLists = React.memo(({ assets, onAddAsset, onRemoveAsset }) => {
  const { setSelectedAsset, selectedAsset } = useContext(AppContext);
  const [newSymbol, setNewSymbol] = useState("");
  const handleAssetClick = useCallback(
    (symbol) => {
      setSelectedAsset(symbol);
    },
    [setSelectedAsset]
  );
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newSymbol) {
      onAddAsset(newSymbol);
      setNewSymbol("");
    }
  };
  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
          placeholder="Ej: DOGE-USDT, TSLA"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
        >
          <PlusIcon />
        </button>
      </form>
      <h2 className="text-gray-400 font-bold text-sm tracking-wider uppercase mb-3 px-2">
        Mis Activos
      </h2>
      <ul className="space-y-1 max-h-48 overflow-y-auto">
        {assets.map((symbol) => (
          <AssetRow
            key={symbol}
            symbol={symbol}
            isSelected={selectedAsset === symbol}
            onClick={handleAssetClick}
            onRemove={onRemoveAsset}
          />
        ))}
      </ul>
    </div>
  );
});

const LoginPage = () => {
  const { setUser, setIsAuthenticated } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [countryCode, setCountryCode] = useState("+57");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const countryCodes = [
    { name: "Colombia", code: "+57" },
    { name: "United States", code: "+1" },
    { name: "Spain", code: "+34" },
    { name: "Mexico", code: "+52" },
    { name: "Argentina", code: "+54" },
    { name: "Peru", code: "+51" },
    { name: "Chile", code: "+56" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const platform_id = import.meta.env.VITE_PLATFORM_ID || "luxtrading";
    const url = isLogin ? "/login" : "/register";
    const payload = isLogin
      ? { email, password, platform_id }
      : {
          nombre,
          email,
          password,
          telefono: `${countryCode}${telefono}`,
          platform_id,
        };

    try {
      const { data } = await axios.post(url, payload);
      if (isLogin) {
        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setError(data.error || "Credenciales inválidas");
        }
      } else {
        if (data.success) {
          setSuccess("Registro exitoso. Por favor, inicie sesión.");
          setIsLogin(true);
        } else {
          setError(data.error || "Error en el registro");
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Ocurrió un error.");
    }
  };

  const platformLogo =
    import.meta.env.VITE_PLATFORM_LOGO || "/luxglobal-logo.png";

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4 bg-grid-gray-700/[0.2]">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/80 backdrop-blur-xl border border-gray-700 p-8 rounded-2xl shadow-2xl shadow-blue-500/10"
        >
          <img
            className="mb-6 mx-auto h-12"
            src={platformLogo}
            alt="LuxGlobal Investments Logo"
          />
          <h2 className="text-center text-2xl font-bold text-white mb-2">
            {isLogin ? "Bienvenido de Nuevo" : "Crear una Cuenta"}
          </h2>
          <p className="text-center text-gray-400 mb-6">
            {isLogin
              ? "Accede a tu portafolio de inversiones."
              : "Únete a la élite de inversionistas."}
          </p>

          {error && (
            <p className="bg-red-500/20 border border-red-500 text-red-300 text-center p-2 rounded-md mb-4 text-sm">
              {error}
            </p>
          )}
          {success && (
            <p className="bg-green-500/20 border border-green-500 text-green-300 text-center p-2 rounded-md mb-4 text-sm">
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label
                    className="block text-gray-400 text-sm font-bold mb-2"
                    htmlFor="nombre"
                  >
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-400 text-sm font-bold mb-2"
                    htmlFor="telefono"
                  >
                    Número de Teléfono
                  </label>
                  <div className="flex">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="p-3 bg-gray-700 text-white rounded-l-md border-r-0 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      id="telefono"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full p-3 bg-gray-700 text-white rounded-r-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
              </>
            )}
            <div>
              <label
                className="block text-gray-400 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label
                className="block text-gray-400 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-500 font-bold transition-colors shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6 text-sm">
            {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
              }}
              className="text-blue-400 hover:underline ml-1 font-semibold cursor-pointer"
            >
              {isLogin ? "Regístrate" : "Inicia sesión"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-4xl",
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-gray-800 rounded-lg shadow-xl w-full ${maxWidth} text-white border border-gray-700 flex flex-col max-h-[90vh]`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-shrink-0 flex justify-between items-center p-4 sm:p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white cursor-pointer"
            >
              <XIcon />
            </button>
          </div>
          <div className="overflow-y-auto p-4 sm:p-6">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Header = ({
  onOperation,
  onManageUsers,
  onManageRegCode,
  onToggleSideMenu,
  onToggleMainSidebar,
}) => {
  const { user, logout, selectedAsset } = useContext(AppContext);
  const [volume, setVolume] = useState(0.01);
  return (
    <header className="flex justify-between items-center px-4 sm:px-6 py-3 bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMainSidebar}
          className="p-2 rounded-full hover:bg-gray-700 lg:hidden"
        >
          <MenuIcon />
        </button>
        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={() => onOperation("sell", volume)}
            className="bg-red-600 hover:bg-red-500 transition-all text-white px-5 py-2 text-sm font-bold rounded-md shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
          >
            SELL
          </button>
          <input
            type="number"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value) || 0)}
            step="0.01"
            min="0.01"
            className="w-24 p-2 border border-gray-600 bg-gray-700 rounded-md text-white text-center text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={() => onOperation("buy", volume)}
            className="bg-green-600 hover:bg-green-500 transition-all text-white px-5 py-2 text-sm font-bold rounded-md shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
          >
            BUY
          </button>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-xl sm:text-3xl font-bold text-white">
          {selectedAsset}
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        {/* ProfileMenu will be added here */}
      </div>
    </header>
  );
};

const App = () => {
  const { isAppLoading, isAuthenticated } = useContext(AppContext);
  const platformLogo =
    import.meta.env.VITE_PLATFORM_LOGO || "/luxglobal-logo.png";

  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl font-bold animate-pulse">
          <img src={platformLogo} className="h-12" alt="Cargando..." />
        </div>
      </div>
    );
  }
  return isAuthenticated ? <DashboardPage /> : <LoginPage />;
};

const DashboardPage = () => {
  const {
    user,
    selectedAsset,
    setSelectedAsset,
    realTimePrices,
    setRealTimePrices,
    logout,
    refreshUser,
  } = useContext(AppContext);

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [mobileVolume, setMobileVolume] = useState(0.01);
  const wsRef = useRef(null);
  const initialAssets = useMemo(
    () => [
      "BTC-USDT",
      "ETH-USDT",
      "SOL-USDT",
      "AAPL",
      "TSLA",
      "NVDA",
      "AMZN",
      "EUR/USD",
      "GBP/USD",
      "USD/JPY",
      "XAU/USD",
      "WTI/USD",
    ],
    []
  );
  const [userAssets, setUserAssets] = useState(() => {
    try {
      const savedAssets = localStorage.getItem("userTradingAssets");
      const parsedAssets = savedAssets
        ? JSON.parse(savedAssets)
        : initialAssets;
      return Array.isArray(parsedAssets) && parsedAssets.length > 0
        ? parsedAssets
        : initialAssets;
    } catch (error) {
      return initialAssets;
    }
  });
  const [operations, setOperations] = useState([]);
  const [stats, setStats] = useState({});
  const [balance, setBalance] = useState(0);
  const [performanceData, setPerformanceData] = useState([]);
  const [metrics, setMetrics] = useState({
    balance: 0,
    equity: 0,
    usedMargin: 0,
    freeMargin: 0,
    marginLevel: 0,
  });
  const [alert, setAlert] = useState({ message: "", type: "info" });
  const [opHistoryFilter, setOpHistoryFilter] = useState("todas");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isNewOpModalOpen, setIsNewOpModalOpen] = useState(false);
  const [newOpModalData, setNewOpModalData] = useState(null);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isUserOpsModalOpen, setIsUserOpsModalOpen] = useState(false);
  const [isOpDetailsModalOpen, setIsOpDetailsModalOpen] = useState(false);
  const [currentUserForOps, setCurrentUserForOps] = useState(null);
  const [currentOpDetails, setCurrentOpDetails] = useState(null);
  const [isRegCodeModalOpen, setIsRegCodeModalOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [paymentModalConfig, setPaymentModalConfig] = useState({
    isOpen: false,
    type: "",
    method: "",
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    children: null,
    onConfirm: () => {},
  });

  const fetchData = useCallback(
    async (page = 1, filter = "todas") => {
      if (!user) return;
      setIsLoadingData(true);
      try {
        const [historialRes, statsRes, balanceRes, performanceRes] =
          await Promise.all([
            axios.get(`/historial?page=${page}&limit=5&filter=${filter}`),
            axios.get("/estadisticas"),
            axios.get("/balance"),
            axios.get("/rendimiento"),
          ]);
        setOperations(historialRes.data.operations);
        setPagination({
          currentPage: historialRes.data.currentPage,
          totalPages: historialRes.data.totalPages,
        });
        setStats(statsRes.data);
        setBalance(parseFloat(balanceRes.data.balance));
        setPerformanceData(performanceRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setAlert({ message: "Error al cargar los datos", type: "error" });
      } finally {
        setIsLoadingData(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (user) fetchData(1, "todas");
  }, [user, fetchData]);

  const platformLogo =
    import.meta.env.VITE_PLATFORM_LOGO || "/luxglobal-logo.png";

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans overflow-hidden">
      <AnimatePresence>
        {alert.message && (
          <Toast
            message={alert.message}
            type={alert.type}
            onDismiss={() => setAlert({ message: "", type: "info" })}
          />
        )}
      </AnimatePresence>

      {/* All modals will be here */}

      <aside className="hidden lg:flex lg:flex-col w-72 bg-gray-800 p-4 border-r border-gray-700">
        <div className="flex-grow">
          <img className="h-10 mb-6" src={platformLogo} alt="Logo" />
          <AssetLists
            assets={userAssets}
            onAddAsset={() => {}}
            onRemoveAsset={() => {}}
          />
        </div>
        <div className="flex-shrink-0">
          <StatisticsPanel
            stats={stats}
            performanceData={performanceData}
            isLoading={isLoadingData}
          />
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
        <Header
          onOperation={() => {}}
          onManageUsers={() => {}}
          onManageRegCode={() => {}}
          onToggleSideMenu={() => {}}
          onToggleMainSidebar={() => {}}
        />

        <div className="flex-1 flex flex-col p-2 sm:p-4 gap-4 overflow-y-auto">
          <div className="flex-grow min-h-[300px] sm:min-h-[400px] rounded-lg overflow-hidden">
            <TradingViewWidget symbol={selectedAsset} />
          </div>
          {/* FinancialMetrics would be here */}
          <div className="h-full flex flex-col">
            {/* OperationsHistory would be here */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default function Root() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
