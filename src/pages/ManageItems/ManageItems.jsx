import "./ManageItems.css";
import ItemForm from "../../components/ItemForm/ItemForm.jsx";
import ItemList from "../../components/ItemList/ItemList.jsx";

const ManageItems = () => {
  return (
    <div className="items-container text-light">
      <div className="left-column">
        <h3>
          <i className="bi bi-box-seam"></i> Add New Item
        </h3>
        <ItemForm />
      </div>
      <div className="right-column">
        <h3>
          <i className="bi bi-grid-3x3-gap"></i> All Items
        </h3>
        <ItemList />
      </div>
    </div>
  );
};

export default ManageItems;
