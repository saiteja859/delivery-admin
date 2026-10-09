import {
  Package,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Eye,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/products"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load products"
        );
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error("Products loading error:", error);

      setError(
        error.message || "Unable to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const categories = useMemo(() => {
    return [
      "ALL",
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.productName
          ?.toLowerCase()
          .includes(search) ||
        product.sku
          ?.toLowerCase()
          .includes(search) ||
        product.category
          ?.toLowerCase()
          .includes(search) ||
        product.supplier
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        product.status === statusFilter;

      const matchesCategory =
        categoryFilter === "ALL" ||
        product.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    products,
    searchTerm,
    statusFilter,
    categoryFilter,
  ]);

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.status === "ACTIVE"
  ).length;

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.stockQuantity) > 0 &&
      Number(product.stockQuantity) <= 5
  ).length;

  const outOfStockProducts = products.filter(
    (product) =>
      Number(product.stockQuantity) <= 0
  ).length;

  if (loading) {
    return (
      <div className="products-page">
        <div className="products-loading">
          <RefreshCw
            size={30}
            className="products-loading-icon"
          />
          <strong>Loading products...</strong>
          <span>
            Fetching product information from the
            server.
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="products-error">
          <AlertTriangle size={34} />

          <strong>
            Unable to load products
          </strong>

          <span>{error}</span>

          <button
            type="button"
            onClick={fetchProducts}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <div>
          <p className="products-eyebrow">
            CATALOG MANAGEMENT
          </p>

          <h2>Products</h2>

          <p className="products-subtitle">
            Manage your store catalog, pricing,
            inventory and product availability.
          </p>
        </div>

        <button
          type="button"
          className="add-product-button"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="products-summary-grid">
        <div className="product-summary-card">
          <div className="product-summary-icon">
            <Package size={20} />
          </div>

          <div>
            <span>Total Products</span>
            <strong>{totalProducts}</strong>
          </div>
        </div>

        <div className="product-summary-card">
          <div className="product-summary-icon">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Active Products</span>
            <strong>{activeProducts}</strong>
          </div>
        </div>

        <div className="product-summary-card">
          <div className="product-summary-icon">
            <AlertTriangle size={20} />
          </div>

          <div>
            <span>Low Stock</span>
            <strong>{lowStockProducts}</strong>
          </div>
        </div>

        <div className="product-summary-card">
          <div className="product-summary-icon">
            <Package size={20} />
          </div>

          <div>
            <span>Out of Stock</span>
            <strong>{outOfStockProducts}</strong>
          </div>
        </div>
      </div>

      <div className="products-toolbar">
        <div className="products-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search products, SKU or category..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="products-filter">
          <Filter size={17} />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">
              Inactive
            </option>
          </select>
        </div>

        <div className="products-filter">
          <Package size={17} />

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
          >
            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category === "ALL"
                  ? "All Categories"
                  : category}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="refresh-products-button"
          onClick={fetchProducts}
          title="Refresh products"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      <div className="products-table-card">
        <div className="products-table-header">
          <div>
            <span>PRODUCT CATALOG</span>
            <strong>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}
            </strong>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="products-empty">
            <Package size={38} />

            <strong>
              No products found
            </strong>

            <span>
              Try changing your search or filters.
            </span>
          </div>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>SKU</th>
                  <th>CATEGORY</th>
                  <th>PRICE</th>
                  <th>STOCK</th>
                  <th>SUPPLIER</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const stock =
                    Number(
                      product.stockQuantity
                    ) || 0;

                  const stockClass =
                    stock <= 0
                      ? "stock-out"
                      : stock <= 5
                        ? "stock-low"
                        : "stock-good";

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="product-name-cell">
                          <div className="product-image">
                            {product.imageUrl ? (
                              <img
                                src={
                                  product.imageUrl
                                }
                                alt={
                                  product.productName
                                }
                              />
                            ) : (
                              <Package size={21} />
                            )}
                          </div>

                          <div>
                            <strong>
                              {
                                product.productName
                              }
                            </strong>

                            <span>
                              Product #
                              {product.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="sku-badge">
                          {product.sku}
                        </span>
                      </td>

                      <td>
                        {product.category ||
                          "Uncategorized"}
                      </td>

                      <td>
                        <strong className="product-price">
                          <IndianRupee
                            size={14}
                          />
                          {formatAmount(
                            product.price
                          ).replace("₹", "")}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`stock-badge ${stockClass}`}
                        >
                          {stock}
                        </span>
                      </td>

                      <td>
                        {product.supplier ||
                          "Not assigned"}
                      </td>

                      <td>
                        <span
                          className={
                            product.status ===
                            "ACTIVE"
                              ? "product-status active"
                              : "product-status inactive"
                          }
                        >
                          <span />
                          {formatStatus(
                            product.status
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="product-actions">
                          <button
                            type="button"
                            title="View product"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            title="Edit product"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            title="Delete product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;