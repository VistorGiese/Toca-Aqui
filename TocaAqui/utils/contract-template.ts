import type { ContractTemplateData } from "@/types/contractPdf";

const CONTRACT_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #111; line-height: 1.45; margin: 28px; }
    h1 { font-size: 16px; text-align: center; margin-bottom: 4px; }
    h2 { font-size: 12px; margin-top: 18px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
    .subtitle { text-align: center; font-size: 10px; color: #444; margin-bottom: 18px; }
    .intro { font-size: 10px; background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 12px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #efefef; width: 38%; font-weight: 600; }
    .clause { margin: 8px 0; }
    .signatures { margin-top: 28px; }
    .footer { margin-top: 24px; font-size: 9px; color: #666; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>TOCA AQUI — Mini-Contrato de Prestação de Serviços Artísticos</h1>
  <div class="subtitle">Marketplace de Shows ao Vivo · Ref. {{refContrato}} · Gerado em {{dataGeracao}}</div>
  <div class="intro">
    Este instrumento é gerado pela plataforma <strong>Toca Aqui</strong> nos termos do Código Civil Brasileiro (Lei 10.406/2002)
    e da Lei de Direitos Autorais (Lei 9.610/1998). As partes declaram ter lido e concordado com as cláusulas abaixo.
  </div>

  <h2>1. Qualificação das Partes</h2>
  <table>
    <tr><th>CONTRATANTE</th><td>{{nomeContratante}}</td></tr>
    <tr><th>CPF / CNPJ</th><td>{{documentoContratante}}</td></tr>
    <tr><th>Telefone</th><td>{{telefoneContratante}}</td></tr>
    <tr><th>Endereço do evento</th><td>{{enderecoContratante}}</td></tr>
    <tr><th>CONTRATADO</th><td>{{nomeContratado}}</td></tr>
    <tr><th>CPF / CNPJ</th><td>{{documentoContratado}}</td></tr>
    <tr><th>Telefone / WhatsApp</th><td>{{telefoneContratado}}</td></tr>
  </table>

  <h2>2. Objeto do Contrato</h2>
  <table>
    <tr><th>Evento</th><td>{{tituloEvento}}</td></tr>
    <tr><th>Data</th><td>{{dataEvento}}</td></tr>
    <tr><th>Horário início / fim</th><td>{{horarioInicio}} — {{horarioFim}}</td></tr>
    <tr><th>Duração (min)</th><td>{{duracaoMinutos}}</td></tr>
    <tr><th>Gênero musical</th><td>{{generoMusical}}</td></tr>
    <tr><th>Local do show</th><td>{{localEvento}}</td></tr>
  </table>

  <h2>3. Cachê e Pagamento</h2>
  <table>
    <tr><th>Valor total do cachê (R$)</th><td>{{cacheTotal}}</td></tr>
    <tr><th>Forma de pagamento</th><td>{{metodoPagamento}}</td></tr>
    <tr><th>Percentual de sinal (%)</th><td>{{percentualSinal}}</td></tr>
    <tr><th>Valor do sinal (R$)</th><td>{{valorSinal}}</td></tr>
  </table>
  <div class="clause">Cláusula 3.2 — É vedado solicitar desconto ou redução do valor após a prestação do serviço.</div>

  <h2>4. Obrigações das Partes</h2>
  <div class="clause"><strong>Contratante:</strong> providenciar local adequado, pagar o cachê no prazo, garantir segurança e comunicar alterações com 72h de antecedência.</div>
  <div class="clause"><strong>Contratado:</strong> comparecer com 60 min de antecedência, cumprir duração acordada e manter conduta profissional.</div>

  <h2>5. Cancelamento e Penalidades</h2>
  <table>
    <tr><th>Mais de 72h (contratante)</th><td>{{penalidade72h}}% do cachê</td></tr>
    <tr><th>Entre 24h e 72h</th><td>{{penalidade24_72h}}% do cachê</td></tr>
    <tr><th>Menos de 24h</th><td>{{penalidade24h}}% do cachê</td></tr>
  </table>

  <h2>6. Direitos Autorais e Imagem</h2>
  <div class="clause">O contratante pode registrar a apresentação para divulgação institucional, vedado uso comercial sem autorização do contratado.</div>

  <div class="signatures">
    <h2>7. Assinaturas</h2>
    <table>
      <tr><th>CONTRATANTE</th><th>CONTRATADO</th></tr>
      <tr><td style="height:60px;">&nbsp;</td><td style="height:60px;">&nbsp;</td></tr>
      <tr><td>{{nomeContratante}}</td><td>{{nomeContratado}}</td></tr>
    </table>
  </div>

  <div class="footer">Toca Aqui — Marketplace de Shows ao Vivo · contato@tocaaqui.app.br</div>
</body>
</html>`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fillPlaceholder(template: string, key: string, value: string): string {
  return template.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), escapeHtml(value));
}

export function fillContractTemplate(data: ContractTemplateData): string {
  let html = CONTRACT_TEMPLATE;
  (Object.keys(data) as (keyof ContractTemplateData)[]).forEach((key) => {
    html = fillPlaceholder(html, key, String(data[key] ?? "—"));
  });
  return html;
}
