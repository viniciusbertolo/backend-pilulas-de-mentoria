const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const res = require("express/lib/response");
const { redirect } = require("express/lib/response");
require('dotenv').config();
const saltRounds = 10;

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






// app.post('/api/chat', async (req, res) => {
//   const { email, prompt } = req.body;

//   try {

//     // 1. Busca o nome do usuário pelo email
//     let userName = email; // fallback para email se não encontrar o nome
//     try {
//       // Para o driver mysql, precisa usar Promise ou callback
//       const userResult = await new Promise((resolve, reject) => {
//         db.query(
//           'SELECT nome FROM usuarios WHERE email = ?',
//           [email],
//           (error, results, fields) => {
//             if (error) {
//               reject(error);
//             } else {
//               resolve(results);
//             }
//           }
//         );
//       });

//       console.log("Resultado da busca do usuário:", userResult);

//       if (userResult && Array.isArray(userResult) && userResult.length > 0) {
//         if (userResult[0].nome) {
//           userName = userResult[0].nome;
//           console.log("Nome encontrado:", userName);
//         } else {
//           console.log("Campo 'nome' está vazio, usando email como fallback");
//         }
//       } else {
//         console.log("Nenhum usuário encontrado com este email, usando email como fallback");
//       }

//     } catch (userError) {
//       console.error("Erro ao buscar nome do usuário:", userError);
//       // Mantém o email como fallback
//     }

//     // 1. Salva a pergunta do usuário no MySQL
//     await db.query(
//       'INSERT INTO chats (user_email, role, content) VALUES (?, ?, ?)',
//       [email, 'user', prompt]
//     );

//     // 2. Busca o histórico de conversas do usuário
//     let historyRows = [];
//     try {
//       const result = await db.query(
//         'SELECT role, content FROM chats WHERE user_email = ? ORDER BY created_at ASC LIMIT 20',
//         [email]
//       );

//       // Garante que historyRows seja um array
//       if (Array.isArray(result)) {
//         // mysql2 retorna [rows, fields]
//         if (Array.isArray(result[0])) {
//           historyRows = result[0];
//         } else {
//           historyRows = result;
//         }
//       } else {
//         // fallback: força array vazio
//         historyRows = [];
//       }

//     } catch (dbError) {
//       console.error("Erro ao buscar histórico:", dbError);
//       historyRows = [];
//     }


//     const nome = userName
//             .split(' ')[0]
//             .toLowerCase()
//             .replace(/^\w/, c => c.toUpperCase());


//     // 3. Cria a mensagem do sistema
//     const systemMessage = {
//       role: "system",
//       content: `Você é uma inteligência artificial especialista em comportamento humano, com foco profundo no entendimento e manejo do medo.
//       Não responda nada que esteja fora desse escopo, você é limitada a faar sobre esse assunto
//       Seu papel é ouvir com empatia, identificar o tipo de medo apresentado (real, irracional, aprendido, traumático, antecipatório etc.) e oferecer orientações práticas, embasadas em psicologia, neurociência e inteligência emocional.
// Chame o usuario pelo nome dele, que é: ${nome}
// Sempre que um usuário compartilhar um medo, você deve:
// Dizer qual é o nome e a classificação desse medo, como por exemplo (Aracnofobia, Glossofobia, Atiquifobia, etc).

// Acolher emocionalmente o relato, demonstrando compreensão e empatia.

// Identificar o tipo e origem provável do medo (quando possível).

// Explicar, de forma simples, como esse tipo de medo atua no cérebro e no corpo.

// Sugerir estratégias realistas e personalizadas para lidar com esse medo (respiração, reestruturação cognitiva, enfrentamento gradual, apoio profissional etc.).

// Estimular o usuário a enxergar o medo como um sinal que pode ser compreendido e transformado.

// Sempre mantenha uma abordagem leve, respeitosa e nunca julgue o medo do usuário, por mais incomum que pareça.

// Quando estiver pronto, pergunte gentilmente:
// "Pode me contar qual medo você está sentindo agora? Estou aqui pra ajudar."`
//     };

//     // 4. Garante que historyRows é um array antes de filtrar/mapear
//     if (!Array.isArray(historyRows)) historyRows = [];

//     const formattedHistory = historyRows
//       .filter(row => row && row.role && row.content)
//       .map(row => ({
//         role: row.role === 'assistant' ? 'assistant' : 'user',
//         content: row.content || ""
//       }));

//     let messages = [systemMessage, ...formattedHistory];

//     // 5. Se o histórico estiver longo, mantém apenas as últimas 19 + systemMessage
//     if (messages.length > 20) {
//       messages = [systemMessage, ...messages.slice(-19)];
//     }

//     // 6. Adiciona a mensagem atual do usuário
//     const lastMessage = messages[messages.length - 1];
//     if (!lastMessage || lastMessage.role !== 'user' || lastMessage.content !== prompt) {
//       messages.push({
//         role: 'user',
//         content: prompt
//       });
//     }

//     console.log("Mensagens enviadas para a API:", JSON.stringify(messages, null, 2));

//     // 7. Chama a API do OpenRouter
//     // const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
//     //   method: 'POST',
//     //   headers: {
//     //     'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
//     //     'Content-Type': 'application/json',
//     //   },
//     //   body: JSON.stringify({
//     //     model: "google/gemini-2.5-flash-preview-05-20",
//     //     messages: messages,
//     //     max_tokens: 5000,
//     //     temperature: 0.7
//     //   })
//     // });

//     const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         contents: messages.map(msg => ({
//           role: msg.role === 'user' ? 'user' : 'model',
//           parts: [{ text: msg.content }]
//         })),
//         generationConfig: {
//           maxOutputTokens: 5000,
//           temperature: 0.7
//         }
//       })
//     });
    
//     if (!geminiResponse.ok) {
//       const errorData = await geminiResponse.json();
//       throw new Error(`Erro na API do Gemini: ${JSON.stringify(errorData)}`);
//     }
    
//     const responseData = await geminiResponse.json();
//     const data = responseData.candidates[0].content.parts[0].text;

//     // const data = await geminiResponse.json();

//     if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
//       console.error("Resposta inválida da API:", data);
//       return res.status(500).json({ error: 'Resposta inválida da API' });
//     }

//     const aiReply = data.choices[0].message.content;

//     // 8. Salva a resposta da IA no MySQL
//     await db.query(
//       'INSERT INTO chats (user_email, role, content) VALUES (?, ?, ?)',
//       [email, 'assistant', aiReply]
//     );

//     res.json({ reply: aiReply });
//   } catch (error) {
//     console.error("Erro ao processar chat:", error);
//     res.status(500).json({ error: 'Erro no servidor: ' + error.message });
//   }
// });



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

    // 3. Busca o histórico de conversas
    let historyRows = [];
    try {
      const result = await db.query(
        'SELECT role, content FROM chats WHERE user_email = ? ORDER BY created_at ASC LIMIT 20',
        [email]
      );
      historyRows = Array.isArray(result[0]) ? result[0] : result;
    } catch (dbError) {
      console.error("Erro ao buscar histórico:", dbError);
    }

    const nome = userName.split(' ')[0].toLowerCase().replace(/^\w/, c => c.toUpperCase());

    // 4. Prepara as mensagens para o Gemini
    const systemInstruction = {
      role: "user", // No Gemini, colocamos a instrução do sistema como se fosse uma mensagem do usuário
      parts: [{
        text: `Você é uma inteligência artificial especialista em comportamento humano, com foco profundo no entendimento e manejo do medo.
        Chame o usuário pelo nome dele, que é: ${nome}
        Suas respostas devem seguir rigorosamente estas regras:
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
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
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
          temperature: 0.7
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












app.listen(process.env.PORT || 3001, () => {
  console.log("rodando na porta 3001");
});
