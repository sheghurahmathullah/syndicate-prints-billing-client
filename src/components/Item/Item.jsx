import "./Item.css";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext.jsx";

// Item card without image – shows name, prices and add-to-cart controls only
const Item = ({ itemName, itemPrice, itemPriceBack, itemId }) => {
  const { addToCart } = useContext(AppContext);

  const handleAddToCart = (price) => {
    addToCart({
      name: itemName,
      price,
      quantity: 1,
      itemId,
    });
  };

  return (
    <div className="p-3 rounded shadow h-100 d-flex align-items-center item-card">
      <div className="flex-grow-1">
        <h6 className="mb-1 text-dark">{itemName}</h6>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-dark btn-sm"
            onClick={() => handleAddToCart(itemPrice)}
          >
            ₹{itemPrice}
          </button>

          <button
            type="button"
            className="btn btn-outline-dark btn-sm"
            onClick={() => handleAddToCart(itemPriceBack)}
          >
            ₹{itemPriceBack}
          </button>
        </div>
      </div>

      <div
        className="d-flex flex-column justify-content-between align-items-center ms-3"
        style={{ height: "100%" }}
      >
        <i className="bi bi-cart-plus fs-4 text-warning"></i>
        <button
          className="btn btn-success btn-sm"
          onClick={() => handleAddToCart(itemPrice)}
        >
          <i className="bi bi-plus"></i>
        </button>
      </div>
    </div>
  );
};

export default Item;