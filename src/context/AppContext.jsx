import { createContext, useEffect, useState } from "react";
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

      // Load items (non-blocking)
      fetchItems()
        .then((itemResponse) => {
          if (!cancelled) setItemsData(itemResponse.data || []);
        })
        .catch(err => {
          console.error("Failed to load items", err);
          if (!cancelled) setItemsData([]);
        });

      // Only fetch users if admin role (non-blocking)
      if (auth.role === "ROLE_ADMIN") {
        fetchUsers()
          .then((userResponse) => {
            if (!cancelled) {
              setUsers(userResponse.data || []);
              console.log("users loaded:", userResponse.data);
            }
          })
          .catch((userErr) => {
            console.error("Failed to load users", userErr);
            // Don't block other data if users fail
          });
      } else {
        // Clear users for non-admin users
        setUsers([]);
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

  const contextValue = {
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
  };

  return (
    <AppContext.Provider value={contextValue}>
      {props.children}
    </AppContext.Provider>
  );
};
