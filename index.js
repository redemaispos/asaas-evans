const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = process.env.ASAAS_API_KEY;
const API_URL = "https://api.asaas.com/v3";

app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

app.post("/criar-pagamento", async (req, res) => {
  try {
    const { nome, cpf, email, valor, curso } = req.body;

    const cpfLimpo = cpf.replace(/\D/g, "");

    // 👇 BLOCO CORRIGIDO — busca cliente se CPF já existir
    let clienteId;

    try {
      const cliente = await axios.post(
        `${API_URL}/customers`,
        { name: nome, cpfCnpj: cpfLimpo, email },
        { headers: { access_token: API_KEY, "Content-Type": "application/json" } }
      );
      clienteId = cliente.data.id;
    } catch (errCliente) {
      if (errCliente.response?.status === 400) {
        const busca = await axios.get(
          `${API_URL}/customers?cpfCnpj=${cpfLimpo}`,
          { headers: { access_token: API_KEY } }
        );
        clienteId = busca.data.data[0]?.id;

if (!clienteId) {
  throw new Error("Cliente não encontrado no Asaas");
}
      } else {
        throw errCliente;
      }
    }

    const hoje = new Date();
    hoje.setDate(hoje.getDate() + 1);

  const pagamento = await axios.post(
  `${API_URL}/payments`,
  {
    customer: clienteId,
    billingType: "PIX",
    value: Number(valor),
    dueDate: hoje.toISOString().split("T")[0],
    description: curso
  },
  {
    headers: {
      access_token: API_KEY,
      "Content-Type": "application/json"
    }
  }
);
console.log("PAGAMENTO CRIADO:", JSON.stringify(pagamento.data, null, 2));
// BUSCA O PIX GERADO
const pix = await axios.get(
  `${API_URL}/payments/${pagamento.data.id}/pixQrCode`,
  {
    headers: {
      access_token: API_KEY
    }
  }
);

res.json({
  invoiceUrl: pagamento.data.invoiceUrl,
  pixCopiaECola: pix.data.payload,
  qrCode: pix.data.encodedImage
});

  } catch (err) {

    console.log("ERRO ASAAS:");
    console.log(err.response?.data || err.message);

    res.status(500).json({
      erro: err.response?.data || err.message
    });
  }
}); // ← FECHAMENTO DO app.post

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando 🚀 na porta " + PORT);
});