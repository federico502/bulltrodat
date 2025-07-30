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
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

// --- Registro de Chart.js ---
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

const Icons = {
  Menu: () => <Icon path="M4 6h16M4 12h16M4 18h16" className="h-6 w-6" />,
  Plus: () => <Icon path="M12 4v16m8-8H4" className="h-4 w-4" />,
  UserGroup: ({ className }) => (
    <Icon
      path="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
      className={className}
    />
  ),
  Logout: ({ className }) => (
    <Icon
      path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      className={className}
    />
  ),
  X: ({ className = "h-6 w-6" }) => (
    <Icon path="M6 18L18 6M6 6l12 12" className={className} />
  ),
  ViewList: () => (
    <Icon path="M4 6h16M4 10h16M4 14h16M4 18h16" className="h-4 w-4" />
  ),
  Key: ({ className }) => (
    <Icon
      path="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a4 4 0 100 8 4 4 0 000-8z"
      className={className}
    />
  ),
  UserCircle: ({ className }) => (
    <Icon
      path="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
      className={className}
    />
  ),
  ChevronLeft: () => <Icon path="M15 19l-7-7 7-7" className="h-5 w-5 mr-2" />,
  ArrowDownTray: ({ className }) => (
    <Icon
      path="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
      className={className}
    />
  ),
  ArrowUpTray: ({ className }) => (
    <Icon
      path="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
      className={className}
    />
  ),
  Clipboard: ({ className }) => (
    <Icon
      path="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v3.043m-7.416 0v3.043c0 .212.03.418.084.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
      className={className}
    />
  ),
  Banknotes: ({ className }) => (
    <Icon
      path="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0 .75-.75V9.75M15 13.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      className={className}
    />
  ),
  CreditCard: ({ className }) => (
    <Icon
      path="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z"
      className={className}
    />
  ),
  Eye: ({ className }) => (
    <Icon path="M15 12a3 3 0 11-6 0 3 3 0 016 0z" className={className} />
  ),
  EyeOff: ({ className }) => (
    <Icon
      path="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-2.14 3.354m-4.243-4.243l-4.242-4.242"
      className={className}
    />
  ),
};

// Lista de todos los activos disponibles para las recomendaciones
const ALL_AVAILABLE_ASSETS = [
  // Cryptos
  "BTC-USDT",
  "ETH-USDT",
  "SOL-USDT",
  "XRP-USDT",
  "DOGE-USDT",
  "ADA-USDT",
  "AVAX-USDT",
  "LTC-USDT",
  "BCH-USDT",
  "LINK-USDT",
  // Stocks
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "TSLA",
  "META",
  "JPM",
  "JNJ",
  // Forex
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "USD/CHF",
  "AUD/USD",
  "USD/CAD",
  "NZD/USD",
  "EUR/GBP",
  "EUR/JPY",
  "EUR/CHF",
  "GBP/JPY",
  "GBP/CHF",
  "AUD/JPY",
  "CAD/JPY",
  // Commodities
  "XAU/USD",
  "XAG/USD",
  "WTI/USD",
  "BRENT/USD",
];

// --- Contexto de la App ---
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [realTimePrices, setRealTimePrices] = useState({});
  const [selectedAsset, setSelectedAsset] = useState("BTC-USDT");

  const checkUser = useCallback(async () => {
    setIsAppLoading(true);
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
    try {
      await axios.post("/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
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

// --- Hooks y Componentes de UI ---
const useFlashOnUpdate = (value) => {
  const [flashClass, setFlashClass] = useState("");
  const prevValueRef = useRef(value);

  useEffect(() => {
    const currentValue = parseFloat(value);
    const prevValue = parseFloat(prevValueRef.current);

    if (
      !isNaN(currentValue) &&
      !isNaN(prevValue) &&
      currentValue !== prevValue
    ) {
      setFlashClass(
        currentValue > prevValue ? "text-green-400" : "text-red-500"
      );
      const timer = setTimeout(() => setFlashClass(""), 300);
      return () => clearTimeout(timer);
    }
  }, [value]);

  useEffect(() => {
    prevValueRef.current = value;
  });

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
    className={`bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-lg shadow-lg ${className}`}
    {...props}
  >
    {children}
  </motion.div>
));

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/10 rounded-md ${className}`} />
);

const TradingViewWidget = React.memo(({ symbol }) => {
  const containerRef = useRef(null);

  const getTradingViewSymbol = useCallback((assetSymbol) => {
    if (!assetSymbol) return "KUCOIN:BTCUSDT";
    let s = assetSymbol.toUpperCase();

    if (s.includes("-USDT")) return `KUCOIN:${s.replace("-", "")}`;
    if (s.endsWith("USDT")) return `KUCOIN:${s}`;

    if (s === "WTI/USD") return "TVC:USOIL";
    if (s === "BRENT/USD") return "TVC:UKOIL";
    if (s === "XAU/USD") return "OANDA:XAUUSD";
    if (s === "XAG/USD") return "OANDA:XAGUSD";

    if (s.includes("/")) {
      const sanitizedSymbol = s.replace("/", "");
      const forexPairs = [
        "EURUSD",
        "USDJPY",
        "GBPUSD",
        "AUDUSD",
        "USDCAD",
        "USDCHF",
        "NZDUSD",
        "EURJPY",
        "GBPJPY",
        "AUDJPY",
        "CADJPY",
        "CHFJPY",
        "NZDJPY",
        "EURGBP",
        "EURAUD",
        "EURCAD",
        "EURCHF",
        "EURNZD",
        "GBPAUD",
        "GBPCAD",
        "GBPCHF",
        "GBPNZD",
        "AUDCAD",
        "AUDCHF",
        "AUDNZD",
        "CADCHF",
        "NZDCAD",
        "NZDCHF",
      ];
      if (forexPairs.includes(sanitizedSymbol)) {
        return `OANDA:${sanitizedSymbol}`;
      }
    }

    return `NASDAQ:${s}`;
  }, []);

  useEffect(() => {
    const tvSymbol = getTradingViewSymbol(symbol);
    let widget = null;

    const createWidget = () => {
      if (!containerRef.current || typeof window.TradingView === "undefined")
        return;

      containerRef.current.innerHTML = "";
      widget = new window.TradingView.widget({
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
        backgroundColor: "rgba(0,0,0,0)",
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
  }, [symbol, getTradingViewSymbol]);

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
        className="px-3 py-1 bg-white/10 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors text-xs"
      >
        Anterior
      </button>
      <span className="text-neutral-400 text-xs">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-white/10 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors text-xs"
      >
        Siguiente
      </button>
    </div>
  );
};

const PerformanceChart = ({ performanceData, isLoading }) => {
  const chartData = useMemo(
    () => ({
      labels: performanceData.map((d) =>
        new Date(d.fecha).toLocaleDateString()
      ),
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
    }),
    [performanceData]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { display: false }, y: { display: false } },
      plugins: { legend: { display: false } },
    }),
    []
  );

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
          <Skeleton className="h-5" /> <Skeleton className="h-5" />
          <Skeleton className="h-5" /> <Skeleton className="h-5" />
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
  const normalizedSymbol = symbol.toUpperCase().replace(/[-/]/g, "");
  const price = realTimePrices[normalizedSymbol];
  const flashClass = useFlashOnUpdate(price);
  const baseColor = price ? "text-white" : "text-neutral-500";
  const finalColorClass = flashClass || baseColor;
  return (
    <div className="px-2 py-1 rounded-md">
      <span
        className={`font-mono text-xs transition-colors duration-300 ${finalColorClass}`}
      >
        {price ? price.toFixed(4) : "---"}
      </span>
    </div>
  );
});

const AssetRow = React.memo(({ symbol, isSelected, onClick, onRemove }) => (
  <motion.li
    layout
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -20 }}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => onClick(symbol)}
    className={`cursor-pointer transition-all duration-200 rounded-md flex justify-between items-center p-2 group ${
      isSelected
        ? "bg-cyan-500/20 text-white"
        : "hover:bg-white/10 text-neutral-300"
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
        <Icons.X className="h-4 w-4" />
      </button>
    </div>
  </motion.li>
));

const AssetLists = React.memo(({ assets, onAddAsset, onRemoveAsset }) => {
  const { setSelectedAsset, selectedAsset } = useContext(AppContext);
  const [newSymbol, setNewSymbol] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowRecommendations(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setNewSymbol(value);
    if (value) {
      const filtered = ALL_AVAILABLE_ASSETS.filter((asset) =>
        asset.toUpperCase().includes(value)
      );
      setRecommendations(filtered);
      setShowRecommendations(true);
    } else {
      setShowRecommendations(false);
    }
  };

  const handleRecommendationClick = (symbol) => {
    setNewSymbol(symbol);
    setShowRecommendations(false);
  };

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
      setShowRecommendations(false);
    }
  };

  return (
    <div className="mb-6">
      <div ref={searchContainerRef} className="relative">
        <form onSubmit={handleSubmit} className="mb-1 flex gap-2">
          <input
            type="text"
            value={newSymbol}
            onChange={handleInputChange}
            onFocus={() => newSymbol && setShowRecommendations(true)}
            placeholder="Ej: EUR/USD, TSLA"
            className="w-full p-2 bg-white/5 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded transition-colors flex-shrink-0 cursor-pointer"
          >
            <Icons.Plus />
          </button>
        </form>
        {showRecommendations && recommendations.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute w-full bg-neutral-900 border border-white/10 rounded-md mt-1 max-h-40 overflow-y-auto z-20"
          >
            {recommendations.map((rec) => (
              <li
                key={rec}
                onClick={() => handleRecommendationClick(rec)}
                className="px-3 py-2 text-sm text-neutral-300 hover:bg-cyan-500/50 cursor-pointer"
              >
                {rec}
              </li>
            ))}
          </motion.ul>
        )}
      </div>
      <h2 className="text-neutral-400 font-bold text-sm tracking-wider uppercase mt-4 mb-3 px-2">
        Mis Activos
      </h2>
      <ul className="space-y-1 max-h-48 overflow-y-auto">
        <AnimatePresence>
          {assets.map((symbol) => (
            <AssetRow
              key={symbol}
              symbol={symbol}
              isSelected={selectedAsset === symbol}
              onClick={handleAssetClick}
              onRemove={onRemoveAsset}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
});

const MenuItem = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-white/10 rounded-md transition-colors"
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
        if (menuRef.current && !menuRef.current.contains(event.target))
          setIsOpen(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleItemClick = (action) => {
      if (action) action();
      setIsOpen(false);
    };
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/10 cursor-pointer text-white p-2 rounded-full hover:bg-cyan-500 transition-colors"
          title="Cuenta"
        >
          <Icons.UserCircle className="h-6 w-6" />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-neutral-900 ring-1 ring-white/10 focus:outline-none z-50 p-2 border border-white/10"
            >
              <div className="px-3 py-2 border-b border-white/10 mb-2">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.nombre || "Usuario"}
                </p>
                <p className="text-xs text-neutral-400 truncate">
                  {user?.email || "email@example.com"}
                </p>
              </div>
              <div className="space-y-1">
                <MenuItem
                  icon={
                    <Icons.UserCircle className="h-5 w-5 text-neutral-400" />
                  }
                  text="Gestionar Cuenta"
                  onClick={() => handleItemClick(onToggleSideMenu)}
                />
                {user?.rol === "admin" && (
                  <>
                    <MenuItem
                      icon={
                        <Icons.UserGroup className="h-5 w-5 text-neutral-400" />
                      }
                      text="Gestionar Usuarios"
                      onClick={() => handleItemClick(onManageUsers)}
                    />
                    <MenuItem
                      icon={<Icons.Key className="h-5 w-5 text-neutral-400" />}
                      text="Código de Registro"
                      onClick={() => handleItemClick(onManageRegCode)}
                    />
                  </>
                )}
                <div className="my-1 h-px bg-white/10" />
                <MenuItem
                  icon={
                    <Icons.Logout className="h-5 w-5 cursor-pointer text-cyan-400" />
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
    <header className="flex justify-between items-center px-4 sm:px-6 py-3 bg-black/20 border-b border-white/10">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMainSidebar}
          className="p-2 rounded-full hover:bg-white/10 lg:hidden"
        >
          <Icons.Menu />
        </button>
        <div className="hidden sm:flex items-center space-x-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onOperation("sell", volume)}
            className="bg-red-600 hover:bg-red-500 transition-all text-white px-5 py-2 text-sm font-bold rounded-md shadow-lg shadow-red-500/20 hover:shadow-red-500/40 cursor-pointer"
          >
            SELL
          </motion.button>
          <input
            type="number"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value) || 0)}
            step="0.01"
            min="0.01"
            className="w-24 p-2 border border-white/10 bg-white/5 rounded-md text-white text-center text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onOperation("buy", volume)}
            className="bg-green-600 hover:bg-green-500 transition-all text-white px-5 py-2 text-sm font-bold rounded-md shadow-lg shadow-green-500/20 hover:shadow-green-500/40 cursor-pointer"
          >
            BUY
          </motion.button>
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
      {!isNaN(parseFloat(value)) ? parseFloat(value).toFixed(2) : "0.00"}
      {suffix}
    </span>
  );
};

const FinancialMetrics = ({ metrics, isLoading }) => (
  <Card className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 justify-items-center p-3 text-xs sm:text-sm">
    {isLoading ? (
      Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))
    ) : (
      <>
        <div className="text-center p-2 w-full">
          <p className="text-neutral-400">Balance</p>
          <span className="font-bold text-white">${metrics.balance}</span>
        </div>
        <div className="text-center p-2 w-full">
          <p className="text-neutral-400">Equidad</p>
          <FlashingMetric value={metrics.equity} prefix="$" />
        </div>
        <div className="text-center p-2 w-full">
          <p className="text-neutral-400">M. Usado</p>
          <FlashingMetric value={metrics.usedMargin} prefix="$" />
        </div>
        <div className="text-center p-2 w-full">
          <p className="text-neutral-400">M. Libre</p>
          <FlashingMetric value={metrics.freeMargin} prefix="$" />
        </div>
        <div className="text-center p-2 w-full col-span-2 sm:col-span-1 md:col-span-1">
          <p className="text-neutral-400">Nivel Margen</p>
          <FlashingMetric value={metrics.marginLevel} suffix="%" />
        </div>
      </>
    )}
  </Card>
);

const LiveProfitCell = ({ operation }) => {
  const { realTimePrices } = useContext(AppContext);
  const calculateProfit = useCallback(() => {
    if (operation.cerrada) return parseFloat(operation.ganancia || 0);
    const normalizedSymbol = operation.activo
      .toUpperCase()
      .replace(/[-/]/g, "");
    const currentPrice = realTimePrices[normalizedSymbol];
    if (typeof currentPrice !== "number") return 0;
    return operation.tipo_operacion.toLowerCase() === "sell"
      ? (operation.precio_entrada - currentPrice) * operation.volumen
      : (currentPrice - operation.precio_entrada) * operation.volumen;
  }, [realTimePrices, operation]);
  const profit = calculateProfit();
  const profitColor = profit >= 0 ? "text-green-400" : "text-red-500";
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
  setAlert,
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
        setAlert({ message: "Operación cerrada con éxito.", type: "success" });
      } else {
        setAlert({
          message: data.error || "No se pudo cerrar la operación.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error closing operation:", error);
      setAlert({
        message: "Error de red al cerrar la operación.",
        type: "error",
      });
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
      },
    }),
  };

  const renderMobileCard = (op, index) => (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
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
        <div className="flex justify-between items-center pt-2 border-t border-white/10">
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
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded-md text-xs transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          )}
        </div>
      </Card>
    </motion.div>
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
            className="bg-white/5 text-white text-sm rounded-md p-1 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="todas">Todas</option>
            <option value="abiertas">Abiertas</option>
            <option value="cerradas">Cerradas</option>
          </select>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        <table className="hidden sm:table w-full text-sm text-left text-neutral-300">
          <thead className="bg-white/5 text-xs uppercase sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              {columns.map((h) => (
                <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
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
                    className="hover:bg-white/5 cursor-pointer"
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
                          className="bg-cyan-600 hover:bg-cyan-500 text-white px-2 py-1 rounded-md text-xs w-full transition-colors cursor-pointer"
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
      <div className="p-2 border-t border-white/10">
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
          className={`bg-neutral-900 rounded-lg shadow-xl w-full ${maxWidth} text-white border border-white/10 flex flex-col max-h-[90vh]`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-shrink-0 flex justify-between items-center p-4 sm:p-6 border-b border-white/10">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white cursor-pointer"
            >
              <Icons.X />
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
  const normalizedSymbol = symbol?.toUpperCase().replace(/[-/]/g, "");
  const price = realTimePrices[normalizedSymbol];
  const flashClass = useFlashOnUpdate(price);
  const baseColor = price ? "text-white" : "text-yellow-400";
  const finalColorClass = flashClass || baseColor;
  return (
    <span
      className={`font-mono transition-colors duration-300 ${finalColorClass}`}
    >
      ${price ? price.toFixed(4) : "Cargando..."}
    </span>
  );
});

const NewOperationModal = ({ isOpen, onClose, operationData, onConfirm }) => {
  const { type, asset, volume } = operationData || {};
  const { realTimePrices } = useContext(AppContext);
  const normalizedAsset = asset?.toUpperCase().replace(/[-/]/g, "");
  const livePrice = realTimePrices[normalizedAsset];
  const requiredMargin = livePrice ? (livePrice * volume).toFixed(2) : "0.00";
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setTp("");
      setSl("");
    }
  }, [isOpen]);

  const calculatePotentialProfit = (value, targetType) => {
    if (!value || !livePrice || !volume) return null;
    const targetPrice = parseFloat(value);
    if (isNaN(targetPrice)) return null;

    if (targetType === "tp") {
      return type === "buy"
        ? (targetPrice - livePrice) * volume
        : (livePrice - targetPrice) * volume;
    }
    if (targetType === "sl") {
      return type === "buy"
        ? (targetPrice - livePrice) * volume
        : (livePrice - targetPrice) * volume;
    }
    return null;
  };

  const potentialTpProfit = calculatePotentialProfit(tp, "tp");
  const potentialSlProfit = calculatePotentialProfit(sl, "sl");

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
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-neutral-300">
          Take Profit (opcional):
        </label>
        <input
          type="number"
          value={tp}
          onChange={(e) => setTp(e.target.value)}
          placeholder="Precio de cierre para tomar ganancias"
          className="w-full p-2 bg-white/5 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {potentialTpProfit !== null && (
          <p className="text-xs mt-1 text-green-400">
            Ganancia Potencial: ${potentialTpProfit.toFixed(2)}
          </p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-neutral-300">
          Stop Loss (opcional):
        </label>
        <input
          type="number"
          value={sl}
          onChange={(e) => setSl(e.target.value)}
          placeholder="Precio de cierre para limitar pérdidas"
          className="w-full p-2 bg-white/5 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        {potentialSlProfit !== null && (
          <p className="text-xs mt-1 text-red-400">
            Pérdida Potencial: ${potentialSlProfit.toFixed(2)}
          </p>
        )}
      </div>
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
              <tr key={op.id} className="border-b border-white/10">
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
                    className="w-full p-1 bg-white/5 rounded border border-white/10"
                  />
                </td>
                <td className="p-2">{new Date(op.fecha).toLocaleString()}</td>
                <td className="p-2">{op.cerrada ? "Cerrada" : "Abierta"}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleSavePrice(op.id)}
                    className="bg-cyan-600 text-white px-3 py-1 text-xs rounded hover:bg-cyan-500 cursor-pointer"
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
                ? "bg-cyan-500/20 text-cyan-400"
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
              className="flex-1 p-1 bg-white/5 rounded border border-white/10"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-neutral-400">ID:</label>
            <input
              type="text"
              name="identificacion"
              value={user.identificacion}
              onChange={handleInputChange}
              className="flex-1 p-1 bg-white/5 rounded border border-white/10"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-neutral-400">Teléfono:</label>
            <input
              type="text"
              name="telefono"
              value={user.telefono}
              onChange={handleInputChange}
              className="flex-1 p-1 bg-white/5 rounded border border-white/10"
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
              className="flex-1 p-1 bg-white/5 rounded border border-white/10"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
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
            <Icons.ViewList />
          </button>
          <button
            onClick={() => onDeleteUser(user)}
            title="Eliminar Usuario"
            className="bg-red-600 text-white p-1 text-xs rounded hover:bg-red-500 cursor-pointer"
          >
            <Icons.X />
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
      <tr className="border-b border-white/10">
        <td className="p-2 whitespace-nowrap">{user.id}</td>
        <td className="p-2">
          <input
            type="text"
            name="nombre"
            value={user.nombre}
            onChange={handleInputChange}
            className="w-full p-1 bg-white/5 rounded border border-white/10"
          />
        </td>
        <td className="p-2">
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
            className="w-full p-1 bg-white/5 rounded border border-white/10"
          />
        </td>
        <td className="p-2">
          <input
            type="number"
            name="balance"
            step="any"
            value={user.balance}
            onChange={handleInputChange}
            className="w-full p-1 bg-white/5 rounded border border-white/10"
          />
        </td>
        <td className="p-2">
          <select
            name="rol"
            value={user.rol}
            onChange={handleInputChange}
            className="w-full p-1 bg-white/5 rounded border border-white/10 cursor-pointer"
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
            className="w-full p-1 bg-white/5 rounded border border-white/10"
          />
        </td>
        <td className="p-2">
          <input
            type="text"
            name="telefono"
            value={user.telefono}
            onChange={handleInputChange}
            className="w-full p-1 bg-white/5 rounded border border-white/10"
          />
        </td>
        <td className="p-2">
          <input
            type="password"
            name="password"
            placeholder="No cambiar"
            value={user.password || ""}
            onChange={handleInputChange}
            className="w-full p-1 bg-white/5 rounded border border-white/10"
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
            <Icons.ViewList />
          </button>
          <button
            onClick={() => onDeleteUser(user)}
            title="Eliminar Usuario"
            className="bg-red-600 text-white p-1 text-xs rounded hover:bg-red-500 cursor-pointer"
          >
            <Icons.X />
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
      if (!payload.password) delete payload.password;
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
          className="w-full p-2 bg-white/5 border border-white/10 rounded mb-4 focus:outline-none"
        />
        <label className="block text-sm font-medium mb-2 text-neutral-300">
          Nuevo Código:
        </label>
        <input
          type="text"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          className="w-full p-2 bg-white/5 border border-white/10 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-md text-white font-bold transition-colors bg-cyan-600 hover:bg-cyan-500 cursor-pointer"
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
        className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
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
        className="flex items-center text-cyan-400 hover:text-cyan-300 mb-4 cursor-pointer"
      >
        <Icons.ChevronLeft /> Volver al Menú
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
            className="w-full p-2 bg-white/5 border border-white/10 rounded"
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
            className="w-full p-2 bg-white/5 border border-white/10 rounded"
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
            className="w-full p-2 bg-white/5 border border-white/10 rounded"
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
            className="w-full p-2 bg-white/5 border border-white/10 rounded"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-md text-white font-bold bg-cyan-600 hover:bg-cyan-500 cursor-pointer transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
});

const PaymentMethodButton = ({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-4 flex items-center gap-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
  >
    {icon}
    <span className="font-semibold text-lg">{text}</span>
  </button>
);

const DepositView = React.memo(({ onBack, onSelectMethod }) => (
  <div className="p-4">
    <button
      onClick={onBack}
      className="flex items-center text-cyan-400 hover:text-cyan-300 mb-6 cursor-pointer"
    >
      <Icons.ChevronLeft /> Volver al Menú Principal
    </button>
    <h2 className="text-2xl font-bold mb-6 text-white">
      Seleccione un Método de Depósito
    </h2>
    <div className="space-y-4">
      <PaymentMethodButton
        icon={<Icons.CreditCard className="h-8 w-8 text-cyan-400" />}
        text="Criptomonedas"
        onClick={() => onSelectMethod("crypto", "deposit")}
      />
      <PaymentMethodButton
        icon={<Icons.Banknotes className="h-8 w-8 text-green-400" />}
        text="Transferencia Bancaria"
        onClick={() => onSelectMethod("bank", "deposit")}
      />
    </div>
  </div>
));

const WithdrawView = React.memo(({ onBack, onSelectMethod }) => (
  <div className="p-4">
    <button
      onClick={onBack}
      className="flex items-center text-cyan-400 hover:text-cyan-300 mb-6 cursor-pointer"
    >
      <Icons.ChevronLeft /> Volver al Menú Principal
    </button>
    <h2 className="text-2xl font-bold mb-6 text-white">
      Seleccione un Método de Retiro
    </h2>
    <div className="space-y-4">
      <PaymentMethodButton
        icon={<Icons.CreditCard className="h-8 w-8 text-cyan-400" />}
        text="Criptomonedas"
        onClick={() => onSelectMethod("crypto", "withdraw")}
      />
      <PaymentMethodButton
        icon={<Icons.Banknotes className="h-8 w-8 text-green-400" />}
        text="Transferencia Bancaria"
        onClick={() => onSelectMethod("bank", "withdraw")}
      />
    </div>
  </div>
));

const MenuButton = React.memo(({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-2 rounded hover:bg-white/10 transition-colors flex items-center text-neutral-300 cursor-pointer"
  >
    {icon}
    <span className="ml-3">{text}</span>
  </button>
));

const SideMenu = React.memo(
  ({ isOpen, onClose, setAlert, onSelectPaymentMethod }) => {
    const [view, setView] = useState("main");
    useEffect(() => {
      if (isOpen) setView("main");
    }, [isOpen]);

    const handleSelectMethod = (method, type) => {
      onSelectPaymentMethod(method, type);
    };

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
              className="fixed top-0 left-0 h-full w-80 bg-neutral-900 shadow-2xl z-50 border-r border-white/10 flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex-shrink-0">
                <img
                  className="mb-2"
                  src="/bulltrodatw.png"
                  width="220"
                  alt="Logo"
                />
              </div>
              <div className="flex-grow overflow-y-auto">
                {view === "main" && (
                  <div className="p-4 space-y-2">
                    <MenuButton
                      icon={
                        <Icons.ArrowDownTray className="h-5 w-5 text-green-400" />
                      }
                      text="Depositar"
                      onClick={() => setView("deposit")}
                    />
                    <MenuButton
                      icon={
                        <Icons.ArrowUpTray className="h-5 w-5 text-cyan-400" />
                      }
                      text="Retirar"
                      onClick={() => setView("withdraw")}
                    />
                    <div className="my-2 h-px bg-white/10" />
                    <MenuButton
                      icon={
                        <Icons.UserCircle className="h-5 w-5 text-neutral-400" />
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
                  <DepositView
                    onBack={() => setView("main")}
                    onSelectMethod={(method) =>
                      handleSelectMethod(method, "deposit")
                    }
                  />
                )}
                {view === "withdraw" && (
                  <WithdrawView
                    onBack={() => setView("main")}
                    onSelectMethod={(method) =>
                      handleSelectMethod(method, "withdraw")
                    }
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
);

const CryptoPaymentModal = ({ isOpen, onClose, type, onSubmitted }) => {
  const [network, setNetwork] = useState("TRC20");
  const depositAddress = "TQmZ1fA2gB4iC3dE5fG6h7J8k9L0mN1oP2q";

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddress);
    onSubmitted();
  };

  const handleWithdrawal = (e) => {
    e.preventDefault();
    onSubmitted();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${
        type === "deposit" ? "Depositar" : "Retirar"
      } con Criptomonedas`}
      maxWidth="max-w-lg"
    >
      {type === "deposit" ? (
        <div className="text-center">
          <p className="text-neutral-400 mb-4">
            Envía USDT a la siguiente dirección usando la red TRON (TRC20).
          </p>
          <div className="bg-neutral-800 p-4 rounded-lg my-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${depositAddress}`}
              alt="QR Code"
              className="mx-auto border-4 border-white rounded-lg"
            />
          </div>
          <div className="bg-neutral-900/50 p-3 rounded-lg flex items-center justify-between gap-4">
            <span className="font-mono text-sm break-all text-neutral-300">
              {depositAddress}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-md hover:bg-neutral-700 transition-colors flex-shrink-0"
            >
              <Icons.Clipboard className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-yellow-400 mt-4">
            Asegúrate de enviar únicamente USDT en la red TRC20. Enviar otra
            moneda o usar otra red podría resultar en la pérdida de tus fondos.
          </p>
        </div>
      ) : (
        <form onSubmit={handleWithdrawal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Tu Dirección de Billetera (USDT)
            </label>
            <input
              required
              type="text"
              placeholder="Introduce tu dirección de billetera"
              className="w-full p-2 bg-white/5 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Red
            </label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full p-2 bg-white/5 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="TRC20">TRON (TRC20)</option>
              <option value="ERC20">Ethereum (ERC20)</option>
              <option value="BEP20">BNB Smart Chain (BEP20)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Monto a Retirar
            </label>
            <input
              required
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full p-2 bg-white/5 border border-white/10 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-5 py-2 rounded-md text-white font-bold bg-cyan-600 hover:bg-cyan-500 transition-colors"
            >
              Solicitar Retiro
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

const BankTransferModal = ({ isOpen, onClose, type, onSubmitted }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={`${type === "deposit" ? "Depositar" : "Retirar"} por Transferencia`}
    maxWidth="max-w-lg"
  >
    <div className="space-y-4 text-neutral-300">
      <p>
        Para continuar, por favor contacta a soporte con los siguientes
        detalles:
      </p>
      <ul className="list-disc list-inside bg-white/5 p-4 rounded-md">
        <li>
          Tipo de operación:{" "}
          <span className="font-semibold text-white">
            {type === "deposit" ? "Depósito" : "Retiro"}
          </span>
        </li>
        <li>Monto deseado</li>
        <li>Comprobante de la transacción (si es un depósito)</li>
      </ul>
      <div className="text-center pt-4">
        <button
          onClick={onSubmitted}
          className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-md text-white font-bold"
        >
          Entendido
        </button>
      </div>
    </div>
  </Modal>
);

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

  const handleOpenPaymentModal = (method, type) => {
    setPaymentModalConfig({ isOpen: true, method, type });
    setIsSideMenuOpen(false);
  };
  const handleClosePaymentModal = () =>
    setPaymentModalConfig({ isOpen: false, type: "", method: "" });

  const handlePaymentSubmitted = () => {
    handleClosePaymentModal();
    setConfirmationModal({
      isOpen: true,
      title: "Solicitud Recibida",
      children:
        "Un asesor se comunicará con usted a la brevedad para completar la operación.",
      onConfirm: () =>
        setConfirmationModal({
          isOpen: false,
          title: "",
          children: null,
          onConfirm: () => {},
        }),
    });
  };

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

  useEffect(() => {
    if (!user || !userAssets.length) return;

    const connectWebSocket = () => {
      const wsUrl = import.meta.env.VITE_WSS_URL;
      if (!wsUrl) {
        console.error("WebSocket URL is not defined.");
        return;
      }
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected. Subscribing to assets.");
        ws.send(JSON.stringify({ type: "subscribe", symbols: userAssets }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "price_update") {
            setRealTimePrices((prev) => ({ ...prev, ...data.prices }));
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
          console.error("Error processing WebSocket message:", error);
        }
      };

      ws.onclose = (e) => {
        console.log(
          "WebSocket disconnected. Attempting to reconnect...",
          e.reason
        );
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket Error:", error);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        console.log("Closing WebSocket connection.");
        wsRef.current.close();
      }
    };
  }, [user, userAssets]); // Only reconnect if user or assets list change

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
      const normalizedSymbol = op.activo.toUpperCase().replace(/[-/]/g, "");
      const currentPrice = realTimePrices[normalizedSymbol];
      if (typeof currentPrice !== "number") return total;
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
      const timer = setTimeout(
        () => setAlert({ message: "", type: "info" }),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handlePageChange = (newPage) => fetchData(newPage, opHistoryFilter);
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
      const normalizedAsset = selectedAsset.toUpperCase().replace(/[-/]/g, "");
      const currentPrice = realTimePrices[normalizedAsset];
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
      const normalizedAsset = selectedAsset.toUpperCase().replace(/[-/]/g, "");
      const livePrice = realTimePrices[normalizedAsset];
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
      let upperSymbol = symbol.toUpperCase().trim();
      if (upperSymbol.endsWith("USDT") && !upperSymbol.includes("-")) {
        upperSymbol = `${upperSymbol.slice(0, -4)}-USDT`;
      }

      if (upperSymbol && !userAssets.includes(upperSymbol)) {
        const newAssets = [...userAssets, upperSymbol];
        setUserAssets(newAssets);
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
      const newAssets = userAssets.filter((a) => a !== symbol);
      setUserAssets(newAssets);
      if (selectedAsset === symbol) {
        setSelectedAsset(newAssets.length > 0 ? newAssets[0] : "BTC-USDT");
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
      const normalizedSymbol = op.activo.toUpperCase().replace(/[-/]/g, "");
      const currentPrice = realTimePrices[normalizedSymbol];
      const profit = op.cerrada
        ? parseFloat(op.ganancia || 0)
        : typeof currentPrice === "number"
        ? op.tipo_operacion.toLowerCase() === "sell"
          ? (op.precio_entrada - currentPrice) * op.volumen
          : (currentPrice - op.precio_entrada) * op.volumen
        : 0;
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

  const platformLogo =
    import.meta.env.VITE_PLATFORM_LOGO || "/bulltrading-logo.png";

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
        onSelectPaymentMethod={handleOpenPaymentModal}
      />
      {paymentModalConfig.method === "crypto" && (
        <CryptoPaymentModal
          isOpen={paymentModalConfig.isOpen}
          onClose={handleClosePaymentModal}
          type={paymentModalConfig.type}
          onSubmitted={handlePaymentSubmitted}
        />
      )}
      {paymentModalConfig.method === "bank" && (
        <BankTransferModal
          isOpen={paymentModalConfig.isOpen}
          onClose={handleClosePaymentModal}
          type={paymentModalConfig.type}
          onSubmitted={handlePaymentSubmitted}
        />
      )}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
      >
        {confirmationModal.children}
      </ConfirmationModal>

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
              className="fixed top-0 left-0 h-full w-72 bg-neutral-900 p-4 overflow-y-auto flex-shrink-0 border-r border-white/10 flex flex-col z-40 lg:hidden"
            >
              <div className="flex-grow">
                <img
                  className="mb-4"
                  src={platformLogo}
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
      <aside className="hidden lg:flex lg:flex-col w-72 bg-black/30 p-4 overflow-y-auto flex-shrink-0 border-r border-white/10">
        <div className="flex-grow">
          <img className="mb-4" src={platformLogo} width="220" alt="Logo" />
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

      <main className="flex-1 flex flex-col bg-transparent overflow-hidden">
        <Header
          onOperation={handleOpenNewOpModal}
          onManageUsers={() => setIsUsersModalOpen(true)}
          onManageRegCode={() => setIsRegCodeModalOpen(true)}
          onToggleSideMenu={() => setIsSideMenuOpen(true)}
          onToggleMainSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        />
        <div className="flex-1 flex flex-col p-2 sm:p-4 gap-4 overflow-y-auto pb-24 sm:pb-4">
          <div className="flex-grow min-h-[300px] sm:min-h-[400px] bg-black/20 rounded-xl shadow-2xl border border-white/10">
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
              setAlert={setAlert}
            />
          </div>
        </div>
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-3 border-t border-white/10 flex justify-around items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenNewOpModal("sell", mobileVolume)}
            className="flex-1 bg-red-600 hover:bg-red-500 transition-all text-white px-4 py-3 text-sm font-bold rounded-md"
          >
            SELL
          </motion.button>
          <input
            type="number"
            value={mobileVolume}
            onChange={(e) => setMobileVolume(parseFloat(e.target.value) || 0)}
            step="0.01"
            min="0.01"
            className="w-24 p-3 border border-white/10 bg-white/5 rounded-md text-white text-center text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenNewOpModal("buy", mobileVolume)}
            className="flex-1 bg-green-600 hover:bg-green-500 transition-all text-white px-4 py-3 text-sm font-bold rounded-md"
          >
            BUY
          </motion.button>
        </div>
      </main>
    </div>
  );
};

// --- NUEVO LOGIN/REGISTER DINÁMICO ---
const LoginPage = () => {
  const { setUser, setIsAuthenticated } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+57");

  const countryCodes = useMemo(
    () => [
      { name: "Colombia", code: "+57" },
      { name: "United States", code: "+1" },
      { name: "Spain", code: "+34" },
      { name: "Mexico", code: "+52" },
      { name: "Argentina", code: "+54" },
      { name: "Peru", code: "+51" },
      { name: "Chile", code: "+56" },
    ],
    []
  );

  const handleAuth = async (e, action) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const platform_id = import.meta.env.VITE_PLATFORM_ID || "default_platform";

    if (action === "login") {
      try {
        const { data } = await axios.post("/login", {
          email: loginEmail,
          password: loginPassword,
          platform_id,
        });
        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setError(data.error || "Credenciales inválidas");
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            "Ocurrió un error en el inicio de sesión."
        );
      }
    } else {
      // register
      try {
        const payload = {
          nombre: regName,
          email: regEmail,
          password: regPassword,
          telefono: `${countryCode}${regPhone}`,
          platform_id,
        };
        const { data } = await axios.post("/register", payload);
        if (data.success) {
          setSuccess("Registro exitoso. Por favor, inicie sesión.");
          setIsLogin(true);
        } else {
          setError(data.error || "Error en el registro");
        }
      } catch (err) {
        setError(
          err.response?.data?.error || "Ocurrió un error en el registro."
        );
      }
    }
  };

  const platformLogo =
    import.meta.env.VITE_PLATFORM_LOGO || "/bulltrading-logo.png";
  const formVariants = {
    hidden: { opacity: 0, x: 300 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
    exit: { opacity: 0, x: -300, transition: { ease: "easeInOut" } },
  };

  return (
    <div
      className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop')",
      }}
    >
      <div className="relative w-full max-w-4xl min-h-[600px] bg-black/50 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Panel de Bienvenida */}
        <div className="w-full md:w-1/2 text-white p-8 sm:p-12 flex flex-col justify-center items-center text-center bg-gradient-to-br from-cyan-600 to-cyan-800">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <img
              src={platformLogo}
              alt="Logo"
              className="w-40 sm:w-48 mx-auto mb-4"
            />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {isLogin ? "¡Bienvenido de Nuevo!" : "Crea tu Cuenta"}
            </h1>
            <p className="mb-6 text-sm sm:text-base">
              {isLogin
                ? "Para seguir conectado, por favor inicia sesión con tu información personal."
                : "Ingresa tus datos para comenzar tu viaje con nosotros."}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
              }}
              className="bg-white/20 hover:bg-white/30 font-bold py-2 px-6 rounded-full transition-all"
            >
              {isLogin ? "Registrarse" : "Iniciar Sesión"}
            </button>
          </motion.div>
        </div>

        {/* Panel de Formularios */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
                  Iniciar Sesión
                </h2>
                {error && (
                  <p className="text-red-400 text-center text-sm mb-4">
                    {error}
                  </p>
                )}
                <form
                  onSubmit={(e) => handleAuth(e, "login")}
                  className="space-y-4"
                >
                  <input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full p-3 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full p-3 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="submit"
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
                  >
                    Entrar
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center">
                  Crear Cuenta
                </h2>
                {error && (
                  <p className="text-red-400 text-center text-sm mb-2">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="text-green-400 text-center text-sm mb-2">
                    {success}
                  </p>
                )}
                <form
                  onSubmit={(e) => handleAuth(e, "register")}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    placeholder="Nombre Completo"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full p-2 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full p-2 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="p-2 bg-white/5 text-white rounded-l-lg border-r-0 border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder="Teléfono"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full p-2 bg-white/5 text-white rounded-r-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full p-2 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="submit"
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
                  >
                    Crear Cuenta
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const { isAppLoading, isAuthenticated } = useContext(AppContext);
  const platformLogo =
    import.meta.env.VITE_PLATFORM_LOGO || "/bulltrading-logo.png";

  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl font-bold animate-pulse">
          <img src={platformLogo} width="220" alt="Cargando..." />
        </div>
      </div>
    );
  }
  return isAuthenticated ? <DashboardPage /> : <LoginPage />;
};

export default function Root() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
