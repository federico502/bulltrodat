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

// --- Configuración de Axios ---
// La URL base ahora se lee desde las variables de entorno de Vite.
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

// Registrar los componentes de Chart.js
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

// --- Iconos SVG ---
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
      clipRule="evenodd"
    />
  </svg>
);
const UserGroupIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
  </svg>
);
const LogoutIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V5h10a1 1 0 100-2H3zm12.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L16.586 13H9a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const ViewListIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
      clipRule="evenodd"
    />
  </svg>
);
const KeyIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a4 4 0 100 8 4 4 0 000-8z"
      clipRule="evenodd"
    />
  </svg>
);

const UserCircleIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const ArrowDownTrayIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
    />
  </svg>
);

const ArrowUpTrayIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
    />
  </svg>
);
//================================================================================
// 1. CONTEXTO DE LA APLICACIÓN
//================================================================================
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [realTimePrices, setRealTimePrices] = useState({});
  const [selectedAsset, setSelectedAsset] = useState("BTCUSDT");

  const checkUser = useCallback(async () => {
    try {
      const { data } = await axios.get("/me");
      setUser(data);
      setIsAuthenticated(true);
    } catch (error) {
      console.log("No authenticated user found.");
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

//================================================================================
// 2. HOOKS PERSONALIZADOS
//================================================================================
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
        if (currentValue > prevValue) {
          setFlashClass("text-green-400");
        } else {
          setFlashClass("text-red-500");
        }
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

//================================================================================
// 3. COMPONENTES DE LA INTERFAZ
//================================================================================

const Toast = ({ message, type, onDismiss }) => (
  <motion.div
    layout
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className={`fixed top-5 right-5 z-[9999] px-4 py-3 rounded-lg shadow-2xl text-white text-sm flex items-center border ${
      type === "success"
        ? "bg-green-500/90 border-green-400"
        : "bg-red-500/90 border-red-400"
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
    className={`bg-black/20 p-4 rounded-lg border border-neutral-800 backdrop-blur-sm ${className}`}
    {...props}
  >
    {children}
  </motion.div>
));

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-neutral-800 rounded-md ${className}`} />
);

const TradingViewWidget = React.memo(({ symbol }) => {
  const containerRef = useRef(null);

  const getTradingViewSymbol = (assetSymbol) => {
    if (!assetSymbol) return "BINANCE:BTCUSDT";

    const s = assetSymbol.toUpperCase();

    if (s.endsWith("USDT")) {
      return `BINANCE:${s}`;
    }

    const forexPairs = [
      "EURUSD",
      "USDJPY",
      "GBPUSD",
      "AUDUSD",
      "EURJPY",
      "GBPJPY",
      "AUDJPY",
      "EURAUD",
      "GBPAUD",
    ];
    if (forexPairs.includes(s)) {
      return `OANDA:${s}`;
    }
    const commodities = ["XAGUSD", "XAUUSD"];
    if (commodities.includes(s)) {
      return `OANDA:${s}`;
    }

    const stockExchanges = {
      AAPL: "NASDAQ",
      GOOGL: "NASDAQ",
      AMZN: "NASDAQ",
      META: "NASDAQ",
      TSLA: "NASDAQ",
      MSFT: "NASDAQ",
      NVDA: "NASDAQ",
    };
    if (stockExchanges[s]) {
      return `${stockExchanges[s]}:${s}`;
    }

    return `NASDAQ:${s}`;
  };

  useEffect(() => {
    const tvSymbol = getTradingViewSymbol(symbol);

    const createWidget = () => {
      if (!containerRef.current || typeof window.TradingView === "undefined") {
        return;
      }
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
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
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
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-2">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-neutral-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-600 transition-colors text-xs"
      >
        Anterior
      </button>
      <span className="text-neutral-400 text-xs">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-neutral-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-600 transition-colors text-xs"
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
        backgroundColor: "rgba(22, 163, 74, 0.2)",
        borderColor: "#22c55e",
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
          <div className="flex items-center justify-center h-full text-neutral-500 text-xs">
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
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 text-neutral-300 text-sm">
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
  const priceData = realTimePrices[symbol.toUpperCase()];
  const price = priceData;
  const flashClass = useFlashOnUpdate(price);

  const baseColor = price ? "text-white" : "text-neutral-500";
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

const AssetRow = React.memo(({ symbol, isSelected, onClick, onRemove }) => {
  return (
    <li
      onClick={() => onClick(symbol)}
      className={`cursor-pointer transition-all duration-200 rounded-md flex justify-between items-center p-2 group ${
        isSelected
          ? "bg-cyan-500/20 text-white"
          : "hover:bg-neutral-800 text-neutral-300"
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
          className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title={`Eliminar ${symbol}`}
        >
          <XIcon />
        </button>
      </div>
    </li>
  );
});

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
          placeholder="Ej: TSLA"
          className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
        />
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-500 text-white p-2 rounded transition-colors flex-shrink-0 cursor-pointer"
        >
          <PlusIcon />
        </button>
      </form>
      <h2 className="text-neutral-400 font-bold text-sm tracking-wider uppercase mb-3 px-2">
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

const MenuItem = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-700 rounded-md transition-colors"
  >
    {icon}
    <span className="ml-3">{text}</span>
  </button>
);

const ProfileMenu = React.memo(
  ({ user, logout, onToggleSideMenu, onManageUsers, onManageRegCode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleItemClick = (action) => {
      if (action) {
        action();
      }
      setIsOpen(false);
    };

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-neutral-800 cursor-pointer text-white p-2 rounded-full hover:bg-red-500 transition-colors"
          title="Cuenta"
        >
          <UserCircleIcon className="h-6 w-6" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-neutral-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 p-2 border border-neutral-700"
            >
              <div className="px-3 py-2 border-b  border-neutral-700 mb-2">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.nombre || "Usuario"}
                </p>
                <p className="text-xs text-neutral-400 truncate">
                  {user?.email || "email@example.com"}
                </p>
              </div>
              <div className="space-y-1">
                <MenuItem
                  icon={<UserCircleIcon className="h-5 w-5 text-neutral-400" />}
                  text="Gestionar Cuenta"
                  onClick={() => handleItemClick(onToggleSideMenu)}
                />
                {user?.rol === "admin" && (
                  <>
                    <MenuItem
                      icon={
                        <UserGroupIcon className="h-5 w-5 text-neutral-400" />
                      }
                      text="Gestionar Usuarios"
                      onClick={() => handleItemClick(onManageUsers)}
                    />
                    <MenuItem
                      icon={<KeyIcon className="h-5 w-5 text-neutral-400" />}
                      text="Código de Registro"
                      onClick={() => handleItemClick(onManageRegCode)}
                    />
                  </>
                )}
                <div className="my-1 h-px bg-neutral-700" />
                <MenuItem
                  icon={
                    <LogoutIcon className="h-5 w-5 cursor-pointer text-red-400" />
                  }
                  text="Cerrar Sesión"
                  onClick={() => handleItemClick(logout)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
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
    <header className="flex justify-between items-center px-4 sm:px-6 py-3 bg-black/20 border-b border-neutral-800">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMainSidebar}
          className="p-2 rounded-full hover:bg-neutral-700 lg:hidden"
        >
          <MenuIcon />
        </button>
        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={() => onOperation("sell", volume)}
            className="bg-red-600 hover:bg-red-500 transition-all text-white px-5 py-2 text-sm font-bold rounded-md shadow-lg shadow-red-500/20 hover:shadow-red-500/40 cursor-pointer"
          >
            SELL
          </button>
          <input
            type="number"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value) || 0)}
            step="0.01"
            min="0.01"
            className="w-24 p-2 border border-neutral-700 bg-neutral-800 rounded-md text-white text-center text-sm focus:ring-2 focus:ring-neutral-500 focus:outline-none"
          />
          <button
            onClick={() => onOperation("buy", volume)}
            className="bg-green-600 hover:bg-green-500 transition-all text-white px-5 py-2 text-sm font-bold rounded-md shadow-lg shadow-green-500/20 hover:shadow-green-500/40 cursor-pointer"
          >
            BUY
          </button>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-xl sm:text-3xl font-bold text-white">
          {selectedAsset}
        </h2>
        <p className="text-xs text-neutral-400 hidden sm:block">
          Activo para operar
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <ProfileMenu
          user={user}
          logout={logout}
          onToggleSideMenu={onToggleSideMenu}
          onManageUsers={onManageUsers}
          onManageRegCode={onManageRegCode}
        />
      </div>
    </header>
  );
};

const FlashingMetric = ({ value, prefix = "", suffix = "" }) => {
  const flashClass = useFlashOnUpdate(value);
  const baseColor = "text-white";
  const finalColorClass = flashClass || baseColor;

  return (
    <span
      className={`font-bold px-2 py-1 rounded-md transition-colors duration-300 ${finalColorClass}`}
    >
      {prefix}
      {!isNaN(value) ? value.toFixed(2) : "0.00"}
      {suffix}
    </span>
  );
};

const FinancialMetrics = ({ metrics, isLoading }) => (
  <Card className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 justify-items-center p-3 text-xs sm:text-sm">
    {isLoading ? (
      <Skeleton className="h-5 w-full col-span-full" />
    ) : (
      <>
        <div className="text-center">
          <p className="text-neutral-400">Balance</p>
          <span className="font-bold text-white">${metrics.balance}</span>
        </div>
        <div className="text-center">
          <p className="text-neutral-400">Equidad</p>
          <FlashingMetric value={parseFloat(metrics.equity)} prefix="$" />
        </div>
        <div className="text-center">
          <p className="text-neutral-400">M. Usado</p>
          <FlashingMetric value={parseFloat(metrics.usedMargin)} prefix="$" />
        </div>
        <div className="text-center">
          <p className="text-neutral-400">M. Libre</p>
          <FlashingMetric value={parseFloat(metrics.freeMargin)} prefix="$" />
        </div>
        <div className="text-center col-span-2 md:col-span-1">
          <p className="text-neutral-400">Nivel Margen</p>
          <FlashingMetric value={parseFloat(metrics.marginLevel)} suffix="%" />
        </div>
      </>
    )}
  </Card>
);

const LiveProfitCell = ({ operation }) => {
  const { realTimePrices } = useContext(AppContext);

  const calculateProfit = useCallback(() => {
    if (operation.cerrada) {
      return parseFloat(operation.ganancia || 0);
    }
    const currentPrice = realTimePrices[operation.activo.toUpperCase()];
    if (!currentPrice) {
      return 0;
    }
    return operation.tipo_operacion.toLowerCase() === "sell"
      ? (operation.precio_entrada - currentPrice) * operation.volumen
      : (currentPrice - operation.precio_entrada) * operation.volumen;
  }, [realTimePrices, operation]);

  const profit = calculateProfit();
  const profitColor = profit >= 0 ? "text-green-400" : "text-red-400";

  return (
    <span className={`font-mono ${profitColor}`}>{profit.toFixed(2)}</span>
  );
};

const OperationsHistory = ({
  operations,
  setOperations,
  filter,
  setFilter,
  onRowClick,
  isLoading,
  pagination,
  onPageChange,
}) => {
  const handleCloseOperation = async (e, opId) => {
    e.stopPropagation();
    try {
      const { data } = await axios.post("/cerrar-operacion", {
        operacion_id: opId,
      });
      if (data.success) {
        setOperations((prevOps) =>
          prevOps.map((op) =>
            op.id === opId
              ? {
                  ...op,
                  cerrada: true,
                  ganancia: data.gananciaFinal,
                  precio_cierre: data.precio_cierre,
                }
              : op
          )
        );
      }
    } catch (error) {
      console.error("Error closing operation:", error);
    }
  };

  const columns = [
    "Fecha",
    "Tipo",
    "Volumen",
    "Activo",
    "Entrada",
    "Cierre",
    "TP",
    "SL",
    "Margen",
    "G-P",
    "Acción",
  ];

  const renderMobileCard = (op) => (
    <Card key={op.id} className="text-sm" onClick={() => onRowClick(op)}>
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-lg text-white">{op.activo}</span>
        <span
          className={`px-2 py-1 rounded-md text-xs font-bold ${
            op.tipo_operacion.toLowerCase().includes("buy")
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {op.tipo_operacion}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-neutral-300 mb-4">
        <div>
          <span className="font-semibold text-neutral-500">Vol:</span>{" "}
          {op.volumen}
        </div>
        <div>
          <span className="font-semibold text-neutral-500">Entrada:</span>{" "}
          {parseFloat(op.precio_entrada).toFixed(4)}
        </div>
        <div>
          <span className="font-semibold text-neutral-500">TP:</span>{" "}
          {op.take_profit ? parseFloat(op.take_profit).toFixed(2) : "-"}
        </div>
        <div>
          <span className="font-semibold text-neutral-500">SL:</span>{" "}
          {op.stop_loss ? parseFloat(op.stop_loss).toFixed(2) : "-"}
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-neutral-700">
        <div className="text-neutral-400">
          G/P: <LiveProfitCell operation={op} />
        </div>
        {op.cerrada ? (
          <span className="bg-neutral-700 px-2 py-1 rounded-md text-xs">
            Cerrado
          </span>
        ) : (
          <button
            onClick={(e) => handleCloseOperation(e, op.id)}
            className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-md text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        )}
      </div>
    </Card>
  );

  return (
    <Card className="flex-grow flex flex-col overflow-hidden">
      <div className="p-3 bg-black/20 flex justify-between items-center flex-shrink-0">
        <h3 className="text-base font-bold text-white">
          Historial de Operaciones
        </h3>
        <div className="flex items-center">
          <label htmlFor="filter" className="text-sm text-neutral-400 mr-2">
            Filtrar:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-neutral-800 text-white text-sm rounded-md p-1 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
          >
            <option value="todas">Todas</option>
            <option value="abiertas">Abiertas</option>
            <option value="cerradas">Cerradas</option>
          </select>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        <table className="hidden sm:table w-full text-sm text-left text-neutral-300">
          <thead className="bg-neutral-800/50 text-xs uppercase sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              {columns.map((h) => (
                <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c} className="px-3 py-2">
                        <Skeleton className="h-5" />
                      </td>
                    ))}
                  </tr>
                ))
              : operations.map((op) => (
                  <tr
                    key={op.id}
                    className="hover:bg-neutral-800/50 cursor-pointer"
                    onClick={() => onRowClick(op)}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(op.fecha).toLocaleString()}
                    </td>
                    <td
                      className={`px-3 py-2 font-bold whitespace-nowrap ${
                        op.tipo_operacion.toLowerCase().includes("buy")
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {op.tipo_operacion}
                    </td>
                    <td className="px-3 py-2 font-mono">{op.volumen}</td>
                    <td className="px-3 py-2 font-semibold">{op.activo}</td>
                    <td className="px-3 py-2 font-mono">
                      {parseFloat(op.precio_entrada).toFixed(4)}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {op.cerrada && op.precio_cierre
                        ? parseFloat(op.precio_cierre).toFixed(4)
                        : "-"}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {op.take_profit
                        ? parseFloat(op.take_profit).toFixed(2)
                        : "-"}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {op.stop_loss ? parseFloat(op.stop_loss).toFixed(2) : "-"}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      ${parseFloat(op.capital_invertido || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <LiveProfitCell operation={op} />
                    </td>
                    <td className="px-3 py-2">
                      {op.cerrada ? (
                        <span className="bg-neutral-700 px-2 py-1 rounded-md text-xs">
                          Cerrado
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleCloseOperation(e, op.id)}
                          className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-md text-xs w-full transition-colors cursor-pointer"
                        >
                          Cerrar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        <div className="sm:hidden p-2 space-y-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))
            : operations.map(renderMobileCard)}
        </div>
      </div>
      <div className="p-2 border-t border-neutral-800">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </Card>
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
          className={`bg-neutral-900 rounded-lg shadow-xl w-full ${maxWidth} text-white border border-neutral-700 flex flex-col max-h-[90vh]`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-shrink-0 flex justify-between items-center p-4 sm:p-6 border-b border-neutral-700">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white cursor-pointer"
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

const ModalLivePrice = React.memo(({ symbol }) => {
  const { realTimePrices } = useContext(AppContext);
  const price = realTimePrices[symbol?.toUpperCase()];
  const flashClass = useFlashOnUpdate(price);
  const baseColor = price ? "text-white" : "text-yellow-400";
  const finalColorClass = flashClass || baseColor;

  return (
    <span
      className={`font-mono transition-colors duration-300 ${finalColorClass}`}
    >
      ${price?.toFixed(4) || "Cargando..."}
    </span>
  );
});

const NewOperationModal = ({ isOpen, onClose, operationData, onConfirm }) => {
  const { type, asset, volume } = operationData || {};
  const { realTimePrices } = useContext(AppContext);

  const livePrice = asset ? realTimePrices[asset.toUpperCase()] : null;
  const requiredMargin = livePrice ? (livePrice * volume).toFixed(2) : "0.00";

  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setTp("");
      setSl("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm({
      volumen: volume,
      take_profit: tp ? parseFloat(tp) : null,
      stop_loss: sl ? parseFloat(sl) : null,
      tipo_operacion: type,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${type === "buy" ? "Comprar" : "Vender"} ${asset}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-3 mb-4">
        <p className="text-neutral-300 flex justify-between">
          <span>Precio Actual:</span>
          <ModalLivePrice symbol={asset} />
        </p>
        <p className="text-neutral-300 flex justify-between">
          <span>Volumen:</span>
          <span className="font-mono text-white">{volume}</span>
        </p>
        <p className="text-neutral-300 flex justify-between">
          <span>Margen Requerido:</span>
          <span className="font-mono text-white">${requiredMargin}</span>
        </p>
      </div>
      <label className="block text-sm font-medium mb-2 text-neutral-300">
        Take Profit (opcional):
      </label>
      <input
        type="number"
        value={tp}
        onChange={(e) => setTp(e.target.value)}
        placeholder="Precio"
        className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <label className="block text-sm font-medium mb-2 text-neutral-300">
        Stop Loss (opcional):
      </label>
      <input
        type="number"
        value={sl}
        onChange={(e) => setSl(e.target.value)}
        placeholder="Precio"
        className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
      />
      <div className="flex justify-end mt-4">
        <button
          onClick={handleConfirm}
          disabled={!livePrice}
          className={`px-5 py-2 rounded-md text-white font-bold transition-colors cursor-pointer ${
            !livePrice
              ? "bg-gray-500 cursor-not-allowed"
              : type === "buy"
              ? "bg-green-600 hover:bg-green-500"
              : "bg-red-600 hover:bg-red-500"
          }`}
        >
          Confirmar
        </button>
      </div>
    </Modal>
  );
};

const OperationDetailsModal = ({ isOpen, onClose, operation, profit }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={`Detalles de Operación #${operation?.id}`}
    maxWidth="max-w-md"
  >
    {operation && (
      <div className="space-y-3 text-sm text-neutral-300">
        <div className="flex justify-between">
          <span>Activo:</span>
          <span className="font-semibold text-white">{operation.activo}</span>
        </div>
        <div className="flex justify-between">
          <span>Tipo:</span>
          <span
            className={`font-bold ${
              operation.tipo_operacion.toLowerCase().includes("buy")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {operation.tipo_operacion}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Volumen:</span>
          <span className="font-mono text-white">{operation.volumen}</span>
        </div>
        <div className="flex justify-between">
          <span>Precio de Entrada:</span>
          <span className="font-mono text-white">
            ${parseFloat(operation.precio_entrada).toFixed(4)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Fecha de Apertura:</span>
          <span className="text-white">
            {new Date(operation.fecha).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Estado:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              operation.cerrada
                ? "bg-neutral-600 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {operation.cerrada ? "Cerrada" : "Abierta"}
          </span>
        </div>
        {operation.cerrada && (
          <div className="flex justify-between">
            <span>Precio de Cierre:</span>
            <span className="font-mono text-white">
              {operation.precio_cierre
                ? `$${parseFloat(operation.precio_cierre).toFixed(4)}`
                : "-"}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Ganancia/Pérdida:</span>
          <span
            className={`font-mono font-bold ${
              profit >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {profit.toFixed(2)} USD
          </span>
        </div>
      </div>
    )}
  </Modal>
);

const UserOperationsModal = ({ isOpen, onClose, user, onUpdatePrice }) => {
  const [operations, setOperations] = useState([]);
  const [editingPrices, setEditingPrices] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const fetchUserOperations = useCallback(
    (page = 1) => {
      if (isOpen && user) {
        axios
          .get(`/admin-operaciones/${user.id}?page=${page}&limit=10`)
          .then((res) => {
            setOperations(res.data.operaciones);
            setPagination({
              currentPage: res.data.currentPage,
              totalPages: res.data.totalPages,
            });
          })
          .catch((err) =>
            console.error("Error fetching user operations:", err)
          );
      }
    },
    [isOpen, user]
  );

  useEffect(() => {
    fetchUserOperations(1);
  }, [isOpen, user, fetchUserOperations]);

  const handlePriceChange = (opId, value) =>
    setEditingPrices((prev) => ({ ...prev, [opId]: value }));
  const handleSavePrice = async (opId) => {
    const newPrice = editingPrices[opId];
    if (newPrice !== undefined) {
      await onUpdatePrice(opId, newPrice);
      fetchUserOperations(pagination.currentPage);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Operaciones de ${user?.nombre}`}
    >
      <div className="overflow-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-neutral-700 text-neutral-300 sticky top-0">
            <tr>
              {[
                "ID",
                "Activo",
                "Tipo",
                "Volumen",
                "Precio Entrada",
                "Fecha",
                "Estado",
                "Acción",
              ].map((h) => (
                <th key={h} className="p-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-neutral-800">
            {operations.map((op) => (
              <tr key={op.id} className="border-b border-neutral-700">
                <td className="p-2">{op.id}</td>
                <td className="p-2">{op.activo}</td>
                <td className="p-2">{op.tipo_operacion}</td>
                <td className="p-2">{op.volumen}</td>
                <td className="p-2">
                  <input
                    type="number"
                    step="any"
                    defaultValue={op.precio_entrada}
                    onChange={(e) => handlePriceChange(op.id, e.target.value)}
                    className="w-full p-1 bg-neutral-700 rounded border border-neutral-600"
                  />
                </td>
                <td className="p-2">{new Date(op.fecha).toLocaleString()}</td>
                <td className="p-2">{op.cerrada ? "Cerrada" : "Abierta"}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleSavePrice(op.id)}
                    className="bg-red-600 text-white px-3 py-1 text-xs rounded hover:bg-red-500 cursor-pointer"
                  >
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={(page) => fetchUserOperations(page)}
      />
    </Modal>
  );
};

// =================================================================
// COMPONENTES DE GESTIÓN DE USUARIOS (CON CORRECCIÓN DE PARPADEO)
// =================================================================

const UserCard = React.memo(
  ({ user, onDataChange, onViewUserOps, onDeleteUser, onSave }) => {
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      onDataChange(user.id, name, value);
    };

    return (
      <Card className="text-sm">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-bold text-white">{user.nombre}</p>
            <p className="text-neutral-400">{user.email}</p>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              user.rol === "admin"
                ? "bg-red-500/20 text-red-400"
                : "bg-blue-500/20 text-blue-400"
            }`}
          >
            {user.rol}
          </span>
        </div>
        <div className="space-y-2 my-4">
          <div className="flex items-center">
            <label className="w-24 text-neutral-400">Balance:</label>
            <input
              type="number"
              name="balance"
              value={user.balance}
              onChange={handleInputChange}
              className="flex-1 p-1 bg-neutral-700 rounded border border-neutral-600"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-neutral-400">ID:</label>
            <input
              type="text"
              name="identificacion"
              value={user.identificacion}
              onChange={handleInputChange}
              className="flex-1 p-1 bg-neutral-700 rounded border border-neutral-600"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-neutral-400">Teléfono:</label>
            <input
              type="text"
              name="telefono"
              value={user.telefono}
              onChange={handleInputChange}
              className="flex-1 p-1 bg-neutral-700 rounded border border-neutral-600"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-neutral-400">Password:</label>
            <input
              type="password"
              name="password"
              value={user.password || ""}
              placeholder="No cambiar"
              onChange={handleInputChange}
              className="flex-1 p-1 bg-neutral-700 rounded border border-neutral-600"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-700">
          <button
            onClick={() => onSave(user)}
            className="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-500 cursor-pointer"
          >
            Guardar
          </button>
          <button
            onClick={() => onViewUserOps(user)}
            title="Ver Operaciones"
            className="bg-yellow-600 text-white p-1 text-xs rounded hover:bg-yellow-500 cursor-pointer"
          >
            <ViewListIcon />
          </button>
          <button
            onClick={() => onDeleteUser(user)}
            title="Eliminar Usuario"
            className="bg-red-600 text-white p-1 text-xs rounded hover:bg-red-500 cursor-pointer"
          >
            <XIcon />
          </button>
        </div>
      </Card>
    );
  }
);

const UserTableRow = React.memo(
  ({ user, onDataChange, onViewUserOps, onDeleteUser, onSave }) => {
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      onDataChange(user.id, name, value);
    };

    return (
      <tr className="border-b border-neutral-700">
        <td className="p-2 whitespace-nowrap">{user.id}</td>
        <td className="p-2">
          <input
            type="text"
            name="nombre"
            value={user.nombre}
            onChange={handleInputChange}
            className="w-full p-1 bg-neutral-700 rounded border border-neutral-600"
          />
        </td>
        <td className="p-2">
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
            className="w-full p-1 bg-neutral-700 rounded border border-neutral-600"
          />
        </td>
        <td className="p-2">
          <input
            type="number"
            name="balance"
            step="any"
            value={user.balance}
            onChange={handleInputChange}
            className="w-full p-1 bg-neutral-700 rounded border border-neutral-600"
          />
        </td>
        <td className="p-2">
          <select
            name="rol"
            value={user.rol}
            onChange={handleInputChange}
            className="w-full p-1 bg-neutral-700 rounded border border-neutral-600 cursor-pointer"
          >
            <option value="usuario">Usuario</option>
            <option value="admin">Admin</option>
          </select>
        </td>
        <td className="p-2">
          <input
            type="text"
            name="identificacion"
            value={user.identificacion}
            onChange={handleInputChange}
            className="w-full p-1 bg-neutral-700 rounded border border-neutral-600"
          />
        </td>
        <td className="p-2">
          <input
            type="text"
            name="telefono"
            value={user.telefono}
            onChange={handleInputChange}
            className="w-full p-1 bg-neutral-700 rounded border border-neutral-600"
          />
        </td>
        <td className="p-2">
          <input
            type="password"
            name="password"
            placeholder="No cambiar"
            value={user.password || ""}
            onChange={handleInputChange}
            className="w-full p-1 bg-neutral-700 rounded border border-neutral-600"
          />
        </td>
        <td className="p-2 flex gap-2">
          <button
            onClick={() => onSave(user)}
            className="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-500 cursor-pointer"
          >
            Guardar
          </button>
          <button
            onClick={() => onViewUserOps(user)}
            title="Ver Operaciones"
            className="bg-yellow-600 text-white p-1 text-xs rounded hover:bg-yellow-500 cursor-pointer"
          >
            <ViewListIcon />
          </button>
          <button
            onClick={() => onDeleteUser(user)}
            title="Eliminar Usuario"
            className="bg-red-600 text-white p-1 text-xs rounded hover:bg-red-500 cursor-pointer"
          >
            <XIcon />
          </button>
        </td>
      </tr>
    );
  }
);

const ManageUsersModal = ({
  isOpen,
  onClose,
  onViewUserOps,
  setAlert,
  onDeleteUser,
}) => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const fetchUsers = useCallback(
    (page = 1) => {
      if (isOpen) {
        axios
          .get(`/usuarios?page=${page}&limit=10`)
          .then((res) => {
            const usersWithPasswordField = res.data.users.map((u) => ({
              ...u,
              password: "",
            }));
            setUsers(usersWithPasswordField);
            setPagination({
              currentPage: res.data.currentPage,
              totalPages: res.data.totalPages,
            });
          })
          .catch((err) => console.error("Error fetching users:", err));
      }
    },
    [isOpen]
  );

  useEffect(() => {
    if (isOpen) {
      fetchUsers(1);
    }
  }, [isOpen, fetchUsers]);

  const handleUserUpdate = (userId, field, value) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId ? { ...user, [field]: value } : user
      )
    );
  };

  const handleSave = useCallback(
    async (userData) => {
      const payload = { ...userData };
      if (!payload.password) {
        delete payload.password;
      }
      try {
        await axios.post("/actualizar-usuario", payload);
        setAlert({
          message: "Usuario actualizado correctamente",
          type: "success",
        });
        fetchUsers(pagination.currentPage);
      } catch (error) {
        console.error("Error updating user:", error);
        setAlert({ message: "Error al actualizar el usuario", type: "error" });
      }
    },
    [fetchUsers, pagination.currentPage, setAlert]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Usuarios"
      maxWidth="max-w-7xl"
    >
      <div className="sm:hidden space-y-4">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onDataChange={handleUserUpdate}
            onViewUserOps={onViewUserOps}
            onDeleteUser={onDeleteUser}
            onSave={handleSave}
          />
        ))}
      </div>
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-neutral-700 text-neutral-300 sticky top-0">
            <tr>
              {[
                "ID",
                "Nombre",
                "Email",
                "Balance",
                "Rol",
                "Identificación",
                "Teléfono",
                "Nueva Contraseña",
                "Acciones",
              ].map((h) => (
                <th key={h} className="p-2 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-neutral-800">
            {users.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onDataChange={handleUserUpdate}
                onViewUserOps={onViewUserOps}
                onDeleteUser={onDeleteUser}
                onSave={handleSave}
              />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        onPageChange={(page) => fetchUsers(page)}
      />
    </Modal>
  );
};

const RegistrationCodeModal = ({ isOpen, onClose, setAlert }) => {
  const [code, setCode] = useState("");
  const [newCode, setNewCode] = useState("");
  useEffect(() => {
    if (isOpen) {
      axios
        .get("/admin/registration-code")
        .then((res) => {
          setCode(res.data.code);
          setNewCode(res.data.code);
        })
        .catch(() =>
          setAlert({
            message: "No se pudo cargar el código actual",
            type: "error",
          })
        );
    }
  }, [isOpen, setAlert]);
  const handleSave = async () => {
    try {
      await axios.post("/admin/registration-code", { newCode });
      setAlert({ message: "Código de registro actualizado", type: "success" });
      onClose();
    } catch (error) {
      setAlert({ message: "Error al actualizar el código", type: "error" });
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestionar Código de Registro"
      maxWidth="max-w-md"
    >
      <div>
        <label className="block text-sm font-medium mb-2 text-neutral-300">
          Código Actual:
        </label>
        <input
          type="text"
          readOnly
          value={code}
          className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded mb-4 focus:outline-none"
        />
        <label className="block text-sm font-medium mb-2 text-neutral-300">
          Nuevo Código:
        </label>
        <input
          type="text"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-md text-white font-bold transition-colors bg-red-600 hover:bg-red-500 cursor-pointer"
          >
            Guardar Código
          </button>
        </div>
      </div>
    </Modal>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
    <div className="text-neutral-300 mb-6">{children}</div>
    <div className="flex justify-end gap-4">
      <button
        onClick={onClose}
        className="px-4 py-2 rounded-md bg-neutral-600 hover:bg-neutral-500 text-white font-bold transition-colors"
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white font-bold transition-colors"
      >
        Confirmar
      </button>
    </div>
  </Modal>
);

const UserProfile = React.memo(({ setAlert, onBack }) => {
  const { user, refreshUser } = useContext(AppContext);
  const [identificacion, setIdentificacion] = useState(
    user?.identificacion || ""
  );
  const [telefono, setTelefono] = useState(user?.telefono || "");
  useEffect(() => {
    setIdentificacion(user?.identificacion || "");
    setTelefono(user?.telefono || "");
  }, [user]);
  const handleSave = async () => {
    try {
      await axios.put("/me/profile", { identificacion, telefono });
      setAlert({ message: "Perfil actualizado con éxito", type: "success" });
      refreshUser();
    } catch (error) {
      setAlert({ message: "Error al actualizar el perfil", type: "error" });
    }
  };
  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="flex items-center text-red-400 hover:text-red-300 mb-4 cursor-pointer"
      >
        <ChevronLeftIcon /> Volver al Menú
      </button>
      <h2 className="text-xl font-bold mb-4">Mis datos</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-400">
            Nombre
          </label>
          <input
            type="text"
            readOnly
            value={user?.nombre || ""}
            className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-400">
            Email
          </label>
          <input
            type="email"
            readOnly
            value={user?.email || ""}
            className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded"
          />
        </div>
        <div>
          <label
            htmlFor="identificacion"
            className="block text-sm font-medium mb-1 text-neutral-400"
          >
            Identificación
          </label>
          <input
            id="identificacion"
            type="text"
            value={identificacion}
            onChange={(e) => setIdentificacion(e.target.value)}
            className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded"
          />
        </div>
        <div>
          <label
            htmlFor="telefono"
            className="block text-sm font-medium mb-1 text-neutral-400"
          >
            Teléfono
          </label>
          <input
            id="telefono"
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-md text-white font-bold bg-red-600 hover:bg-red-500 cursor-pointer transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
});

const DepositView = React.memo(({ onBack }) => {
  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="flex items-center text-red-400 hover:text-red-300 mb-4 cursor-pointer"
      >
        <ChevronLeftIcon /> Volver al Menú
      </button>
      <h2 className="text-xl font-bold mb-4 text-white">Depositar Fondos</h2>
      <p className="text-neutral-400">
        Aquí irá el formulario para depositar fondos.
      </p>
    </div>
  );
});

const WithdrawView = React.memo(({ onBack }) => {
  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="flex items-center text-red-400 hover:text-red-300 mb-4 cursor-pointer"
      >
        <ChevronLeftIcon /> Volver al Menú
      </button>
      <h2 className="text-xl font-bold mb-4 text-white">Retirar Fondos</h2>
      <p className="text-neutral-400">
        Aquí irá el formulario para retirar fondos.
      </p>
    </div>
  );
});

const MenuButton = React.memo(({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-2 rounded hover:bg-neutral-800 transition-colors flex items-center text-neutral-300 cursor-pointer"
  >
    {icon}
    <span className="ml-3">{text}</span>
  </button>
));

const SideMenu = React.memo(({ isOpen, onClose, setAlert }) => {
  const [view, setView] = useState("main");
  useEffect(() => {
    if (isOpen) {
      setView("main");
    }
  }, [isOpen]);
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", ease: "circOut", duration: 0.4 }}
            className="fixed top-0 left-0 h-full w-80 bg-neutral-900 shadow-2xl z-50 border-r border-neutral-700 flex flex-col"
          >
            <div className="p-4 border-b border-neutral-700 flex-shrink-0">
              <img
                className="mb-2"
                src="/bulltrodatw.png" // CORREGIDO: Ruta del logo sin /public
                width="220"
                alt="Logo"
              />
            </div>
            <div className="flex-grow overflow-y-auto">
              {view === "main" && (
                <div className="p-4 space-y-2">
                  <MenuButton
                    icon={
                      <ArrowDownTrayIcon className="h-5 w-5 text-green-400" />
                    }
                    text="Depositar"
                    onClick={() => setView("deposit")}
                  />
                  <MenuButton
                    icon={<ArrowUpTrayIcon className="h-5 w-5 text-red-400" />}
                    text="Retirar"
                    onClick={() => setView("withdraw")}
                  />
                  <div className="my-2 h-px bg-neutral-700" />
                  <MenuButton
                    icon={
                      <UserCircleIcon className="h-5 w-5 text-neutral-400" />
                    }
                    text="Completar Perfil"
                    onClick={() => setView("profile")}
                  />
                </div>
              )}
              {view === "profile" && (
                <UserProfile
                  setAlert={setAlert}
                  onBack={() => setView("main")}
                />
              )}
              {view === "deposit" && (
                <DepositView onBack={() => setView("main")} />
              )}
              {view === "withdraw" && (
                <WithdrawView onBack={() => setView("main")} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

//================================================================================
// 4. PÁGINA PRINCIPAL
//================================================================================
const DashboardPage = () => {
  const {
    user,
    selectedAsset,
    setSelectedAsset,
    realTimePrices,
    setRealTimePrices,
  } = useContext(AppContext);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [mobileVolume, setMobileVolume] = useState(0.01);

  const wsRef = useRef(null);

  const initialAssets = useMemo(
    () => [
      "BTCUSDT",
      "ETHUSDT",
      "SOLUSDT",
      "AAPL",
      "TSLA",
      "NVDA",
      "AMZN",
      "EURUSD",
      "GBPUSD",
      "USDJPY",
      "XAUUSD",
      "XAGUSD",
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
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    children: null,
    onConfirm: () => {},
  });
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
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
    if (user) {
      fetchData(1, "todas");
    }
  }, [user, fetchData]);

  useEffect(() => {
    if (!user) return;

    const connectWebSocket = () => {
      const wsUrl = import.meta.env.VITE_WSS_URL;
      if (!wsUrl) {
        console.error("VITE_WSS_URL is not defined in environment variables.");
        return;
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Conectado al WebSocket del servidor de la app");
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "subscribe", symbols: userAssets }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "price_update") {
            setRealTimePrices((prevPrices) => ({
              ...prevPrices,
              ...data.prices,
            }));
          } else if (data.tipo === "operacion_cerrada") {
            setAlert({
              message: `Operación #${data.operacion_id} (${
                data.activo
              }) cerrada por ${
                data.tipoCierre
              }. Ganancia: ${data.ganancia.toFixed(2)}`,
              type: "success",
            });
            fetchData(pagination.currentPage, opHistoryFilter);
          }
        } catch (error) {
          console.error("Error procesando mensaje de WebSocket:", error);
        }
      };

      ws.onclose = () => {
        console.log("🔌 Desconectado, intentando reconectar en 3s...");
        setTimeout(connectWebSocket, 3000);
      };
      ws.onerror = (error) => {
        console.error("❌ Error de WebSocket:", error);
        ws.close();
      };
    };
    connectWebSocket();

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [
    user,
    userAssets,
    fetchData,
    pagination.currentPage,
    opHistoryFilter,
    setRealTimePrices,
  ]);

  useEffect(() => {
    localStorage.setItem("userTradingAssets", JSON.stringify(userAssets));
  }, [userAssets]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (user) {
        axios.get("/estadisticas").then((res) => setStats(res.data));
        axios
          .get("/balance")
          .then((res) => setBalance(parseFloat(res.data.balance)));
      }
    }, 10000);
    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    const openOperations = operations.filter((op) => !op.cerrada);
    const pnl = openOperations.reduce((total, op) => {
      const currentPrice = realTimePrices[op.activo.toUpperCase()];
      if (!currentPrice) return total;
      return (
        total +
        (op.tipo_operacion.toLowerCase() === "sell"
          ? (op.precio_entrada - currentPrice) * op.volumen
          : (currentPrice - op.precio_entrada) * op.volumen)
      );
    }, 0);
    const usedMargin = openOperations.reduce(
      (total, op) => total + op.precio_entrada * op.volumen,
      0
    );
    const equity = balance + pnl;
    const freeMargin = equity - usedMargin;
    const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : 0;
    setMetrics({ balance, equity, usedMargin, freeMargin, marginLevel });
  }, [realTimePrices, operations, balance]);

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => {
        setAlert({ message: "", type: "info" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handlePageChange = (newPage) => {
    fetchData(newPage, opHistoryFilter);
  };
  const handleFilterChange = (newFilter) => {
    setOpHistoryFilter(newFilter);
    fetchData(1, newFilter);
  };

  const handleOpenNewOpModal = useCallback(
    (type, volume) => {
      if (!volume || volume <= 0) {
        setAlert({ message: "El volumen debe ser mayor a 0.", type: "error" });
        return;
      }
      const currentPrice = realTimePrices[selectedAsset.toUpperCase()];
      if (!currentPrice) {
        setAlert({
          message: "Precio del activo no disponible. Intente de nuevo.",
          type: "error",
        });
        return;
      }
      const cost = currentPrice * volume;
      if (cost > metrics.freeMargin) {
        setAlert({
          message: "Margen libre insuficiente para esta operación.",
          type: "error",
        });
        return;
      }
      setNewOpModalData({ type, volume, asset: selectedAsset });
      setIsNewOpModalOpen(true);
    },
    [realTimePrices, selectedAsset, metrics]
  );

  const handleConfirmOperation = useCallback(
    async (opDetails) => {
      const livePrice = realTimePrices[selectedAsset.toUpperCase()];
      if (!livePrice) {
        setAlert({
          message: "No se pudo confirmar, el precio no está disponible.",
          type: "error",
        });
        return;
      }
      try {
        const payload = {
          ...opDetails,
          activo: selectedAsset,
          precio_entrada: livePrice,
        };
        const { data } = await axios.post("/operar", payload);
        if (data.success) {
          setAlert({
            message: "Operación realizada con éxito",
            type: "success",
          });
          fetchData(1, opHistoryFilter);
        } else {
          setAlert({ message: data.error || "Error al operar", type: "error" });
        }
      } catch (error) {
        setAlert({
          message: error.response?.data?.error || "Error de red",
          type: "error",
        });
      }
    },
    [selectedAsset, opHistoryFilter, fetchData, realTimePrices]
  );

  const handleAddAsset = useCallback(
    (symbol) => {
      const upperSymbol = symbol.toUpperCase().trim();
      if (upperSymbol && !userAssets.includes(upperSymbol)) {
        setUserAssets((prevAssets) => [...prevAssets, upperSymbol]);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({ type: "subscribe", symbols: [upperSymbol] })
          );
        }
        setAlert({ message: `${upperSymbol} añadido.`, type: "success" });
      } else if (userAssets.includes(upperSymbol)) {
        setAlert({
          message: `${upperSymbol} ya existe en la lista.`,
          type: "error",
        });
      }
    },
    [userAssets]
  );

  const handleRemoveAsset = useCallback(
    (symbol) => {
      setUserAssets((prevAssets) => prevAssets.filter((a) => a !== symbol));
      if (selectedAsset === symbol) {
        const newAssetList = userAssets.filter((a) => a !== symbol);
        setSelectedAsset(newAssetList.length > 0 ? newAssetList[0] : "BTCUSDT");
      }
      setAlert({ message: `${symbol} eliminado.`, type: "success" });
    },
    [userAssets, selectedAsset, setSelectedAsset]
  );

  const handleViewUserOps = useCallback((user) => {
    setCurrentUserForOps(user);
    setIsUserOpsModalOpen(true);
  }, []);

  const handleOpRowClick = useCallback(
    (op) => {
      let profit;
      if (op.cerrada) {
        profit = parseFloat(op.ganancia || 0);
      } else {
        const currentPrice = realTimePrices[op.activo.toUpperCase()];
        profit = currentPrice
          ? op.tipo_operacion.toLowerCase() === "sell"
            ? (op.precio_entrada - currentPrice) * op.volumen
            : (currentPrice - op.precio_entrada) * op.volumen
          : 0;
      }
      setCurrentOpDetails({ op, profit });
      setIsOpDetailsModalOpen(true);
    },
    [realTimePrices]
  );

  const handleUpdatePrice = useCallback(
    async (opId, newPrice) => {
      try {
        await axios.post("/actualizar-precio", {
          id: opId,
          nuevoPrecio: parseFloat(newPrice),
        });
        setAlert({ message: "Precio actualizado", type: "success" });
        fetchData(pagination.currentPage, opHistoryFilter);
      } catch (error) {
        setAlert({ message: "Error al actualizar el precio", type: "error" });
      }
    },
    [fetchData, pagination.currentPage, opHistoryFilter]
  );

  const handleDeleteUser = useCallback((userToDelete) => {
    setConfirmationModal({
      isOpen: true,
      title: `Eliminar Usuario`,
      children: `¿Estás seguro de que quieres eliminar a ${userToDelete.nombre}? Esta acción no se puede deshacer y eliminará todas sus operaciones.`,
      onConfirm: async () => {
        try {
          await axios.delete(`/usuarios/${userToDelete.id}`);
          setAlert({
            message: `Usuario ${userToDelete.nombre} eliminado.`,
            type: "success",
          });
          setIsUsersModalOpen(false);
        } catch (error) {
          setAlert({
            message:
              error.response?.data?.error || "Error al eliminar usuario.",
            type: "error",
          });
        } finally {
          setConfirmationModal({
            isOpen: false,
            title: "",
            children: null,
            onConfirm: () => {},
          });
        }
      },
    });
  }, []);

  const displayMetrics = {
    balance: metrics.balance.toFixed(2),
    equity: metrics.equity.toFixed(2),
    usedMargin: metrics.usedMargin.toFixed(2),
    freeMargin: metrics.freeMargin.toFixed(2),
    marginLevel: metrics.marginLevel.toFixed(2),
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      <AnimatePresence>
        {alert.message && (
          <Toast
            message={alert.message}
            type={alert.type}
            onDismiss={() => setAlert({ message: "", type: "info" })}
          />
        )}
      </AnimatePresence>

      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        setAlert={setAlert}
      />

      <AnimatePresence>
        {isSidebarVisible && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
              onClick={() => setIsSidebarVisible(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 h-full w-72 bg-neutral-900 p-4 overflow-y-auto flex-shrink-0 border-r border-neutral-800 flex flex-col z-40 lg:hidden"
            >
              <div className="flex-grow">
                <img
                  className="mb-4"
                  src="/bulltrodatw.png" // CORREGIDO: Ruta del logo sin /public
                  width="220"
                  alt="Logo"
                />
                <AssetLists
                  assets={userAssets}
                  onAddAsset={handleAddAsset}
                  onRemoveAsset={handleRemoveAsset}
                />
              </div>
              <div className="flex-shrink-0">
                <StatisticsPanel
                  stats={stats}
                  performanceData={performanceData}
                  isLoading={isLoadingData}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex lg:flex-col w-72 bg-black/30 p-4 overflow-y-auto flex-shrink-0 border-r border-neutral-800">
        <div className="flex-grow">
          <img
            className="mb-4"
            src="/bulltrodatw.png" // CORREGIDO: Ruta del logo sin /public
            width="220"
            alt="Logo"
          />
          <AssetLists
            assets={userAssets}
            onAddAsset={handleAddAsset}
            onRemoveAsset={handleRemoveAsset}
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

      <NewOperationModal
        isOpen={isNewOpModalOpen}
        onClose={() => setIsNewOpModalOpen(false)}
        operationData={newOpModalData}
        onConfirm={handleConfirmOperation}
      />
      <ManageUsersModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        onViewUserOps={handleViewUserOps}
        setAlert={setAlert}
        onDeleteUser={handleDeleteUser}
      />
      <UserOperationsModal
        isOpen={isUserOpsModalOpen}
        onClose={() => setIsUserOpsModalOpen(false)}
        user={currentUserForOps}
        onUpdatePrice={handleUpdatePrice}
      />
      <OperationDetailsModal
        isOpen={isOpDetailsModalOpen}
        onClose={() => setIsOpDetailsModalOpen(false)}
        operation={currentOpDetails?.op}
        profit={currentOpDetails?.profit}
      />
      <RegistrationCodeModal
        isOpen={isRegCodeModalOpen}
        onClose={() => setIsRegCodeModalOpen(false)}
        setAlert={setAlert}
      />
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal({
            isOpen: false,
            title: "",
            children: null,
            onConfirm: () => {},
          })
        }
        title={confirmationModal.title}
        onConfirm={confirmationModal.onConfirm}
      >
        {confirmationModal.children}
      </ConfirmationModal>

      <main className="flex-1 flex flex-col bg-black/50 overflow-hidden">
        <Header
          onOperation={handleOpenNewOpModal}
          onManageUsers={() => setIsUsersModalOpen(true)}
          onManageRegCode={() => setIsRegCodeModalOpen(true)}
          onToggleSideMenu={() => setIsSideMenuOpen(true)}
          onToggleMainSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        />

        <div className="flex-1 flex flex-col p-2 sm:p-4 gap-4 overflow-y-auto pb-24 sm:pb-4">
          <div className="flex-grow min-h-[300px] sm:min-h-[400px] bg-black rounded-lg shadow-2xl shadow-black/30">
            <TradingViewWidget symbol={selectedAsset} />
          </div>
          <FinancialMetrics
            metrics={displayMetrics}
            isLoading={isLoadingData}
          />
          <div className="h-full flex flex-col">
            <OperationsHistory
              operations={operations}
              setOperations={setOperations}
              filter={opHistoryFilter}
              setFilter={handleFilterChange}
              onRowClick={handleOpRowClick}
              isLoading={isLoadingData}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-3 border-t border-neutral-800 flex justify-around items-center gap-2">
          <button
            onClick={() => handleOpenNewOpModal("sell", mobileVolume)}
            className="flex-1 bg-red-600 hover:bg-red-500 transition-all text-white px-4 py-3 text-sm font-bold rounded-md"
          >
            SELL
          </button>
          <input
            type="number"
            value={mobileVolume}
            onChange={(e) => setMobileVolume(parseFloat(e.target.value) || 0)}
            step="0.01"
            min="0.01"
            className="w-24 p-3 border border-neutral-700 bg-neutral-800 rounded-md text-white text-center text-sm focus:ring-2 focus:ring-neutral-500 focus:outline-none"
          />
          <button
            onClick={() => handleOpenNewOpModal("buy", mobileVolume)}
            className="flex-1 bg-green-600 hover:bg-green-500 transition-all text-white px-4 py-3 text-sm font-bold rounded-md"
          >
            BUY
          </button>
        </div>
      </main>
    </div>
  );
};

//================================================================================
// 5. COMPONENTE PRINCIPAL DE LA APLICACIÓN
//================================================================================
const App = () => {
  const { isAppLoading, isAuthenticated } = useContext(AppContext);

  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl font-bold animate-pulse">
          <img src="/bulltrodatw.png" width="220" alt="Cargando..." />{" "}
          {/* CORREGIDO: Ruta del logo */}
        </div>
      </div>
    );
  }

  return isAuthenticated ? <DashboardPage /> : <LoginPage />;
};

const LoginPage = () => {
  const { setUser, setIsAuthenticated } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const url = isLogin ? "/login" : "/register";
    const payload = isLogin
      ? { email, password }
      : { nombre, email, password, codigo };
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
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-neutral-700">
        <img
          className="mb-3 mx-auto"
          src="/bulltrodatw.png"
          alt="Logo de Bulltrodat"
        />{" "}
        {/* CORREGIDO: Ruta del logo */}
        <p className="text-center text-neutral-400 mb-6">
          {isLogin ? "Inicia sesión para continuar" : "Crea tu cuenta"}
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
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-neutral-300 mb-2" htmlFor="nombre">
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full p-2 bg-neutral-700 text-white rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-neutral-300 mb-2" htmlFor="codigo">
                  Código de Registro
                </label>
                <input
                  type="text"
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  className="w-full p-2 bg-neutral-700 text-white rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </>
          )}
          <div className="mb-4">
            <label className="block text-neutral-300 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-neutral-700 text-white rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-neutral-300 mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-neutral-700 text-white rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white p-3 rounded-md hover:bg-red-500 font-bold transition-colors shadow-lg cursor-pointer"
          >
            {isLogin ? "Entrar" : "Crear Cuenta"}
          </button>
        </form>
        <p className="text-center text-neutral-400 mt-6 text-sm">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setSuccess("");
            }}
            className="text-red-400 hover:underline ml-1 font-semibold cursor-pointer"
          >
            {isLogin ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
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
