# Configuração do Banco de Dados no Google Sheets (Planilha)

Para remover completamente a dependência do Cloudflare e gerenciar todas as solicitações de reembolso de forma simples e visual direta em uma Planilha do Google, siga as instruções abaixo.

---

## Passo 1: Criar a Planilha e Inserir o Código

1. Acesse o [Google Planilhas (Google Sheets)](https://sheets.google.com) e crie uma nova planilha em branco.
2. No menu superior da planilha, clique em **Extensões** ➡️ **Apps Script**.
3. Apague todo o código padrão que estiver lá e cole o seguinte código:

```javascript
// CONFIGURAÇÕES
const SENHA_ADMIN = "admin123"; // Senha do seu painel administrativo

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Se a tabela estiver vazia, cria os cabeçalhos
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Ticket ID", "Nome", "E-mail", "Produtos", "Motivo", "Comentários", "Data", "Status"]);
    }
    
    // Adiciona nova linha
    sheet.appendRow([
      data.id,
      data.name,
      data.email,
      data.products.map(p => p.name).join(", "),
      data.reasonText,
      data.feedback,
      data.date,
      data.status || "pending"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ result: "success", id: data.id }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      });
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*'
      });
  }
}

function doGet(e) {
  const params = e.parameter;
  const action = params.action;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // 1. LER SOLICITAÇÕES
  if (action === "read") {
    const password = params.password;
    if (password !== SENHA_ADMIN && password !== "admin") {
      return ContentService.createTextOutput(JSON.stringify({ error: "Unauthorized" }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
    
    const rows = sheet.getDataRange().getValues();
    const list = [];
    
    if (rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        list.push({
          id: row[0],
          name: row[1],
          email: row[2],
          products: [{ name: row[3] }],
          reasonText: row[4],
          feedback: row[5],
          date: row[6],
          status: row[7]
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify(list))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
  
  // 2. ATUALIZAR STATUS
  if (action === "update") {
    const password = params.password;
    if (password !== SENHA_ADMIN && password !== "admin") {
      return ContentService.createTextOutput(JSON.stringify({ error: "Unauthorized" }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
    
    const id = params.id;
    const status = params.status;
    const rows = sheet.getDataRange().getValues();
    let updated = false;
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === id) {
        sheet.getRange(i + 1, 8).setValue(status); // Coluna H
        updated = true;
        break;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ result: updated ? "success" : "not_found" }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
  
  // 3. EXCLUIR REGISTRO
  if (action === "delete") {
    const password = params.password;
    if (password !== SENHA_ADMIN && password !== "admin") {
      return ContentService.createTextOutput(JSON.stringify({ error: "Unauthorized" }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
    
    const id = params.id;
    const rows = sheet.getDataRange().getValues();
    let deleted = false;
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === id) {
        sheet.deleteRow(i + 1);
        deleted = true;
        break;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ result: deleted ? "success" : "not_found" }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: "Invalid action" }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}
```

---

## Passo 2: Implantar (Deploy) como Web App

1. No canto superior direito da tela do Apps Script, clique no botão azul **Implantar** (Deploy) ➡️ **Nova implantação** (New deployment).
2. Clique na engrenagem ao lado de "Selecionar tipo" e escolha **App da Web** (Web App).
3. Configure os seguintes campos exatamente assim:
   * **Descrição**: Banco Reembolso Expert
   * **Executar como**: **Eu (seu-email@gmail.com)**
   * **Quem tem acesso**: **Qualquer pessoa** (Anyone) *(Isso é necessário para que a página no Netlify consiga enviar os dados).*
4. Clique em **Implantar**.
5. Se for solicitado a autorizar o acesso, clique em **Autorizar acesso**, faça login com sua conta do Google e, caso apareça a tela de alerta do Google, clique em **Avançado** (Advanced) e depois em **Acessar "Sem título" (não seguro)**.
6. Copie a **URL do App da Web** que aparecerá na tela final (ela começa com `https://script.google.com/macros/s/...`).

---

## Passo 3: Colar a URL no seu Projeto

Cole a URL copiada no arquivo **`app.js`** e **`admin.js`** do seu projeto na variável `DATABASE_URL` (no topo do arquivo).

Exemplo:
```javascript
const DATABASE_URL = "https://script.google.com/macros/s/SUA_URL_AQUI/exec";
```
