import {
  Store,
  Package,
  User,
  MapPin,
  Phone,
  CheckCircle2,
  Truck,
  ArrowRight,
  Clock,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./SupplierAcceptance.css";

const order = {
  id: "SAG-10283",

  customer: {
    name: "Priya Reddy",
    phone: "+91 99887 12345",
    address: "Madhapur, Hyderabad, Telangana",
  },

  product: {
    name: "Smart Watch Pro",
    sku: "SAG-SW-002",
    quantity: 1,
  },

  supplier: {
    name: "Digital Hub",
    phone: "+91 99887 66554",
    address: "Electronic City, Bengaluru, Karnataka",
  },

  amount: 4299,
  payment: "Paid",
};

function SupplierAcceptance() {
  const navigate = useNavigate();

  const acceptOrder = () => {
    const acceptedOrder = {
      id: order.id,

      customer: order.customer.name,
      phone: order.customer.phone,
      address: order.customer.address,

      product: order.product.name,
      sku: order.product.sku,
      quantity: order.product.quantity,

      supplier: order.supplier.name,
      supplierPhone: order.supplier.phone,
      supplierAddress: order.supplier.address,

      amount: order.amount,
      payment: order.payment,

      supplierStatus: "Accepted",
      deliveryStatus: "Ready for Pickup",

      acceptedAt: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    localStorage.setItem(
      "activeDeliveryOrder",
      JSON.stringify(acceptedOrder)
    );

    navigate("/delivery/dashboard", {
      state: {
        order: acceptedOrder,
      },
    });
  };

  return (
    <div className="supplier-acceptance-page">
      <header className="supplier-acceptance-header">
        <div className="supplier-brand">
          <div className="supplier-brand-icon">
            <Store size={21} />
          </div>

          <div>
            <strong>Shop All Goods</strong>
            <span>Supplier Portal</span>
          </div>
        </div>

        <div className="supplier-header-status">
          <span></span>
          Supplier Account Active
        </div>
      </header>

      <main className="supplier-acceptance-content">
        <section className="supplier-acceptance-intro">
          <div>
            <span>SUPPLIER OPERATIONS</span>

            <h1>
              New Order
              <strong> Received</strong>
            </h1>

            <p>
              Review the order details and accept the order
              to notify the delivery partner.
            </p>
          </div>

          <div className="supplier-intro-icon">
            <Package size={36} />
          </div>
        </section>

        <section className="supplier-order-card">
          <div className="supplier-order-heading">
            <div>
              <span>ORDER DETAILS</span>
              <h2>{order.id}</h2>
            </div>

            <div className="supplier-pending-badge">
              <Clock size={15} />
              Pending Acceptance
            </div>
          </div>

          <div className="supplier-order-grid">
            <div className="supplier-info-card">
              <div className="supplier-info-icon blue">
                <User size={19} />
              </div>

              <div>
                <span>CUSTOMER</span>
                <strong>{order.customer.name}</strong>

                <p>
                  <Phone size={14} />
                  {order.customer.phone}
                </p>

                <p>
                  <MapPin size={14} />
                  {order.customer.address}
                </p>
              </div>
            </div>

            <div className="supplier-info-card">
              <div className="supplier-info-icon purple">
                <Store size={19} />
              </div>

              <div>
                <span>SUPPLIER</span>
                <strong>{order.supplier.name}</strong>

                <p>
                  <Phone size={14} />
                  {order.supplier.phone}
                </p>

                <p>
                  <MapPin size={14} />
                  {order.supplier.address}
                </p>
              </div>
            </div>
          </div>

          <div className="supplier-product-card">
            <div className="supplier-product-icon">
              <Package size={24} />
            </div>

            <div className="supplier-product-main">
              <span>PRODUCT</span>
              <h3>{order.product.name}</h3>
              <p>SKU: {order.product.sku}</p>
            </div>

            <div className="supplier-product-value">
              <span>QUANTITY</span>
              <strong>× {order.product.quantity}</strong>
            </div>

            <div className="supplier-product-value">
              <span>ORDER VALUE</span>

              <strong>
                ₹{order.amount.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          <div className="supplier-order-footer">
            <div className="supplier-payment">
              <span>PAYMENT STATUS</span>

              <strong>
                <CheckCircle2 size={16} />
                {order.payment}
              </strong>
            </div>

            <div className="supplier-delivery-flow">
              <div className="supplier-flow-step active">
                <div>
                  <CheckCircle2 size={16} />
                </div>

                Order Received
              </div>

              <div className="supplier-flow-line"></div>

              <div className="supplier-flow-step">
                <div>
                  <Truck size={16} />
                </div>

                Delivery Partner
              </div>
            </div>

            <button
              type="button"
              className="supplier-accept-button"
              onClick={acceptOrder}
            >
              <CheckCircle2 size={17} />
              Accept Order
              <ArrowRight size={17} />
            </button>
          </div>
        </section>

        <div className="supplier-notification">
          <Truck size={19} />

          <div>
            <strong>What happens after acceptance?</strong>

            <p>
              The order will immediately appear in the
              Delivery Portal as ready for pickup.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SupplierAcceptance;