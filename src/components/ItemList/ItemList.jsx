import { use, useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import { deleteItem, fetchItems } from "../../Service/ItemService.js";
import toast from "react-hot-toast";
import "./ItemList.css";

const ItemList = () => {
  const { itemsData, setItemsData } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = itemsData.filter((item) => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const removeItem = async (itemId) => {
    try {
      const response = await deleteItem(itemId);
      if (response.status === 204) {
        const updatedItems = itemsData.filter((item) => item.itemId !== itemId);
        setItemsData(updatedItems);
        toast.success("Item deleted");
      } else {
        toast.error("Unable to delete item");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unable to delete item");
    }
  };

  return (
    <div className="item-list-container">
      <div className="search-box">
        <div className="input-group">
          <input
            type="text"
            name="keyword"
            id="keyword"
            placeholder="Search items..."
            className="form-control search-input"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          <span className="search-icon">
            <i className="bi bi-search"></i>
          </span>
        </div>
      </div>
      <div className="row g-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <div className="col-12" key={index}>
              <div className="card item-card">
                <div className="d-flex align-items-center">
                  <div style={{ marginRight: "15px" }}>
                    <img
                      src={item.imgUrl}
                      alt={item.name}
                      className="item-image"
                    />
                  </div>
                  <div className="flex-grow-1">
                    <h6>{item.name}</h6>
                    <p>Category: {item.categoryName}</p>

                    <div className="d-flex mt-1 gap-2">
                      <span className="badge text-bg-warning">
                        &#8377;{item.price}
                      </span>
                      <span className="badge text-bg-info">
                        &#8377;{item.priceBack}
                      </span>
                    </div>
                  </div>
                  <div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeItem(item.itemId)}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <p>No items found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemList;
