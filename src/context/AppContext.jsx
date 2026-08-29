import { createContext, useEffect, useState, useMemo } from "react";
import { fetchItems } from "../Service/ItemService.js";
import { fetchUsers } from "../Service/UserService.js";
import { getActivePageAccesses } from "../Service/PageAccessService.js";

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
  const [pageAccessRules, setPageAccessRules] = useState([]);

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
        setPageAccessRules([]);
        return;
      }

      try {
        const itemsPromise = fetchItems();
        const pageAccessPromise = getActivePageAccesses(auth.token);
        const usersPromise = auth.role === "ROLE_ADMIN" ? fetchUsers() : Promise.resolve({ data: [] });

        const [itemsRes, pageAccessRes, usersRes] = await Promise.allSettled([
          itemsPromise,
          pageAccessPromise,
          usersPromise,
        ]);

        if (cancelled) return;

        if (itemsRes.status === "fulfilled") {
          setItemsData(itemsRes.value?.data || []);
        } else {
          console.error("Failed to load items", itemsRes.reason);
          setItemsData([]);
        }

        if (pageAccessRes.status === "fulfilled") {
          setPageAccessRules(pageAccessRes.value || []);
        } else {
          console.error("Failed to load page access rules", pageAccessRes.reason);
          setPageAccessRules([]);
        }

        if (auth.role === "ROLE_ADMIN") {
          if (usersRes.status === "fulfilled") {
            setUsers(usersRes.value?.data || []);
          } else {
            console.error("Failed to load users", usersRes.reason);
            setUsers([]);
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
    pageAccessRules,
    setPageAccessRules,
  }), [categories, auth, users, itemsData, cartItems, pageAccessRules]);

  return (
    <AppContext.Provider value={contextValue}>
      {props.children}
    </AppContext.Provider>
  );
};
