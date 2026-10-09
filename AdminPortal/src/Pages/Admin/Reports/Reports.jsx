import { useMemo, useState } from "react";

import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  IndianRupee,
  Users,
  Package,
  Download,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import "./Reports.css";


function Reports() {

  const [period, setPeriod] = useState("This Month");

  const salesData = {
    "This Week": [
      { day: "Mon", sales: 18400, orders: 38 },
      { day: "Tue", sales: 22600, orders: 46 },
      { day: "Wed", sales: 19800, orders: 41 },
      { day: "Thu", sales: 28400, orders: 58 },
      { day: "Fri", sales: 31200, orders: 64 },
      { day: "Sat", sales: 35600, orders: 72 },
      { day: "Sun", sales: 29800, orders: 61 },
    ],

    "This Month": [
      { day: "Week 1", sales: 128400, orders: 248 },
      { day: "Week 2", sales: 146800, orders: 286 },
      { day: "Week 3", sales: 158600, orders: 312 },
      { day: "Week 4", sales: 182400, orders: 438 },
    ],

    "Last Month": [
      { day: "Week 1", sales: 104200, orders: 214 },
      { day: "Week 2", sales: 118600, orders: 238 },
      { day: "Week 3", sales: 132400, orders: 264 },
      { day: "Week 4", sales: 149800, orders: 302 },
    ],
  };


  const categoryData = [
    {
      name: "Electronics",
      sales: 284600,
      percentage: 34,
    },
    {
      name: "Fashion",
      sales: 176400,
      percentage: 21,
    },
    {
      name: "Footwear",
      sales: 142800,
      percentage: 17,
    },
    {
      name: "Home & Kitchen",
      sales: 117600,
      percentage: 14,
    },
    {
      name: "Bags",
      sales: 92300,
      percentage: 11,
    },
    {
      name: "Other",
      sales: 25400,
      percentage: 3,
    },
  ];


  const topProducts = [
    {
      name: "Wireless Headphones",
      category: "Electronics",
      sales: 428,
      revenue: 1069572,
    },
    {
      name: "Smart Watch Pro",
      category: "Electronics",
      sales: 316,
      revenue: 1359684,
    },
    {
      name: "Running Shoes",
      category: "Footwear",
      sales: 267,
      revenue: 506583,
    },
    {
      name: "Bluetooth Speaker",
      category: "Electronics",
      sales: 198,
      revenue: 257202,
    },
    {
      name: "Laptop Backpack",
      category: "Bags",
      sales: 143,
      revenue: 128557,
    },
  ];


  const currentData = useMemo(() => {
    return salesData[period];
  }, [period]);


  const maxSales = Math.max(
    ...currentData.map((item) => item.sales)
  );


  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };


  const handleExport = () => {
    alert(
      "Report export is a frontend demo. Backend/download functionality can be connected later."
    );
  };


  return (
    <div className="reports-page">

      {/* =================================
          PAGE HEADER
      ================================= */}

      <div className="reports-header">

        <div className="reports-title-area">

          <div className="reports-eyebrow">
            <BarChart3 size={15} />
            <span>BUSINESS INTELLIGENCE</span>
          </div>

          <h2>Reports & Analytics</h2>

          <p>
            Understand your store performance,
            sales trends and customer activity.
          </p>

        </div>


        <div className="reports-header-actions">

          <div className="period-selector">

            <CalendarDays size={16} />

            <select
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value)
              }
            >

              <option>This Week</option>

              <option>This Month</option>

              <option>Last Month</option>

            </select>

          </div>


          <button
            className="export-report-button"
            onClick={handleExport}
          >

            <Download size={17} />

            <span>Export Report</span>

          </button>

        </div>

      </div>


      {/* =================================
          SUMMARY CARDS
      ================================= */}

      <div className="reports-summary-grid">

        <div className="report-summary-card">

          <div className="report-summary-icon blue">
            <IndianRupee size={21} />
          </div>

          <div className="report-summary-content">

            <span>Total Revenue</span>

            <strong>₹8,42,650</strong>

            <small className="positive">
              <ArrowUpRight size={13} />
              12.8% from last month
            </small>

          </div>

        </div>


        <div className="report-summary-card">

          <div className="report-summary-icon purple">
            <ShoppingCart size={21} />
          </div>

          <div className="report-summary-content">

            <span>Total Orders</span>

            <strong>1,284</strong>

            <small className="positive">
              <ArrowUpRight size={13} />
              8.4% from last month
            </small>

          </div>

        </div>


        <div className="report-summary-card">

          <div className="report-summary-icon mint">
            <Users size={21} />
          </div>

          <div className="report-summary-content">

            <span>New Customers</span>

            <strong>486</strong>

            <small className="positive">
              <ArrowUpRight size={13} />
              15.2% from last month
            </small>

          </div>

        </div>


        <div className="report-summary-card">

          <div className="report-summary-icon orange">
            <Package size={21} />
          </div>

          <div className="report-summary-content">

            <span>Products Sold</span>

            <strong>2,847</strong>

            <small className="negative">
              <ArrowDownRight size={13} />
              3.2% from last month
            </small>

          </div>

        </div>

      </div>


      {/* =================================
          SALES OVERVIEW
      ================================= */}

      <section className="report-panel sales-panel">

        <div className="panel-heading">

          <div>

            <span className="panel-label">
              REVENUE PERFORMANCE
            </span>

            <h3>Sales Overview</h3>

          </div>


          <div className="sales-legend">

            <span>
              <i className="legend-dot sales-dot"></i>
              Revenue
            </span>

            <span>
              <i className="legend-dot orders-dot"></i>
              Orders
            </span>

          </div>

        </div>


        <div className="sales-chart">

          <div className="chart-y-axis">

            <span>₹2L</span>
            <span>₹1.5L</span>
            <span>₹1L</span>
            <span>₹50K</span>
            <span>₹0</span>

          </div>


          <div className="chart-area">

            <div className="chart-grid-lines">

              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>

            </div>


            <div className="chart-bars">

              {currentData.map((item, index) => {

                const height =
                  (item.sales / maxSales) * 100;

                return (
                  <div
                    className="chart-column"
                    key={item.day}
                  >

                    <div className="chart-value">
                      {formatCurrency(item.sales)}
                    </div>

                    <div className="bar-track">

                      <div
                        className="sales-bar"
                        style={{
                          height: `${height}%`,
                          animationDelay: `${index * 0.08}s`,
                        }}
                      />

                    </div>

                    <span className="chart-label">
                      {item.day}
                    </span>

                    <small>
                      {item.orders} orders
                    </small>

                  </div>
                );

              })}

            </div>

          </div>

        </div>

      </section>


      {/* =================================
          LOWER REPORT GRID
      ================================= */}

      <div className="reports-lower-grid">


        {/* CATEGORY SALES */}

        <section className="report-panel category-panel">

          <div className="panel-heading">

            <div>

              <span className="panel-label">
                CATEGORY PERFORMANCE
              </span>

              <h3>Sales by Category</h3>

            </div>

          </div>


          <div className="category-list">

            {categoryData.map((category) => (

              <div
                className="category-row"
                key={category.name}
              >

                <div className="category-info">

                  <div className="category-name">

                    <span className="category-dot"></span>

                    <strong>
                      {category.name}
                    </strong>

                  </div>

                  <span>
                    {category.percentage}%
                  </span>

                </div>


                <div className="category-progress">

                  <div
                    className="category-progress-fill"
                    style={{
                      width: `${category.percentage}%`,
                    }}
                  />

                </div>


                <strong className="category-sales">
                  {formatCurrency(category.sales)}
                </strong>

              </div>

            ))}

          </div>

        </section>


        {/* QUICK METRICS */}

        <section className="report-panel metrics-panel">

          <div className="panel-heading">

            <div>

              <span className="panel-label">
                STORE HEALTH
              </span>

              <h3>Key Metrics</h3>

            </div>

          </div>


          <div className="metrics-list">

            <div className="metric-item">

              <div className="metric-icon">
                <TrendingUp size={17} />
              </div>

              <div>

                <span>Average Order Value</span>

                <strong>₹2,486</strong>

              </div>

              <small className="metric-positive">
                +6.8%
              </small>

            </div>


            <div className="metric-item">

              <div className="metric-icon">
                <Users size={17} />
              </div>

              <div>

                <span>Customer Retention</span>

                <strong>78.4%</strong>

              </div>

              <small className="metric-positive">
                +4.2%
              </small>

            </div>


            <div className="metric-item">

              <div className="metric-icon">
                <ShoppingCart size={17} />
              </div>

              <div>

                <span>Conversion Rate</span>

                <strong>6.82%</strong>

              </div>

              <small className="metric-positive">
                +1.4%
              </small>

            </div>


            <div className="metric-item">

              <div className="metric-icon">
                <Package size={17} />
              </div>

              <div>

                <span>Return Rate</span>

                <strong>2.8%</strong>

              </div>

              <small className="metric-negative">
                -0.6%
              </small>

            </div>

          </div>

        </section>

      </div>


      {/* =================================
          TOP PRODUCTS
      ================================= */}

      <section className="report-panel products-report-panel">

        <div className="panel-heading">

          <div>

            <span className="panel-label">
              PRODUCT PERFORMANCE
            </span>

            <h3>Top Performing Products</h3>

          </div>


          <span className="products-period">
            {period}
          </span>

        </div>


        <div className="top-products-table">

          <div className="top-products-header">

            <span>PRODUCT</span>
            <span>CATEGORY</span>
            <span>UNITS SOLD</span>
            <span>REVENUE</span>

          </div>


          {topProducts.map((product, index) => (

            <div
              className="top-product-row"
              key={product.name}
            >

              <div className="product-report-name">

                <div className="product-rank">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div>

                  <strong>
                    {product.name}
                  </strong>

                  <span>
                    Product #{index + 1}
                  </span>

                </div>

              </div>


              <span className="product-category">
                {product.category}
              </span>


              <strong className="product-units">
                {product.sales}
              </strong>


              <strong className="product-revenue">
                {formatCurrency(product.revenue)}
              </strong>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}


export default Reports;