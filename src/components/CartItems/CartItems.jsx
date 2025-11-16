import "./CartItems.css";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";

const CartItems = () => {
  const { cartItems, removeFromCart, updateQuantity } = useContext(AppContext);
  return (
    <div className="h-100">
      {cartItems.length === 0 ? (
        <p className="text-dark">Your cart is empty.</p>
      ) : (
        <div className="cart-items-list">
          {cartItems.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 text-dark">{item.name}</h6>
                <p className="mb-0 text-dark">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      updateQuantity(item.itemId, item.quantity - 1)
                    }
                    disabled={item.quantity === 1}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <span className="text-dark">{item.quantity}</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      updateQuantity(item.itemId, item.quantity + 1)
                    }
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ width: "auto" }}
                  onClick={() => removeFromCart(item.itemId)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartItems;
