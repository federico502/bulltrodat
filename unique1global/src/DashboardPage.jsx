import React, {
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import axios from "axios";
import {
  AppContext,
  normalizeAssetKey,
  motion,
  AnimatePresence,
  Toast,
  Header,
  FinancialMetrics,
  OperationsHistory,
  NewOperationModal,
  OperationDetailsModal,
  ManageUsersModal,
  UserOperationsModal,
  ManageLeverageModal,
  ManageCommissionsModal,
  ConfirmationModal,
  SideMenu,
  CryptoPaymentModal,
  BankTransferModal,
  CardPaymentModal,
  ProfileModal,
  StatisticsPanel,
  AssetLists,
  TradingViewWidget,
  Icons,
} from "./App.jsx"; // Importa todo desde App.jsx

const DashboardPage = () => {
  const {
    user,
    selectedAsset,
    setSelectedAsset,
    realTimePrices,
    commissions,
    VITE_WSS_URL,
    VITE_PLATFORM_LOGO,
  } = useContext(AppContext);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [mobileVolume, setMobileVolume] = useState(0.01);
  const wsRef = useRef(null);

  const normalizeInitialAssets = useCallback((assets) => {
    return assets.map((symbol) => {
      if (symbol.endsWith("-USDT")) return symbol;
      if (symbol.includes("/")) return symbol;
      return symbol;
    });
  }, []);

  const initialAssets = [
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
  ];

  const [userAssets, setUserAssets] = useState(() => {
    try {
      const savedAssets = localStorage.getItem("userTradingAssets");
      const parsedAssets = savedAssets
        ? JSON.parse(savedAssets)
        : initialAssets;
      return Array.isArray(parsedAssets) && parsedAssets.length > 0
        ? normalizeInitialAssets(parsedAssets)
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
  const [isCommissionsModalOpen, setIsCommissionsModalOpen] = useState(false);
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
      const wsUrl = VITE_WSS_URL;
      if (!wsUrl) {
        console.error("WebSocket URL is not defined.");
        return;
      }
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "subscribe", symbols: userAssets }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "price_update" && data.prices) {
            const incomingPrices = data.prices;
            const validatedPrices = {};
            for (const key in incomingPrices) {
              const value = incomingPrices[key];
              if (typeof key !== "string" || key.length === 0) continue;
              if (typeof value === "string" || typeof value === "number") {
                validatedPrices[key] = String(value);
              }
            }
            setRealTimePrices((prev) => ({ ...prev, ...validatedPrices }));
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
        wsRef.current.close();
      }
    };
  }, [
    user,
    userAssets,
    VITE_WSS_URL,
    setRealTimePrices,
    fetchData,
    opHistoryFilter,
    pagination,
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
      const normalizedSymbol = normalizeAssetKey(op.activo);
      const currentPrice = parseFloat(realTimePrices[normalizedSymbol]);

      if (isNaN(currentPrice)) return total;

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
  }, [realTimePrices, operations, balance, commissions]);

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
      const normalizedAsset = normalizeAssetKey(selectedAsset);
      const currentPrice = parseFloat(realTimePrices[normalizedAsset]);

      if (isNaN(currentPrice)) {
        setAlert({
          message: "Precio del activo no disponible. Intente de nuevo.",
          type: "error",
        });
        return;
      }
      setNewOpModalData({ type, volume, asset: selectedAsset });
      setIsNewOpModalOpen(true);
    },
    [realTimePrices, selectedAsset]
  );

  const handleConfirmOperation = useCallback(
    async (opDetails) => {
      const normalizedAsset = normalizeAssetKey(selectedAsset);
      const livePrice = parseFloat(realTimePrices[normalizedAsset]);

      if (isNaN(livePrice)) {
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
      const normalizedSymbol = normalizeAssetKey(op.activo);
      const currentPrice = parseFloat(realTimePrices[normalizedSymbol]);

      const profit = op.cerrada
        ? parseFloat(op.ganancia || 0)
        : isNaN(currentPrice)
        ? 0
        : op.tipo_operacion.toLowerCase() === "sell"
        ? (op.precio_entrada - currentPrice) * op.volumen
        : (currentPrice - op.precio_entrada) * op.volumen;

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
        fetchData(pagination.currentPage, opHistoryFilter);
      } catch (error) {
        setAlert({
          message: "Error al actualizar la operación",
          type: "error",
        });
        throw error;
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

  const platformLogo = VITE_PLATFORM_LOGO;

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
          onManageCommissions={() => setIsCommissionsModalOpen(true)}
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

export default DashboardPage;
