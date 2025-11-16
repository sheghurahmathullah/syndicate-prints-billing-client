import { useState } from "react";
import "./SearchBox.css";

const SearchBox = ({ onSearch }) => {
  const [searchText, setSearchText] = useState("");

  const handleInputChange = (e) => {
    const text = e.target.value;
    setSearchText(text);
    onSearch(text);
  };

  return (
    <div className="search-box-container">
      <input
        type="number"
        className="form-control search-input"
        placeholder="Search items by ID..."
        value={searchText}
        onChange={handleInputChange}
      />
      <span className="search-icon">
        <i className="bi bi-search"></i>
      </span>
    </div>
  );
};

export default SearchBox;
