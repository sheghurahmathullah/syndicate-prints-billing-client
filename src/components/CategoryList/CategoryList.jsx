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
    // Find category to show name in confirmation
    const category = categories.find(cat => cat.categoryId === categoryId);
    const categoryName = category ? category.name : "this category";
    
    // Check if category has items
    if (category && category.items > 0) {
      toast.error(`Cannot delete category "${categoryName}". It has ${category.items} item(s) associated with it. Please delete or move the items first.`, {
        duration: 6000,
        style: {
          maxWidth: '500px',
          whiteSpace: 'pre-wrap',
        }
      });
      return;
    }

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete category "${categoryName}"?`)) {
      return;
    }

    try {
      const response = await deleteCategory(categoryId);
      if (response.status === 204) {
        const updatedCategories = categories.filter(
          (category) => category.categoryId !== categoryId
        );
        setCategories(updatedCategories);
        toast.success(`Category "${categoryName}" deleted successfully`);
      } else {
        toast.error("Unable to delete category");
      }
    } catch (error) {
      console.error(error);
      
      // Extract error message from API response
      let errorMessage = "Unable to delete category";
      
      if (error.response) {
        const errorData = error.response.data;
        if (errorData) {
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (error.response.status === 400) {
            errorMessage = errorData.message || "Cannot delete category. It may have items associated with it.";
          } else if (error.response.status === 404) {
            errorMessage = "Category not found";
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          maxWidth: '500px',
          whiteSpace: 'pre-wrap',
        }
      });
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
