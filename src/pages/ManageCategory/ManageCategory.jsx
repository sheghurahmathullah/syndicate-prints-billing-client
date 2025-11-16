import "./ManageCategory.css";
import CategoryForm from "../../components/CategoryForm/CategoryForm.jsx";
import CategoryList from "../../components/CategoryList/CategoryList.jsx";

const ManageCategory = () => {
  return (
    <div className="category-container text-light">
      <div className="left-column">
        <h3>
          <i className="bi bi-folder-plus"></i> Add New Category
        </h3>
        <CategoryForm />
      </div>
      <div className="right-column">
        <h3>
          <i className="bi bi-list-ul"></i> All Categories
        </h3>
        <CategoryList />
      </div>
    </div>
  );
};

export default ManageCategory;
