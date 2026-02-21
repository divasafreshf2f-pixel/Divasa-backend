import React, { useEffect } from "react";

const PackingSlip = () => {
  const storedSlip = localStorage.getItem("packingSlip");
  const order = storedSlip ? JSON.parse(storedSlip) : null;

  useEffect(() => {
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  if (!order) return <p>No order data</p>;

  const itemsSubtotal = order.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const handlingCharge = 0;
  const deliveryCharge = 0;
  const grandTotal = itemsSubtotal + handlingCharge + deliveryCharge;

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: "center" }}>DIVASA FRESH</h2>
      <p style={{ textAlign: "center" }}>Packing Slip</p>

      <hr />

      <p><b>Order ID:</b> {order.orderId}</p>
      <p><b>Order Date:</b> {new Date(order.date).toLocaleDateString()}</p>
      <p><b>Customer:</b> {order.customerName}</p>
      <p><b>Phone:</b> {order.phone}</p>
      <p><b>Address:</b> {order.address}</p>

      <hr />

      <table style={styles.table}>
        <thead>
          <tr>
            <th align="left">Item</th>
            <th align="left">Unit</th>
            <th align="right">Qty</th>
            <th align="right">Rate</th>
            <th align="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i, idx) => (
            <tr key={idx}>
              <td>{i.productName}</td>
              <td>{i.unit || i.variant}</td>
              <td align="right">{i.quantity}</td>
              <td align="right">₹{i.price}</td>
              <td align="right">₹{i.price * i.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      <table style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td>Items Subtotal</td>
            <td align="right">₹{itemsSubtotal}</td>
          </tr>
          <tr>
            <td>Handling Charge</td>
            <td align="right">₹{handlingCharge}</td>
          </tr>
          <tr>
            <td>Delivery Charge</td>
            <td align="right">₹{deliveryCharge}</td>
          </tr>
          <tr style={{ fontWeight: "bold" }}>
            <td>Grand Total</td>
            <td align="right">₹{grandTotal}</td>
          </tr>
        </tbody>
      </table>

      <hr />

      <p><b>Packed By:</b> ____________</p>
      <p><b>Date:</b> ____________</p>
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    maxWidth: 700,
    margin: "auto",
    fontFamily: "Arial",
    fontSize: 13,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};

export default PackingSlip;
