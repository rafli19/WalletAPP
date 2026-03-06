import { useState, useCallback, useEffect } from "react";
import api from "../services/api";

const useWallet = (refreshTick) => {
  const [balance, setBalance] = useState(null);

  const loadBalance = useCallback(async () => {
    try {
      const data = await api.get("/wallet");
      setBalance(data.balance ?? data.data?.balance ?? 0);
    } catch {
      setBalance(0);
    }
  }, []);

  useEffect(() => {
    loadBalance();
  }, [loadBalance, refreshTick]);

  return { balance, refetch: loadBalance };
};

export default useWallet;
