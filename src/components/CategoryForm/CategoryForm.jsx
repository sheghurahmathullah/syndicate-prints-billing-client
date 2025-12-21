import {useContext, useEffect, useState} from "react";
import {assets} from "../../assets/assets.js";
import toast from "react-hot-toast";
import {addCategory} from "../../Service/CategoryService.js";
import {AppContext} from "../../context/AppContext.jsx";

const CategoryForm = () => {
    const {setCategories, categories} = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    const [data, setData] = useState({
        name: "",
        description: "",
        bgColor: "#ffff",
        imageUrl: "",
    });

    const onChangeHandler = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        setData((data) => ({...data, [name]: value}));
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!imageUrl || imageUrl.trim() === "") {
            toast.error("Please enter image URL for category");
            return;
        }

        // Validate URL format
        try {
            new URL(imageUrl);
        } catch (err) {
            toast.error("Please enter a valid image URL");
            return;
        }

        setLoading(true);
        const categoryData = {
            ...data,
            imageUrl: imageUrl.trim()
        };
        
        try {
            const response = await addCategory(categoryData);
            if (response.status === 201) {
                setCategories([...categories, response.data]);
                toast.success("Category added");
                setData({
                    name: "",
                    description: "",
                    bgColor: "#ffff",
                    imageUrl: "",
                });
                setImageUrl("");
            }
        }catch(err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error adding category");
        }finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-2 mt-2 category-form-wrapper">
            <div className="row">
                <div className="card col-md-12 form-container">
                    <div className="card-body">
                        <form onSubmit={onSubmitHandler}>
                            <div className="mb-3">
                                <label htmlFor="imageUrl" className="form-label fw-bold">Image URL</label>
                                <input 
                                    type="url" 
                                    name="imageUrl" 
                                    id="imageUrl" 
                                    className="form-control" 
                                    placeholder="https://example.com/image.jpg"
                                    value={imageUrl}
                                    onChange={(e) => {
                                        setImageUrl(e.target.value);
                                        setData((data) => ({...data, imageUrl: e.target.value}));
                                    }}
                                    required
                                />
                                {imageUrl && (
                                    <div className="mt-2">
                                        <p className="small text-muted mb-1">Preview:</p>
                                        <img 
                                            src={imageUrl} 
                                            alt="Category preview" 
                                            style={{
                                                maxWidth: "200px",
                                                maxHeight: "200px",
                                                objectFit: "contain",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                padding: "4px"
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                                const errorMsg = document.createElement("p");
                                                errorMsg.className = "text-danger small";
                                                errorMsg.textContent = "Failed to load image. Please check the URL.";
                                                e.target.parentNode.appendChild(errorMsg);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input type="text"
                                    name="name"
                                    id="name"
                                    className="form-control"
                                    placeholder="Category Name"
                                    onChange={onChangeHandler}
                                    value={data.name}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="description" className="form-label">Description</label>
                                <textarea
                                        rows="4"
                                       name="description"
                                       id="description"
                                       className="form-control"
                                       placeholder="Write content here.."
                                        onChange={onChangeHandler}
                                        value={data.description}
                                ></textarea>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="bgcolor" className="form-label">Background color</label>
                                <br/>
                                <input type="color"
                                       name="bgColor"
                                       id="bgcolor"
                                       onChange={onChangeHandler}
                                       value={data.bgColor}
                                       placeholder="#ffffff"
                                />
                            </div>
                            <button type="submit"
                                    disabled={loading}
                                    className="btn btn-warning   w-100">{loading ? "Loading..." : "Submit"}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryForm;