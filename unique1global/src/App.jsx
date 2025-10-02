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
  ShieldCheck: ({ className }) => (
    <Icon
      path="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm-1.12 8.149a.75.75 0 1 0-1.06 1.06l2.12 2.12a.75.75 0 0 0 1.06 0l4.243-4.242a.75.75 0 0 0-1.06-1.06l-3.713 3.713-1.59-1.59Z"
      className={className}
    />
  ),
  Adjustments: ({ className }) => (
    <Icon
      path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM12 15a3 3 0 100-6 3 3 0 000 6z"
      className={className}
    />
  ),
  ArrowRight: ({ className }) => (
    <Icon path="M17 8l4 4m0 0l-4 4m4-4H3" className={className} />
  ),
  CurrencyDollar: ({ className }) => (
    <Icon
      path="M12 6v12M12 6c-2.828 0-4.5 1.172-4.5 4.5S9.172 15 12 15s4.5-1.172 4.5-4.5S14.828 6 12 6ZM12 6c2.828 0 4.5 1.172 4.5 4.5S14.828 15 12 15s-4.5-1.172-4.5-4.5S9.172 6 12 6Z"
      className={className}
    />
  ),
};

// --- Catálogo de Activos ---
// Este catálogo es la fuente principal de activos para la UI.
const ASSET_CATALOG = [
  // Forex
  { symbol: "EUR/USD", name: "Euro / Dólar Estadounidense" },
  { symbol: "GBP/USD", name: "Libra Esterlina / Dólar Estadounidense" },
  { symbol: "EUR/JPY", name: "Euro / Yen Japonés" },
  { symbol: "USD/JPY", name: "Dólar Estadounidense / Yen Japonés" },
  { symbol: "AUD/USD", name: "Dólar Australiano / Dólar Estadounidense" },
  { symbol: "USD/CHF", name: "Dólar Estadounidense / Franco Suizo" },
  { symbol: "GBP/JPY", name: "Libra Esterlina / Yen Japonés" },
  { symbol: "USD/CAD", name: "Dólar Estadounidense / Dólar Canadiense" },
  { symbol: "EUR/GBP", name: "Euro / Libra Esterlina" },
  { symbol: "EUR/CHF", name: "Euro / Franco Suizo" },
  { symbol: "AUD/JPY", name: "Dólar Australiano / Yen Japonés" },
  { symbol: "NZD/USD", name: "Dólar Neozelandés / Dólar Estadounidense" },
  { symbol: "CHF/JPY", name: "Franco Suizo / Yen Japonés" },
  { symbol: "EUR/AUD", name: "Euro / Dólar Australiano" },
  { symbol: "CAD/JPY", name: "Dólar Canadiense / Yen Japonés" },
  { symbol: "GBP/AUD", name: "Libra Esterlina / Dólar Australiano" },
  { symbol: "EUR/CAD", name: "Euro / Dólar Canadiense" },
  { symbol: "AUD/CAD", name: "Dólar Australiano / Dólar Canadiense" },
  { symbol: "GBP/CAD", name: "Libra Esterlina / Dólar Canadiense" },
  { symbol: "AUD/NZD", name: "Dólar Australiano / Dólar Neozelandés" },
  { symbol: "NZD/JPY", name: "Dólar Neozelandés / Yen Japonés" },
  { symbol: "AUD/CHF", name: "Dólar Australiano / Franco Suizo" },
  { symbol: "USD/MXN", name: "Dólar Estadounidense / Peso Mexicano" },
  { symbol: "GBP/NZD", name: "Libra Esterlina / Dólar Neozelandés" },
  { symbol: "EUR/NZD", name: "Euro / Dólar Neozelandés" },
  { symbol: "CAD/CHF", name: "Dólar Canadiense / Franco Suizo" },
  { symbol: "NZD/CAD", name: "Dólar Neozelandés / Dólar Canadiense" },
  { symbol: "NZD/CHF", name: "Dólar Neozelandés / Franco Suizo" },
  { symbol: "GBP/CHF", name: "Libra Esterlina / Franco Suizo" },
  { symbol: "USD/BRL", name: "Dólar Estadounidense / Real Brasileño" },

  // Commodities
  { symbol: "XAU/USD", name: "Oro (Gold)" },
  { symbol: "XAG/USD", name: "Plata (Silver)" },
  { symbol: "WTI/USD", name: "Petróleo Crudo WTI" },
  { symbol: "BRENT/USD", name: "Petróleo Crudo Brent" }, // Normalizado de BRN/USD
  { symbol: "XCU/USD", name: "Cobre (Copper)" },
  { symbol: "NG/USD", name: "Gas Natural" }, // Normalizado de NGC/USD

  // Criptomonedas (normalizadas a -USDT para compatibilidad con el feed)
  { symbol: "BTC-USDT", name: "Bitcoin" },
  { symbol: "ETH-USDT", name: "Ethereum" },
  { symbol: "LTC-USDT", name: "Litecoin" },
  { symbol: "XRP-USDT", name: "Ripple" },
  { symbol: "BNB-USDT", name: "BNB" },
  { symbol: "TRX-USDT", name: "TRON" },
  { symbol: "ADA-USDT", name: "Cardano" },
  { symbol: "DOGE-USDT", name: "Dogecoin" },
  { symbol: "SOL-USDT", name: "Solana" },
  { symbol: "DOT-USDT", name: "Polkadot" },
  { symbol: "LINK-USDT", name: "Chainlink" },
  { symbol: "MATIC-USDT", name: "Polygon (MATIC)" }, // Normalizado de POL/USD
  { symbol: "AVAX-USDT", name: "Avalanche" },
  { symbol: "PEPE-USDT", name: "Pepe" },
  { symbol: "SUI-USDT", name: "Sui" },
  { symbol: "TON-USDT", name: "Toncoin" },

  // Indices
  { symbol: "DAX", name: "DAX 40 (Alemania)" },
  { symbol: "FCHI", name: "CAC 40 (Francia)" },
  { symbol: "FTSE", name: "FTSE 100 (Reino Unido)" },
  { symbol: "SX5E", name: "EURO STOXX 50" },
  { symbol: "IBEX", name: "IBEX 35 (España)" },
  { symbol: "DJI", name: "Dow Jones Industrial Average" },
  { symbol: "SPX", name: "S&P 500" },
  { symbol: "NDX", name: "Nasdaq 100" },
  { symbol: "NI225", name: "Nikkei 225" },

  // Acciones
  { symbol: "META", name: "Meta Platforms, Inc." },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "KO", name: "The Coca-Cola Company" },
  { symbol: "MA", name: "Mastercard Incorporated" },
  { symbol: "IBM", name: "IBM" },
  { symbol: "DIS", name: "The Walt Disney Company" },
  { symbol: "CVX", name: "Chevron Corporation" },
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "AMZN", name: "Amazon.com, Inc." },
  { symbol: "BA", name: "The Boeing Company" },
  { symbol: "BAC", name: "Bank of America Corp" },
  { symbol: "CSCO", name: "Cisco Systems, Inc." },
  { symbol: "MCD", name: "McDonald's Corporation" },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "WMT", name: "Walmart Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "NFLX", name: "Netflix, Inc." },
  { symbol: "NKE", name: "NIKE, Inc." }, // Normalizado de NIKE
  { symbol: "ORCL", name: "Oracle Corporation" },
  { symbol: "PG", name: "Procter & Gamble Company" },
  { symbol: "T", name: "AT&T Inc." },
  { symbol: "TSLA", name: "Tesla, Inc." },
];

const POPULAR_ASSETS = [
  ASSET_CATALOG.find((a) => a.symbol === "BTC-USDT"),
  ASSET_CATALOG.find((a) => a.symbol === "EUR/USD"),
  ASSET_CATALOG.find((a) => a.symbol === "XAU/USD"),
  ASSET_CATALOG.find((a) => a.symbol === "AAPL"),
  ASSET_CATALOG.find((a) => a.symbol === "TSLA"),
  ASSET_CATALOG.find((a) => a.symbol === "NVDA"),
].filter(Boolean); // Filter out any potential undefined if symbols change

// --- Contexto de la App ---
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [realTimePrices, setRealTimePrices] = useState({});
  const [selectedAsset, setSelectedAsset] = useState("BTC-USDT");
  // NUEVO: Estado para las comisiones y spreads
  const [commissions, setCommissions] = useState({
    spreadPercentage: 0.01,
    commissionPercentage: 0.1,
  });

  const checkUser = useCallback(async () => {
    setIsAppLoading(true);
    try {
      const { data } = await axios.get("/me");
      setUser(data);
      setIsAuthenticated(true);

      // Intentar cargar comisiones si es administrador o usuario regular
      if (data) {
        try {
          const commRes = await axios.get("/commissions");
          setCommissions(commRes.data);
        } catch (e) {
          console.warn("Failed to fetch commissions, using defaults.");
        }
      }
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
      commissions, // Exponer comisiones
      setCommissions, // Exponer setCommissions
    }),
    [
      user,
      isAuthenticated,
      isAppLoading,
      logout,
      realTimePrices,
      selectedAsset,
      checkUser,
      commissions,
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
        currentValue > prevValue ? "text-green-500" : "text-red-500"
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
    <button
      onClick={onDismiss}
      className="ml-4 text-white/70 hover:text-white cursor-pointer"
    >
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
    className={`bg-white p-4 rounded-xl border border-gray-200 shadow-md ${className}`}
    {...props}
  >
    {children}
  </motion.div>
));

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
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
        "USDMXN",
        "USDBRL",
      ];
      if (forexPairs.includes(sanitizedSymbol)) {
        return `OANDA:${sanitizedSymbol}`;
      }
    }
    // Mapeo de índices a sus símbolos en TradingView
    const indicesMap = {
      DAX: "DEU40",
      FCHI: "FRA40",
      FTSE: "UK100",
      SX5E: "STOXX50",
      IBEX: "ESP35",
      DJI: "US30",
      SPX: "SPX500",
      NDX: "NAS100",
      NI225: "JPN225",
    };
    if (indicesMap[s]) return `OANDA:${indicesMap[s]}`;

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
        theme: "light",
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
        className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors text-xs"
      >
        Anterior
      </button>
      <span className="text-gray-500 text-xs">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors text-xs"
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
          backgroundColor: "rgba(65, 0, 147, 0.2)",
          borderColor: "#410093",
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
      <h3 className="text-gray-900 font-bold text-base mb-4">Rendimiento</h3>
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
      <h3 className="text-gray-900 font-bold text-base mb-4">Estadísticas</h3>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-5" /> <Skeleton className="h-5" />
          <Skeleton className="h-5" /> <Skeleton className="h-5" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 text-gray-600 text-sm">
          <div>
            Total Invertido:{" "}
            <span className="font-semibold text-gray-900">
              ${parseFloat(stats.total_invertido || 0).toFixed(2)}
            </span>
          </div>
          <div>
            Ganancia Total:{" "}
            <span className="font-semibold text-green-600">
              ${parseFloat(stats.ganancia_total || 0).toFixed(2)}
            </span>
          </div>
          <div>
            Abiertas:{" "}
            <span className="font-semibold text-gray-900">
              {stats.abiertas || 0}
            </span>
          </div>
          <div>
            Cerradas:{" "}
            <span className="font-semibold text-gray-900">
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
  const baseColor = price ? "text-gray-800" : "text-gray-400";
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
        ? "bg-purple-100 text-purple-800"
        : "hover:bg-gray-100 text-gray-700"
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
        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        title={`Eliminar ${symbol}`}
      >
        <Icons.X className="h-4 w-4" />
      </button>
    </div>
  </motion.li>
));

const AssetLists = React.memo(({ assets, onAddAsset, onRemoveAsset }) => {
  const { setSelectedAsset, selectedAsset } = useContext(AppContext);
  const [inputValue, setInputValue] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSuggestionVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFocus = () => {
    if (!inputValue) {
      setRecommendations(POPULAR_ASSETS);
    }
    setIsSuggestionVisible(true);
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setInputValue(value);
    if (value) {
      const filtered = ASSET_CATALOG.filter(
        (asset) =>
          asset.symbol.toUpperCase().includes(value) ||
          asset.name.toUpperCase().includes(value)
      );
      setRecommendations(filtered);
    } else {
      setRecommendations(POPULAR_ASSETS);
    }
  };

  const handleRecommendationClick = (symbol) => {
    setInputValue(symbol);
    setIsSuggestionVisible(false);
  };

  const handleAssetClick = useCallback(
    (symbol) => {
      setSelectedAsset(symbol);
    },
    [setSelectedAsset]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue) {
      onAddAsset(inputValue);
      setInputValue("");
      setIsSuggestionVisible(false);
    }
  };

  return (
    <div className="mb-6">
      <div ref={searchContainerRef} className="relative">
        <form onSubmit={handleSubmit} className="mb-1 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder="Ej: Amazon, AMZN"
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900"
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded transition-colors flex-shrink-0 cursor-pointer"
            style={{ backgroundColor: "#410093" }}
          >
            <Icons.Plus />
          </button>
        </form>
        {isSuggestionVisible && recommendations.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute w-full bg-white border border-gray-200 rounded-md mt-1 max-h-48 overflow-y-auto z-20 shadow-lg"
          >
            {recommendations.map((rec) => (
              <li
                key={rec.symbol}
                onClick={() => handleRecommendationClick(rec.symbol)}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-purple-500 hover:text-white cursor-pointer flex justify-between items-center"
              >
                <div>
                  <span className="font-semibold">{rec.symbol}</span>
                  <span className="ml-2 text-gray-500 text-xs">{rec.name}</span>
                </div>
                <AssetPrice symbol={rec.symbol} />
              </li>
            ))}
          </motion.ul>
        )}
      </div>
      <h2 className="text-gray-500 font-bold text-sm tracking-wider uppercase mt-4 mb-3 px-2">
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
    className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
  >
    {icon}
    <span className="ml-3">{text}</span>
  </button>
);

const ProfileMenu = React.memo(
  ({
    user,
    logout,
    onToggleSideMenu,
    onManageUsers,
    onManageLeverage,
    onManageCommissions, // NUEVA prop
    onOpenProfileModal,
  }) => {
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
          className="bg-gray-100 cursor-pointer text-gray-600 p-2 rounded-full hover:bg-purple-500 hover:text-white transition-colors"
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
              className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-white ring-1 ring-gray-200 focus:outline-none z-50 p-2 border border-gray-200"
            >
              <div className="px-3 py-2 border-b border-gray-200 mb-2">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.nombre || "Usuario"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "email@example.com"}
                </p>
              </div>
              <div className="space-y-1">
                <MenuItem
                  icon={<Icons.UserCircle className="h-5 w-5 text-gray-500" />}
                  text="Ver Perfil"
                  onClick={() => handleItemClick(onOpenProfileModal)}
                />
                <MenuItem
                  icon={<Icons.UserCircle className="h-5 w-5 text-gray-500" />}
                  text="Gestionar Cuenta"
                  onClick={() => handleItemClick(onToggleSideMenu)}
                />
                {user?.rol === "admin" && (
                  <>
                    <MenuItem
                      icon={
                        <Icons.UserGroup className="h-5 w-5 text-gray-500" />
                      }
                      text="Gestionar Usuarios"
                      onClick={() => handleItemClick(onManageUsers)}
                    />
                    <MenuItem
                      icon={
                        <Icons.Adjustments className="h-5 w-5 text-gray-500" />
                      }
                      text="Gestionar Apalancamiento"
                      onClick={() => handleItemClick(onManageLeverage)}
                    />
                    {/* NUEVO ITEM DE MENÚ PARA COMISIONES */}
                    <MenuItem
                      icon={
                        <Icons.CurrencyDollar className="h-5 w-5 text-gray-500" />
                      }
                      text="Gestionar Comisiones"
                      onClick={() => handleItemClick(onManageCommissions)}
                    />
                  </>
                )}
                <div className="my-1 h-px bg-gray-200" />
                <MenuItem
                  icon={
                    <Icons.Logout className="h-5 w-5 cursor-pointer text-purple-500" />
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
  onManageLeverage,
  onManageCommissions, // NUEVA prop
  onToggleSideMenu,
  onToggleMainSidebar,
  onOpenProfileModal,
}) => {
  const { user, logout, selectedAsset } = useContext(AppContext);
  const [volume, setVolume] = useState(0.01);

  return (
    <header className="flex justify-between items-center px-4 sm:px-6 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMainSidebar}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 lg:hidden"
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
            className="w-24 p-2 border border-gray-300 bg-gray-50 rounded-md text-gray-900 text-center text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onOperation("buy", volume)}
            className="bg-green-600 hover:bg-green-500 transition-all text-white px-5 py-2 text-sm font-bold rounded-md shadow-lg shadow-green-500/20 hover:shadow-green-500/40 cursor-pointer"
            style={{ backgroundColor: "#410093" }}
          >
            BUY
          </motion.button>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-xl sm:text-3xl font-bold text-gray-900">
          {selectedAsset}
        </h2>
        <p className="text-xs text-gray-500 hidden sm:block">
          Activo para operar
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <ProfileMenu
          user={user}
          logout={logout}
          onToggleSideMenu={onToggleSideMenu}
          onManageUsers={onManageUsers}
          onManageLeverage={onManageLeverage}
          onManageCommissions={onManageCommissions} // Pasar prop
          onOpenProfileModal={onOpenProfileModal}
        />
      </div>
    </header>
  );
};

const FlashingMetric = ({ value, prefix = "", suffix = "" }) => {
  const flashClass = useFlashOnUpdate(value);
  const baseColor = "text-gray-900";
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
          <p className="text-gray-500">Balance</p>
          <span className="font-bold text-gray-900">${metrics.balance}</span>
        </div>
        <div className="text-center p-2 w-full">
          <p className="text-gray-500">Equidad</p>
          <FlashingMetric value={metrics.equity} prefix="$" />
        </div>
        <div className="text-center p-2 w-full">
          <p className="text-gray-500">M. Usado</p>
          <FlashingMetric value={metrics.usedMargin} prefix="$" />
        </div>
        <div className="text-center p-2 w-full">
          <p className="text-gray-500">M. Libre</p>
          <FlashingMetric value={metrics.freeMargin} prefix="$" />
        </div>
        <div className="text-center p-2 w-full col-span-2 sm:col-span-1 md:col-span-1">
          <p className="text-gray-500">Nivel Margen</p>
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
  const profitColor = profit >= 0 ? "text-green-600" : "text-red-600";
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
    "Apalanc.",
    "Margen",
    "G-P",
    "Acción",
  ];
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }),
  };

  const renderMobileCard = (op, index) => (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card
        key={op.id}
        className="text-sm cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => onRowClick(op)}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-lg text-gray-900">{op.activo}</span>
          <span
            className={`px-2 py-1 rounded-md text-xs font-bold ${
              op.tipo_operacion.toLowerCase().includes("buy")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {op.tipo_operacion}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-gray-700 mb-4">
          <div>
            <span className="font-semibold text-gray-500">Vol:</span>{" "}
            {op.volumen}
          </div>
          <div>
            <span className="font-semibold text-gray-500">Apalanc:</span> 1:
            {op.apalancamiento || 1}
          </div>
          <div>
            <span className="font-semibold text-gray-500">Entrada:</span>{" "}
            {parseFloat(op.precio_entrada).toFixed(4)}
          </div>
          <div>
            <span className="font-semibold text-gray-500">TP:</span>{" "}
            {op.take_profit ? parseFloat(op.take_profit).toFixed(2) : "-"}
          </div>
          <div>
            <span className="font-semibold text-gray-500">SL:</span>{" "}
            {op.stop_loss ? parseFloat(op.stop_loss).toFixed(2) : "-"}
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <div className="text-gray-500">
            G/P: <LiveProfitCell operation={op} />
          </div>
          {op.cerrada ? (
            <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs">
              Cerrado
            </span>
          ) : (
            <button
              onClick={(e) => handleCloseOperation(e, op.id)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-md text-xs transition-colors cursor-pointer"
              style={{ backgroundColor: "#410093" }}
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
      <div className="p-3 bg-gray-50 flex justify-between items-center flex-shrink-0">
        <h3 className="text-base font-bold text-gray-900">
          Historial de Operaciones
        </h3>
        <div className="flex items-center">
          <label htmlFor="filter" className="text-sm text-gray-500 mr-2">
            Filtrar:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white text-gray-800 text-sm rounded-md p-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="todas">Todas</option>
            <option value="abiertas">Abiertas</option>
            <option value="cerradas">Cerradas</option>
          </select>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        <table className="hidden sm:table w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs uppercase sticky top-0 z-10">
            <tr>
              {columns.map((h) => (
                <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
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
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onRowClick(op)}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(op.fecha).toLocaleString()}
                    </td>
                    <td
                      className={`px-3 py-2 font-bold whitespace-nowrap ${
                        op.tipo_operacion.toLowerCase().includes("buy")
                          ? "text-green-600"
                          : "text-red-600"
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
                      1:{op.apalancamiento || 1}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      ${parseFloat(op.capital_invertido || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <LiveProfitCell operation={op} />
                    </td>
                    <td className="px-3 py-2">
                      {op.cerrada ? (
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs">
                          Cerrado
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleCloseOperation(e, op.id)}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded-md text-xs w-full transition-colors cursor-pointer"
                          style={{ backgroundColor: "#410093" }}
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
      <div className="p-2 border-t border-gray-200">
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
        className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm p-4 cursor-pointer"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} text-gray-900 border border-gray-200 flex flex-col max-h-[90vh]`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-shrink-0 flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-800 cursor-pointer"
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
  const baseColor = price ? "text-gray-900" : "text-yellow-500";
  const finalColorClass = flashClass || baseColor;
  return (
    <span
      className={`font-mono transition-colors duration-300 ${finalColorClass}`}
    >
      ${price ? price.toFixed(4) : "Cargando..."}
    </span>
  );
});

// Helper para calcular la comisión de forma local para el modal
const calculateCommissionCost = (
  price,
  volume,
  commissionPercentage,
  leverage
) => {
  if (!price || !volume || !commissionPercentage) return 0;
  // Margen requerido: (price * volume) / leverage -- Se mantiene en el backend

  // Comisión: Volumen Nocional * Porcentaje de Comisión
  const volumenNocional = price * volume;
  const commissionCost = volumenNocional * (commissionPercentage / 100);
  return commissionCost;
};

const NewOperationModal = ({ isOpen, onClose, operationData, onConfirm }) => {
  const { type, asset, volume } = operationData || {};
  const { realTimePrices, commissions } = useContext(AppContext);
  const normalizedAsset = asset?.toUpperCase().replace(/[-/]/g, "");
  const livePrice = realTimePrices[normalizedAsset];

  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [leverage, setLeverage] = useState(1);
  const [leverageOptions, setLeverageOptions] = useState([1]);

  useEffect(() => {
    // Cargar opciones de apalancamiento permitidas desde el backend
    if (isOpen) {
      axios
        .get("/leverage-options")
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setLeverageOptions(res.data);
            // Asegurarse que el apalancamiento seleccionado sea válido
            if (!res.data.includes(leverage)) {
              setLeverage(res.data[0]);
            }
          }
        })
        .catch((err) => console.error("Error fetching leverage options:", err));
    }
  }, [isOpen]);

  const commissionCost = useMemo(() => {
    if (!livePrice || !volume || !commissions) return 0;
    return calculateCommissionCost(
      livePrice,
      volume,
      commissions.commissionPercentage,
      leverage
    );
  }, [livePrice, volume, commissions, leverage]);

  const requiredMargin = livePrice
    ? ((livePrice * volume) / leverage).toFixed(2)
    : "0.00";

  useEffect(() => {
    if (!isOpen) {
      setTp("");
      setSl("");
      setLeverage(1);
    }
  }, [isOpen]);

  const calculatePotentialProfit = (value, targetType) => {
    if (!value || !livePrice || !volume) return null;
    const targetPrice = parseFloat(value);
    if (isNaN(targetPrice)) return null;

    if (targetType === "tp") {
      // Nota: El cálculo real en el backend usa el precio de entrada ajustado por spread.
      // Aquí usamos el livePrice para una estimación.
      return type === "buy"
        ? (targetPrice - livePrice) * volume - commissionCost // Restamos comisión para estimación
        : (livePrice - targetPrice) * volume - commissionCost;
    }
    if (targetType === "sl") {
      return type === "buy"
        ? (targetPrice - livePrice) * volume - commissionCost // Restamos comisión para estimación
        : (livePrice - targetPrice) * volume - commissionCost;
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
      apalancamiento: leverage,
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
      <div className="space-y-3 mb-4 text-gray-700">
        <p className="flex justify-between">
          <span>Precio Actual:</span>
          <ModalLivePrice symbol={asset} />
        </p>
        <p className="flex justify-between">
          <span>Volumen:</span>
          <span className="font-mono text-gray-900">{volume}</span>
        </p>
        <div className="py-2 border-t border-gray-200">
          <p className="flex justify-between">
            <span>Margen Requerido:</span>
            <span className="font-mono text-gray-900">${requiredMargin}</span>
          </p>
          <p className="flex justify-between text-red-600 font-semibold">
            <span>
              Comisión de Apertura ({commissions.commissionPercentage}%):
            </span>
            <span className="font-mono">${commissionCost.toFixed(2)}</span>
          </p>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Seleccionar Apalancamiento
        </label>
        <select
          value={leverage}
          onChange={(e) => setLeverage(parseInt(e.target.value))}
          className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {leverageOptions.map((opt) => (
            <option key={opt} value={opt}>
              1:{opt}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Take Profit (opcional):
        </label>
        <input
          type="number"
          value={tp}
          onChange={(e) => setTp(e.target.value)}
          placeholder="Precio de cierre para tomar ganancias"
          className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {potentialTpProfit !== null && (
          <p className="text-xs mt-1 text-green-600">
            Ganancia Potencial Estimada: ${potentialTpProfit.toFixed(2)}
          </p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Stop Loss (opcional):
        </label>
        <input
          type="number"
          value={sl}
          onChange={(e) => setSl(e.target.value)}
          placeholder="Precio de cierre para limitar pérdidas"
          className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        {potentialSlProfit !== null && (
          <p className="text-xs mt-1 text-red-500">
            Pérdida Potencial Estimada: ${potentialSlProfit.toFixed(2)}
          </p>
        )}
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={handleConfirm}
          disabled={!livePrice}
          className={`px-5 py-2 rounded-md text-white font-bold transition-colors cursor-pointer ${
            !livePrice
              ? "bg-gray-400 cursor-not-allowed"
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
      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Activo:</span>
          <span className="font-semibold text-gray-900">
            {operation.activo}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tipo:</span>
          <span
            className={`font-bold ${
              operation.tipo_operacion.toLowerCase().includes("buy")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {operation.tipo_operacion}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Volumen:</span>
          <span className="font-mono text-gray-900">{operation.volumen}</span>
        </div>
        <div className="flex justify-between">
          <span>Apalancamiento:</span>
          <span className="font-semibold text-gray-900">
            1:{operation.apalancamiento || 1}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Precio de Entrada:</span>
          <span className="font-mono text-gray-900">
            ${parseFloat(operation.precio_entrada).toFixed(4)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Fecha de Apertura:</span>
          <span className="text-gray-900">
            {new Date(operation.fecha).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Estado:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              operation.cerrada
                ? "bg-gray-200 text-gray-800"
                : "bg-blue-500 text-white"
            }`}
          >
            {operation.cerrada ? "Cerrada" : "Abierta"}
          </span>
        </div>
        {operation.cerrada && (
          <div className="flex justify-between">
            <span>Precio de Cierre:</span>
            <span className="font-mono text-gray-900">
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
              profit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {profit.toFixed(2)} USD
          </span>
        </div>
      </div>
    )}
  </Modal>
);

const UserOperationsModal = ({
  isOpen,
  onClose,
  user,
  onUpdateOperation,
  setAlert,
}) => {
  const [operations, setOperations] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [showAll, setShowAll] = useState(false);

  const calculateProfit = (op) => {
    if (!op.cerrada || !op.precio_cierre) return 0;
    const { tipo_operacion, precio_cierre, precio_entrada, volumen } = op;
    if (tipo_operacion.toLowerCase().includes("buy")) {
      return (precio_cierre - precio_entrada) * volumen;
    } else {
      return (precio_entrada - precio_cierre) * volumen;
    }
  };

  const fetchUserOperations = useCallback(
    (page = 1) => {
      if (!isOpen || !user) return;

      const endpoint = showAll
        ? `/admin-operaciones/${user.id}/all`
        : `/admin-operaciones/${user.id}?page=${page}&limit=10`;

      axios
        .get(endpoint)
        .then((res) => {
          setOperations(
            res.data.operaciones.map((op) => ({
              ...op,
              ganancia: calculateProfit(op),
            }))
          );
          if (!showAll) {
            setPagination({
              currentPage: res.data.currentPage,
              totalPages: res.data.totalPages,
            });
          }
        })
        .catch((err) => console.error("Error fetching user operations:", err));
    },
    [isOpen, user, showAll]
  );

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setShowAll(false);
      fetchUserOperations(1);
    }
  }, [isOpen, user]); // Depend only on isOpen and user to reset

  useEffect(() => {
    // This effect runs when showAll changes
    fetchUserOperations(1);
  }, [showAll]);

  const handleInputChange = (opId, field, value) => {
    setOperations((currentOps) =>
      currentOps.map((op) => {
        if (op.id === opId) {
          const updatedOp = { ...op, [field]: value };
          if (
            [
              "precio_entrada",
              "precio_cierre",
              "volumen",
              "tipo_operacion",
              "cerrada",
            ].includes(field)
          ) {
            updatedOp.ganancia = calculateProfit(updatedOp);
          }
          return updatedOp;
        }
        return op;
      })
    );
  };

  const handleSave = async (operationData) => {
    try {
      await onUpdateOperation(operationData);
      setAlert({ message: "Operación actualizada con éxito", type: "success" });
    } catch (error) {
      setAlert({ message: "Error al actualizar la operación", type: "error" });
    }
  };

  const handlePageChange = (newPage) => {
    if (!showAll) {
      fetchUserOperations(newPage);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Operaciones de ${user?.nombre}`}
      maxWidth="max-w-7xl"
    >
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-500 cursor-pointer"
        >
          {showAll ? "Ver con Paginación" : "Ver Todas las Operaciones"}
        </button>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-200 text-gray-600 sticky top-0">
            <tr>
              {[
                "ID",
                "Activo",
                "Tipo",
                "Volumen",
                "P. Entrada",
                "P. Cierre",
                "TP",
                "SL",
                "Apalanc.",
                "Estado",
                "G/P",
                "Acción",
              ].map((h) => (
                <th key={h} className="p-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {operations.map((op) => (
              <tr key={op.id} className="border-b border-gray-200">
                <td className="p-1">{op.id}</td>
                <td className="p-1">
                  <input
                    type="text"
                    value={op.activo}
                    onChange={(e) =>
                      handleInputChange(op.id, "activo", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  />
                </td>
                <td className="p-1">
                  <select
                    value={op.tipo_operacion}
                    onChange={(e) =>
                      handleInputChange(op.id, "tipo_operacion", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  >
                    <option value="buy">buy</option>
                    <option value="sell">sell</option>
                  </select>
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    step="any"
                    value={op.volumen}
                    onChange={(e) =>
                      handleInputChange(op.id, "volumen", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    step="any"
                    value={op.precio_entrada}
                    onChange={(e) =>
                      handleInputChange(op.id, "precio_entrada", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    step="any"
                    value={op.precio_cierre || ""}
                    onChange={(e) =>
                      handleInputChange(op.id, "precio_cierre", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    step="any"
                    value={op.take_profit || ""}
                    onChange={(e) =>
                      handleInputChange(op.id, "take_profit", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    step="any"
                    value={op.stop_loss || ""}
                    onChange={(e) =>
                      handleInputChange(op.id, "stop_loss", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    step="1"
                    value={op.apalancamiento || 1}
                    onChange={(e) =>
                      handleInputChange(op.id, "apalancamiento", e.target.value)
                    }
                    className="w-full p-1 bg-gray-50 rounded border border-gray-300"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="checkbox"
                    checked={op.cerrada}
                    onChange={(e) =>
                      handleInputChange(op.id, "cerrada", e.target.checked)
                    }
                    className="form-checkbox h-5 w-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                  />
                </td>
                <td
                  className={`p-1 font-mono ${
                    op.ganancia >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {op.ganancia.toFixed(2)}
                </td>
                <td className="p-1">
                  <button
                    onClick={() => handleSave(op)}
                    className="bg-indigo-600 text-white px-3 py-1 text-xs rounded hover:bg-indigo-500 cursor-pointer"
                  >
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!showAll && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
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
            <p className="font-bold text-gray-900">{user.nombre}</p>
            <p className="text-gray-500">{user.email}</p>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              user.rol === "admin"
                ? "bg-indigo-100 text-indigo-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {user.rol}
          </span>
        </div>
        <div className="space-y-2 my-4">
          <div className="flex items-center">
            <label className="w-24 text-gray-500">Balance:</label>
            <input
              type="number"
              name="balance"
              value={user.balance}
              onChange={handleInputChange}
              className="flex-1 p-1 bg-gray-50 rounded border border-gray-300"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-gray-500">ID:</label>
            <input
              type="text"
              name="identificacion"
              value={user.identificacion}
              onChange={handleInputChange}
              className="flex-1 p-1 bg-gray-50 rounded border border-gray-300"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-gray-500">Teléfono:</label>
            <input
              type="text"
              name="telefono"
              value={user.telefono}
              onChange={handleInputChange}
              className="flex-1 p-1 bg-gray-50 rounded border border-gray-300"
            />
          </div>
          <div className="flex items-center">
            <label className="w-24 text-gray-500">Password:</label>
            <input
              type="password"
              name="password"
              value={user.password || ""}
              placeholder="No cambiar"
              onChange={handleInputChange}
              className="flex-1 p-1 bg-gray-50 rounded border border-gray-300"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
          <button
            onClick={() => onSave(user)}
            className="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-500 cursor-pointer"
          >
            Guardar
          </button>
          <button
            onClick={() => onViewUserOps(user)}
            title="Ver Operaciones"
            className="bg-yellow-500 text-white p-1 text-xs rounded hover:bg-yellow-400 cursor-pointer"
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
      <tr className="border-b border-gray-200">
        <td className="p-2 whitespace-nowrap">{user.id}</td>
        <td className="p-2">
          <input
            type="text"
            name="nombre"
            value={user.nombre}
            onChange={handleInputChange}
            className="w-full p-1 bg-gray-50 rounded border border-gray-300"
          />
        </td>
        <td className="p-2">
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
            className="w-full p-1 bg-gray-50 rounded border border-gray-300"
          />
        </td>
        <td className="p-2">
          <input
            type="number"
            name="balance"
            step="any"
            value={user.balance}
            onChange={handleInputChange}
            className="w-full p-1 bg-gray-50 rounded border border-gray-300"
          />
        </td>
        <td className="p-2">
          <select
            name="rol"
            value={user.rol}
            onChange={handleInputChange}
            className="w-full p-1 bg-gray-50 rounded border border-gray-300 cursor-pointer"
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
            className="w-full p-1 bg-gray-50 rounded border border-gray-300"
          />
        </td>
        <td className="p-2">
          <input
            type="text"
            name="telefono"
            value={user.telefono}
            onChange={handleInputChange}
            className="w-full p-1 bg-gray-50 rounded border border-gray-300"
          />
        </td>
        <td className="p-2">
          <input
            type="password"
            name="password"
            placeholder="No cambiar"
            value={user.password || ""}
            onChange={handleInputChange}
            className="w-full p-1 bg-gray-50 rounded border border-gray-300"
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
            className="bg-yellow-500 text-white p-1 text-xs rounded hover:bg-yellow-400 cursor-pointer"
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
          <thead className="bg-gray-200 text-gray-600 sticky top-0">
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
          <tbody className="bg-white">
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

// Modal para Gestionar Apalancamiento
const ManageLeverageModal = ({ isOpen, onClose, setAlert }) => {
  const [currentLeverage, setCurrentLeverage] = useState(200);
  const [newLeverage, setNewLeverage] = useState(200);

  useEffect(() => {
    if (isOpen) {
      axios
        .get("/admin/leverage")
        .then((res) => {
          setCurrentLeverage(res.data.maxLeverage);
          setNewLeverage(res.data.maxLeverage);
        })
        .catch((err) =>
          setAlert({
            message: "No se pudo cargar el apalancamiento actual",
            type: "error",
          })
        );
    }
  }, [isOpen, setAlert]);

  const handleSave = async () => {
    try {
      await axios.post("/admin/leverage", {
        newLeverage: parseInt(newLeverage),
      });
      setAlert({
        message: "Apalancamiento máximo actualizado con éxito",
        type: "success",
      });
      onClose();
    } catch (error) {
      setAlert({
        message: "Error al actualizar el apalancamiento",
        type: "error",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestionar Apalancamiento Máximo"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Apalancamiento máximo actual:{" "}
          <span className="font-bold text-gray-900">1:{currentLeverage}</span>
        </p>
        <div>
          <label
            htmlFor="leverage-select"
            className="block text-sm font-medium text-gray-700"
          >
            Seleccionar nuevo apalancamiento máximo
          </label>
          <select
            id="leverage-select"
            value={newLeverage}
            onChange={(e) => setNewLeverage(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {[1, 5, 10, 25, 50, 100, 200].map((val) => (
              <option key={val} value={val}>
                1:{val}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-500"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </Modal>
  );
};

// NUEVO MODAL: Gestionar Comisiones y Spreads
const ManageCommissionsModal = ({ isOpen, onClose, setAlert }) => {
  const { commissions, setCommissions } = useContext(AppContext);
  const [spread, setSpread] = useState(commissions.spreadPercentage);
  const [commission, setCommission] = useState(
    commissions.commissionPercentage
  );

  // Sincronizar estado local al abrir o si el estado global cambia
  useEffect(() => {
    setSpread(commissions.spreadPercentage);
    setCommission(commissions.commissionPercentage);
  }, [commissions]);

  const handleSave = async () => {
    const newSpread = parseFloat(spread);
    const newCommission = parseFloat(commission);

    if (
      isNaN(newSpread) ||
      newSpread < 0 ||
      isNaN(newCommission) ||
      newCommission < 0
    ) {
      setAlert({
        message: "Valores de comisión/spread inválidos.",
        type: "error",
      });
      return;
    }

    try {
      const res = await axios.post("/admin/commissions", {
        newSpread: newSpread,
        newCommission: newCommission,
      });

      // Actualizar estado global en el Context
      setCommissions({
        spreadPercentage: res.data.spreadPercentage,
        commissionPercentage: res.data.commissionPercentage,
      });

      setAlert({
        message: "Comisiones actualizadas con éxito",
        type: "success",
      });
      onClose();
    } catch (error) {
      setAlert({
        message:
          error.response?.data?.error || "Error al actualizar comisiones.",
        type: "error",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestionar Comisiones y Spread"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Define el % de Spread y la Comisión por Volumen que se aplicará a
          todas las operaciones.
        </p>

        {/* Campo de Spread */}
        <div>
          <label
            htmlFor="spread-input"
            className="block text-sm font-medium text-gray-700"
          >
            Spread de Mercado (en %)
          </label>
          <input
            id="spread-input"
            type="number"
            step="0.001"
            min="0"
            value={spread}
            onChange={(e) => setSpread(e.target.value)}
            placeholder="Ej: 0.01"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            El Spread se resta/suma al precio de entrada (Buy/Sell) para simular
            el diferencial.
          </p>
        </div>

        {/* Campo de Comisión */}
        <div>
          <label
            htmlFor="commission-input"
            className="block text-sm font-medium text-gray-700"
          >
            Comisión por Volumen (en %)
          </label>
          <input
            id="commission-input"
            type="number"
            step="0.01"
            min="0"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            placeholder="Ej: 0.1"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            La Comisión se resta del balance al abrir la operación (se calcula
            sobre el volumen nocional).
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-500"
          >
            Guardar Comisiones
          </button>
        </div>
      </div>
    </Modal>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
    <div className="text-gray-700 mb-6">{children}</div>
    <div className="flex justify-end gap-4">
      <button
        onClick={onClose}
        className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition-colors"
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors"
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
        className="flex items-center text-indigo-600 hover:text-indigo-500 mb-4 cursor-pointer"
      >
        <Icons.ChevronLeft /> Volver al Menú
      </button>
      <h2 className="text-xl font-bold mb-4 text-gray-900">Mis datos</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Nombre
          </label>
          <input
            type="text"
            readOnly
            value={user?.nombre || ""}
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Email
          </label>
          <input
            type="email"
            readOnly
            value={user?.email || ""}
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label
            htmlFor="identificacion"
            className="block text-sm font-medium mb-1 text-gray-500"
          >
            Identificación
          </label>
          <input
            id="identificacion"
            type="text"
            value={identificacion}
            onChange={(e) => setIdentificacion(e.target.value)}
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label
            htmlFor="telefono"
            className="block text-sm font-medium mb-1 text-gray-500"
          >
            Teléfono
          </label>
          <input
            id="telefono"
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-md text-white font-bold bg-indigo-600 hover:bg-indigo-500 cursor-pointer transition-colors"
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
    className="w-full text-left p-4 flex items-center gap-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
  >
    {icon}
    <span className="font-semibold text-lg text-gray-800">{text}</span>
  </button>
);

const DepositView = React.memo(({ onBack, onSelectMethod }) => (
  <div className="p-4">
    <button
      onClick={onBack}
      className="flex items-center text-indigo-600 hover:text-indigo-500 mb-6 cursor-pointer"
    >
      <Icons.ChevronLeft /> Volver al Menú Principal
    </button>
    <h2 className="text-2xl font-bold mb-6 text-gray-900">
      Seleccione un Método de Depósito
    </h2>
    <div className="space-y-4">
      {/* NUEVO: Botón para Tarjeta de Crédito/Débito */}
      <PaymentMethodButton
        icon={<Icons.CreditCard className="h-8 w-8 text-blue-500" />}
        text="Tarjeta de Crédito/Débito"
        onClick={() => onSelectMethod("card", "deposit")}
      />
      <PaymentMethodButton
        icon={<Icons.CreditCard className="h-8 w-8 text-indigo-500" />}
        text="Criptomonedas"
        onClick={() => onSelectMethod("crypto", "deposit")}
      />
      <PaymentMethodButton
        icon={<Icons.Banknotes className="h-8 w-8 text-green-500" />}
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
      className="flex items-center text-indigo-600 hover:text-indigo-500 mb-6 cursor-pointer"
    >
      <Icons.ChevronLeft /> Volver al Menú Principal
    </button>
    <h2 className="text-2xl font-bold mb-6 text-gray-900">
      Seleccione un Método de Retiro
    </h2>
    <div className="space-y-4">
      {/* NUEVO: Botón para Tarjeta de Crédito/Débito */}
      <PaymentMethodButton
        icon={<Icons.CreditCard className="h-8 w-8 text-blue-500" />}
        text="Tarjeta de Crédito/Débito"
        onClick={() => onSelectMethod("card", "withdraw")}
      />
      <PaymentMethodButton
        icon={<Icons.CreditCard className="h-8 w-8 text-indigo-500" />}
        text="Criptomonedas"
        onClick={() => onSelectMethod("crypto", "withdraw")}
      />
      <PaymentMethodButton
        icon={<Icons.Banknotes className="h-8 w-8 text-green-500" />}
        text="Transferencia Bancaria"
        onClick={() => onSelectMethod("bank", "withdraw")}
      />
    </div>
  </div>
));

const MenuButton = React.memo(({ icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors flex items-center text-gray-700 cursor-pointer"
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
              className="fixed inset-0 bg-black/50 z-40 cursor-pointer"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "circOut", duration: 0.4 }}
              className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 border-r border-gray-200 flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <img
                  className="mb-2"
                  src={
                    import.meta.env.VITE_PLATFORM_LOGO ||
                    "/unique1global-logo.png"
                  }
                  width="220"
                  alt="Logo"
                />
              </div>
              <div className="flex-grow overflow-y-auto">
                {view === "main" && (
                  <div className="p-4 space-y-2">
                    <MenuButton
                      icon={
                        <Icons.ArrowDownTray className="h-5 w-5 text-green-500" />
                      }
                      text="Depositar"
                      onClick={() => setView("deposit")}
                    />
                    <MenuButton
                      icon={
                        <Icons.ArrowUpTray className="h-5 w-5 text-indigo-500" />
                      }
                      text="Retirar"
                      onClick={() => setView("withdraw")}
                    />
                    <MenuButton
                      icon={<Icons.Key className="h-5 w-5 text-gray-500" />}
                      text="Cambiar Contraseña"
                      onClick={() => setView("change-password")}
                    />
                    <div className="my-2 h-px bg-gray-200" />
                    <MenuButton
                      icon={
                        <Icons.UserCircle className="h-5 w-5 text-gray-500" />
                      }
                      text="Mis Datos"
                      onClick={() => setView("profile")}
                    />
                    <MenuButton
                      icon={
                        <Icons.ShieldCheck className="h-5 w-5 text-gray-500" />
                      }
                      text="Seguridad"
                      onClick={() => setView("security")}
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
                {view === "change-password" && (
                  <ChangePasswordView
                    setAlert={setAlert}
                    onBack={() => setView("main")}
                  />
                )}
                {view === "security" && (
                  <SecurityView onBack={() => setView("main")} />
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
  const depositAddress = "TQmZ1fA2gB4iC3dE5fG6h7J8k9L0mN1oP2q"; // Dirección de ejemplo

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
          <p className="text-gray-500 mb-4">
            Envía USDT a la siguiente dirección usando la red TRON (TRC20).
          </p>
          <div className="bg-gray-100 p-4 rounded-lg my-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${depositAddress}`}
              alt="QR Code"
              className="mx-auto border-4 border-white rounded-lg"
            />
          </div>
          <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between gap-4">
            <span className="font-mono text-sm break-all text-gray-700">
              {depositAddress}
            </span>
            <button
              onClick={handleCopy}
              className="p-2 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <Icons.Clipboard className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-yellow-600 mt-4">
            Asegúrate de enviar únicamente USDT en la red TRC20. Enviar otra
            moneda o usar otra red podría resultar en la pérdida de tus fondos.
          </p>
        </div>
      ) : (
        <form onSubmit={handleWithdrawal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tu Dirección de Billetera (USDT)
            </label>
            <input
              required
              type="text"
              placeholder="Introduce tu dirección de billetera"
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Red
            </label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TRC20">TRON (TRC20)</option>
              <option value="ERC20">Ethereum (ERC20)</option>
              <option value="BEP20">BNB Smart Chain (BEP20)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto a Retirar
            </label>
            <input
              required
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-5 py-2 rounded-md text-white font-bold bg-indigo-600 hover:bg-indigo-500 transition-colors"
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
    <div className="space-y-4 text-gray-700">
      <p>
        Para continuar, por favor contacta a soporte con los siguientes
        detalles:
      </p>
      <ul className="list-disc list-inside bg-gray-100 p-4 rounded-md">
        <li>
          Tipo de operación:{" "}
          <span className="font-semibold text-gray-900">
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

// Modal para pagos con tarjeta
const CardPaymentModal = ({ isOpen, onClose, type, onSubmitted }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // En una aplicación real, aquí se integraría una pasarela de pago como Stripe.
    // Por ahora, solo simulamos el envío exitoso.
    onSubmitted();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${
        type === "deposit" ? "Depositar" : "Retirar"
      } con Tarjeta de Crédito/Débito`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto
          </label>
          <input
            required
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Titular
          </label>
          <input
            required
            type="text"
            placeholder="John Doe"
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Tarjeta
          </label>
          <input
            required
            type="text"
            placeholder="0000 0000 0000 0000"
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiración (MM/YY)
            </label>
            <input
              required
              type="text"
              placeholder="MM/YY"
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              required
              type="text"
              placeholder="123"
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="w-full px-5 py-3 rounded-md text-white font-bold bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            {type === "deposit" ? "Confirmar Depósito" : "Solicitar Retiro"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const SecurityView = React.memo(({ onBack }) => {
  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="flex items-center text-indigo-600 hover:text-indigo-500 mb-4 cursor-pointer"
      >
        <Icons.ChevronLeft /> Volver
      </button>
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        Seguridad de la Cuenta
      </h2>
      <p className="text-gray-600">
        Próximamente: Verificación de dos factores y más opciones de seguridad.
      </p>
    </div>
  );
});

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
  const [isLeverageModalOpen, setIsLeverageModalOpen] = useState(false);
  const [isCommissionsModalOpen, setIsCommissionsModalOpen] = useState(false); // NUEVO
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
      title: "Solicitud en Proceso",
      children:
        "Su solicitud ha sido recibida. Un agente se comunicará con usted a la brevedad para completar la operación.",
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
  }, [user, userAssets]);

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
      (total, op) => total + parseFloat(op.capital_invertido || 0),
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
      // La validación del margen libre se hará en el backend con el apalancamiento
      setNewOpModalData({ type, volume, asset: selectedAsset });
      setIsNewOpModalOpen(true);
    },
    [realTimePrices, selectedAsset]
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
            message: `Operación realizada con éxito. Comisión: $${data.comision.toFixed(
              2
            )}`,
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

  const handleUpdateOperation = useCallback(
    async (operationData) => {
      try {
        await axios.post("/admin/actualizar-operacion", operationData);
        setAlert({ message: "Operación actualizada", type: "success" });
        fetchData(pagination.currentPage, opHistoryFilter); // Recargar datos del usuario
      } catch (error) {
        setAlert({
          message: "Error al actualizar la operación",
          type: "error",
        });
        throw error; // Re-throw para que el modal sepa que falló
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
    import.meta.env.VITE_PLATFORM_LOGO || "/unique1global-logo.png";

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
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
      {/* NUEVO: Renderizado del modal de tarjeta */}
      {paymentModalConfig.method === "card" && (
        <CardPaymentModal
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
              className="fixed top-0 left-0 h-full w-72 bg-white p-4 overflow-y-auto flex-shrink-0 border-r border-gray-200 flex flex-col z-40 lg:hidden"
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
      <aside className="hidden lg:flex lg:flex-col w-72 bg-white p-4 overflow-y-auto flex-shrink-0 border-r border-gray-200">
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
        onUpdateOperation={handleUpdateOperation}
        setAlert={setAlert}
      />
      <OperationDetailsModal
        isOpen={isOpDetailsModalOpen}
        onClose={() => setIsOpDetailsModalOpen(false)}
        operation={currentOpDetails?.op}
        profit={currentOpDetails?.profit}
      />
      <ManageLeverageModal
        isOpen={isLeverageModalOpen}
        onClose={() => setIsLeverageModalOpen(false)}
        setAlert={setAlert}
      />
      {/* NUEVO: Renderizado del modal de comisiones */}
      <ManageCommissionsModal
        isOpen={isCommissionsModalOpen}
        onClose={() => setIsCommissionsModalOpen(false)}
        setAlert={setAlert}
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        stats={stats}
      />

      <main className="flex-1 flex flex-col bg-transparent overflow-hidden">
        <Header
          onOperation={handleOpenNewOpModal}
          onManageUsers={() => setIsUsersModalOpen(true)}
          onManageLeverage={() => setIsLeverageModalOpen(true)}
          onManageCommissions={() => setIsCommissionsModalOpen(true)} // Nuevo handler
          onToggleSideMenu={() => setIsSideMenuOpen(true)}
          onToggleMainSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />
        <div className="flex-1 flex flex-col p-2 sm:p-4 gap-4 overflow-y-auto pb-24 sm:pb-4">
          <div className="flex-grow min-h-[300px] sm:min-h-[400px] bg-white rounded-xl shadow-lg border border-gray-200">
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
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-3 border-t border-gray-200 flex justify-around items-center gap-2">
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
            className="w-24 p-3 border border-gray-300 bg-gray-50 rounded-md text-gray-900 text-center text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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

const ChangePasswordView = React.memo(({ onBack, setAlert }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setAlert({
        message: "Las contraseñas nuevas no coinciden.",
        type: "error",
      });
      return;
    }
    // Lógica para llamar a la API y cambiar la contraseña...
    setAlert({
      message: "Contraseña actualizada (simulación).",
      type: "success",
    });
  };

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="flex items-center text-indigo-600 hover:text-indigo-500 mb-4 cursor-pointer"
      >
        <Icons.ChevronLeft /> Volver
      </button>
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        Cambiar Contraseña
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Contraseña Actual
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Nueva Contraseña
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-500">
            Confirmar Nueva Contraseña
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 bg-gray-100 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-md text-white font-bold bg-indigo-600 hover:bg-indigo-500 cursor-pointer transition-colors"
          >
            Actualizar Contraseña
          </button>
        </div>
      </form>
    </div>
  );
});

const ProfileModal = ({ isOpen, onClose, user, stats }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resumen de Perfil"
      maxWidth="max-w-md"
    >
      {user && stats && (
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-gray-900">
              {user.nombre}
            </h3>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-600">
              Teléfono: {user.telefono || "No especificado"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Balance</p>
              <p className="font-bold text-xl text-gray-900">
                ${parseFloat(user.balance).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Ganancia Total</p>
              <p
                className={`font-bold text-xl ${
                  parseFloat(stats.ganancia_total) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${parseFloat(stats.ganancia_total || 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Op. Abiertas</p>
              <p className="font-bold text-xl text-gray-900">
                {stats.abiertas || 0}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Op. Cerradas</p>
              <p className="font-bold text-xl text-gray-900">
                {stats.cerradas || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

// --- LOGIN/REGISTER ADAPTADO PARA UNIQUE 1 GLOBAL ---
const LoginPage = ({ onNavigate }) => {
  const { setUser, setIsAuthenticated } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleAuth = async (e, action) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const platform_id = import.meta.env.VITE_PLATFORM_ID || "unique1global";

    if (action === "login") {
      try {
        const { data } = await axios.post("/login", {
          email: loginEmail,
          password: loginPassword,
          platform_id,
        });
        if (data.success && data.user) {
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

  // CAMBIO: Se actualiza la variable para usar un logo blanco específico para el login.
  // Puedes cambiar "/unique1global-logo-white.png" por la ruta correcta de tu logo blanco.
  const platformLogo =
    import.meta.env.VITE_PLATFORM_LOGO_WHITE || "/unique1global-logo-white.png";
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
      className="min-h-screen bg-gray-100 flex items-center justify-center p-4 bg-cover bg-center"
      style={{
        // CAMBIO: Nuevo fondo abstracto con blanco predominante y toques de color.
        backgroundImage:
          "url('https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?q=80&w=2070&auto=format&fit=crop')",
      }}
    >
      <div className="relative w-full max-w-4xl min-h-[600px] bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200">
        <div
          className="w-full md:w-1/2 text-white p-8 sm:p-12 flex flex-col justify-center items-center text-center bg-gradient-to-br from-purple-600 to-purple-800"
          style={{
            background: "linear-gradient(to bottom right, #5D1BC7, #410093)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <img
              src={platformLogo}
              alt="Logo de la Plataforma"
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
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
                  Iniciar Sesión
                </h2>
                {error && (
                  <p className="text-red-500 text-center text-sm mb-4">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="text-green-500 text-center text-sm mb-4">
                    {success}
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
                    className="w-full p-3 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full p-3 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
                    style={{ backgroundColor: "#410093" }}
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
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
                  Crear Cuenta
                </h2>
                {error && (
                  <p className="text-red-500 text-center text-sm mb-2">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="text-green-500 text-center text-sm mb-2">
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
                    className="w-full p-2 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full p-2 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full p-2 bg-gray-100 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
                    style={{ backgroundColor: "#410093" }}
                  >
                    Crear Cuenta
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => onNavigate("landing")}
            className="text-center text-sm text-purple-600 hover:underline mt-4"
          >
            &larr; Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

// --- NUEVO: Página de Inicio (Landing Page) ---
const LandingPage = ({ onNavigate }) => {
  const platformLogo =
    import.meta.env.VITE_PLATFORM_LOGO || "/unique1global-logo.png";

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

const App = () => {
  const { isAppLoading, isAuthenticated } = useContext(AppContext);
  const [currentView, setCurrentView] = useState("landing");

  const platformLogo =
    import.meta.env.VITE_PLATFORM_LOGO || "/unique1global-logo.png";

  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl font-bold animate-pulse">
          <img src={platformLogo} width="220" alt="Cargando..." />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <DashboardPage />;
  }

  switch (currentView) {
    case "login":
      return <LoginPage onNavigate={setCurrentView} />;
    case "landing":
    default:
      return <LandingPage onNavigate={setCurrentView} />;
  }
};

export default function Root() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
