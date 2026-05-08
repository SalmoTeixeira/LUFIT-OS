#!/usr/bin/env node
/**
 * LUFIT OS — Railway Deploy Script
 * Aciona deploy via Railway API GraphQL
 */

const RAILWAY_API_TOKEN = process.env.RAILWAY_API_TOKEN;
const SERVICE_ID = process.env.RAILWAY_SERVICE_ID || "3878e309-8d6e-4b17-af6a-b78c730412ec";
const PROJECT_ID = process.env.RAILWAY_PROJECT_ID || "350d9bef-e92b-4fbd-a3e9-7e26bc24a462";
const ENV_ID = process.env.RAILWAY_ENV_ID || "d06fd2b5-7caa-41fe-bcaf-b7ba68d515ac";

const RAILWAY_GQL_ENDPOINT = "https://backboard.railway.app/graphql/v2";

async function railwayRequest(query: string, variables: Record<string, unknown>) {
  const res = await fetch(RAILWAY_GQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RAILWAY_API_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

async function deploy() {
  if (!RAILWAY_API_TOKEN) {
    console.error("❌ RAILWAY_API_TOKEN não definido!");
    process.exit(1);
  }

  console.log("🚀 Acionando deploy do LUFIT OS...");

  // Trigger deploy
  const result = await railwayRequest(
    `mutation ServiceInstanceDeploy($serviceId: String!, $environmentId: String!) {
      serviceInstanceDeploy(serviceId: $serviceId, environmentId: $environmentId)
    }`,
    { serviceId: SERVICE_ID, environmentId: ENV_ID }
  );

  if (result.errors) {
    console.error("❌ Erro no deploy:", JSON.stringify(result.errors, null, 2));
    process.exit(1);
  }

  console.log("✅ Deploy acionado com sucesso!");
  console.log("🌐 Acesse: https://lufit-os-production-23e6.up.railway.app");

  // Aguardar e verificar status
  console.log("⏳ Aguardando 30 segundos para verificar status...");
  await new Promise((r) => setTimeout(r, 30000));

  const healthRes = await fetch("https://lufit-os-production-23e6.up.railway.app/api/health");
  const health = await healthRes.json().catch(() => ({}));
  console.log("📡 Health check:", JSON.stringify(health));
}

deploy().catch(console.error);
