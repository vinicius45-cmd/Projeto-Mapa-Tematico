require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: false
});

// --- Rota de Linhas (Atualizada com Join de Operadora e Prefixo) ---
app.get('/linhas', async (req, res) => {
  const query = `
    SELECT
      tl.id_linha,
      TRIM(CAST(tl.cd_linha AS TEXT)) as cd_linha,
      tl.tx_linha,
      TRIM(UPPER(ti.lin_sentido)) as sentido,
      top.nm_operadora,
      tup.prefixo,
      ST_AsGeoJSON(ti.geo_linhas_lin)::json AS geometry
    FROM
      dados_mobilidade.tab_linha tl
    INNER JOIN
      dados_mobilidade.tab_itinerario ti ON tl.id_linha = ti.id_linha
    LEFT JOIN
      dados_mobilidade.tab_operadora_linha tol ON tl.id_linha = tol.id_linha
    LEFT JOIN
      dados_mobilidade.tab_operadora top ON tol.id_operadora = top.id_operadora
    LEFT JOIN
      dados_mobilidade.tab_ultima_posicao tup ON TRIM(CAST(tl.cd_linha AS TEXT)) = TRIM(CAST(tup.cd_linha AS TEXT))
    WHERE ti.geo_linhas_lin IS NOT NULL
    ORDER BY cd_linha ASC, sentido ASC;
  `;
  try {
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar linhas' });
  }
});

// --- Rota de Paradas com Raios Independentes ---
app.get('/paradas/busca', async (req, res) => {
  const { codigo, sentido } = req.query;
  if (!codigo || !sentido) return res.status(400).json({ error: 'Faltam parâmetros' });

  const sentidoUpper = sentido.trim().toUpperCase();

  const RAIOS = {
    'IDA': 0.00012,  
    'VOLTA': 0.00012,
    'CIRCULAR': 0.00012,
    'PADRAO': 0.001
  };

  const raioBusca = RAIOS[sentidoUpper] || RAIOS['PADRAO'];

  const query = `
    WITH linha_selecionada AS (
      SELECT ti.geo_linhas_lin
      FROM dados_mobilidade.tab_itinerario ti
      INNER JOIN dados_mobilidade.tab_linha tl ON tl.id_linha = ti.id_linha
      WHERE REGEXP_REPLACE(CAST(tl.cd_linha AS TEXT), '[^0-9a-zA-Z]', '', 'g') 
            = REGEXP_REPLACE($1, '[^0-9a-zA-Z]', '', 'g')
      AND TRIM(UPPER(ti.lin_sentido)) = $2
      LIMIT 1
    )
    SELECT DISTINCT ON (p.id)
      p.id,
      ST_Y(p.geom_parada) as latitude,
      ST_X(p.geom_parada) as longitude,
      ST_LineLocatePoint(ls.geo_linhas_lin, p.geom_parada) as ordem_progresso
    FROM
      dados_mobilidade.tab_parada p
    CROSS JOIN 
      linha_selecionada ls
    WHERE 
      ST_DWithin(p.geom_parada, ls.geo_linhas_lin, $3)
    ORDER BY p.id, ordem_progresso ASC;
  `;

  try {
    const result = await pool.query(query, [codigo.trim(), sentidoUpper, raioBusca]);
    const paradas = result.rows.sort((a, b) => a.ordem_progresso - b.ordem_progresso);
    
    console.log(`--------------------------------------------------`);
    console.log(`🚌 LINHA: ${codigo} | SENTIDO: ${sentidoUpper}`);
    console.log(`📏 RAIO: ${raioBusca} | 📍 PARADAS: ${paradas.length}`);
    
    res.json(paradas);
  } catch (err) {
    console.error('❌ Erro no SQL:', err);
    res.status(500).json({ error: 'Erro ao processar busca' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});