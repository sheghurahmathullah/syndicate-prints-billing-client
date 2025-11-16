import { createContext, useEffect, useState } from "react";
import { fetchCategories } from "../Service/CategoryService.js";
import { fetchItems } from "../Service/ItemService.js";
import { fetchUsers } from "../Service/UserService.js";

export const AppContext = createContext(null);

export const AppContextProvider = (props) => {
  const [categories, setCategories] = useState([]);
  const [itemsData, setItemsData] = useState([]);
  const [auth, setAuth] = useState({ token: null, role: null });
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

  // on mount, restore auth from localStorage (so refresh keeps login)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) setAuthData(token, role);
  }, []);

  // fetch protected data only when authenticated
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
        // Fetch categories and items for all authenticated users
        const [response, itemResponse] = await Promise.all([
          fetchCategories(),
          fetchItems(),
        ]);
        if (cancelled) return;
        setCategories(response.data || []);
        setItemsData(itemResponse.data || []);

        // Only fetch users if admin role
        // if (auth.role === "ROLE_ADMIN") { }

          try {
            const userResponse = await fetchUsers();
            if (!cancelled) {
              setUsers(userResponse.data || []);
              console.log("users loaded:", userResponse.data );
            }
          } catch (userErr) {
            console.error("Failed to load users", userErr);
            // Don't block other data if users fail
          }
        
      } catch (err) {
        console.error("Failed to load protected data", err);
        // keep previous data or clear depending on policy
      }
    }

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
    clearCart,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {props.children}
    </AppContext.Provider>
  );
};
