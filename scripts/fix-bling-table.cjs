const mysql = require("mysql2/promise");

async function fix() {
  const conn = await mysql.createConnection("mysql://3u7E5FJoy48kbr9.root:D78GsC9mRNKvnpaWPXHVezvVkTkAMkh8@ep-t4ni387b5e83b7519dc8.epsrv-t4n281l4mrmemi4zls9a.ap-southeast-1.privatelink.aliyuncs.com:4000/19de60aa-f2e2-85a5-8000-09b4a15c0318");
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS blingOAuth (
      id INT AUTO_INCREMENT PRIMARY KEY,
      accessToken TEXT,
      refreshToken TEXT,
      tokenType VARCHAR(50) DEFAULT 'Bearer',
      expiresAt TIMESTAMP NULL,
      scope TEXT,
      state VARCHAR(255),
      clientId VARCHAR(255),
      isActive BOOLEAN DEFAULT FALSE,
      lastUsedAt TIMESTAMP NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS bo_state_idx ON blingOAuth(state)`,
    `CREATE INDEX IF NOT EXISTS bo_active_idx ON blingOAuth(isActive)`
  ];
  
  for (const sql of tables) {
    try {
      await conn.query(sql);
      console.log("OK:", sql.substring(0, 50));
    } catch (err) {
      if (err.message.includes("exists") || err.code === "ER_DUP_KEYNAME") {
        console.log("Ja existe:", sql.substring(0, 50));
      } else {
        console.log("ERRO:", err.message);
      }
    }
  }
  
  await conn.end();
  console.log("Tabela blingOAuth OK!");
}

fix().catch(e => console.error("Erro:", e.message));
