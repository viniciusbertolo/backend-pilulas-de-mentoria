// const express = require("express");
// const app = express();
// const mysql = require("mysql");
// const cors = require("cors");
// const bcrypt = require("bcrypt");
// const res = require("express/lib/response");
// const { redirect } = require("express/lib/response");
// require('dotenv').config();
// const saltRounds = 10;

// import bodyParser from "body-parser";
// import Stripe from "stripe";



import express from "express";
import mysql from "mysql";
import cors from "cors";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Stripe from "stripe";
import mercadopago from "mercadopago";

dotenv.config(); // substitui require('dotenv').config()

const app = express();
const saltRounds = 10;








// 1. Primeiro: webhook raw (ANTES dos outros middlewares de parsing)
// app.post('/webhook', 
//   bodyParser.raw({ type: 'application/json' }), 
//   async (req, res) => {
//     const sig = req.headers['stripe-signature'];
//     let event;

//     console.log('=== WEBHOOK DEBUG ===');
//     console.log('Body type:', typeof req.body);
//     console.log('Body is Buffer:', Buffer.isBuffer(req.body));
//     console.log('Body length:', req.body?.length);
//     console.log('Signature present:', !!sig);

//     try {
//       const webhookSecret = process.env.WEBHOOK;
//       if (!webhookSecret) {
//         console.error('WEBHOOK_SECRET não configurado!');
//         return res.status(500).send('Webhook secret não configurado');
//       }

//       // Verifica se req.body é Buffer
//       if (!Buffer.isBuffer(req.body)) {
//         console.error('Body não é Buffer, é:', typeof req.body);
//         return res.status(400).send('Body deve ser Buffer');
//       }

//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         webhookSecret
//       );
      
//       console.log('✅ Evento validado:', event.type);
//     } catch (err) {
//       console.error('❌ Erro na validação do webhook:', err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Log de todos os eventos recebidos
//     console.log('Evento recebido:', {
//       type: event.type,
//       id: event.id,
//       created: new Date(event.created * 1000).toISOString()
//     });

//     // Processa quando o pagamento foi concluído
//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object;
      
//       console.log('Sessão completada:', {
//         sessionId: session.id,
//         paymentStatus: session.payment_status,
//         metadata: session.metadata
//       });

//       // Verifica se o pagamento foi realmente pago
//       if (session.payment_status === 'paid') {
//         const { email_usuario, ID_CURSO, codigo } = session.metadata;

//         // Validação dos metadados
//         if (!email_usuario || !ID_CURSO || !codigo) {
//           console.error('❌ Metadados incompletos:', session.metadata);
//           return res.status(400).send('Metadados incompletos');
//         }

//         console.log('💰 Tentando liberar curso para:', { email_usuario, ID_CURSO, codigo });

//         // Verifica se o curso já foi liberado
//         db.query(
//           'SELECT * FROM usuario_curso WHERE email_usuario = ? AND ID_CURSO = ?',
//           [email_usuario, ID_CURSO],
//           (err, results) => {
//             if (err) {
//               console.error('❌ Erro ao verificar curso existente:', err);
//               return;
//             }

//             if (results && results.length > 0) {
//               console.log('⚠️ Curso já liberado anteriormente para:', email_usuario);
//               return;
//             }

//             // Insere no banco (libera curso)
//             db.query(
//               'INSERT INTO usuario_curso (email_usuario, ID_CURSO, codigo) VALUES (?, ?, ?)',
//               [email_usuario, ID_CURSO, codigo, session.id],
//               (err, result) => {
//                 if (err) {
//                   console.error('❌ Erro ao liberar curso:', err);
//                   console.error('Detalhes do erro:', {
//                     code: err.code,
//                     errno: err.errno,
//                     sqlMessage: err.sqlMessage,
//                     sql: err.sql
//                   });
//                 } else {
//                   console.log('✅🎉 CURSO LIBERADO COM SUCESSO!', {
//                     email_usuario,
//                     ID_CURSO,
//                     codigo,
//                     insertId: result.insertId,
//                     sessionId: session.id,
//                     timestamp: new Date().toISOString()
//                   });
//                 }
//               }
//             );
//           }
//         );
//       } else {
//         console.log('⚠️ Pagamento não foi confirmado. Status:', session.payment_status);
//       }
//     }

//     // Sempre responde 200 para o Stripe
//     res.status(200).json({ received: true });
//   }
// );

// Aumentar o limite para 50MB (ajuste conforme necessário)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


{
  /*Conexão Com o banco de dados */
}

// const db = mysql.createPool({
//   host: "us-cdbr-east-06.cleardb.net",
//   user: "bca979a5fdd0a6",
//   password: "dee87e51",
//   database: "heroku_796c03910f34e5f",
// });

const db = mysql.createPool({
  host: "pilulasbd.mysql.dbaas.com.br",
  user: "pilulasbd",
  password: "Vamb1808@",
  database: "pilulasbd",
});

// const db = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "vamb1808",
//   database: "pilulasmentoria",
// });

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Bem vindos ao backend do pilulas de mentoria");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const empresa = req.body.empresa;
  const profissao = req.body.profissao;
  const nome = req.body.nome;
  const phone = req.body.phone;
  const cep = req.body.cep;
  const logradouro = req.body.logradouro;
  const numero = req.body.numero;
  const bairro = req.body.bairro;
  const cidade = req.body.cidade;
  const estado = req.body.estado;
  const data_nascimento = req.body.data_nascimento;

  db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, result) => {
    if (err) {
      res.send(err);
    }
    if (result.length == 0) {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        db.query(
          "INSERT INTO usuarios (email, password, profissao, nome, phone, cep, logradouro, numero, bairro, cidade, estado, data_nascimento,empresa) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
          [
            email,
            hash,
            profissao,
            nome,
            phone,
            cep,
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            data_nascimento,
            empresa
          ],
          (err, response) => {
            if (err) {
              res.send(err);
            }

            res.send({ msg: "Usuário cadastrado com sucesso" });
          }
        );
      });
    } else {
      res.send({ msg: "Email já cadastrado!" });
    }
  });
});




// app.put("/update-senha/:email/:password", (req, res) => {
//   const email = req.params.email;
//   const password = req.params.password;


//   db.query(
//     "UPDATE usuarios SET password = ? WHERE email = ?",
//     [password, email],
//     (err, result) => {
//       if (err) console.log(err);
//       else res.send(result);
//     }
//   );
// });


app.put("/update-senha/:email/:password", (req, res) => {
  const email = req.params.email;
  const password = req.params.password;

  // Verifica se o usuário existe
  db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, result) => {
    if (err) {
      return res.status(500).send({ error: "Erro no banco de dados" });
    }

    if (result.length === 0) {
      return res.status(404).send({ msg: "Usuário não encontrado" });
    }

    // Criptografa a nova senha
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        return res.status(500).send({ error: "Erro ao criptografar senha" });
      }

      // Atualiza a senha no banco
      db.query(
        "UPDATE usuarios SET password = ? WHERE email = ?",
        [hash, email],
        (err, response) => {
          if (err) {
            return res.status(500).send({ error: "Erro ao atualizar senha" });
          }

          res.send({ msg: "Senha atualizada com sucesso" });
        }
      );
    });
  });
});



{
  /*Verificação de login*/
}

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, result) => {
    if (err) {
      res.send(err);
    }
    if (result.length > 0) {
      bcrypt.compare(password, result[0].password, (error, response) => {
        if (error) {
          res.send(error);
        }
        if (response === true) {
          res.send(response);
          console.log(response);
        } else {
          res.send({ msg: "Email ou senha incorreta!" });
        }
      });
    } else {
      res.send({ msg: "Usuário não registrado!" });
    }
  });
});

app.get("/cursos", (req, res) => {
  let sql = "SELECT *  FROM curso";
  db.query(sql, (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});

app.get("/materiais", (req, res) => {
  let sql = "SELECT *  FROM materiais_extras";
  db.query(sql, (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});

app.get("/fases/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT *  FROM fases where ID_CURSO_ATUAL = ?",
    [id],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});

app.get("/detalhes-usuario/:email", (req, res) => {
  const email = req.params.email;
  db.query(
    "SELECT *  FROM usuarios where email = ?",
    [email],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});

app.get("/usuario-curso/:email", (req, res) => {
  const email = req.params.email;
  db.query(
    "SELECT *  FROM usuario_curso where email_usuario = ?",
    [email],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});



app.get("/usuarios-cursando/:empresa", (req, res) => {
  const empresa = req.params.empresa;

  const query = `
    SELECT DISTINCT 
        u.nome AS Nome_Usuario,
        CASE 
            WHEN ce.emailUsuario IS NOT NULL THEN 'SIM' 
            ELSE 'NAO' 
        END AS Cursando_Curso,
        CASE 
            WHEN ce.emailUsuario IS NOT NULL THEN ce.NRO_FASE_ATUAL
            ELSE NULL
        END AS Fase_Atual
    FROM 
        usuarios u
    LEFT JOIN 
        conclui_etapa ce ON u.email = ce.emailUsuario
    LEFT JOIN 
        fases f ON ce.NRO_FASE_ATUAL = f.NRO AND f.ID_CURSO_ATUAL = 74
    WHERE 
        (u.empresa LIKE ? OR u.email LIKE ?)
        AND (ce.NRO_FASE_ATUAL IS NULL OR ce.NRO_FASE_ATUAL = (
            SELECT MAX(sub_ce.NRO_FASE_ATUAL)
            FROM conclui_etapa sub_ce
            WHERE sub_ce.emailUsuario = u.email
        ))
    ORDER BY 
        u.nome ASC;
  `;

  db.query(query, [`%${empresa}%`, `%${empresa}%`], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send({ error: "Erro ao executar a consulta." });
    } else {
      res.send(result);
    }
  });
});


app.get("/videos/:id/:nroPilula", (req, res) => {
  const id = req.params.id;
  const nroPilula = req.params.nroPilula;
  db.query(
    "SELECT * FROM fases where ID_CURSO_ATUAL = ? and NRO = ?",
    [id, nroPilula],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});
app.get("/perguntas/:id/:nroPilula", (req, res) => {
  const id = req.params.id;
  const nroPilula = req.params.nroPilula;
  db.query(
    "SELECT * FROM alternativas where ID_cursoAtual = ? and NRO_FASE = ?",
    [id, nroPilula],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});

app.get("/questao/:id/:nroPilula", (req, res) => {
  const id = req.params.id;
  const nroPilula = req.params.nroPilula;
  db.query(
    "SELECT * FROM fases where ID_CURSO_ATUAL = ? and NRO = ?",
    [id, nroPilula],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});

app.get("/usuarios", (req, res) => {
  db.query(
    "SELECT * FROM usuarios",
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});
app.get("/caminho-concluido/:email/:idCurso", (req, res) => {
  const email = req.params.email;
  const idCurso = req.params.idCurso;
  db.query(
    "SELECT * FROM conclui_etapa where emailUsuario = ? and ID_usuario = ?",
    [email, idCurso],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});

app.get("/caminho-concluido/:idCurso", (req, res) => {
  const idCurso = req.params.idCurso;
  db.query(
    "SELECT * FROM conclui_etapa where ID_usuario = ?",
    [idCurso],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});

app.post("/inserir-primeiro-caminho/:email/:idCurso/:nroFase", (req, res) => {
  const email = req.params.email;
  const idCurso = req.params.idCurso;
  const nroFase = req.params.nroFase;

  db.query(
    "SELECT * FROM conclui_etapa WHERE emailUsuario = ? and ID_usuario = ? and NRO_FASE_ATUAL =?",
    [email, idCurso, nroFase],
    (err, result) => {
      if (err) {
        res.send(err);
      }
      if (result.length == 0) {
        db.query(
          "INSERT INTO conclui_etapa (emailUsuario, ID_usuario, NRO_FASE_ATUAL) values (?,?,?) ON DUPLICATE KEY UPDATE NRO_FASE_ATUAL = GREATEST(NRO_FASE_ATUAL, ?)",
          [email, idCurso, nroFase, nroFase],
          (err, result) => {
            if (err) console.log(err);
            else res.send(result);
          }
        );
      } else {
        res.send({ msg: "Já cadastrada fase 1 ou superior" });
      }
    }
  );
});

app.put("/pergunta-acertada/:email/:idCurso/:nroFase/:nroFaseAnterior", (req, res) => {
  const email = req.params.email;
  const idCurso = req.params.idCurso;
  const nroFase = req.params.nroFase;
  const nroFaseAnterior = req.params.nroFaseAnterior;
  db.query(
    "UPDATE conclui_etapa SET NRO_FASE_ATUAL = ? WHERE emailUsuario = ? and ID_usuario = ? and NRO_FASE_ATUAL = ?",
    [nroFase, email, idCurso, nroFaseAnterior],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});

app.post("/upload-curso", (req, res) => {
  const nome = req.body.nome;
  const descricao = req.body.descricao;
  const urlVideoPreview = req.body.urlVideoPreview;


  db.query(
    "INSERT INTO curso (nome, descricao, URL_VIDEO_PREVIW) values (?,?,?)",
    [nome, descricao, urlVideoPreview],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});


app.post("/upload-fase", (req, res) => {
  const numero = req.body.numero;
  const idCurso = req.body.idCurso;
  const nome = req.body.nome;
  const descricao = req.body.descricao;
  const url = req.body.url;
  const pergunta = req.body.pergunta;
  const material = req.body.material;


  db.query(
    "INSERT INTO fases (NRO, ID_CURSO_ATUAL, nome, descricao, URL_VIDEO, pergunta, materialExtra) values (?,?,?,?,?,?,?)",
    [numero, idCurso, nome, descricao, url, pergunta, material],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});


app.post("/upload-respostas", (req, res) => {
  const numeroFase = req.body.numeroFase;
  const idCurso = req.body.idCurso;
  const alternativa1 = req.body.alternativa1;
  const alternativa2 = req.body.alternativa2;
  const alternativa3 = req.body.alternativa3;
  const alternativa4 = req.body.alternativa4;
  const correta = req.body.correta;

  db.query(
    "INSERT INTO alternativas (NRO_FASE, ID_cursoAtual, alternativa1, alternativa2, alternativa3, alternativa4, correta) values (?,?,?,?,?,?,?)",
    [numeroFase, idCurso, alternativa1, alternativa2, alternativa3, alternativa4, correta],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});




app.post("/liberar-curso/:email_usuario/:ID_CURSO/:codigo", (req, res) => {
  const email_usuario = req.params.email_usuario;
  const ID_CURSO = req.params.ID_CURSO;
  const codigo = req.params.codigo;


  db.query(
    "INSERT INTO usuario_curso (email_usuario, ID_CURSO, codigo) values (?,?,?)",
    [email_usuario, ID_CURSO, codigo],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});






app.post('/api/chat', async (req, res) => {
  const { email, prompt } = req.body;

  try {
    // 1. Busca o nome do usuário pelo email (mantido igual)
    let userName = email;
    try {
      const userResult = await new Promise((resolve, reject) => {
        db.query(
          'SELECT nome FROM usuarios WHERE email = ?',
          [email],
          (error, results, fields) => {
            if (error) reject(error);
            else resolve(results);
          }
        );
      });

      if (userResult && Array.isArray(userResult) && userResult.length > 0 && userResult[0].nome) {
        userName = userResult[0].nome;
      }
    } catch (userError) {
      console.error("Erro ao buscar nome do usuário:", userError);
    }

    // 2. Salva a pergunta do usuário no MySQL
    await db.query(
      'INSERT INTO chats (user_email, role, content) VALUES (?, ?, ?)',
      [email, 'user', prompt]
    );

    // 3. Busca o histórico - Versão corrigida para MySQL
    let historyRows = [];
    try {
      const [rows] = await db.promise().query(
        'SELECT role, content FROM chats WHERE user_email = ? ORDER BY created_at ASC LIMIT 20',
        [email]
      );
      historyRows = rows || []; // Garante que seja um array
    } catch (dbError) {
      console.error("Erro ao buscar histórico:", dbError);
      historyRows = [];
    }

    const nome = userName.split(' ')[0].toLowerCase().replace(/^\w/, c => c.toUpperCase());

    // 4. Prepara as mensagens para o Gemini
    const systemInstruction = {
      role: "user", // No Gemini, colocamos a instrução do sistema como se fosse uma mensagem do usuário
      parts: [{
        text: `Você é uma inteligência artificial especialista em comportamento humano, com foco profundo no entendimento e manejo do medo.
        Chame o usuário pelo nome dele, que é: ${nome}
        Suas respostas devem seguir rigorosamente estas regras: (separados em sessões com titulos para deixar claro para o usuário as etapas)
        1. Identificar e classificar o tipo de medo (ex: Aracnofobia, Glossofobia)
        2. Acolher emocionalmente o relato
        3. Explicar como o medo atua no cérebro e corpo
        4. Sugerir estratégias práticas
        5. Manter abordagem empática e não julgadora
        6. Responder APENAS sobre medos e comportamento humano
        
        Exemplo de resposta:
        "Entendo seu medo, ${nome}. Isso parece ser [...] (classificação). 
        Esse tipo de medo ativa [...] no cérebro. Vamos trabalhar juntos nisso.
        Que tal tentarmos [...] (estratégia)?"`
      }]
    };

    const examples = {
      role: "model",
      parts: [{
        text: "Pode me contar qual medo você está sentindo agora? Estou aqui para ajudar."
      }]
    };

    // Formata o histórico
    const chatHistory = historyRows
      .filter(row => row && row.role && row.content)
      .map(row => ({
        role: row.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: row.content }]
      }));


    

    // 5. Chama a API do Gemini com a estrutura correta
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDGz0s8SUf2Vp_z9MUobkhlv5c71Dj78-s`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          systemInstruction,
          examples,
          ...chatHistory,
          { role: "user", parts: [{ text: prompt }] }
        ],
        generationConfig: {
          maxOutputTokens: 5000,
          temperature: 1.2
        },
        systemInstruction: {
          parts: [{
            text: "Você é um assistente especializado em psicologia e manejo de medos. Siga rigorosamente as instruções fornecidas na primeira mensagem do usuário."
          }]
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      throw new Error(`Erro na API: ${JSON.stringify(errorData)}`);
    }

    const responseData = await geminiResponse.json();
    const aiReply = responseData.candidates[0].content.parts[0].text;

    // 6. Salva a resposta
    await db.query(
      'INSERT INTO chats (user_email, role, content) VALUES (?, ?, ?)',
      [email, 'assistant', aiReply]
    );

    res.json({ reply: aiReply });

  } catch (error) {
    console.error("Erro no chat:", error);
    res.status(500).json({ error: error.message });
  }
});





app.get("/api/history/:email", (req, res) => {
  const email = req.params.email;
  db.query(
    "SELECT role, content FROM chats WHERE user_email = ? ORDER BY created_at",
    [email],
    (err, result) => {
      if (err) console.log(err);
      else res.send(result);
    }
  );
});







app.use(bodyParser.json());

//chave api
// const stripe = new Stripe(process.env.STRIPE_API_KEY);

// ---- Criar sessão de pagamento ----
// app.post("/api/payments/create-checkout", async (req, res) => {
//   try {
//     const { email_usuario, ID_CURSO, codigo, valor } = req.body;

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "brl",
//             product_data: { name: "Curso " + ID_CURSO },
//             unit_amount: valor, // em centavos (R$50,00)
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `https://pilulasdementoria.com.br/cursos`,
//       cancel_url: `https://pilulasdementoria.com.br/`,
//       metadata: { email_usuario, ID_CURSO, codigo, valor } // adiciona dados do curso
//     });

//     res.json({ id: session.id, url: session.url });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Erro ao criar checkout");
//   }
// });



// Configuração Mercado Pago
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});


// ---- Criar sessão de pagamento ----
app.post("/api/payments/create-checkout", async (req, res) => {
  try {
    const { email_usuario, ID_CURSO, codigo, valor } = req.body;

    const preference = {
      items: [
        {
          title: "Curso " + ID_CURSO,
          unit_price: valor / 100, // Mercado Pago usa reais, não centavos
          quantity: 1,
        },
      ],
      back_urls: {
        success: "https://pilulasdementoria.com.br/cursos",
        failure: "https://pilulasdementoria.com.br/",
        pending: "https://pilulasdementoria.com.br/",
      },
      auto_return: "approved",
      metadata: { email_usuario, ID_CURSO, codigo, valor },
      payment_methods: {
        excluded_payment_types: [], // aceita tudo
        default_payment_method_id: "pix",
      },
    };

    const response = await mercadopago.preferences.create(preference);

    res.json({ id: response.body.id, url: response.body.init_point });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao criar checkout");
  }
});






// ---- Webhook Mercado Pago ----
app.post("/api/payments/webhook", async (req, res) => {
  try {
    const data = req.body;

    // Mercado Pago manda eventos de vários tipos
    if (data.type === "payment") {
      const paymentId = data.data.id;

      // Buscar detalhes do pagamento
      const payment = await mercadopago.payment.findById(paymentId);

      const status = payment.body.status;
      const metadata = payment.body.metadata;

      if (status === "approved") {
        console.log("✅ Pagamento aprovado:", metadata);

        const { email_usuario, ID_CURSO, codigo } = metadata;

        // 🔑 Verifica se o curso já foi liberado
        db.query(
          "SELECT * FROM usuario_curso WHERE email_usuario = ? AND ID_CURSO = ?",
          [email_usuario, ID_CURSO],
          (err, results) => {
            if (err) {
              console.error("❌ Erro ao verificar curso existente:", err);
              return;
            }

            if (results && results.length > 0) {
              console.log(
                "⚠️ Curso já liberado anteriormente para:",
                email_usuario
              );
              return;
            }

            // 🔓 Insere no banco (libera curso)
            db.query(
              "INSERT INTO usuario_curso (email_usuario, ID_CURSO, codigo) VALUES (?, ?, ?)",
              [email_usuario, ID_CURSO, codigo],
              (err, result) => {
                if (err) {
                  console.error("❌ Erro ao liberar curso:", err);
                  console.error("Detalhes do erro:", {
                    code: err.code,
                    errno: err.errno,
                    sqlMessage: err.sqlMessage,
                    sql: err.sql,
                  });
                } else {
                  console.log("✅🎉 CURSO LIBERADO COM SUCESSO!", {
                    email_usuario,
                    ID_CURSO,
                    codigo,
                    insertId: result.insertId,
                    paymentId,
                    timestamp: new Date().toISOString(),
                  });
                }
              }
            );
          }
        );
      } else {
        console.log("ℹ️ Pagamento com status:", status);
      }
    }

    // 🔥 MUITO IMPORTANTE: sempre responder 200 pro Mercado Pago
    return res.sendStatus(200);
  } catch (error) {
    console.error("Erro no webhook:", error);
    return res.sendStatus(500);
  }
});









app.listen(process.env.PORT || 3001, () => {
  console.log("rodando na porta 3001");
});
