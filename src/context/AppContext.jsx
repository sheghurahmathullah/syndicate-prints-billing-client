import { createContext, useEffect, useState, useMemo } from "react";
import { fetchItems } from "../Service/ItemService.js";
import { fetchUsers } from "../Service/UserService.js";

export const AppContext = createContext(null);

export const AppContextProvider = (props) => {
  const [categories, setCategories] = useState([]);
  const [itemsData, setItemsData] = useState([]);
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    return { token: token || null, role: role || null };
  });
  const [cartItems, setCartItems] = useState([]);
  const [users, setUsers] = useState([]);

  const addToCart = (item) => {
    // Find existing item by itemId
    const existingItem = cartItems.find(
      (cartItem) => cartItem.itemId === item.itemId
    );
    if (existingItem) {
      // If item exists, increase quantity and set (or update) unit price to the selected price
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.itemId === item.itemId
            ? {
              ...cartItem,
              quantity: cartItem.quantity + 1,
              price: item.price,
            }
            : cartItem
        )
      );
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter((item) => item.itemId !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    setCartItems(
      cartItems.map((item) =>
        item.itemId === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const updateCustomPrice = (itemId, customPrice) => {
    setCartItems(
      cartItems.map((item) =>
        item.itemId === itemId
          ? {
            ...item,
            customPrice:
              customPrice !== "" &&
                customPrice !== null &&
                customPrice !== undefined &&
                !isNaN(parseFloat(customPrice)) &&
                parseFloat(customPrice) >= 0
                ? parseFloat(customPrice)
                : null,
          }
          : item
      )
    );
  };

  // Auth state is now initialized synchronously in useState to prevent redirect loops on refresh

  // fetch protected data only when authenticated
  // This runs in the background and doesn't block navigation
  useEffect(() => {
    let cancelled = false;

    async function loadProtectedData() {
      if (!auth || !auth.token) {
        // clear sensitive data when not authenticated
        setCategories([]);
        setItemsData([]);
        setUsers([]);
        return;
      }

      try {
        const promises = [fetchItems()];
        if (auth.role === "ROLE_ADMIN") {
          promises.push(fetchUsers());
        }

        const results = await Promise.allSettled(promises);
        if (cancelled) return;

        if (results[0].status === "fulfilled") {
          setItemsData(results[0].value?.data || []);
        } else {
          console.error("Failed to load items", results[0].reason);
          setItemsData([]);
        }

        if (auth.role === "ROLE_ADMIN") {
          if (results[1] && results[1].status === "fulfilled") {
            setUsers(results[1].value?.data || []);
          } else {
            console.error("Failed to load users", results[1]?.reason);
          }
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Error loading protected data:", err);
      }
    }

    // Load data asynchronously without blocking
    loadProtectedData();

    return () => {
      cancelled = true;
    };
  }, [auth.token, auth.role]);

  const setAuthData = (token, role) => {
    setAuth({ token, role });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const contextValue = useMemo(() => ({
    categories,
    setCategories,
    auth,
    users,
    setUsers,
    setAuthData,
    itemsData,
    setItemsData,
    addToCart,
    cartItems,
    removeFromCart,
    updateQuantity,
    updateCustomPrice,
    clearCart,
  }), [categories, auth, users, itemsData, cartItems]);

  return (
    <AppContext.Provider value={contextValue}>
      {props.children}
    </AppContext.Provider>
  );
};
