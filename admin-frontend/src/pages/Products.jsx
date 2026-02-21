import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

const spinnerStyle = `
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
`;



function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // product fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  // variant system
  const [variantType, setVariantType] = useState("");
  const [variantLabel, setVariantLabel] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [variants, setVariants] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
const [isUploading, setIsUploading] = useState(false);

  


  const [editingProduct, setEditingProduct] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  
const [searchText, setSearchText] = useState("");
const totalProducts = products.length;
const [showInactive, setShowInactive] = useState(false);
const [cardFilter, setCardFilter] = useState(null);
// ✅ Bulk selection state
const [selectedProducts, setSelectedProducts] = useState([]);

// ✅ Bulk stock input
const [bulkStock, setBulkStock] = useState("");

// ✅ Stock history modal state
const [showHistoryModal, setShowHistoryModal] = useState(false);
const [historyProduct, setHistoryProduct] = useState(null);
const [historyVariant, setHistoryVariant] = useState(null);
const [stockHistory, setStockHistory] = useState([]);
const [loadingHistory, setLoadingHistory] = useState(false);




const outOfStockProducts = products.filter(
  (p) =>
    p.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0) === 0
).length;

const activeProducts = totalProducts - outOfStockProducts;

const inactiveProducts = products.filter(
  (p) => p.isActive === false
).length;

const lowStockProducts = products.filter((p) => {
  const totalStock = p.variants.reduce(
    (sum, v) => sum + (v.stock ?? 0),
    0
  );

  return totalStock > 0 && totalStock <= 10 && p.isActive !== false;
}).length;


  // 🔐 detect role
  const token = localStorage.getItem("token");
  let role = "";

  if (token) {
    const decoded = jwtDecode(token);
    role = decoded.role;
  }

  // fetch products
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch {
      setError("Failed to load products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

// ✅ LAST UPDATED TEXT HELPER
const getLastUpdatedText = (date) => {
  if (!date) return "-";

  const updated = new Date(date);
  const today = new Date();

  const diffTime = today - updated;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
};


const getMovement = (product) => {
  const totalStock = product.variants.reduce(
    (sum, v) => sum + (v.stock ?? 0),
    0
  );

  if (totalStock <= 5) {
    return { label: "🧊 Low", color: "#2563eb" };
  }

  if (totalStock <= 20) {
    return { label: "⚖️ Medium", color: "#ca8a04" };
  }

  return { label: "🔥 High", color: "#16a34a" };
};

// ✅ Checkbox helpers
const toggleSelectProduct = (productId) => {
  setSelectedProducts((prev) =>
    prev.includes(productId)
      ? prev.filter((id) => id !== productId)
      : [...prev, productId]
  );
};

const isProductSelected = (productId) => {
  return selectedProducts.includes(productId);
};



// ✅ Select / Unselect all visible products
const toggleSelectAll = (visibleProducts) => {
  const visibleIds = visibleProducts.map((p) => p._id);

  const allSelected = visibleIds.every((id) =>
    selectedProducts.includes(id)
  );

  setSelectedProducts(allSelected ? [] : visibleIds);
};



// ================= SUMMARY CALCULATIONS =================

// 💰 Total Inventory Value (₹)
const totalInventoryValue = products.reduce((total, product) => {
  const productValue = product.variants.reduce(
    (sum, v) => sum + (v.price * (v.stock ?? 0)),
    0
  );
  return total + productValue;
}, 0);

// ⚠️ Stock at Risk Value (₹) — Low + Out of Stock
const stockAtRiskValue = products.reduce((total, product) => {
  const totalStock = product.variants.reduce(
    (sum, v) => sum + (v.stock ?? 0),
    0
  );

  if (totalStock === 0 || totalStock <= 10) {
    const productValue = product.variants.reduce(
      (sum, v) => sum + (v.price * (v.stock ?? 0)),
      0
    );
    return total + productValue;
  }

  return total;
}, 0);

// 🔥 High / 🧊 Low Movement Counts
const highMovementCount = products.filter(
  (p) => getMovement(p).label.includes("High")
).length;

const lowMovementCount = products.filter(
  (p) => getMovement(p).label.includes("Low")
).length;


// ================= FILTERED PRODUCTS (single source of truth) =================
const filteredProducts = products.filter((product) => {
  // Card filters
  if (cardFilter === "ACTIVE" && product.isActive === false) return false;
  if (cardFilter === "INACTIVE" && product.isActive !== false) return false;

  if (
    cardFilter === "HIGH_MOVEMENT" &&
    !getMovement(product).label.includes("High")
  )
    return false;

  if (
    cardFilter === "LOW_MOVEMENT" &&
    !getMovement(product).label.includes("Low")
  )
    return false;

  if (cardFilter === "RISK") {
    const totalStock = product.variants.reduce(
      (sum, v) => sum + (v.stock ?? 0),
      0
    );
    if (!(totalStock === 0 || totalStock <= 10)) return false;
  }

  // Show inactive toggle
  if (!showInactive && product.isActive === false) return false;

  // Search
  return (
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.category.toLowerCase().includes(searchText.toLowerCase())
  );
});



  const getVariantPlaceholder = () => {
    switch (variantType) {
      case "weight":
        return "e.g. 250 g / 500 g / 1 kg";
      case "volume":
        return "e.g. 100 ml / 250 ml";
      case "unit":
        return "e.g. Per Meal / Per Item";
      case "container":
        return "e.g. Cup / Bowl / Box";
      default:
        return "";
    }
  };

  const handleAddVariant = () => {
    if (!variantType || !variantLabel || !price) {
      alert("Fill variant type, label and price");
      return;
    }

    setVariants([
      ...variants,
      {
        name: variantLabel,
        price: Number(price),
        stock: Number(stock || 0),
      },
    ]);

    setVariantLabel("");
    setPrice("");
    setStock("");
  };

  const handleSubmitProduct = async () => {
  if (!name || !category || variants.length === 0) {
    alert("Product name, category and at least one variant required");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("variants", JSON.stringify(variants));

    if (imagePreview) {
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput && fileInput.files[0]) {
        formData.append("image", fileInput.files[0]);
      }
    }

    await api.post("/products", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    setName("");
    setCategory("");
    setVariants([]);
    setVariantType("");
    setImagePreview(null);
    setShowForm(false);

    fetchProducts();
  } catch (err) {
    console.error(err);
    alert("Failed to add product");
  }
};


  const handleEditVariant = (product, variant) => {
    setEditingProduct(product);
    setEditingVariant(variant);
  };

  const handleSaveVariant = async () => {

    try {
      await api.put(
        `/products/${editingProduct._id}/variants/${editingVariant._id}`,
        {
          price: editingVariant.price,
          stock: editingVariant.stock,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingProduct(null);
      setEditingVariant(null);
      fetchProducts();
    } catch {
      alert("Failed to update variant");
    }
  };


const handleBulkStockUpdate = async () => {
  if (!bulkStock) {
    alert("Enter stock quantity");
    return;
  }

  try {
    for (const productId of selectedProducts) {
      const product = products.find((p) => p._id === productId);
      if (!product) continue;

      for (const variant of product.variants) {
        const newStock = (variant.stock || 0) + Number(bulkStock);

        await api.put(
          `/products/${product._id}/variants/${variant._id}`,
          {
            price: variant.price, // price unchanged
            stock: newStock,       // ✅ ADD stock
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    }

    setBulkStock("");
    setSelectedProducts([]);
    fetchProducts();
    alert("Bulk stock updated successfully");
  } catch (err) {
    console.error(err);
    alert("Bulk stock update failed");
  }
};





  

const handleDeleteProduct = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      
    await api.put(
  `/products/${productId}/deactivate`,
  {},
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);




      alert("Product deleted");
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleRestoreProduct = async (productId) => {
  try {
    await api.put(
      `/products/${productId}/activate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Product restored");
    fetchProducts();
  } catch (err) {
    console.error(err);
    alert("Restore failed");
  }
};



// ✅ UPDATE PRODUCT IMAGE
const handleUpdateImage = async (productId) => {
  if (!newImageFile) {
    return; // image optional, so silently skip
  }

  const formData = new FormData();
  formData.append("image", newImageFile);

  try {
    setIsUploading(true); // 🔄 START loader

    await api.put(
      `/products/${productId}/image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setNewImageFile(null);
    fetchProducts();
  } catch (err) {
    console.error(err);
    alert("Failed to update image");
  } finally {
    setIsUploading(false); // ✅ STOP loader
  }
};


// ✅ Open stock history modal (REAL DATA)
const openHistoryModal = async (product) => {
  setHistoryProduct(product);
  setShowHistoryModal(true);
  setLoadingHistory(true);

  try {
    const res = await api.get(
      `/stock-logs/product/${product._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setStockHistory(res.data);
  } catch (err) {
    console.error(err);
    alert("Failed to load stock history");
  } finally {
    setLoadingHistory(false);
  }
};


// ✅ Close stock history modal
const closeHistoryModal = () => {
  setShowHistoryModal(false);
  setHistoryProduct(null);
  setStockHistory([]);
};








  return (
    <div style={{ width: "100%" }}>
<style>{spinnerStyle}</style>


  <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  }}
>
  <div>
    <h2 style={{ margin: 0, fontSize: "26px", fontWeight: 700 }}>
      Products
    </h2>
    <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
      Manage inventory, pricing and stock
    </div>
  </div>

  {role === "admin" && (
    <button
      onClick={() => setShowForm(!showForm)}
      style={{
        padding: "10px 16px",
        borderRadius: "25px",
        background: "#1024dd",
        color: "#f4f3f3",
        border: "none",
        fontSize: "12px",
        cursor: "pointer",
      }}
    >
      {showForm ? "Close Form" : "+ Add Product"}
    </button>
  )}
</div>



{/* ================= BUSINESS SUMMARY CARDS ================= */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "14px",
    margin: "20px 0",
  }}
>
  {/* Total Inventory Value */}
  <div
  onClick={() => setCardFilter(null)}
    style={{
      cursor: "pointer",
      padding: "14px",
      background: "#dcfce7",
      border: "1px solid #86efac",
      borderRadius: "10px",
    }}
  >
    <div style={{ fontSize: "12px", color: "#166534" }}>
      Total Inventory Value
    </div>
    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#14532d" }}>
      ₹{totalInventoryValue}
    </div>
  </div>

  {/* Stock at Risk */}
  <div
  onClick={() => setCardFilter("RISK")}
    style={{
        cursor: "pointer",
      padding: "14px",
      background: "#fff7ed",
      border: "1px solid #fed7aa",
      borderRadius: "10px",
    }}
  >
    <div style={{ fontSize: "12px", color: "#9a3412" }}>
      Stock at Risk
    </div>
    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#7c2d12" }}>
      ₹{stockAtRiskValue}
    </div>
  </div>

  {/* High Movement */}
  <div
  onClick={() => setCardFilter("HIGH_MOVEMENT")}
    style={{
        cursor: "pointer",
      padding: "14px",
      background: "#ecfdf5",
      border: "1px solid #6ee7b7",
      borderRadius: "10px",
    }}
  >
    <div style={{ fontSize: "12px", color: "#065f46" }}>
      High Movement
    </div>
    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#047857" }}>
      {highMovementCount}
    </div>
  </div>

  {/* Low Movement */}
  <div
  onClick={() => setCardFilter("LOW_MOVEMENT")}
    style={{
        cursor: "pointer",
      padding: "14px",
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: "10px",
    }}
  >
    <div style={{ fontSize: "12px", color: "#1e40af" }}>
      Low Movement
    </div>
    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#1d4ed8" }}>
      {lowMovementCount}
    </div>
  </div>

  {/* Total Products */}
  <div
  onClick={() => setCardFilter(null)}
    style={{
        cursor: "pointer",
      padding: "14px",
      background: "#f3f4f6",
      border: "1px solid #d1d5db",
      borderRadius: "10px",
    }}
  >
    <div style={{ fontSize: "12px", color: "#374151" }}>
      Total Products
    </div>
    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#111827" }}>
      {totalProducts}
    </div>
  </div>

  {/* Active Products */}
  <div
  onClick={() => setCardFilter("ACTIVE")}
    style={{
        cursor: "pointer",
      padding: "14px",
      background: "#ecfeff",
      border: "1px solid #67e8f9",
      borderRadius: "10px",
    }}
  >
    <div style={{ fontSize: "12px", color: "#0e7490" }}>
      Active Products
    </div>
    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#155e75" }}>
      {activeProducts}
    </div>
  </div>

  {/* Inactive Products */}
  <div
  onClick={() => setCardFilter("INACTIVE")}
    style={{
        cursor: "pointer",
      padding: "14px",
      background: "#f5f3ff",
      border: "1px solid #ddd6fe",
      borderRadius: "10px",
    }}
  >
    <div style={{ fontSize: "12px", color: "#5b21b6" }}>
      Inactive Products
    </div>
    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#4c1d95" }}>
      {inactiveProducts}
    </div>
  </div>
</div>




<div style={{ marginBottom: "15px" }}>
  <label>
    <input
      type="checkbox"
      checked={showInactive}
      onChange={() => setShowInactive(!showInactive)}
      style={{ marginRight: "6px" }}
    />
    Show Inactive Products
  </label>
</div>


      {error && <p style={{ color: "red" }}>{error}</p>}



{/* Search + Add Product row */}
<div
  style={{
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "15px",
  }}
>


{/* ================= BULK ACTION BAR ================= */}
{selectedProducts.length > 0 && (
  <div
    style={{
      display: "flex",
      gap: "12px",
      alignItems: "center",
      padding: "12px",
      marginBottom: "15px",
      background: "#fef3c7",
      border: "1px solid #fde68a",
      borderRadius: "8px",
    }}
  >
    <strong>
      {selectedProducts.length} product(s) selected
    </strong>

    <input
  type="number"
  placeholder="Add stock"
  value={bulkStock}
  onChange={(e) => setBulkStock(e.target.value)}
  style={{
    width: "120px",
    marginLeft: "10px",
    padding: "6px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  }}
/>


    <button
  onClick={handleBulkStockUpdate}
  style={{
    marginLeft: "10px",
    padding: "6px 12px",
    borderRadius: "6px",
    background: "#16a34a",
    color: "white",
    border: "none",
    cursor: "pointer",
  }}
>
  Apply Stock
</button>


    <button
      onClick={() => setSelectedProducts([])}
      style={{
        background: "#fee2e2",
        color: "#dc2626",
        padding: "6px 14px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
      }}
    >
      Clear
    </button>
  </div>
)}




  <input
    type="text"
    placeholder="Search product or category..."
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    style={{
      padding: "8px",
      width: "250px",
      borderRadius: "6px",
      border: "1px solid #eeebeb",
    }}
  />
</div>



     
      {showForm && (
        <div style={{ border: "1px solid #d81818", padding: 15, marginBottom: 30 }}>
          <h3>Add Product</h3>

          <input
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <br /><br />

          <input
            type="file"
            onChange={(e) =>
              setImagePreview(URL.createObjectURL(e.target.files[0]))
            }
          />
          <br /><br />

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            <option value="vegetable">Vegetable</option>
            <option value="fruit">Fruit</option>
            <option value="juice">Juice</option>
            <option value="meal">Meal</option>
            <option value="fruit salad">Fruit Salad</option>
<option value="solar dry powders">Solar Dry Powders</option>
<option value="Combo Packs">Combo Packs</option>

          </select>

          <select
            value={variantType}
            onChange={(e) => setVariantType(e.target.value)}
          >
            <option value="">Variant Type</option>
            <option value="weight">Weight</option>
            <option value="volume">Volume</option>
            <option value="unit">Unit</option>
            <option value="container">Container</option>
          </select>

          <br /><br />

          <input
            placeholder={getVariantPlaceholder()}
            value={variantLabel}
            onChange={(e) => setVariantLabel(e.target.value)}
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />

          <button onClick={handleAddVariant}>Add Variant</button>
          <br /><br />
          <button onClick={handleSubmitProduct}>Save Product</button>
        </div>
      )}

      {/* TABLE HEADER */}

      <div
  style={{
    display: "grid",
    gridTemplateColumns: "40px 120px 2fr 1fr 1fr 1.3fr 0.5fr 1fr 1fr 1fr 1fr 1fr",
    padding: "12px 10px",
    fontWeight: 600,
    fontSize: "14px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    color: "#374151",

    position: "sticky",
  top: 0,
  zIndex: 10,
  }}
>


<div style={{ textAlign: "center" }}>
 
 <input
  type="checkbox"
  checked={
    filteredProducts.length > 0 &&
    filteredProducts.every((p) =>
      selectedProducts.includes(p._id)
    )
  }
  onChange={() => toggleSelectAll(filteredProducts)}
/>


</div>

        
        <div>Image</div>
        <div>Product</div>
        <div style={{ textAlign: "center" }}>Category</div>
        <div style={{ textAlign: "center" }}>Variants</div>
        <div style={{ textAlign: "center" }}>Movement</div>
        <div>Price</div>
        <div style={{ textAlign: "center" }}>Stock</div>
        <div style={{ textAlign: "center" }}>Stock Value</div>
        <div style={{ textAlign: "center" }}>Status</div>
        <div style={{ textAlign: "center" }}>Last Updated</div>
<div style={{ textAlign: "center" }}>Actions</div>



    
      </div>

     
{filteredProducts.map((product) => (

       <div
  key={product._id}
  style={{
    display: "grid",
    gridTemplateColumns: "40px 120px 2fr 1fr 1fr 1.3fr 0.5fr 1fr 1fr 1fr 1fr 1fr",
    alignItems: "center",
    padding: "14px 10px",
    borderBottom: "1px solid #f1f5f9",
    background: "#ffff",
    transition: "background 0.15s ease",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.background = "#c9cbcd")}
  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
>


<div style={{ textAlign: "center" }}>
  <input
    type="checkbox"
    checked={isProductSelected(product._id)}
    onChange={() => toggleSelectProduct(product._id)}
  />
</div>

          


        <div>
  {product.image && (
    <img
      src={`http://localhost:5000${product.image}`}
      alt=""
      style={{ width: 80, display: "block", marginBottom: 6 }}
    />
  )}
</div>




          <div>
            <strong>{product.name}</strong>

            

            {editingVariant &&
              editingProduct &&
              editingProduct._id === product._id && (
               
<div
  style={{
    marginTop: 10,
    padding: 15,
    border: "1px solid #ccc",
    background: "#fafafa",
    maxWidth: "260px",      // ⭐ LIMIT WIDTH
  }}
>


<div style={{ textAlign: "center" }}>
  <input
    type="checkbox"
    checked={isProductSelected(product._id)}
    onChange={() => toggleSelectProduct(product._id)}
  />
</div>


{/* IMAGE SECTION */}
{editingProduct.image && (
  <div style={{ position: "relative", width: "80px" }}>
    <img
      src={`http://localhost:5000${editingProduct.image}`}
      alt="product"
      style={{
        width: "80px",
        height: "80px",
        objectFit: "cover",
        borderRadius: "6px",
        marginBottom: "8px",
        display: "block",
        opacity: isUploading ? 0.5 : 1,
        transition: "opacity 0.3s",
      }}
    />

    {isUploading && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.25)",
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            border: "2px solid white",
            borderTop: "2px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    )}
  </div>
)}



{/* Image upload row */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "10px",
  }}
>
  <input
    type="file"
    onChange={(e) => setNewImageFile(e.target.files[0])}
    style={{
      fontSize: "12px",
      flex: 1,
    }}
  />

  {/* Remove image button */}
  
  <button
    onClick={() => handleRemoveImage(editingProduct._id)}
    title="Remove image"
    style={{
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    border: "1px solid #dc2626",
    background: "#fee2e2",
    color: "#dc2626",
    cursor: "pointer",
  }}

>
  🗑️
  </button>
</div>




                  <h4>Edit Product</h4>

                  <input value={editingVariant.name} disabled />
                  <input
                    type="number"
                    value={editingVariant.price}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        price: Number(e.target.value),
                      })
                    }
                  />
                  <input
                    type="number"
                    value={editingVariant.stock}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        stock: Number(e.target.value),
                      })
                    }
                  />

                  
<div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  }}
>
  {/* SAVE */}
  <button
  onClick={async () => {
    await handleSaveVariant();                // save price & stock
    await handleUpdateImage(editingProduct._id); // save image
  }}
  style={{
    background: "#22c55e",
    color: "white",
    padding: "6px 14px",
    borderRadius: "6px",
    border: "none",
    fontSize: "14px",
    cursor: isUploading ? "not-allowed" : "pointer",
    opacity: isUploading ? 0.6 : 1,
  }}
>
  {isUploading ? "Uploading..." : "Save"}
</button>


  {/* CANCEL */}
  <button
    onClick={() => {
      
      setEditingProduct(null);
      setEditingVariant(null);
    }}
    style={{
      background: "#bbf7d0",       // light green
      color: "#166534",
      padding: "6px 14px",
      borderRadius: "6px",
      border: "none",
      fontSize: "14px",
      cursor: "pointer",
    }}
  >
    Cancel
  </button>
</div>



                </div>
              )}
          </div>

          <div style={{ textAlign: "center" }}>
  {product.category}
</div>

          <div style={{ fontWeight: "bold", textAlign: "center" }}>
  {product.variants.length}
</div>

<div style={{ textAlign: "center", fontWeight: "bold", color: getMovement(product).color }}>
  {getMovement(product).label}
</div>




          <div style={{ textAlign: "center", fontWeight: "bold" }}>
  ₹{product.variants[0]?.price ?? "-"}
</div>

          
          <div style={{ textAlign: "center", fontWeight: "bold" }}>
  {product.variants.reduce(
    (sum, v) => sum + (v.stock ?? 0),
    0
  )}
</div>


<div style={{ fontWeight: "bold", textAlign: "center" }}>
  ₹
  {product.variants.reduce(
    (sum, v) => sum + (v.price * (v.stock ?? 0)),
    0
  )}
</div>




<div style={{ textAlign: "center" }}>

  {(() => {

if (product.isActive === false) {
  return (
    <span style={{ color: "#1069e5", fontWeight: "bold" }}>
      Inactive
    </span>
  );
}


    const totalStock = product.variants.reduce(
      (sum, v) => sum + (v.stock ?? 0),
      0
    );



    if (totalStock === 0) {
      return (
        <span style={{ color: "red", fontWeight: "bold" }}>
          Out of Stock
        </span>
      );
    }

    if (totalStock <= 10) {
      return (
        <span style={{ color: "orange", fontWeight: "bold" }}>
          Low Stock
        </span>
      );
    }

    return (
      <span style={{ color: "green", fontWeight: "bold" }}>
        Active
      </span>
    );
  })()}
</div>



{/* ✅ LAST UPDATED COLUMN */}
<div style={{ textAlign: "center", fontSize: "13px", color: "#555" }}>
  {getLastUpdatedText(product.updatedAt)}
</div>


<div
  style={{
    display: "flex",
    gap: "6px",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc",
    padding: "4px 6px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  }}
>

  {product.isActive === false ? (
    // 🔄 RESTORE BUTTON (when inactive)
    <button
      onClick={() => handleRestoreProduct(product._id)}
      style={{
        padding: "6px 12px",
        fontSize: "13px",
        borderRadius: "6px",
        border: "1px solid #16a34a",
        background: "#dcfce7",
        color: "#166534",
        cursor: "pointer",
      }}
    >
      Restore
    </button>
  ) : (
    <>
  
<button
  onClick={() => openHistoryModal(product)}
  style={{
    padding: "1px 1px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #64748b",
    background: "#f1f5f9",
    color: "#334155",
    cursor: "pointer",
    height: "25px",
    minWidth: "25px",
  }}
  title="View Stock History"
>
  📊
</button>







      {/* EDIT */}
      <button
        onClick={() => {
          if (editingProduct && editingProduct._id === product._id) {
            setEditingProduct(null);
            setEditingVariant(null);
          } else {
            setEditingProduct(product);
            setEditingVariant(product.variants[0]);
          }
        }}
        style={{
          padding: "1px 1px",
          fontSize: "14px",
          borderRadius: "6px",
          border: "1px solid #2563eb",
          background: "#2563eb",
          color: "white",
          cursor: "pointer",
          height: "25px",
          minWidth: "25px",
        }}
      >
        ✏️
      </button>

      {/* DELETE */}
      <button
        onClick={() => handleDeleteProduct(product._id)}
        style={{
          padding: "1px 1px",
          fontSize: "14px",
          borderRadius: "6px",
          border: "1px solid #dc2626",
          background: "#fee2e2",
          color: "#dc2626",
          cursor: "pointer",
          height: "25px",
          minWidth: "25px",
        }}
      >
        🗑️
      </button>
    </>
  )}
</div>

        </div>
      ))}


{/* ================= STOCK HISTORY MODAL (UI ONLY) ================= */}
{showHistoryModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        background: "#fff",
        width: "420px",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h3 style={{ margin: 0 }}>Stock History</h3>
        <button
          onClick={closeHistoryModal}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          ❌
        </button>
      </div>

      {/* Stock history list */}
{loadingHistory ? (
  <div style={{ textAlign: "center", padding: "20px" }}>
    Loading history...
  </div>
) : stockHistory.length === 0 ? (
  <div
    style={{
      fontSize: "14px",
      color: "#555",
      padding: "12px",
      background: "#f9fafb",
      borderRadius: "6px",
      border: "1px dashed #ccc",
      textAlign: "center",
    }}
  >
    No stock history found.
  </div>
) : (
  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
    {stockHistory.map((log) => (
      <div
        key={log._id}
        style={{
          padding: "10px",
          marginBottom: "8px",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          fontSize: "13px",
          background:
            log.type === "INCREASE" ? "#ecfdf5" : "#fef2f2",
        }}
      >
        <div style={{ fontWeight: "bold" }}>
          {log.type === "INCREASE" ? "➕ Stock Increased" : "➖ Stock Decreased"}
        </div>

       <div>
  Change:
  <strong>
    {log.type === "INCREASE" ? "+" : "-"}
    {log.quantity}
  </strong>
</div>

<div>
  Reason: <strong>{log.reason}</strong>
</div>

{/* ✅ OLD & NEW STOCK */}
{log.oldStock !== undefined && log.newStock !== undefined && (
  <div style={{ marginTop: "4px" }}>
    <div>
      <strong>Old Stock:</strong> {log.oldStock}
    </div>
    <div>
      <strong>New Stock:</strong> {log.newStock}
    </div>
  </div>
)}



        <div style={{ fontSize: "12px", color: "#555" }}>
          {new Date(log.createdAt).toLocaleString()}
        </div>
      </div>
    ))}
  </div>
)}



    </div>
  </div>
)}



    </div>
  );
}



export default Products;
