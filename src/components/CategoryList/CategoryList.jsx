import "./CategoryList.css";
import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import { deleteCategory } from "../../Service/CategoryService.js";
import toast from "react-hot-toast";

const CategoryList = () => {
  const { categories, setCategories } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteByCategoryId = async (categoryId) => {
    try {
      const response = await deleteCategory(categoryId);
      if (response.status === 204) {
        const updatedCategories = categories.filter(
          (category) => category.categoryId !== categoryId
        );
        setCategories(updatedCategories);
        toast.success("Category deleted");
      } else {
        toast.error("Unable to delete category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete category");
    }
  };

  return (
    <div className="category-list-container">
      <div className="search-box">
        <div className="input-group">
          <input
            type="text"
            name="keyword"
            id="keyword"
            placeholder="Search categories..."
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
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category, index) => (
            <div key={index} className="col-12">
              <div className="card category-card">
                <div className="d-flex align-items-center">
                  <div style={{ marginRight: "15px" }}>
                    <img
                      src={category.imgUrl}
                      alt={category.name}
                      className="category-image"
                    />
                  </div>
                  <div className="flex-grow-1">
                    <h5>{category.name}</h5>
                    <p>{category.items} Items</p>
                  </div>
                  <div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteByCategoryId(category.categoryId)}
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
              <i className="bi bi-folder-x"></i>
              <p>No categories found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
