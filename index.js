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

    const cliente = await axios.post(
      `${API_URL}/customers`,
      {
        name: nome,
        cpfCnpj: cpfLimpo,
        email
      },
      {
        headers: {
          access_token: API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const hoje = new Date();
    hoje.setDate(hoje.getDate() + 1);

    const pagamento = await axios.post(
      `${API_URL}/payments`,
      {
        customer: cliente.data.id,
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

    res.json({
      invoiceUrl: pagamento.data.invoiceUrl,
      pixCopiaECola: pagamento.data.pixCopyPaste
    });

  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({ erro: "Erro ao gerar pagamento" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando 🚀");
});