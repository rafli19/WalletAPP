import { useState } from "react";

let toastId = 0;

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = "success") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  return { toasts, addToast };
};

export default useToast;
