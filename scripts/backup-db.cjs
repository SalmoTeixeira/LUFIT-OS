#!/usr/bin/env node
/**
 * Backup script para o banco LUFIT OS
 * Usa a conexão Drizzle existente do projeto
 */

const fs = require("fs");
const path = require("path");

async function backup() {
  try {
    // Usar o drizzle do projeto
    const { drizzle } = require("drizzle-orm/mysql2");
    const { createPool } = require("mysql2/promise");
    
    const dbUrl = "mysql://3u7E5FJoy48kbr9.root:D78GsC9mRNKvnpaWPXHVezvVkTkAMkh8@ep-t4ni387b5e83b7519dc8.epsrv-t4n281l4mrmemi4zls9a.ap-southeast-1.privatelink.aliyuncs.com:4000/19de60aa-f2e2-85a5-8000-09b4a15c0318";
    
    const pool = createPool({ uri: dbUrl, connectionLimit: 1 });
    const db = drizzle(pool);
    
    // Pegar lista de tabelas
    const [tables] = await pool.query("SHOW TABLES");
    const tableKey = Object.keys(tables[0])[0];
    
    let sqlDump = `-- LUFIT OS Database Backup\n`;
    sqlDump += `-- Generated: ${new Date().toISOString()}\n`;
    sqlDump += `-- Total Tables: ${tables.length}\n\n`;
    sqlDump += `SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS = 0;\n\n`;
    
    let totalRows = 0;
    
    for (const tableObj of tables) {
      const tableName = tableObj[tableKey];
      const [cols] = await pool.query("SHOW COLUMNS FROM ??", [tableName]);
      const colNames = cols.map(c => c.Field);
      
      sqlDump += `\n-- Table: ${tableName}\n`;
      sqlDump += `TRUNCATE TABLE \`${tableName}\`;\n`;
      
      const [rows] = await pool.query("SELECT * FROM ??", [tableName]);
      totalRows += rows.length;
      
      if (rows.length > 0) {
        for (const row of rows) {
          const values = colNames.map(col => {
            const v = row[col];
            if (v === null || v === undefined) return "NULL";
            if (Buffer.isBuffer(v)) return "x'" + v.toString("hex") + "'";
            const str = String(v).replace(/'/g, "''").replace(/\\/g, "\\\\");
            return "'" + str + "'";
          });
          sqlDump += `INSERT INTO \`${tableName}\` (\`${colNames.join("`,`")}\`) VALUES (${values.join(",")});\n`;
        }
      }
      sqlDump += `\n`;
    }
    
    sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;
    
    const outputPath = "/mnt/agents/output/backup_lufit_db_complete_" + new Date().toISOString().replace(/[:T]/g, "_").split(".")[0] + ".sql";
    fs.writeFileSync(outputPath, sqlDump);
    
    console.log("✅ Backup completo!");
    console.log(`   Arquivo: ${outputPath}`);
    console.log(`   Tabelas: ${tables.length}`);
    console.log(`   Registros: ${totalRows}`);
    console.log(`   Tamanho: ${(sqlDump.length / 1024).toFixed(2)} KB`);
    
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro no backup:", err.message);
    process.exit(1);
  }
}

backup();
