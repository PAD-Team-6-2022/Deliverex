import * as deliverex from "./";

(async () => {
  const client = new deliverex.Client({
    token: "TOKEN",
    host: "http://localhost:3000",
  });

  const orders = await client.getOrders({
    status: "SORTING",
    limit: 60,
    offset: 20,
  });

  console.log(orders);
})();
